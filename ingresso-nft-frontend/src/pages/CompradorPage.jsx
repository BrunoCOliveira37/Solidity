import { useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { abi as vendaIngressosAbi } from "@/abi/VendaIngressos.json";
import { abi as tokenAbi } from "@/abi/IngressoToken.json";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createPublicClient, http, formatUnits } from "viem";
import { foundry } from "viem/chains";
import { useWalletClient } from "wagmi";

const CONTRACT_ADDRESS_VENDA = import.meta.env.VITE_CONTRACT_ADDRESS_VENDA;
const CONTRACT_ADDRESS_TOKEN = import.meta.env.VITE_CONTRACT_ADDRESS_TOKEN;

export default function CompradorPage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { data: walletClient } = useWalletClient();
  const [eventos, setEventos] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const client = createPublicClient({
    chain: foundry,
    transport: http("http://127.0.0.1:8545"),
  });

  const fetchEventos = async () => {
    const eventosList = [];
    const total = await client.readContract({
      abi: vendaIngressosAbi,
      address: CONTRACT_ADDRESS_VENDA,
      functionName: "proximoIdEvento",
    });

    const agora = Math.floor(Date.now() / 1000);

    for (let i = 0; i < Number(total); i++) {
      try {
        const evento = await client.readContract({
          abi: vendaIngressosAbi,
          address: CONTRACT_ADDRESS_VENDA,
          functionName: "obterDadosEvento",
          args: [i],
        });

        const tipo = Number(evento[5]);
        const encerramento = Number(evento[7]);

        const isConvidado =
          tipo === 1
            ? await client.readContract({
                abi: vendaIngressosAbi,
                address: CONTRACT_ADDRESS_VENDA,
                functionName: "estaConvidado",
                args: [i, address],
              })
            : true;

        const naoEncerrado = encerramento > agora;

        if (isConvidado && naoEncerrado) {
          eventosList.push({
            id: i,
            nome: evento[0],
            organizador: evento[1],
            preco: evento[2],
            total: evento[3],
            vendidos: evento[4],
            tipo: tipo,
            dataEvento: evento[6],
            dataEncerramento: evento[7],
          });
        }
      } catch (err) {
        console.error("Erro ao carregar evento", i, err);
      }
    }
    setEventos(eventosList);
  };

  useEffect(() => {
    if (isConnected) fetchEventos();
  }, [isConnected]);

  const handleComprar = async (idEvento, precoIngresso) => {
    try {
      if (!address || !walletClient) return alert("Conecte sua carteira");

      setLoadingId(idEvento);

      await writeContractAsync({
        account: walletClient.account.address,
        address: CONTRACT_ADDRESS_TOKEN,
        abi: tokenAbi,
        functionName: "approve",
        args: [CONTRACT_ADDRESS_VENDA, precoIngresso],
      });

      await writeContractAsync({
        account: walletClient.account.address,
        address: CONTRACT_ADDRESS_VENDA,
        abi: vendaIngressosAbi,
        functionName: "comprarIngresso",
        args: [idEvento],
      });

      alert("Ingresso comprado com sucesso!");
      fetchEventos(); // atualiza ingressos disponíveis
    } catch (err) {
      console.error(err);
      alert("Erro: " + (err.shortMessage || err.message));
    } finally {
      setLoadingId(null);
    }
  };

  if (!isConnected) {
    return <p className="text-center text-red-600 mt-10">Conecte sua carteira.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Comprar Ingressos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {eventos.map((evento) => (
          <Card key={evento.id}>
            <CardContent className="space-y-2 p-4">
              <h2 className="text-lg font-semibold">{evento.nome}</h2>
              <p>Preço: {formatUnits(evento.preco, 18)} ING</p>
              <p>Tipo: {evento.tipo === 0 ? "Aberto" : "Por Convite"}</p>
              <p>
                Disponíveis: {Number(evento.total) - Number(evento.vendidos)} / {Number(evento.total)}
              </p>
              <Button
                onClick={() => handleComprar(evento.id, evento.preco)}
                disabled={
                  loadingId === evento.id || Number(evento.vendidos) >= Number(evento.total)
                }
              >
                {loadingId === evento.id ? "Processando..." : "Comprar"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
