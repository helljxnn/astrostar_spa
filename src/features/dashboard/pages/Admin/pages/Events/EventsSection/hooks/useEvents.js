/**
 * Hook personalizado para manejar eventos
 * Proporciona estado y funciones para operaciones CRUD
 */

import { useState, useEffect, useCallback } from 'react';
import eventsService from '../../services/eventsService.js';
import { showSuccessAlert, showErrorAlert } from '../../../../../../../../shared/utils/alerts.js';
import { useAuth } from '../../../../../../../../shared/contexts/authContext.jsx';

export const useEvents = () => {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
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
    categories: [],
    types: []
  });
  
  const [dataLoaded, setDataLoaded] = useState(false);

  /**
   * Transformar evento del backend al formato del frontend
   */
  const transformEventFromBackend = (event) => {
    // Extraer solo la fecha si viene en formato ISO
    const extractDate = (dateString) => {
      if (!dateString) return '';
      return dateString.split('T')[0];
    };

    const startDate = extractDate(event.startDate);
    const endDate = extractDate(event.endDate);
    
    return {
      id: event.id,
      nombre: event.name,
      tipo: event.type?.name || '',
      tipoId: event.typeId,
      descripcion: event.description || '',
      fechaInicio: startDate,
      fechaFin: endDate,
      horaInicio: event.startTime,
      horaFin: event.endTime,
      ubicacion: event.location,
      telefono: event.phone,
      categoria: event.category?.name || '',
      categoriaId: event.categoryId,
      estado: event.status,
      publicar: event.publish,
      imagen: event.imageUrl,
      cronograma: event.scheduleFile,
      patrocinador: event.sponsors?.map(s => s.sponsor.name) || [],
      // Para el calendario
      start: new Date(startDate + 'T' + event.startTime),
      end: new Date(endDate + 'T' + event.endTime),
      title: event.name
    };
  };

  /**
   * Transformar evento del frontend al formato del backend
   */
  const transformEventToBackend = (event) => {
    return {
      name: event.nombre,
      description: event.descripcion || null,
      startDate: event.fechaInicio,
      endDate: event.fechaFin,
      startTime: event.horaInicio,
      endTime: event.horaFin,
      location: event.ubicacion,
      phone: event.telefono,
      status: event.estado || 'Programado',
      imageUrl: event.imagen || null,
      scheduleFile: event.cronograma || null,
      publish: event.publicar || false,
      categoryId: event.categoriaId,
      typeId: event.tipoId
    };
  };

  /**
   * Cargar eventos con filtros
   */
  const loadEvents = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await eventsService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        ...params
      });

      if (response.success) {
        const transformedEvents = response.data.map(transformEventFromBackend);
        setEvents(transformedEvents);
        setPagination(response.pagination);
      } else {
        throw new Error(response.message || 'Error cargando eventos');
      }
    } catch (err) {
      setError(err.message);
      showErrorAlert('Error', 'No se pudieron cargar los eventos');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);



  /**
   * Crear evento
   */
  const createEvent = useCallback(async (eventData) => {
    setLoading(true);
    
    try {
      const backendData = transformEventToBackend(eventData);
      const response = await eventsService.create(backendData);
      
      if (response.success) {
        showSuccessAlert(
          'Evento Creado', 
          response.message || 'El evento ha sido creado exitosamente'
        );
        
        // Recargar la lista
        await loadEvents();
        return response.data;
      } else {
        throw new Error(response.message || 'Error creando evento');
      }
    } catch (err) {
      showErrorAlert('Error', err.message || 'No se pudo crear el evento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadEvents]);

  /**
   * Actualizar evento
   */
  const updateEvent = useCallback(async (id, eventData) => {
    setLoading(true);
    
    try {
      const backendData = transformEventToBackend(eventData);
      const response = await eventsService.update(id, backendData);
      
      if (response.success) {
        showSuccessAlert(
          'Evento Actualizado', 
          response.message || 'El evento ha sido actualizado exitosamente'
        );
        
        // Recargar la lista
        await loadEvents();
        return response.data;
      } else {
        throw new Error(response.message || 'Error actualizando evento');
      }
    } catch (err) {
      showErrorAlert('Error', err.message || 'No se pudo actualizar el evento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadEvents]);

  /**
   * Eliminar evento
   */
  const deleteEvent = useCallback(async (id, eventName) => {
    setLoading(true);
    
    try {
      const response = await eventsService.delete(id);
      
      if (response.success) {
        showSuccessAlert('Evento Eliminado', response.message);
        
        // Recargar la lista
        await loadEvents();
        return true;
      } else {
        throw new Error(response.message || 'Error eliminando evento');
      }
    } catch (err) {
      showErrorAlert('Error', err.message || 'No se pudo eliminar el evento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadEvents]);

  /**
   * Obtener estadísticas
   */
  const getStats = useCallback(async () => {
    try {
      const response = await eventsService.getStats();
      return response.data;
    } catch (err) {
      console.error('Error obteniendo estadísticas:', err);
      return null;
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

  // Cargar datos de referencia inmediatamente al montar
  useEffect(() => {
    let isMounted = true;
    
    const cargarDatos = async () => {
      try {
        const response = await eventsService.getReferenceData();
        if (response && response.success && isMounted) {
          setReferenceData(response.data);
          setDataLoaded(true);
        }
      } catch (err) {
        console.error('Error cargando datos de referencia:', err);
      }
    };
    
    if (!dataLoaded) {
      cargarDatos();
    }
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Cargar eventos solo si está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
    }
  }, [isAuthenticated]);

  return {
    // Estado
    events,
    loading,
    error,
    pagination,
    referenceData,
    
    // Funciones
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getStats,
    changePage,
    changeLimit,
    
    // Utilidades
    refresh: loadEvents
  };
};
