import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { abi as vendaIngressosAbi } from "@/abi/VendaIngressos.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const CONTRACT_ADDRESS_VENDA = import.meta.env.VITE_CONTRACT_ADDRESS_VENDA;

export default function EventosOrganizador() {
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [total, setTotal] = useState("");
  const [tipo, setTipo] = useState("0");
  const [dataEvento, setDataEvento] = useState("");
  const [dataEncerramento, setDataEncerramento] = useState("");
  const [idEventoConvite, setIdEventoConvite] = useState("");
  const [enderecoConvite, setEnderecoConvite] = useState("");
  const [eventoValida, setEventoValida] = useState("");
  const [tokenValida, setTokenValida] = useState("");

  const criarEvento = async () => {
    await writeContractAsync({
      address: CONTRACT_ADDRESS_VENDA,
      abi: vendaIngressosAbi,
      functionName: "criarEvento",
      args: [
        nome,
        BigInt(preco),
        BigInt(total),
        parseInt(tipo),
        BigInt(Math.floor(new Date(dataEvento).getTime() / 1000)),
        BigInt(Math.floor(new Date(dataEncerramento).getTime() / 1000)),
      ],
    });
    alert("Evento criado!");
  };

  const convidarPessoa = async () => {
    await writeContractAsync({
      address: CONTRACT_ADDRESS_VENDA,
      abi: vendaIngressosAbi,
      functionName: "adicionarConvidado",
      args: [BigInt(idEventoConvite), enderecoConvite],
    });
    alert("Pessoa convidada!");
  };

  const verificarIngresso = async () => {
    const res = await fetch(`/api/validar?evento=${eventoValida}&token=${tokenValida}`);
    const json = await res.json();
    alert(json.valido ? "Ingresso válido!" : "Ingresso INVÁLIDO ou de outro evento.");
  };

  if (!isConnected) {
    return <p className="text-center text-red-600 mt-10">Conecte sua carteira.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Gerenciar Eventos</h1>

      <Card>
        <CardContent className="p-4 space-y-2">
          <h2 className="font-semibold">Criar Evento</h2>
          <Input placeholder="Nome do evento" onChange={(e) => setNome(e.target.value)} />
          <Input placeholder="Preço (em wei)" onChange={(e) => setPreco(e.target.value)} />
          <Input placeholder="Total de ingressos" onChange={(e) => setTotal(e.target.value)} />
          <select onChange={(e) => setTipo(e.target.value)}>
            <option value="0">Aberto</option>
            <option value="1">Por convite</option>
          </select>
          <Input type="datetime-local" onChange={(e) => setDataEvento(e.target.value)} />
          <Input type="datetime-local" onChange={(e) => setDataEncerramento(e.target.value)} />
          <Button onClick={criarEvento}>Criar</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <h2 className="font-semibold">Convidar Pessoa (Evento Privado)</h2>
          <Input placeholder="ID do evento" onChange={(e) => setIdEventoConvite(e.target.value)} />
          <Input placeholder="Endereço da carteira do convidado" onChange={(e) => setEnderecoConvite(e.target.value)} />
          <Button onClick={convidarPessoa}>Convidar</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <h2 className="font-semibold">Validar Ingresso NFT</h2>
          <Input placeholder="ID do evento" onChange={(e) => setEventoValida(e.target.value)} />
          <Input placeholder="Token ID do ingresso" onChange={(e) => setTokenValida(e.target.value)} />
          <Button onClick={verificarIngresso}>Validar</Button>
        </CardContent>
      </Card>
    </div>
  );
}
