// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/FairDrop.sol";

/// @notice Deploys FairDrop. Set PROTOCOL_TREASURY in your .env, or it defaults to the deployer.
///
/// Usage (see TODO.md for the full walkthrough):
///
///   forge script script/Deploy.s.sol --rpc-url $MONAD_TESTNET_RPC --broadcast --account monad-deployer
///
contract DeployScript is Script {
    function run() external returns (FairDrop) {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0));
        address treasury = vm.envOr("PROTOCOL_TREASURY", msg.sender);

        if (deployerPrivateKey != 0) {
            vm.startBroadcast(deployerPrivateKey);
        } else {
            vm.startBroadcast(); // uses --account keystore instead
        }

        FairDrop fairDrop = new FairDrop(treasury);

        vm.stopBroadcast();

        console.log("FairDrop deployed at:", address(fairDrop));
        console.log("Protocol treasury:", treasury);

        return fairDrop;
    }
}
