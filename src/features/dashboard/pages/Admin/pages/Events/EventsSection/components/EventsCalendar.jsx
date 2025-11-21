import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import es from "date-fns/locale/es";
import { motion, AnimatePresence } from "framer-motion";
import { FaLanguage, FaCog, FaUsers, FaMapMarkerAlt } from "react-icons/fa";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../Styles/calendarCustomevents.css";
import { EventModal } from "../components/EventModal";
import EventActionModal from "./EventActionModal";
import EventRegistrationModal from "./EventRegistrationModal";
import EventInscriptionModal from "./EventInscriptionModal";
import EventRegistrationFormModal from "./EventRegistrationFormModal";
import EnglishRegistrationModal from "./EnglishRegistrationModal";
import EnglishRegistrationFormModal from "./EnglishRegistrationFormModal";

import DayEventsModal from "./DayEventsModal";
import {
  showDeleteAlert,
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../../shared/utils/alerts";

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

const EventsCalendar = forwardRef(function EventsCalendar({ 
  events: propEvents = [], 
  referenceData = { categories: [], types: [] },
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent
}, ref) {
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date()); // Fecha actual
  const [events, setEvents] = useState(propEvents);

  // Sincronizar eventos cuando cambien las props
  useEffect(() => {
    setEvents(propEvents);
  }, [propEvents]);

  // Exponer funciones al componente padre mediante ref
  useImperativeHandle(ref, () => ({
    changeMonth: (newDate) => {
      setDate(newDate);
    },
    getCurrentDate: () => date
  }));

  // Funciones para la navegación del calendario
  const handlePrevious = () => {
    const newDate = new Date(date);
    if (view === "month") {
      newDate.setMonth(date.getMonth() - 1);
    } else if (view === "week") {
      newDate.setDate(date.getDate() - 7);
    } else if (view === "day") {
      newDate.setDate(date.getDate() - 1);
    }
    setDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(date);
    if (view === "month") {
      newDate.setMonth(date.getMonth() + 1);
    } else if (view === "week") {
      newDate.setDate(date.getDate() + 7);
    } else if (view === "day") {
      newDate.setDate(date.getDate() + 1);
    }
    setDate(newDate);
  };

  const handleToday = () => {
    setDate(new Date());
  };

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [modalMode, setModalMode] = useState("create");

  // Action modals
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    position: null,
    event: null,
  });
  const [registrationModal, setRegistrationModal] = useState({
    isOpen: false,
    position: null,
    event: null,
  });
  const [inscriptionModal, setInscriptionModal] = useState({
    isOpen: false,
    eventName: "",
    participantType: "",
    action: "register",
  });

  // Manejar click en acciones de evento
  const handleEventActionClick = (e, actionType, event) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const modalWidth = 220;
    const modalHeight = 150;

    // Determinar si estamos en la penúltima fila del calendario
    const calendarRect = document
      .querySelector(".rbc-month-view")
      .getBoundingClientRect();
    const rowHeight = calendarRect.height / 6; // Aproximadamente 6 filas en vista mensual
    const isInPenultimateRow =
      rect.top > calendarRect.top + rowHeight * 4 &&
      rect.top < calendarRect.top + rowHeight * 5;

    // Posición predeterminada (abajo del botón)
    let top = rect.bottom + 5;
    let left = rect.left;

    // Si estamos en la penúltima fila, mostrar el modal arriba
    if (isInPenultimateRow) {
      top = rect.top - modalHeight - 5;
    }

    // Ajustar posición para evitar que se corte
    if (left + modalWidth > viewportWidth) {
      left = rect.right - modalWidth;
    }

    // Asegurarse de que el modal no se salga de la pantalla
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

    const isMonthView = view === "month";

    // Obtener la inicial del estado
    const getEstadoInicial = () => {
      if (!event.estado) return "?";

      const estados = {
        programado: "P",
        "en-curso": "C",
        finalizado: "F",
        cancelado: "X",
        "en-pausa": "E",
      };

      // Asegurarse de que el estado existe en el objeto estados
      return (
        estados[event.estado.toLowerCase()] ||
        event.estado.charAt(0).toUpperCase()
      );
    };

    // Obtener color según estado
    const getEstadoColor = () => {
      if (!event.estado) return "#8b5cf6";

      const colores = {
        programado: "#3b82f6",
        "en-curso": "#10b981",
        finalizado: "#9ca3af",
        cancelado: "#ef4444",
        "en-pausa": "#f59e0b",
      };
      return colores[event.estado.toLowerCase()] || "#8b5cf6";
    };

    return (
      <div
        className="event-content"
        style={{
          fontSize: isMonthView ? "10px" : "11px",
          lineHeight: "1.2",
          padding: "2px",
        }}
      >
        <div className="event-info">
          <div className="event-title pl-1">
            <span
              style={{
                display: "inline-block",
                width: "16px",
                height: "16px",
                lineHeight: "16px",
                textAlign: "center",
                borderRadius: "50%",
                backgroundColor: getEstadoColor(),
                color: "white",
                fontSize: "9px",
                fontWeight: "bold",
                marginRight: "4px",
                verticalAlign: "middle",
              }}
            >
              {getEstadoInicial()}
            </span>
            {event.title}
          </div>
          {event.ubicacion && !isMonthView && (
            <div
              className="event-location"
              style={{
                fontSize: "9px",
                display: "flex",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <FaMapMarkerAlt size={8} /> {event.ubicacion}
            </div>
          )}
        </div>

        {/* Botones de acción con iconos de react-icons */}
        <div className="event-actions">
          <button
            onClick={(e) => handleActionClick(e, "crud")}
            className={`event-btn event-btn--manage ${
              isMonthView ? "event-btn--month" : "event-btn--week-day"
            }`}
            title="Gestionar evento"
          >
            <FaCog size={isMonthView ? 8 : 10} />
          </button>
          <button
            onClick={(e) => handleActionClick(e, "registration")}
            className={`event-btn event-btn--registration ${
              isMonthView ? "event-btn--month" : "event-btn--week-day"
            }`}
            title="Inscripciones"
          >
            <FaUsers size={isMonthView ? 8 : 10} />
          </button>
        </div>
      </div>
    );
  };

  // Función helper para formatear fechas sin problemas de zona horaria
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
      fechaInicio: formatDateLocal(startDate),
      fechaFin: formatDateLocal(endDate),
      horaInicio: formatTime(startDate),
      horaFin: formatTime(endDate),
    });
    setIsNew(true);
    setModalMode("create");
    setIsModalOpen(true);
  };

  // Deshabilitar click directo en evento (solo usar botones)
  const handleEventSelect = () => {
    // No hacer nada al hacer click directo en el evento
    // Solo permitir acciones a través de los botones
    return;
  };

  // Guardar
  const handleSaveEvent = async (newEventData) => {
    try {
      if (isNew) {
        // Crear evento en el backend
        await onCreateEvent(newEventData);
      } else {
        // Actualizar evento en el backend
        await onUpdateEvent(newEventData.id, newEventData);
      }
      
      // Cerrar el modal
      setIsModalOpen(false);
    } catch (error) {
      // El error ya se muestra en el hook con showErrorAlert
    }
  };

  // Función antigua comentada por si se necesita referencia
  const handleSaveEventOld = (newEventData) => {
    try {
      // Crear fechas correctamente incluyendo las horas
      const createDateFromString = (dateString, timeString) => {
        try {
          const [year, month, day] = dateString.split("-").map(Number);
          const [hours, minutes] = timeString
            ? timeString.split(":").map(Number)
            : [12, 0];
          return new Date(year, month - 1, day, hours, minutes, 0);
        } catch (error) {
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
          start: createDateFromString(
            newEventData.fechaInicio,
            newEventData.horaInicio
          ),
          end: createDateFromString(
            newEventData.fechaFin,
            newEventData.horaFin
          ),
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
                  publicar:
                    newEventData.publicar !== undefined
                      ? newEventData.publicar
                      : e.publicar,
                  patrocinador: newEventData.patrocinador || e.patrocinador,
                  imagen: newEventData.imagen || e.imagen,
                  cronograma: newEventData.cronograma || e.cronograma,
                  start: createDateFromString(
                    newEventData.fechaInicio,
                    newEventData.horaInicio
                  ),
                  end: createDateFromString(
                    newEventData.fechaFin,
                    newEventData.horaFin
                  ),
                }
              : e
          )
        );
      }
    } catch (error) {
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
            tipoId: event.tipoId,
            descripcion: event.descripcion || "",
            fechaInicio: formatDateLocal(startDate),
            fechaFin: formatDateLocal(endDate),
            horaInicio: formatTime(startDate),
            horaFin: formatTime(endDate),
            ubicacion: event.ubicacion || "",
            telefono: event.telefono || "",
            categoria: event.categoria || "",
            categoriaId: event.categoriaId,
            estado: event.estadoOriginal || event.estado || "Programado",
            estadoOriginal: event.estadoOriginal || event.estado || "Programado",
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
            // Llamar al backend para eliminar el evento
            if (onDeleteEvent) {
              await onDeleteEvent(event.id, event.title);
            }
          }
        } catch (error) {
          // El error ya se maneja en el hook
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
            fechaInicio: formatDateLocal(startDate),
            fechaFin: formatDateLocal(endDate),
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
  const [englishModal, setEnglishModal] = useState({
    isOpen: false,
    position: null,
  });
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
    setInscriptionModal({
      isOpen: false,
      eventName: "",
      participantType: "",
      action: "register",
    });
    setRegistrationFormModal({
      isOpen: false,
      eventName: "",
      participantType: "",
      eventType: "",
    });
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
        className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6"
      >
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-800 tracking-tight text-center xl:text-left">
          {format(date, "MMMM yyyy", { locale: es })}
        </h2>
        
        {/* Controls Container - Responsive en múltiples breakpoints */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full xl:w-auto">
          {/* Primera línea en móvil: Inglés + Navegación */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Botón Inglés */}
            <motion.button
              onClick={handleEnglishClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="bg-primary-blue px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-primary-purple transition-colors flex-shrink-0"
            >
              <FaLanguage className="text-sm sm:text-base text-white" />
              <span className="text-white font-medium text-xs sm:text-sm">Inglés</span>
            </motion.button>

            {/* Botones de navegación */}
            <div className="flex items-center justify-center flex-1 md:flex-initial">
              <motion.button
                onClick={handleToday}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-2 sm:px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-l-lg text-xs sm:text-sm font-medium shadow-sm"
              >
                Hoy
              </motion.button>
              <motion.button
                onClick={handlePrevious}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-2 sm:px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs sm:text-sm font-medium shadow-sm border-l border-gray-200"
              >
                ← Atrás
              </motion.button>
              <motion.button
                onClick={handleNext}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-2 sm:px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-r-lg text-xs sm:text-sm font-medium shadow-sm border-l border-gray-200"
              >
                Siguiente →
              </motion.button>
            </div>
          </div>

          {/* Segunda línea en móvil: Botones de vista */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 w-full md:w-auto">
            {["month", "week", "day"].map((viewType) => (
              <motion.button
                key={viewType}
                onClick={() => setView(viewType)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 md:flex-initial px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold shadow transition-all ${
                  view === viewType
                    ? "bg-primary-purple text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {messages[viewType]}
              </motion.button>
            ))}
          </div>
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
          className="events-calendar rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-200 shadow-lg overflow-hidden bg-white"
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
                event: CustomEvent,
              }}
              eventPropGetter={(event) => ({
                className: `event-${event.tipo}`,
                "data-tipo": event.tipo,
              })}
              // views={["month", "week", "day"]} // Quitamos para usar solo los personalizados
              messages={messages}
              popup={true}
              style={{ height: view === "month" ? "65vh" : view === "week" ? "70vh" : "60vh", minHeight: "400px" }}
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
            referenceData={referenceData}
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
            eventStatus={actionModal.event?.estadoOriginal || actionModal.event?.estado}
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
);

export default EventsCalendar;
