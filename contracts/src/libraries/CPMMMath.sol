// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CPMMMath
 * @dev Constant Product Market Maker math library
 * @notice Pure functions for calculating trades in a 2-outcome prediction market
 * 
 * Formula: x * y = k (constant product)
 * - x = reserve of outcome A
 * - y = reserve of outcome B  
 * - k = constant product
 * 
 * For buying A with B: new_x = x + amount_in, new_y = y - amount_out
 * Solving: (x + amount_in) * (y - amount_out) = x * y
 * amount_out = (y * amount_in) / (x + amount_in)
 * 
 * For selling A for B: new_x = x - amount_in, new_y = y + amount_out
 * Solving: (x - amount_in) * (y + amount_out) = x * y
 * amount_out = (y * amount_in) / (x - amount_in)
 */
library CPMMMath {
    error InvalidInput();
    error InsufficientLiquidity();
    error DivisionByZero();
    error Overflow();

    // Maximum safe value to prevent overflow in multiplications
    // sqrt(type(uint256).max) ≈ 2^128 to ensure a * b doesn't overflow
    uint256 private constant MAX_RESERVE = type(uint128).max;
    
    /**
     * @dev Calculate output amount when buying shares with USDC
     * @param reserveIn Reserve of input token (USDC)
     * @param reserveOut Reserve of output token (shares)
     * @param amountIn Amount of input token
     * @return amountOut Amount of output token
     * @return price Price per share (in USDC, 18 decimals)
     */
    function quoteBuy(
        uint256 reserveIn,
        uint256 reserveOut,
        uint256 amountIn
    ) internal pure returns (uint256 amountOut, uint256 price) {
        if (amountIn == 0) return (0, 0);
        if (reserveIn == 0 || reserveOut == 0) revert InsufficientLiquidity();

        // Check for potential overflow in multiplication
        if (reserveOut > MAX_RESERVE || amountIn > MAX_RESERVE) revert Overflow();

        // amountOut = (reserveOut * amountIn) / (reserveIn + amountIn)
        amountOut = (reserveOut * amountIn) / (reserveIn + amountIn);
        
        // price = amountIn / amountOut (in USDC per share, 18 decimals)
        if (amountOut == 0) revert DivisionByZero();
        price = (amountIn * 1e18) / amountOut;
    }
    
    /**
     * @dev Calculate output amount when selling shares for USDC
     * @param reserveIn Reserve of input token (shares)
     * @param reserveOut Reserve of output token (USDC)
     * @param amountIn Amount of input token
     * @return amountOut Amount of output token
     * @return price Price per share (in USDC, 18 decimals)
     */
    function quoteSell(
        uint256 reserveIn,
        uint256 reserveOut,
        uint256 amountIn
    ) internal pure returns (uint256 amountOut, uint256 price) {
        if (amountIn == 0) return (0, 0);
        if (reserveIn == 0 || reserveOut == 0) revert InsufficientLiquidity();
        if (amountIn >= reserveIn) revert InvalidInput();

        // Check for potential overflow in multiplication
        if (reserveOut > MAX_RESERVE || amountIn > MAX_RESERVE) revert Overflow();

        // amountOut = (reserveOut * amountIn) / (reserveIn - amountIn)
        amountOut = (reserveOut * amountIn) / (reserveIn - amountIn);
        
        // price = amountOut / amountIn (in USDC per share, 18 decimals)
        price = (amountOut * 1e18) / amountIn;
    }
    
    /**
     * @dev Calculate the constant product k = x * y
     * @param reserveA Reserve of token A
     * @param reserveB Reserve of token B
     * @return k Constant product
     */
    function getConstantProduct(
        uint256 reserveA,
        uint256 reserveB
    ) internal pure returns (uint256 k) {
        // Check for potential overflow in multiplication
        if (reserveA > MAX_RESERVE || reserveB > MAX_RESERVE) revert Overflow();

        k = reserveA * reserveB;

        // Verify the multiplication didn't overflow (redundant with 0.8+ but explicit)
        if (reserveA != 0 && k / reserveA != reserveB) revert Overflow();
    }
    
    /**
     * @dev Calculate current odds for outcome A (in basis points)
     * @param reserveA Reserve of outcome A
     * @param reserveB Reserve of outcome B
     * @return oddsA Odds of outcome A in basis points (0-10000)
     */
    function getOdds(
        uint256 reserveA,
        uint256 reserveB
    ) internal pure returns (uint256 oddsA) {
        uint256 totalReserves = reserveA + reserveB;
        if (totalReserves == 0) return 5000; // 50% if no liquidity
        
        // oddsA = (reserveB / totalReserves) * 10000
        oddsA = (reserveB * 10000) / totalReserves;
    }
    
    /**
     * @dev Calculate fee amount
     * @param amount Input amount
     * @param feeBps Fee in basis points
     * @return feeAmount Fee amount
     */
    function calculateFee(
        uint256 amount,
        uint256 feeBps
    ) internal pure returns (uint256 feeAmount) {
        feeAmount = (amount * feeBps) / 10000;
    }
    
    /**
     * @dev Apply fee to amount
     * @param amount Input amount
     * @param feeBps Fee in basis points
     * @return amountAfterFee Amount after fee deduction
     * @return feeAmount Fee amount
     */
    function applyFee(
        uint256 amount,
        uint256 feeBps
    ) internal pure returns (uint256 amountAfterFee, uint256 feeAmount) {
        feeAmount = calculateFee(amount, feeBps);
        amountAfterFee = amount - feeAmount;
    }
}
