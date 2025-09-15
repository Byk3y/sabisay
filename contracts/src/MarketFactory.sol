// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./Market.sol";

/**
 * @title MarketFactory
 * @dev Factory contract for creating prediction markets
 * @notice This contract deploys individual market contracts and manages roles
 */
contract MarketFactory is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant RESOLVER_ROLE = keccak256("RESOLVER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // State variables
    address public immutable usdcToken;
    uint256 public constant TRADE_FEE_BPS = 200; // 2%
    uint256 public constant SETTLEMENT_FEE_BPS = 100; // 1% (feature flagged)
    uint256 public constant MIN_STAKE = 1e6; // $1 USDC (6 decimals)
    
    // Market registry
    mapping(address => bool) public isMarket;
    address[] public markets;
    
    // Events
    event MarketCreated(
        address indexed market,
        address indexed creator,
        string question,
        uint256 endTime,
        uint256 initialLiquidity
    );
    
    event FeesWithdrawn(address indexed to, uint256 amount);
    event TreasuryUpdated(address indexed newTreasury);

    constructor(
        address _usdcToken,
        address _admin,
        address _resolver,
        address _pauser
    ) {
        usdcToken = _usdcToken;
        
        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(RESOLVER_ROLE, _resolver);
        _grantRole(PAUSER_ROLE, _pauser);
    }

    /**
     * @dev Create a new prediction market
     * @param question The market question
     * @param endTime Unix timestamp when market closes
     * @param initialLiquidity Initial liquidity to seed the market
     * @param rulesCid IPFS CID containing market rules and metadata
     */
    function createMarket(
        string memory question,
        uint256 endTime,
        uint256 initialLiquidity,
        string memory rulesCid
    ) external onlyRole(ADMIN_ROLE) whenNotPaused returns (address) {
        require(endTime > block.timestamp, "End time must be in future");
        require(initialLiquidity >= MIN_STAKE, "Insufficient initial liquidity");
        
        // Deploy new market contract
        Market market = new Market(
            address(this),
            usdcToken,
            endTime,
            msg.sender, // creator
            getRoleMember(RESOLVER_ROLE, 0), // resolver
            rulesCid
        );
        
        // Register market
        address marketAddress = address(market);
        isMarket[marketAddress] = true;
        markets.push(marketAddress);
        
        // Transfer initial liquidity to market
        IERC20(usdcToken).transferFrom(msg.sender, marketAddress, initialLiquidity);
        
        emit MarketCreated(marketAddress, msg.sender, question, endTime, initialLiquidity);
        
        return marketAddress;
    }

    /**
     * @dev Get all markets
     */
    function getAllMarkets() external view returns (address[] memory) {
        return markets;
    }

    /**
     * @dev Get market count
     */
    function getMarketCount() external view returns (uint256) {
        return markets.length;
    }

    /**
     * @dev Pause all market operations
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause all market operations
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Emergency function to pause a specific market
     */
    function pauseMarket(address market) external onlyRole(PAUSER_ROLE) {
        require(isMarket[market], "Invalid market");
        Market(market).pause();
    }
}
