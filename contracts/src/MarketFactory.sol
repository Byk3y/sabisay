// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./Market.sol";

/**
 * @title MarketFactory
 * @dev Factory contract for creating prediction markets
 * @notice Deploys individual market contracts and manages roles
 */
contract MarketFactory is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant RESOLVER_ROLE = keccak256("RESOLVER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // State variables
    address public immutable usdcToken;
    address public immutable treasury;
    uint16 public immutable MAX_FEE_BPS; // Maximum fee in basis points
    uint256 public marketCount;
    mapping(uint256 => address) public markets;
    mapping(address => bool) public isMarket;

    // Multisig addresses for role delegation
    address public resolverMultisig;
    address public pauserMultisig;

    // Events
    event MarketCreated(
        uint256 indexed marketId,
        address indexed market,
        uint256 endTime,
        uint256 feeBps,
        string rulesCid,
        uint256 initialYes,
        uint256 initialNo
    );

    constructor(address _usdcToken, address _treasury) {
        require(_usdcToken != address(0), "Invalid USDC");
        require(_treasury != address(0), "Invalid treasury");

        usdcToken = _usdcToken;
        treasury = _treasury;
        MAX_FEE_BPS = 1000; // 10% maximum fee

        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(RESOLVER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);

        // Initialize multisig addresses to deployer (can be changed later)
        resolverMultisig = msg.sender;
        pauserMultisig = msg.sender;
    }

    /**
     * @dev Create a new prediction market with initial liquidity
     * @param feeBps Trade fee in basis points (max 10%)
     * @param endTimeUTC Market end time (UTC timestamp)
     * @param rulesCid IPFS CID for market rules
     * @param initialYes Initial USDC for Yes reserve
     * @param initialNo Initial USDC for No reserve
     * @return market Address of the created market
     */
    function createMarket(
        uint16 feeBps,
        uint64 endTimeUTC,
        string memory rulesCid,
        uint256 initialYes,
        uint256 initialNo
    ) external onlyRole(ADMIN_ROLE) nonReentrant returns (address market) {
        require(feeBps <= MAX_FEE_BPS, "Fee too high");
        require(endTimeUTC > block.timestamp, "Invalid end time");
        require(initialYes > 0 && initialNo > 0, "Invalid seed amounts");

        marketCount++;

        // Deploy new market
        market = address(new Market(
            address(this),
            usdcToken,
            feeBps,
            endTimeUTC,
            rulesCid
        ));

        // Grant roles to multisig addresses
        Market(market).grantRole(Market(market).RESOLVER_ROLE(), resolverMultisig);
        Market(market).grantRole(Market(market).PAUSER_ROLE(), pauserMultisig);

        markets[marketCount] = market;
        isMarket[market] = true;

        // Transfer liquidity directly from user to market and seed it
        uint256 totalLiquidity = initialYes + initialNo;
        IERC20(usdcToken).safeTransferFrom(msg.sender, market, totalLiquidity);
        Market(market).seedLiquidity(initialYes, initialNo);

        emit MarketCreated(marketCount, market, endTimeUTC, feeBps, rulesCid, initialYes, initialNo);
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

        // Pause all individual markets
        for (uint256 i = 1; i <= marketCount; i++) {
            Market(markets[i]).pause();
        }
    }

    /**
     * @dev Unpause all markets
     */
    function unpauseAllMarkets() external onlyRole(PAUSER_ROLE) {
        _unpause();

        // Unpause all individual markets
        for (uint256 i = 1; i <= marketCount; i++) {
            Market(markets[i]).unpause();
        }
    }
    
    /**
     * @dev Set resolver multisig address
     * @param _resolverMultisig Address of the resolver multisig
     */
    function setResolver(address _resolverMultisig) external onlyRole(ADMIN_ROLE) {
        require(_resolverMultisig != address(0), "Invalid resolver address");
        resolverMultisig = _resolverMultisig;
    }
    
    /**
     * @dev Set pauser multisig address
     * @param _pauserMultisig Address of the pauser multisig
     */
    function setPauser(address _pauserMultisig) external onlyRole(ADMIN_ROLE) {
        require(_pauserMultisig != address(0), "Invalid pauser address");
        pauserMultisig = _pauserMultisig;
    }
    
    /**
     * @dev Propagate roles to existing markets
     * @param marketAddresses Array of market addresses to update
     */
    function propagateRoles(address[] calldata marketAddresses) external onlyRole(ADMIN_ROLE) {
        for (uint256 i = 0; i < marketAddresses.length; i++) {
            address marketAddr = marketAddresses[i];
            require(isMarket[marketAddr], "Not a valid market");
            
            Market(marketAddr).grantRole(Market(marketAddr).RESOLVER_ROLE(), resolverMultisig);
            Market(marketAddr).grantRole(Market(marketAddr).PAUSER_ROLE(), pauserMultisig);
        }
    }
}