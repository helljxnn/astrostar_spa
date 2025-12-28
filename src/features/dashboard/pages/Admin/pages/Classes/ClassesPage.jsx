import React, { useState } from "react";
import { Plus, FileText, Filter, Search } from "lucide-react";
import { motion } from "framer-motion";
import ClassesCalendar from "./components/ClassesCalendar";
import ClassFormModal from "./components/ClassFormModal";
import { CalendarReportGenerator } from "../../../../../../shared/components/Calendar";
import SearchInput from "../../../../../../shared/components/SearchInput";
import { usePermissions } from "../../../../../../shared/hooks/usePermissions";
import useClassesCalendar from "./hooks/useClassesCalendar";

const ClassesPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { hasPermission } = usePermissions();
  const { calendarClasses } = useClassesCalendar();

  // Permisos
  const canCreateClasses = hasPermission("classes", "create") || true; // Temporalmente siempre true
  const canExportClasses = hasPermission("classes", "export") || true; // Temporalmente siempre true

  /**
   * Manejar creación exitosa de clase
   */
  const handleClassCreated = () => {
    setShowCreateModal(false);
    // Trigger refresh para que el calendario se actualice
    setRefreshTrigger((prev) => prev + 1);
  };

  /**
   * Manejar apertura del modal de creación desde el calendario
   */
  const handleCreateFromCalendar = () => {
    setShowCreateModal(true);
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

  // Configuración de filtros
  const filters = [
    {
      id: "status",
      label: "Estado",
      field: "status",
      options: [
        { value: "Programada", label: "Programada" },
        { value: "En_curso", label: "En Curso" },
        { value: "Finalizada", label: "Finalizada" },
        { value: "Cancelada", label: "Cancelada" },
      ],
    },
    {
      id: "employee",
      label: "Profesor",
      field: "professorName",
      options: [
        { value: "Ana García", label: "Ana García" },
        { value: "Carlos Rodríguez", label: "Carlos Rodríguez" },
        { value: "María López", label: "María López" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Título */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clases</h1>
        </div>

        {/* Controles */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Buscador */}
          <div className="w-full sm:w-auto">
            <SearchInput
              placeholder="Buscar clases..."
              value={searchTerm}
              onChange={handleSearch}
              className="min-w-[200px]"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            {/* Botón crear clase */}
            {canCreateClasses && (
              <motion.button
                onClick={() => setShowCreateModal(true)}
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

            {/* Botón de reportes */}
            {canExportClasses && (
              <CalendarReportGenerator
                events={calendarClasses}
                title="Reportes"
                entityName="clases"
                reportTypes={["pdf", "excel"]}
                showDateFilter={true}
                customFields={[
                  { key: "extendedProps.professorName", label: "Profesor" },
                  { key: "extendedProps.totalAthletes", label: "Deportistas" },
                  { key: "location", label: "Ubicación" },
                  { key: "status", label: "Estado" },
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
                  value={selectedFilters[filter.id] || ""}
                  onChange={(e) =>
                    handleFiltersChange({
                      ...selectedFilters,
                      [filter.id]: e.target.value,
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

      {/* Calendario de Clases */}
      <ClassesCalendar
        key={refreshTrigger} // Force re-render when refreshTrigger changes
        onCreateClass={handleCreateFromCalendar}
        searchTerm={searchTerm}
        selectedFilters={selectedFilters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Modal de crear/editar clase */}
      {showCreateModal && (
        <ClassFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleClassCreated}
        />
      )}
    </div>
  );
};

export default ClassesPage;
