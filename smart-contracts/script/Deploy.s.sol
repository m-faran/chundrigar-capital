// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {GlobalWhitelist} from "../src/GlobalWhitelist.sol";
import {Treasury} from "../src/Treasury.sol";
import {CompliantToken} from "../src/CompliantToken.sol";
import {KSE100Data} from "./KSE100Data.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        
        // The backend's public address (defaults to deployer if not set)
        address backendSigner = vm.envOr("BACKEND_SIGNER_ADDRESS", deployerAddress);
        // A test wallet to whitelist and fund (defaults to deployer if not set)
        address testUser = vm.envOr("TEST_USER_ADDRESS", deployerAddress);
        // Optional existing Treasury address (if core contracts already deployed)
        address existingTreasury = vm.envOr("TREASURY_ADDRESS", address(0));

        vm.startBroadcast(deployerPrivateKey);

        Treasury treasury;
        GlobalWhitelist whitelist;
        CompliantToken spkr;

        if (existingTreasury != address(0)) {
            treasury = Treasury(existingTreasury);
            console.log("Using existing Treasury at:", address(treasury));
        } else {
            // 1. Deploy GlobalWhitelist
            whitelist = new GlobalWhitelist(deployerAddress);
            whitelist.setWhitelist(testUser, true);
            
            // 2. Deploy Storm PKR (SPKR)
            spkr = new CompliantToken("Storm PKR", "SPKR", 18, address(whitelist), deployerAddress);
            spkr.mint(testUser, 500000 * 1e18); // 500,000 SPKR

            // 3. Deploy Treasury
            treasury = new Treasury(
                backendSigner,
                address(whitelist),
                deployerAddress, // feeReceiver
                deployerAddress  // initialOwner
            );

            whitelist.setWhitelist(address(treasury), true);
            whitelist.setWhitelist(deployerAddress, true);
        }

        // 4. Deploy all 100 KSE-100 Stock Tokens in 20 Batches (5 tokens each, ~10.4M gas/batch)
        for (uint256 b = 0; b < KSE100Data.TOTAL_BATCHES; b++) {
            (string[] memory names, string[] memory symbols) = KSE100Data.getBatch(b);
            treasury.deployTokensBatch(names, symbols);
            console.log("Deployed KSE-100 Batch", b + 1, "of 20 (5 tokens)");
        }
        
        vm.stopBroadcast();

        console.log("-----------------------------------------");
        if (existingTreasury == address(0)) {
            console.log("GlobalWhitelist deployed at:", address(whitelist));
            console.log("Storm PKR (SPKR) deployed at:", address(spkr));
        }
        console.log("Treasury address:", address(treasury));
        console.log("Backend Signer Address:", backendSigner);
        console.log("100 KSE-100 stock tokens deployed in 20 batches of 5 tokens");
        console.log("-----------------------------------------");
    }
}
