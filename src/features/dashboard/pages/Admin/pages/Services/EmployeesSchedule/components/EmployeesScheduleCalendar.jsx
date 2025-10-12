import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from "date-fns";
import es from "date-fns/locale/es";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "../Styles/calendarCustomSchedule.css";

const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const messages = {
  month: "Mes",
  week: "Semana",
  day: "Día",
  today: "Hoy",
  previous: "Atrás",
  next: "Siguiente",
  noEventsInRange: "No hay horarios en este rango.",
};

export default function EmployeesScheduleCalendar({
  schedules = [],
  onOpenModalForSlot,
  onOpenModalForEvent,
}) {
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());

  const ScheduleEvent = ({ event }) => (
    <div className="flex items-center gap-2 text-xs font-medium truncate cursor-pointer">
      <span
        className={`w-2 h-2 rounded-full ${event.color || "bg-primary-purple"}`}
      />
      <span className="truncate">{event.title}</span>
    </div>
  );

  const handleNavigate = (direction) => {
    if (view === "month") {
      setDate(direction === "next" ? addMonths(date, 1) : subMonths(date, 1));
    } else if (view === "week") {
      setDate(direction === "next" ? addWeeks(date, 1) : subWeeks(date, 1));
    } else if (view === "day") {
      setDate(direction === "next" ? addDays(date, 1) : subDays(date, 1));
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Columna Izquierda */}
      <div className="col-span-1 flex flex-col gap-6">
        {/* Mini Calendario */}
        <div className="rounded-2xl border border-gray-200 shadow-lg bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setDate(subMonths(date, 1))}
              className="p-1 rounded-full hover:bg-gray-200 transition"
            >
              <FaChevronLeft className="text-gray-600" />
            </button>
            <h3 className="text-lg font-bold text-gray-700 capitalize">
              {format(date, "MMMM yyyy", { locale: es })}
            </h3>
            <button
              onClick={() => setDate(addMonths(date, 1))}
              className="p-1 rounded-full hover:bg-gray-200 transition"
            >
              <FaChevronRight className="text-gray-600" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-500">
            {["L", "M", "X", "J", "V", "S", "D"].map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 mt-2 text-sm">
            {Array.from(
              {
                length: new Date(
                  date.getFullYear(),
                  date.getMonth() + 1,
                  0
                ).getDate(),
              },
              (_, i) => {
                const dayDate = new Date(
                  date.getFullYear(),
                  date.getMonth(),
                  i + 1
                );
                const isToday = isSameDay(dayDate, new Date());
                return (
                  <button
                    key={i}
                    onClick={() => setDate(dayDate)}
                    className={`h-10 w-10 flex items-center justify-center rounded-full transition-all ${
                      isToday
                        ? "bg-primary-purple text-white font-bold shadow"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Lista de actividades */}
        <div className="rounded-2xl border border-gray-200 shadow-lg bg-white p-4">
          <h3 className="text-lg font-bold text-gray-700 mb-3">Actividades</h3>
          <ul className="space-y-3 text-sm">
            {schedules.length === 0 ? (
              <li className="text-gray-400">No hay actividades</li>
            ) : (
              schedules.map((event, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 transition"
                >
                  <span
                    className={`w-3 h-3 rounded-full ${
                      event.color || "bg-primary-purple"
                    }`}
                  />
                  <span className="font-medium text-gray-700">
                    {event.title}
                  </span>
                  <span className="ml-auto text-xs text-gray-500">
                    {format(event.start, "HH:mm", { locale: es })}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Calendario Principal */}
      <div className="col-span-3">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavigate("prev")}
              className="p-2 rounded-full hover:bg-gray-200 transition"
            >
              <FaChevronLeft className="text-gray-600" />
            </button>
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight capitalize">
              {format(date, "MMMM yyyy", { locale: es })}
            </h2>
            <button
              onClick={() => handleNavigate("next")}
              className="p-2 rounded-full hover:bg-gray-200 transition"
            >
              <FaChevronRight className="text-gray-600" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            {["month", "week", "day"].map((viewType) => (
              <motion.button
                key={viewType}
                onClick={() => setView(viewType)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2 rounded-xl text-sm font-semibold shadow transition-all ${
                  view === viewType
                    ? "bg-primary-purple text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {messages[viewType]}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-gray-200 shadow-lg overflow-hidden bg-white"
          >
            <div className="employees-schedule-calendar">
              <Calendar
                selectable
                culture="es"
              localizer={localizer}
              events={schedules}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              components={{ event: ScheduleEvent }}
              views={["month", "week", "day"]}
              messages={messages}
              popup
              style={{ height: "70vh" }}
              onSelectSlot={(slot) =>
                onOpenModalForSlot?.({ start: slot.start, end: slot.end })
              }
              onSelectEvent={(event) => onOpenModalForEvent?.(event)}
            />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
