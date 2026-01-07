/**
 * Adaptador de colores específico para el módulo de EVENTOS
 * Extiende la funcionalidad genérica del calendario con lógica específica de eventos
 */

/**
 * Obtiene el color del evento basado en TIPO DE EVENTO (específico para módulo de eventos)
 * Esta función sobrescribe la lógica genérica para aplicar colores por tipo de evento
 */
export const getEventsModuleColor = (status, eventType) => {
  // PRIORIDAD 1: Si el evento está finalizado, usar color gris independientemente del tipo
  if (
    status &&
    (status.toLowerCase() === "finalizado" ||
      status.toLowerCase() === "finished")
  ) {
    return "#9ca3af"; // Gris para eventos finalizados
  }

  // PRIORIDAD 2: Colores por tipo de evento (ESPECÍFICO DEL MÓDULO DE EVENTOS)
  const eventsTypeColorMap = {
    Festival: "#9BFFB6", // Verde
    Torneo: "#9BE9FF", // Azul
    Clausura: "#B595FF", // Morado
    Taller: "#FF95E5", // Rosado
  };

  // Si hay un tipo de evento definido, usar su color específico
  if (eventType && eventsTypeColorMap[eventType]) {
    return eventsTypeColorMap[eventType];
  }

  // PRIORIDAD 3: Fallback a colores por estado (genérico)
  const statusColorMap = {
    Programado: "#3b82f6",
    programado: "#3b82f6",
    "En-curso": "#10b981",
    "en-curso": "#10b981",
    Finalizado: "#9ca3af",
    finalizado: "#9ca3af",
    Cancelado: "#ef4444",
    cancelado: "#ef4444",
  };

  return statusColorMap[status] || "#8b5cf6";
};

/**
 * Configuración de colores específica para el módulo de eventos
 */
export const EVENTS_MODULE_COLORS = {
  types: {
    Festival: "#9BFFB6",
    Torneo: "#9BE9FF",
    Clausura: "#B595FF",
    Taller: "#FF95E5",
  },
  states: {
    programado: "#3b82f6",
    "en-curso": "#10b981",
    finalizado: "#9ca3af",
    cancelado: "#ef4444",
  },
};
