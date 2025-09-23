import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import es from "date-fns/locale/es";
import { motion, AnimatePresence } from "framer-motion";
import { FaLanguage, FaCog, FaUsers, FaMapMarkerAlt } from "react-icons/fa";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../Styles/calendarCustom.css";
import { EventModal } from "../components/EventModal";
import EventActionModal from "./EventActionModal";
import EventRegistrationModal from "./EventRegistrationModal";
import EventInscriptionModal from "./EventInscriptionModal";
import EventRegistrationFormModal from "./EventRegistrationFormModal";
import EnglishRegistrationModal from "./EnglishRegistrationModal";
import EnglishRegistrationFormModal from "./EnglishRegistrationFormModal";

import DayEventsModal from "./DayEventsModal";
import { showDeleteAlert, showSuccessAlert, showErrorAlert } from "../../../../../../../shared/utils/Alerts";

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
  showMore: (total) => `${total} eventos más`,
};

export default function EventsCalendar({ events: propEvents = [] }) {
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date()); // Fecha actual
  const [events, setEvents] = useState(propEvents);
  
  // Sincronizar eventos cuando cambien las props
  useEffect(() => {
    setEvents(propEvents);
  }, [propEvents]);
  
  // Funciones para la navegación del calendario
  const handlePrevious = () => {
    const newDate = new Date(date);
    if (view === 'month') {
      newDate.setMonth(date.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(date.getDate() - 7);
    } else if (view === 'day') {
      newDate.setDate(date.getDate() - 1);
    }
    setDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(date);
    if (view === 'month') {
      newDate.setMonth(date.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(date.getDate() + 7);
    } else if (view === 'day') {
      newDate.setDate(date.getDate() + 1);
    }
    setDate(newDate);
  };

  const handleToday = () => {
    setDate(new Date());
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [modalMode, setModalMode] = useState("create");

  // Action modals
  const [actionModal, setActionModal] = useState({ isOpen: false, position: null, event: null });
  const [registrationModal, setRegistrationModal] = useState({ isOpen: false, position: null, event: null });
  const [inscriptionModal, setInscriptionModal] = useState({ 
    isOpen: false, 
    eventName: "", 
    participantType: "", 
    action: "register" 
  });

  // Manejar click en acciones de evento
  const handleEventActionClick = (e, actionType, event) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const modalWidth = 220;
    const modalHeight = 150;
    
    let top = rect.bottom + 5;
    let left = rect.left;
    
    // Ajustar posición para evitar que se corte
    if (left + modalWidth > viewportWidth) {
      left = rect.right - modalWidth;
    }
    
    if (top + modalHeight > viewportHeight) {
      top = rect.top - modalHeight - 5;
    }
    
    if (left < 10) left = 10;
    if (top < 10) top = rect.bottom + 5;

    const position = { top, left };

    if (actionType === "crud") {
      setActionModal({ isOpen: true, position, event });
    } else if (actionType === "registration") {
      setRegistrationModal({ isOpen: true, position, event });
    }
  };

  // Componente de evento con botones mejorados
  const CustomEvent = ({ event }) => {
    const handleActionClick = (e, actionType) => {
      e.stopPropagation();
      handleEventActionClick(e, actionType, event);
    };

    const isMonthView = view === 'month';

    return (
      <div className="event-content" style={{ 
        fontSize: isMonthView ? '10px' : '11px',
        lineHeight: '1.2',
        padding: '2px'
      }}>
        <div className="event-info">
          <div className="event-title">
            {format(event.start, "HH:mm")} {event.title}
          </div>
          {event.ubicacion && !isMonthView && (
            <div className="event-location" style={{ fontSize: '9px', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <FaMapMarkerAlt size={8} /> {event.ubicacion}
            </div>
          )}
        </div>
        
        {/* Botones de acción con iconos de react-icons */}
        <div className="event-actions">
          <button
            onClick={(e) => handleActionClick(e, "crud")}
            className={`event-btn event-btn--manage ${isMonthView ? 'event-btn--month' : 'event-btn--week-day'}`}
            title="Gestionar evento"
          >
            <FaCog size={isMonthView ? 8 : 10} />
          </button>
          <button
            onClick={(e) => handleActionClick(e, "registration")}
            className={`event-btn event-btn--registration ${isMonthView ? 'event-btn--month' : 'event-btn--week-day'}`}
            title="Inscripciones"
          >
            <FaUsers size={isMonthView ? 8 : 10} />
          </button>
        </div>
      </div>
    );
  };

  // Crear (click en slot vacío)
  const handleSlotSelect = ({ start, end }) => {
    // Formatear fechas y horas
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const formatTime = (date) => {
      return date.toTimeString().slice(0, 5); // HH:MM
    };
    
    setSelectedEvent({
      nombre: "",
      descripcion: "",
      fechaInicio: startDate.toISOString().split('T')[0],
      fechaFin: endDate.toISOString().split('T')[0],
      horaInicio: formatTime(startDate),
      horaFin: formatTime(endDate),
    });
    setIsNew(true);
    setModalMode("create");
    setIsModalOpen(true);
  };

  // Deshabilitar click directo en evento (solo usar botones)
  const handleEventSelect = (event) => {
    // No hacer nada al hacer click directo en el evento
    // Solo permitir acciones a través de los botones
    return;
  };

  // Guardar
  const handleSaveEvent = (newEventData) => {
    try {
      // Crear fechas correctamente incluyendo las horas
      const createDateFromString = (dateString, timeString) => {
        try {
          const [year, month, day] = dateString.split('-').map(Number);
          const [hours, minutes] = timeString ? timeString.split(':').map(Number) : [12, 0];
          return new Date(year, month - 1, day, hours, minutes, 0);
        } catch (error) {
          console.error("Error al crear fecha:", error);
          return new Date(); // Fecha por defecto en caso de error
        }
      };

      if (isNew) {
        const newEvent = {
          id: Date.now(),
          title: newEventData.nombre || "Evento sin título",
          tipo: newEventData.tipo || "",
          descripcion: newEventData.descripcion || "",
          ubicacion: newEventData.ubicacion || "",
          telefono: newEventData.telefono || "",
          categoria: newEventData.categoria || "",
          estado: newEventData.estado || "",
          publicar: newEventData.publicar || false,
          patrocinador: newEventData.patrocinador || [],
          imagen: newEventData.imagen || null,
          cronograma: newEventData.cronograma || null,
          start: createDateFromString(newEventData.fechaInicio, newEventData.horaInicio),
          end: createDateFromString(newEventData.fechaFin, newEventData.horaFin),
          color: "bg-primary-purple",
        };
        setEvents((prev) => [...prev, newEvent]);
      } else {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === newEventData.id
              ? {
                  ...e,
                  title: newEventData.nombre || e.title,
                  tipo: newEventData.tipo || e.tipo,
                  descripcion: newEventData.descripcion || e.descripcion,
                  ubicacion: newEventData.ubicacion || e.ubicacion,
                  telefono: newEventData.telefono || e.telefono,
                  categoria: newEventData.categoria || e.categoria,
                  estado: newEventData.estado || e.estado,
                  publicar: newEventData.publicar !== undefined ? newEventData.publicar : e.publicar,
                  patrocinador: newEventData.patrocinador || e.patrocinador,
                  imagen: newEventData.imagen || e.imagen,
                  cronograma: newEventData.cronograma || e.cronograma,
                  start: createDateFromString(newEventData.fechaInicio, newEventData.horaInicio),
                  end: createDateFromString(newEventData.fechaFin, newEventData.horaFin),
                }
              : e
          )
        );
      }
    } catch (error) {
      console.error("Error al guardar evento:", error);
      showErrorAlert(
        "Error al guardar",
        "No se pudo guardar el evento. Intenta de nuevo."
      );
    }
  };

  // Manejar acciones CRUD
  const handleCrudAction = async (action) => {
    const event = actionModal.event;
    
    // Cerrar el modal de acciones primero
    closeAllModals();
    
    // Función para formatear tiempo
    const formatTime = (date) => {
      return date.toTimeString().slice(0, 5); // HH:MM
    };
    
    switch (action) {
      case "edit":
        setTimeout(() => {
          // Formatear fechas y horas correctamente
          const startDate = new Date(event.start);
          const endDate = new Date(event.end);
          
          setSelectedEvent({
            nombre: event.title,
            tipo: event.tipo,
            descripcion: event.descripcion || "",
            fechaInicio: startDate.toISOString().split('T')[0],
            fechaFin: endDate.toISOString().split('T')[0],
            horaInicio: formatTime(startDate),
            horaFin: formatTime(endDate),
            ubicacion: event.ubicacion || "",
            telefono: event.telefono || "",
            categoria: event.categoria || "",
            estado: event.estado || "",
            publicar: event.publicar || false,
            patrocinador: event.patrocinador || [],
            imagen: event.imagen || null,
            cronograma: event.cronograma || null,
            id: event.id,
          });
          setIsNew(false);
          setModalMode("edit");
          setIsModalOpen(true);
        }, 100);
        break;
        
      case "delete":
        try {
          const result = await showDeleteAlert(
            "¿Eliminar evento?",
            `Se eliminará permanentemente el evento: ${event.title}`
          );
          
          if (result.isConfirmed) {
            setEvents((prev) => prev.filter((e) => e.id !== event.id));
            showSuccessAlert(
              "Evento eliminado",
              `${event.title} ha sido eliminado correctamente.`
            );
          }
        } catch (error) {
          console.error("Error al eliminar evento:", error);
          showErrorAlert(
            "Error al eliminar",
            "No se pudo eliminar el evento. Intenta de nuevo."
          );
        }
        break;
        
      case "view":
        setTimeout(() => {
          // Formatear fechas y horas correctamente
          const startDate = new Date(event.start);
          const endDate = new Date(event.end);
          
          setSelectedEvent({
            nombre: event.title,
            tipo: event.tipo,
            descripcion: event.descripcion || "",
            fechaInicio: startDate.toISOString().split('T')[0],
            fechaFin: endDate.toISOString().split('T')[0],
            horaInicio: formatTime(startDate),
            horaFin: formatTime(endDate),
            ubicacion: event.ubicacion || "",
            telefono: event.telefono || "",
            categoria: event.categoria || "",
            estado: event.estado || "",
            publicar: event.publicar || false,
            patrocinador: event.patrocinador || [],
            imagen: event.imagen || null,
            cronograma: event.cronograma || null,
            id: event.id,
          });
          setIsNew(false);
          setModalMode("view");
          setIsModalOpen(true);
        }, 100);
        break;
    }
  };

  // Manejar acciones de inscripción
  // Nuevo estado para el modal de inscripción con formulario
  const [registrationFormModal, setRegistrationFormModal] = useState({
    isOpen: false,
    eventName: "",
    participantType: "",
    eventType: "",
  });

  // Estados para modales de inglés
  const [englishModal, setEnglishModal] = useState({ isOpen: false, position: null });
  const [englishFormModal, setEnglishFormModal] = useState({
    isOpen: false,
    action: "register",
  });

  // Estado para modal de "ver más eventos"
  const [dayEventsModal, setDayEventsModal] = useState({
    isOpen: false,
    date: null,
    events: [],
  });

  const handleRegistrationAction = (action, participantType) => {
    const event = registrationModal.event;
    
    // Cerrar el modal de selección primero
    closeAllModals();
    
    if (action === "register") {
      // Usar el nuevo modal de inscripción con formulario
      setTimeout(() => {
        setRegistrationFormModal({
          isOpen: true,
          eventName: event.title,
          participantType: participantType,
          eventType: event.tipo,
        });
      }, 100);
    } else {
      // Usar el modal anterior para editar y ver
      setTimeout(() => {
        setInscriptionModal({
          isOpen: true,
          eventName: event.title,
          participantType: participantType,
          action: action,
        });
      }, 100);
    }
  };

  // Manejar click del botón inglés
  const handleEnglishClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const modalWidth = 220;
    const modalHeight = 150;
    
    let top = rect.bottom + 5;
    let left = rect.left;
    
    // Ajustar posición para evitar que se corte
    if (left + modalWidth > viewportWidth) {
      left = rect.right - modalWidth;
    }
    
    if (top + modalHeight > viewportHeight) {
      top = rect.top - modalHeight - 5;
    }
    
    if (left < 10) left = 10;
    if (top < 10) top = rect.bottom + 5;

    setEnglishModal({ isOpen: true, position: { top, left } });
  };

  // Manejar acciones del modal de inglés
  const handleEnglishAction = (action) => {
    setEnglishModal({ isOpen: false, position: null });
    
    setTimeout(() => {
      setEnglishFormModal({
        isOpen: true,
        action: action,
      });
    }, 100);
  };

  // Cerrar modales
  const closeAllModals = () => {
    setActionModal({ isOpen: false, position: null, event: null });
    setRegistrationModal({ isOpen: false, position: null, event: null });
    setInscriptionModal({ isOpen: false, eventName: "", participantType: "", action: "register" });
    setRegistrationFormModal({ isOpen: false, eventName: "", participantType: "", eventType: "" });
    setEnglishModal({ isOpen: false, position: null });
    setEnglishFormModal({ isOpen: false, action: "register" });
    setDayEventsModal({ isOpen: false, date: null, events: [] });
  };

  return (
    <div className="calendar-container">
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
          {/* Botón Inglés - Movido a la izquierda del selector */}
          <motion.button
            onClick={handleEnglishClick}
            whileHover={{ scale: 1.1 }}
            className="mr-3 bg-primary-green px-3 py-1 rounded-lg flex items-center justify-center gap-2"
          >
            <FaLanguage className="text-xl text-black" />
            <span className="text-black font-medium">Inglés</span>
          </motion.button>
          
          {/* Botones de navegación */}
          <div className="flex items-center">
            <motion.button
              onClick={handleToday}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-l-xl text-sm font-medium shadow-sm"
            >
              {messages.today}
            </motion.button>
            <motion.button
              onClick={handlePrevious}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium shadow-sm"
            >
              &lt; {messages.previous}
            </motion.button>
            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-r-xl text-sm font-medium shadow-sm"
            >
              {messages.next} &gt;
            </motion.button>
          </div>
          
          {/* Botones de vista */}
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
          <div onClick={closeAllModals}>
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
              components={{
                event: CustomEvent
              }}
              eventPropGetter={(event) => ({
                className: `event-${event.tipo}`,
                'data-tipo': event.tipo
              })}
              
              // views={["month", "week", "day"]} // Quitamos para usar solo los personalizados
              messages={messages}
              popup={true}
              style={{ height: "60vh" }}
              onSelectSlot={handleSlotSelect}
              onSelectEvent={handleEventSelect}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Modales */}
      <AnimatePresence>
        {isModalOpen && (
          <EventModal
            event={selectedEvent}
            isNew={isNew}
            mode={modalMode}
            onClose={() => {
              setIsModalOpen(false);
              setModalMode("create");
            }}
            onSave={handleSaveEvent}
          />
        )}
      </AnimatePresence>

      {/* Modal de acciones CRUD */}
      <AnimatePresence>
        {actionModal.isOpen && (
          <EventActionModal
            isOpen={actionModal.isOpen}
            onClose={closeAllModals}
            onAction={handleCrudAction}
            position={actionModal.position}
          />
        )}
      </AnimatePresence>

      {/* Modal de inscripciones */}
      <AnimatePresence>
        {registrationModal.isOpen && (
          <EventRegistrationModal
            isOpen={registrationModal.isOpen}
            onClose={closeAllModals}
            onAction={handleRegistrationAction}
            position={registrationModal.position}
            eventType={registrationModal.event?.tipo}
          />
        )}
      </AnimatePresence>

      {/* Modal de inscripción de participantes */}
      <AnimatePresence>
        {inscriptionModal.isOpen && (
          <EventInscriptionModal
            isOpen={inscriptionModal.isOpen}
            onClose={closeAllModals}
            eventName={inscriptionModal.eventName}
            participantType={inscriptionModal.participantType}
            action={inscriptionModal.action}
          />
        )}
      </AnimatePresence>

      {/* Modal de inscripción con formulario */}
      <AnimatePresence>
        {registrationFormModal.isOpen && (
          <EventRegistrationFormModal
            isOpen={registrationFormModal.isOpen}
            onClose={closeAllModals}
            eventName={registrationFormModal.eventName}
            participantType={registrationFormModal.participantType}
            eventType={registrationFormModal.eventType}
          />
        )}
      </AnimatePresence>

      {/* Modales de Inglés */}
      <AnimatePresence>
        {englishModal.isOpen && (
          <EnglishRegistrationModal
            isOpen={englishModal.isOpen}
            onClose={closeAllModals}
            onAction={handleEnglishAction}
            position={englishModal.position}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {englishFormModal.isOpen && (
          <EnglishRegistrationFormModal
            isOpen={englishFormModal.isOpen}
            onClose={closeAllModals}
            action={englishFormModal.action}
          />
        )}
      </AnimatePresence>

      {/* Modal de eventos del día */}
      <AnimatePresence>
        {dayEventsModal.isOpen && (
          <DayEventsModal
            isOpen={dayEventsModal.isOpen}
            onClose={closeAllModals}
            date={dayEventsModal.date}
            events={dayEventsModal.events}
            onActionClick={handleEventActionClick}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
