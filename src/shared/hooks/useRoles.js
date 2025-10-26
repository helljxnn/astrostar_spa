import { useState, useEffect, useCallback } from 'react';
import rolesService from '../services/rolesService';
import { 
  showSuccessAlert, 
  showErrorAlert, 
  showConfirmAlert 
} from '../utils/Alerts';

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

  // Fetch all roles
  const fetchRoles = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await rolesService.getAllRoles(params);
      
      if (response.success) {
        setRoles(response.data);
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
      setError(err.message);
      showErrorAlert('Error', 'No se pudieron cargar los roles');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array to avoid circular dependency

  // Create role
  const createRole = async (roleData, currentParams = {}) => {
    setLoading(true);
    
    try {
      const response = await rolesService.createRole(roleData);
      
      if (response.success) {
        showSuccessAlert('Éxito', 'Rol creado correctamente');
        // Refresh with current params to maintain pagination state
        await fetchRoles(currentParams);
        return response.data;
      } else {
        throw new Error(response.message || 'Error creating role');
      }
    } catch (err) {
      showErrorAlert('Error', err.message || 'No se pudo crear el rol');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update role
  const updateRole = async (id, roleData, currentParams = {}) => {
    setLoading(true);
    
    try {
      const response = await rolesService.updateRole(id, roleData);
      
      if (response.success) {
        showSuccessAlert('Éxito', 'Rol actualizado correctamente');
        // Refresh with current params to maintain pagination state
        await fetchRoles(currentParams);
        return response.data;
      } else {
        throw new Error(response.message || 'Error updating role');
      }
    } catch (err) {
      showErrorAlert('Error', err.message || 'No se pudo actualizar el rol');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete role
  const deleteRole = async (role, currentParams = {}) => {
    const result = await showConfirmAlert(
      '¿Eliminar rol?',
      `Se eliminará el rol: ${role.name || role.nombre}`
    );

    if (!result.isConfirmed) return false;

    setLoading(true);
    
    try {
      const response = await rolesService.deleteRole(role.id);
      
      if (response.success) {
        showSuccessAlert('Éxito', 'Rol eliminado correctamente');
        // Refresh with current params to maintain pagination state
        await fetchRoles(currentParams);
        return true;
      } else {
        throw new Error(response.message || 'Error deleting role');
      }
    } catch (err) {
      showErrorAlert('Error', err.message || 'No se pudo eliminar el rol');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get role by ID
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
      showErrorAlert('Error', err.message || 'No se pudo obtener el rol');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initial load removed - component handles this with specific params

  return {
    roles,
    loading,
    error,
    pagination,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    getRoleById
  };
};