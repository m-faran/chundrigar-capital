// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IGlobalWhitelist} from "./GlobalWhitelist.sol";

/**
 * @title CompliantToken
 * @notice Reusable Spoke contract used for both PKRStablecoin and PSX Stock Tokens.
 * Removes complex UUPS upgradeability while keeping RBAC, freezing, and force-transfers.
 */
contract CompliantToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");

    IGlobalWhitelist public whitelist;
    uint8 private immutable _decimals;
    mapping(address => uint256) public frozenBalances;

    // Transient flag to allow compliance admins to bypass checks during force actions
    bool private _isComplianceBypass;

    event Frozen(address indexed account, uint256 amount);
    event Unfrozen(address indexed account, uint256 amount);
    event ForceTransfer(address indexed from, address indexed to, uint256 amount);

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        address whitelistAddress,
        address defaultAdmin
    ) ERC20(name, symbol) {
        _decimals = decimals_;
        whitelist = IGlobalWhitelist(whitelistAddress);

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, defaultAdmin);
        _grantRole(COMPLIANCE_ROLE, defaultAdmin);
        
        // If the deployer (e.g. Treasury) is different from the admin, it also needs to mint.
        if (msg.sender != defaultAdmin) {
            _grantRole(MINTER_ROLE, msg.sender);
        }
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    // --- Mint / Burn ---
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /**
     * @notice Allows MINTER_ROLE to burn tokens directly from users.
     * Lazy optimization: Treasury doesn't need approval to process a sell order.
     */
    function burn(address from, uint256 amount) public onlyRole(MINTER_ROLE) {
        _burn(from, amount);
    }

    // --- Compliance ---
    function freeze(address account, uint256 amount) external onlyRole(COMPLIANCE_ROLE) {
        frozenBalances[account] += amount;
        emit Frozen(account, amount);
    }

    function unfreeze(address account, uint256 amount) external onlyRole(COMPLIANCE_ROLE) {
        require(frozenBalances[account] >= amount, "Amount exceeds frozen balance");
        frozenBalances[account] -= amount;
        emit Unfrozen(account, amount);
    }

    function forceTransfer(address from, address to, uint256 amount) external onlyRole(COMPLIANCE_ROLE) {
        _isComplianceBypass = true;
        _transfer(from, to, amount);
        _isComplianceBypass = false;
        emit ForceTransfer(from, to, amount);
    }

    function forceBurn(address from, uint256 amount) external onlyRole(COMPLIANCE_ROLE) {
        _isComplianceBypass = true;
        _burn(from, amount);
        _isComplianceBypass = false;
    }

    // --- Core Overrides ---
    function _update(address from, address to, uint256 value) internal override {
        if (!_isComplianceBypass) {
            // Check sender constraints
            if (from != address(0)) {
                require(whitelist.isWhitelisted(from), "Sender not whitelisted");
                require(balanceOf(from) - frozenBalances[from] >= value, "Amount exceeds available unfrozen balance");
            }
            // Check receiver constraints
            if (to != address(0)) {
                require(whitelist.isWhitelisted(to), "Receiver not whitelisted");
            }
        }
        super._update(from, to, value);
    }
}
