import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { readContract } from '@wagmi/core';
import contratoAbi from "../abi/VendaIngressosNFT.json";

const contratoAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

export default function CompradorPage({ address }) {
  const [eventos, setEventos] = useState([]);
  const [tokenURIs, setTokenURIs] = useState({});

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const total = await readContract({
          address: contratoAddress,
          abi: contratoAbi,
          functionName: 'proximoIdEvento'
        });

        const lista = [];
        for (let i = 1n; i < total; i++) {
          const dados = await readContract({
            address: contratoAddress,
            abi: contratoAbi,
            functionName: 'obterDadosEvento',
            args: [i]
          });

          const convidado = await readContract({
            address: contratoAddress,
            abi: contratoAbi,
            functionName: 'estaConvidado',
            args: [i, address]
          });

          lista.push({
            id: Number(i),
            nome: dados[0],
            organizador: dados[1],
            preco: (Number(dados[2]) / 1e18).toFixed(4),
            total: Number(dados[3]),
            vendidos: Number(dados[4]),
            tipo: dados[5] === 0 ? 'Aberta' : 'PorConvite',
            convidado
          });
        }

        setEventos(lista);
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
      }
    };

    if (address) fetchEventos();
  }, [address]);

  const handleComprar = (eventoId) => {
    const uri = tokenURIs[eventoId] || "ipfs://exemplo-token";
    console.log("Comprar ingresso do evento:", eventoId, "com tokenURI:", uri);
    // Aqui entraria a lógica com writeContract()
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">Comprar Ingressos</h1>
      {eventos.map((evento) => {
        const podeComprar = evento.tipo === "Aberta" || evento.convidado;

        return (
          <Card key={evento.id} className={`${podeComprar ? "" : "opacity-50 pointer-events-none"}`}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{evento.nome}</h2>
                <span className="text-sm text-gray-500">
                  {evento.tipo === "Aberta"
                    ? "Evento Aberto"
                    : evento.convidado
                    ? "Evento Fechado — Você foi convidado"
                    : "Evento Fechado"}
                </span>
              </div>
              <p className="text-gray-600">Preço: {evento.preco} ETH</p>
              <Input
                placeholder="tokenURI (opcional)"
                value={tokenURIs[evento.id] || ""}
                onChange={(e) =>
                  setTokenURIs({ ...tokenURIs, [evento.id]: e.target.value })
                }
              />
              {podeComprar && (
                <Button onClick={() => handleComprar(evento.id)}>Comprar</Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
