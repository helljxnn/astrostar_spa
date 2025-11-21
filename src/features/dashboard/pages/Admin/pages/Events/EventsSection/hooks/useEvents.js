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
    
    // Mantener el estado tal como viene del backend para el modal de edición
    // Solo normalizar para la visualización en la lista
    const estadoParaModal = event.status; // Mantener "Pausado", "Programado", etc.
    const estadoParaLista = event.status === 'Pausado' ? 'pausado' : event.status.toLowerCase();
    
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
      estado: estadoParaLista, // Para mostrar en la lista
      estadoOriginal: estadoParaModal, // Para el modal de edición
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
    // Normalizar el estado para que coincida con el backend
    let normalizedStatus = event.estado || 'Programado';
    
    // Convertir "pausado" o variantes a "Pausado"
    if (normalizedStatus.toLowerCase().includes('pausa')) {
      normalizedStatus = 'Pausado';
    }
    
    return {
      name: event.nombre,
      description: event.descripcion || null,
      startDate: event.fechaInicio,
      endDate: event.fechaFin,
      startTime: event.horaInicio,
      endTime: event.horaFin,
      location: event.ubicacion,
      phone: event.telefono,
      status: normalizedStatus,
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
        page: 1,
        limit: 1000, // Cargar todos los eventos para el calendario
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
  }, []);



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
        // Primero eliminar del estado local inmediatamente
        setEvents(prevEvents => prevEvents.filter(event => event.id !== parseInt(id)));
        
        showSuccessAlert('Evento Eliminado', response.message);
        
        // Forzar recarga completa con timestamp para evitar caché
        setTimeout(async () => {
          await loadEvents({ _t: Date.now() });
        }, 300);
        
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
        // Error cargando datos de referencia
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
    if (isAuthenticated && dataLoaded) {
      loadEvents();
    }
  }, [isAuthenticated, dataLoaded, loadEvents]);

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
