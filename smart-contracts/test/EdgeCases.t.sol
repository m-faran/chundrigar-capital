// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Treasury} from "../src/Treasury.sol";
import {CompliantToken} from "../src/CompliantToken.sol";
import {GlobalWhitelist} from "../src/GlobalWhitelist.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract MockPaymentToken is ERC20 {
    constructor() ERC20("Mock USDC", "mUSDC") {
        _mint(msg.sender, 1_000_000 * 10**6);
    }
    function decimals() public pure override returns (uint8) {
        return 6;
    }
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract EdgeCasesTest is Test {
    Treasury treasury;
    GlobalWhitelist whitelist;
    MockPaymentToken paymentToken;
    CompliantToken psxToken;

    uint256 signerPrivateKey = 0x1234;
    address signer;
    address feeReceiver = address(0xfee);
    address user = address(0x111);
    address unwhitelistedUser = address(0x222);

    function setUp() public {
        signer = vm.addr(signerPrivateKey);
        
        whitelist = new GlobalWhitelist(address(this));
        paymentToken = new MockPaymentToken();
        
        treasury = new Treasury(signer, address(whitelist), feeReceiver, address(this));
        
        // Deploy a PSX token via Treasury
        address tokenAddr = treasury.deployToken("OGDC Stock", "OGDC");
        psxToken = CompliantToken(tokenAddr);

        // Whitelist user
        whitelist.setWhitelist(user, true);

        // Fund user
        paymentToken.mint(user, 10_000 * 10**6);
        vm.prank(user);
        paymentToken.approve(address(treasury), type(uint256).max);
    }

    function _signTrade(
        string memory action,
        address token,
        address payToken,
        uint256 amount,
        uint256 payAmount,
        uint256 deadline,
        uint256 nonce,
        address sender,
        uint256 pk
    ) internal pure returns (bytes memory) {
        bytes32 messageHash = keccak256(
            abi.encodePacked(action, token, payToken, amount, payAmount, deadline, nonce, sender)
        );
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(pk, ethSignedMessageHash);
        return abi.encodePacked(r, s, v);
    }

    // 1. Signer Edge Cases

    function test_RevertIf_SignatureIsInvalid() public {
        uint256 amount = 10 * 10**18;
        uint256 paymentAmount = 100 * 10**6;
        uint256 deadline = block.timestamp + 60;
        uint256 nonce = 0;

        // Sign with a different private key
        bytes memory sig = _signTrade("BUY", address(psxToken), address(paymentToken), amount, paymentAmount, deadline, nonce, user, 0x5678);

        vm.prank(user);
        vm.expectRevert("Invalid signature");
        treasury.buy(address(psxToken), address(paymentToken), amount, paymentAmount, deadline, nonce, sig);
    }

    function test_RevertIf_DeadlineExpired() public {
        uint256 amount = 10 * 10**18;
        uint256 paymentAmount = 100 * 10**6;
        uint256 deadline = block.timestamp - 1; // Expired
        uint256 nonce = 0;

        bytes memory sig = _signTrade("BUY", address(psxToken), address(paymentToken), amount, paymentAmount, deadline, nonce, user, signerPrivateKey);

        vm.prank(user);
        vm.expectRevert("Quote expired");
        treasury.buy(address(psxToken), address(paymentToken), amount, paymentAmount, deadline, nonce, sig);
    }

    function test_RevertIf_NonceReused() public {
        uint256 amount = 10 * 10**18;
        uint256 paymentAmount = 100 * 10**6;
        uint256 deadline = block.timestamp + 60;
        uint256 nonce = 0;

        bytes memory sig = _signTrade("BUY", address(psxToken), address(paymentToken), amount, paymentAmount, deadline, nonce, user, signerPrivateKey);

        vm.startPrank(user);
        treasury.buy(address(psxToken), address(paymentToken), amount, paymentAmount, deadline, nonce, sig);
        
        // Re-use same nonce
        vm.expectRevert("Invalid nonce");
        treasury.buy(address(psxToken), address(paymentToken), amount, paymentAmount, deadline, nonce, sig);
        vm.stopPrank();
    }

    function test_RevertIf_SellSignatureUsedForBuy() public {
        uint256 amount = 10 * 10**18;
        uint256 paymentAmount = 100 * 10**6;
        uint256 deadline = block.timestamp + 60;
        uint256 nonce = 0;

        // Action is SELL, but we try to call buy()
        bytes memory sig = _signTrade("SELL", address(psxToken), address(paymentToken), amount, paymentAmount, deadline, nonce, user, signerPrivateKey);

        vm.prank(user);
        vm.expectRevert("Invalid signature");
        treasury.buy(address(psxToken), address(paymentToken), amount, paymentAmount, deadline, nonce, sig);
    }

    function test_RevertIf_PaymentAmountIsZero() public {
        uint256 amount = 10 * 10**18;
        uint256 paymentAmount = 0;
        uint256 deadline = block.timestamp + 60;
        uint256 nonce = 0;

        bytes memory sig = _signTrade("BUY", address(psxToken), address(paymentToken), amount, paymentAmount, deadline, nonce, user, signerPrivateKey);

        vm.prank(user);
        vm.expectRevert("Payment amount must be > 0");
        treasury.buy(address(psxToken), address(paymentToken), amount, paymentAmount, deadline, nonce, sig);
    }

    // 2. Compliance Edge Cases
    
    function test_RevertIf_UserNotWhitelisted() public {
        uint256 amount = 10 * 10**18;
        uint256 paymentAmount = 100 * 10**6;
        uint256 deadline = block.timestamp + 60;
        uint256 nonce = 0;

        // unwhitelistedUser is not in the whitelist
        paymentToken.mint(unwhitelistedUser, 10_000 * 10**6);
        vm.prank(unwhitelistedUser);
        paymentToken.approve(address(treasury), type(uint256).max);

        bytes memory sig = _signTrade("BUY", address(psxToken), address(paymentToken), amount, paymentAmount, deadline, nonce, unwhitelistedUser, signerPrivateKey);

        vm.prank(unwhitelistedUser);
        vm.expectRevert("Receiver not whitelisted");
        treasury.buy(address(psxToken), address(paymentToken), amount, paymentAmount, deadline, nonce, sig);
    }

    function test_RevertIf_TransferToUnwhitelisted() public {
        // First buy some tokens
        uint256 amount = 10 * 10**18;
        uint256 paymentAmount = 100 * 10**6;
        uint256 deadline = block.timestamp + 60;
        uint256 nonce = 0;

        bytes memory sig = _signTrade("BUY", address(psxToken), address(paymentToken), amount, paymentAmount, deadline, nonce, user, signerPrivateKey);

        vm.prank(user);
        treasury.buy(address(psxToken), address(paymentToken), amount, paymentAmount, deadline, nonce, sig);

        // Try to transfer to unwhitelistedUser
        vm.prank(user);
        vm.expectRevert("Receiver not whitelisted");
        psxToken.transfer(unwhitelistedUser, amount);
    }

    function test_RevertIf_TransferMoreThanUnfrozen() public {
        // Buy tokens
        uint256 amount = 10 * 10**18;
        uint256 paymentAmount = 100 * 10**6;
        bytes memory sig = _signTrade("BUY", address(psxToken), address(paymentToken), amount, paymentAmount, block.timestamp + 60, 0, user, signerPrivateKey);
        vm.prank(user);
        treasury.buy(address(psxToken), address(paymentToken), amount, paymentAmount, block.timestamp + 60, 0, sig);

        // Freeze 5 tokens
        psxToken.freeze(user, 5 * 10**18);

        // Whitelist another user to receive
        address user2 = address(0x333);
        whitelist.setWhitelist(user2, true);

        // Try to transfer 6 tokens (should fail because only 5 are unfrozen)
        vm.prank(user);
        vm.expectRevert("Amount exceeds available unfrozen balance");
        psxToken.transfer(user2, 6 * 10**18);
    }

    function test_ForceTransferBypassesWhitelistAndFreeze() public {
        // Buy tokens
        uint256 amount = 10 * 10**18;
        uint256 paymentAmount = 100 * 10**6;
        bytes memory sig = _signTrade("BUY", address(psxToken), address(paymentToken), amount, paymentAmount, block.timestamp + 60, 0, user, signerPrivateKey);
        vm.prank(user);
        treasury.buy(address(psxToken), address(paymentToken), amount, paymentAmount, block.timestamp + 60, 0, sig);

        // Freeze all tokens
        psxToken.freeze(user, amount);

        // Admin forces transfer to an unwhitelisted user
        psxToken.forceTransfer(user, unwhitelistedUser, amount);
        
        assertEq(psxToken.balanceOf(unwhitelistedUser), amount);
        assertEq(psxToken.balanceOf(user), 0);
    }

    // 3. Fee Calculation Edge Cases

    function test_ZeroFeeForSmallPaymentTruncation() public {
        uint256 amount = 1 * 10**18;
        // fee is paymentAmount * 50 / 10000. If paymentAmount < 200, fee is 0.
        uint256 paymentAmount = 199;
        bytes memory sig = _signTrade("BUY", address(psxToken), address(paymentToken), amount, paymentAmount, block.timestamp + 60, 0, user, signerPrivateKey);

        uint256 feeReceiverBalBefore = paymentToken.balanceOf(feeReceiver);
        
        vm.prank(user);
        treasury.buy(address(psxToken), address(paymentToken), amount, paymentAmount, block.timestamp + 60, 0, sig);

        uint256 feeReceiverBalAfter = paymentToken.balanceOf(feeReceiver);
        assertEq(feeReceiverBalAfter - feeReceiverBalBefore, 0); // No fee collected due to truncation
    }

    function test_MaxFeeAllowed() public {
        treasury.setFee(1000, feeReceiver); // 10%
        
        uint256 amount = 1 * 10**18;
        uint256 paymentAmount = 100 * 10**6;
        bytes memory sig = _signTrade("BUY", address(psxToken), address(paymentToken), amount, paymentAmount, block.timestamp + 60, 0, user, signerPrivateKey);

        vm.prank(user);
        treasury.buy(address(psxToken), address(paymentToken), amount, paymentAmount, block.timestamp + 60, 0, sig);

        assertEq(paymentToken.balanceOf(feeReceiver), 10 * 10**6); // 10% of 100 = 10
    }

    function test_RevertIf_FeeTooHigh() public {
        vm.expectRevert("Fee too high");
        treasury.setFee(1001, feeReceiver);
    }

    // 4. Access Control Edge Cases

    function test_RevertIf_MintWithoutMinterRole() public {
        vm.prank(user);
        vm.expectRevert();
        psxToken.mint(user, 100);
    }

    function test_RevertIf_FreezeWithoutComplianceRole() public {
        vm.prank(user);
        vm.expectRevert();
        psxToken.freeze(user, 100);
    }
}
