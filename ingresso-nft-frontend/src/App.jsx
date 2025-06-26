import { WagmiConfig, createConfig, http } from 'wagmi';
import { foundry } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // 👈 importa isso
import { injected } from '@wagmi/connectors';
import HomePage from "./pages/HomePage";
import OrganizadorPage from "./pages/OrganizadorPage";
import CompradorPage from "./pages/CompradorPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/ui/navbar";

// 👇 cria o QueryClient
const queryClient = new QueryClient();

// 🦊 define o connector da metamask
const config = createConfig({
  connectors: [injected()],
  chains: [foundry],
  transports: {
    [foundry.id]: http("http://localhost:8555"),
  },
});

function App() {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Navbar />
            <div className="pt-20"> {/* Empurra o conteúdo para baixo da navbar */}
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/organizador" element={<OrganizadorPage />} />
                <Route path="/comprador" element={<CompradorPage />} />
              </Routes>
          </div>
          
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default App;
