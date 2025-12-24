import React, { useState } from "react";
import {
  FaPlus,
  FaFileExport,
  FaEdit,
  FaTrash,
  FaEye,
  FaStickyNote,
  FaBan,
} from "react-icons/fa";
import BaseCalendar from "../BaseCalendar/BaseCalendar";

// Ejemplo de uso del BaseCalendar para el módulo de Horarios de Empleados
const EmployeeScheduleCalendarExample = () => {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [schedules] = useState([
    {
      id: 1,
      title: "Entrenamiento Juvenil - Ana García",
      description: "Sesión de entrenamiento para categoría juvenil",
      start: "2024-01-15T09:00:00",
      end: "2024-01-15T11:00:00",
      empleado: "Ana García",
      cargo: "entrenador",
      status: "programado",
      location: "Cancha Principal",
      hasNovedad: false,
    },
    {
      id: 2,
      title: "Sesión Fisioterapia - Carlos Ruiz",
      description: "Sesión de fisioterapia para jugadoras lesionadas",
      start: "2024-01-15T14:00:00",
      end: "2024-01-15T16:00:00",
      empleado: "Carlos Ruiz",
      cargo: "fisioterapia",
      status: "programado",
      location: "Sala de Fisioterapia",
      hasNovedad: true,
    },
    {
      id: 3,
      title: "Consulta Nutricional - María Fernández",
      description: "Consultas nutricionales individuales",
      start: "2024-01-16T10:00:00",
      end: "2024-01-16T12:00:00",
      empleado: "María Fernández",
      cargo: "nutricion",
      status: "finalizado",
      location: "Consultorio Nutrición",
      hasNovedad: false,
    },
  ]);

  // Configuración de filtros dinámicos por cargo
  const filters = [
    {
      id: "cargo",
      label: "Cargo",
      field: "cargo",
      options: [
        { value: "entrenador", label: "Entrenador" },
        { value: "fisioterapia", label: "Fisioterapeuta" },
        { value: "nutricion", label: "Nutricionista" },
        { value: "psicologia", label: "Psicología" },
      ],
    },
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
      id: "hasNovedad",
      label: "Con Novedad",
      field: "hasNovedad",
      options: [
        { value: true, label: "Con Novedad" },
        { value: false, label: "Sin Novedad" },
      ],
    },
  ];

  // Acciones de la barra lateral (incluye crear novedad)
  const sidebarActions = [
    {
      label: "Ver",
      icon: FaEye,
      onClick: (schedule) => console.log("Ver horario:", schedule),
      variant: "primary",
    },
    {
      label: "Editar",
      icon: FaEdit,
      onClick: (schedule) => console.log("Editar horario:", schedule),
      permission: { module: "employeesSchedule", action: "edit" },
      variant: "primary",
    },
    {
      label: "Novedad",
      icon: FaStickyNote,
      onClick: (schedule) => console.log("Crear novedad:", schedule),
      permission: { module: "employeesSchedule", action: "novedad" },
      variant: "warning",
    },
    {
      label: "Cancelar",
      icon: FaBan,
      onClick: (schedule) => console.log("Cancelar horario:", schedule),
      permission: { module: "employeesSchedule", action: "cancel" },
      variant: "danger",
    },
    {
      label: "Eliminar",
      icon: FaTrash,
      onClick: (schedule) => console.log("Eliminar horario:", schedule),
      permission: { module: "employeesSchedule", action: "delete" },
      variant: "danger",
    },
  ];

  // Handlers
  const handleCreate = () => {
    console.log("Crear nuevo horario");
  };

  const handleGenerateReport = (filteredSchedules) => {
    console.log("Generar reporte de horarios:", filteredSchedules);
  };

  const handleEventClick = (schedule) => {
    console.log("Horario clickeado:", schedule);
  };

  const handleSlotSelect = (slotInfo) => {
    console.log("Slot seleccionado para crear horario:", slotInfo);
  };

  const handleFiltersChange = (newFilters) => {
    setSelectedFilters(newFilters);
  };

  // Renderizador personalizado de eventos para la barra lateral
  const renderSidebarItem = (schedule, actions) => {
    const getRoleColor = (cargo) => {
      const colors = {
        entrenador: "#4ade80",
        fisioterapia: "#8b5cf6",
        nutricion: "#38bdf8",
        psicologia: "#fb7185",
      };
      return colors[cargo] || "#6366f1";
    };

    return (
      <div>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-gray-800 text-sm mb-1">
              {schedule.empleado}
            </h4>
            <p className="text-xs text-gray-600 mb-1">
              🕐{" "}
              {new Date(schedule.start).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {new Date(schedule.end).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-xs text-gray-600 mb-1">📍 {schedule.location}</p>
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 text-xs rounded-full text-white"
                style={{ backgroundColor: getRoleColor(schedule.cargo) }}
              >
                {schedule.cargo}
              </span>
              {schedule.hasNovedad && (
                <span className="text-yellow-500 text-xs">⚠️ Novedad</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-1 flex-wrap">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick(schedule);
              }}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                action.variant === "danger"
                  ? "text-red-600 hover:bg-red-50"
                  : action.variant === "warning"
                  ? "text-yellow-600 hover:bg-yellow-50"
                  : "text-[#B595FF] hover:bg-purple-50"
              }`}
            >
              {action.icon && <action.icon />}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Renderizador personalizado de eventos para react-big-calendar
  const renderEvent = (schedule) => {
    const getRoleColor = (cargo) => {
      const colors = {
        entrenador: "#4ade80",
        fisioterapia: "#8b5cf6",
        nutricion: "#38bdf8",
        psicologia: "#fb7185",
      };
      return colors[cargo] || "#6366f1";
    };

    return (
      <div
        className="p-1 rounded text-white text-xs"
        style={{ backgroundColor: getRoleColor(schedule.cargo) }}
      >
        <div className="font-medium truncate">{schedule.empleado}</div>
        <div className="opacity-75">{schedule.cargo}</div>
        {schedule.hasNovedad && <div className="text-yellow-200">⚠️</div>}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <BaseCalendar
        // Core configuration
        variant="big-calendar"
        events={schedules}
        loading={false}
        // Event handlers
        onEventClick={handleEventClick}
        onSlotSelect={handleSlotSelect}
        onCreate={handleCreate}
        // Custom renderers
        renderEvent={renderEvent}
        renderSidebarItem={renderSidebarItem}
        // UI Configuration
        title="Horario de Empleados"
        showCreateButton={true}
        showReportButton={true}
        showSearch={true}
        showFilters={true}
        showSidebar={true}
        showViewToggle={true}
        // Button configuration
        createButtonText="Crear Horario"
        createButtonIcon={FaPlus}
        createPermission={{ module: "employeesSchedule", action: "create" }}
        reportButtonText="Generar Reporte"
        reportButtonIcon={FaFileExport}
        onGenerateReport={handleGenerateReport}
        reportPermission={{ module: "employeesSchedule", action: "export" }}
        // Search configuration
        searchPlaceholder="Buscar por empleado, cargo o ubicación..."
        searchFields={["empleado", "cargo", "location", "description"]}
        // Filter configuration
        filters={filters}
        selectedFilters={selectedFilters}
        onFiltersChange={handleFiltersChange}
        // View configuration
        viewTypes={["month", "week", "day"]}
        defaultView="week"
        // Sidebar configuration
        sidebarTitle="Horarios Programados"
        sidebarEmptyText="No hay horarios programados"
        sidebarActions={sidebarActions}
        // Styling
        colorScheme="schedule"
        className="max-w-7xl mx-auto"
        // react-big-calendar specific props
        calendarProps={{
          step: 30,
          timeslots: 2,
          min: new Date(2024, 0, 1, 7, 0),
          max: new Date(2024, 0, 1, 22, 0),
          defaultDate: new Date(),
          selectable: true,
          popup: true,
        }}
      />
    </div>
  );
};

export default EmployeeScheduleCalendarExample;
