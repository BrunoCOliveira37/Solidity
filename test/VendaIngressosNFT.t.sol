// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "../src/VendaIngressosNFT.sol";

contract VendaIngressosNFTTest is Test {
    VendaIngressosNFT public contrato;
    address public organizador;
    address public comprador;

    function setUp() public {
        organizador = address(this);
        comprador = address(2);

        vm.prank(organizador);
        contrato = new VendaIngressosNFT();
    }

    function testCriarEventoAberto() public {
        vm.prank(organizador);
        contrato.criarEvento("Intermed", 1 ether, 100, VendaIngressosNFT.TipoVenda.Aberta);

        (
            string memory nome,
            address dono,
            uint preco,
            uint total,
            uint vendidos,
            VendaIngressosNFT.TipoVenda tipoVenda
        ) = contrato.obterDadosEvento(1);

        assertEq(nome, "Intermed");
        assertEq(dono, organizador);
        assertEq(preco, 1 ether);
        assertEq(total, 100);
        assertEq(vendidos, 0);
        assertEq(uint(tipoVenda), uint(VendaIngressosNFT.TipoVenda.Aberta));
    }

    function testComprarIngressoAberto() public {
        vm.prank(organizador);
        contrato.criarEvento("Intermed", 1 ether, 100, VendaIngressosNFT.TipoVenda.Aberta);

        vm.deal(comprador, 2 ether);
        vm.prank(comprador);
        contrato.comprarIngresso{value: 1 ether}(1, "ipfs://ingresso1");

        assertEq(contrato.balanceOf(comprador), 1);
        assertEq(contrato.tokenURI(1), "ipfs://ingresso1");
    }

    function testComprarIngressoPorConvite() public {
        vm.prank(organizador);
        contrato.criarEvento("Privado", 0.5 ether, 10, VendaIngressosNFT.TipoVenda.PorConvite);

        vm.prank(organizador);
        contrato.adicionarConvidado(1, comprador);

        vm.deal(comprador, 1 ether);
        vm.prank(comprador);
        contrato.comprarIngresso{value: 0.5 ether}(1, "ipfs://vip1");

        assertEq(contrato.balanceOf(comprador), 1);
        assertEq(contrato.tokenURI(1), "ipfs://vip1");
    }

    function testNaoPodeComprarSemConvite() public {
        vm.prank(organizador);
        contrato.criarEvento("Privado", 1 ether, 10, VendaIngressosNFT.TipoVenda.PorConvite);

        vm.deal(comprador, 1 ether);
        vm.prank(comprador);
        vm.expectRevert("Voce nao esta na lista de convidados");
        contrato.comprarIngresso{value: 1 ether}(1, "ipfs://naoautorizado");
    }

    function testSacarFundos() public {
        vm.prank(organizador);
        contrato.criarEvento("Pago", 1 ether, 1, VendaIngressosNFT.TipoVenda.Aberta);

        vm.deal(comprador, 1 ether);
        vm.prank(comprador);
        contrato.comprarIngresso{value: 1 ether}(1, "ipfs://ticket");

        // Simula conta receptora com contrato para receber ETH
        address payable receiver = payable(address(this));
        vm.prank(organizador);
        contrato.sacarFundos(1);

        // Confirma que o saldo do contrato foi zerado
        assertEq(address(contrato).balance, 0);
    }
    receive() external payable {}
}
