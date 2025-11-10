/**
 * Hook personalizado para gestión de roles - Módulo específico
 * Proporciona funcionalidades completas para el manejo de roles
 */

import { useState, useEffect, useCallback } from 'react';
import rolesService from '../services/rolesService';
import { 
  showSuccessAlert, 
  showErrorAlert, 
  showConfirmAlert 
} from '../../../../../../../shared/utils/alerts';

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  /**
   * Obtener todos los roles con parámetros opcionales
   * @param {object} params - Parámetros de consulta
   */
  const fetchRoles = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {

      const response = await rolesService.getAllRoles(params);
      
      if (response.success) {
        setRoles(response.data || []);
        setPagination(response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        });

      } else {
        throw new Error(response.message || 'Error fetching roles');
      }
    } catch (err) {
      console.error('❌ Error fetching roles:', err);
      setError(err.message);
      showErrorAlert('Error', 'No se pudieron cargar los roles');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nuevo rol
   * @param {object} roleData - Datos del rol
   * @param {object} currentParams - Parámetros actuales para refrescar
   */
  const createRole = async (roleData, currentParams = {}) => {
    setLoading(true);
    
    try {

      const response = await rolesService.createRole(roleData);
      
      if (response.success) {
        showSuccessAlert('Éxito', 'Rol creado correctamente');
        await fetchRoles(currentParams);
        return response.data;
      } else {
        throw new Error(response.message || 'Error creating role');
      }
    } catch (err) {
      console.error('❌ Error creating role:', err);
      showErrorAlert('Error', err.message || 'No se pudo crear el rol');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar rol existente
   * @param {number} id - ID del rol
   * @param {object} roleData - Nuevos datos del rol
   * @param {object} currentParams - Parámetros actuales para refrescar
   */
  const updateRole = async (id, roleData, currentParams = {}) => {
    setLoading(true);
    
    try {

      const response = await rolesService.updateRole(id, roleData);
      
      if (response.success) {
        showSuccessAlert('Éxito', 'Rol actualizado correctamente');
        await fetchRoles(currentParams);
        return response.data;
      } else {
        throw new Error(response.message || 'Error updating role');
      }
    } catch (err) {
      console.error('❌ Error updating role:', err);
      showErrorAlert('Error', err.message || 'No se pudo actualizar el rol');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar rol con confirmación
   * @param {object} role - Rol a eliminar
   * @param {object} currentParams - Parámetros actuales para refrescar
   */
  const deleteRole = async (role, currentParams = {}) => {
    const result = await showConfirmAlert(
      '¿Eliminar rol?',
      `Se eliminará el rol: ${role.name || role.nombre}`,
      'warning'
    );

    if (!result.isConfirmed) return false;

    setLoading(true);
    
    try {

      const response = await rolesService.deleteRole(role.id);
      
      if (response.success) {
        showSuccessAlert('Éxito', 'Rol eliminado correctamente');
        await fetchRoles(currentParams);
        return true;
      } else {
        throw new Error(response.message || 'Error deleting role');
      }
    } catch (err) {
      console.error('❌ Error deleting role:', err);
      showErrorAlert('Error', err.message || 'No se pudo eliminar el rol');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener rol por ID
   * @param {number} id - ID del rol
   */
  const getRoleById = async (id) => {
    setLoading(true);
    
    try {

      const response = await rolesService.getRoleById(id);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Role not found');
      }
    } catch (err) {
      console.error('❌ Error getting role:', err);
      showErrorAlert('Error', err.message || 'No se pudo obtener el rol');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verificar disponibilidad de nombre
   * @param {string} name - Nombre a verificar
   * @param {number} excludeId - ID a excluir (para edición)
   */
  const checkNameAvailability = async (name, excludeId = null) => {
    try {

      const response = await rolesService.checkRoleNameAvailability(name, excludeId);
      return response;
    } catch (err) {
      console.error('❌ Error checking name availability:', err);
      throw err;
    }
  };

  /**
   * Obtener estadísticas de roles
   */
  const getRoleStats = async () => {
    try {

      const response = await rolesService.getRoleStats();
      return response.data;
    } catch (err) {
      console.error('❌ Error getting role stats:', err);
      showErrorAlert('Error', 'No se pudieron obtener las estadísticas');
      throw err;
    }
  };

  /**
   * Obtener permisos disponibles
   */
  const getAvailablePermissions = async () => {
    try {

      const response = await rolesService.getAvailablePermissions();
      return response.data;
    } catch (err) {
      console.error('❌ Error getting permissions:', err);
      showErrorAlert('Error', 'No se pudieron obtener los permisos');
      throw err;
    }
  };

  /**
   * Cambiar estado de un rol
   * @param {number} id - ID del rol
   * @param {string} status - Nuevo estado
   * @param {object} currentParams - Parámetros actuales para refrescar
   */
  const changeRoleStatus = async (id, status, currentParams = {}) => {
    setLoading(true);
    
    try {

      const response = await rolesService.changeRoleStatus(id, status);
      
      if (response.success) {
        const statusText = status === 'Active' ? 'activado' : 'desactivado';
        showSuccessAlert('Éxito', `Rol ${statusText} correctamente`);
        await fetchRoles(currentParams);
        return response.data;
      } else {
        throw new Error(response.message || 'Error changing role status');
      }
    } catch (err) {
      console.error('❌ Error changing role status:', err);
      showErrorAlert('Error', err.message || 'No se pudo cambiar el estado del rol');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Duplicar un rol
   * @param {number} id - ID del rol a duplicar
   * @param {string} newName - Nuevo nombre
   * @param {object} currentParams - Parámetros actuales para refrescar
   */
  const duplicateRole = async (id, newName, currentParams = {}) => {
    setLoading(true);
    
    try {

      const response = await rolesService.duplicateRole(id, newName);
      
      if (response.success) {
        showSuccessAlert('Éxito', 'Rol duplicado correctamente');
        await fetchRoles(currentParams);
        return response.data;
      } else {
        throw new Error(response.message || 'Error duplicating role');
      }
    } catch (err) {
      console.error('❌ Error duplicating role:', err);
      showErrorAlert('Error', err.message || 'No se pudo duplicar el rol');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Buscar roles
   * @param {string} searchTerm - Término de búsqueda
   * @param {number} limit - Límite de resultados
   */
  const searchRoles = async (searchTerm, limit = 20) => {
    setLoading(true);
    
    try {

      const response = await rolesService.searchRoles(searchTerm, limit);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Error searching roles');
      }
    } catch (err) {
      console.error('❌ Error searching roles:', err);
      showErrorAlert('Error', 'No se pudieron buscar los roles');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Exportar roles
   * @param {string} format - Formato de exportación
   */
  const exportRoles = async (format = 'json') => {
    setLoading(true);
    
    try {

      const data = await rolesService.exportRoles(format);
      
      // Crear y descargar archivo
      const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 2)], {
        type: format === 'csv' ? 'text/csv' : 'application/json'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `roles_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccessAlert('Éxito', 'Roles exportados correctamente');
    } catch (err) {
      console.error('❌ Error exporting roles:', err);
      showErrorAlert('Error', 'No se pudieron exportar los roles');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    // Estado
    roles,
    loading,
    error,
    pagination,
    
    // Operaciones CRUD
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    getRoleById,
    
    // Operaciones adicionales
    checkNameAvailability,
    getRoleStats,
    getAvailablePermissions,
    changeRoleStatus,
    duplicateRole,
    searchRoles,
    exportRoles
  };
};

export default useRoles;