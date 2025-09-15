// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/**
 * @title Market
 * @dev Individual prediction market contract with CPMM AMM
 * @notice Implements constant product market maker for Yes/No outcomes
 */
contract Market is AccessControl, ReentrancyGuard, Pausable, ERC1155 {
    // Roles
    bytes32 public constant RESOLVER_ROLE = keccak256("RESOLVER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Market state enum
    enum MarketState {
        Open,
        PendingResolution,
        DisputeWindow,
        Resolved,
        Invalid
    }

    // State variables
    address public immutable factory;
    address public immutable usdcToken;
    address public immutable creator;
    address public immutable resolver;
    uint256 public immutable endTime;
    string public rulesCid;
    
    MarketState public state;
    uint256 public reservesYes;
    uint256 public reservesNo;
    uint256 public feesAccrued;
    
    // Resolution data
    bool public outcome;
    string public resolutionCid;
    uint256 public resolutionTime;
    uint256 public disputeEndTime;
    
    // Constants
    uint256 public constant TRADE_FEE_BPS = 200; // 2%
    uint256 public constant MIN_STAKE = 1e6; // $1 USDC
    
    // Token IDs
    uint256 public constant YES_TOKEN_ID = 1;
    uint256 public constant NO_TOKEN_ID = 2;
    
    // Events
    event Traded(
        address indexed user,
        uint256 side, // 1 = Yes, 2 = No
        uint256 amount,
        uint256 shares,
        uint256 price
    );
    
    event Cashout(
        address indexed user,
        uint256 side,
        uint256 shares,
        uint256 amount
    );
    
    event PreliminaryResult(bool outcome, string resolutionCid);
    event Disputed(address indexed disputer, string reason);
    event Finalized(bool outcome, string resolutionCid);
    event Redeemed(address indexed user, uint256 amount);
    event FeesWithdrawn(address indexed to, uint256 amount);

    constructor(
        address _factory,
        address _usdcToken,
        uint256 _endTime,
        address _creator,
        address _resolver,
        string memory _rulesCid
    ) ERC1155("") {
        factory = _factory;
        usdcToken = _usdcToken;
        creator = _creator;
        resolver = _resolver;
        endTime = _endTime;
        rulesCid = _rulesCid;
        state = MarketState.Open;
        
        // Set up roles
        _grantRole(RESOLVER_ROLE, _resolver);
        _grantRole(PAUSER_ROLE, _factory);
    }

    /**
     * @dev Trade Yes/No shares using CPMM
     * @param side 1 for Yes, 2 for No
     * @param amount USDC amount to trade
     * @param minShares Minimum shares to receive (slippage protection)
     */
    function trade(
        uint256 side,
        uint256 amount,
        uint256 minShares
    ) external nonReentrant whenNotPaused {
        require(state == MarketState.Open, "Market not open");
        require(block.timestamp < endTime, "Market closed");
        require(side == YES_TOKEN_ID || side == NO_TOKEN_ID, "Invalid side");
        require(amount >= MIN_STAKE, "Amount too small");
        
        // Transfer USDC from user
        IERC20(usdcToken).transferFrom(msg.sender, address(this), amount);
        
        // Calculate trade
        uint256 shares;
        uint256 price;
        
        if (side == YES_TOKEN_ID) {
            (shares, price) = _calculateTrade(reservesYes, reservesNo, amount, true);
            reservesYes += amount;
            reservesNo -= shares;
        } else {
            (shares, price) = _calculateTrade(reservesNo, reservesYes, amount, true);
            reservesNo += amount;
            reservesYes -= shares;
        }
        
        require(shares >= minShares, "Slippage too high");
        
        // Apply trade fee
        uint256 fee = (amount * TRADE_FEE_BPS) / 10000;
        feesAccrued += fee;
        
        // Mint shares to user
        _mint(msg.sender, side, shares, "");
        
        emit Traded(msg.sender, side, amount, shares, price);
    }

    /**
     * @dev Cashout shares for USDC
     * @param side 1 for Yes, 2 for No
     * @param shares Number of shares to cashout
     * @param minAmount Minimum USDC to receive (slippage protection)
     */
    function cashout(
        uint256 side,
        uint256 shares,
        uint256 minAmount
    ) external nonReentrant whenNotPaused {
        require(state == MarketState.Open, "Market not open");
        require(block.timestamp < endTime, "Market closed");
        require(side == YES_TOKEN_ID || side == NO_TOKEN_ID, "Invalid side");
        require(balanceOf(msg.sender, side) >= shares, "Insufficient shares");
        
        // Calculate cashout
        uint256 amount;
        uint256 price;
        
        if (side == YES_TOKEN_ID) {
            (amount, price) = _calculateTrade(reservesYes, reservesNo, shares, false);
            reservesYes -= amount;
            reservesNo += shares;
        } else {
            (amount, price) = _calculateTrade(reservesNo, reservesYes, shares, false);
            reservesNo -= amount;
            reservesYes += shares;
        }
        
        require(amount >= minAmount, "Slippage too high");
        
        // Apply trade fee
        uint256 fee = (amount * TRADE_FEE_BPS) / 10000;
        feesAccrued += fee;
        amount -= fee;
        
        // Burn shares and transfer USDC
        _burn(msg.sender, side, shares);
        IERC20(usdcToken).transfer(msg.sender, amount);
        
        emit Cashout(msg.sender, side, shares, amount);
    }

    /**
     * @dev Post preliminary result (resolver only)
     * @param _outcome True for Yes, false for No
     * @param _resolutionCid IPFS CID with resolution evidence
     */
    function postPreliminaryResult(
        bool _outcome,
        string memory _resolutionCid
    ) external onlyRole(RESOLVER_ROLE) {
        require(state == MarketState.Open, "Market not open");
        require(block.timestamp >= endTime, "Market not closed yet");
        
        state = MarketState.PendingResolution;
        outcome = _outcome;
        resolutionCid = _resolutionCid;
        resolutionTime = block.timestamp;
        disputeEndTime = block.timestamp + 48 hours; // 48h dispute window
        
        emit PreliminaryResult(_outcome, _resolutionCid);
    }

    /**
     * @dev Dispute the preliminary result
     * @param reason Reason for dispute
     */
    function dispute(string memory reason) external {
        require(state == MarketState.PendingResolution, "Not in dispute period");
        require(block.timestamp < disputeEndTime, "Dispute period ended");
        
        state = MarketState.DisputeWindow;
        
        emit Disputed(msg.sender, reason);
    }

    /**
     * @dev Finalize the market result (resolver only)
     * @param _outcome Final outcome
     * @param _resolutionCid Final resolution evidence
     */
    function finalize(
        bool _outcome,
        string memory _resolutionCid
    ) external onlyRole(RESOLVER_ROLE) {
        require(
            state == MarketState.PendingResolution || state == MarketState.DisputeWindow,
            "Invalid state"
        );
        require(block.timestamp >= disputeEndTime, "Dispute period not ended");
        
        state = MarketState.Resolved;
        outcome = _outcome;
        resolutionCid = _resolutionCid;
        
        emit Finalized(_outcome, _resolutionCid);
    }

    /**
     * @dev Mark market as invalid (resolver only)
     */
    function markInvalid() external onlyRole(RESOLVER_ROLE) {
        require(
            state == MarketState.PendingResolution || state == MarketState.DisputeWindow,
            "Invalid state"
        );
        
        state = MarketState.Invalid;
        
        emit Finalized(false, "INVALID");
    }

    /**
     * @dev Redeem winning shares for USDC
     */
    function redeem() external nonReentrant {
        require(state == MarketState.Resolved, "Market not resolved");
        
        uint256 yesShares = balanceOf(msg.sender, YES_TOKEN_ID);
        uint256 noShares = balanceOf(msg.sender, NO_TOKEN_ID);
        
        uint256 totalShares = yesShares + noShares;
        require(totalShares > 0, "No shares to redeem");
        
        uint256 amount;
        
        if (outcome) {
            // Yes won
            amount = (yesShares * (reservesYes + reservesNo)) / totalShares;
            _burn(msg.sender, YES_TOKEN_ID, yesShares);
            if (noShares > 0) _burn(msg.sender, NO_TOKEN_ID, noShares);
        } else {
            // No won
            amount = (noShares * (reservesYes + reservesNo)) / totalShares;
            _burn(msg.sender, NO_TOKEN_ID, noShares);
            if (yesShares > 0) _burn(msg.sender, YES_TOKEN_ID, yesShares);
        }
        
        IERC20(usdcToken).transfer(msg.sender, amount);
        
        emit Redeemed(msg.sender, amount);
    }

    /**
     * @dev Withdraw accrued fees (factory only)
     */
    function withdrawFees() external {
        require(msg.sender == factory, "Only factory");
        
        uint256 amount = feesAccrued;
        feesAccrued = 0;
        
        IERC20(usdcToken).transfer(factory, amount);
        
        emit FeesWithdrawn(factory, amount);
    }

    /**
     * @dev Calculate trade using constant product formula
     * @param reserveIn Input reserve
     * @param reserveOut Output reserve
     * @param amountIn Input amount
     * @param isBuy True for buy, false for sell
     */
    function _calculateTrade(
        uint256 reserveIn,
        uint256 reserveOut,
        uint256 amountIn,
        bool isBuy
    ) internal pure returns (uint256 amountOut, uint256 price) {
        if (isBuy) {
            // Buy shares with USDC
            amountOut = (reserveOut * amountIn) / (reserveIn + amountIn);
            price = (amountIn * 1e18) / amountOut;
        } else {
            // Sell shares for USDC
            amountOut = (reserveIn * amountIn) / (reserveOut + amountIn);
            price = (amountOut * 1e18) / amountIn;
        }
    }

    /**
     * @dev Get current odds for a side
     * @param side 1 for Yes, 2 for No
     */
    function getOdds(uint256 side) external view returns (uint256) {
        if (side == YES_TOKEN_ID) {
            return (reservesNo * 1e18) / (reservesYes + reservesNo);
        } else {
            return (reservesYes * 1e18) / (reservesYes + reservesNo);
        }
    }

    /**
     * @dev Get market info
     */
    function getMarketInfo() external view returns (
        address _creator,
        address _resolver,
        uint256 _endTime,
        MarketState _state,
        uint256 _reservesYes,
        uint256 _reservesNo,
        uint256 _feesAccrued
    ) {
        return (
            creator,
            resolver,
            endTime,
            state,
            reservesYes,
            reservesNo,
            feesAccrued
        );
    }
}
