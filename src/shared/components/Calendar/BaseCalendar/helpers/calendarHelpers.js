import {
  format,
  parseISO,
  isValid,
  isSameDay,
  startOfDay,
  endOfDay,
} from "date-fns";
import { es } from "date-fns/locale";

/**
 * Format date for display
 */
export const formatDate = (date, formatString = "dd/MM/yyyy") => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "";
    return format(dateObj, formatString, { locale: es });
  } catch (error) {
    console.warn("Error formatting date:", error);
    return "";
  }
};

/**
 * Format time for display
 */
export const formatTime = (date, formatString = "HH:mm") => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "";
    return format(dateObj, formatString);
  } catch (error) {
    console.warn("Error formatting time:", error);
    return "";
  }
};

/**
 * Check if two dates are the same day
 */
export const isSameDayHelper = (date1, date2) => {
  try {
    const d1 = typeof date1 === "string" ? parseISO(date1) : date1;
    const d2 = typeof date2 === "string" ? parseISO(date2) : date2;

    if (!isValid(d1) || !isValid(d2)) return false;

    return isSameDay(d1, d2);
  } catch (error) {
    console.warn("Error comparing dates:", error);
    return false;
  }
};

/**
 * Get event status configuration
 */
export const getEventStatusConfig = (status) => {
  const configs = {
    programado: {
      label: "Programado",
      bg: "bg-gradient-to-r from-[#9be9ff] to-[#b595ff]",
      text: "text-white",
      ring: "ring-[#9be9ff]",
      dot: "#9be9ff",
    },
    "en-curso": {
      label: "En Curso",
      bg: "bg-gradient-to-r from-[#95FFA7] to-[#9be9ff]",
      text: "text-white",
      ring: "ring-[#95FFA7]",
      dot: "#95FFA7",
    },
    finalizado: {
      label: "Finalizado",
      bg: "bg-gradient-to-r from-gray-400 to-gray-300",
      text: "text-white",
      ring: "ring-gray-300",
      dot: "#9ca3af",
    },
    cancelado: {
      label: "Cancelado",
      bg: "bg-gradient-to-r from-[#FC6D6D] to-red-300",
      text: "text-white",
      ring: "ring-red-200",
      dot: "#FC6D6D",
    },
  };

  return configs[status] || configs.programado;
};

/**
 * Get role/category colors
 */
export const getRoleColors = (role) => {
  const colors = {
    entrenador: {
      from: "#effbf2",
      to: "#d9f3d7",
      dot: "#4ade80",
      tagBg: "rgba(199, 249, 204, 0.25)",
    },
    fisioterapia: {
      from: "#f5f3ff",
      to: "#e3deff",
      dot: "#8b5cf6",
      tagBg: "rgba(224, 215, 255, 0.3)",
    },
    nutricion: {
      from: "#f0fbff",
      to: "#d6f0ff",
      dot: "#38bdf8",
      tagBg: "rgba(209, 242, 255, 0.35)",
    },
    psicologia: {
      from: "#fff5fb",
      to: "#ffe1f0",
      dot: "#fb7185",
      tagBg: "rgba(252, 225, 243, 0.3)",
    },
    default: {
      from: "#f5f6ff",
      to: "#e3e8ff",
      dot: "#6366f1",
      tagBg: "rgba(229, 237, 255, 0.45)",
    },
  };

  return colors[role] || colors.default;
};

/**
 * Sort events by date and time
 */
export const sortEventsByDateTime = (events) => {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.date || a.start);
    const dateB = new Date(b.date || b.start);

    if (dateA.getTime() !== dateB.getTime()) {
      return dateA - dateB;
    }

    // If same date, sort by time
    const timeA = a.time || a.hora || "00:00";
    const timeB = b.time || b.hora || "00:00";

    return timeA.localeCompare(timeB);
  });
};

/**
 * Filter events by date range
 */
export const filterEventsByDateRange = (events, startDate, endDate) => {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  return events.filter((event) => {
    const eventDate = new Date(event.date || event.start);
    return eventDate >= start && eventDate <= end;
  });
};

/**
 * Group events by date
 */
export const groupEventsByDate = (events) => {
  const groups = {};

  events.forEach((event) => {
    const dateKey = format(new Date(event.date || event.start), "yyyy-MM-dd");

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }

    groups[dateKey].push(event);
  });

  return groups;
};

/**
 * Get events for a specific date
 */
export const getEventsForDate = (events, date) => {
  return events.filter((event) => {
    const eventDate = new Date(event.date || event.start);
    return isSameDay(eventDate, date);
  });
};

/**
 * Calculate event duration in days
 */
export const getEventDuration = (startDate, endDate) => {
  if (!endDate || endDate === startDate) return 1;

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  } catch (error) {
    return 1;
  }
};

/**
 * Check if event is multi-day
 */
export const isMultiDayEvent = (event) => {
  return event.endDate && event.endDate !== event.date;
};

/**
 * Get event display title
 */
export const getEventDisplayTitle = (event) => {
  return event.title || event.name || event.descripcion || "Sin título";
};

/**
 * Get event display description
 */
export const getEventDisplayDescription = (event) => {
  return event.description || event.descripcion || event.observaciones || "";
};
