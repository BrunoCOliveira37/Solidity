import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { parseEther } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { readContract } from "wagmi/actions";
import {abi} from "@/abi/VendaIngressosNFT.json";
import axios from "axios";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export default function CompradorPage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [eventoId, setEventoId] = useState("");
  const [preco, setPreco] = useState("");
  const [tokenURI, setTokenURI] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-center text-red-600 font-semibold">
          Conecte sua carteira MetaMask para acessar esta página.
        </p>
      </div>
    );
  }

  const checarConvidado = async () => {
    try {
      const resultado = await readContract({
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "estaConvidado",
        args: [BigInt(eventoId), address],
      });
      setIsGuest(resultado);
    } catch (error) {
      console.error("Erro ao verificar convite:", error);
      alert("Erro ao verificar convite");
    }
  };

  const gerarQRCode = async () => {
  try {
    const timestamp = Date.now(); // Adiciona timestamp (usado na assinatura)

    const response = await axios.post("http://localhost:4000/gerar-qrcode", {
      publicKey: address,
      evento: eventoId,
      tipo: isGuest ? "convidado" : "aberta",
      timestamp, // apenas adiciona o timestamp, o backend assina
    });

    return response.data.qrCodeUrl;

  } catch (error) {
    console.error("Erro ao gerar QR Code:", error);
    alert("Erro ao gerar QR Code");
    return null;
  }
};


  const handleComprarIngresso = async () => {
    setLoading(true);
    try {
      const uri = await gerarQRCode();
      if (!uri) return;

      await writeContractAsync({
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "comprarIngresso",
        args: [BigInt(eventoId)],
        value: parseEther(preco),
      });

      setTokenURI(uri);
    } catch (error) {
      console.error("Erro na compra:", error);
      alert("Erro ao comprar ingresso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-10">
      <h1 className="text-3xl font-bold text-center">Área do Comprador</h1>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Comprar Ingresso</h2>
          <Input
            placeholder="ID do Evento"
            value={eventoId}
            onChange={(e) => setEventoId(e.target.value)}
          />
          <Input
            placeholder="Preço (em ETH)"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
          />
          {tokenURI && (
            <p className="text-sm text-green-700">
              ✅ Ingresso comprado!{" "}
              <a href={tokenURI} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">
                Ver QR Code
              </a>
            </p>
          )}
          <div className="flex flex-col gap-4">
            <Button onClick={checarConvidado}>Verificar Convite</Button>
            <Button onClick={handleComprarIngresso} disabled={loading}>
              {loading ? "Processando..." : `Comprar Ingresso ${isGuest ? "(Convidado)" : "(Aberto)"}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
