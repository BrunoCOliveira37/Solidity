import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { abi as vendaIngressosAbi } from "@/abi/VendaIngressos.json";
import { abi as ingressoNFTAbi } from "@/abi/IngressoNFT.json";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createPublicClient, http } from "viem";
import { foundry } from "viem/chains";

const CONTRACT_ADDRESS_VENDA = import.meta.env.VITE_CONTRACT_ADDRESS_VENDA;
const CONTRACT_ADDRESS_NFT = import.meta.env.VITE_CONTRACT_ADDRESS_NFT;

export default function MeusIngressosPage() {
  const { address, isConnected } = useAccount();
  const [tokenIds, setTokenIds] = useState([]);
  const [visibleTokens, setVisibleTokens] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchIngressos = async () => {
    setLoading(true);
    const client = createPublicClient({
      chain: foundry,
      transport: http("http://localhost:8545"),
    });

    try {
      const ingressos = await client.readContract({
        address: CONTRACT_ADDRESS_VENDA,
        abi: vendaIngressosAbi,
        functionName: "ingressosDoUsuario",
        args: [address],
      });

      setTokenIds(ingressos);
    } catch (error) {
      console.error("Erro ao buscar ingressos:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isConnected) fetchIngressos();
  }, [isConnected]);

  const toggleVisibility = (tokenId) => {
    setVisibleTokens((prev) => ({ ...prev, [tokenId]: !prev[tokenId] }));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Meus Ingressos</h1>
      {loading ? (
        <p>Carregando ingressos...</p>
      ) : tokenIds.length === 0 ? (
        <p>Você não possui ingressos.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tokenIds.map((tokenId) => (
            <Card key={tokenId} className="relative">
              <CardContent className="p-4 space-y-2">
                <p className="font-semibold">Token ID: {tokenId.toString()}</p>
                <div className={`w-full h-40 bg-gray-300 flex items-center justify-center text-xl font-bold rounded ${visibleTokens[tokenId] ? "" : "blur-sm"}`}>
                  INGRESSO #{tokenId.toString()}
                </div>
                <Button onClick={() => toggleVisibility(tokenId)}>
                  {visibleTokens[tokenId] ? "Ocultar" : "Ver ingresso"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
