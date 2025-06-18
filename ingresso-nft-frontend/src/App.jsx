import { WagmiConfig, createConfig, http } from 'wagmi'
import { foundry } from 'viem/chains'
import HomePage from "./pages/HomePage";
import OrganizadorPage from "./pages/OrganizadorPage";
import CompradorPage from "./pages/CompradorPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const config = createConfig({
  chains: [foundry],
  connectors: [], // Nenhum conector real (como MetaMask)
  transports: {
    [foundry.id]: http() // conecta no anvil (http://localhost:8545)
  }
})

export const SIMULATED_ADDRESS = "0x0000000000000000000000000000000000000001";

function App() {
  return (
    <WagmiConfig config={config}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/organizador" element={<OrganizadorPage />} />
          <Route path="/comprador" element={<CompradorPage address={SIMULATED_ADDRESS} />} />
        </Routes>
      </BrowserRouter>
    </WagmiConfig>
  );
}

export default App;