// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

contract IngressoToken is ERC20, Ownable {
    constructor() ERC20("IngressoToken", "ING") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }
}

contract VendaIngressos is Ownable {
    enum TipoVenda {
        Aberta,
        PorConvite
    }

    struct Evento {
        string nome;
        uint256 precoEmReais;
        uint256 totalIngressos;
        uint256 vendidos;
        TipoVenda tipo;
        uint256 dataEvento;
        uint256 dataEncerramento;
        address organizador;
        mapping(address => bool) convidados;
        mapping(address => uint256) revendedores;
    }

    IERC20 public token;
    uint256 public proximoIdEvento;
    mapping(uint256 => Evento) private eventos;

    event EventoCriado(uint256 id, string nome, address organizador);
    event IngressoComprado(uint256 idEvento, address comprador);
    event IngressosRepassados(uint256 idEvento, address revendedor, uint256 qtd);

    constructor(address tokenAddress) {
        token = IERC20(tokenAddress);
    }

    function criarEvento(
        string calldata nome,
        uint256 precoEmReais,
        uint256 totalIngressos,
        TipoVenda tipo,
        uint256 dataEvento,
        uint256 dataEncerramento
    ) external {
        require(dataEncerramento < dataEvento, "Encerramento deve ser antes do evento");

        Evento storage e = eventos[proximoIdEvento];
        e.nome = nome;
        e.precoEmReais = precoEmReais;
        e.totalIngressos = totalIngressos;
        e.tipo = tipo;
        e.dataEvento = dataEvento;
        e.dataEncerramento = dataEncerramento;
        e.organizador = msg.sender;

        emit EventoCriado(proximoIdEvento, nome, msg.sender);
        proximoIdEvento++;
    }

    function comprarIngresso(uint256 idEvento) external {
        Evento storage e = eventos[idEvento];

        require(block.timestamp < e.dataEncerramento, "Vendas encerradas");
        require(e.vendidos < e.totalIngressos, "Ingressos esgotados");

        if (e.tipo == TipoVenda.PorConvite) {
            require(e.convidados[msg.sender], "Nao esta na lista de convidados");
        }

        // Transferência de token como pagamento
        require(token.transferFrom(msg.sender, e.organizador, e.precoEmReais), "Falha no pagamento");

        e.vendidos++;
        emit IngressoComprado(idEvento, msg.sender);
    }

    function repassarIngressos(uint256 idEvento, address revendedor, uint256 quantidade) external {
        Evento storage e = eventos[idEvento];
        require(msg.sender == e.organizador, "Apenas organizador");
        require(e.vendidos + quantidade <= e.totalIngressos, "Excede total");
        require(quantidade <= e.totalIngressos / 2, "Maximo 50% para revenda");

        e.revendedores[revendedor] += quantidade;
        e.vendidos += quantidade;

        emit IngressosRepassados(idEvento, revendedor, quantidade);
    }

    function estaConvidado(uint256 idEvento, address usuario) external view returns (bool) {
        return eventos[idEvento].convidados[usuario];
    }

    function obterDadosEvento(uint256 idEvento)
        external
        view
        returns (
            string memory nome,
            address organizador,
            uint256 precoEmReais,
            uint256 totalIngressos,
            uint256 vendidos,
            TipoVenda tipo,
            uint256 dataEvento,
            uint256 dataEncerramento
        )
    {
        Evento storage e = eventos[idEvento];
        return (
            e.nome,
            e.organizador,
            e.precoEmReais,
            e.totalIngressos,
            e.vendidos,
            e.tipo,
            e.dataEvento,
            e.dataEncerramento
        );
    }
}
