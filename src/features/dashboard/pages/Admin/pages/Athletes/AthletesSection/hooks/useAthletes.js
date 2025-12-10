/**
 * Hook personalizado para manejar deportistas
 * Proporciona estado y funciones para operaciones CRUD
 */

import { useState, useEffect, useCallback } from 'react';
import AthletesService from '../services/AthletesService.js';
import GuardiansService from '../services/GuardiansService.js';
import { showSuccessAlert, showErrorAlert } from '../../../../../../../../shared/utils/alerts.js';
import { useAuth } from '../../../../../../../../shared/contexts/authContext.jsx';

export const useAthletes = () => {
  const { isAuthenticated } = useAuth();
  const [athletes, setAthletes] = useState([]);
  const [guardians, setGuardians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [referenceData, setReferenceData] = useState({
    documentTypes: [], // Para deportistas (filtrados)
    guardianDocumentTypes: [], // Para acudientes (todos, igual que empleados)
    sportsCategories: []
  });

  /**
   * Cargar deportistas con filtros
   */
  const loadAthletes = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 [useAthletes] Cargando deportistas con params:', params);
      const response = await AthletesService.getAthletes({
        page: pagination.page,
        limit: pagination.limit,
        ...params
      });
      console.log('🔄 [useAthletes] Respuesta de getAthletes:', response);

      if (response.success) {
        console.log('✅ [useAthletes] Deportistas cargados:', response.data.length);
        setAthletes(response.data);
        setPagination(response.pagination);
      } else {
        console.error('❌ [useAthletes] Error en respuesta:', response.error);
        throw new Error(response.error || 'Error cargando deportistas');
      }
    } catch (err) {
      console.error('❌ [useAthletes] Excepción al cargar deportistas:', err);
      setError(err.message);
      showErrorAlert('Error', 'No se pudieron cargar los deportistas');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  /**
   * Cargar acudientes
   */
  const loadGuardians = useCallback(async () => {
    try {
      console.log('🔄 Cargando acudientes...');
      const response = await GuardiansService.getGuardians({
        limit: 100 // Límite máximo permitido por el backend
      });

      console.log('📋 Respuesta de acudientes:', response);
      
      if (response.success) {
        console.log('✅ Acudientes cargados:', response.data.length);
        setGuardians(response.data);
      } else {
        console.error('❌ Error en respuesta de acudientes:', response);
      }
    } catch (err) {
      console.error('❌ Error cargando acudientes:', err);
    }
  }, []);

  /**
   * Cargar datos de referencia (tipos de documento y categorías deportivas)
   */
  const loadReferenceData = useCallback(async () => {
    try {
      // Importar apiClient dinámicamente
      const apiClient = (await import('../../../../../../../../shared/services/apiClient.js')).default;
      
      // Cargar tipos de documento desde el endpoint de deportistas (incluye RC)
      console.log('📋 Cargando tipos de documento para deportistas...');
      const athletesDocTypesResponse = await AthletesService.getDocumentTypes();
      
      // Cargar TODOS los tipos de documento para acudientes
      console.log('📋 Cargando todos los tipos de documento...');
      let allDocTypesResponse = await apiClient.get('/document-types');
      
      // Si falla, usar el endpoint de empleados
      if (!allDocTypesResponse || !allDocTypesResponse.success) {
        console.log('⚠️ Endpoint /document-types no disponible, usando /employees/reference-data');
        allDocTypesResponse = await apiClient.get('/employees/reference-data');
      }
      
      if (allDocTypesResponse && allDocTypesResponse.success) {
        // Obtener los tipos de documento de la respuesta
        const allDocTypes = allDocTypesResponse.data?.documentTypes || allDocTypesResponse.data || [];
        console.log('📋 Todos los tipos de documento disponibles:', allDocTypes);
        console.log('📊 Total tipos:', allDocTypes.length);
        
        // Para DEPORTISTAS: Usar los tipos del endpoint específico de deportistas
        let athleteDocTypes = [];
        
        if (athletesDocTypesResponse && athletesDocTypesResponse.success && athletesDocTypesResponse.data) {
          // Transformar los datos del backend (tienen 'name') a la estructura esperada (con 'label' y 'value')
          athleteDocTypes = athletesDocTypesResponse.data.map(dt => ({
            id: dt.id,
            value: dt.id,
            label: dt.name,
            name: dt.name,
            description: dt.description
          }));
          
          console.log('✅ Tipos para DEPORTISTAS (del endpoint específico):', athleteDocTypes);
          console.log('📊 Total deportistas:', athleteDocTypes.length);
          console.log('📋 Nombres deportistas:', athleteDocTypes.map(dt => dt.name));
        } else {
          console.log('⚠️ No se pudieron cargar tipos de deportistas, usando filtro manual');
          // Fallback: filtrar manualmente
          athleteDocTypes = allDocTypes.filter(dt => {
            if (!dt || !dt.label) return false;
            
            const label = dt.label.toLowerCase();
            return (
              (label.includes('registro') && label.includes('civil')) ||
              (label.includes('tarjeta') && label.includes('identidad')) ||
              (label.includes('cédula') && label.includes('ciudadanía')) ||
              (label.includes('cedula') && label.includes('ciudadania')) ||
              (label.includes('cédula') && label.includes('extranjería')) ||
              (label.includes('cedula') && label.includes('extranjeria')) ||
              (label.includes('permiso') && label.includes('permanencia'))
            );
          });
        }
        
        // Para ACUDIENTES: Usar todos EXCEPTO RC, TI y NIT
        const guardianDocTypes = allDocTypes.filter(dt => {
          if (!dt || !dt.label) {
            console.warn('⚠️ Tipo de documento sin label:', dt);
            return false;
          }
          
          const label = dt.label.toLowerCase();
          const isExcluded = (
            (label.includes('registro') && label.includes('civil')) ||
            (label.includes('tarjeta') && label.includes('identidad')) ||
            label.includes('nit') ||
            label.includes('tributaria')
          );
          return !isExcluded;
        });
        
        console.log('✅ Tipos para ACUDIENTES (sin RC, TI ni NIT):', guardianDocTypes);
        console.log('📊 Total acudientes:', guardianDocTypes.length);
        console.log('📋 Nombres acudientes:', guardianDocTypes.map(dt => dt.label));
        
        // Transformar acudientes a la estructura que esperan los componentes
        const guardianDocTypesWithName = guardianDocTypes.map(dt => ({
          ...dt,
          name: dt.label || dt.name // Agregar propiedad 'name' para compatibilidad
        }));
        
        // Guardar ambas listas (athleteDocTypes ya está transformado arriba)
        setReferenceData(prev => ({
          ...prev,
          documentTypes: athleteDocTypes, // Para deportistas (RC, TI, CC, CE, Permiso)
          guardianDocumentTypes: guardianDocTypesWithName // Para acudientes (todos excepto RC y NIT)
        }));
      } else {
        console.error('❌ No se pudieron cargar los tipos de documento');
      }
      
      // Cargar categorías deportivas
      const categoriesResponse = await apiClient.get('/sports-categories');
      
      if (categoriesResponse && categoriesResponse.success) {
        setReferenceData(prev => ({
          ...prev,
          sportsCategories: categoriesResponse.data || []
        }));
        console.log('✅ Categorías deportivas cargadas:', categoriesResponse.data);
      }
    } catch (err) {
      console.error('❌ Error cargando datos de referencia:', err);
    }
  }, []);

  /**
   * Crear deportista
   */
  const createAthlete = useCallback(async (athleteData) => {
    setLoading(true);
    
    try {
      console.log('🔵 [useAthletes] Creando deportista con datos:', athleteData);
      const response = await AthletesService.createAthlete(athleteData);
      console.log('🔵 [useAthletes] Respuesta del servicio:', response);
      
      if (response.success) {
        showSuccessAlert(
          'Deportista creado',
          response.message || 'El deportista fue creado correctamente.'
        );
        
        // Recargar la lista
        await loadAthletes();
        return true;
      } else {
        console.error('❌ [useAthletes] Error en respuesta:', response.error);
        throw new Error(response.error || 'Error creando deportista');
      }
    } catch (err) {
      console.error('❌ [useAthletes] Excepción capturada:', err);
      showErrorAlert('Error', err.message || 'No se pudo crear el deportista');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadAthletes]);

  /**
   * Actualizar deportista
   */
  const updateAthlete = useCallback(async (id, athleteData) => {
    setLoading(true);
    
    try {
      const emailChanged = athleteData.emailChanged;
      
      const response = await AthletesService.updateAthlete(id, athleteData);
      
      if (response.success) {
        // Si cambió el email y el backend envió credenciales, mostrar mensaje especial
        if (emailChanged && response.data?.emailSent) {
          showSuccessAlert(
            'Deportista actualizado',
            `El deportista se actualizó correctamente. Se ha enviado un correo con las nuevas credenciales a ${athleteData.email}.`
          );
        } else {
          showSuccessAlert(
            'Deportista actualizado',
            response.message || 'El deportista se actualizó correctamente.'
          );
        }
        
        // Recargar la lista
        await loadAthletes();
        return true;
      } else {
        throw new Error(response.error || 'Error actualizando deportista');
      }
    } catch (err) {
      showErrorAlert('Error', err.message || 'No se pudo actualizar el deportista');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadAthletes]);

  /**
   * Eliminar deportista
   */
  const deleteAthlete = useCallback(async (id) => {
    setLoading(true);
    
    try {
      const response = await AthletesService.deleteAthlete(id);
      
      if (response.success) {
        showSuccessAlert('Deportista eliminado', response.message);
        
        // Recargar la lista
        await loadAthletes();
        return true;
      } else {
        throw new Error(response.error || 'Error eliminando deportista');
      }
    } catch (err) {
      showErrorAlert('Error', err.message || 'No se pudo eliminar el deportista');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadAthletes]);

  /**
   * Crear acudiente
   */
  const createGuardian = useCallback(async (guardianData) => {
    setLoading(true);
    
    try {
      const response = await GuardiansService.createGuardian(guardianData);
      
      if (response.success) {
        showSuccessAlert(
          'Acudiente creado',
          response.message || 'El acudiente se creó correctamente.'
        );
        
        // Recargar la lista de acudientes
        await loadGuardians();
        return response.data;
      } else {
        throw new Error(response.error || 'Error creando acudiente');
      }
    } catch (err) {
      showErrorAlert('Error', err.message || 'No se pudo crear el acudiente');
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadGuardians]);

  /**
   * Actualizar acudiente
   */
  const updateGuardian = useCallback(async (id, guardianData) => {
    setLoading(true);
    
    try {
      const response = await GuardiansService.updateGuardian(id, guardianData);
      
      if (response.success) {
        showSuccessAlert(
          'Acudiente actualizado',
          response.message || 'El acudiente se actualizó correctamente.'
        );
        
        // Recargar la lista de acudientes
        await loadGuardians();
        return true;
      } else {
        throw new Error(response.error || 'Error actualizando acudiente');
      }
    } catch (err) {
      showErrorAlert('Error', err.message || 'No se pudo actualizar el acudiente');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadGuardians]);

  /**
   * Eliminar acudiente
   */
  const deleteGuardian = useCallback(async (id) => {
    setLoading(true);
    
    try {
      const response = await GuardiansService.deleteGuardian(id);
      
      if (response.success) {
        showSuccessAlert('Acudiente eliminado', response.message);
        
        // Recargar listas
        await loadGuardians();
        await loadAthletes();
        return true;
      } else {
        throw new Error(response.error || 'Error eliminando acudiente');
      }
    } catch (err) {
      showErrorAlert('Error', err.message || 'No se pudo eliminar el acudiente');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadGuardians, loadAthletes]);

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
      loadGuardians();
    }
  }, [isAuthenticated, loadReferenceData, loadGuardians]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAthletes();
    }
  }, [isAuthenticated, pagination.page, loadAthletes]);

  return {
    // Estado
    athletes,
    guardians,
    loading,
    error,
    pagination,
    referenceData,
    
    // Funciones
    loadAthletes,
    loadGuardians,
    createAthlete,
    updateAthlete,
    deleteAthlete,
    createGuardian,
    updateGuardian,
    deleteGuardian,
    changePage,
    changeLimit,
    
    // Utilidades
    refresh: loadAthletes
  };
};
