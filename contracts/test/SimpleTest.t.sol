// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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

contract SimpleTest is Test {
    function testSimple() public {
        // Deploy mock USDC
        MockUSDC usdc = new MockUSDC();
        
        // Deploy factory
        MarketFactory factory = new MarketFactory(address(usdc));
        
        // Check that factory was created
        assertEq(factory.usdcToken(), address(usdc));
        assertEq(factory.marketCount(), 0);
        
        console.log("Factory created successfully");
    }
}
