import { useState, useCallback } from "react";
import { paymentsService } from "../services/PaymentsService.js";
import { showSuccessAlert, showErrorAlert } from "../../../../../../../../shared/utils/alerts.js";

/**
 * Hook para gestionar renovaciones de matrículas
 * Maneja tanto renovaciones automáticas como manuales
 */
export const useEnrollmentRenewal = () => {
  const [loading, setLoading] = useState(false);
  const [processingExpired, setProcessingExpired] = useState(false);

  /**
   * Crear obligación de renovación manual para un atleta específico
   */
  const createRenewalObligation = useCallback(async (athleteId) => {
    setLoading(true);
    try {
      const response = await paymentsService.createEnrollmentRenewal(athleteId);
      
      if (response.success) {
        showSuccessAlert(
          'Renovación Creada',
          'Se ha generado la obligación de renovación de matrícula'
        );
        return response.data;
      } else {
        throw new Error(response.message || 'Error al crear renovación');
      }
    } catch (error) {
const message = error.response?.data?.message || error.message || 'Error al crear renovación';
      showErrorAlert('Error', message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Procesar todas las matrículas vencidas (admin)
   */
  const processExpiredEnrollments = useCallback(async () => {
    setProcessingExpired(true);
    try {
      const response = await paymentsService.processExpiredEnrollments();
      
      if (response.success) {
        const processed = response.data?.processed || 0;
        showSuccessAlert(
          'Matrículas Procesadas',
          `Se procesaron ${processed} matrículas vencidas`
        );
        return response.data;
      } else {
        throw new Error(response.message || 'Error al procesar matrículas');
      }
    } catch (error) {
const message = error.response?.data?.message || error.message || 'Error al procesar matrículas vencidas';
      showErrorAlert('Error', message);
      throw error;
    } finally {
      setProcessingExpired(false);
    }
  }, []);

  /**
   * Obtener matrículas próximas a vencer
   */
  const getExpiringEnrollments = useCallback(async (daysToExpire = 30) => {
    try {
      const response = await paymentsService.getExpiringEnrollments(daysToExpire);
      return response.success ? response.data : response;
    } catch (error) {
showErrorAlert('Error', 'No se pudieron cargar las matrículas próximas a vencer');
      throw error;
    }
  }, []);

  return {
    // Estados
    loading,
    processingExpired,
    
    // Acciones
    createRenewalObligation,
    processExpiredEnrollments,
    getExpiringEnrollments
  };
};

