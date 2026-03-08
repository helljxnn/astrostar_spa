import { useState, useEffect, useCallback } from "react";
import PaymentsService from "../services/PaymentsService";
import { showSuccessAlert, showErrorAlert } from "../../../../../../../../shared/utils/alerts";

/**
 * Hook para gestionar el estado financiero de un atleta
 */
export const useAthleteFinancialStatus = (athleteId) => {
  const [financialStatus, setFinancialStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFinancialStatus = useCallback(async () => {
    if (!athleteId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await PaymentsService.getAthleteFinancialStatus(athleteId);
      setFinancialStatus(response);
    } catch (error) {
      console.error("Error fetching financial status:", error);
      setError(error.response?.data?.message || "Error al cargar el estado financiero");
      showErrorAlert("Error al cargar el estado financiero");
    } finally {
      setLoading(false);
    }
  }, [athleteId]);

  useEffect(() => {
    fetchFinancialStatus();
  }, [fetchFinancialStatus]);

  const refetch = useCallback(() => {
    fetchFinancialStatus();
  }, [fetchFinancialStatus]);

  return {
    financialStatus,
    loading,
    error,
    refetch
  };
};