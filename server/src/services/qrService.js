import QRCode from 'qrcode';

export const qrService = {
  /**
   * Generates a Data URI containing the base64-encoded QR code image
   * @param {string} text The data to encode
   * @returns {Promise<string>} Data URI of the QR image
   */
  generateQRDataURI: async (text) => {
    try {
      return await QRCode.toDataURL(text, {
        errorCorrectionLevel: 'M',
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    } catch (err) {
      console.error("QR Generation failed:", err);
      throw new Error("Failed to generate QR code");
    }
  }
};
