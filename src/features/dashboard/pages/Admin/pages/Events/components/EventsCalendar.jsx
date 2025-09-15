import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import es from "date-fns/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Plus, Edit3, Trash2, Clock, MapPin, Star, X } from "lucide-react";

const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Datos de ejemplo para demostración
const sampleEvents = [
  {
    id: 1,
    title: "Reunión de Estrategia",
    start: new Date(2025, 8, 15, 10, 0),
    end: new Date(2025, 8, 15, 11, 30),
    color: "#6366f1",
    description: "Planificación trimestral con el equipo directivo",
    location: "Sala de Juntas Principal",
    priority: "high"
  },
  {
    id: 2,
    title: "Presentación Cliente VIP",
    start: new Date(2025, 8, 16, 14, 0),
    end: new Date(2025, 8, 16, 15, 30),
    color: "#f59e0b",
    description: "Demostración del nuevo producto",
    location: "Office Virtual",
    priority: "high"
  },
  {
    id: 3,
    title: "Workshop Innovación",
    start: new Date(2025, 8, 18, 9, 0),
    end: new Date(2025, 8, 18, 17, 0),
    color: "#10b981",
    description: "Sesión de brainstorming y desarrollo creativo",
    location: "Centro de Innovación",
    priority: "medium"
  },
  {
    id: 4,
    title: "Coffee Break Team",
    start: new Date(2025, 8, 17, 15, 0),
    end: new Date(2025, 8, 17, 15, 30),
    color: "#8b5cf6",
    description: "Momento de relajación en equipo",
    location: "Café Central",
    priority: "low"
  }
];

