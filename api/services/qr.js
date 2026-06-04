// ═══════════════════════════════════════════════════════════
//  QR Code Service — replaces QRService.php (uses qrcode npm)
// ═══════════════════════════════════════════════════════════
import QRCode from 'qrcode';

/**
 * Generate a QR code PNG buffer for the given data string.
 * FAO brand color: #5791C9 (blue finder squares).
 */
export async function generate(data) {
  return QRCode.toBuffer(data, {
    type         : 'png',
    width        : 300,
    margin       : 2,
    errorCorrectionLevel: 'H',
    color: {
      dark : '#1C4767',   // FAO dark blue modules
      light: '#FFFFFF',   // white background
    },
  });
}
