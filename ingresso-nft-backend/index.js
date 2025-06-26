const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const generateQR = require("./utils/generateQR");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;
const SECRET_KEY = process.env.PRIVATE_SECRET; // definida no .env

app.use(cors());
app.use(express.json());
app.use("/qrcodes", express.static(path.join(__dirname, "public/qrcodes")));

app.post("/gerar-qrcode", async (req, res) => {
  const { publicKey, evento, tipo, timestamp } = req.body;

  if (!publicKey || !evento || !tipo || !timestamp) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  // Gera a assinatura digital do ingresso
  const dataToSign = `${publicKey}-${evento}-${tipo}-${timestamp}`;
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(dataToSign)
    .digest("hex");

  const conteudo = JSON.stringify({
    publicKey,
    evento,
    tipo,
    timestamp,
    signature,
  });

  // Gera o nome único da imagem
  const fileName = `${publicKey}_${evento}_${timestamp}.png`;
  const filePath = path.join(__dirname, "public/qrcodes", fileName);

  try {
    // Gera e salva localmente a imagem PNG
    await generateQR(conteudo, filePath);

    // Gera URL pública da imagem
    const publicUrl = `http://localhost:${PORT}/qrcodes/${fileName}`;

    res.json({ qrCodeUrl: publicUrl });
  } catch (err) {
    console.error("Erro ao gerar ou salvar QR Code:", err);
    res.status(500).json({ error: "Erro ao gerar QR Code" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend rodando em http://localhost:${PORT}`);
});
