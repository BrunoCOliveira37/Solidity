// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

contract VendaIngressosNFT is ERC721URIStorage, Ownable {
    uint public proximoIdIngresso = 1;

    enum TipoVenda { Aberta, PorConvite }

    struct Evento {
        string nome;
        address organizador;
        uint preco;
        uint totalIngressos;
        uint vendidos;
        TipoVenda tipo;
        mapping(address => bool) convidados;
    }

    uint public proximoIdEvento = 1;
    mapping(uint => Evento) private eventos;
    mapping(uint => uint) public ingressoParaEvento;

    event EventoCriado(uint idEvento, string nome, address organizador);
    event IngressoComprado(uint idEvento, address comprador, uint tokenId);

    constructor() ERC721("IngressoNFT", "ING") Ownable(msg.sender) {}

    function criarEvento(
        string memory _nome,
        uint _preco,
        uint _totalIngressos,
        TipoVenda _tipo
    ) external {
        uint idEvento = proximoIdEvento;
        Evento storage novo = eventos[idEvento];
        novo.nome = _nome;
        novo.organizador = msg.sender;
        novo.preco = _preco;
        novo.totalIngressos = _totalIngressos;
        novo.tipo = _tipo;

        proximoIdEvento++;
        emit EventoCriado(idEvento, _nome, msg.sender);
    }

    function adicionarConvidado(uint _idEvento, address _convidado) external {
        Evento storage evento = eventos[_idEvento];
        require(msg.sender == evento.organizador, "Apenas o organizador pode convidar");
        evento.convidados[_convidado] = true;
    }

    function estaConvidado(uint _idEvento, address _usuario) public view returns (bool) {
        return eventos[_idEvento].convidados[_usuario];
    }

    function comprarIngresso(uint _idEvento, string memory tokenURI) external payable {
        Evento storage evento = eventos[_idEvento];

        require(evento.organizador != address(0), "Evento inexistente");
        require(evento.vendidos < evento.totalIngressos, "Ingressos esgotados");
        require(msg.value == evento.preco, "Valor incorreto");

        if (evento.tipo == TipoVenda.PorConvite) {
            require(evento.convidados[msg.sender], "Voce nao esta na lista de convidados");
        }

        uint tokenId = proximoIdIngresso;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        ingressoParaEvento[tokenId] = _idEvento;
        evento.vendidos++;
        proximoIdIngresso++;

        emit IngressoComprado(_idEvento, msg.sender, tokenId);
    }

    function sacarFundos(uint _idEvento) external {
        Evento storage evento = eventos[_idEvento];
        require(msg.sender == evento.organizador, "Apenas o organizador pode sacar");
        payable(evento.organizador).transfer(address(this).balance);
    }

    function obterDadosEvento(uint _idEvento) external view returns (
        string memory nome,
        address organizador,
        uint preco,
        uint totalIngressos,
        uint vendidos,
        TipoVenda tipo
    ) {
        Evento storage evento = eventos[_idEvento];
        return (
            evento.nome,
            evento.organizador,
            evento.preco,
            evento.totalIngressos,
            evento.vendidos,
            evento.tipo
        );
    }
}
