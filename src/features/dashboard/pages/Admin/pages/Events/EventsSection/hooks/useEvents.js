/**
 * Hook personalizado para manejar eventos
 * Proporciona estado y funciones para operaciones CRUD
 */

import { useState, useEffect, useCallback } from "react";
import eventsService from "../../services/eventsService.js";
import {
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../../shared/utils/alerts.js";
import { useAuth } from "../../../../../../../../shared/contexts/authContext.jsx";

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
    hasPrev: false,
  });
  const [referenceData, setReferenceData] = useState({
    sportsCategories: [], // Categorías deportivas (para inscripciones)
    eventCategories: [], // Categorías de eventos (tipo de evento)
    types: [],
    sponsors: [], // Patrocinadores activos
  });

  const [dataLoaded, setDataLoaded] = useState(false);

  /**
   * Transformar evento del backend al formato del frontend
   */
  const transformEventFromBackend = (event) => {
    // Extraer solo la fecha si viene en formato ISO
    const extractDate = (dateString) => {
      if (!dateString) return "";
      return dateString.split("T")[0];
    };

    const startDate = extractDate(event.startDate);
    const endDate = extractDate(event.endDate);

    // Convertir "En_pausa" del backend a "Pausado" para el frontend
    const normalizeStatus = (status) => {
      if (status === "En_pausa") return "Pausado";
      return status;
    };

    const estadoParaModal = normalizeStatus(event.status); // Para el modal de edición
    const estadoParaLista = estadoParaModal.toLowerCase(); // Para la visualización en la lista

    // Extraer categorías del evento
    // Usar serviceSportsCategories (múltiples categorías deportivas)
    const categories = event.serviceSportsCategories || [];
    const categoryIds =
      categories.length > 0 ? categories.map((sc) => sc.sportsCategoryId) : [];
    const categoryNames =
      categories.length > 0
        ? categories.map((sc) => sc.sportsCategory?.nombre).filter(Boolean)
        : [];

    // Crear fechas para el calendario asegurando que no haya problemas de zona horaria
    // Usar la fecha y hora directamente sin conversión de zona horaria
    const createLocalDate = (dateStr, timeStr) => {
      if (!dateStr || !timeStr) return new Date();
      const [year, month, day] = dateStr.split("-").map(Number);
      const [hours, minutes] = timeStr.split(":").map(Number);
      return new Date(year, month - 1, day, hours, minutes);
    };

    return {
      id: event.id,
      nombre: event.name,
      tipo: event.type?.name || event.ServiceType?.name || "",
      tipoId: event.typeId,
      descripcion: event.description || "",
      fechaInicio: startDate,
      fechaFin: endDate,
      horaInicio: event.startTime,
      horaFin: event.endTime,
      ubicacion: event.location,
      telefono: event.phone,
      categoria: categoryNames.join(", ") || "", // Para mostrar en lista
      categoryIds: categoryIds, // Para el formulario
      estado: estadoParaLista, // Para mostrar en la lista
      estadoOriginal: estadoParaModal, // Para el modal de edición
      publicar: event.publish,
      imagen: event.imageUrl,
      cronograma: event.scheduleFile,
      patrocinador: event.ServiceSponsor?.map((s) => s.Sponsor.name) || [],
      hasRegistrations: (() => {
        const count = event._count?.participants || 0;
        return count > 0;
      })(), // Verificar si tiene inscripciones
      // Para el calendario - usar createLocalDate para evitar problemas de zona horaria
      start: createLocalDate(startDate, event.startTime),
      end: createLocalDate(endDate, event.endTime),
      title: event.name,
    };
  };

  /**
   * Transformar evento del frontend al formato del backend
   */
  const transformEventToBackend = (event) => {
    const backendData = {
      name: event.nombre,
      description: event.descripcion || null,
      startDate: event.fechaInicio,
      endDate: event.fechaFin,
      startTime: event.horaInicio,
      endTime: event.horaFin,
      location: event.ubicacion,
      phone: event.telefono,
      imageUrl: event.imagen || null,
      scheduleFile: event.cronograma || null,
      publish: event.publicar || false,
      categoryIds: event.categoryIds || [],
      sponsorNames: event.patrocinador || [],
      typeId: event.typeId || event.tipoId,
    };

    // Solo incluir el estado si está presente (no para eventos finalizados)
    if (event.estado !== undefined) {
      // Normalizar el estado para que coincida con el backend
      let normalizedStatus = event.estado || "Programado";

      // Convertir "Pausado" a "En_pausa" para que coincida con el enum de Prisma
      if (normalizedStatus.toLowerCase().includes("pausa")) {
        normalizedStatus = "En_pausa";
      }

      backendData.status = normalizedStatus;
    }

    return backendData;
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
        ...params,
      });

      if (response.success) {
        const transformedEvents = response.data.map(transformEventFromBackend);
        setEvents(transformedEvents);
        setPagination(response.pagination);
      } else {
        throw new Error(response.message || "Error cargando eventos");
      }
    } catch (err) {
      setError(err.message);
      showErrorAlert("Error", "No se pudieron cargar los eventos");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear evento
   */
  const createEvent = useCallback(
    async (eventData) => {
      setLoading(true);

      try {
        const backendData = transformEventToBackend(eventData);
        const response = await eventsService.create(backendData);

        if (response.success) {
          showSuccessAlert(
            "Evento Creado",
            response.message || "El evento ha sido creado exitosamente"
          );

          // Recargar la lista
          await loadEvents();
          return response.data;
        } else {
          throw new Error(response.message || "Error creando evento");
        }
      } catch (err) {
        showErrorAlert("Error", err.message || "No se pudo crear el evento");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadEvents]
  );

  /**
   * Actualizar evento
   */
  const updateEvent = useCallback(
    async (id, eventData) => {
      setLoading(true);

      try {
        const backendData = transformEventToBackend(eventData);
        const response = await eventsService.update(id, backendData);

        if (response.success) {
          showSuccessAlert(
            "Evento Actualizado",
            response.message || "El evento ha sido actualizado exitosamente"
          );

          // Recargar la lista
          await loadEvents();
          return response.data;
        } else {
          throw new Error(response.message || "Error actualizando evento");
        }
      } catch (err) {
        showErrorAlert(
          "Error",
          err.message || "No se pudo actualizar el evento"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadEvents]
  );

  /**
   * Eliminar evento
   */
  const deleteEvent = useCallback(
    async (id, eventName) => {
      setLoading(true);

      try {
        const response = await eventsService.delete(id);

        if (response.success) {
          // Primero eliminar del estado local inmediatamente
          setEvents((prevEvents) =>
            prevEvents.filter((event) => event.id !== parseInt(id))
          );

          showSuccessAlert("Evento Eliminado", response.message);

          // Forzar recarga completa con timestamp para evitar caché
          setTimeout(async () => {
            await loadEvents({ _t: Date.now() });
          }, 300);

          return true;
        } else {
          throw new Error(response.message || "Error eliminando evento");
        }
      } catch (err) {
        showErrorAlert("Error", err.message || "No se pudo eliminar el evento");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadEvents]
  );

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
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  /**
   * Cambiar límite por página
   */
  const changeLimit = useCallback((newLimit) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  }, []);

  // Cargar datos de referencia inmediatamente al montar
  useEffect(() => {
    let isMounted = true;

    const cargarDatos = async () => {
      try {
        // Cargar datos de referencia de eventos (categorías, tipos y patrocinadores)
        const eventsResponse = await eventsService.getReferenceData();

        if (isMounted && eventsResponse && eventsResponse.success) {
          // Los patrocinadores ahora vienen incluidos en getReferenceData
          const data = {
            ...eventsResponse.data,
            categories:
              eventsResponse.data.sportsCategories ||
              eventsResponse.data.categories ||
              [],
            sponsors: eventsResponse.data.sponsors || [],
          };

          setReferenceData(data);
          setDataLoaded(true);
        }
      } catch (err) {
        console.error("Error cargando datos de referencia:", err);
        // En caso de error, al menos marcar como cargado para no bloquear la app
        if (isMounted) {
          setDataLoaded(true);
        }
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
    refresh: loadEvents,
  };
};
