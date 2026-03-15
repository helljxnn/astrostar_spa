import { useState, useEffect, useCallback } from "react";
import { paymentsService } from "../services/PaymentsService.js";
import { showSuccessAlert, showErrorAlert } from "../../../../../../../../shared/utils/alerts.js";

/**
 * Hook para gestionar configuración de pagos (Admin)
 */
export const usePaymentSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await paymentsService.getPaymentSettings();
      setSettings(response);
    } catch (error) {
      console.error("Error fetching payment settings:", error);
      showErrorAlert("Error al cargar la configuración");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings) => {
    setUpdating(true);
    try {
      const response = await paymentsService.updatePaymentSettings(newSettings);
      setSettings(response);
      showSuccessAlert("Configuración actualizada exitosamente");
      return { success: true };
    } catch (error) {
      console.error("Error updating payment settings:", error);
      showErrorAlert("Error al actualizar la configuración");
      return { success: false, error: error.response?.data?.message };
    } finally {
      setUpdating(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    updating,
    fetchSettings,
    updateSettings
  };
};