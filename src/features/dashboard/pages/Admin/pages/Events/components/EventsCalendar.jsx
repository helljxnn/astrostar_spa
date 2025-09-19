import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import es from "date-fns/locale/es";
import { motion, AnimatePresence } from "framer-motion";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../Styles/calendarCustom.css";
import { EventModal } from "../components/EventModal";

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
  noEventsInRange: "No hay eventos en este rango.",
};

const sampleEvents = [
  {
    id: 1,
    title: "Festival 2025",
    start: new Date(2025, 5, 2, 10, 0),
    end: new Date(2025, 5, 2, 12, 0),
    color: "bg-primary-purple",
  },
  {
    id: 2,
    title: "Clausura",
    start: new Date(2025, 5, 5, 14, 0),
    end: new Date(2025, 5, 5, 16, 0),
    color: "bg-primary-blue",
  },
];

export default function EventsCalendar() {
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState(sampleEvents);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isNew, setIsNew] = useState(false);

  // Render evento estilo Notion
  const NotionEvent = ({ event }) => (
    <div className="flex items-center gap-2 text-xs font-medium truncate cursor-pointer">
      {/* Barra de color */}
      <span
        className={`w-1.5 h-3 rounded-full ${event.color || "bg-primary-purple"}`}
      />
      {/* Hora + título */}
      <span className="truncate">
        {event.start && (
          <span className="text-black mr-1">
            {format(event.start, "hh:mmaaa", { locale: es })}
          </span>
        )}
        {event.title}
      </span>
    </div>
  );

  // Crear (click en slot vacío)
  const handleSlotSelect = ({ start, end }) => {
    setSelectedEvent({
      nombre: "",
      descripcion: "",
      fechaInicio: format(start, "yyyy-MM-dd"),
      fechaFin: format(end, "yyyy-MM-dd"),
    });
    setIsNew(true);
    setIsModalOpen(true);
  };

  // Editar (click en evento existente)
  const handleEventSelect = (event) => {
    setSelectedEvent({
      nombre: event.title,
      descripcion: event.descripcion || "",
      fechaInicio: format(event.start, "yyyy-MM-dd"),
      fechaFin: format(event.end, "yyyy-MM-dd"),
      id: event.id,
    });
    setIsNew(false);
    setIsModalOpen(true);
  };

  // Guardar
  const handleSaveEvent = (newEventData) => {
    if (isNew) {
      const newEvent = {
        id: Date.now(),
        title: newEventData.nombre,
        start: new Date(newEventData.fechaInicio),
        end: new Date(newEventData.fechaFin),
        color: "bg-primary-purple",
      };
      setEvents((prev) => [...prev, newEvent]);
    } else {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === newEventData.id
            ? {
                ...e,
                title: newEventData.nombre,
                start: new Date(newEventData.fechaInicio),
                end: new Date(newEventData.fechaFin),
              }
            : e
        )
      );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-6"
      >
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
          {format(date, "MMMM yyyy", { locale: es })}
        </h2>
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

      {/* Calendario */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-gray-200 shadow-lg overflow-hidden bg-white"
        >
          <Calendar
            selectable
            culture="es"
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            components={{ event: NotionEvent }}
            views={["month", "week", "day"]}
            messages={messages}
            popup
            style={{ height: "60vh" }}
            onSelectSlot={handleSlotSelect}
            onSelectEvent={handleEventSelect}
          />
        </motion.div>
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <EventModal
            event={selectedEvent}
            isNew={isNew}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveEvent}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
