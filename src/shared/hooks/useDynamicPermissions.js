import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/authContext';
import apiClient from '../services/apiClient';
import { 
  getActiveRestrictions, 
  getHighestPriorityRestriction,
  getAllowedModules,
  isModuleAllowed 
} from '../../features/dashboard/pages/Admin/pages/Athletes/Payments/utils/restrictionUtils.js';

/**
 * Hook para obtener permisos dinámicos basados en el estado de la matrícula
 * Integrado con el nuevo endpoint del backend /api/auth/permissions
 * ✅ ACTUALIZADO: Usa lógica centralizada de restricciones con prioridades
 */
export const useDynamicPermissions = () => {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState(null);
  const [hasActiveEnrollment, setHasActiveEnrollment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessRestrictions, setAccessRestrictions] = useState(null);
  const [financialStatus, setFinancialStatus] = useState(null);

  const fetchPermissions = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Llamar al endpoint de permisos del backend
      const response = await apiClient.get('/auth/permissions');
      
      if (response.success) {
        setPermissions(response.data.permissions);
        setHasActiveEnrollment(response.data.hasActiveEnrollment);
        
        // Si es atleta, verificar restricciones adicionales
        if (user.athleteId || user.athlete_id || user?.role?.name === "Deportista") {
          try {
            const athleteId = user.athleteId || user.athlete_id || user.id;
            
            // Obtener estado financiero y restricciones
            const [accessResponse, financialResponse] = await Promise.all([
              apiClient.get(`/payments/athletes/${athleteId}/access-check`),
              apiClient.get(`/payments/athletes/${athleteId}/financial-status`)
            ]);
            
            const financial = financialResponse.data;
            const access = accessResponse.data;
            
            setFinancialStatus(financial);
            setAccessRestrictions(access);
            
            // ✅ NUEVO: Usar lógica centralizada para determinar matrícula activa
            const enrollment = financial?.enrollment;
            const reallyHasActiveEnrollment = enrollment?.estado === 'Vigente' && enrollment?.fechaInicio;
            
            
            setHasActiveEnrollment(reallyHasActiveEnrollment);
            
          } catch (accessError) {

            setAccessRestrictions(null);
            setFinancialStatus(null);
          }
        }
        
      } else {
        throw new Error(response.message || 'Error obteniendo permisos');
      }
    } catch (err) {

      setError(err.message);
      // Fallback a permisos del rol si falla
      setPermissions(user?.role?.permissions || {});
      setHasActiveEnrollment(false);
      setAccessRestrictions(null);
      setFinancialStatus(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, user?.athleteId, user?.athlete_id]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // ✅ NUEVO: Usar lógica centralizada de restricciones
  const restrictions = financialStatus ? getActiveRestrictions(financialStatus, accessRestrictions) : [];
  const highestRestriction = getHighestPriorityRestriction(financialStatus, accessRestrictions);
  const allowedModules = getAllowedModules(financialStatus, accessRestrictions);

  /**
   * Verificar si el usuario tiene acceso a un módulo específico
   */
  const hasModuleAccess = useCallback((moduleId) => {
    if (!permissions) return false;
    
    // Mapeo de módulos a permisos del backend
    const modulePermissionMap = {
      'appointmentManagement': 'Citas',
      'myPayments': 'Pagos', 
      'enrollments': 'Matriculas',
      'athletesSection': 'Deportistas',
      'paymentsManagement': 'Pagos',
      'users': 'Usuarios',
      'roles': 'Roles',
      'events': 'Eventos',
      'inscriptions': 'Inscripciones'
    };

    const permissionKey = modulePermissionMap[moduleId];
    if (!permissionKey) return false;
    
    // Verificar permisos básicos del módulo
    const modulePermissions = permissions[permissionKey];
    if (!modulePermissions || !modulePermissions.Ver) return false;
    
    // ✅ NUEVO: Usar lógica centralizada de restricciones
    return isModuleAllowed(moduleId, financialStatus, accessRestrictions);
  }, [permissions, financialStatus, accessRestrictions]);

  /**
   * Refrescar permisos manualmente (útil después de acciones importantes)
   */
  const refreshPermissions = useCallback(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // ✅ NUEVO: Estados usando lógica centralizada
  const isRestricted = restrictions.length > 0;
  const restrictionMessage = highestRestriction?.message || null;
  const needsRenewal = highestRestriction?.reason === 'ENROLLMENT_RENEWAL_PENDING' || false;

  return {
    permissions,
    hasActiveEnrollment,
    loading,
    error,
    
    // ✅ NUEVO: Restricciones centralizadas
    restrictions,
    highestRestriction,
    allowedModules,
    financialStatus,
    
    // Estados de restricción (compatibilidad)
    accessRestrictions,
    isRestricted,
    restrictionMessage,
    needsRenewal,
    
    // Funciones
    hasModuleAccess,
    refresh: fetchPermissions,
    refreshPermissions
  };
};



