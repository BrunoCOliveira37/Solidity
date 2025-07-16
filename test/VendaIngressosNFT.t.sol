// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/VendaIngressosNFT.sol";

contract VendaIngressosTest is Test {
    IngressoToken token;
    IngressoNFT ingressoNFT;
    VendaIngressos venda;

    address dono = address(1);
    address comprador = address(2);
    address convidado = address(3);
    address naoConvidado = address(4);
    address novoDono = address(5);

    function setUp() public {
        vm.startPrank(dono);
        token = new IngressoToken();
        ingressoNFT = new IngressoNFT();
        venda = new VendaIngressos(address(token), address(ingressoNFT));
        ingressoNFT.transferOwnership(address(venda));

        // Agora as transferências funcionam corretamente, porque estão sendo feitas pelo dono
        token.transfer(comprador, 1000);
        token.transfer(convidado, 1000);
        token.transfer(naoConvidado, 1000);

        vm.stopPrank();
    }

    function testCriarEventoAberto() public {
        vm.prank(dono);
        venda.criarEvento(
            "Show Aberto", 100, 10, VendaIngressos.TipoVenda.Aberta, block.timestamp + 10 days, block.timestamp + 5 days
        );
    }

    function testCriarEventoFechado() public {
        vm.prank(dono);
        venda.criarEvento(
            "Show Fechado",
            100,
            10,
            VendaIngressos.TipoVenda.PorConvite,
            block.timestamp + 10 days,
            block.timestamp + 5 days
        );
    }

    function testComprarIngressoAberto() public {
        vm.prank(dono);
        venda.criarEvento(
            "Aberto", 100, 10, VendaIngressos.TipoVenda.Aberta, block.timestamp + 10 days, block.timestamp + 5 days
        );

        vm.startPrank(comprador);
        token.approve(address(venda), 100);
        venda.comprarIngresso(0);
        vm.stopPrank();
    }

    function testComprarIngressoFechadoSemConvite() public {
        vm.prank(dono);
        venda.criarEvento(
            "Fechado", 100, 10, VendaIngressos.TipoVenda.PorConvite, block.timestamp + 10 days, block.timestamp + 5 days
        );

        vm.startPrank(naoConvidado);
        token.approve(address(venda), 100);
        vm.expectRevert(); // espera falhar
        venda.comprarIngresso(0);
        vm.stopPrank();
    }

    function testComprarIngressoFechadoComConvite() public {
        vm.prank(dono);
        venda.criarEvento(
            "Fechado", 100, 10, VendaIngressos.TipoVenda.PorConvite, block.timestamp + 10 days, block.timestamp + 5 days
        );

        // 🔧 Adiciona essa linha para simular o organizador
        vm.prank(dono);
        venda.adicionarConvidado(0, convidado);

        vm.startPrank(convidado);
        token.approve(address(venda), 100);
        venda.comprarIngresso(0);
        vm.stopPrank();
    }

    function testRevenderIngresso() public {
        vm.prank(dono);
        venda.criarEvento(
            "Aberto", 100, 10, VendaIngressos.TipoVenda.Aberta, block.timestamp + 10 days, block.timestamp + 5 days
        );

        vm.startPrank(comprador);
        token.approve(address(venda), 100);
        venda.comprarIngresso(0);
        uint256 tokenId = venda.ingressosDoUsuario(comprador)[0];
        ingressoNFT.approve(address(venda), tokenId);
        venda.revenderIngresso(tokenId, novoDono);
        vm.stopPrank();

        assertEq(ingressoNFT.ownerOf(tokenId + 1), novoDono);
    }

    function testEventoPorTokenId() public {
        vm.prank(dono);
        venda.criarEvento(
            "Aberto", 100, 10, VendaIngressos.TipoVenda.Aberta, block.timestamp + 10 days, block.timestamp + 5 days
        );

        vm.startPrank(comprador);
        token.approve(address(venda), 100);
        venda.comprarIngresso(0);
        uint256 tokenId = venda.ingressosDoUsuario(comprador)[0];
        uint256 idEvento = venda.eventoPorTokenId(tokenId);
        assertEq(idEvento, 0);
        vm.stopPrank();
    }

    function testIngressosDoUsuario() public {
        vm.prank(dono);
        venda.criarEvento(
            "Aberto", 100, 10, VendaIngressos.TipoVenda.Aberta, block.timestamp + 10 days, block.timestamp + 5 days
        );

        vm.startPrank(comprador);
        token.approve(address(venda), 100);
        venda.comprarIngresso(0);
        uint256[] memory ingressos = venda.ingressosDoUsuario(comprador);
        assertEq(ingressos.length, 1);
        vm.stopPrank();
    }
}
