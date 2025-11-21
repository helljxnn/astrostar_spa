/**
 * Hook personalizado para manejar empleados
 * Proporciona estado y funciones para operaciones CRUD
 */

import { useState, useEffect, useCallback } from 'react';
import employeeService from '../services/employeeService.js';
import { showSuccessAlert, showErrorAlert } from '@shared/utils/alerts.js';
import { useAuth } from '@shared/contexts/authContext.jsx';

export const useEmployees = () => {
  const { isAuthenticated } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [referenceData, setReferenceData] = useState({
    roles: [],
    documentTypes: []
  });

  /**
   * Cargar empleados con filtros
   */
  const loadEmployees = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await employeeService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        ...params
      });

      if (response.success) {
        setEmployees(response.data);
        setPagination(response.pagination);
      } else {
        throw new Error(response.message || 'Error cargando empleados');
      }
    } catch (err) {
      setError(err.message);
      showErrorAlert('Error', 'No se pudieron cargar los empleados');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  /**
   * Cargar datos de referencia
   */
  const loadReferenceData = useCallback(async () => {
    try {
      const response = await employeeService.getReferenceData();
      if (response.success) {
        setReferenceData(response.data);
      }
    } catch (err) {
      console.error('Error cargando datos de referencia:', err);
    }
  }, []);

  /**
   * Crear empleado
   */
  const createEmployee = useCallback(async (employeeData) => {
    setLoading(true);
    
    try {
      const response = await employeeService.create(employeeData);
      
      if (response.success) {
        // Recargar la lista
        await loadEmployees();
        
        // Retornar toda la respuesta para que el componente pueda manejar las credenciales
        return {
          success: true,
          data: response.data,
          emailSent: response.emailSent,
          temporaryPassword: response.temporaryPassword,
          message: response.message
        };
      } else {
        throw new Error(response.message || 'Error creando empleado');
      }
    } catch (err) {
      showErrorAlert('Error', err.message || 'No se pudo crear el empleado');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadEmployees]);

  /**
   * Actualizar empleado
   */
  const updateEmployee = useCallback(async (id, employeeData) => {
    setLoading(true);
    
    try {
      const response = await employeeService.update(id, employeeData);
      
      if (response.success) {
        showSuccessAlert(
          'Empleado Actualizado', 
          `${response.data.user.firstName} ${response.data.user.lastName} ha sido actualizado exitosamente`
        );
        
        // Recargar la lista
        await loadEmployees();
        return response.data;
      } else {
        throw new Error(response.message || 'Error actualizando empleado');
      }
    } catch (err) {
      showErrorAlert('Error', err.message || 'No se pudo actualizar el empleado');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadEmployees]);

  /**
   * Eliminar empleado
   */
  const deleteEmployee = useCallback(async (id, employeeName) => {
    setLoading(true);
    
    try {
      const response = await employeeService.delete(id);
      
      if (response.success) {
        showSuccessAlert('Empleado Eliminado', response.message);
        
        // Recargar la lista
        await loadEmployees();
        return true;
      } else {
        throw new Error(response.message || 'Error eliminando empleado');
      }
    } catch (err) {
      showErrorAlert('Error', err.message || 'No se pudo eliminar el empleado');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadEmployees]);

  /**
   * Verificar disponibilidad de email
   */
  const checkEmailAvailability = useCallback(async (email, excludeUserId = null) => {
    try {
      const response = await employeeService.checkEmailAvailability(email, excludeUserId);
      return response;
    } catch (err) {
      console.error('Error verificando email:', err);
      return { available: false, message: 'Error verificando email' };
    }
  }, []);

  /**
   * Verificar disponibilidad de identificación
   */
  const checkIdentificationAvailability = useCallback(async (identification, excludeUserId = null) => {
    try {
      const response = await employeeService.checkIdentificationAvailability(identification, excludeUserId);
      return response;
    } catch (err) {
      console.error('Error verificando identificación:', err);
      return { available: false, message: 'Error verificando identificación' };
    }
  }, []);

  /**
   * Cambiar página
   */
  const changePage = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  /**
   * Cambiar límite por página
   */
  const changeLimit = useCallback((newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  }, []);

  // Cargar datos iniciales solo si está autenticado
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (isAuthenticated && token) {
      loadReferenceData();
    }
  }, [isAuthenticated, loadReferenceData]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (isAuthenticated && token) {
      loadEmployees();
    }
  }, [isAuthenticated, loadEmployees]);

  return {
    // Estado
    employees,
    loading,
    error,
    pagination,
    referenceData,
    
    // Funciones
    loadEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    checkEmailAvailability,
    checkIdentificationAvailability,
    changePage,
    changeLimit,
    
    // Utilidades
    refresh: loadEmployees
  };
};