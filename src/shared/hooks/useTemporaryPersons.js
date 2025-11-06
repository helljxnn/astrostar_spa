/**
 * Hook personalizado para manejar personas temporales
 * Proporciona estado y funciones para operaciones CRUD
 */

import { useState, useEffect, useCallback } from 'react';
import temporaryPersonsService from '../../features/dashboard/pages/Admin/pages/Services/TemporaryPersons/services/temporaryPersonsService.js';
import { showSuccessAlert, showErrorAlert } from '../utils/alerts.js';
import { useAuth } from '../contexts/authContext.jsx';

export const useTemporaryPersons = () => {
  const { isAuthenticated } = useAuth();
  const [temporaryPersons, setTemporaryPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [referenceData, setReferenceData] = useState({
    documentTypes: []
  });

  /**
   * Cargar personas temporales con filtros
   */
  const loadTemporaryPersons = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await temporaryPersonsService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        ...params
      });

      if (response.success) {
        setTemporaryPersons(response.data);
        setPagination(response.pagination);
      } else {
        throw new Error(response.message || 'Error cargando personas temporales');
      }
    } catch (err) {
      setError(err.message);
      showErrorAlert('Error', 'No se pudieron cargar las personas temporales');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  /**
   * Cargar datos de referencia
   */
  const loadReferenceData = useCallback(async () => {
    try {
      const response = await temporaryPersonsService.getReferenceData();
      if (response.success) {
        setReferenceData(response.data);
      }
    } catch (err) {
      console.error('Error cargando datos de referencia:', err);
    }
  }, []);

  /**
   * Crear persona temporal
   */
  const createTemporaryPerson = useCallback(async (personData) => {
    setLoading(true);
    
    try {
      const response = await temporaryPersonsService.create(personData);
      
      if (response.success) {
        showSuccessAlert(
          'Persona Temporal Creada', 
          response.message || 'La persona temporal ha sido creada exitosamente'
        );
        
        // Recargar la lista
        await loadTemporaryPersons();
        return response.data;
      } else {
        throw new Error(response.message || 'Error creando persona temporal');
      }
    } catch (err) {
      showErrorAlert('Error', err.message || 'No se pudo crear la persona temporal');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadTemporaryPersons]);

  /**
   * Actualizar persona temporal
   */
  const updateTemporaryPerson = useCallback(async (id, personData) => {
    setLoading(true);
    
    try {
      const response = await temporaryPersonsService.update(id, personData);
      
      if (response.success) {
        showSuccessAlert(
          'Persona Temporal Actualizada', 
          response.message || 'La persona temporal ha sido actualizada exitosamente'
        );
        
        // Recargar la lista
        await loadTemporaryPersons();
        return response.data;
      } else {
        throw new Error(response.message || 'Error actualizando persona temporal');
      }
    } catch (err) {
      showErrorAlert('Error', err.message || 'No se pudo actualizar la persona temporal');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadTemporaryPersons]);

  /**
   * Eliminar persona temporal
   */
  const deleteTemporaryPerson = useCallback(async (id, personName) => {
    setLoading(true);
    
    try {
      const response = await temporaryPersonsService.delete(id);
      
      if (response.success) {
        showSuccessAlert('Persona Temporal Eliminada', response.message);
        
        // Recargar la lista
        await loadTemporaryPersons();
        return true;
      } else {
        throw new Error(response.message || 'Error eliminando persona temporal');
      }
    } catch (err) {
      showErrorAlert('Error', err.message || 'No se pudo eliminar la persona temporal');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadTemporaryPersons]);

  /**
   * Verificar disponibilidad de email
   */
  const checkEmailAvailability = useCallback(async (email, excludeId = null) => {
    try {
      const response = await temporaryPersonsService.checkEmailAvailability(email, excludeId);
      return response;
    } catch (err) {
      console.error('Error verificando email:', err);
      return { available: false, message: 'Error verificando email' };
    }
  }, []);

  /**
   * Verificar disponibilidad de identificación
   */
  const checkIdentificationAvailability = useCallback(async (identification, excludeId = null) => {
    try {
      const response = await temporaryPersonsService.checkIdentificationAvailability(identification, excludeId);
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
    if (isAuthenticated) {
      loadReferenceData();
    }
  }, [isAuthenticated, loadReferenceData]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTemporaryPersons();
    }
  }, [isAuthenticated, loadTemporaryPersons]);

  return {
    // Estado
    temporaryPersons,
    loading,
    error,
    pagination,
    referenceData,
    
    // Funciones
    loadTemporaryPersons,
    createTemporaryPerson,
    updateTemporaryPerson,
    deleteTemporaryPerson,
    checkEmailAvailability,
    checkIdentificationAvailability,
    changePage,
    changeLimit,
    
    // Utilidades
    refresh: loadTemporaryPersons
  };
};