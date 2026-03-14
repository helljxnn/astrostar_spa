import { useState, useEffect, useCallback } from "react";
import { paymentsService } from "../services/PaymentsService.js";
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts.js";

/**
 * Hook para gestionar el estado financiero completo de un atleta
 * Incluye renovación de matrículas, mensualidades y restricciones de acceso
 * ✅ ACTUALIZADO: Compatible con nuevos campos del backend (suspensión, límite de mora, prioridades)
 */
export const useAthleteFinancialStatus = (athleteId) => {
  const [financialStatus, setFinancialStatus] = useState(null);
  const [accessStatus, setAccessStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFinancialStatus = useCallback(async () => {
    if (!athleteId) return;

    setLoading(true);
    setError(null);

    try {
      // Obtener estado financiero completo con fallback automático a mock
      const [financial, access] = await Promise.all([
        paymentsService.getAthleteFinancialStatus(athleteId),
        paymentsService.checkAthleteAccess(athleteId)
      ]);

      // ✅ NUEVO: Validar y normalizar respuesta del backend
      const normalizedFinancial = {
        ...financial,
        // Asegurar que allMonthlyDebts existe (nuevo campo del backend)
        allMonthlyDebts: Array.isArray(financial?.allMonthlyDebts) 
          ? financial.allMonthlyDebts 
          : [],
        
        // Asegurar estructura de totalDebt con nuevos campos
        totalDebt: {
          monthlyAmount: financial?.totalDebt?.monthlyAmount || 0,
          lateFeeAmount: financial?.totalDebt?.lateFeeAmount || 0,
          totalAmount: financial?.totalDebt?.totalAmount || 0,
          maxDaysLate: financial?.totalDebt?.maxDaysLate || 0,
          obligationsCount: financial?.totalDebt?.obligationsCount || 0,
          // ✅ NUEVO: Detectar si está en el límite de 90 días
          isAtLateFeeLimit: (financial?.totalDebt?.maxDaysLate || 0) >= 90,
        },
        
        // Asegurar estructura de enrollment con nuevos campos
        enrollment: financial?.enrollment ? {
          ...financial.enrollment,
          // ✅ NUEVO: Campo isInitial del backend
          isInitial: financial.enrollment.isInitial || false,
          // ✅ NUEVO: Campo estado del backend
          estado: financial.enrollment.estado || null,
          needsRenewal: financial.enrollment.needsRenewal || false,
        } : null,
      };

      // ✅ NUEVO: Validar estructura de accessStatus
      const normalizedAccess = {
        restricted: access?.restricted || false,
        reason: access?.reason || null,
        message: access?.message || null,
        // ✅ NUEVO: Prioridad del bloqueo (si existe)
        priority: access?.priority || null,
      };

      setFinancialStatus(normalizedFinancial);
      setAccessStatus(normalizedAccess);
    } catch (err) {
      console.error('Error fetching financial status:', err);
      setError(err.message || 'Error al obtener estado financiero');
      showErrorAlert('Error', 'No se pudo cargar el estado financiero');
      
      // ✅ NUEVO: Fallback con estructura completa
      setFinancialStatus({
        allMonthlyDebts: [],
        totalDebt: {
          monthlyAmount: 0,
          lateFeeAmount: 0,
          totalAmount: 0,
          maxDaysLate: 0,
          obligationsCount: 0,
          isAtLateFeeLimit: false,
        },
        enrollment: null,
      });
      setAccessStatus({
        restricted: false,
        reason: null,
        message: null,
        priority: null,
      });
    } finally {
      setLoading(false);
    }
  }, [athleteId]);

  // Cargar datos al montar o cambiar athleteId
  useEffect(() => {
    fetchFinancialStatus();
  }, [fetchFinancialStatus]);

  // Calcular resumen del estado financiero
  const summary = financialStatus ? paymentsService.getFinancialStatusSummary(financialStatus) : null;

  // Verificar si necesita renovación de matrícula
  const needsRenewal = financialStatus?.enrollment?.needsRenewal || false;

  // Verificar si tiene restricciones de acceso
  const isRestricted = accessStatus?.restricted || false;

  // ✅ NUEVO: Obtener razón de bloqueo con prioridad
  const blockingReason = accessStatus?.reason || null;
  const blockingMessage = accessStatus?.message || null;

  // Obtener obligaciones pendientes agrupadas por tipo
  const pendingObligations = financialStatus?.allMonthlyDebts || [];
  const enrollmentObligation = financialStatus?.enrollment || null;

  // Calcular totales
  const totalDebt = financialStatus?.totalDebt || {
    monthlyAmount: 0,
    lateFeeAmount: 0,
    totalAmount: 0,
    maxDaysLate: 0,
    obligationsCount: 0,
    isAtLateFeeLimit: false,
  };

  // ✅ NUEVO: Detectar obligaciones suspendidas
  const suspendedObligations = pendingObligations.filter(
    obligation => obligation?.metadata?.suspended === true
  );
  const hasSuspendedObligations = suspendedObligations.length > 0;

  // ✅ NUEVO: Detectar si está en el límite de mora
  const isAtLateFeeLimit = totalDebt.isAtLateFeeLimit || totalDebt.maxDaysLate >= 90;

  return {
    // Estados principales
    financialStatus,
    accessStatus,
    loading,
    error,
    
    // Datos procesados
    summary,
    needsRenewal,
    isRestricted,
    blockingReason,
    blockingMessage,
    pendingObligations,
    enrollmentObligation,
    totalDebt,
    
    // ✅ NUEVO: Obligaciones suspendidas
    suspendedObligations,
    hasSuspendedObligations,
    
    // ✅ NUEVO: Límite de mora
    isAtLateFeeLimit,
    
    // Acciones
    refresh: fetchFinancialStatus,
    refetch: fetchFinancialStatus, // Alias para compatibilidad
    
    // Utilidades
    hasDebt: totalDebt.totalAmount > 0,
    isBlocked: totalDebt.maxDaysLate >= 15, // ✅ Actualizado: 15 días según backend
    
    // ✅ MEJORADO: Detección de matrícula inicial vs renovación usando campo isInitial
    hasInitialEnrollmentPending: enrollmentObligation && (
      enrollmentObligation.isInitial === true ||
      enrollmentObligation.type === 'INITIAL_ENROLLMENT' ||
      (!enrollmentObligation.needsRenewal && !enrollmentObligation.estado)
    ),
    hasRenewalPending: needsRenewal && enrollmentObligation && (
      enrollmentObligation.needsRenewal === true &&
      enrollmentObligation.isInitial !== true &&
      enrollmentObligation.type !== 'INITIAL_ENROLLMENT'
    )
  };
};