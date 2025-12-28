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
        await updateEvent(eventData.id, eventData);
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
        { value: "Programado", label: "Programado" },
        { value: "En-curso", label: "En Curso" },
        { value: "Finalizado", label: "Finalizado" },
        { value: "Cancelado", label: "Cancelado" },
        { value: "En-pausa", label: "En Pausa" },
      ],
    },
    {
      id: "type",
      label: "Tipo",
      field: "tipo",
      options:
        referenceData.types?.map((type) => ({
          value: type.nombre,
          label: type.nombre,
        })) || [],
    },
    {
      id: "category",
      label: "Categoría",
      field: "categoria",
      options:
        referenceData.categories?.map((category) => ({
          value: category.nombre,
          label: category.nombre,
        })) || [],
    },
  ];

  return (
    <div className="font-monserrat">
      {/* Header con controles genéricos */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Eventos</h1>
          <p className="text-gray-600 text-sm mt-1">
            Gestiona y programa eventos deportivos
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Buscador genérico */}
          <div className="flex-1 sm:flex-initial">
            <SearchInput
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full sm:w-64"
            />
          </div>

          {/* Botón de filtros */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters
                ? "bg-purple-50 border-purple-200 text-purple-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtros
          </motion.button>

          {/* Botón de crear evento */}
          {canCreateEvents && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateFromCalendar}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Crear
            </motion.button>
          )}

          {/* Generador de reportes genérico */}
          {canExportEvents && (
            <CalendarReportGenerator
              data={events}
              entityName="eventos"
              onGenerateReport={handleGenerateReport}
              customFields={[
                { key: "tipo", label: "Tipo de Evento" },
                { key: "categoria", label: "Categoría" },
                { key: "ubicacion", label: "Ubicación" },
                { key: "telefono", label: "Teléfono" },
                { key: "estado", label: "Estado" },
                { key: "publicar", label: "Publicado" },
              ]}
              reportTypes={["pdf", "excel"]}
              showDateFilter={true}
              buttonProps={{
                variant: "outline",
                size: "sm",
                className: "border-gray-200 text-gray-700 hover:bg-gray-50",
              }}
            />
          )}
        </div>
      </div>

      {/* Panel de filtros */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filters.map((filter) => (
                  <div key={filter.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendario de eventos */}
      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <EventsCalendar
            ref={calendarRef}
            events={events}
            referenceData={referenceData}
            onCreateEvent={handleCreateFromCalendar}
            onUpdateEvent={updateEvent}
            onDeleteEvent={deleteEvent}
            onRefresh={loadEvents}
            searchTerm={searchTerm}
            selectedFilters={selectedFilters}
            onFiltersChange={handleFiltersChange}
          />
        )}
      </div>

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
