import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseEther } from "viem";
import { Card, CardContent } from "@/components/ui/card";

export default function OrganizadorPage() {
  const [evento, setEvento] = useState({ nome: "", preco: "", total: "", tipo: "Aberta" });
  const [convidado, setConvidado] = useState("");
  const [eventoIdParaConvidado, setEventoIdParaConvidado] = useState("");
  const [revendedor, setRevendedor] = useState("");
  const [qtdRevendedor, setQtdRevendedor] = useState("");
  const [eventoIdRepassar, setEventoIdRepassar] = useState("");
  const [eventoIdSaque, setEventoIdSaque] = useState("");

  const handleCriarEvento = () => {
    // Chamada para o contrato aqui (ex: wagmi writeContract)
    console.log("Criar evento:", evento);
  };

  const handleAdicionarConvidado = () => {
    console.log("Adicionar convidado:", convidado, "para evento:", eventoIdParaConvidado);
  };

  const handleRepassarIngressos = () => {
    console.log("Repassar para:", revendedor, qtdRevendedor, "evento:", eventoIdRepassar);
  };

  const handleSaque = () => {
    console.log("Sacar fundos do evento:", eventoIdSaque);
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