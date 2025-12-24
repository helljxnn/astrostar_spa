import React, { useMemo } from "react";
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
import LoadingSpinner from "../../LoadingSpinner";
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

  // Group events by date
  const eventsByDate = useMemo(() => {
    const groups = {};

    if (!events || !Array.isArray(events)) return groups;

    events.forEach((event) => {
      if (!event) return;

      try {
        const eventDate = new Date(event.date || event.start || new Date());
        const dateKey = format(eventDate, "yyyy-MM-dd");

        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }

        groups[dateKey].push(event);
      } catch (error) {
        console.warn("Error processing event date:", event, error);
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
    e.stopPropagation();
    if (onEventClick) {
      onEventClick(event);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-xl border border-gray-100">
        <LoadingSpinner />
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
                  <span className="inline-block mt-2 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
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
      <div className={`grid ${gridCols}`}>
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(day);
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
                view === "week" ? "min-h-[240px]" : "min-h-[90px]"
              } p-3 border-r border-b border-gray-200 last:border-r-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                !isCurrentMonth ? "bg-gray-50 text-gray-400" : "bg-white"
              } ${isSelectedDay ? "bg-blue-50 border-blue-200" : ""}`}
              onClick={() => handleDateClick(day)}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-medium ${
                    isDayToday
                      ? "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
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
              <div className="space-y-1">
                {dayEvents
                  .slice(0, view === "week" ? 8 : 3)
                  .map((event, eventIndex) => (
                    <div
                      key={event.id || eventIndex}
                      onClick={(e) => handleEventClick(event, e)}
                      className="cursor-pointer"
                    >
                      {renderEvent ? (
                        renderEvent(event, "grid")
                      ) : (
                        <div
                          className={`${
                            view === "week"
                              ? "p-1.5 text-xs border-l-2 bg-gray-50 hover:bg-gray-100"
                              : "p-1.5 rounded text-xs hover:opacity-80"
                          } transition-colors duration-200`}
                          style={{
                            borderLeftColor:
                              view === "week"
                                ? event.backgroundColor || "#6366f1"
                                : undefined,
                            backgroundColor:
                              view === "week"
                                ? undefined
                                : event.backgroundColor || "#6366f1",
                            color: view === "week" ? "#374151" : "white",
                          }}
                        >
                          <div className="font-medium truncate leading-tight">
                            {event.title}
                          </div>
                          {view === "week" && event.time && (
                            <div className="text-xs text-gray-600 mt-0.5">
                              {event.time}
                            </div>
                          )}
                          {view === "month" && event.time && (
                            <div className="opacity-75 text-xs leading-tight">
                              {event.time}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                {/* Show more indicator */}
                {dayEvents.length > (view === "week" ? 8 : 3) && (
                  <div className="text-xs text-gray-500 font-medium px-1">
                    +{dayEvents.length - (view === "week" ? 8 : 3)} más
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomCalendarGrid;
