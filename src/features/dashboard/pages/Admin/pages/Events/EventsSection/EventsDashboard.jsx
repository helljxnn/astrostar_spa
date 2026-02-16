import { useState, useRef } from "react";
import { Plus, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EventModal } from "./components/eventManage/EventModal";
import EventsCalendar from "./components/eventManage/EventsCalendar";
import { TeamRegistrationFormModal } from "./components/registration";
import ViewRegistrationsModal from "./components/registration/ViewRegistrationsModal";
import { CalendarReportGenerator } from "../../../../../../../shared/components/Calendar";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import {
  showDeleteAlert,
  showErrorAlert,
} from "../../../../../../../shared/utils/alerts";
import { useEvents } from "./hooks/useEvents";

// Importaciones para permisos
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";

const Event = () => {
  const { hasPermission } = usePermissions();
  const {
    events,
    loading,
    referenceData,
    createEvent,
    updateEvent,
    deleteEvent,
    loadEvents,
  } = useEvents();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [isNew, setIsNew] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Ref para controlar el calendario
  const calendarRef = useRef(null);

  // Estados para modales de inscripción
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
    mode: "register",
    eventId: null,
  });

  // Permisos
  const canCreateEvents = hasPermission("events", "create") || true; // Temporalmente siempre true
  const canExportEvents = hasPermission("events", "export") || true; // Temporalmente siempre true

  /**
   * Manejar creación exitosa de evento
   */
  const handleEventCreated = () => {
    setIsModalOpen(false);
    // Trigger refresh para que el calendario se actualice
    setRefreshTrigger((prev) => prev + 1);
  };

  /**
   * Manejar apertura del modal de creación desde el calendario
   */
  const handleCreateFromCalendar = () => {
    setSelectedEvent(null);
    setModalMode("create");
    setIsNew(true);
    setIsModalOpen(true);
  };

  /**
   * Manejar búsqueda
   */
  const handleSearch = (event) => {
    const term = event.target ? event.target.value : event;
    setSearchTerm(term);
  };

  /**
   * Manejar cambios en filtros
   */
  const handleFiltersChange = (newFilters) => {
    setSelectedFilters(newFilters);
  };

  /**
   * Manejar generación de reportes
   */
  const handleGenerateReport = (reportData) => {
    console.log("Generar reporte de eventos:", reportData);
    // Aquí se implementaría la lógica de generación de reportes
  };

  /**
   * Manejar guardado de evento
   */
  const handleSave = async (eventData) => {
    try {
      if (isNew) {
        await createEvent(eventData);
      } else {
        // Pasar las categorías originales para verificar cambios
        const originalCategoryIds = selectedEvent?.categoryIds || [];
        await updateEvent(eventData.id, eventData, originalCategoryIds);
      }
      setIsModalOpen(false);
      // Trigger refresh para que el calendario se actualice
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      // Error guardando evento
    }
  };

  // Cerrar modales de inscripción
  const closeAllModals = () => {
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
      mode: "register",
      eventId: null,
    });
  };

  // Configuración de filtros
  const filters = [
    {
      id: "status",
      label: "Estado",
      field: "status",
      options: [
        { value: "programado", label: "Programado" },
        { value: "en-curso", label: "En Curso" },
        { value: "finalizado", label: "Finalizado" },
        { value: "cancelado", label: "Cancelado" },
      ],
    },
    {
      id: "type",
      label: "Tipo",
      field: "type",
      options:
        referenceData.types?.map((type) => ({
          value: type.name,
          label: type.name,
        })) || [],
    },
    {
      id: "category",
      label: "Categoría",
      field: "category",
      options:
        referenceData.eventCategories?.map((category) => ({
          value: category.name,
          label: category.name,
        })) || [],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header con controles genéricos */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Eventos</h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Buscador genérico */}
          <div className="w-full sm:w-auto">
            <SearchInput
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={handleSearch}
              className="min-w-[200px]"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            {/* Botón crear evento */}
            {canCreateEvents && (
              <motion.button
                onClick={handleCreateFromCalendar}
                className="flex items-center gap-2 px-4 py-2 bg-[#B595FF] text-white rounded-lg font-medium hover:bg-[#9BE9FF] transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-4 w-4" />
                <span>Crear</span>
              </motion.button>
            )}

            {/* Botón de filtros */}
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg font-medium hover:border-[#B595FF] transition-all duration-300 ${
                showFilters
                  ? "bg-[#B595FF] text-white border-[#B595FF]"
                  : "text-gray-700 hover:text-[#B595FF]"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros</span>
            </motion.button>

            {/* Generador de reportes genérico */}
            {canExportEvents && (
              <CalendarReportGenerator
                data={events}
                title="Reportes"
                entityName="eventos"
                reportTypes={["pdf", "excel"]}
                showDateFilter={true}
                customFields={[
                  { key: "tipo", label: "Tipo de Evento" },
                  { key: "categoria", label: "Categoría" },
                  { key: "ubicacion", label: "Ubicación" },
                  { key: "telefono", label: "Teléfono" },
                  { key: "estado", label: "Estado" },
                  { key: "publicar", label: "Publicado" },
                ]}
                // No usar onGenerateReport personalizado, dejar que use el servicio por defecto
              />
            )}
          </div>
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {filter.label}
                </label>
                <select
                  value={selectedFilters[filter.field] || ""}
                  onChange={(e) =>
                    handleFiltersChange({
                      ...selectedFilters,
                      [filter.field]: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B595FF] focus:border-transparent"
                >
                  <option value="">Todos</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Calendario de Eventos */}
      <EventsCalendar
        key={refreshTrigger} // Force re-render when refreshTrigger changes
        ref={calendarRef}
        events={events}
        referenceData={referenceData}
        onCreateEvent={createEvent}
        onUpdateEvent={updateEvent}
        onDeleteEvent={deleteEvent}
        onRefresh={loadEvents}
        searchTerm={searchTerm}
        selectedFilters={selectedFilters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Modal de evento */}
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

      {/* Modales de inscripción */}
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

      {registrationFormModal.isOpen && (
        <TeamRegistrationFormModal
          isOpen={registrationFormModal.isOpen}
          onClose={closeAllModals}
          eventName={registrationFormModal.eventName}
          participantType={registrationFormModal.participantType}
          eventType={registrationFormModal.eventType}
          mode={registrationFormModal.mode}
          eventId={registrationFormModal.eventId}
          onSuccess={loadEvents}
        />
      )}
    </div>
  );
};

export default Event;
