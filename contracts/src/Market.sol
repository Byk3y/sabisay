// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./libraries/CPMMMath.sol";

/**
 * @title IMarketFactory
 * @dev Interface for MarketFactory treasury getter
 */
interface IMarketFactory {
    function treasury() external view returns (address);
}

/**
 * @title Market
 * @dev Individual prediction market contract with CPMM AMM
 * @notice Implements constant product market maker for Yes/No outcomes
 */
contract Market is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    // Roles
    bytes32 public constant RESOLVER_ROLE = keccak256("RESOLVER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Market state enum
    enum State {
        Open,
        PendingResolution,
        DisputeWindow,
        Resolved,
        Invalid
    }

    // Outcome enum
    enum Outcome {
        None,
        Yes,
        No
    }

    // State variables
    address public immutable factory;
    address public immutable stable; // USDC
    
    // Reserve guard constant
    uint256 public constant MIN_RESERVE = 100 * 10**6; // 100 USDC minimum reserve
    uint16 public immutable feeBps; // Trade fee in basis points
    uint64 public immutable endTimeUTC;
    uint8 public immutable STABLE_DECIMALS;
    uint256 public immutable minStake;
    string public rulesCid;

    State public state;
    Outcome public outcome;
    string public evidenceCid;
    uint256 public resolutionTime;
    uint256 public disputeEndTime;
    uint256 public preliminaryTimestamp;

    // Constants
    uint256 public constant DISPUTE_WINDOW = 48 hours;

    // Liquidity seeding guard
    bool public liquiditySeeded;
    
    // CPMM reserves
    uint256 public reserveYes;
    uint256 public reserveNo;
    uint256 public feesAccrued;
    
    // Internal accounting for shares (MVP - no ERC1155)
    mapping(address => uint256) public yesBal;
    mapping(address => uint256) public noBal;
    
    // Events
    event Traded(
        address indexed buyer,
        uint8 side, // 1 = Yes, 2 = No
        uint256 amountIn,
        uint256 sharesOut,
        uint256 fee
    );
    
    event CashedOut(
        address indexed seller,
        uint8 side, // 1 = Yes, 2 = No
        uint256 sharesIn,
        uint256 amountOut,
        uint256 fee
    );
    
    event Closed();
    event PreliminaryPosted(uint8 outcome, string evidenceCid);
    event Finalized(uint8 outcome);
    event Invalid();
    event Redeemed(address indexed user, uint256 amount);
    event RedeemedInvalid(address indexed user, uint256 amount);
    event FeesWithdrawn(address indexed to, uint256 amount);
    event LiquiditySeeded(uint256 yesAmount, uint256 noAmount);

    constructor(
        address _factory,
        address _stable,
        uint16 _feeBps,
        uint64 _endTimeUTC,
        string memory _rulesCid
    ) {
        require(_feeBps <= 1000, "Fee too high"); // Max 10%
        require(_feeBps >= 10, "Fee too low"); // Min 0.1%

        factory = _factory;
        stable = _stable;
        feeBps = _feeBps;
        endTimeUTC = _endTimeUTC;
        rulesCid = _rulesCid;
        state = State.Open;

        // Read decimals and compute minimum stake ($1)
        uint8 _decimals = IERC20Metadata(_stable).decimals();
        STABLE_DECIMALS = _decimals;
        minStake = 1 * 10**_decimals; // $1 in stable token decimals

        // Liquidity will be seeded separately via seedLiquidity()
        // reserveYes and reserveNo start at 0

        // Set up roles - factory gets admin role
        _grantRole(DEFAULT_ADMIN_ROLE, _factory);
        _grantRole(PAUSER_ROLE, _factory);
    }

    // Modifiers
    modifier onlyOpen() {
        require(state == State.Open, "Market not open");
        _;
    }
    
    modifier onlyBeforeClose() {
        require(block.timestamp < endTimeUTC, "Market closed");
        _;
    }
    
    modifier onlyResolver() {
        require(hasRole(RESOLVER_ROLE, msg.sender), "Only resolver");
        _;
    }
    
    modifier onlyWhenNotPaused() {
        require(!paused(), "Paused");
        _;
    }

    modifier onlySeeded() {
        require(liquiditySeeded, "Not seeded");
        _;
    }

    /**
     * @dev Seed initial liquidity (one-time, factory only)
     * @param yesAmount Initial USDC amount for Yes reserve
     * @param noAmount Initial USDC amount for No reserve
     */
    function seedLiquidity(uint256 yesAmount, uint256 noAmount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        nonReentrant
    {
        require(!liquiditySeeded, "Already seeded");
        require(yesAmount > 0 && noAmount > 0, "Invalid amounts");

        liquiditySeeded = true;
        reserveYes = yesAmount;
        reserveNo = noAmount;

        // USDC has already been transferred to this market by the factory
        // Just verify the balance is correct
        uint256 expectedBalance = yesAmount + noAmount;
        require(IERC20(stable).balanceOf(address(this)) >= expectedBalance, "Insufficient USDC balance");

        emit LiquiditySeeded(yesAmount, noAmount);
    }

    /**
     * @dev Buy Yes shares with USDC
     * @param amountIn USDC amount to trade
     * @param minSharesOut Minimum shares to receive (slippage protection)
     * @param deadline Transaction must be executed before this timestamp
     */
    function buyYes(
        uint256 amountIn,
        uint256 minSharesOut,
        uint256 deadline
    ) external onlyOpen onlyBeforeClose whenNotPaused onlySeeded nonReentrant {
        require(block.timestamp <= deadline, "Transaction expired");
        require(amountIn >= minStake, "Amount too small");
        
        // Apply fee first
        (uint256 amountAfterFee, uint256 fee) = CPMMMath.applyFee(amountIn, feeBps);

        // Calculate trade using CPMM with amount after fee
        (uint256 sharesOut, uint256 price) = CPMMMath.quoteBuy(
            reserveYes,
            reserveNo,
            amountAfterFee
        );

        require(sharesOut >= minSharesOut, "Slippage too high");
        require(sharesOut <= reserveNo, "Insufficient reserve");
        require(reserveNo > sharesOut + MIN_RESERVE, "Insufficient reserve");

        // Transfer USDC from user
        IERC20(stable).safeTransferFrom(msg.sender, address(this), amountIn);

        feesAccrued += fee;

        // Update reserves
        reserveYes += amountAfterFee;
        reserveNo -= sharesOut;
        
        // Update user balance
        yesBal[msg.sender] += sharesOut;
        
        emit Traded(msg.sender, 1, amountIn, sharesOut, fee);
    }

    /**
     * @dev Buy No shares with USDC
     * @param amountIn USDC amount to trade
     * @param minSharesOut Minimum shares to receive (slippage protection)
     * @param deadline Transaction must be executed before this timestamp
     */
    function buyNo(
        uint256 amountIn,
        uint256 minSharesOut,
        uint256 deadline
    ) external onlyOpen onlyBeforeClose whenNotPaused onlySeeded nonReentrant {
        require(block.timestamp <= deadline, "Transaction expired");
        require(amountIn >= minStake, "Amount too small");
        
        // Apply fee first
        (uint256 amountAfterFee, uint256 fee) = CPMMMath.applyFee(amountIn, feeBps);

        // Calculate trade using CPMM with amount after fee
        (uint256 sharesOut, uint256 price) = CPMMMath.quoteBuy(
            reserveNo,
            reserveYes,
            amountAfterFee
        );

        require(sharesOut >= minSharesOut, "Slippage too high");
        require(sharesOut <= reserveYes, "Insufficient reserve");
        require(reserveYes > sharesOut + MIN_RESERVE, "Insufficient reserve");

        // Transfer USDC from user
        IERC20(stable).safeTransferFrom(msg.sender, address(this), amountIn);

        feesAccrued += fee;

        // Update reserves
        reserveNo += amountAfterFee;
        reserveYes -= sharesOut;
        
        // Update user balance
        noBal[msg.sender] += sharesOut;
        
        emit Traded(msg.sender, 2, amountIn, sharesOut, fee);
    }

    /**
     * @dev Sell Yes shares for USDC (cashout)
     * @param sharesIn Number of shares to sell
     * @param minAmountOut Minimum USDC to receive (slippage protection)
     * @param deadline Transaction must be executed before this timestamp
     */
    function sellYes(
        uint256 sharesIn,
        uint256 minAmountOut,
        uint256 deadline
    ) external onlyOpen onlyBeforeClose whenNotPaused onlySeeded nonReentrant {
        require(block.timestamp <= deadline, "Transaction expired");
        require(yesBal[msg.sender] >= sharesIn, "Insufficient shares");
        
        // Calculate trade using CPMM
        (uint256 amountOut, uint256 price) = CPMMMath.quoteSell(
            reserveNo,
            reserveYes,
            sharesIn
        );

        require(amountOut <= reserveYes, "Insufficient reserve");
        require(amountOut >= minAmountOut, "Slippage too high");

        // Apply fee
        (uint256 amountAfterFee, uint256 fee) = CPMMMath.applyFee(amountOut, feeBps);
        require(reserveYes > amountAfterFee + MIN_RESERVE, "Insufficient reserve");
        feesAccrued += fee;

        // Update user balance first
        yesBal[msg.sender] -= sharesIn;

        // Update reserves
        reserveNo += sharesIn;
        reserveYes -= amountOut;

        // Transfer USDC to user
        IERC20(stable).safeTransfer(msg.sender, amountAfterFee);
        
        emit CashedOut(msg.sender, 1, sharesIn, amountAfterFee, fee);
    }

    /**
     * @dev Sell No shares for USDC (cashout)
     * @param sharesIn Number of shares to sell
     * @param minAmountOut Minimum USDC to receive (slippage protection)
     * @param deadline Transaction must be executed before this timestamp
     */
    function sellNo(
        uint256 sharesIn,
        uint256 minAmountOut,
        uint256 deadline
    ) external onlyOpen onlyBeforeClose whenNotPaused onlySeeded nonReentrant {
        require(block.timestamp <= deadline, "Transaction expired");
        require(noBal[msg.sender] >= sharesIn, "Insufficient shares");
        
        // Calculate trade using CPMM
        (uint256 amountOut, uint256 price) = CPMMMath.quoteSell(
            reserveYes,
            reserveNo,
            sharesIn
        );

        require(amountOut <= reserveNo, "Insufficient reserve");
        require(amountOut >= minAmountOut, "Slippage too high");

        // Apply fee
        (uint256 amountAfterFee, uint256 fee) = CPMMMath.applyFee(amountOut, feeBps);
        require(reserveNo > amountAfterFee + MIN_RESERVE, "Insufficient reserve");
        feesAccrued += fee;

        // Update user balance first
        noBal[msg.sender] -= sharesIn;

        // Update reserves
        reserveYes += sharesIn;
        reserveNo -= amountOut;

        // Transfer USDC to user
        IERC20(stable).safeTransfer(msg.sender, amountAfterFee);
        
        emit CashedOut(msg.sender, 2, sharesIn, amountAfterFee, fee);
    }

    /**
     * @dev Close market (anyone can call after endTimeUTC)
     */
    function close() external {
        require(state == State.Open, "Market not open");
        require(block.timestamp >= endTimeUTC, "Market not closed yet");
        
        state = State.PendingResolution;
        emit Closed();
    }

    /**
     * @dev Post preliminary result (resolver only)
     * @param _outcome Outcome (1 = Yes, 2 = No)
     * @param _evidenceCid IPFS CID with resolution evidence
     */
    function postPreliminary(
        uint8 _outcome,
        string memory _evidenceCid
    ) external onlyResolver {
        require(state == State.PendingResolution, "Not in pending resolution");
        require(_outcome == 1 || _outcome == 2, "Invalid outcome");
        
        state = State.DisputeWindow;
        outcome = _outcome == 1 ? Outcome.Yes : Outcome.No;
        evidenceCid = _evidenceCid;
        preliminaryTimestamp = block.timestamp;
        disputeEndTime = block.timestamp + 48 hours; // 48h dispute window
        
        emit PreliminaryPosted(_outcome, _evidenceCid);
    }

    /**
     * @dev Finalize the market result (resolver only)
     * @param _outcome Final outcome (1 = Yes, 2 = No)
     */
    function finalize(uint8 _outcome) external onlyResolver {
        require(state == State.DisputeWindow, "Not in dispute window");
        require(block.timestamp >= preliminaryTimestamp + DISPUTE_WINDOW, "Dispute window not elapsed");
        require(_outcome == 1 || _outcome == 2, "Invalid outcome");
        
        state = State.Resolved;
        outcome = _outcome == 1 ? Outcome.Yes : Outcome.No;
        
        emit Finalized(_outcome);
    }

    /**
     * @dev Mark market as invalid (resolver only)
     */
    function markInvalid() external onlyResolver {
        require(
            state == State.PendingResolution || state == State.DisputeWindow,
            "Invalid state"
        );
        
        state = State.Invalid;
        emit Invalid();
    }

    /**
     * @dev Redeem shares for USDC (resolved or invalid markets)
     */
    function redeem() external nonReentrant {
        require(state == State.Resolved || state == State.Invalid, "Market not finalized");

        uint256 yesShares = yesBal[msg.sender];
        uint256 noShares = noBal[msg.sender];

        uint256 totalShares = yesShares + noShares;
        require(totalShares > 0, "No shares to redeem");

        uint256 amount;

        if (state == State.Invalid) {
            // Invalid market: each share redeems at 0.5 USDC
            // Round up to favor the user (avoid loss due to integer truncation)
            amount = (totalShares + 1) / 2;
            yesBal[msg.sender] = 0;
            noBal[msg.sender] = 0;
            emit RedeemedInvalid(msg.sender, amount);
        } else {
            // Resolved market: only winning shares redeem at $1 per share
            if (outcome == Outcome.Yes) {
                amount = yesShares;
                yesBal[msg.sender] = 0;
                if (noShares > 0) noBal[msg.sender] = 0;
            } else if (outcome == Outcome.No) {
                amount = noShares;
                noBal[msg.sender] = 0;
                if (yesShares > 0) yesBal[msg.sender] = 0;
            }
            emit Redeemed(msg.sender, amount);
        }

        if (amount > 0) {
            IERC20(stable).safeTransfer(msg.sender, amount);
        }
    }

    /**
     * @dev Withdraw accrued fees to factory's treasury
     */
    function withdrawFees() external {
        require(msg.sender == factory, "Only factory");
        require(state == State.Resolved || state == State.Invalid, "Market not finalized");

        uint256 amount = feesAccrued;
        if (amount == 0) return;

        feesAccrued = 0;

        // Get treasury from factory and transfer fees
        address treasury = IMarketFactory(factory).treasury();
        IERC20(stable).safeTransfer(treasury, amount);
        emit FeesWithdrawn(treasury, amount);
    }

    /**
     * @dev Pause market (factory only)
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause market (factory only)
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Get current odds for Yes outcome (in basis points)
     */
    function getOdds() external view returns (uint256) {
        return CPMMMath.getOdds(reserveYes, reserveNo);
    }

    /**
     * @dev Quote buying Yes shares with USDC (view only)
     * @param amountIn USDC amount to trade
     * @return sharesOut Amount of Yes shares received
     * @return price Price per share (in USDC, 18 decimals)
     */
    function quoteBuyYes(uint256 amountIn) external view returns (uint256 sharesOut, uint256 price) {
        if (!liquiditySeeded || amountIn == 0) return (0, 0);
        (uint256 amountAfterFee,) = CPMMMath.applyFee(amountIn, feeBps);
        return CPMMMath.quoteBuy(reserveYes, reserveNo, amountAfterFee);
    }

    /**
     * @dev Quote buying No shares with USDC (view only)
     * @param amountIn USDC amount to trade
     * @return sharesOut Amount of No shares received
     * @return price Price per share (in USDC, 18 decimals)
     */
    function quoteBuyNo(uint256 amountIn) external view returns (uint256 sharesOut, uint256 price) {
        if (!liquiditySeeded || amountIn == 0) return (0, 0);
        (uint256 amountAfterFee,) = CPMMMath.applyFee(amountIn, feeBps);
        return CPMMMath.quoteBuy(reserveNo, reserveYes, amountAfterFee);
    }

    /**
     * @dev Quote selling Yes shares for USDC (view only)
     * @param sharesIn Number of Yes shares to sell
     * @return amountOut USDC amount received (after fees)
     * @return price Price per share (in USDC, 18 decimals)
     */
    function quoteSellYes(uint256 sharesIn) external view returns (uint256 amountOut, uint256 price) {
        if (!liquiditySeeded || sharesIn == 0) return (0, 0);
        (uint256 grossAmount, uint256 priceRaw) = CPMMMath.quoteSell(reserveNo, reserveYes, sharesIn);
        (uint256 amountAfterFee,) = CPMMMath.applyFee(grossAmount, feeBps);
        return (amountAfterFee, priceRaw);
    }

    /**
     * @dev Quote selling No shares for USDC (view only)
     * @param sharesIn Number of No shares to sell
     * @return amountOut USDC amount received (after fees)
     * @return price Price per share (in USDC, 18 decimals)
     */
    function quoteSellNo(uint256 sharesIn) external view returns (uint256 amountOut, uint256 price) {
        if (!liquiditySeeded || sharesIn == 0) return (0, 0);
        (uint256 grossAmount, uint256 priceRaw) = CPMMMath.quoteSell(reserveYes, reserveNo, sharesIn);
        (uint256 amountAfterFee,) = CPMMMath.applyFee(grossAmount, feeBps);
        return (amountAfterFee, priceRaw);
    }

    /**
     * @dev Get market info
     */
    function getMarketInfo() external view returns (
        address _factory,
        address _stable,
        uint16 _feeBps,
        uint64 _endTimeUTC,
        State _state,
        uint8 _outcome,
        uint256 _reserveYes,
        uint256 _reserveNo,
        uint256 _feesAccrued
    ) {
        return (
            factory,
            stable,
            feeBps,
            endTimeUTC,
            state,
            uint8(outcome),
            reserveYes,
            reserveNo,
            feesAccrued
        );
    }

    /**
     * @dev Get user balances
     */
    function getUserBalances(address user) external view returns (uint256 yesBalance, uint256 noBalance) {
        return (yesBal[user], noBal[user]);
    }
}