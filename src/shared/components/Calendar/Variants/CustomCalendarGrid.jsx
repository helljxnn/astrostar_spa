import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { es } from "date-fns/locale";
import { InlineLoader } from "../../Loader";
import CalendarEvent from "./CalendarEvent";

const CustomCalendarGrid = ({
  events = [],
  view = "month",
  date = new Date(),
  onDateSelect,
  onEventClick,
  renderEvent,
  loading = false,
  colorScheme,
  ...props
}) => {
  // Estado para manejar el tooltip de eventos adicionales
  const [hoveredCell, setHoveredCell] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Función para manejar el hover del "ver más"
  const handleShowMoreHover = (dayKey, events, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 200; // Ancho estimado del tooltip (reducido)
    const tooltipHeight = 150; // Alto estimado del tooltip (reducido)

    let x = rect.right + 10;
    let y = rect.top;

    // Ajustar posición horizontal si se sale de la pantalla
    if (x + tooltipWidth > viewportWidth) {
      x = rect.left - tooltipWidth - 10;
    }

    // Ajustar posición vertical si se sale de la pantalla
    if (y + tooltipHeight > viewportHeight) {
      y = viewportHeight - tooltipHeight - 10;
    }

    if (y < 10) {
      y = 10;
    }

    setTooltipPosition({ x, y });
    setHoveredCell({ dayKey, events });
  };

  // Función para ocultar el tooltip
  const handleShowMoreLeave = () => {
    setHoveredCell(null);
  };
  // Generate calendar days based on view
  const calendarDays = useMemo(() => {
    if (view === "month") {
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    } else if (view === "week") {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    } else if (view === "day") {
      return [date];
    }
    return [];
  }, [date, view]);

  // Group events by date - including multi-day events
  const eventsByDate = useMemo(() => {
    const groups = {};

    if (!events || !Array.isArray(events)) return groups;

    events.forEach((event) => {
      if (!event) return;

      try {
        const startDate = new Date(event.start || event.date || new Date());
        const endDate = new Date(
          event.end || event.start || event.date || new Date(),
        );

        // Normalize dates to start of day to avoid time zone issues
        const start = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate(),
        );
        const end = new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate(),
        );

        // If it's a single day event or same day, just add to start date
        if (start.getTime() === end.getTime()) {
          const dateKey = format(start, "yyyy-MM-dd");
          if (!groups[dateKey]) {
            groups[dateKey] = [];
          }
          groups[dateKey].push(event);
        } else {
          // Multi-day event: add to all days between start and end (inclusive)
          const currentDate = new Date(start);
          while (currentDate <= end) {
            const dateKey = format(currentDate, "yyyy-MM-dd");
            if (!groups[dateKey]) {
              groups[dateKey] = [];
            }

            // Add event with additional info about multi-day status
            const eventForDay = {
              ...event,
              isMultiDay: true,
              multiDayStart: start,
              multiDayEnd: end,
              isFirstDay: currentDate.getTime() === start.getTime(),
              isLastDay: currentDate.getTime() === end.getTime(),
              currentDay: new Date(currentDate),
            };

            groups[dateKey].push(eventForDay);

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
      } catch (error) {
        // Silently skip invalid events
      }
    });

    return groups;
  }, [events]);

  // Get events for a specific date
  const getEventsForDate = (day) => {
    const dateKey = format(day, "yyyy-MM-dd");
    return eventsByDate[dateKey] || [];
  };

  // Handle date click
  const handleDateClick = (day) => {
    if (onDateSelect) {
      onDateSelect(day);
    }
  };

  // Handle event click
  const handleEventClick = (event, e) => {
    // Si el click fue en un botón o dentro de un botón, no hacer nada
    if (e && (e.target.tagName === "BUTTON" || e.target.closest("button"))) {
      return;
    }

    e.stopPropagation();
    if (onEventClick) {
      onEventClick(event, e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-xl border border-gray-100">
        <InlineLoader message="Cargando calendario..." />
      </div>
    );
  }

  // Render different layouts based on view
  if (view === "day") {
    const dayEvents = getEventsForDate(date);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Day Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {format(date, "EEEE", { locale: es })}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {format(date, "d 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {format(date, "d")}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                {format(date, "MMM", { locale: es })}
              </div>
            </div>
          </div>
        </div>

        {/* Day Content */}
        <div className="p-6">
          {dayEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h4 className="text-base font-medium text-gray-900 mb-1">
                Sin eventos
              </h4>
              <p className="text-sm text-gray-500">
                No hay actividades programadas para este día
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h4 className="text-base font-medium text-gray-900">
                  {dayEvents.length}{" "}
                  {dayEvents.length === 1 ? "evento" : "eventos"}
                </h4>
                {isToday(date) && (
                  <span className="inline-block mt-2 bg-[#B595FF] bg-opacity-10 text-[#B595FF] px-2 py-1 rounded text-xs font-medium">
                    Hoy
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {dayEvents.map((event, eventIndex) => (
                  <motion.div
                    key={event.id || eventIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: eventIndex * 0.05 }}
                    onClick={(e) => handleEventClick(event, e)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
                  >
                    {renderEvent ? (
                      renderEvent(event, "day")
                    ) : (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                event.backgroundColor || "#6366f1",
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">
                            {event.title}
                          </h5>
                          <div className="space-y-1">
                            {event.time && (
                              <div className="flex items-center text-xs text-gray-600">
                                <svg
                                  className="w-3 h-3 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {event.time}
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center text-xs text-gray-600">
                                <svg
                                  className="w-3 h-3 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                </svg>
                                {event.location}
                              </div>
                            )}
                            {event.extendedProps?.professorName && (
                              <div className="flex items-center text-xs text-gray-600">
                                <svg
                                  className="w-3 h-3 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                {event.extendedProps.professorName}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Week and Month views
  const gridCols = "grid-cols-7";
  const showWeekHeader = view === "week" || view === "month";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Calendar Header - Days of week */}
      {showWeekHeader && (
        <div className={`grid ${gridCols} bg-gray-50 border-b border-gray-200`}>
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
            <div
              key={day}
              className="p-2.5 text-center text-sm font-semibold text-gray-600 border-r border-gray-200 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>
      )}

      {/* Calendar Grid */}
      <div className={`grid ${gridCols} relative`}>
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const dayKey = format(day, "yyyy-MM-dd");
          const maxEventsToShow = view === "week" ? 8 : 2;
          const hasMoreEvents = dayEvents.length > maxEventsToShow;
          const eventsToShow = dayEvents.slice(0, maxEventsToShow);
          const hiddenEvents = dayEvents.slice(maxEventsToShow);

          const isCurrentMonth =
            view === "month" ? isSameMonth(day, date) : true;
          const isDayToday = isToday(day);
          const isSelectedDay = view === "week" && isSameDay(day, date);

          return (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.01 }}
              className={`${
                view === "week" ? "min-h-[240px]" : "h-[100px]"
              } p-2.5 border-r border-b border-gray-200 last:border-r-0 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                !isCurrentMonth ? "bg-gray-50 text-gray-400" : "bg-white"
              } ${
                isSelectedDay
                  ? "bg-[#B595FF] bg-opacity-10 border-[#B595FF]"
                  : ""
              } overflow-hidden relative`}
              onClick={() => handleDateClick(day)}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-sm font-medium ${
                    isDayToday
                      ? "bg-[#B595FF] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      : isCurrentMonth
                        ? "text-gray-900"
                        : "text-gray-400"
                  }`}
                >
                  {format(day, "d")}
                </span>
                {view === "week" && (
                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                    {format(day, "MMM", { locale: es })}
                  </span>
                )}
              </div>

              {/* Events */}
              <div className="space-y-1 flex-1 overflow-hidden">
                {eventsToShow.map((event, eventIndex) => (
                  <div
                    key={event.id || eventIndex}
                    onClick={(e) => {
                      // Solo manejar clicks que NO sean en botones
                      if (
                        e.target.tagName === "BUTTON" ||
                        e.target.closest("button")
                      ) {
                        return;
                      }
                      handleEventClick(event, e);
                    }}
                    className="cursor-pointer"
                  >
                    {renderEvent ? (
                      renderEvent(event, "grid")
                    ) : (
                      <div
                        className={`${
                          view === "week"
                            ? "p-1.5 text-xs border-l-2 bg-gray-50 hover:bg-gray-100"
                            : "p-1 px-1.5 rounded text-xs hover:opacity-80 relative"
                        } transition-colors duration-200 ${
                          event.isMultiDay ? "border-l-4" : ""
                        }`}
                        style={{
                          borderLeftColor:
                            view === "week" || event.isMultiDay
                              ? event.backgroundColor || "#6366f1"
                              : undefined,
                          backgroundColor:
                            view === "week"
                              ? undefined
                              : event.backgroundColor || "#6366f1",
                          color: view === "week" ? "#374151" : "#000000",
                        }}
                      >
                        <div className="font-medium truncate leading-tight text-xs">
                          {event.title}
                        </div>
                        {view === "week" && event.time && (
                          <div className="text-xs text-gray-600 mt-0.5">
                            {event.time}
                          </div>
                        )}
                        {view === "month" &&
                          event.time &&
                          !event.isMultiDay && (
                            <div className="opacity-75 text-xs leading-tight">
                              {event.time}
                            </div>
                          )}
                        {/* Multi-day duration info */}
                        {event.isMultiDay &&
                          view === "month" &&
                          event.isFirstDay && (
                            <div className="opacity-75 text-xs leading-tight">
                              {format(event.multiDayStart, "dd/MM")} -{" "}
                              {format(event.multiDayEnd, "dd/MM")}
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Show more indicator with hover tooltip */}
                {hasMoreEvents && (
                  <div className="relative">
                    <div
                      onMouseEnter={(e) =>
                        handleShowMoreHover(dayKey, hiddenEvents, e)
                      }
                      onMouseLeave={handleShowMoreLeave}
                      className="text-xs text-[#B595FF] font-medium px-1 py-0.5 hover:bg-[#B595FF] hover:bg-opacity-10 rounded transition-colors duration-200 cursor-pointer inline-block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      +{dayEvents.length - maxEventsToShow} más
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Tooltip para eventos adicionales */}
        {hoveredCell && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2 max-w-xs events-tooltip"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              transform: "translateY(-50%)",
            }}
          >
            {/* Lista compacta de eventos */}
            <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
              {hoveredCell.events.map((event, index) => (
                <div
                  key={event.id || index}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors duration-200 group"
                >
                  {/* Nombre del evento */}
                  <div className="flex items-center flex-1 min-w-0 mr-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 mr-2"
                      style={{
                        backgroundColor: event.backgroundColor || "#6366f1",
                      }}
                    />
                    <span
                      className="text-xs font-medium text-gray-900 truncate cursor-pointer hover:text-[#B595FF] transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event, e);
                        setHoveredCell(null);
                      }}
                      title={event.title}
                    >
                      {event.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CustomCalendarGrid;
