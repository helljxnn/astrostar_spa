import React, { useState } from "react";
import { Users, MapPin, Clock, Edit, Eye, Trash2 } from "lucide-react";
import { BaseCalendar } from "../index";

/**
 * Ejemplo de implementación del BaseCalendar para el módulo de Clases
 *
 * Este ejemplo muestra cómo configurar el calendario genérico
 * específicamente para manejar clases deportivas.
 */
const ClassesCalendarExample = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Clase de Natación Principiantes",
      date: "2024-01-15",
      time: "09:00",
      start: new Date(2024, 0, 15, 9, 0),
      end: new Date(2024, 0, 15, 10, 30),
      status: "Programada",
      location: "Piscina Principal",
      backgroundColor: "#95FFA7",
      extendedProps: {
        professorName: "Ana García",
        totalAthletes: 12,
        startTime: "09:00",
        endTime: "10:30",
        employeeId: 1,
        classDate: "2024-01-15T09:00:00Z",
      },
    },
    {
      id: 2,
      title: "Clase de Atletismo Avanzado",
      date: "2024-01-15",
      time: "16:00",
      start: new Date(2024, 0, 15, 16, 0),
      end: new Date(2024, 0, 15, 17, 30),
      status: "En_curso",
      location: "Pista de Atletismo",
      backgroundColor: "#EDEB85",
      extendedProps: {
        professorName: "Carlos Rodríguez",
        totalAthletes: 8,
        startTime: "16:00",
        endTime: "17:30",
        employeeId: 2,
        classDate: "2024-01-15T16:00:00Z",
      },
    },
    {
      id: 3,
      title: "Clase de Gimnasia Rítmica",
      date: "2024-01-16",
      time: "10:00",
      start: new Date(2024, 0, 16, 10, 0),
      end: new Date(2024, 0, 16, 11, 30),
      status: "Finalizada",
      location: "Gimnasio A",
      backgroundColor: "#9BE9FF",
      extendedProps: {
        professorName: "María López",
        totalAthletes: 15,
        startTime: "10:00",
        endTime: "11:30",
        employeeId: 3,
        classDate: "2024-01-16T10:00:00Z",
      },
    },
  ]);

  const [selectedFilters, setSelectedFilters] = useState({});

  /**
   * Manejar clic en una clase
   */
  const handleClassClick = (classItem) => {
    console.log("Ver detalles de clase:", classItem);
    // Aquí se abriría el modal de detalles
  };

  /**
   * Manejar creación de nueva clase
   */
  const handleCreateClass = () => {
    console.log("Crear nueva clase");
    // Aquí se abriría el modal de creación
  };

  /**
   * Manejar edición de clase
   */
  const handleEditClass = (classItem) => {
    console.log("Editar clase:", classItem);
    // Aquí se abriría el modal de edición
  };

  /**
   * Manejar eliminación de clase
   */
  const handleDeleteClass = (classItem) => {
    console.log("Eliminar clase:", classItem);
    // Aquí se manejaría la eliminación con confirmación
  };

  /**
   * Generar reporte de clases
   */
  const handleGenerateReport = (reportData) => {
    console.log("Generar reporte de clases:", reportData);

    const { events, format, dateRange, entityName } = reportData;

    // Procesar datos específicos de clases
    const classesReportData = events.map((classEvent) => ({
      titulo: classEvent.title,
      fecha: classEvent.start || classEvent.date,
      horaInicio: classEvent.extendedProps?.startTime,
      horaFin: classEvent.extendedProps?.endTime,
      profesor: classEvent.extendedProps?.professorName,
      deportistas: classEvent.extendedProps?.totalAthletes || 0,
      ubicacion: classEvent.location,
      estado: classEvent.status || "Programada",
    }));

    console.log(
      `Generando reporte ${format} de ${entityName} del ${dateRange.start.toLocaleDateString()} al ${dateRange.end.toLocaleDateString()}`
    );
    console.table(classesReportData);

    // Aquí se llamaría al servicio de generación de reportes
    // reportService.generateClassesReport(classesReportData, format, dateRange);
  };

  /**
   * Renderizar evento personalizado para la barra lateral
   */
  const renderSidebarItem = (event, actions) => (
    <div className="space-y-2">
      <div>
        <h4 className="font-medium text-gray-800 text-sm mb-1">
          {event.title}
        </h4>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {event.extendedProps?.startTime} - {event.extendedProps?.endTime}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {event.extendedProps?.totalAthletes || 0} deportistas
          </div>
          {event.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.location}
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium">Profesor:</span>
            {event.extendedProps?.professorName}
          </div>
        </div>
      </div>

      {actions.length > 0 && (
        <div className="flex gap-1 flex-wrap pt-2 border-t border-gray-100">
          {actions.map((action, actionIndex) => (
            <button
              key={actionIndex}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick(event);
              }}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                action.variant === "danger"
                  ? "text-red-600 hover:bg-red-50"
                  : action.variant === "warning"
                  ? "text-yellow-600 hover:bg-yellow-50"
                  : "text-[#95FFA7] hover:bg-green-50"
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

  /**
   * Renderizar evento personalizado en el calendario
   */
  const renderEvent = (event, variant) => {
    if (variant === "grid") {
      return (
        <div
          className="p-1 rounded text-white text-xs cursor-pointer hover:opacity-80"
          style={{ backgroundColor: event.backgroundColor }}
        >
          <div className="font-medium truncate">{event.title}</div>
          <div className="opacity-90">
            {event.extendedProps?.startTime} - {event.extendedProps?.endTime}
          </div>
          <div className="flex items-center gap-1 mt-1 opacity-75">
            <Users className="h-2 w-2" />
            {event.extendedProps?.totalAthletes || 0}
          </div>
        </div>
      );
    }
    return <span>{event.title}</span>;
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
      id: "professor",
      label: "Profesor",
      field: "professorName",
      options: [
        { value: "Ana García", label: "Ana García" },
        { value: "Carlos Rodríguez", label: "Carlos Rodríguez" },
        { value: "María López", label: "María López" },
      ],
    },
    {
      id: "location",
      label: "Ubicación",
      field: "location",
      options: [
        { value: "Piscina Principal", label: "Piscina Principal" },
        { value: "Pista de Atletismo", label: "Pista de Atletismo" },
        { value: "Gimnasio A", label: "Gimnasio A" },
      ],
    },
  ];

  // Configuración de acciones de la barra lateral
  const sidebarActions = [
    {
      label: "Ver",
      icon: Eye,
      onClick: handleClassClick,
      variant: "primary",
    },
    {
      label: "Editar",
      icon: Edit,
      onClick: handleEditClass,
      variant: "primary",
    },
    {
      label: "Eliminar",
      icon: Trash2,
      onClick: handleDeleteClass,
      variant: "danger",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Ejemplo: Calendario de Clases
        </h1>
        <p className="text-gray-600">
          Implementación del BaseCalendar configurado específicamente para el
          módulo de clases.
        </p>
      </div>

      <BaseCalendar
        // Core props
        variant="custom"
        events={events}
        loading={false}
        // Event handlers
        onEventClick={handleClassClick}
        onCreate={handleCreateClass}
        onGenerateReport={handleGenerateReport}
        // Customization
        renderEvent={renderEvent}
        renderSidebarItem={renderSidebarItem}
        // UI Configuration
        title="Calendario de Clases"
        createButtonText="Nueva Clase"
        reportButtonText="Reportes"
        searchPlaceholder="Buscar clases..."
        searchFields={["title", "professorName", "location"]}
        // Configuración específica de reportes
        reportEntityName="clases"
        reportCustomFields={[
          { key: "professorName", label: "Profesor" },
          { key: "totalAthletes", label: "Deportistas" },
          { key: "location", label: "Ubicación" },
          { key: "status", label: "Estado" },
        ]}
        reportTypes={["pdf", "excel"]}
        showReportDateFilter={true}
        // Filter config
        filters={filters}
        selectedFilters={selectedFilters}
        onFiltersChange={setSelectedFilters}
        // View config
        viewTypes={["month", "week", "day"]}
        defaultView="month"
        // Sidebar config
        sidebarTitle="Clases Programadas"
        sidebarEmptyText="No hay clases programadas"
        sidebarActions={sidebarActions}
        // Usar configuración por defecto (h-[500px], min-h-[150px], p-4, sin límite)
        // Styling
        colorScheme="classes"
        className="classes-calendar-example"
      />
    </div>
  );
};

export default ClassesCalendarExample;
