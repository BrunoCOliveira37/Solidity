// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {IngressoToken} from "../src/VendaIngressosNFT.sol";
import {IngressoNFT} from "../src/VendaIngressosNFT.sol";
import {VendaIngressos} from "../src/VendaIngressosNFT.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        IngressoToken token = new IngressoToken();
        IngressoNFT nft = new IngressoNFT();
        VendaIngressos venda = new VendaIngressos(address(token), address(nft));
        address metamask = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266; // ⬅️ Substitua aqui!
        token.transfer(metamask, 1000 ether); // transfere 1000 ING
        nft.transferOwnership(address(venda));

        console.log("Token address:", address(token));
        console.log("NFT address:", address(nft));
        console.log("VendaIngressos address:", address(venda));

        vm.stopBroadcast();
    }
}
