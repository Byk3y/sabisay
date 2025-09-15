// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/MarketFactory.sol";
import "../src/Market.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock USDC token for testing
contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {
        _mint(msg.sender, 1000000 * 10**6); // 1M USDC
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract MarketFactoryTest is Test {
    MarketFactory public factory;
    MockUSDC public usdc;
    
    address public admin = address(0x1);
    address public resolver = address(0x2);
    address public pauser = address(0x3);
    address public user = address(0x4);
    
    uint16 constant FEE_BPS = 200; // 2%
    uint64 constant END_TIME = 1735689600; // Future timestamp
    
    function setUp() public {
        // Deploy mock USDC
        usdc = new MockUSDC();
        
        // Deploy factory
        vm.prank(admin);
        factory = new MarketFactory(address(usdc));
    }
    
    function testFactoryCreation() public {
        assertEq(factory.usdcToken(), address(usdc));
        assertEq(factory.marketCount(), 0);
        
        // Check roles
        assertTrue(factory.hasRole(factory.ADMIN_ROLE(), admin));
        assertTrue(factory.hasRole(factory.RESOLVER_ROLE(), admin));
        assertTrue(factory.hasRole(factory.PAUSER_ROLE(), admin));
    }
    
    function testCreateMarket() public {
        string memory rulesCid = "QmTestRulesCid";
        
        vm.prank(admin);
        address marketAddr = factory.createMarket(
            address(usdc),
            FEE_BPS,
            END_TIME,
            rulesCid
        );
        
        // Check market was created
        assertTrue(marketAddr != address(0));
        assertTrue(factory.isMarket(marketAddr));
        assertEq(factory.marketCount(), 1);
        assertEq(factory.markets(1), marketAddr);
        
        // Check market properties
        Market market = Market(marketAddr);
        assertEq(market.factory(), address(factory));
        assertEq(market.stable(), address(usdc));
        assertEq(market.feeBps(), FEE_BPS);
        assertEq(market.endTimeUTC(), END_TIME);
        assertEq(market.rulesCid(), rulesCid);
    }
    
    function testCreateMarketInvalidToken() public {
        MockUSDC invalidToken = new MockUSDC();
        
        vm.prank(admin);
        vm.expectRevert("Invalid stable token");
        factory.createMarket(
            address(invalidToken),
            FEE_BPS,
            END_TIME,
            "QmTestRulesCid"
        );
    }
    
    function testCreateMarketInvalidFee() public {
        uint16 invalidFee = 1500; // 15% - too high
        
        vm.prank(admin);
        vm.expectRevert("Fee too high");
        factory.createMarket(
            address(usdc),
            invalidFee,
            END_TIME,
            "QmTestRulesCid"
        );
    }
    
    function testCreateMarketInvalidEndTime() public {
        uint64 pastTime = uint64(block.timestamp - 1);
        
        vm.prank(admin);
        vm.expectRevert("Invalid end time");
        factory.createMarket(
            address(usdc),
            FEE_BPS,
            pastTime,
            "QmTestRulesCid"
        );
    }
    
    function testCreateMarketOnlyAdmin() public {
        vm.prank(user);
        vm.expectRevert();
        factory.createMarket(
            address(usdc),
            FEE_BPS,
            END_TIME,
            "QmTestRulesCid"
        );
    }
    
    function testGetAllMarkets() public {
        // Create multiple markets
        vm.startPrank(admin);
        
        address market1 = factory.createMarket(
            address(usdc),
            FEE_BPS,
            END_TIME,
            "QmRules1"
        );
        
        address market2 = factory.createMarket(
            address(usdc),
            FEE_BPS,
            END_TIME + 1,
            "QmRules2"
        );
        
        vm.stopPrank();
        
        // Check all markets
        address[] memory allMarkets = factory.getAllMarkets();
        assertEq(allMarkets.length, 2);
        assertEq(allMarkets[0], market1);
        assertEq(allMarkets[1], market2);
    }
    
    function testPauseAllMarkets() public {
        // Create a market first
        vm.prank(admin);
        address marketAddr = factory.createMarket(
            address(usdc),
            FEE_BPS,
            END_TIME,
            "QmTestRulesCid"
        );
        
        // Pause all markets
        vm.prank(pauser);
        factory.pauseAllMarkets();
        
        // Check factory is paused
        assertTrue(factory.paused());
    }
    
    function testUnpauseAllMarkets() public {
        // Pause first
        vm.prank(pauser);
        factory.pauseAllMarkets();
        assertTrue(factory.paused());
        
        // Unpause
        vm.prank(pauser);
        factory.unpauseAllMarkets();
        assertFalse(factory.paused());
    }
    
    function testPauseOnlyPauser() public {
        vm.prank(user);
        vm.expectRevert();
        factory.pauseAllMarkets();
    }
    
    function testUnpauseOnlyPauser() public {
        vm.prank(user);
        vm.expectRevert();
        factory.unpauseAllMarkets();
    }
    
    function testMarketCountIncrements() public {
        assertEq(factory.marketCount(), 0);
        
        vm.prank(admin);
        factory.createMarket(address(usdc), FEE_BPS, END_TIME, "QmRules1");
        assertEq(factory.marketCount(), 1);
        
        vm.prank(admin);
        factory.createMarket(address(usdc), FEE_BPS, END_TIME + 1, "QmRules2");
        assertEq(factory.marketCount(), 2);
    }
}
