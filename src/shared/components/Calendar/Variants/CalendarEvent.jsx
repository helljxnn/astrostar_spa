import React from "react";
import { motion } from "framer-motion";
import {
  FaClock,
  FaMapMarkerAlt,
  FaUser,
  FaExclamationCircle,
} from "react-icons/fa";
import {
  getEventStatusConfig,
  formatTime,
  getEventDisplayTitle,
} from "../BaseCalendar/helpers/calendarHelpers";

const CalendarEvent = ({
  event,
  variant = "grid", // 'grid' | 'list' | 'sidebar'
  colorScheme,
  onClick,
  className = "",
}) => {
  const statusConfig = getEventStatusConfig(event.status || "programado");
  const title = getEventDisplayTitle(event);
  const time =
    event.time || event.hora || formatTime(event.start || event.date);

  // Usar colores personalizados del evento si están disponibles
  const useCustomColors =
    colorScheme?.useEventColors && (event.backgroundColor || event.color);

  console.log("CalendarEvent Debug:", {
    eventId: event.id,
    eventTitle: event.title,
    colorScheme: colorScheme,
    useEventColors: colorScheme?.useEventColors,
    eventBackgroundColor: event.backgroundColor,
    eventColor: event.color,
    useCustomColors: useCustomColors,
  });

  const eventStyle = useCustomColors
    ? {
        backgroundColor: event.backgroundColor || event.color,
        color: "#ffffff", // Texto blanco para mejor contraste
      }
    : {};
  const eventClasses = useCustomColors
    ? "text-white"
    : `${statusConfig.bg} ${statusConfig.text}`;

  // Grid variant - compact for calendar grid
  if (variant === "grid") {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`p-1.5 rounded text-xs truncate cursor-pointer transition-all duration-200 ${eventClasses} ${className}`}
        style={eventStyle}
        onClick={onClick}
        title={title}
      >
        <div className="font-medium truncate">{title}</div>
        {time && <div className="opacity-75 text-xs">{time}</div>}
      </motion.div>
    );
  }

  // List variant - detailed for list views
  if (variant === "list") {
    return (
      <motion.div
        whileHover={{ scale: 1.01, y: -2 }}
        className={`p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer bg-white ${className}`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              {time && (
                <div className="flex items-center gap-1">
                  <FaClock className="text-xs" />
                  <span>{time}</span>
                </div>
              )}

              {event.location && (
                <div className="flex items-center gap-1">
                  <FaMapMarkerAlt className="text-xs" />
                  <span>{event.location}</span>
                </div>
              )}

              {event.instructor && (
                <div className="flex items-center gap-1">
                  <FaUser className="text-xs" />
                  <span>{event.instructor}</span>
                </div>
              )}
            </div>

            {event.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
            >
              {statusConfig.label}
            </span>

            {event.hasNovedad && (
              <FaExclamationCircle
                className="text-yellow-500"
                title="Tiene novedad"
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Sidebar variant - compact for sidebar
  if (variant === "sidebar") {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-200 cursor-pointer bg-white ${className}`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-gray-800 text-sm truncate flex-1">
            {title}
          </h4>
          <div
            className="w-2 h-2 rounded-full ml-2 flex-shrink-0"
            style={{ backgroundColor: statusConfig.dot }}
          />
        </div>

        {time && (
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
            <FaClock className="text-xs" />
            <span>{time}</span>
          </div>
        )}

        {event.location && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <FaMapMarkerAlt className="text-xs" />
            <span className="truncate">{event.location}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">{statusConfig.label}</span>

          {event.hasNovedad && (
            <FaExclamationCircle className="text-yellow-500 text-xs" />
          )}
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <div
      className={`p-2 rounded ${statusConfig.bg} ${statusConfig.text} ${className}`}
    >
      <div className="font-medium text-sm">{title}</div>
      {time && <div className="text-xs opacity-75">{time}</div>}
    </div>
  );
};

export default CalendarEvent;
