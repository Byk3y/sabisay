// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./Market.sol";

/**
 * @title MarketFactory
 * @dev Factory contract for creating prediction markets
 * @notice Deploys individual market contracts and manages roles
 */
contract MarketFactory is AccessControl, ReentrancyGuard, Pausable {
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant RESOLVER_ROLE = keccak256("RESOLVER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // State variables
    address public immutable usdcToken;
    uint256 public marketCount;
    mapping(uint256 => address) public markets;
    mapping(address => bool) public isMarket;

    // Events
    event MarketCreated(
        uint256 indexed marketId,
        address indexed market,
        uint256 endTime,
        uint256 feeBps,
        string rulesCid
    );

    constructor(address _usdcToken) {
        usdcToken = _usdcToken;
        
        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(RESOLVER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    /**
     * @dev Create a new prediction market
     * @param stable USDC token address
     * @param feeBps Trade fee in basis points (default 200 = 2%)
     * @param endTimeUTC Market end time (UTC timestamp)
     * @param rulesCid IPFS CID for market rules
     * @return market Address of the created market
     */
    function createMarket(
        address stable,
        uint16 feeBps,
        uint64 endTimeUTC,
        string memory rulesCid
    ) external onlyRole(ADMIN_ROLE) returns (address market) {
        require(stable == usdcToken, "Invalid stable token");
        require(feeBps <= 1000, "Fee too high"); // Max 10%
        require(endTimeUTC > block.timestamp, "Invalid end time");
        
        marketCount++;
        
        market = address(new Market(
            address(this),
            stable,
            feeBps,
            endTimeUTC,
            rulesCid
        ));
        
        markets[marketCount] = market;
        isMarket[market] = true;
        
        emit MarketCreated(marketCount, market, endTimeUTC, feeBps, rulesCid);
    }

    /**
     * @dev Get all markets
     * @return Array of market addresses
     */
    function getAllMarkets() external view returns (address[] memory) {
        address[] memory allMarkets = new address[](marketCount);
        for (uint256 i = 1; i <= marketCount; i++) {
            allMarkets[i - 1] = markets[i];
        }
        return allMarkets;
    }

    /**
     * @dev Pause all markets (emergency only)
     */
    function pauseAllMarkets() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause all markets
     */
    function unpauseAllMarkets() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}