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
    address public revendedor;

    function setUp() public {
        organizador = address(this);
        comprador = address(2);
        revendedor = address(3);

        contrato = new VendaIngressosNFT();
    }

    function testCriarEventoAberto() public {
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
        contrato.criarEvento("Intermed", 1 ether, 100, VendaIngressosNFT.TipoVenda.Aberta);

        vm.deal(comprador, 2 ether);
        vm.prank(comprador);
        contrato.comprarIngresso{value: 1 ether}(1, "ipfs://ingresso1");

        assertEq(contrato.balanceOf(comprador), 1);
        assertEq(contrato.tokenURI(1), "ipfs://ingresso1");
    }

    function testNaoCompraQuandoEsgotado() public {
    contrato.criarEvento("Esgotado", 1 ether, 1, VendaIngressosNFT.TipoVenda.Aberta);

    vm.deal(comprador, 2 ether);
    vm.prank(comprador);
    contrato.comprarIngresso{value: 1 ether}(1, "ipfs://1");

    address outroComprador = address(5);
    vm.deal(outroComprador, 1 ether);
    vm.prank(outroComprador);
    vm.expectRevert("Ingressos esgotados");
    contrato.comprarIngresso{value: 1 ether}(1, "ipfs://2");
}


    function testComprarIngressoPorConvite() public {
        contrato.criarEvento("Privado", 0.5 ether, 10, VendaIngressosNFT.TipoVenda.PorConvite);
        contrato.adicionarConvidado(1, comprador);

        vm.deal(comprador, 1 ether);
        vm.prank(comprador);
        contrato.comprarIngresso{value: 0.5 ether}(1, "ipfs://vip1");

        assertEq(contrato.balanceOf(comprador), 1);
        assertEq(contrato.tokenURI(1), "ipfs://vip1");
    }

    function testNaoPodeComprarSemConvite() public {
        contrato.criarEvento("Privado", 1 ether, 10, VendaIngressosNFT.TipoVenda.PorConvite);

        vm.deal(comprador, 1 ether);
        vm.prank(comprador);
        vm.expectRevert("Voce nao esta na lista de convidados");
        contrato.comprarIngresso{value: 1 ether}(1, "ipfs://naoautorizado");
    }

    function testRevenderIngresso() public {
        contrato.criarEvento("Revenda", 1 ether, 10, VendaIngressosNFT.TipoVenda.Aberta);

        vm.deal(comprador, 1 ether);
        vm.prank(comprador);
        contrato.comprarIngresso{value: 1 ether}(1, "ipfs://revenda");

        vm.prank(comprador);
        contrato.revenderIngresso(1, revendedor);

        assertEq(contrato.ownerOf(1), revendedor);
    }

    function testRepassarIngressosParaRevendedor() public {
        contrato.criarEvento("Lote", 1 ether, 100, VendaIngressosNFT.TipoVenda.Aberta);
        contrato.repassarIngressos(1, revendedor, 10);

        (, , , , uint vendidos, ) = contrato.obterDadosEvento(1);
        assertEq(vendidos, 10);
    }

    function testRevendedorEmiteIngresso() public {
        contrato.criarEvento("RevendaDireta", 1 ether, 10, VendaIngressosNFT.TipoVenda.Aberta);
        contrato.repassarIngressos(1, revendedor, 3);

        vm.prank(revendedor);
        contrato.venderComoRevendedor(1, "ipfs://revendido1");

        assertEq(contrato.balanceOf(revendedor), 1);
        assertEq(contrato.tokenURI(1), "ipfs://revendido1");
    }

    function testUsuarioNaoPodeRevenderSemRepassar() public {
    contrato.criarEvento("Protegido", 1 ether, 1, VendaIngressosNFT.TipoVenda.Aberta);

    vm.prank(comprador);
    vm.expectRevert("Sem ingressos disponiveis para revenda");
    contrato.venderComoRevendedor(1, "ipfs://semAutorizacao");
}


    function testRevendedorLimite() public {
    contrato.criarEvento("Limite", 1 ether, 2, VendaIngressosNFT.TipoVenda.Aberta);
    contrato.repassarIngressos(1, revendedor, 1);

    vm.prank(revendedor);
    contrato.venderComoRevendedor(1, "ipfs://ok");

    vm.prank(revendedor);
    vm.expectRevert("Sem ingressos disponiveis para revenda");
    contrato.venderComoRevendedor(1, "ipfs://excesso");
}


    function testSacarFundos() public {
        contrato.criarEvento("Pago", 1 ether, 1, VendaIngressosNFT.TipoVenda.Aberta);

        vm.deal(comprador, 1 ether);
        vm.prank(comprador);
        contrato.comprarIngresso{value: 1 ether}(1, "ipfs://ticket");

        uint saldoAntes = address(this).balance;

        contrato.sacarFundos(1);

        uint saldoDepois = address(this).balance;
        assertGt(saldoDepois, saldoAntes);
    }

    receive() external payable {}
}
