import { useState, useMemo, useRef } from "react";
import { EventModal } from "./components/EventModal";
import { FaPlus } from "react-icons/fa";
import EventsCalendar from "./components/EventsCalendar";
import EventReportGenerator from "./components/EventReportGenerator";
import EventSearchBar from "./components/EventSearchBar";
import EventSearchList from "./components/EventSearchList";
import EventInscriptionModal from "./components/EventInscriptionModal";
import EventRegistrationFormModal from "./components/EventRegistrationFormModal";
import { showDeleteAlert, showErrorAlert } from "../../../../../../../shared/utils/alerts";
import { useEvents } from "./hooks/useEvents";

// Importaciones para permisos
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";

const Event = () => {
  const { hasPermission } = usePermissions();
  const { events, loading, referenceData, createEvent, updateEvent, deleteEvent } = useEvents();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [isNew, setIsNew] = useState(false);
  
  const [searchFilters, setSearchFilters] = useState({ searchTerm: "", status: "" });
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  // Ref para controlar el calendario
  const calendarRef = useRef(null);

  // Estados para modales de inscripción
  const [inscriptionModal, setInscriptionModal] = useState({ 
    isOpen: false, 
    eventName: "", 
    participantType: "", 
    action: "register" 
  });
  const [registrationFormModal, setRegistrationFormModal] = useState({
    isOpen: false,
    eventName: "",
    participantType: "",
    eventType: "",
  });

  const handleSave = async (eventData) => {
    try {
      if (isNew) {
        await createEvent(eventData);
      } else {
        await updateEvent(eventData.id, eventData);
      }
    } catch (error) {
      // Error guardando evento
    }
  };

  // Filtrado mejorado por nombre y estado
  const filteredData = useMemo(() => {
    let result = events;

    // Filtrar por nombre
    if (searchFilters.searchTerm) {
      result = result.filter((event) => {
        const nombre = event.title || event.nombre || "";
        return nombre.toLowerCase().includes(searchFilters.searchTerm.toLowerCase());
      });
    }

    // Filtrar por estado
    if (searchFilters.status) {
      result = result.filter((event) => {
        const estado = event.estadoOriginal || event.estado || "";
        return estado === searchFilters.status;
      });
    }

    return result;
  }, [events, searchFilters]);

  // Manejar la búsqueda
  const handleSearch = (filters) => {
    setSearchFilters(filters);
    setIsSearchActive(!!(filters.searchTerm || filters.status));
  };



  // Manejar acciones CRUD (igual que en EventsCalendar)
  const handleCrudAction = async (action, event) => {
    
    // Verificar permisos antes de ejecutar acciones
    if (action === 'edit' && !hasPermission('eventsManagement', 'Editar')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para editar eventos');
      return;
    }
    
    if (action === 'delete' && !hasPermission('eventsManagement', 'Eliminar')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para eliminar eventos');
      return;
    }
    
    if (action === 'view' && !hasPermission('eventsManagement', 'Ver')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para ver eventos');
      return;
    }
    
    // Función para formatear tiempo
    const formatTime = (date) => {
      return date.toTimeString().slice(0, 5); // HH:MM
    };
    
    // Función helper para formatear fechas sin problemas de zona horaria
    const formatDateLocal = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    switch (action) {
      case "edit":
        // Verificar si el evento está finalizado
        const estadoEvento = event.estadoOriginal || event.estado || "";
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Obtener la fecha de fin del evento
        const eventEndDate = event.end ? new Date(event.end) : new Date(event.start);
        const endDateOnly = new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate());
        
        // Verificar si el evento ya finalizó (pasó su fecha)
        const hasPassed = endDateOnly < today;
        
        // No permitir editar si está finalizado
        if (estadoEvento === "Finalizado" || estadoEvento === "finalizado") {
          showErrorAlert(
            'Evento Finalizado', 
            'No se puede editar un evento que ya finalizó. Solo puedes verlo o eliminarlo.'
          );
          return;
        }
        
        // No permitir editar si está cancelado Y ya pasó su fecha
        if ((estadoEvento === "Cancelado" || estadoEvento === "cancelado") && hasPassed) {
          showErrorAlert(
            'Evento Cancelado y Finalizado', 
            'No se puede editar un evento cancelado cuya fecha ya pasó. Solo puedes verlo o eliminarlo.'
          );
          return;
        }

        // Formatear fechas y horas correctamente
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);
        
        setSelectedEvent({
          nombre: event.title || event.nombre,
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
        break;
        
      case "delete":
        try {
          const result = await showDeleteAlert(
            "¿Eliminar evento?",
            `Se eliminará permanentemente el evento: ${event.title || event.nombre}`
          );
          
          if (result.isConfirmed) {
            await deleteEvent(event.id, event.title || event.nombre);
          }
        } catch (error) {
          // Error al eliminar evento
        }
        break;
        
      case "view":
        // Formatear fechas y horas correctamente
        const viewStartDate = new Date(event.start);
        const viewEndDate = new Date(event.end);
        
        setSelectedEvent({
          nombre: event.title || event.nombre,
          tipo: event.tipo,
          descripcion: event.descripcion || "",
          fechaInicio: formatDateLocal(viewStartDate),
          fechaFin: formatDateLocal(viewEndDate),
          horaInicio: formatTime(viewStartDate),
          horaFin: formatTime(viewEndDate),
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
        break;
    }
  };

  // Manejar acciones de inscripción (igual que en EventsCalendar)
  const handleRegistrationAction = (action, participantType, event) => {
    
    if (action === "register") {
      // Usar el modal de inscripción con formulario
      setRegistrationFormModal({
        isOpen: true,
        eventName: event.title || event.nombre,
        participantType: participantType,
        eventType: event.tipo,
      });
    } else {
      // Usar el modal anterior para editar y ver
      setInscriptionModal({
        isOpen: true,
        eventName: event.title || event.nombre,
        participantType: participantType,
        action: action,
      });
    }
  };



  // Cerrar modales
  const closeAllModals = () => {
    setInscriptionModal({ isOpen: false, eventName: "", participantType: "", action: "register" });
    setRegistrationFormModal({ isOpen: false, eventName: "", participantType: "", eventType: "" });
  };

  // Columnas para el reporte 
  const reportColumns = [
    { key: "tipo", label: "Tipo de Evento" },
    { key: "nombre", label: "Nombre" },
    { key: "descripcion", label: "Descripción" },
    { key: "fechaInicio", label: "Fecha Inicio" },
    { key: "fechaFin", label: "Fecha Fin" },
    { key: "ubicacion", label: "Ubicación" },
    { key: "telefono", label: "Teléfono" },
    { key: "imagen", label: "Imagen" },
    { key: "cronograma", label: "Cronograma" },
    { key: "patrocinador", label: "Patrocinadores" },
    { key: "categoria", label: "Categoría" },
    { key: "estado", label: "Estado" },
    { key: "publicar", label: "Publicado" },
  ];

  return (
    <div className="font-monserrat">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Eventos</h1>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Buscador personalizado */}
          <EventSearchBar onSearch={handleSearch} />
          
          {/* Botones */}
          <PermissionGuard module="eventsManagement" action="Crear">
            <button
              onClick={() => {
                setSelectedEvent(null);
                setIsNew(true);
                setModalMode("create");
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary-purple text-white rounded-lg shadow hover:opacity-90 transition text-sm whitespace-nowrap"
            >
              <FaPlus size={12} /> Crear
            </button>
          </PermissionGuard>
          
          {/* Componente de reporte */}
          <PermissionGuard module="eventsManagement" action="Ver">
            <EventReportGenerator 
              data={filteredData} 
              fileName="eventos" 
              columns={reportColumns}
              calendarRef={calendarRef}
            />
          </PermissionGuard>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <EventModal
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
            setModalMode("create");
          }}
          onSave={handleSave}
          isNew={isNew}
          event={selectedEvent}
          mode={modalMode}
          referenceData={referenceData}
        />
      )}

      {/* Contenido condicional: Calendario o Lista de búsqueda */}
      <div className="mt-16">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple"></div>
          </div>
        ) : isSearchActive ? (
          <EventSearchList 
            events={filteredData} 
            onCrudAction={handleCrudAction}
            onRegistrationAction={handleRegistrationAction}
          />
        ) : (
          <EventsCalendar 
            ref={calendarRef}
            events={filteredData} 
            referenceData={referenceData}
            onCreateEvent={createEvent}
            onUpdateEvent={updateEvent}
            onDeleteEvent={deleteEvent}
          />
        )}
      </div>

      {/* Modales de inscripción */}
      {inscriptionModal.isOpen && (
        <EventInscriptionModal
          isOpen={inscriptionModal.isOpen}
          onClose={closeAllModals}
          eventName={inscriptionModal.eventName}
          participantType={inscriptionModal.participantType}
          action={inscriptionModal.action}
        />
      )}

      {registrationFormModal.isOpen && (
        <EventRegistrationFormModal
          isOpen={registrationFormModal.isOpen}
          onClose={closeAllModals}
          eventName={registrationFormModal.eventName}
          participantType={registrationFormModal.participantType}
          eventType={registrationFormModal.eventType}
        />
      )}
    </div>
  );
};

export default Event;
