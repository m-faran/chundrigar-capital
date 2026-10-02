// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {GlobalWhitelist} from "../src/GlobalWhitelist.sol";
import {Treasury} from "../src/Treasury.sol";
import {CompliantToken} from "../src/CompliantToken.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        
        // The backend's public address (defaults to deployer if not set)
        address backendSigner = vm.envOr("BACKEND_SIGNER_ADDRESS", deployerAddress);
        // A test wallet to whitelist and fund (defaults to deployer if not set)
        address testUser = vm.envOr("TEST_USER_ADDRESS", deployerAddress);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy GlobalWhitelist
        GlobalWhitelist whitelist = new GlobalWhitelist(deployerAddress);
        
        // Whitelist the test user
        whitelist.setWhitelist(testUser, true);
        
        // 2. Deploy Storm PKR (SPKR)
        CompliantToken spkr = new CompliantToken("Storm PKR", "SPKR", 18, address(whitelist), deployerAddress);
        
        // Mint some SPKR to the test user so they can test trades
        spkr.mint(testUser, 500000 * 1e18); // 500,000 SPKR

        // 3. Deploy Treasury
        Treasury treasury = new Treasury(
            backendSigner,
            address(whitelist),
            deployerAddress, // feeReceiver
            deployerAddress  // initialOwner
        );

        // Note: PSX tokens will now be deployed dynamically from the frontend by the admin.
        
        vm.stopBroadcast();

        console.log("GlobalWhitelist deployed at:", address(whitelist));
        console.log("Storm PKR (SPKR) deployed at:", address(spkr));
        console.log("Treasury deployed at:", address(treasury));
        console.log("Base Sepolia USDC Address:", vm.envOr("BASE_SEPOLIA_USDC", address(0)));
        console.log("Backend Signer Address:", backendSigner);
        console.log("Test User Address whitelisted & funded:", testUser);
    }
}
