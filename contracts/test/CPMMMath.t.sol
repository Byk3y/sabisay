// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/libraries/CPMMMath.sol";

contract CPMMMathTest is Test {
    function testQuoteBuy() public {
        uint256 reserveIn = 1000 * 10**6;  // 1000 USDC
        uint256 reserveOut = 1000 * 10**6; // 1000 shares
        uint256 amountIn = 100 * 10**6;    // 100 USDC
        
        (uint256 amountOut, uint256 price) = CPMMMath.quoteBuy(reserveIn, reserveOut, amountIn);
        
        // amountOut should be less than amountIn due to CPMM
        assertLt(amountOut, amountIn);
        assertGt(amountOut, 0);
        assertGt(price, 0);
    }
    
    function testQuoteSell() public {
        uint256 reserveIn = 1000 * 10**6;  // 1000 shares
        uint256 reserveOut = 1000 * 10**6; // 1000 USDC
        uint256 amountIn = 100 * 10**6;    // 100 shares
        
        (uint256 amountOut, uint256 price) = CPMMMath.quoteSell(reserveIn, reserveOut, amountIn);
        
        // amountOut should be less than amountIn due to CPMM
        assertLt(amountOut, amountIn);
        assertGt(amountOut, 0);
        assertGt(price, 0);
    }
    
    function testQuoteBuyZeroAmount() public {
        (uint256 amountOut, uint256 price) = CPMMMath.quoteBuy(1000, 1000, 0);
        assertEq(amountOut, 0);
        assertEq(price, 0);
    }
    
    function testQuoteSellZeroAmount() public {
        (uint256 amountOut, uint256 price) = CPMMMath.quoteSell(1000, 1000, 0);
        assertEq(amountOut, 0);
        assertEq(price, 0);
    }
    
    function testQuoteBuyInsufficientLiquidity() public {
        vm.expectRevert(CPMMMath.InsufficientLiquidity.selector);
        CPMMMath.quoteBuy(0, 1000, 100);
        
        vm.expectRevert(CPMMMath.InsufficientLiquidity.selector);
        CPMMMath.quoteBuy(1000, 0, 100);
    }
    
    function testQuoteSellInsufficientLiquidity() public {
        vm.expectRevert(CPMMMath.InsufficientLiquidity.selector);
        CPMMMath.quoteSell(0, 1000, 100);
        
        vm.expectRevert(CPMMMath.InsufficientLiquidity.selector);
        CPMMMath.quoteSell(1000, 0, 100);
    }
    
    function testQuoteSellInvalidInput() public {
        vm.expectRevert(CPMMMath.InvalidInput.selector);
        CPMMMath.quoteSell(1000, 1000, 1000); // amountIn >= reserveIn
    }
    
    function testGetConstantProduct() public {
        uint256 reserveA = 1000;
        uint256 reserveB = 2000;
        uint256 k = CPMMMath.getConstantProduct(reserveA, reserveB);
        assertEq(k, 2000000);
    }
    
    function testGetOdds() public {
        uint256 reserveA = 1000;
        uint256 reserveB = 2000;
        uint256 oddsA = CPMMMath.getOdds(reserveA, reserveB);
        
        // oddsA should be (reserveB / totalReserves) * 10000
        // = (2000 / 3000) * 10000 = 6666
        assertEq(oddsA, 6666);
    }
    
    function testGetOddsNoLiquidity() public {
        uint256 oddsA = CPMMMath.getOdds(0, 0);
        assertEq(oddsA, 5000); // 50% if no liquidity
    }
    
    function testCalculateFee() public {
        uint256 amount = 1000;
        uint256 feeBps = 200; // 2%
        uint256 feeAmount = CPMMMath.calculateFee(amount, feeBps);
        assertEq(feeAmount, 20); // 2% of 1000
    }
    
    function testApplyFee() public {
        uint256 amount = 1000;
        uint256 feeBps = 200; // 2%
        (uint256 amountAfterFee, uint256 feeAmount) = CPMMMath.applyFee(amount, feeBps);
        
        assertEq(feeAmount, 20);
        assertEq(amountAfterFee, 980);
        assertEq(amountAfterFee + feeAmount, amount);
    }
    
    function testApplyFeeZeroFee() public {
        uint256 amount = 1000;
        uint256 feeBps = 0;
        (uint256 amountAfterFee, uint256 feeAmount) = CPMMMath.applyFee(amount, feeBps);
        
        assertEq(feeAmount, 0);
        assertEq(amountAfterFee, amount);
    }
    
    function testApplyFeeMaxFee() public {
        uint256 amount = 1000;
        uint256 feeBps = 10000; // 100%
        (uint256 amountAfterFee, uint256 feeAmount) = CPMMMath.applyFee(amount, feeBps);
        
        assertEq(feeAmount, amount);
        assertEq(amountAfterFee, 0);
    }
    
    function testCPMMInvariant() public {
        uint256 reserveA = 1000 * 10**6;
        uint256 reserveB = 1000 * 10**6;
        uint256 amountIn = 100 * 10**6;
        
        // Get initial constant product
        uint256 kInitial = CPMMMath.getConstantProduct(reserveA, reserveB);
        
        // Simulate buy A with B
        (uint256 amountOut,) = CPMMMath.quoteBuy(reserveA, reserveB, amountIn);
        
        uint256 newReserveA = reserveA + amountIn;
        uint256 newReserveB = reserveB - amountOut;
        uint256 kNew = CPMMMath.getConstantProduct(newReserveA, newReserveB);
        
        // Constant product should be maintained (within rounding)
        assertApproxEqRel(kNew, kInitial, 1e15); // 0.1% tolerance
    }
    
    function testPriceIncreasesWithSkew() public {
        uint256 reserveA = 1000 * 10**6;
        uint256 reserveB = 1000 * 10**6;
        uint256 amountIn = 100 * 10**6;
        
        // First trade
        (uint256 amountOut1, uint256 price1) = CPMMMath.quoteBuy(reserveA, reserveB, amountIn);
        
        // Second trade (after first trade skews the pool)
        uint256 newReserveA = reserveA + amountIn;
        uint256 newReserveB = reserveB - amountOut1;
        (uint256 amountOut2, uint256 price2) = CPMMMath.quoteBuy(newReserveA, newReserveB, amountIn);
        
        // Price should increase as pool becomes more skewed
        assertGt(price2, price1);
        // Amount out should decrease as pool becomes more skewed
        assertLt(amountOut2, amountOut1);
    }
}
