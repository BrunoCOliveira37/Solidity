import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseEther } from "viem";
import { Card, CardContent } from "@/components/ui/card";
import { useWriteContract } from "wagmi";
import { useAccount } from "wagmi";
import {abi} from "@/abi/VendaIngressosNFT.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export default function OrganizadorPage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [evento, setEvento] = useState({ nome: "", preco: "", total: "", tipo: "Aberta" });
  const [convidado, setConvidado] = useState("");
  const [eventoIdParaConvidado, setEventoIdParaConvidado] = useState("");
  const [revendedor, setRevendedor] = useState("");
  const [qtdRevendedor, setQtdRevendedor] = useState("");
  const [eventoIdRepassar, setEventoIdRepassar] = useState("");
  const [eventoIdSaque, setEventoIdSaque] = useState("");

  const handleCriarEvento = async () => {
    if (!isConnected) return alert("Conecte sua carteira MetaMask primeiro.");
    try {
      await writeContractAsync({
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "criarEvento",
        args: [
          evento.nome,
          parseEther(evento.preco),
          BigInt(evento.total),
          evento.tipo === "Aberta" ? 0 : 1,
        ],
      });
      alert("Evento criado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao criar evento");
    }
  };

  const handleAdicionarConvidado = async () => {
    if (!isConnected) return alert("Conecte sua carteira MetaMask primeiro.");
    try {
      await writeContractAsync({
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "adicionarConvidado",
        args: [BigInt(eventoIdParaConvidado), convidado],
      });
      alert("Convidado adicionado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar convidado");
    }
  };

  const handleRepassarIngressos = async () => {
    if (!isConnected) return alert("Conecte sua carteira MetaMask primeiro.");
    try {
      await writeContractAsync({
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "repassarIngressos",
        args: [BigInt(eventoIdRepassar), revendedor, BigInt(qtdRevendedor)],
      });
      alert("Ingressos repassados!");
    } catch (error) {
      console.error(error);
      alert("Erro ao repassar ingressos");
    }
  };

  const handleSaque = async () => {
    if (!isConnected) return alert("Conecte sua carteira MetaMask primeiro.");
    try {
      await writeContractAsync({
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "sacarFundos",
        args: [BigInt(eventoIdSaque)],
      });
      alert("Fundos sacados!");
    } catch (error) {
      console.error(error);
      alert("Erro ao sacar fundos");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <h1 className="text-3xl font-bold text-center">Área do Organizador</h1>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Criar Evento</h2>
          <Input placeholder="Nome do Evento" value={evento.nome} onChange={e => setEvento({ ...evento, nome: e.target.value })} />
          <Input placeholder="Preço (em ETH)" value={evento.preco} onChange={e => setEvento({ ...evento, preco: e.target.value })} />
          <Input placeholder="Total de Ingressos" value={evento.total} onChange={e => setEvento({ ...evento, total: e.target.value })} />
          <select value={evento.tipo} onChange={e => setEvento({ ...evento, tipo: e.target.value })} className="border rounded px-3 py-2">
            <option value="Aberta">Aberta</option>
            <option value="PorConvite">Por Convite</option>
          </select>
          <Button onClick={handleCriarEvento}>Criar</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Adicionar Convidado</h2>
          <Input placeholder="ID do Evento" value={eventoIdParaConvidado} onChange={e => setEventoIdParaConvidado(e.target.value)} />
          <Input placeholder="Endereço do Convidado" value={convidado} onChange={e => setConvidado(e.target.value)} />
          <Button onClick={handleAdicionarConvidado}>Adicionar</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Repassar Ingressos para Revendedor</h2>
          <Input placeholder="ID do Evento" value={eventoIdRepassar} onChange={e => setEventoIdRepassar(e.target.value)} />
          <Input placeholder="Endereço do Revendedor" value={revendedor} onChange={e => setRevendedor(e.target.value)} />
          <Input placeholder="Quantidade" value={qtdRevendedor} onChange={e => setQtdRevendedor(e.target.value)} />
          <Button onClick={handleRepassarIngressos}>Repassar</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Sacar Fundos</h2>
          <Input placeholder="ID do Evento" value={eventoIdSaque} onChange={e => setEventoIdSaque(e.target.value)} />
          <Button onClick={handleSaque}>Sacar</Button>
        </CardContent>
      </Card>
    </div>
  );
}
