const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

/**
 * Gera um QR Code e salva como imagem em disco
 * @param {string} data - Os dados a serem codificados no QR
 * @param {string} filepath - Caminho absoluto onde a imagem será salva
 */
async function generateQR(data, filepath) {
  try {
    // Garante que a pasta exista
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Gera e salva a imagem do QR Code
    await QRCode.toFile(filepath, data, {
      type: "png",
      width: 300,
      errorCorrectionLevel: "H",
    });

    console.log("✅ QR Code gerado e salvo em:", filepath);
  } catch (err) {
    console.error("❌ Erro ao gerar QR Code:", err);
    throw err;
  }
}

module.exports = generateQR;