export default function EventsCalendar({ events = sampleEvents, setEvents }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState("month");
  const [isCreating, setIsCreating] = useState(false);
  const [hoveredEvent, setHoveredEvent] = useState(null);

  const eventColors = [
    { name: "Indigo", value: "#6366f1" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Emerald", value: "#10b981" },
    { name: "Rose", value: "#f43f5e" },
    { name: "Violet", value: "#8b5cf6" },
    { name: "Cyan", value: "#06b6d4" }
  ];

  const handleSelectSlot = ({ start, end }) => {
    setIsCreating({ start, end });
  };

  const createEvent = (eventData) => {
    const newEvent = {
      id: Date.now(),
      ...eventData,
      color: eventData.color || "#6366f1"
    };
    if (setEvents) {
      setEvents((prev) => [...prev, newEvent]);
    }
    setIsCreating(false);
  };

  const deleteEvent = (eventId) => {
    if (setEvents) {
      setEvents((prev) => prev.filter(e => e.id !== eventId));
    }
    setSelectedEvent(null);
  };

  // Componente de evento premium con efectos avanzados
  const EventCard = ({ event }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, rotateX: -15 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      whileHover={{ 
        scale: 1.05, 
        rotateY: 2,
        rotateX: 2,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      whileTap={{ scale: 0.98 }}
      className="relative group p-2 px-3 rounded-xl text-xs font-bold truncate cursor-pointer overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${event.color}15, ${event.color}25)`,
        border: `1px solid ${event.color}40`,
        backdropFilter: "blur(10px)"
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedEvent(event);
      }}
      onMouseEnter={() => setHoveredEvent(event.id)}
      onMouseLeave={() => setHoveredEvent(null)}
    >
      {/* Efecto de brillo animado */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100"
        initial={false}
        animate={{ 
          background: hoveredEvent === event.id 
            ? `linear-gradient(45deg, transparent, ${event.color}20, transparent)`
            : "transparent"
        }}
        transition={{ duration: 0.6 }}
      />
      
      {/* Borde brillante */}
      <div 
        className="absolute inset-0 rounded-xl opacity-60"
        style={{
          background: `linear-gradient(135deg, ${event.color}60, ${event.color}20)`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "xor",
          padding: "1px"
        }}
      />

      {/* Contenido del evento */}
      <div className="relative z-10 flex items-center gap-1">
        {event.priority === "high" && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Star size={8} className="text-yellow-400 fill-current" />
          </motion.div>
        )}
        <span style={{ color: event.color }} className="font-black">
          {event.title}
        </span>
      </div>

      {/* Tooltip hover */}
      <AnimatePresence>
        {hoveredEvent === event.id && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="absolute top-full left-0 mt-2 p-3 bg-gray-900/95 backdrop-blur-md rounded-lg text-white text-xs shadow-2xl z-50 min-w-48"
          >
            <div className="font-semibold mb-1">{event.title}</div>
            <div className="text-gray-300 text-[10px] mb-1">
              <Clock size={10} className="inline mr-1" />
              {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}
            </div>
            {event.location && (
              <div className="text-gray-300 text-[10px]">
                <MapPin size={10} className="inline mr-1" />
                {event.location}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // Modal de creación de evento
  const CreateEventModal = () => {
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      location: "",
      color: "#6366f1",
      priority: "medium"
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!formData.title.trim()) return;
      
      createEvent({
        ...formData,
        start: isCreating.start,
        end: isCreating.end
      });
    };

    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsCreating(false)}
      >
        <motion.div
          className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl max-w-md w-full mx-4 shadow-2xl border border-white/20"
          initial={{ y: 50, scale: 0.9, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 50, scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <Plus size={20} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              Nuevo Evento
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Título del evento *"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white/80 backdrop-blur-sm"
                required
              />
            </div>
            
            <div>
              <textarea
                placeholder="Descripción del evento"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white/80 backdrop-blur-sm resize-none"
                rows={2}
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Ubicación (opcional)"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="flex-1 p-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white/80 backdrop-blur-sm"
              >
                <option value="low">Prioridad Baja</option>
                <option value="medium">Prioridad Media</option>
                <option value="high">Prioridad Alta</option>
              </select>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Color del evento:</p>
              <div className="flex gap-2">
                {eventColors.map((color) => (
                  <motion.button
                    key={color.value}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFormData({...formData, color: color.value})}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color.value ? 'border-gray-800 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
              >
                Cancelar
              </button>
              <motion.button
                type="button"
                onClick={handleSubmit}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold shadow-lg transition-all"
              >
                Crear Evento
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Premium */}
        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div 
                className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl"
                whileHover={{ rotate: 5, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <CalendarDays size={28} className="text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
                  Calendar Pro
                </h1>
                <p className="text-gray-600 font-medium">Gestiona tus eventos con estilo</p>
              </div>
            </div>

            {/* Vista selector */}
            <div className="flex items-center gap-3">
              {["month", "week", "day"].map((viewType) => (
                <motion.button
                  key={viewType}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView(viewType)}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${
                    view === viewType
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                      : "bg-white/70 backdrop-blur-sm text-gray-600 hover:bg-white border border-white/40"
                  }`}
                >
                  {viewType === "month" ? "Mes" : viewType === "week" ? "Semana" : "Día"}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Calendario Principal */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden"
        >
          <div className="p-8">
            <motion.div
              className="rounded-2xl overflow-hidden border border-gray-200/50 shadow-xl"
              style={{ minHeight: "75vh" }}
            >
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                view={view}
                onView={setView}
                components={{ 
                  event: EventCard
                }}
                views={["month", "week", "day"]}
                popup
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={(event) => setSelectedEvent(event)}
                className="premium-calendar"
                dayPropGetter={(date) => ({
                  style: {
                    backgroundColor: "transparent"
                  }
                })}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Modal de detalles del evento */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
            >
              <motion.div
                className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl max-w-lg w-full mx-4 shadow-2xl border border-white/20"
                initial={{ y: 50, scale: 0.9, opacity: 0, rotateX: -15 }}
                animate={{ y: 0, scale: 1, opacity: 1, rotateX: 0 }}
                exit={{ y: 50, scale: 0.9, opacity: 0, rotateX: -15 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div 
                      className="p-3 rounded-2xl shadow-lg"
                      style={{ 
                        background: `linear-gradient(135deg, ${selectedEvent.color}, ${selectedEvent.color}80)`
                      }}
                    >
                      <CalendarDays size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">
                        {selectedEvent.title}
                      </h3>
                      {selectedEvent.priority === "high" && (
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-500 fill-current" />
                          <span className="text-sm text-yellow-600 font-semibold">Prioridad Alta</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-xl bg-blue-100 hover:bg-blue-200 transition-colors"
                      onClick={() => alert("Función de edición próximamente 🚀")}
                    >
                      <Edit3 size={16} className="text-blue-600" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-xl bg-red-100 hover:bg-red-200 transition-colors"
                      onClick={() => deleteEvent(selectedEvent.id)}
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                      onClick={() => setSelectedEvent(null)}
                    >
                      <X size={16} className="text-gray-600" />
                    </motion.button>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {selectedEvent.description && (
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Descripción</p>
                      <p className="text-gray-800">{selectedEvent.description}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={16} />
                    <span className="text-sm">
                      {format(selectedEvent.start, "PPP", { locale: es })} • {format(selectedEvent.start, "HH:mm")} - {format(selectedEvent.end, "HH:mm")}
                    </span>
                  </div>

                  {selectedEvent.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={16} />
                      <span className="text-sm">{selectedEvent.location}</span>
                    </div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 font-bold text-gray-700 transition-all"
                  onClick={() => setSelectedEvent(null)}
                >
                  Cerrar
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de creación */}
        <AnimatePresence>
          {isCreating && <CreateEventModal />}
        </AnimatePresence>

        {/* Estilos CSS personalizados */}
        <style jsx global>{`
          .premium-calendar {
            font-family: 'Inter', sans-serif;
          }
          
          .rbc-calendar {
            background: transparent;
          }
          
          .rbc-header {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            font-weight: 700;
            color: #475569;
            border: none;
            padding: 16px 8px;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.05em;
          }
          
          .rbc-today {
            background: linear-gradient(135deg, #ddd6fe20, #c7d2fe20) !important;
          }
          
          .rbc-date-cell {
            font-weight: 600;
            color: #64748b;
          }
          
          .rbc-date-cell.rbc-now {
            font-weight: 900;
            color: #6366f1;
            background: linear-gradient(135deg, #6366f120, #8b5cf620);
            border-radius: 8px;
          }
          
          .rbc-month-view {
            border: none;
            border-radius: 16px;
            overflow: hidden;
          }
          
          .rbc-day-bg {
            border: 1px solid #f1f5f9;
          }
          
          .rbc-day-bg:hover {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          }
          
          .rbc-slot-selecting {
            background: linear-gradient(135deg, #6366f130, #8b5cf630) !important;
            border-radius: 8px;
          }
          
          .rbc-toolbar {
            margin-bottom: 24px;
            padding: 16px;
            background: linear-gradient(135deg, #ffffff80, #f8fafc80);
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            backdrop-filter: blur(10px);
          }
          
          .rbc-toolbar button {
            background: linear-gradient(135deg, #ffffff, #f8fafc);
            border: 1px solid #e2e8f0;
            color: #475569;
            font-weight: 600;
            border-radius: 12px;
            padding: 8px 16px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          
          .rbc-toolbar button:hover {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          }
          
          .rbc-toolbar button.rbc-active {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          }

          .rbc-event {
            border: none !important;
            outline: none !important;
          }

          .rbc-event:focus {
            outline: none !important;
          }

          .rbc-selected {
            background: none !important;
          }

          .rbc-show-more {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            border-radius: 8px;
            border: none;
            font-weight: 600;
            padding: 4px 8px;
            font-size: 11px;
          }
        `}</style>
      </div>
    </div>
  );
}