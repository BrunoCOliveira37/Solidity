import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "@wagmi/connectors";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { address, isConnected } = useAccount();
  
  const { connect, connectors, isPending } = useConnect();
  const handleConnect = async () => {
    const injectedConnector = connectors.find(c => c.id === "injected");
    if (injectedConnector) {
      try {
        await connect({ connector: injectedConnector });
        alert("Carteira conectada com sucesso!");
      } catch (err) {
        console.error(err);
        alert("Erro ao conectar carteira.");
      }
    }
  };
  const { disconnect } = useDisconnect();

  const abreviarEndereco = (addr) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white border-b shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Coluna esquerda: vazia para ajudar no alinhamento central */}
        <div className="w-1/3">
          <Link to={"/comprador"}>
            <p className="text-lg font-bold">Comprar Ingressos</p>
          </Link>
          <Link to={"/organizador"}>
            <p className="text-lg font-bold">Manter Eventos</p>
          </Link>
          <Link to={"/ingressos"}>
            <p className="text-lg font-bold">Meus ingressos</p>
          </Link>
        </div>

        {/* Coluna central: título */}
        <div className="w-1/3 text-center">
          <Link to={"/"}>
            <h1 className="text-lg font-bold">Ingressos NFT</h1>
          </Link>
        </div>

        {/* Coluna direita: conexão da carteira */}
        <div className="w-1/3 flex justify-end items-center gap-3">
          {isConnected ? (
            <>
              <span className="text-sm text-gray-700 hidden sm:block">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <button
                onClick={disconnect}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Desconectar
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            >
              Conectar Carteira
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}