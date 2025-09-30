// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {MarketFactory} from "../src/MarketFactory.sol";

contract DeployMarketFactory is Script {
    function run() external {
        uint256 deployerPrivateKey = 0xbe1f77440a228147288a873141f1f59cb4f034b30b1b6e638e121f67bef7e8b8;
        address usdcToken = 0x2A68a9c1dEedc505B9221DE4Dcd060d1f76Fe66A; // MockUSDC
        address treasury = 0x9386edBEc76A2c540B965ce498FE7106Ed15d848; // Admin wallet
        
        vm.startBroadcast(deployerPrivateKey);
        
        MarketFactory factory = new MarketFactory(usdcToken, treasury);
        
        vm.stopBroadcast();
        
        console.log("MarketFactory deployed at:", address(factory));
        console.log("USDC Token:", usdcToken);
        console.log("Treasury:", treasury);
    }
}