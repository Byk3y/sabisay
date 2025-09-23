// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {HelloWorld} from "../contracts/HelloWorld.sol";

contract DeployHelloWorld is Script {
    function run() external {
        // Note: without --broadcast this will only SIMULATE
        vm.startBroadcast();
        HelloWorld hw = new HelloWorld();
        console2.log("HelloWorld deployed to:", address(hw));
        vm.stopBroadcast();
    }
}
