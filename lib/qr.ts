import QRCode from "qrcode";

/**
 * Generate a QR code as a matrix of boolean values (true = dark module).
 * Used by the share card API to render QR as pixel divs in ImageResponse.
 */
export async function generateQRMatrix(
  url: string
): Promise<{ modules: boolean[][]; size: number }> {
  // Generate QR code as a 2D array
  const qr = QRCode.create(url, {
    errorCorrectionLevel: "M",
  });

  const size = qr.modules.size;
  const modules: boolean[][] = [];

  for (let row = 0; row < size; row++) {
    const rowData: boolean[] = [];
    for (let col = 0; col < size; col++) {
      rowData.push(qr.modules.get(row, col) === 1);
    }
    modules.push(rowData);
  }

  return { modules, size };
}

/**
 * Generate a QR code as a data URL (PNG base64).
 * Used for client-side rendering in the share modal.
 */
export async function generateQRDataURL(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 256,
    color: {
      dark: "#FFFFFF",
      light: "#00000000", // transparent background
    },
  });
}
