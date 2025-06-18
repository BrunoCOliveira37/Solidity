import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
        Plataforma de Ingressos NFT
      </h1>
      <p className="text-lg text-center mb-10 max-w-xl text-gray-600">
        Gerencie, venda, compre e revenda ingressos baseados em tokens NFT. Explore as funcionalidades como organizador, comprador ou revendedor.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <Card className="hover:shadow-xl transition-all">
          <CardContent className="p-6 flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Organizador</h2>
            <p className="text-gray-600 text-sm">
              Crie eventos, defina preços, convide usuários e repasse ingressos.
            </p>
            <Link to="/organizador">
              <Button className="mt-auto w-full">
                Acessar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all">
          <CardContent className="p-6 flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Comprador</h2>
            <p className="text-gray-600 text-sm">
              Compre ingressos diretamente de eventos públicos ou por convite.
            </p>
            <Link to="/comprador">
              <Button className="mt-auto w-full">
                Acessar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all">
          <CardContent className="p-6 flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Revendedor</h2>
            <p className="text-gray-600 text-sm">
              Emita ingressos recebidos e revenda NFTs para outros usuários.
            </p>
            <Link to="/revendedor">
              <Button className="mt-auto w-full">
                Acessar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}