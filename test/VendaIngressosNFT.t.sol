// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/VendaIngressosNFT.sol";

contract VendaIngressosNFTTest is Test {
    VendaIngressosNFT public contrato;
    address organizador = address(0xABCD);
    address comprador = address(0x1234);
    address revendedor = address(0x5678);

    function setUp() public {
        vm.prank(organizador);
        contrato = new VendaIngressosNFT();
    }

    function testCriarEventoAberto() public {
        vm.prank(organizador);
        contrato.criarEvento("Show Rock", 10000, 10, 0, block.timestamp + 10 days, block.timestamp + 5 days);

        (string memory nome,, uint256 preco,, uint256 vendidos, VendaIngressosNFT.TipoVenda tipo) = contrato.obterDadosEvento(1);
        assertEq(nome, "Show Rock");
        assertEq(preco, 10000);
        assertEq(vendidos, 0);
        assertEq(uint(tipo), 0);
    }

    function testAdicionarConvidado() public {
        vm.prank(organizador);
        contrato.criarEvento("Festa Privada", 20000, 5, 1, block.timestamp + 10 days, block.timestamp + 5 days);

        vm.prank(organizador);
        contrato.adicionarConvidado(1, comprador);

        assertTrue(contrato.estaConvidado(1, comprador));
    }

    function testComprarIngressoAberto() public {
        vm.prank(organizador);
        contrato.criarEvento("Show Pop", 30000, 5, 0, block.timestamp + 10 days, block.timestamp + 5 days);

        vm.deal(comprador, 1 ether);
        vm.prank(comprador);
        contrato.comprarIngresso{value: 30000}(1);

        assertEq(contrato.ownerOf(1), comprador);
    }

    function testComprarIngressoPrivadoSemConviteFalha() public {
        vm.prank(organizador);
        contrato.criarEvento("Evento VIP", 30000, 5, 1, block.timestamp + 10 days, block.timestamp + 5 days);

        vm.deal(comprador, 1 ether);
        vm.prank(comprador);
        vm.expectRevert();
        contrato.comprarIngresso{value: 30000}(1);
    }

    function testComprarIngressoPrivadoComConviteSucesso() public {
        vm.prank(organizador);
        contrato.criarEvento("Evento VIP", 30000, 5, 1, block.timestamp + 10 days, block.timestamp + 5 days);

        vm.prank(organizador);
        contrato.adicionarConvidado(1, comprador);

        vm.deal(comprador, 1 ether);
        vm.prank(comprador);
        contrato.comprarIngresso{value: 30000}(1);

        assertEq(contrato.ownerOf(1), comprador);
    }

    function testRepassarIngressosParaRevendedor() public {
        vm.prank(organizador);
        contrato.criarEvento("Festival", 40000, 20, 0, block.timestamp + 10 days, block.timestamp + 5 days);

        vm.prank(organizador);
        contrato.repassarIngressos(1, revendedor, 10);

        // Não é possível testar mapping diretamente; testamos via revenda
        vm.prank(revendedor);
        contrato.venderComoRevendedor(1);
        assertEq(contrato.ownerOf(1), revendedor);
    }

    function testRevendaIngresso() public {
        vm.prank(organizador);
        contrato.criarEvento("Show", 10000, 5, 0, block.timestamp + 10 days, block.timestamp + 5 days);

        vm.deal(comprador, 1 ether);
        vm.prank(comprador);
        contrato.comprarIngresso{value: 10000}(1);

        vm.prank(comprador);
        contrato.revenderIngresso(1, revendedor);
        assertEq(contrato.ownerOf(1), revendedor);
    }

    function testSacarFundos() public {
        vm.prank(organizador);
        contrato.criarEvento("Arrecadacao", 50000, 5, 0, block.timestamp + 10 days, block.timestamp + 5 days);

        vm.deal(comprador, 1 ether);
        vm.prank(comprador);
        contrato.comprarIngresso{value: 50000}(1);

        uint256 saldoAntes = organizador.balance;
        vm.prank(organizador);
        contrato.sacarFundos(1);
        uint256 saldoDepois = organizador.balance;
        assertGt(saldoDepois, saldoAntes);
    }

    function testDataEncerramentoImpedeCompra() public {
        vm.prank(organizador);
        contrato.criarEvento("Fechado", 10000, 5, 0, block.timestamp + 10 days, block.timestamp - 1, true);

        vm.deal(comprador, 1 ether);
        vm.prank(comprador);
        vm.expectRevert("Vendas encerradas");
        contrato.comprarIngresso{value: 10000}(1);
    }
}
