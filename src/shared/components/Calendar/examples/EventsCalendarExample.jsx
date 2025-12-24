import React, { useState } from "react";
import {
  FaPlus,
  FaFileExport,
  FaEdit,
  FaTrash,
  FaEye,
  FaStickyNote,
} from "react-icons/fa";
import BaseCalendar from "../BaseCalendar/BaseCalendar";
import CalendarEvent from "../Variants/CalendarEvent";

// Ejemplo de uso del BaseCalendar para el módulo de Eventos
const EventsCalendarExample = () => {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [events] = useState([
    {
      id: 1,
      title: "Torneo Femenino Regional",
      description: "Torneo de fútbol femenino con equipos de la región",
      date: "2024-01-15",
      time: "09:00",
      location: "Estadio Municipal",
      status: "programado",
      type: "torneo",
      image: "/images/torneo.jpg",
    },
    {
      id: 2,
      title: "Festival de Talentos",
      description: "Evento para mostrar los talentos de nuestras jugadoras",
      date: "2024-01-20",
      time: "15:00",
      location: "Centro Deportivo",
      status: "programado",
      type: "festival",
      image: "/images/festival.jpg",
    },
    {
      id: 3,
      title: "Clausura Temporada 2023",
      description: "Ceremonia de clausura de la temporada",
      date: "2024-01-10",
      time: "18:00",
      location: "Auditorio Principal",
      status: "finalizado",
      type: "clausura",
      image: "/images/clausura.jpg",
    },
  ]);

  // Configuración de filtros dinámicos
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
        { value: "en-pausa", label: "En Pausa" },
      ],
    },
    {
      id: "type",
      label: "Tipo de Evento",
      field: "type",
      options: [
        { value: "torneo", label: "Torneo" },
        { value: "festival", label: "Festival" },
        { value: "clausura", label: "Clausura" },
        { value: "taller", label: "Taller" },
      ],
    },
  ];

  // Acciones de la barra lateral
  const sidebarActions = [
    {
      label: "Ver",
      icon: FaEye,
      onClick: (event) => console.log("Ver evento:", event),
      variant: "primary",
    },
    {
      label: "Editar",
      icon: FaEdit,
      onClick: (event) => console.log("Editar evento:", event),
      permission: { module: "events", action: "edit" },
      variant: "primary",
    },
    {
      label: "Eliminar",
      icon: FaTrash,
      onClick: (event) => console.log("Eliminar evento:", event),
      permission: { module: "events", action: "delete" },
      variant: "danger",
    },
  ];

  // Handlers
  const handleCreate = () => {
    console.log("Crear nuevo evento");
  };

  const handleGenerateReport = (filteredEvents) => {
    console.log("Generar reporte con eventos:", filteredEvents);
  };

  const handleEventClick = (event) => {
    console.log("Evento clickeado:", event);
  };

  const handleDateSelect = (date) => {
    console.log("Fecha seleccionada:", date);
  };

  const handleFiltersChange = (newFilters) => {
    setSelectedFilters(newFilters);
  };

  // Renderizador personalizado de eventos para la barra lateral
  const renderSidebarItem = (event, actions) => (
    <div>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-gray-800 text-sm mb-1">
            {event.title}
          </h4>
          <p className="text-xs text-gray-600 mb-1">
            📅 {event.date} • 🕐 {event.time}
          </p>
          <p className="text-xs text-gray-600">📍 {event.location}</p>
        </div>
        <div
          className="w-3 h-3 rounded-full ml-2 flex-shrink-0"
          style={{
            backgroundColor:
              event.status === "programado"
                ? "#9be9ff"
                : event.status === "finalizado"
                ? "#9ca3af"
                : event.status === "cancelado"
                ? "#FC6D6D"
                : "#95FFA7",
          }}
        />
      </div>

      <div className="flex gap-1 flex-wrap">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(event);
            }}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
              action.variant === "danger"
                ? "text-red-600 hover:bg-red-50"
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

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <BaseCalendar
        // Core configuration
        variant="custom"
        events={events}
        loading={false}
        // Event handlers
        onEventClick={handleEventClick}
        onDateSelect={handleDateSelect}
        onCreate={handleCreate}
        // UI Configuration
        title="Calendario de Eventos"
        showCreateButton={true}
        showReportButton={true}
        showSearch={true}
        showFilters={true}
        showSidebar={true}
        showViewToggle={true}
        // Button configuration
        createButtonText="Crear Evento"
        createButtonIcon={FaPlus}
        createPermission={{ module: "events", action: "create" }}
        reportButtonText="Generar Reporte"
        reportButtonIcon={FaFileExport}
        onGenerateReport={handleGenerateReport}
        reportPermission={{ module: "events", action: "export" }}
        // Search configuration
        searchPlaceholder="Buscar eventos..."
        searchFields={["title", "description", "location"]}
        // Filter configuration
        filters={filters}
        selectedFilters={selectedFilters}
        onFiltersChange={handleFiltersChange}
        // View configuration
        viewTypes={["month"]}
        defaultView="month"
        // Sidebar configuration
        sidebarTitle="Eventos Programados"
        sidebarEmptyText="No hay eventos programados"
        sidebarActions={sidebarActions}
        renderSidebarItem={renderSidebarItem}
        // Styling
        colorScheme="events"
        className="max-w-7xl mx-auto"
      />
    </div>
  );
};

export default EventsCalendarExample;
