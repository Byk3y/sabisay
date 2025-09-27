// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HelloWorld
 * @dev Simple contract for testing deployment
 */
contract HelloWorld {
    string public message;
    
    constructor() {
        message = "Hello, PakoMarket!";
    }
    
    function setMessage(string memory _message) external {
        message = _message;
    }
    
    function getMessage() external view returns (string memory) {
        return message;
    }
}