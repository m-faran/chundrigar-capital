// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IGlobalWhitelist {
    function isWhitelisted(address account) external view returns (bool);
}

/**
 * @title GlobalWhitelist
 * @notice Central Hub for KYC compliance. All tokens query this single source of truth.
 */
contract GlobalWhitelist is IGlobalWhitelist, Ownable {
    mapping(address => bool) public isWhitelisted;

    event WhitelistUpdated(address indexed account, bool status);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setWhitelist(address account, bool status) external onlyOwner {
        isWhitelisted[account] = status;
        emit WhitelistUpdated(account, status);
    }

    function setWhitelistBatch(address[] calldata accounts, bool status) external onlyOwner {
        require(accounts.length <= 100, "Batch too large");
        for (uint256 i = 0; i < accounts.length; i++) {
            isWhitelisted[accounts[i]] = status;
            emit WhitelistUpdated(accounts[i], status);
        }
    }
}
