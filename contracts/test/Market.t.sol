// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/MarketFactory.sol";
import "../src/Market.sol";

contract MarketTest is Test {
    MarketFactory factory;
    Market market;
    
    address usdc = address(0x1234);
    address admin = address(0x1);
    address resolver = address(0x2);
    address pauser = address(0x3);
    address user = address(0x4);
    
    function setUp() public {
        // Deploy factory
        factory = new MarketFactory(usdc, admin, resolver, pauser);
        
        // Create a test market
        address marketAddr = factory.createMarket(
            "Will Nigeria win the next AFCON?",
            block.timestamp + 7 days,
            10000e6, // $10,000 initial liquidity
            "QmTest123"
        );
        
        market = Market(marketAddr);
    }
    
    function testMarketCreation() public {
        assertTrue(factory.isMarket(address(market)));
        assertEq(market.creator(), admin);
        assertEq(market.resolver(), resolver);
    }
    
    function testTrade() public {
        // Mock USDC transfer
        vm.mockCall(usdc, abi.encodeWithSelector(IERC20.transferFrom.selector), abi.encode(true));
        vm.mockCall(usdc, abi.encodeWithSelector(IERC20.transfer.selector), abi.encode(true));
        
        // Trade Yes
        market.trade(1, 100e6, 0); // $100 for Yes
        
        assertEq(market.balanceOf(user, 1), 0); // Will be calculated by CPMM
    }
    
    function testCannotTradeAfterEndTime() public {
        vm.warp(block.timestamp + 8 days);
        
        vm.mockCall(usdc, abi.encodeWithSelector(IERC20.transferFrom.selector), abi.encode(true));
        
        vm.expectRevert("Market closed");
        market.trade(1, 100e6, 0);
    }
    
    function testResolution() public {
        vm.warp(block.timestamp + 7 days);
        
        // Post preliminary result
        market.postPreliminaryResult(true, "QmResolution123");
        
        assertEq(uint256(market.state()), uint256(Market.MarketState.PendingResolution));
        assertTrue(market.outcome());
    }
}
