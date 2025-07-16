import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAccount, useReadContract } from "wagmi";
import { abi as vendaAbi } from "@/abi/VendaIngressos.json";
import { format } from "date-fns";
import { getPublicClient } from "wagmi/actions";
import { formatUnits } from "viem";
import { Link } from "react-router-dom";

const CONTRACT_ADDRESS_VENDA = import.meta.env.VITE_CONTRACT_ADDRESS_VENDA;

export default function HomePage() {
  const { address } = useAccount();
  const [eventos, setEventos] = useState([]);
  const [eventosPrivados, setEventosPrivados] = useState([]);

  const totalEventos = useReadContract({
    abi: vendaAbi,
    address: CONTRACT_ADDRESS_VENDA,
    functionName: "proximoIdEvento",
  });

  useEffect(() => {
    const carregarEventos = async () => {
      const total = Number(totalEventos.data);
      const client = getPublicClient();

      const eventosLidos = await Promise.all(
        Array.from({ length: total }).map(async (_, i) => {
          try {
            const evento = await client.readContract({
              abi: vendaAbi,
              address: CONTRACT_ADDRESS_VENDA,
              functionName: "obterDadosEvento",
              args: [i],
            });

            return {
              id: i,
              nome: evento[0],
              organizador: evento[1],
              preco: evento[2],
              total: evento[3],
              vendidos: evento[4],
              tipo: evento[5],
              dataEvento: evento[6],
              dataEncerramento: evento[7],
            };
          } catch (err) {
            console.error("Erro evento", i, err);
            return null;
          }
        })
      );

      const filtrados = eventosLidos.filter(Boolean);
      setEventos(filtrados.filter(e => Number(e.tipo) === 0));
      setEventosPrivados(filtrados.filter(e => Number(e.tipo) === 1));
    };

    if (totalEventos.data) carregarEventos();
  }, [totalEventos.data]);

  const renderEvento = (evento) => (
    <Card key={evento.id} className="shadow-md">
      <CardContent className="p-4 space-y-2">
        <h2 className="text-xl font-semibold">{evento.nome}</h2>
        <p><strong>Preço:</strong> {formatUnits(evento.preco, 18)} ING</p>
        <p><strong>Organizador:</strong> {evento.organizador}</p>
        <p><strong>Data do Evento:</strong> {format(new Date(Number(evento.dataEvento) * 1000), 'dd/MM/yyyy')}</p>
        <p><strong>Encerramento:</strong> {format(new Date(Number(evento.dataEncerramento) * 1000), 'dd/MM/yyyy')}</p>
        <Button asChild>
          <Link to={`/eventos/${evento.id}`}>Ver Detalhes</Link>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Eventos Abertos</h1>
      {eventos.length === 0 && <p>Nenhum evento aberto disponível.</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {eventos.map(renderEvento)}
      </div>

      <h1 className="text-3xl font-bold mt-10">Eventos Privados</h1>
      {eventosPrivados.length === 0 && <p>Nenhum evento privado disponível.</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {eventosPrivados.map(renderEvento)}
      </div>
    </div>
  );
}
