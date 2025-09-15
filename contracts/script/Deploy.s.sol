// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/MarketFactory.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address usdcToken = vm.envAddress("USDC_TOKEN");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy MarketFactory
        MarketFactory factory = new MarketFactory(usdcToken);
        
        console.log("MarketFactory deployed at:", address(factory));
        console.log("USDC Token:", usdcToken);
        
        vm.stopBroadcast();
    }
}
