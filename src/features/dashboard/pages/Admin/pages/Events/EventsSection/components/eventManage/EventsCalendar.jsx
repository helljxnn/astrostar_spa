import {
  useState,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { AnimatePresence } from "framer-motion";
import { FaPlus } from "react-icons/fa";
import { Users, MapPin, Clock, Edit, Eye, Trash2 } from "lucide-react";
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
  ref,
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
  const handleEventClick = useCallback((event, jsEvent) => {
    // Si el click fue en un botón, no hacer nada
    if (
      jsEvent &&
      (jsEvent.target.tagName === "BUTTON" || jsEvent.target.closest("button"))
    ) {
      return;
    }
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

      // Validar que la fecha seleccionada sea al menos 1 semana de anticipación
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const oneWeekFromToday = new Date(today);
      oneWeekFromToday.setDate(oneWeekFromToday.getDate() + 7);

      // Determinar la fecha correcta - puede ser slotInfo.start o slotInfo directamente
      let dateToUse;
      if (slotInfo.start) {
        dateToUse = slotInfo.start;
      } else if (slotInfo instanceof Date) {
        dateToUse = slotInfo;
      } else {
        showErrorAlert(
          "Error de fecha",
          "No se pudo procesar la fecha seleccionada. Por favor, intenta seleccionar otra fecha.",
        );
        return;
      }

      const selectedDate = new Date(dateToUse);

      // Primero verificar si la fecha seleccionada es válida
      if (isNaN(selectedDate.getTime())) {
        showErrorAlert(
          "Error de fecha",
          "No se pudo procesar la fecha seleccionada. Por favor, intenta seleccionar otra fecha.",
        );
        return;
      }

      const selectedDateOnly = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
      );

      if (selectedDateOnly.getTime() < oneWeekFromToday.getTime()) {
        showErrorAlert(
          "Fecha no válida",
          "Los eventos deben crearse con al menos 1 semana de anticipación. Por favor, selecciona una fecha a partir del " +
            oneWeekFromToday.toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }) +
            ".",
        );
        return;
      }

      // Formatear fechas y horas
      const formatDateLocal = (date) => {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
          // Si la fecha no es válida, usar la fecha mínima permitida (1 semana desde hoy)
          const oneWeekFromToday = new Date();
          oneWeekFromToday.setDate(oneWeekFromToday.getDate() + 7);
          const year = oneWeekFromToday.getFullYear();
          const month = String(oneWeekFromToday.getMonth() + 1).padStart(
            2,
            "0",
          );
          const day = String(oneWeekFromToday.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const formatTime = (date) => {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
          // Si la fecha no es válida, usar hora por defecto
          return "09:00";
        }
        return date.toTimeString().slice(0, 5); // HH:MM
      };

      let startDate = dateToUse; // Ya es una fecha válida
      let endDate = dateToUse; // Para eventos de un día, usar la misma fecha por defecto

      // Si slotInfo tiene end y es válido, usarlo
      if (slotInfo.end && slotInfo.end instanceof Date) {
        const endDateCandidate = new Date(slotInfo.end);
        if (!isNaN(endDateCandidate.getTime())) {
          endDate = endDateCandidate;
        }
      }

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
    [hasPermission],
  );

  // Manejar selección de slot (para crear evento)
  const handleSlotSelect = useCallback(
    (slotInfo) => {
      handleDateSelect(slotInfo);
    },
    [handleDateSelect],
  );

  // Renderizar evento personalizado
  const renderEvent = useCallback((event, variant) => {
    if (!event) {
      return <div>Error: Evento inválido</div>;
    }

    // Para la variante custom, necesitamos manejar diferentes tipos de vista
    if (variant === "grid") {
      return (
        <DashboardEventComponent
          event={event}
          view="month" // Para grid siempre usamos month view
        />
      );
    } else if (variant === "day") {
      return <DashboardEventComponent event={event} view="day" />;
    }

    // Fallback para compatibilidad
    return <DashboardEventComponent event={event} view="month" />;
  }, []);

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
              "No tienes permisos para editar eventos",
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
            now.getDate(),
          );

          const eventEndDate = dashboardEvent.end
            ? new Date(dashboardEvent.end)
            : new Date(dashboardEvent.start);
          const endDateOnly = new Date(
            eventEndDate.getFullYear(),
            eventEndDate.getMonth(),
            eventEndDate.getDate(),
          );
          const hasPassed = endDateOnly < today;

          if (estadoEvento === "Finalizado" || estadoEvento === "finalizado") {
            showErrorAlert(
              "Evento Finalizado",
              "No se puede editar un evento que ya finalizó. Solo puedes verlo o eliminarlo.",
            );
            return;
          }

          if (
            (estadoEvento === "Cancelado" || estadoEvento === "cancelado") &&
            hasPassed
          ) {
            showErrorAlert(
              "Evento Cancelado y Finalizado",
              "No se puede editar un evento cancelado cuya fecha ya pasó. Solo puedes verlo o eliminarlo.",
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
              "No tienes permisos para eliminar eventos",
            );
            return;
          }

          try {
            const result = await showDeleteAlert(
              "¿Eliminar evento?",
              `Se eliminará permanentemente el evento: ${dashboardEvent.title}`,
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
              "No tienes permisos para ver eventos",
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
    [actionModal.event, hasPermission, onDeleteEvent],
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
            "No se pueden realizar inscripciones en un evento finalizado.",
          );
          return;
        }

        if (estadoEvento === "Cancelado" || estadoEvento === "cancelado") {
          showErrorAlert(
            "Evento Cancelado",
            "No se pueden realizar inscripciones en un evento cancelado.",
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
    [registrationModal.event],
  );

  // Guardar evento
  const handleSaveEvent = useCallback(
    async (newEventData) => {
      try {
        const transformedData = transformFormDataForBackend(newEventData);

        if (isNew) {
          await onCreateEvent(transformedData);
        } else {
          // Pasar las categorías originales para verificar cambios
          const originalCategoryIds = selectedEvent?.categoryIds || [];
          await onUpdateEvent(
            transformedData.id,
            transformedData,
            originalCategoryIds,
          );
        }

        // Cerrar modal solo si no hubo errores
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error al guardar evento:", error);
        // El modal permanece abierto para que el usuario pueda corregir o intentar de nuevo
        showErrorAlert(
          "Error al guardar",
          "No se pudo guardar el evento. Por favor, verifica los datos e intenta nuevamente.",
        );
      }
    },
    [isNew, onCreateEvent, onUpdateEvent, selectedEvent],
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

    // Validar que se pueda crear eventos con al menos 1 semana de anticipación
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekFromToday = new Date(today);
    oneWeekFromToday.setDate(oneWeekFromToday.getDate() + 7);

    showErrorAlert(
      "Restricción de fecha",
      "Los eventos deben crearse con al menos 1 semana de anticipación. Por favor, selecciona una fecha específica en el calendario a partir del " +
        oneWeekFromToday.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }) +
        " para crear un evento.",
    );
    return;
  }, [hasPermission]);

  /**
   * Manejar clic en un evento desde la sidebar
   */
  const handleSidebarEventClick = useCallback((eventItem) => {
    // Abrir modal de detalle del evento
    const dashboardEvent = eventItem.extendedProps?.dashboardEvent || eventItem;

    const formatTime = (date) => {
      return date.toTimeString().slice(0, 5); // HH:MM
    };

    const formatDateLocal = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

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
  }, []);

  /**
   * Manejar edición de evento desde la sidebar
   */
  const handleEditEvent = useCallback(
    (eventItem) => {
      const dashboardEvent =
        eventItem.extendedProps?.dashboardEvent || eventItem;

      // Verificar permisos
      if (!hasPermission("eventsManagement", "Editar")) {
        showErrorAlert(
          "Sin permisos",
          "No tienes permisos para editar eventos",
        );
        return;
      }

      // Verificar si el evento está finalizado
      const estadoEvento =
        dashboardEvent.estadoOriginal || dashboardEvent.estado || "";
      if (estadoEvento === "Finalizado" || estadoEvento === "finalizado") {
        showErrorAlert(
          "Evento Finalizado",
          "No se puede editar un evento que ya finalizó.",
        );
        return;
      }

      const formatTime = (date) => {
        return date.toTimeString().slice(0, 5); // HH:MM
      };

      const formatDateLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

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
    },
    [hasPermission],
  );

  /**
   * Manejar eliminación de evento desde la sidebar
   */
  const handleDeleteEvent = useCallback(
    async (eventItem) => {
      const dashboardEvent =
        eventItem.extendedProps?.dashboardEvent || eventItem;

      // Verificar permisos
      if (!hasPermission("eventsManagement", "Eliminar")) {
        showErrorAlert(
          "Sin permisos",
          "No tienes permisos para eliminar eventos",
        );
        return;
      }

      try {
        const result = await showDeleteAlert(
          "¿Eliminar evento?",
          `Se eliminará permanentemente el evento: ${dashboardEvent.title}`,
        );

        if (result.isConfirmed) {
          if (onDeleteEvent) {
            await onDeleteEvent(dashboardEvent.id, dashboardEvent.title);
          }
        }
      } catch (error) {
        // El error ya se maneja en el hook
      }
    },
    [hasPermission, onDeleteEvent],
  );

  /**
   * Renderizar evento personalizado para la barra lateral
   */
  const renderSidebarItem = useCallback((event, actions) => {
    // Separar acciones de gestión y de inscripción
    const managementActions = actions.filter(
      (action) => action.group === "management",
    );
    const registrationActions = actions.filter(
      (action) => action.group === "registration",
    );

    return (
      <div className="space-y-2">
        <div>
          <h4 className="font-medium text-gray-800 text-sm mb-1">
            {event.title}
          </h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {event.extendedProps?.horaInicio} - {event.extendedProps?.horaFin}
            </div>
            {event.extendedProps?.ubicacion && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {event.extendedProps.ubicacion}
              </div>
            )}
            {event.extendedProps?.tipo && (
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium">Tipo:</span>
                {event.extendedProps.tipo}
              </div>
            )}
            {event.extendedProps?.categoria && (
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium">Categoría:</span>
                {event.extendedProps.categoria}
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium">Estado:</span>
              <span
                className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  event.extendedProps?.estado === "programado"
                    ? "bg-blue-100 text-blue-800"
                    : event.extendedProps?.estado === "en-curso"
                      ? "bg-green-100 text-green-800"
                      : event.extendedProps?.estado === "finalizado"
                        ? "bg-gray-100 text-gray-800"
                        : event.extendedProps?.estado === "cancelado"
                          ? "bg-red-100 text-red-800"
                          : "bg-purple-100 text-purple-800"
                }`}
              >
                {event.extendedProps?.estado || "Programado"}
              </span>
            </div>
          </div>
        </div>

        {/* Botones de gestión (Ver, Editar, Eliminar) */}
        {managementActions.length > 0 && (
          <div className="flex gap-1 flex-wrap pt-2 border-t border-gray-100">
            {managementActions.map((action, actionIndex) => (
              <button
                key={actionIndex}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick(event);
                }}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                  action.variant === "danger"
                    ? "text-red-600 hover:bg-red-50"
                    : action.variant === "edit"
                      ? "text-orange-600 hover:bg-orange-50"
                      : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                {action.icon && <action.icon className="h-3 w-3" />}
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Botones de inscripción (Inscribir, Ver Inscritos) */}
        {registrationActions.length > 0 && (
          <div className="flex gap-1 flex-wrap pt-2 border-t border-gray-100">
            {registrationActions.map((action, actionIndex) => (
              <button
                key={actionIndex}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick(event);
                }}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                  action.variant === "success"
                    ? "text-green-600 hover:bg-green-50"
                    : action.variant === "info"
                      ? "text-purple-600 hover:bg-purple-50"
                      : "text-[#B595FF] hover:bg-[#9BE9FF] hover:text-white"
                }`}
              >
                {action.icon && <action.icon className="h-3 w-3" />}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }, []);

  // Configuración de acciones de la barra lateral
  const sidebarActions = useMemo(
    () => [
      {
        label: "Ver",
        icon: Eye,
        onClick: handleSidebarEventClick,
        permission: { module: "events", action: "read" },
        variant: "primary",
        group: "management",
      },
      ...(hasPermission("eventsManagement", "Editar")
        ? [
            {
              label: "Editar",
              icon: Edit,
              onClick: handleEditEvent,
              permission: { module: "events", action: "edit" },
              variant: "edit",
              group: "management",
            },
          ]
        : []),
      ...(hasPermission("eventsManagement", "Eliminar")
        ? [
            {
              label: "Eliminar",
              icon: Trash2,
              onClick: handleDeleteEvent,
              permission: { module: "events", action: "delete" },
              variant: "danger",
              group: "management",
            },
          ]
        : []),
      {
        label: "Inscribir",
        icon: Users,
        onClick: (event) => {
          const dashboardEvent = event.extendedProps?.dashboardEvent || event;

          // Determinar el tipo de participante según el tipo de evento
          const getParticipantType = () => {
            switch (dashboardEvent.tipo) {
              case "Festival":
              case "Torneo":
                return "Equipos";
              case "Clausura":
              case "Taller":
                return "Deportistas";
              default:
                return "Deportistas";
            }
          };

          const participantType = getParticipantType();

          // Abrir directamente el modal de inscripción
          setRegistrationFormModal({
            isOpen: true,
            eventName: dashboardEvent.title,
            participantType: participantType,
            eventType: dashboardEvent.tipo,
            eventId: dashboardEvent.id,
            mode: "register",
          });
        },
        permission: { module: "events", action: "register" },
        variant: "success",
        group: "registration",
      },
      {
        label: "Ver Inscritos",
        icon: Users,
        onClick: (event) => {
          const dashboardEvent = event.extendedProps?.dashboardEvent || event;

          // Determinar el tipo de participante según el tipo de evento
          const getParticipantType = () => {
            switch (dashboardEvent.tipo) {
              case "Festival":
              case "Torneo":
                return "Equipos";
              case "Clausura":
              case "Taller":
                return "Deportistas";
              default:
                return "Deportistas";
            }
          };

          const participantType = getParticipantType();

          // Abrir modal para ver inscritos
          setInscriptionModal({
            isOpen: true,
            eventName: dashboardEvent.title,
            participantType: participantType, // ✅ Usar el tipo correcto según el evento
            action: "viewRegistrations",
            eventId: dashboardEvent.id,
          });
        },
        permission: { module: "events", action: "read" },
        variant: "info",
        group: "registration",
      },
    ],
    [
      hasPermission,
      handleSidebarEventClick,
      handleEditEvent,
      handleDeleteEvent,
    ],
  );

  return (
    <>
      <BaseCalendar
        // Core props
        variant="custom" // Cambiar a custom para que sea igual que clases
        events={transformedEvents}
        loading={false}
        // Event handlers
        onEventClick={handleEventClick}
        onDateSelect={handleDateSelect}
        onSlotSelect={handleSlotSelect}
        onCreate={handleCreate}
        // Customization
        renderEvent={renderEvent}
        renderSidebarItem={renderSidebarItem}
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
        showSidebar={true} // Habilitar sidebar como en clases
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
        // Sidebar config
        sidebarTitle="Eventos Programados"
        sidebarEmptyText="No hay eventos programados"
        sidebarActions={sidebarActions}
        sidebarHeight="h-auto" // Altura automática para coincidir con el calendario
        sidebarItemMinHeight="min-h-[120px]" // Altura mínima de cada evento
        sidebarItemPadding="p-3" // Padding de cada evento
        sidebarMaxItems={null} // Sin límite de eventos
        // Styling
        colorScheme="custom" // Usar colores personalizados definidos en cada evento
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
          />
        )}
      </AnimatePresence>
    </>
  );
});

export default EventsCalendar;
