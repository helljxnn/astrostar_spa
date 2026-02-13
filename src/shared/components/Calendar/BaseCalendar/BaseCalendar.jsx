import React, { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaFilter,
  FaCalendarAlt,
  FaTimes,
  FaList,
} from "react-icons/fa";
import CalendarHeader from "./CalendarHeader";
import CalendarControls from "./CalendarControls";
import CalendarReportGenerator from "./CalendarReportGenerator";
import BigCalendarWrapper from "../Variants/BigCalendarWrapper";
import CustomCalendarGrid from "../Variants/CustomCalendarGrid";
import SearchInput from "../../SearchInput";
import PermissionGuard from "../../PermissionGuard";
import { useCalendarBase } from "./hooks/useCalendarBase";
import { useCalendarNavigation } from "./hooks/useCalendarNavigation";

const BaseCalendar = ({
  // Core props
  variant = "custom", // 'big-calendar' | 'custom'
  events = [],
  loading = false,

  // Event handlers
  onEventClick,
  onDateSelect,
  onSlotSelect,
  onEventActionClick,
  onCreate,
  onEdit,
  onDelete,

  // Customization
  renderEvent,
  renderSidebarItem,
  calendarProps = {},

  // UI Configuration
  title = "Calendario",
  showHeader = true,
  showCreateButton = true,
  showReportButton = true,
  showSearch = true,
  showFilters = true,
  showSidebar = true,
  showViewToggle = true,

  // Create button config
  createButtonText = "Crear",
  createButtonIcon = FaPlus,
  createPermission = null,

  // Report button config
  reportButtonText = "Reportes",
  onGenerateReport,
  reportPermission = null,
  reportEntityName = "eventos", // Nombre de la entidad para reportes
  reportCustomFields = [], // Campos personalizados para reportes
  reportTypes = ["pdf", "excel"], // Tipos de reporte disponibles
  showReportDateFilter = true, // Mostrar filtro de fechas en reportes

  // Search config
  searchPlaceholder = "Buscar...",
  searchFields = ["title", "description"],
  searchTerm: externalSearchTerm,

  // Filter config
  filters = [], // [{ id, label, options: [{ value, label }] }]
  selectedFilters = {},
  onFiltersChange,

  // View config
  viewTypes = ["month", "week", "day"],
  defaultView = "month",

  // Sidebar config
  sidebarTitle = "Actividades Programadas",
  sidebarEmptyText = "No hay actividades programadas",
  sidebarActions = [], // [{ label, icon, onClick, permission, variant }]
  sidebarHeight = "h-[500px]", // Altura de la sidebar
  sidebarItemMinHeight = "min-h-[150px]", // Altura mínima de cada item
  sidebarItemPadding = "p-4", // Padding de cada item
  sidebarMaxItems = null, // Límite de items (null = sin límite)

  // Styling
  colorScheme = "default",
  className = "",

  // Permissions
  viewPermission = null,

  ...props
}) => {
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm || "");
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [currentView, setCurrentView] = useState(defaultView);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAllEvents, setShowAllEvents] = useState(false); // Estado para controlar vista de eventos

  // Sincronizar searchTerm externo
  useEffect(() => {
    if (externalSearchTerm !== undefined) {
      setSearchTerm(externalSearchTerm);
    }
  }, [externalSearchTerm]);

  const { filteredEvents } = useCalendarBase({
    events: events || [],
    searchTerm: searchTerm || "",
    searchFields: searchFields || ["title"],
    selectedFilters: selectedFilters || {},
    filters: filters || [],
  });

  // Filtrar eventos del día seleccionado para el sidebar
  const sidebarEvents = useMemo(() => {
    if (showAllEvents) {
      return filteredEvents;
    }

    // Filtrar eventos del día seleccionado
    return filteredEvents.filter((event) => {
      const eventDate = event.start || event.date;
      if (!eventDate) return false;

      const eventDateObj =
        typeof eventDate === "string" ? new Date(eventDate) : eventDate;
      const selectedDateObj = new Date(selectedDate);

      return (
        eventDateObj.getDate() === selectedDateObj.getDate() &&
        eventDateObj.getMonth() === selectedDateObj.getMonth() &&
        eventDateObj.getFullYear() === selectedDateObj.getFullYear()
      );
    });
  }, [filteredEvents, selectedDate, showAllEvents]);

  const { goToPrevious, goToNext, goToToday, getCalendarTitle } =
    useCalendarNavigation({
      selectedDate,
      currentView,
      onDateChange: setSelectedDate,
    });

  // Handle search
  const handleSearch = useCallback((event) => {
    const term = event.target ? event.target.value : event;
    setSearchTerm(term);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (filterId, value) => {
      if (onFiltersChange) {
        onFiltersChange({
          ...selectedFilters,
          [filterId]: value,
        });
      }
    },
    [selectedFilters, onFiltersChange],
  );

  // Handle view change
  const handleViewChange = useCallback((view) => {
    setCurrentView(view);
  }, []);

  // Handle create
  const handleCreate = useCallback(() => {
    if (onCreate) {
      onCreate();
    }
  }, [onCreate]);

  // Handle report generation
  const handleGenerateReport = useCallback(
    (reportData) => {
      if (onGenerateReport) {
        onGenerateReport(reportData);
      }
    },
    [onGenerateReport],
  );

  // Color scheme configuration
  const colorSchemes = {
    default: {
      primary: "from-[#B595FF] to-[#9BE9FF]",
      secondary: "from-[#95FFA7] to-[#9BE9FF]",
      accent: "from-[#FF95D1] to-[#B595FF]",
      warning: "from-[#FC6D6D] to-[#FF95D1]",
      info: "from-[#9BE9FF] to-[#95FFA7]",
    },
    events: {
      primary: "from-[#B595FF] to-[#9BE9FF]",
      secondary: "from-[#95FFA7] to-[#B595FF]",
      accent: "from-[#FF95D1] to-[#9BE9FF]",
    },
    classes: {
      primary: "from-[#95FFA7] to-[#9BE9FF]",
      secondary: "from-[#B595FF] to-[#95FFA7]",
      accent: "from-[#FF95D1] to-[#95FFA7]",
    },
    schedule: {
      primary: "from-[#9BE9FF] to-[#B595FF]",
      secondary: "from-[#95FFA7] to-[#9BE9FF]",
      accent: "from-[#EDEB85] to-[#95FFA7]",
    },
    custom: {
      // Para esquema custom, usar colores individuales de cada evento
      useEventColors: true,
      primary: "from-[#B595FF] to-[#9BE9FF]", // Fallback
      secondary: "from-[#95FFA7] to-[#9BE9FF]",
      accent: "from-[#FF95D1] to-[#B595FF]",
    },
  };

  const currentColorScheme = colorSchemes[colorScheme] || colorSchemes.default;

  if (viewPermission && !viewPermission) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No tienes permisos para ver este calendario</p>
      </div>
    );
  }

  // Error boundary para evitar que la app se rompa
  if (!filteredEvents) {
    console.error("Error: filteredEvents is undefined");
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Error al cargar el calendario. Por favor, recarga la página.</p>
      </div>
    );
  }

  return (
    <div
      className={`calendar-container ${
        showHeader ||
        showCreateButton ||
        showReportButton ||
        showSearch ||
        showFilters
          ? "space-y-4"
          : "space-y-2"
      } ${className}`}
    >
      {/* Header */}
      {showHeader && (
        <CalendarHeader
          title={title}
          subtitle={getCalendarTitle()}
          colorScheme={currentColorScheme}
        />
      )}

      {/* Controls Bar */}
      {(showCreateButton || showReportButton || showSearch || showFilters) && (
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          {/* Left side - Action buttons */}
          <div className="flex flex-wrap gap-3">
            {showCreateButton && (
              <PermissionGuard
                module={createPermission?.module}
                action={createPermission?.action}
                fallback={!createPermission}
              >
                <motion.button
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-4 py-2 bg-[#B595FF] text-white rounded-lg font-medium hover:bg-[#9BE9FF] transition-all duration-300 transform hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {React.createElement(createButtonIcon, {
                    className: "text-sm",
                  })}
                  <span className="hidden sm:inline">{createButtonText}</span>
                </motion.button>
              </PermissionGuard>
            )}

            {showReportButton && (
              <PermissionGuard
                module={reportPermission?.module}
                action={reportPermission?.action}
                fallback={!reportPermission}
              >
                <CalendarReportGenerator
                  events={filteredEvents}
                  onGenerateReport={handleGenerateReport}
                  title={reportButtonText}
                  entityName={reportEntityName}
                  showDateFilter={showReportDateFilter}
                  reportTypes={reportTypes}
                  customFields={reportCustomFields}
                />
              </PermissionGuard>
            )}

            {showFilters && filters.length > 0 && (
              <motion.button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={`flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg font-medium hover:border-[#B595FF] transition-all duration-300 ${
                  showFiltersPanel
                    ? "bg-[#B595FF] text-white border-[#B595FF]"
                    : "text-gray-700 hover:text-[#B595FF]"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaFilter className="text-sm" />
                <span className="hidden sm:inline">Filtros</span>
              </motion.button>
            )}
          </div>

          {/* Right side - Search */}
          <div className="flex flex-wrap gap-3 items-center">
            {showSearch && (
              <div className="w-full sm:w-auto">
                <SearchInput
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={handleSearch}
                  className="min-w-[200px]"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters Panel */}
      <AnimatePresence>
        {showFiltersPanel && filters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
              <button
                onClick={() => setShowFiltersPanel(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes />
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
                      handleFilterChange(filter.id, e.target.value)
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
      </AnimatePresence>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className={`${showSidebar ? "lg:col-span-2" : "lg:col-span-3"}`}>
          <CalendarControls
            currentView={currentView}
            selectedDate={selectedDate}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onToday={goToToday}
            title={getCalendarTitle()}
            colorScheme={currentColorScheme}
            viewTypes={viewTypes}
            onViewChange={handleViewChange}
            showViewToggle={showViewToggle}
          />

          <div className="mt-4">
            {variant === "big-calendar" ? (
              <BigCalendarWrapper
                events={filteredEvents}
                view={currentView}
                date={selectedDate}
                onView={handleViewChange}
                onNavigate={setSelectedDate}
                onSelectEvent={onEventClick}
                onSelectSlot={onSlotSelect}
                renderEvent={renderEvent}
                loading={loading}
                colorScheme={currentColorScheme}
                {...calendarProps}
              />
            ) : (
              <CustomCalendarGrid
                events={filteredEvents}
                view={currentView}
                date={selectedDate}
                onDateSelect={onDateSelect}
                onEventClick={onEventClick}
                onEventActionClick={onEventActionClick}
                renderEvent={renderEvent}
                loading={loading}
                colorScheme={currentColorScheme}
                {...calendarProps}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 min-h-[600px]">
              {/* Header del sidebar con botón de toggle */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#B595FF]">
                  {sidebarTitle}
                </h3>
                <motion.button
                  onClick={() => setShowAllEvents(!showAllEvents)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ${
                    showAllEvents
                      ? "bg-[#B595FF] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={
                    showAllEvents
                      ? "Mostrar solo eventos del día"
                      : "Mostrar todos los eventos"
                  }
                >
                  <FaList className="text-xs" />
                  <span>{showAllEvents ? "Del día" : "Todos"}</span>
                </motion.button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : sidebarEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaCalendarAlt className="mx-auto text-3xl mb-2 opacity-50" />
                  <p>
                    {showAllEvents
                      ? sidebarEmptyText
                      : "No hay actividades para este día"}
                  </p>
                </div>
              ) : (
                <div
                  className={`space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto`}
                >
                  {(sidebarMaxItems
                    ? sidebarEvents.slice(0, sidebarMaxItems)
                    : sidebarEvents
                  ).map((event, index) => (
                    <motion.div
                      key={event.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`${sidebarItemPadding} border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer ${sidebarItemMinHeight} flex flex-col justify-between`}
                      onClick={() => onEventClick && onEventClick(event)}
                    >
                      {renderSidebarItem ? (
                        renderSidebarItem(event, sidebarActions)
                      ) : (
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm mb-1">
                            {event.title || event.name || "Sin título"}
                          </h4>
                          <p className="text-xs text-gray-600 mb-2">
                            {event.date
                              ? typeof event.date === "string"
                                ? event.date
                                : event.date.toLocaleDateString()
                              : event.start
                                ? typeof event.start === "string"
                                  ? event.start
                                  : event.start.toLocaleDateString()
                                : "Sin fecha"}
                          </p>
                          {sidebarActions.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {sidebarActions.map((action, actionIndex) => (
                                <PermissionGuard
                                  key={actionIndex}
                                  module={action.permission?.module}
                                  action={action.permission?.action}
                                  fallback={!action.permission}
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      action.onClick(event);
                                    }}
                                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                                      action.variant === "danger"
                                        ? "text-red-600 hover:bg-red-50"
                                        : action.variant === "warning"
                                          ? "text-yellow-600 hover:bg-yellow-50"
                                          : "text-[#B595FF] hover:bg-[#9BE9FF] hover:text-white"
                                    }`}
                                  >
                                    {action.icon && <action.icon />}
                                    {action.label}
                                  </button>
                                </PermissionGuard>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseCalendar;
