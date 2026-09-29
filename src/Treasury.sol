// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {CompliantToken} from "./CompliantToken.sol";

/**
 * @title Treasury
 * @notice Acts as a Token Factory and the Pull Oracle trading venue.
 */
contract Treasury is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    address public signer;
    address public whitelist;

    uint256 public feeBps = 50; // 0.5% (1 bp = 0.01%)
    address public feeReceiver;

    mapping(address => bool) public isPSXToken;
    mapping(address => uint256) public nonces;

    event TokenDeployed(address indexed token, string symbol);
    event Trade(
        address indexed user,
        address indexed token,
        address paymentToken,
        uint256 amount,
        uint256 paymentAmount,
        bool isBuy,
        uint256 fee
    );

    constructor(address _signer, address _whitelist, address _feeReceiver, address initialOwner) Ownable(initialOwner) {
        signer = _signer;
        whitelist = _whitelist;
        feeReceiver = _feeReceiver;
    }

    /**
     * @notice Deploys a new PSX Token. Treasury retains MINTER_ROLE.
     */
    function deployToken(string memory name, string memory symbol) external onlyOwner returns (address) {
        // Deploy with 18 decimals
        CompliantToken newToken = new CompliantToken(name, symbol, 18, whitelist, owner());

        // Grant Treasury the MINTER_ROLE (which also handles burns for sales)
        newToken.grantRole(newToken.MINTER_ROLE(), address(this));

        isPSXToken[address(newToken)] = true;
        emit TokenDeployed(address(newToken), symbol);
        return address(newToken);
    }

    function setSigner(address _signer) external onlyOwner {
        signer = _signer;
    }

    function setFee(uint256 _feeBps, address _feeReceiver) external onlyOwner {
        require(_feeBps <= 1000, "Fee too high"); // max 10%
        feeBps = _feeBps;
        feeReceiver = _feeReceiver;
    }

    /**
     * @notice Buy PSX Tokens by providing a backend signature quoting a price.
     */
    function buy(
        address token,
        address paymentToken,
        uint256 amount,
        uint256 paymentAmount,
        uint256 deadline,
        uint256 nonce,
        bytes calldata signature
    ) external nonReentrant {
        require(isPSXToken[token], "Not a valid PSX token");
        require(paymentToken != address(0), "Invalid payment token");
        require(amount > 0, "Amount must be > 0");
        require(paymentAmount > 0, "Payment amount must be > 0");
        require(block.timestamp <= deadline, "Quote expired");
        require(nonce == nonces[msg.sender], "Invalid nonce");

        // Verify signature (ethSignedMessageHash)
        bytes32 messageHash =
            keccak256(abi.encodePacked("BUY", token, paymentToken, amount, paymentAmount, deadline, nonce, msg.sender));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        require(ethSignedMessageHash.recover(signature) == signer, "Invalid signature");

        nonces[msg.sender]++;

        // The backend calculates the exact gross cost in paymentToken decimals
        uint256 fee = (paymentAmount * feeBps) / 10000;
        uint256 totalCost = paymentAmount + fee;

        // Pull payment via SafeERC20
        IERC20(paymentToken).safeTransferFrom(msg.sender, address(this), totalCost);
        if (fee > 0) {
            IERC20(paymentToken).safeTransfer(feeReceiver, fee);
        }

        // Mint PSX Token
        CompliantToken(token).mint(msg.sender, amount);

        emit Trade(msg.sender, token, paymentToken, amount, paymentAmount, true, fee);
    }

    /**
     * @notice Sell PSX Tokens by providing a backend signature quoting a price.
     */
    function sell(
        address token,
        address paymentToken,
        uint256 amount,
        uint256 paymentAmount,
        uint256 deadline,
        uint256 nonce,
        bytes calldata signature
    ) external nonReentrant {
        require(isPSXToken[token], "Not a valid PSX token");
        require(paymentToken != address(0), "Invalid payment token");
        require(amount > 0, "Amount must be > 0");
        require(paymentAmount > 0, "Payment amount must be > 0");
        require(block.timestamp <= deadline, "Quote expired");
        require(nonce == nonces[msg.sender], "Invalid nonce");

        // Verify signature
        bytes32 messageHash = keccak256(
            abi.encodePacked("SELL", token, paymentToken, amount, paymentAmount, deadline, nonce, msg.sender)
        );
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        require(ethSignedMessageHash.recover(signature) == signer, "Invalid signature");

        nonces[msg.sender]++;

        // The backend calculates the exact gross proceeds in paymentToken decimals
        uint256 fee = (paymentAmount * feeBps) / 10000;
        uint256 netProceeds = paymentAmount - fee;

        // Burn PSX Token from user (Treasury must have MINTER_ROLE to call this)
        CompliantToken(token).burn(msg.sender, amount);

        // Push payment via SafeERC20
        IERC20(paymentToken).safeTransfer(msg.sender, netProceeds);
        if (fee > 0) {
            IERC20(paymentToken).safeTransfer(feeReceiver, fee);
        }

        emit Trade(msg.sender, token, paymentToken, amount, paymentAmount, false, fee);
    }
}
