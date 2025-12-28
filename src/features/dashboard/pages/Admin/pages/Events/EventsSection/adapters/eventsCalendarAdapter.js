/**
 * Adaptador para transformar eventos entre el formato del dashboard y el calendario genérico
 */

import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Transforma eventos del formato del dashboard al formato del calendario genérico
 */
export const transformEventsForBaseCalendar = (dashboardEvents = []) => {
  const transformedEvents = dashboardEvents
    .filter((event) => event && event.id) // Filtrar eventos inválidos
    .map((event) => ({
      // Campos requeridos por BaseCalendar
      id: event.id,
      title: event.title || event.nombre || "Sin título",
      start: event.start,
      end: event.end,

      // Campos adicionales para el calendario genérico
      description: event.descripcion || "",
      location: event.ubicacion || "",
      status: normalizeStatus(event.estadoOriginal || event.estado),
      type: event.tipo || "",
      category: event.categoria || "",

      // Campos extendidos para funcionalidades específicas
      extendedProps: {
        // Datos originales del dashboard
        dashboardEvent: event,

        // Campos para filtros y búsqueda
        tipo: event.tipo || "",
        categoria: event.categoria || "",
        categoryIds: event.categoryIds || [],
        ubicacion: event.ubicacion || "",
        telefono: event.telefono || "",
        estado: event.estadoOriginal || event.estado || "",
        estadoOriginal: event.estadoOriginal || event.estado || "",
        publicar: event.publicar || false,
        patrocinador: event.patrocinador || [],
        imagen: event.imagen || null,
        cronograma: event.cronograma || null,
        tipoId: event.tipoId,

        // Campos para inscripciones
        hasRegistrations: event.hasRegistrations || false,
      },

      // Configuración de color basada en el estado
      color: getEventColor(event.estadoOriginal || event.estado),
      backgroundColor: getEventColor(event.estadoOriginal || event.estado),
      borderColor: getEventColor(event.estadoOriginal || event.estado),
    }));

  return transformedEvents;
};

/**
 * Normaliza el estado del evento para el calendario genérico
 */
const normalizeStatus = (status) => {
  if (!status) return "programado";

  const statusMap = {
    Programado: "programado",
    "En-curso": "en-curso",
    Finalizado: "finalizado",
    Cancelado: "cancelado",
    Pausado: "en-pausa",
    En_pausa: "en-pausa",
    // Mantener compatibilidad con estados en minúsculas
    programado: "programado",
    "en-curso": "en-curso",
    finalizado: "finalizado",
    cancelado: "cancelado",
    "en-pausa": "en-pausa",
  };

  return statusMap[status] || "programado";
};

/**
 * Obtiene el color del evento basado en su estado
 */
const getEventColor = (status) => {
  const colorMap = {
    Programado: "#3b82f6",
    programado: "#3b82f6",
    "En-curso": "#10b981",
    "en-curso": "#10b981",
    Finalizado: "#9ca3af",
    finalizado: "#9ca3af",
    Cancelado: "#ef4444",
    cancelado: "#ef4444",
    Pausado: "#f59e0b",
    En_pausa: "#f59e0b",
    "en-pausa": "#f59e0b",
  };

  return colorMap[status] || "#8b5cf6";
};

/**
 * Transforma datos del formulario del dashboard al formato esperado por el backend
 */
export const transformFormDataForBackend = (formData) => {
  return {
    ...formData,
    // Asegurar que los campos requeridos estén presentes
    nombre: formData.nombre || formData.title,
    title: formData.title || formData.nombre,
  };
};

/**
 * Crea filtros para el calendario genérico basados en los datos del dashboard
 */
export const createCalendarFilters = (referenceData = {}) => {
  const filters = [];

  // Filtro por estado
  filters.push({
    id: "status",
    label: "Estado",
    type: "select",
    options: [
      { value: "", label: "Todos los estados" },
      { value: "programado", label: "Programado" },
      { value: "en-curso", label: "En curso" },
      { value: "finalizado", label: "Finalizado" },
      { value: "cancelado", label: "Cancelado" },
      { value: "en-pausa", label: "En pausa" },
    ],
  });

  // Filtro por tipo de evento
  if (referenceData.types && referenceData.types.length > 0) {
    filters.push({
      id: "type",
      label: "Tipo de Evento",
      type: "select",
      options: [
        { value: "", label: "Todos los tipos" },
        ...referenceData.types.map((type) => ({
          value: type.name,
          label: type.name,
        })),
      ],
    });
  }

  // Filtro por categoría
  if (
    referenceData.eventCategories &&
    referenceData.eventCategories.length > 0
  ) {
    filters.push({
      id: "category",
      label: "Categoría",
      type: "select",
      options: [
        { value: "", label: "Todas las categorías" },
        ...referenceData.eventCategories.map((category) => ({
          value: category.nombre,
          label: category.nombre,
        })),
      ],
    });
  }

  // Filtro por publicación
  filters.push({
    id: "published",
    label: "Publicación",
    type: "select",
    options: [
      { value: "", label: "Todos" },
      { value: "true", label: "Publicados" },
      { value: "false", label: "No publicados" },
    ],
  });

  return filters;
};

/**
 * Aplica filtros específicos del dashboard a los eventos
 */
export const applyDashboardFilters = (events, selectedFilters) => {
  let filtered = events;

  // Filtro por estado
  if (selectedFilters.status) {
    filtered = filtered.filter((event) => {
      const eventStatus = normalizeStatus(event.extendedProps?.estado);
      return eventStatus === selectedFilters.status;
    });
  }

  // Filtro por tipo
  if (selectedFilters.type) {
    filtered = filtered.filter((event) => {
      return event.extendedProps?.tipo === selectedFilters.type;
    });
  }

  // Filtro por categoría
  if (selectedFilters.category) {
    filtered = filtered.filter((event) => {
      return event.extendedProps?.categoria === selectedFilters.category;
    });
  }

  // Filtro por publicación
  if (
    selectedFilters.published !== undefined &&
    selectedFilters.published !== ""
  ) {
    const isPublished = selectedFilters.published === "true";
    filtered = filtered.filter((event) => {
      return event.extendedProps?.publicar === isPublished;
    });
  }

  return filtered;
};

/**
 * Campos de búsqueda para el calendario genérico
 */
export const getSearchFields = () => [
  "title",
  "description",
  "location",
  "extendedProps.tipo",
  "extendedProps.categoria",
  "extendedProps.ubicacion",
];
