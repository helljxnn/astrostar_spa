import { useState, useCallback } from "react";
import { paymentsService } from "../services/PaymentsService.js";
import { showSuccessAlert, showErrorAlert } from "../../../../../../../../shared/utils/alerts.js";

/**
 * Hook para subir comprobantes de pago
 */
export const useUploadReceipt = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadReceipt = useCallback(async (obligationId, file) => {
    // Validar archivo
    const validationErrors = paymentsService.validateFile(file);
    if (validationErrors.length > 0) {
      showErrorAlert(validationErrors.join(', '));
      return { success: false, errors: validationErrors };
    }

    setUploading(true);
    setProgress(0);

    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await paymentsService.uploadReceipt(obligationId, file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      showSuccessAlert("Comprobante subido exitosamente. En revisión por administración.");
      
      return { success: true, data: response };
    } catch (error) {
      console.error("Error uploading receipt:", error);
      const errorMessage = error.response?.data?.message || "Error al subir el comprobante";
      showErrorAlert(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 1000);
    }
  }, []);

  return {
    uploadReceipt,
    uploading,
    progress
  };
};