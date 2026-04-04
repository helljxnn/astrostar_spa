import { useState, useEffect, useCallback } from "react";
import PaymentsService from "../services/PaymentsService.js";
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts.js";
import { 
  getActiveRestrictions, 
  getHighestPriorityRestriction,
  hasFullAccess,
  hasPartialAccess,
  isCompletelyBlocked 
} from "../utils/restrictionUtils.js";

/**
 * Hook para gestionar el estado financiero completo de un atleta
 * Incluye renovación de matrículas, mensualidades y restricciones de acceso
 * Actualizado: usa logica centralizada de restricciones con prioridades
 */
export const useAthleteFinancialStatus = (athleteId) => {
  const [financialStatus, setFinancialStatus] = useState(null);
  const [accessStatus, setAccessStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Crear instancia del servicio
  const paymentsService = new PaymentsService();

  const fetchFinancialStatus = useCallback(async () => {
    if (!athleteId) return;

    setLoading(true);
    setError(null);

    try {
      // Obtener estado financiero completo
      const [financial, access] = await Promise.all([
        paymentsService.getAthleteFinancialStatus(athleteId),
        paymentsService.checkAthleteAccess(athleteId)
      ]);

      // Nuevo: validar y normalizar respuesta del backend
      const normalizedFinancial = {
        ...financial,
        // Asegurar que allMonthlyDebts existe
        allMonthlyDebts: Array.isArray(financial?.allMonthlyDebts) 
          ? financial.allMonthlyDebts 
          : [],
        
        // Asegurar estructura de totalDebt
        totalDebt: {
          monthlyAmount: financial?.totalDebt?.monthlyAmount || 0,
          lateFeeAmount: financial?.totalDebt?.lateFeeAmount || 0,
          totalAmount: financial?.totalDebt?.totalAmount || 0,
          maxDaysLate: financial?.totalDebt?.maxDaysLate || 0,
          obligationsCount: financial?.totalDebt?.obligationsCount || 0,
          isAtLateFeeLimit: (financial?.totalDebt?.maxDaysLate || 0) >= 90,
        },
        
        // Asegurar estructura de enrollment
        enrollment: financial?.enrollment ? {
          ...financial.enrollment,
          isInitial: financial.enrollment.isInitial || false,
          estado: financial.enrollment.estado || null,
          needsRenewal: financial.enrollment.needsRenewal || false,
        } : null,
      };

      // Nuevo: validar estructura de accessStatus
      const normalizedAccess = {
        restricted: access?.restricted || false,
        reason: access?.reason || null,
        message: access?.message || null,
        priority: access?.priority || null,
      };

      setFinancialStatus(normalizedFinancial);
      setAccessStatus(normalizedAccess);
    } catch (err) {
      setError(err.message || 'Error al obtener estado financiero');
      showErrorAlert('Error', 'No se pudo cargar el estado financiero');
      
      // Nuevo: fallback con estructura completa
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

  // Nuevo: usar logica centralizada de restricciones
  const restrictions = financialStatus ? getActiveRestrictions(financialStatus, accessStatus) : [];
  const highestRestriction = getHighestPriorityRestriction(financialStatus, accessStatus);
  
  // Estados de acceso usando lógica centralizada
  const hasFullSystemAccess = hasFullAccess(financialStatus, accessStatus);
  const hasPartialSystemAccess = hasPartialAccess(financialStatus, accessStatus);
  const isSystemBlocked = isCompletelyBlocked(financialStatus, accessStatus);

  // Calcular resumen del estado financiero
  const summary = financialStatus ? {
    hasDebt: (financialStatus.totalDebt?.totalAmount || 0) > 0,
    totalAmount: financialStatus.totalDebt?.totalAmount || 0,
    monthlyAmount: financialStatus.totalDebt?.monthlyAmount || 0,
    lateFeeAmount: financialStatus.totalDebt?.lateFeeAmount || 0,
    obligationsCount: financialStatus.totalDebt?.obligationsCount || 0,
    maxDaysLate: financialStatus.totalDebt?.maxDaysLate || 0
  } : null;

  // Verificar si necesita renovación de matrícula
  const needsRenewal = financialStatus?.enrollment?.needsRenewal || false;

  // Verificar si tiene restricciones de acceso
  const isRestricted = restrictions.length > 0;

  // Obtener razón de bloqueo con prioridad
  const blockingReason = highestRestriction?.reason || null;
  const blockingMessage = highestRestriction?.message || null;

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

  // Nuevo: detectar obligaciones suspendidas
  const suspendedObligations = pendingObligations.filter(
    obligation => obligation?.metadata?.suspended === true
  );
  const hasSuspendedObligations = suspendedObligations.length > 0;

  // Nuevo: detectar si esta en el limite de mora
  const isAtLateFeeLimit = totalDebt.isAtLateFeeLimit || totalDebt.maxDaysLate >= 90;

  return {
    // Estados principales
    financialStatus,
    accessStatus,
    loading,
    error,
    
    // Nuevo: restricciones centralizadas
    restrictions,
    highestRestriction,
    hasFullSystemAccess,
    hasPartialSystemAccess,
    isSystemBlocked,
    
    // Datos procesados (compatibilidad)
    summary,
    needsRenewal,
    isRestricted,
    blockingReason,
    blockingMessage,
    pendingObligations,
    enrollmentObligation,
    totalDebt,
    
    // Obligaciones suspendidas
    suspendedObligations,
    hasSuspendedObligations,
    
    // Límite de mora
    isAtLateFeeLimit,
    
    // Acciones
    refresh: fetchFinancialStatus,
    refetch: fetchFinancialStatus, // Alias para compatibilidad
    
    // Utilidades mejoradas
    hasDebt: totalDebt.totalAmount > 0,
    isBlocked: totalDebt.maxDaysLate >= 15, // 15 días según backend
    
    // Mejorado: deteccion precisa usando campo isInitial
    hasInitialEnrollmentPending: enrollmentObligation && (
      enrollmentObligation.isInitial === true ||
      enrollmentObligation.type === 'ENROLLMENT_INITIAL' ||
      (!enrollmentObligation.needsRenewal && !enrollmentObligation.estado)
    ),
    hasRenewalPending: needsRenewal && enrollmentObligation && (
      enrollmentObligation.needsRenewal === true &&
      enrollmentObligation.isInitial !== true &&
      enrollmentObligation.type !== 'ENROLLMENT_INITIAL'
    )
  };
};
