import {
  useState,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { AnimatePresence } from "framer-motion";
import { FaPlus } from "react-icons/fa";
import BaseCalendar from "../../../../../../../../../shared/components/Calendar/BaseCalendar/BaseCalendar";
import { DashboardEventComponent } from "./DashboardEventComponent";
import { EventModal } from "./EventModal";
import EventActionModal from "./EventActionModal";
import EventRegistrationOptionsModal from "../registration/EventRegistrationOptionsModal";
import { TeamRegistrationFormModal } from "../registration";
import ViewRegistrationsModal from "../registration/ViewRegistrationsModal";
import DayEventsModal from "./DayEventsModal";
import {
  transformEventsForBaseCalendar,
  createCalendarFilters,
  applyDashboardFilters,
  getSearchFields,
  transformFormDataForBackend,
} from "../../adapters/eventsCalendarAdapter";
import {
  showDeleteAlert,
  showErrorAlert,
} from "../../../../../../../../../shared/utils/alerts";
import { usePermissions } from "../../../../../../../../../shared/hooks/usePermissions";

/**
 * Calendario de eventos del dashboard basado en el calendario genérico BaseCalendar
 * Reemplaza completamente el calendario original con funcionalidad mejorada
 */
const EventsCalendar = forwardRef(function EventsCalendar(
  {
    events: propEvents = [],
    referenceData = { categories: [], types: [] },
    onCreateEvent,
    onUpdateEvent,
    onDeleteEvent,
    onRefresh,
    searchTerm = "",
    selectedFilters = {},
    onFiltersChange,
  },
  ref
) {
  const { hasPermission } = usePermissions();

  // Estados para modales del dashboard
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [isNew, setIsNew] = useState(false);

  // Estados para modales de acciones
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
    eventId: null,
  });

  const [registrationFormModal, setRegistrationFormModal] = useState({
    isOpen: false,
    eventName: "",
    participantType: "",
    eventType: "",
    eventId: null,
    mode: "register",
  });

  const [dayEventsModal, setDayEventsModal] = useState({
    isOpen: false,
    date: null,
    events: [],
  });

  // Transformar eventos para el calendario genérico
  const transformedEvents = useMemo(() => {
    return transformEventsForBaseCalendar(propEvents);
  }, [propEvents]);

  // Crear filtros para el calendario genérico
  const calendarFilters = useMemo(() => {
    return createCalendarFilters(referenceData);
  }, [referenceData]);

  // Exponer funciones al componente padre mediante ref
  useImperativeHandle(ref, () => ({
    changeMonth: (newDate) => {
      // Esta funcionalidad será manejada por el BaseCalendar internamente
    },
    getCurrentDate: () => new Date(), // El BaseCalendar maneja esto internamente
  }));

  // Manejar click en evento (delegado al BaseCalendar)
  const handleEventClick = useCallback(() => {
    // No hacer nada aquí, las acciones se manejan a través de los botones del evento
    return;
  }, []);

  // Manejar selección de fecha/slot para crear evento
  const handleDateSelect = useCallback(
    (slotInfo) => {
      // Validar permisos
      if (!hasPermission("eventsManagement", "Crear")) {
        showErrorAlert("Sin permisos", "No tienes permisos para crear eventos");
        return;
      }

      // Validar que la fecha seleccionada sea al menos el día siguiente
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const selectedDate = new Date(slotInfo.start);
      const selectedDateOnly = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );

      if (selectedDateOnly < tomorrow) {
        showErrorAlert(
          "Fecha no válida",
          "Los eventos deben crearse con al menos un día de anticipación. Por favor, selecciona una fecha a partir de mañana."
        );
        return;
      }

      // Formatear fechas y horas
      const formatDateLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const formatTime = (date) => {
        return date.toTimeString().slice(0, 5); // HH:MM
      };

      const startDate = new Date(slotInfo.start);
      const endDate = new Date(slotInfo.end);

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
    },
    [hasPermission]
  );

  // Manejar selección de slot (para crear evento)
  const handleSlotSelect = useCallback(
    (slotInfo) => {
      handleDateSelect(slotInfo);
    },
    [handleDateSelect]
  );

  // Manejar click en acciones de evento
  const handleEventActionClick = useCallback(
    (e, actionType, dashboardEvent) => {
      if (!e.currentTarget) {
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const modalWidth = 220;
      const modalHeight = 150;

      // Posición predeterminada (abajo del botón)
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
        setActionModal({ isOpen: true, position, event: dashboardEvent });
      } else if (actionType === "registration") {
        setRegistrationModal({ isOpen: true, position, event: dashboardEvent });
      }
    },
    []
  );

  // Renderizar evento personalizado
  const renderEvent = useCallback(
    ({ event, view }) => {
      if (!event) {
        return <div>Error: Evento inválido</div>;
      }

      return (
        <DashboardEventComponent
          event={event}
          view={view}
          onActionClick={handleEventActionClick}
        />
      );
    },
    [handleEventActionClick]
  );

  // Manejar acciones CRUD
  const handleCrudAction = useCallback(
    async (action) => {
      const dashboardEvent = actionModal.event;
      closeAllModals();

      const formatTime = (date) => {
        return date.toTimeString().slice(0, 5); // HH:MM
      };

      const formatDateLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      switch (action) {
        case "edit":
          if (!hasPermission("eventsManagement", "Editar")) {
            showErrorAlert(
              "Sin permisos",
              "No tienes permisos para editar eventos"
            );
            return;
          }

          // Verificar si el evento está finalizado
          const estadoEvento =
            dashboardEvent.estadoOriginal || dashboardEvent.estado || "";
          const now = new Date();
          const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );

          const eventEndDate = dashboardEvent.end
            ? new Date(dashboardEvent.end)
            : new Date(dashboardEvent.start);
          const endDateOnly = new Date(
            eventEndDate.getFullYear(),
            eventEndDate.getMonth(),
            eventEndDate.getDate()
          );
          const hasPassed = endDateOnly < today;

          if (estadoEvento === "Finalizado" || estadoEvento === "finalizado") {
            showErrorAlert(
              "Evento Finalizado",
              "No se puede editar un evento que ya finalizó. Solo puedes verlo o eliminarlo."
            );
            return;
          }

          if (
            (estadoEvento === "Cancelado" || estadoEvento === "cancelado") &&
            hasPassed
          ) {
            showErrorAlert(
              "Evento Cancelado y Finalizado",
              "No se puede editar un evento cancelado cuya fecha ya pasó. Solo puedes verlo o eliminarlo."
            );
            return;
          }

          setTimeout(() => {
            const startDate = new Date(dashboardEvent.start);
            const endDate = new Date(dashboardEvent.end);

            setSelectedEvent({
              nombre: dashboardEvent.title,
              tipo: dashboardEvent.tipo,
              tipoId: dashboardEvent.tipoId,
              descripcion: dashboardEvent.descripcion || "",
              fechaInicio: formatDateLocal(startDate),
              fechaFin: formatDateLocal(endDate),
              horaInicio: formatTime(startDate),
              horaFin: formatTime(endDate),
              ubicacion: dashboardEvent.ubicacion || "",
              telefono: dashboardEvent.telefono || "",
              categoria: dashboardEvent.categoria || "",
              categoryIds: dashboardEvent.categoryIds || [],
              estado:
                dashboardEvent.estadoOriginal ||
                dashboardEvent.estado ||
                "Programado",
              estadoOriginal:
                dashboardEvent.estadoOriginal ||
                dashboardEvent.estado ||
                "Programado",
              publicar: dashboardEvent.publicar || false,
              patrocinador: dashboardEvent.patrocinador || [],
              imagen: dashboardEvent.imagen || null,
              cronograma: dashboardEvent.cronograma || null,
              id: dashboardEvent.id,
            });
            setIsNew(false);
            setModalMode("edit");
            setIsModalOpen(true);
          }, 100);
          break;

        case "delete":
          if (!hasPermission("eventsManagement", "Eliminar")) {
            showErrorAlert(
              "Sin permisos",
              "No tienes permisos para eliminar eventos"
            );
            return;
          }

          try {
            const result = await showDeleteAlert(
              "¿Eliminar evento?",
              `Se eliminará permanentemente el evento: ${dashboardEvent.title}`
            );

            if (result.isConfirmed) {
              if (onDeleteEvent) {
                await onDeleteEvent(dashboardEvent.id, dashboardEvent.title);
              }
            }
          } catch (error) {
            // El error ya se maneja en el hook
          }
          break;

        case "view":
          if (!hasPermission("eventsManagement", "Ver")) {
            showErrorAlert(
              "Sin permisos",
              "No tienes permisos para ver eventos"
            );
            return;
          }

          setTimeout(() => {
            const startDate = new Date(dashboardEvent.start);
            const endDate = new Date(dashboardEvent.end);

            setSelectedEvent({
              nombre: dashboardEvent.title,
              tipo: dashboardEvent.tipo,
              descripcion: dashboardEvent.descripcion || "",
              fechaInicio: formatDateLocal(startDate),
              fechaFin: formatDateLocal(endDate),
              horaInicio: formatTime(startDate),
              horaFin: formatTime(endDate),
              ubicacion: dashboardEvent.ubicacion || "",
              telefono: dashboardEvent.telefono || "",
              categoria: dashboardEvent.categoria || "",
              categoryIds: dashboardEvent.categoryIds || [],
              estado: dashboardEvent.estado || "",
              publicar: dashboardEvent.publicar || false,
              patrocinador: dashboardEvent.patrocinador || [],
              imagen: dashboardEvent.imagen || null,
              cronograma: dashboardEvent.cronograma || null,
              id: dashboardEvent.id,
            });
            setIsNew(false);
            setModalMode("view");
            setIsModalOpen(true);
          }, 100);
          break;
      }
    },
    [actionModal.event, hasPermission, onDeleteEvent]
  );

  // Manejar acciones de inscripción
  const handleRegistrationAction = useCallback(
    (action, participantType) => {
      const dashboardEvent = registrationModal.event;
      const estadoEvento =
        dashboardEvent.estadoOriginal || dashboardEvent.estado || "";

      closeAllModals();

      if (action === "register" || action === "editRegistrations") {
        if (estadoEvento === "Finalizado" || estadoEvento === "finalizado") {
          showErrorAlert(
            "Evento Finalizado",
            "No se pueden realizar inscripciones en un evento finalizado."
          );
          return;
        }

        if (estadoEvento === "Cancelado" || estadoEvento === "cancelado") {
          showErrorAlert(
            "Evento Cancelado",
            "No se pueden realizar inscripciones en un evento cancelado."
          );
          return;
        }

        setTimeout(() => {
          setRegistrationFormModal({
            isOpen: true,
            eventName: dashboardEvent.title,
            participantType: participantType,
            eventType: dashboardEvent.tipo,
            eventId: dashboardEvent.id,
            mode: action === "editRegistrations" ? "edit" : "register",
          });
        }, 100);
      } else if (action === "viewRegistrations") {
        setTimeout(() => {
          setInscriptionModal({
            isOpen: true,
            eventName: dashboardEvent.title,
            participantType: participantType,
            action: action,
            eventId: dashboardEvent.id,
          });
        }, 100);
      }
    },
    [registrationModal.event]
  );

  // Guardar evento
  const handleSaveEvent = useCallback(
    async (newEventData) => {
      try {
        const transformedData = transformFormDataForBackend(newEventData);

        if (isNew) {
          await onCreateEvent(transformedData);
        } else {
          await onUpdateEvent(transformedData.id, transformedData);
        }

        setIsModalOpen(false);
      } catch (error) {
        // El error ya se muestra en el hook
      }
    },
    [isNew, onCreateEvent, onUpdateEvent]
  );

  // Cerrar todos los modales
  const closeAllModals = useCallback(() => {
    setActionModal({ isOpen: false, position: null, event: null });
    setRegistrationModal({ isOpen: false, position: null, event: null });
    setInscriptionModal({
      isOpen: false,
      eventName: "",
      participantType: "",
      action: "register",
      eventId: null,
    });
    setRegistrationFormModal({
      isOpen: false,
      eventName: "",
      participantType: "",
      eventType: "",
      eventId: null,
      mode: "register",
    });
    setDayEventsModal({ isOpen: false, date: null, events: [] });
  }, []);

  // Manejar creación de evento desde el botón del calendario
  const handleCreate = useCallback(() => {
    if (!hasPermission("eventsManagement", "Crear")) {
      showErrorAlert("Sin permisos", "No tienes permisos para crear eventos");
      return;
    }

    setSelectedEvent(null);
    setIsNew(true);
    setModalMode("create");
    setIsModalOpen(true);
  }, [hasPermission]);

  return (
    <>
      <BaseCalendar
        // Core props
        variant="big-calendar"
        events={transformedEvents}
        loading={false}
        // Event handlers
        onEventClick={handleEventClick}
        onDateSelect={handleDateSelect}
        onSlotSelect={handleSlotSelect}
        onCreate={handleCreate}
        // Customization
        renderEvent={renderEvent}
        calendarProps={{
          culture: "es",
          messages: {
            month: "Mes",
            week: "Semana",
            day: "Día",
            today: "Hoy",
            previous: "Atrás",
            next: "Siguiente",
            noEventsInRange: "No hay eventos en este rango.",
            showMore: (total) => `${total} eventos más`,
          },
        }}
        // UI Configuration
        title=""
        showHeader={false}
        showCreateButton={false} // Se maneja desde el componente padre
        showReportButton={false} // Se maneja desde el componente padre
        showSearch={false} // Se maneja desde el componente padre
        showFilters={false} // Se maneja desde el componente padre
        showSidebar={false}
        showViewToggle={true}
        // External search and filters
        searchTerm={searchTerm}
        selectedFilters={selectedFilters}
        onFiltersChange={onFiltersChange}
        // Filters and search configuration
        filters={calendarFilters}
        searchFields={getSearchFields()}
        customFilterFunction={applyDashboardFilters}
        // View configuration
        viewTypes={["month", "week", "day"]}
        defaultView="month"
        colorScheme="default"
      />

      {/* Modales del dashboard */}
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
            eventStatus={
              actionModal.event?.estadoOriginal || actionModal.event?.estado
            }
            event={actionModal.event}
          />
        )}
      </AnimatePresence>

      {/* Modal de opciones de inscripción */}
      <AnimatePresence>
        {registrationModal.isOpen && (
          <EventRegistrationOptionsModal
            isOpen={registrationModal.isOpen}
            onClose={closeAllModals}
            onAction={handleRegistrationAction}
            position={registrationModal.position}
            eventType={registrationModal.event?.tipo}
            hasRegistrations={
              registrationModal.event?.hasRegistrations || false
            }
            eventStatus={
              registrationModal.event?.estadoOriginal ||
              registrationModal.event?.estado ||
              ""
            }
          />
        )}
      </AnimatePresence>

      {/* Modal de inscripción de participantes */}
      <AnimatePresence>
        {inscriptionModal.isOpen &&
          inscriptionModal.action === "viewRegistrations" && (
            <ViewRegistrationsModal
              isOpen={inscriptionModal.isOpen}
              onClose={closeAllModals}
              eventName={inscriptionModal.eventName}
              participantType={inscriptionModal.participantType}
              eventId={inscriptionModal.eventId}
            />
          )}
      </AnimatePresence>

      {/* Modal de inscripción con formulario */}
      <AnimatePresence>
        {registrationFormModal.isOpen && (
          <TeamRegistrationFormModal
            isOpen={registrationFormModal.isOpen}
            onClose={closeAllModals}
            eventName={registrationFormModal.eventName}
            participantType={registrationFormModal.participantType}
            eventType={registrationFormModal.eventType}
            eventId={registrationFormModal.eventId}
            mode={registrationFormModal.mode}
            onSuccess={() => {
              if (onRefresh) onRefresh();
            }}
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
    </>
  );
});

export default EventsCalendar;
