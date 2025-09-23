// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/MarketFactory.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address usdcToken = vm.envAddress("USDC_TOKEN");
        address treasury = vm.envAddress("TREASURY_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy MarketFactory
        MarketFactory factory = new MarketFactory(usdcToken, treasury);

        console.log("MarketFactory deployed at:", address(factory));
        console.log("USDC Token:", usdcToken);
        console.log("Treasury:", treasury);

        vm.stopBroadcast();
    }
}
