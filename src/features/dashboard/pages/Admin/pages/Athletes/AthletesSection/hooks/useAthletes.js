/**
 * Hook personalizado para manejar deportistas
 * Proporciona estado y funciones para operaciones CRUD
 */

import { useState, useEffect, useCallback } from 'react';
import AthletesService from '../services/AthletesService.js';
import GuardiansService from '../services/GuardiansService.js';
import { showSuccessAlert, showErrorAlert } from '../../../../../../../../shared/utils/alerts.js';
import { useAuth } from '../../../../../../../../shared/contexts/authContext.jsx';
import { PAGINATION_CONFIG } from '../../../../../../../../shared/constants/paginationConfig.js';

export const useAthletes = () => {
  const { isAuthenticated } = useAuth();
  const [athletes, setAthletes] = useState([]);
  const [guardians, setGuardians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: PAGINATION_CONFIG.DEFAULT_PAGE,
    limit: PAGINATION_CONFIG.ROWS_PER_PAGE,
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
   * Cargar deportistas con filtros - OPTIMIZADO
   */
  const loadAthletes = useCallback(async (params = {}, silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    
    try {
      // Agregar parámetros de cache busting más agresivos
      const enhancedParams = {
        page: params.page || PAGINATION_CONFIG.DEFAULT_PAGE,
        limit: params.limit || PAGINATION_CONFIG.ROWS_PER_PAGE,
        search: params.search,
        status: params.status,
        categoria: params.categoria,
        estadoInscripcion: params.estadoInscripcion,
        _t: Date.now(),
        _refresh: Math.random() // Forzar refresh
      };

      const response = await AthletesService.getAthletes(enhancedParams);

      if (response.success) {
        setAthletes(response.data);
        setPagination(response.pagination);
      } else {
        console.error('❌ [useAthletes] Error en respuesta:', response.error);
        throw new Error(response.error || 'Error cargando deportistas');
      }
    } catch (err) {
      console.error('❌ [useAthletes] Excepción al cargar deportistas:', err);
      setError(err.message);
      if (!silent) {
        showErrorAlert('Error', 'No se pudieron cargar los deportistas');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []); // Sin dependencias para evitar loops

  /**
   * Cargar acudientes bajo demanda (OPTIMIZADO - solo cuando sea necesario)
   */
  const loadGuardians = useCallback(async (searchTerm = '') => {
    try {
      // Si hay término de búsqueda, usar búsqueda específica
      if (searchTerm && searchTerm.length >= 2) {
        const response = await GuardiansService.searchGuardians(searchTerm, 20);
        if (response.success) {
          setGuardians(response.data);
        }
      } else if (!searchTerm) {
        // Solo cargar algunos si no hay término de búsqueda (para casos específicos)
        const response = await GuardiansService.getGuardians({
          limit: 30 // Reducir de 50 a 30 para mejor rendimiento
        });
        if (response.success) {
          setGuardians(response.data);
        }
      } else {
        // Limpiar lista si el término es muy corto
        setGuardians([]);
      }
    } catch (err) {
      console.error('❌ Error cargando acudientes:', err);
      setGuardians([]);
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
const athletesDocTypesResponse = await AthletesService.getDocumentTypes();
      
      // Cargar TODOS los tipos de documento para acudientes
let allDocTypesResponse = await apiClient.get('/document-types');
      
      // Si falla, usar el endpoint de empleados
      if (!allDocTypesResponse || !allDocTypesResponse.success) {
allDocTypesResponse = await apiClient.get('/employees/reference-data');
      }
      
      if (allDocTypesResponse && allDocTypesResponse.success) {
        // Obtener los tipos de documento de la respuesta
        const allDocTypes = allDocTypesResponse.data?.documentTypes || allDocTypesResponse.data || [];
        
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
} else {
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
const response = await AthletesService.createAthlete(athleteData);
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
  }, []);

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
  }, []);

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
  }, []);

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
  }, []);

  /**
   * Cambiar página
   */
  const changePage = useCallback((newPage) => {
    loadAthletes({ page: newPage });
  }, [loadAthletes]);

  /**
   * Cambiar límite por página
   */
  const changeLimit = useCallback((newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  }, []);

  const updateAthleteInState = useCallback((updatedAthlete) => {
    if (!updatedAthlete || !updatedAthlete.id) return;
    setAthletes(prev =>
      prev.map(athlete => (athlete.id === updatedAthlete.id ? { ...athlete, ...updatedAthlete } : athlete))
    );
  }, []);

  // Cargar datos iniciales solo si está autenticado - OPTIMIZADO
  useEffect(() => {
    if (isAuthenticated) {
      loadReferenceData();
      // NO cargar acudientes al inicio - se cargarán bajo demanda
    }
  }, [isAuthenticated, loadReferenceData]);

  // Cargar deportistas solo al inicio - SIN dependencias que causen loops
  useEffect(() => {
    if (isAuthenticated) {
      loadAthletes({ 
        page: PAGINATION_CONFIG.DEFAULT_PAGE, 
        limit: PAGINATION_CONFIG.ROWS_PER_PAGE 
      }, false); // Carga inicial con parámetros explícitos
    }
  }, [isAuthenticated, loadAthletes]); // Incluir loadAthletes como dependencia

  /**
   * Función refresh estable que no causa loops
   */
  const refresh = useCallback(async (params = {}, silent = false) => {
    return await loadAthletes(params, silent);
  }, [loadAthletes]);

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
    updateAthleteInState,
    
    // Utilidades
    refresh
  };
};
