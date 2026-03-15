import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/authContext';
import apiClient from '../services/apiClient';

/**
 * Hook para obtener permisos dinámicos basados en el estado de la matrícula
 * Integrado con el nuevo endpoint del backend /api/auth/permissions
 * Incluye verificación de renovación de matrículas y restricciones de acceso
 */
export const useDynamicPermissions = () => {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState(null);
  const [hasActiveEnrollment, setHasActiveEnrollment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessRestrictions, setAccessRestrictions] = useState(null);

  const fetchPermissions = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Llamar al nuevo endpoint del backend
      const response = await apiClient.get('/auth/permissions');
      
      if (response.success) {
        setPermissions(response.data.permissions);
        setHasActiveEnrollment(response.data.hasActiveEnrollment);
        
        // Si es atleta, verificar restricciones adicionales
        if (user.athleteId || user.athlete_id) {
          try {
            const athleteId = user.athleteId || user.athlete_id;
            const accessResponse = await apiClient.get(`/payments/athletes/${athleteId}/access-check`);
            setAccessRestrictions(accessResponse.data);
            
            // CRÍTICO: Verificar también el estado financiero para determinar si realmente tiene matrícula activa
            const financialResponse = await apiClient.get(`/payments/athletes/${athleteId}/financial-status`);
            const enrollment = financialResponse.data?.enrollment;
            
            // Una matrícula está realmente activa solo si:
            // 1. Estado es "Vigente" Y 2. Tiene fecha de inicio (fue pagada y activada)
            const reallyHasActiveEnrollment = enrollment?.estado === 'Vigente' && enrollment?.fechaInicio;
            
            console.log('🔍 Verificación de matrícula activa:', {
              backendSays: response.data.hasActiveEnrollment,
              enrollmentStatus: enrollment?.estado,
              startDate: enrollment?.fechaInicio,
              reallyActive: reallyHasActiveEnrollment
            });
            
            // Sobrescribir el valor del backend si es necesario
            setHasActiveEnrollment(reallyHasActiveEnrollment);
            
          } catch (accessError) {
            console.warn('No se pudieron obtener restricciones de acceso:', accessError);
            setAccessRestrictions(null);
          }
        }
        
        console.log('✅ Permisos dinámicos cargados:', {
          permissions: response.data.permissions,
          hasActiveEnrollment: response.data.hasActiveEnrollment,
          accessRestrictions
        });
      } else {
        throw new Error(response.message || 'Error obteniendo permisos');
      }
    } catch (err) {
      console.error('❌ Error fetching dynamic permissions:', err);
      setError(err.message);
      // Fallback a permisos del rol si falla
      setPermissions(user?.role?.permissions || {});
      setHasActiveEnrollment(false);
      setAccessRestrictions(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, user?.athleteId, user?.athlete_id]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

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
    
    // Verificaciones especiales para módulos que requieren matrícula activa
    const enrollmentRequiredModules = ['Citas', 'Eventos', 'Materiales'];
    if (enrollmentRequiredModules.includes(permissionKey)) {
      if (!hasActiveEnrollment) return false;
    }
    
    // Verificar restricciones de acceso para atletas
    if (accessRestrictions?.restricted) {
      const restrictedModules = ['Citas', 'Eventos', 'Materiales'];
      if (restrictedModules.includes(permissionKey)) {
        return false;
      }
    }
    
    return true;
  }, [permissions, hasActiveEnrollment, accessRestrictions]);

  /**
   * Refrescar permisos manualmente (útil después de acciones importantes)
   */
  const refreshPermissions = useCallback(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Verificar si el usuario está restringido
  const isRestricted = accessRestrictions?.restricted || false;
  
  // Obtener mensaje de restricción
  const restrictionMessage = accessRestrictions?.message || null;
  
  // Verificar si necesita renovación de matrícula
  const needsRenewal = accessRestrictions?.reason === 'ENROLLMENT_PENDING' || false;

  return {
    permissions,
    hasActiveEnrollment,
    loading,
    error,
    accessRestrictions,
    isRestricted,
    restrictionMessage,
    needsRenewal,
    hasModuleAccess,
    refresh: fetchPermissions,
    refreshPermissions
  };
};