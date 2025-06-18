// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/VendaIngressosNFT.sol";

contract DeployScript is Script {
    function run() external {
        // Obtém a chave privada da variável de ambiente para segurança
        uint256 privateKey = vm.envUint("PRIVATE_KEY");

        // Inicia a broadcast com a chave
        vm.startBroadcast(privateKey);

        // Deploy do contrato
        VendaIngressosNFT contrato = new VendaIngressosNFT();

        // Exibe o endereço do contrato no terminal
        console.log("Contrato VendaIngressosNFT deployado em:", address(contrato));

        vm.stopBroadcast();
    }
}
