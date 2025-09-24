// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/MarketFactory.sol";

contract DeployMarketFactory is Script {
    function run() external {
        // Load environment variables
        address usdcAddress = vm.envAddress("USDC_ADDRESS");
        address treasuryAddress = vm.envAddress("TREASURY_ADDRESS");
        
        console.log("Deploying MarketFactory with:");
        console.log("USDC Address:", usdcAddress);
        console.log("Treasury Address:", treasuryAddress);
        
        vm.startBroadcast();
        
        // Deploy MarketFactory
        MarketFactory factory = new MarketFactory(usdcAddress, treasuryAddress);
        
        console.log("MarketFactory deployed to:", address(factory));
        console.log("Gas used for deployment:", gasleft());
        
        vm.stopBroadcast();
    }
}

