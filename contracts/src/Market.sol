// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./libraries/CPMMMath.sol";

/**
 * @title Market
 * @dev Individual prediction market contract with CPMM AMM
 * @notice Implements constant product market maker for Yes/No outcomes
 */
contract Market is AccessControl, ReentrancyGuard, Pausable {
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
    uint16 public immutable feeBps; // Trade fee in basis points
    uint64 public immutable endTimeUTC;
    string public rulesCid;
    
    State public state;
    Outcome public outcome;
    string public evidenceCid;
    uint256 public resolutionTime;
    uint256 public disputeEndTime;
    
    // CPMM reserves
    uint256 public reserveYes;
    uint256 public reserveNo;
    uint256 public feesAccrued;
    
    // Internal accounting for shares (MVP - no ERC1155)
    mapping(address => uint256) public yesBal;
    mapping(address => uint256) public noBal;
    
    // Constants
    uint256 public constant MIN_STAKE = 1e6; // $1 USDC (6 decimals)
    
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
    event FeesWithdrawn(address indexed to, uint256 amount);

    constructor(
        address _factory,
        address _stable,
        uint16 _feeBps,
        uint64 _endTimeUTC,
        string memory _rulesCid
    ) {
        factory = _factory;
        stable = _stable;
        feeBps = _feeBps;
        endTimeUTC = _endTimeUTC;
        rulesCid = _rulesCid;
        state = State.Open;
        
        // Initialize with minimal liquidity for CPMM to work
        reserveYes = 1000 * 10**6; // 1000 USDC
        reserveNo = 1000 * 10**6;  // 1000 USDC
        
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

    /**
     * @dev Buy Yes shares with USDC
     * @param amountIn USDC amount to trade
     * @param minSharesOut Minimum shares to receive (slippage protection)
     */
    function buyYes(
        uint256 amountIn,
        uint256 minSharesOut
    ) external onlyOpen onlyBeforeClose whenNotPaused nonReentrant {
        require(amountIn >= MIN_STAKE, "Amount too small");
        
        // Transfer USDC from user
        IERC20(stable).transferFrom(msg.sender, address(this), amountIn);
        
        // Calculate trade using CPMM
        (uint256 sharesOut, uint256 price) = CPMMMath.quoteBuy(
            reserveYes,
            reserveNo,
            amountIn
        );
        
        require(sharesOut >= minSharesOut, "Slippage too high");
        
        // Apply fee
        (uint256 amountAfterFee, uint256 fee) = CPMMMath.applyFee(amountIn, feeBps);
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
     */
    function buyNo(
        uint256 amountIn,
        uint256 minSharesOut
    ) external onlyOpen onlyBeforeClose whenNotPaused nonReentrant {
        require(amountIn >= MIN_STAKE, "Amount too small");
        
        // Transfer USDC from user
        IERC20(stable).transferFrom(msg.sender, address(this), amountIn);
        
        // Calculate trade using CPMM
        (uint256 sharesOut, uint256 price) = CPMMMath.quoteBuy(
            reserveNo,
            reserveYes,
            amountIn
        );
        
        require(sharesOut >= minSharesOut, "Slippage too high");
        
        // Apply fee
        (uint256 amountAfterFee, uint256 fee) = CPMMMath.applyFee(amountIn, feeBps);
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
     */
    function sellYes(
        uint256 sharesIn,
        uint256 minAmountOut
    ) external onlyOpen onlyBeforeClose whenNotPaused nonReentrant {
        require(yesBal[msg.sender] >= sharesIn, "Insufficient shares");
        
        // Calculate trade using CPMM
        (uint256 amountOut, uint256 price) = CPMMMath.quoteSell(
            reserveNo,
            reserveYes,
            sharesIn
        );
        
        require(amountOut >= minAmountOut, "Slippage too high");
        
        // Apply fee
        (uint256 amountAfterFee, uint256 fee) = CPMMMath.applyFee(amountOut, feeBps);
        feesAccrued += fee;
        
        // Update reserves
        reserveNo += sharesIn;
        reserveYes -= amountAfterFee;
        
        // Update user balance
        yesBal[msg.sender] -= sharesIn;
        
        // Transfer USDC to user
        IERC20(stable).transfer(msg.sender, amountAfterFee);
        
        emit CashedOut(msg.sender, 1, sharesIn, amountAfterFee, fee);
    }

    /**
     * @dev Sell No shares for USDC (cashout)
     * @param sharesIn Number of shares to sell
     * @param minAmountOut Minimum USDC to receive (slippage protection)
     */
    function sellNo(
        uint256 sharesIn,
        uint256 minAmountOut
    ) external onlyOpen onlyBeforeClose whenNotPaused nonReentrant {
        require(noBal[msg.sender] >= sharesIn, "Insufficient shares");
        
        // Calculate trade using CPMM
        (uint256 amountOut, uint256 price) = CPMMMath.quoteSell(
            reserveYes,
            reserveNo,
            sharesIn
        );
        
        require(amountOut >= minAmountOut, "Slippage too high");
        
        // Apply fee
        (uint256 amountAfterFee, uint256 fee) = CPMMMath.applyFee(amountOut, feeBps);
        feesAccrued += fee;
        
        // Update reserves
        reserveYes += sharesIn;
        reserveNo -= amountAfterFee;
        
        // Update user balance
        noBal[msg.sender] -= sharesIn;
        
        // Transfer USDC to user
        IERC20(stable).transfer(msg.sender, amountAfterFee);
        
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
        resolutionTime = block.timestamp;
        disputeEndTime = block.timestamp + 48 hours; // 48h dispute window
        
        emit PreliminaryPosted(_outcome, _evidenceCid);
    }

    /**
     * @dev Finalize the market result (resolver only)
     * @param _outcome Final outcome (1 = Yes, 2 = No)
     */
    function finalize(uint8 _outcome) external onlyResolver {
        require(
            state == State.PendingResolution || state == State.DisputeWindow,
            "Invalid state"
        );
        require(block.timestamp >= disputeEndTime, "Dispute period not ended");
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
     * @dev Redeem winning shares for USDC
     */
    function redeem() external nonReentrant {
        require(state == State.Resolved, "Market not resolved");
        
        uint256 yesShares = yesBal[msg.sender];
        uint256 noShares = noBal[msg.sender];
        
        uint256 totalShares = yesShares + noShares;
        require(totalShares > 0, "No shares to redeem");
        
        uint256 amount;
        
        if (outcome == Outcome.Yes) {
            // Yes won - redeem Yes shares
            amount = (yesShares * (reserveYes + reserveNo)) / totalShares;
            yesBal[msg.sender] = 0;
            if (noShares > 0) noBal[msg.sender] = 0;
        } else if (outcome == Outcome.No) {
            // No won - redeem No shares
            amount = (noShares * (reserveYes + reserveNo)) / totalShares;
            noBal[msg.sender] = 0;
            if (yesShares > 0) yesBal[msg.sender] = 0;
        }
        
        if (amount > 0) {
            IERC20(stable).transfer(msg.sender, amount);
            emit Redeemed(msg.sender, amount);
        }
    }

    /**
     * @dev Withdraw accrued fees (factory only)
     * @param to Address to receive fees
     */
    function withdrawFees(address to) external {
        require(msg.sender == factory, "Only factory");
        require(state == State.Resolved || state == State.Invalid, "Market not finalized");
        
        uint256 amount = feesAccrued;
        feesAccrued = 0;
        
        IERC20(stable).transfer(to, amount);
        emit FeesWithdrawn(to, amount);
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