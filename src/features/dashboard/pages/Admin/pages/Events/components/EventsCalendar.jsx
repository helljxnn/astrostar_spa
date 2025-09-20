import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isSameDay } from "date-fns";
import es from "date-fns/locale/es";
import { motion, AnimatePresence } from "framer-motion";
import { FaLanguage } from "react-icons/fa";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../Styles/calendarCustom.css";
import { EventModal } from "../components/EventModal";
import EventActionModal from "./EventActionModal";
import EventRegistrationModal from "./EventRegistrationModal";
import EventInscriptionModal from "./EventInscriptionModal";
import EventRegistrationFormModal from "./EventRegistrationFormModal";
import EnglishRegistrationModal from "./EnglishRegistrationModal";
import EnglishRegistrationFormModal from "./EnglishRegistrationFormModal";
import NotionEventComponent from "./NotionEventComponent";
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
};

// Eventos de prueba con fechas actuales
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();

const sampleEvents = [
  {
    id: 1,
    title: "Festival 2025",
    tipo: "Festival",
    descripcion: "Festival deportivo anual con múltiples disciplinas",
    ubicacion: "Estadio Municipal",
    telefono: "3001234567",
    categoria: "Todas",
    estado: "Programado",
    publicar: true,
    patrocinador: ["Natipan", "Adidas"],
    imagen: null,
    cronograma: null,
    start: new Date(currentYear, currentMonth, today.getDate(), 10, 0),
    end: new Date(currentYear, currentMonth, today.getDate(), 12, 0),
    color: "bg-primary-purple",
  },
  {
    id: 2,
    title: "Clausura",
    tipo: "Clausura",
    descripcion: "Ceremonia de clausura del año deportivo",
    ubicacion: "Coliseo Central",
    telefono: "3007654321",
    categoria: "Juvenil",
    estado: "Programado",
    publicar: false,
    patrocinador: ["Ponymalta"],
    imagen: null,
    cronograma: null,
    start: new Date(currentYear, currentMonth, today.getDate() + 1, 14, 0),
    end: new Date(currentYear, currentMonth, today.getDate() + 1, 16, 0),
    color: "bg-primary-blue",
  },
  {
    id: 3,
    title: "Taller Técnico",
    tipo: "Taller",
    descripcion: "Taller de técnicas deportivas avanzadas",
    ubicacion: "Aula Magna",
    telefono: "3009876543",
    categoria: "Pre Juvenil",
    estado: "Ejecutado",
    publicar: true,
    patrocinador: ["NovaSport", "Adidas", "Natipan"],
    imagen: null,
    cronograma: null,
    start: new Date(currentYear, currentMonth, today.getDate() + 2, 9, 0),
    end: new Date(currentYear, currentMonth, today.getDate() + 2, 11, 0),
    color: "bg-green-500",
  },
  {
    id: 4,
    title: "Torneo Sub 17",
    tipo: "Torneo",
    descripcion: "Torneo intercolegiado categoría Sub 17",
    ubicacion: "Complejo Deportivo Norte",
    telefono: "3005432109",
    categoria: "Juvenil",
    estado: "En pausa",
    publicar: true,
    patrocinador: [],
    imagen: null,
    cronograma: null,
    start: new Date(currentYear, currentMonth, today.getDate() + 5, 8, 0),
    end: new Date(currentYear, currentMonth, today.getDate() + 5, 18, 0),
    color: "bg-orange-500",
  },
  {
    id: 5,
    title: "Entrenamiento",
    tipo: "Taller",
    descripcion: "Sesión de entrenamiento grupal",
    ubicacion: "Cancha Principal",
    telefono: "3001234567",
    categoria: "Todas",
    estado: "Programado",
    publicar: true,
    patrocinador: [],
    imagen: null,
    cronograma: null,
    start: new Date(currentYear, currentMonth, today.getDate(), 16, 0),
    end: new Date(currentYear, currentMonth, today.getDate(), 18, 0),
    color: "bg-primary-blue",
  },
];

