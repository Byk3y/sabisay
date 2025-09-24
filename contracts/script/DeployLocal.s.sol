// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {MockUSDC} from "../src/mocks/MockUSDC.sol";

/**
 * @title DeployLocal
 * @dev Deployment script for local Anvil chain
 */
contract DeployLocal is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with the account:", deployer);
        console.log("Account balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy MockUSDC
        MockUSDC mockUSDC = new MockUSDC();
        
        console.log("MockUSDC deployed at:", address(mockUSDC));
        console.log("Deployer address:", deployer);
        console.log("MockUSDC name:", mockUSDC.name());
        console.log("MockUSDC symbol:", mockUSDC.symbol());
        console.log("MockUSDC decimals:", mockUSDC.decimals());
        console.log("MockUSDC total supply:", mockUSDC.totalSupply());
        console.log("Deployer mUSDC balance:", mockUSDC.balanceOf(deployer));
        
        vm.stopBroadcast();
    }
}
