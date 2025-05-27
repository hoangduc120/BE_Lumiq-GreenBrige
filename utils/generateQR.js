// utils/generateQrCode.js
const QRCode = require("qrcode");

/**
 * Generates QR code image (base64) from a product URL.
 * @param {string} productId
 * @returns {string} base64 image string
 */
const generateQRCode = async (productId) => {
  const url = `http://localhost:5173/${productId}`;
  const qrImageBase64 = await QRCode.toDataURL(url);
  return qrImageBase64;
};

module.exports = generateQRCode;