export default function EventsCalendar() {
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date()); // Fecha actual
  const [events, setEvents] = useState(sampleEvents);

  // Debug: verificar que los eventos se carguen
  console.log("Eventos cargados:", events);
  console.log("Fecha actual del calendario:", date);
  console.log("Vista actual:", view);

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

  // Componente de evento que funciona con react-big-calendar
  const EventComponent = ({ event }) => {
    console.log("=== EVENTO RENDERIZADO ===");
    console.log("Título:", event.title);
    console.log("Fecha:", event.start);
    console.log("Vista:", view);
    console.log("========================");
    
    const handleActionClick = (e, actionType) => {
      e.stopPropagation();
      e.preventDefault();
      handleEventActionClick(e, actionType, event);
    };

    // Retornar solo el contenido, sin wrapper adicional
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ flex: 1, minWidth: 0, marginRight: '4px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '11px', lineHeight: '1.2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {format(event.start, "HH:mm")} {event.title}
            </div>
            {event.ubicacion && (
              <div style={{ fontSize: '10px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                📍 {event.ubicacion}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
            <button
              onClick={(e) => handleActionClick(e, "crud")}
              style={{
                background: 'white',
                border: '1px solid #ccc',
                borderRadius: '3px',
                padding: '2px 4px',
                cursor: 'pointer',
                fontSize: '10px',
                minWidth: '16px',
                minHeight: '16px'
              }}
              title="Gestionar evento"
            >
              ⚙️
            </button>
            <button
              onClick={(e) => handleActionClick(e, "registration")}
              style={{
                background: 'white',
                border: '1px solid #ccc',
                borderRadius: '3px',
                padding: '2px 4px',
                cursor: 'pointer',
                fontSize: '10px',
                minWidth: '16px',
                minHeight: '16px'
              }}
              title="Inscripciones"
            >
              👥
            </button>
          </div>
        </div>
      </>
    );
  };

  // Crear (click en slot vacío)
  const handleSlotSelect = ({ start, end }) => {
    // Usar toISOString().split('T')[0] para evitar problemas de zona horaria
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    setSelectedEvent({
      nombre: "",
      descripcion: "",
      fechaInicio: startDate.toISOString().split('T')[0],
      fechaFin: endDate.toISOString().split('T')[0],
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
    // Crear fechas correctamente para evitar problemas de zona horaria
    const createDateFromString = (dateString) => {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day, 12, 0, 0); // Mediodía para evitar problemas de zona horaria
    };

    if (isNew) {
      const newEvent = {
        id: Date.now(),
        title: newEventData.nombre,
        tipo: newEventData.tipo,
        descripcion: newEventData.descripcion,
        ubicacion: newEventData.ubicacion,
        telefono: newEventData.telefono,
        categoria: newEventData.categoria,
        estado: newEventData.estado,
        publicar: newEventData.publicar,
        patrocinador: newEventData.patrocinador,
        imagen: newEventData.imagen,
        cronograma: newEventData.cronograma,
        start: createDateFromString(newEventData.fechaInicio),
        end: createDateFromString(newEventData.fechaFin),
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
                tipo: newEventData.tipo,
                descripcion: newEventData.descripcion,
                ubicacion: newEventData.ubicacion,
                telefono: newEventData.telefono,
                categoria: newEventData.categoria,
                estado: newEventData.estado,
                publicar: newEventData.publicar,
                patrocinador: newEventData.patrocinador,
                imagen: newEventData.imagen,
                cronograma: newEventData.cronograma,
                start: createDateFromString(newEventData.fechaInicio),
                end: createDateFromString(newEventData.fechaFin),
              }
            : e
        )
      );
    }
  };

  // Manejar acciones CRUD
  const handleCrudAction = async (action) => {
    const event = actionModal.event;
    
    // Cerrar el modal de acciones primero
    closeAllModals();
    
    switch (action) {
      case "edit":
        setTimeout(() => {
          // Formatear fechas correctamente para evitar desfase de zona horaria
          const startDate = new Date(event.start);
          const endDate = new Date(event.end);
          
          setSelectedEvent({
            nombre: event.title,
            tipo: event.tipo,
            descripcion: event.descripcion || "",
            fechaInicio: startDate.toISOString().split('T')[0],
            fechaFin: endDate.toISOString().split('T')[0],
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
          // Formatear fechas correctamente para evitar desfase de zona horaria
          const startDate = new Date(event.start);
          const endDate = new Date(event.end);
          
          setSelectedEvent({
            nombre: event.title,
            tipo: event.tipo,
            descripcion: event.descripcion || "",
            fechaInicio: startDate.toISOString().split('T')[0],
            fechaFin: endDate.toISOString().split('T')[0],
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
          {/* Botón Inglés */}
          <motion.button
            onClick={handleEnglishClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-5 py-2 bg-primary-green text-black rounded-xl text-sm font-semibold shadow hover:opacity-90 transition-all"
          >
            <FaLanguage className="w-4 h-4" />
            Inglés
          </motion.button>
          
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
                event: EventComponent
              }}
              views={["month", "week", "day"]}
              messages={messages}
              popup={false}
              style={{ height: "60vh" }}
              onSelectSlot={handleSlotSelect}
              onSelectEvent={handleEventSelect}
              eventPropGetter={(event) => {
                console.log("eventPropGetter llamado para:", event.title);
                const getEventClass = (tipo) => {
                  switch (tipo?.toLowerCase()) {
                    case 'festival':
                      return 'event-festival';
                    case 'torneo':
                      return 'event-torneo';
                    case 'taller':
                      return 'event-taller';
                    case 'clausura':
                      return 'event-clausura';
                    default:
                      return '';
                  }
                };
                
                return {
                  className: getEventClass(event.tipo),
                  style: {}
                };
              }}
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
