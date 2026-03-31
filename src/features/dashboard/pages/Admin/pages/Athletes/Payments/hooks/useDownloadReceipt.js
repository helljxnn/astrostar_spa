import { useState } from "react";
import { paymentsService } from "../services/PaymentsService.js";
import {
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../../shared/utils/alerts.js";

/**
 * Hook para manejar la descarga de comprobantes de pago
 * Proporciona funcionalidad para descargar archivos con nombres descriptivos
 *
 * @returns {Object} Estado y funciones de descarga
 */
export const useDownloadReceipt = () => {
  const [downloading, setDownloading] = useState(false);

  /**
   * Descargar comprobante de pago con manejo robusto de errores
   * @param {Object} payment - Objeto de pago con receiptUrl
   */
  const downloadReceipt = async (payment) => {
    // Validación temprana
    if (!payment?.receiptUrl) {
      showErrorAlert("Error", "No hay comprobante disponible para descargar");
      return;
    }

    setDownloading(true);

    try {
      showSuccessAlert("Descargando...", "Por favor espera un momento");

      const result = await paymentsService.downloadReceiptLegacy(payment);

      showSuccessAlert(
        "Descarga completada",
        `Archivo guardado como "${result.fileName}"`,
      );
    } catch (error) {
      // Fallback: intentar descarga directa
      try {
        const link = document.createElement("a");
        link.href = payment.receiptUrl;
        link.download = "comprobante-pago";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (fallbackError) {
        showErrorAlert(
          "Error de descarga",
          "No se pudo descargar el comprobante. Verifica tu conexión e intenta nuevamente.",
        );
      }
    } finally {
      setDownloading(false);
    }
  };

  return {
    downloadReceipt,
    downloading,
  };
};

export default useDownloadReceipt;
