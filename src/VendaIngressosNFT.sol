// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// --------------------- Ingresso NFT ---------------------
contract IngressoNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;

    constructor() ERC721("IngressoNFT", "INGNFT") Ownable(msg.sender) {}

    function mint(address to, string memory tokenURI) external onlyOwner returns (uint256) {
        uint256 tokenId = nextTokenId;
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        nextTokenId++;
        return tokenId;
    }

    function burn(uint256 tokenId) external {
        require(_isApprovedOrOwnerCustom(msg.sender, tokenId), "Nao autorizado");
        _burn(tokenId);
    }

    function _isApprovedOrOwnerCustom(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
    }
}

// --------------------- Token ERC20 (ING) ---------------------
contract IngressoToken is ERC20, Ownable {
    constructor() ERC20("IngressoToken", "ING") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }
}

// --------------------- Venda de Ingressos ---------------------
contract VendaIngressos is Ownable {
    using Strings for uint256;

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
    IngressoNFT public ingressoNFT;

    uint256 public proximoIdEvento;
    mapping(uint256 => Evento) private eventos;

    mapping(address => uint256[]) public ingressosPorUsuario;
    mapping(uint256 => uint256) public eventoPorTokenId;

    event EventoCriado(uint256 id, string nome, address organizador);
    event IngressoComprado(uint256 idEvento, address comprador, uint256 tokenId);
    event IngressosRepassados(uint256 idEvento, address revendedor, uint256 qtd);
    event IngressoRevendido(address de, address para, uint256 tokenIdAntigo, uint256 tokenIdNovo);

    constructor(address tokenAddress, address ingressoNFTAddress) Ownable(msg.sender) {
        token = IERC20(tokenAddress);
        ingressoNFT = IngressoNFT(ingressoNFTAddress);
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

        require(token.transferFrom(msg.sender, e.organizador, e.precoEmReais), "Falha no pagamento");

        e.vendidos++;

        string memory tokenURI = string(
            abi.encodePacked("https://meusingressos.com/metadata/", idEvento.toString(), "/", e.vendidos.toString())
        );

        uint256 tokenId = ingressoNFT.mint(msg.sender, tokenURI);
        ingressosPorUsuario[msg.sender].push(tokenId);
        eventoPorTokenId[tokenId] = idEvento;

        emit IngressoComprado(idEvento, msg.sender, tokenId);
    }

    function adicionarConvidado(uint256 idEvento, address convidado) external {
        Evento storage e = eventos[idEvento];
        require(msg.sender == e.organizador, "Apenas o organizador pode convidar");
        e.convidados[convidado] = true;
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

    function revenderIngresso(uint256 tokenId, address novoDono) external {
        require(ingressoNFT.ownerOf(tokenId) == msg.sender, "Nao eh dono do ingresso");

        uint256 idEvento = eventoPorTokenId[tokenId];

        ingressoNFT.burn(tokenId);

        string memory tokenURI = string(
            abi.encodePacked(
                "https://meusingressos.com/metadata/", idEvento.toString(), "/", block.timestamp.toString()
            )
        );

        uint256 novoTokenId = ingressoNFT.mint(novoDono, tokenURI);
        eventoPorTokenId[novoTokenId] = idEvento;

        _removerIngresso(msg.sender, tokenId);
        ingressosPorUsuario[novoDono].push(novoTokenId);

        emit IngressoRevendido(msg.sender, novoDono, tokenId, novoTokenId);
    }

    function _removerIngresso(address usuario, uint256 tokenId) internal {
        uint256[] storage lista = ingressosPorUsuario[usuario];
        for (uint256 i = 0; i < lista.length; i++) {
            if (lista[i] == tokenId) {
                lista[i] = lista[lista.length - 1];
                lista.pop();
                break;
            }
        }
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

    function ingressosDoUsuario(address usuario) external view returns (uint256[] memory) {
        return ingressosPorUsuario[usuario];
    }
}
