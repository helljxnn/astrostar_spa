import { useState, useMemo, useRef } from "react";
import { EventModal } from "./components/EventModal";
import { FaPlus } from "react-icons/fa";
import EventsCalendar from "./components/EventsCalendar";
import EventReportGenerator from "./components/EventReportGenerator";
import EventSearchBar from "./components/EventSearchBar";
import EventSearchList from "./components/EventSearchList";
import EventInscriptionModal from "./components/EventInscriptionModal";
import EventRegistrationFormModal from "./components/EventRegistrationFormModal";
import { sampleEvents } from "./components/sampleEvents";
import { showDeleteAlert, showSuccessAlert, showErrorAlert } from "../../../../../../../shared/utils/alerts";

const Event = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [isNew, setIsNew] = useState(false);
  const calendarRef = useRef(null);
  
  const [data, setData] = useState(() => {
    const transformedEvents = sampleEvents.map(event => ({
      ...event,
      start: new Date(event.fechaInicio),
      end: new Date(event.fechaFin),
      title: event.nombre
    }));
    console.log("EventsDashboard - Eventos transformados:", transformedEvents);
    return transformedEvents;
  }); // Usando los datos de ejemplo con formato para el calendario
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

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

  const handleSave = (newEvent) => {
    setData((prev) => [...prev, newEvent]);
  };

  // Filtrado general por búsqueda
  const filteredData = useMemo(() => {
    const result = !searchTerm ? data : data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    console.log("EventsDashboard - Datos filtrados:", result);
    console.log("EventsDashboard - SearchTerm:", searchTerm);
    return result;
  }, [data, searchTerm]);

  // Manejar la búsqueda
  const handleSearch = (term) => {
    setSearchTerm(term);
    setIsSearchActive(!!term);
  };



  // Manejar acciones CRUD (igual que en EventsCalendar)
  const handleCrudAction = async (action, event) => {
    console.log("Acción CRUD:", action, event);
    console.log("Categoría del evento:", event.categoria);
    
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
        // Formatear fechas y horas correctamente
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);
        
        setSelectedEvent({
          nombre: event.title || event.nombre,
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
            setData((prev) => prev.filter((e) => e.id !== event.id));
            showSuccessAlert(
              "Evento eliminado",
              `${event.title || event.nombre} ha sido eliminado correctamente.`
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
    console.log("Acción de inscripción:", action, participantType, event);
    
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
          
          {/* Componente de reporte */}
          <EventReportGenerator 
            data={filteredData} 
            fileName="eventos" 
            columns={reportColumns}
          />
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
        />
      )}

      {/* Contenido condicional: Calendario o Lista de búsqueda */}
      <div className="mt-16">
        {isSearchActive ? (
          <EventSearchList 
            events={filteredData} 
            onCrudAction={handleCrudAction}
            onRegistrationAction={handleRegistrationAction}
          />
        ) : (
          <EventsCalendar events={filteredData} ref={calendarRef} />
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
