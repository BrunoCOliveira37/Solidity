// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

contract VendaIngressosNFT is ERC721URIStorage, Ownable {
    uint256 public proximoIdIngresso = 1;

    enum TipoVenda {
        Aberta,
        PorConvite
    }

    struct Evento {
        string nome;
        address organizador;
        uint256 preco;
        uint256 totalIngressos;
        uint256 vendidos;
        TipoVenda tipo;
        mapping(address => bool) convidados;
        mapping(address => uint256) revendedores;
    }

    uint256 public proximoIdEvento = 1;
    mapping(uint256 => Evento) private eventos;
    mapping(uint256 => uint256) public ingressoParaEvento;
    mapping(uint256 => address) public donoOriginalIngresso;

    event EventoCriado(uint256 idEvento, string nome, address organizador);
    event IngressoComprado(uint256 idEvento, address comprador, uint256 tokenId);
    event IngressosRepasados(uint256 idEvento, address para, uint256 quantidade);
    event IngressoRevendido(uint256 tokenId, address de, address para);
    event TokenURIDefinido(uint256 tokenId, string novaURI);

    constructor() ERC721("IngressoNFT", "ING") Ownable(msg.sender) {}

    function criarEvento(string memory _nome, uint256 _preco, uint256 _totalIngressos, TipoVenda _tipo) external {
        uint256 idEvento = proximoIdEvento;
        Evento storage novo = eventos[idEvento];
        novo.nome = _nome;
        novo.organizador = msg.sender;
        novo.preco = _preco;
        novo.totalIngressos = _totalIngressos;
        novo.tipo = _tipo;

        proximoIdEvento++;
        emit EventoCriado(idEvento, _nome, msg.sender);
    }

    function adicionarConvidado(uint256 _idEvento, address _convidado) external {
        Evento storage evento = eventos[_idEvento];
        require(msg.sender == evento.organizador, "Apenas o organizador pode convidar");
        evento.convidados[_convidado] = true;
    }

    function estaConvidado(uint256 _idEvento, address _usuario) public view returns (bool) {
        return eventos[_idEvento].convidados[_usuario];
    }

    function comprarIngresso(uint256 _idEvento) external payable {
        Evento storage evento = eventos[_idEvento];

        require(evento.organizador != address(0), "Evento inexistente");
        require(evento.vendidos < evento.totalIngressos, "Ingressos esgotados");
        require(msg.value == evento.preco, "Valor incorreto");

        if (evento.tipo == TipoVenda.PorConvite) {
            require(evento.convidados[msg.sender], "Voce nao esta na lista de convidados");
        }

        uint256 tokenId = proximoIdIngresso;
        _safeMint(msg.sender, tokenId);

        ingressoParaEvento[tokenId] = _idEvento;
        donoOriginalIngresso[tokenId] = msg.sender;
        evento.vendidos++;
        proximoIdIngresso++;

        emit IngressoComprado(_idEvento, msg.sender, tokenId);
    }

    function definirTokenURI(uint256 tokenId, string memory novaURI) external {
        require(ownerOf(tokenId) == msg.sender || msg.sender == owner(), "Nao autorizado");
        _setTokenURI(tokenId, novaURI);
        emit TokenURIDefinido(tokenId, novaURI);
    }

    function revenderIngresso(uint256 tokenId, address para) external {
        require(ownerOf(tokenId) == msg.sender, "Voce nao possui este ingresso");
        _transfer(msg.sender, para, tokenId);
        emit IngressoRevendido(tokenId, msg.sender, para);
    }

    function repassarIngressos(uint256 _idEvento, address para, uint256 quantidade) external {
        Evento storage evento = eventos[_idEvento];
        require(msg.sender == evento.organizador, "Apenas o organizador pode repassar");
        require(evento.vendidos + quantidade <= evento.totalIngressos, "Nao ha ingressos suficientes");

        evento.revendedores[para] += quantidade;
        evento.vendidos += quantidade;

        emit IngressosRepasados(_idEvento, para, quantidade);
    }

    function retirarRevendedor(uint256 _idEvento, address revendedor) external {
        Evento storage evento = eventos[_idEvento];
        require(msg.sender == evento.organizador, "Apenas o organizador pode remover");
        evento.revendedores[revendedor] = 0;
    }

    function venderComoRevendedor(uint256 _idEvento) external {
        Evento storage evento = eventos[_idEvento];
        require(evento.revendedores[msg.sender] > 0, "Sem ingressos disponiveis para revenda");

        uint256 tokenId = proximoIdIngresso;
        _safeMint(msg.sender, tokenId);

        ingressoParaEvento[tokenId] = _idEvento;
        donoOriginalIngresso[tokenId] = msg.sender;
        evento.revendedores[msg.sender]--;
        proximoIdIngresso++;

        emit IngressoComprado(_idEvento, msg.sender, tokenId);
    }

    function sacarFundos(uint256 _idEvento) external {
        Evento storage evento = eventos[_idEvento];
        require(msg.sender == evento.organizador, "Apenas o organizador pode sacar");
        payable(evento.organizador).transfer(address(this).balance);
    }

    function obterDadosEvento(uint256 _idEvento)
        external
        view
        returns (
            string memory nome,
            address organizador,
            uint256 preco,
            uint256 totalIngressos,
            uint256 vendidos,
            TipoVenda tipo
        )
    {
        Evento storage evento = eventos[_idEvento];
        return (evento.nome, evento.organizador, evento.preco, evento.totalIngressos, evento.vendidos, evento.tipo);
    }
}
