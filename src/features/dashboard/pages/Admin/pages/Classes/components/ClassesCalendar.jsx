import React, { useState } from "react";
import { Users, MapPin, Clock, Edit, Eye, Trash2 } from "lucide-react";
import { BaseCalendar } from "../../../../../../../shared/components/Calendar";
import useClassesCalendar from "../hooks/useClassesCalendar";
import ClassDetailModal from "./ClassDetailModal";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";

const ClassesCalendar = ({
  onCreateClass,
  searchTerm,
  selectedFilters,
  onFiltersChange,
}) => {
  const {
    calendarClasses,
    loading,
    selectedEmployeeId,
    changeSelectedEmployee,
    fetchCalendarClasses,
  } = useClassesCalendar();

  const { hasPermission } = usePermissions();
  const [selectedClass, setSelectedClass] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  /**
   * Manejar clic en una clase
   */
  const handleClassClick = (classItem) => {
    setSelectedClass(classItem);
    setShowDetailModal(true);
  };

  /**
   * Manejar creación de nueva clase
   */
  const handleCreateClass = () => {
    if (onCreateClass) {
      onCreateClass();
    } else {
      console.log("Crear nueva clase");
    }
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
    // Aquí se manejaría la eliminación
  };

  /**
   * Generar reporte de clases
   */
  const handleGenerateReport = (events) => {
    console.log("Generar reporte de clases:", events);
    // Este handler no se usa ya que el botón de reportes está deshabilitado
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
          {event.extendedProps?.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.extendedProps.location}
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
          <div className="font-medium truncate text-xs leading-tight">
            {event.title}
          </div>
          <div className="opacity-90 text-xs leading-tight">
            {event.extendedProps?.startTime}
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
      id: "employee",
      label: "Profesor",
      field: "employeeId",
      options: [
        // Aquí se cargarían dinámicamente los empleados
        // Por ahora dejamos vacío
      ],
    },
  ];

  // Configuración de acciones de la barra lateral
  const sidebarActions = [
    {
      label: "Ver",
      icon: Eye,
      onClick: handleClassClick,
      permission: { module: "classes", action: "read" },
      variant: "primary",
    },
    ...(hasPermission("classes", "edit")
      ? [
          {
            label: "Editar",
            icon: Edit,
            onClick: handleEditClass,
            permission: { module: "classes", action: "edit" },
            variant: "primary",
          },
        ]
      : []),
    ...(hasPermission("classes", "delete")
      ? [
          {
            label: "Eliminar",
            icon: Trash2,
            onClick: handleDeleteClass,
            permission: { module: "classes", action: "delete" },
            variant: "danger",
          },
        ]
      : []),
  ];

  return (
    <>
      <BaseCalendar
        // Core props
        variant="custom"
        events={calendarClasses}
        loading={loading}
        // Event handlers
        onEventClick={handleClassClick}
        onCreate={handleCreateClass}
        onGenerateReport={handleGenerateReport}
        // Customization
        renderEvent={renderEvent}
        renderSidebarItem={renderSidebarItem}
        // UI Configuration
        title="Calendario de Clases"
        showHeader={false} // Ocultar el header del calendario
        showCreateButton={false} // Ocultar botón crear (se maneja desde el padre)
        showReportButton={false} // Ocultar botón reportes (se maneja desde el padre)
        showSearch={false} // Ocultar búsqueda (se maneja desde el padre)
        showFilters={false} // Ocultar filtros (se maneja desde el padre)
        createButtonText="Nueva Clase"
        reportButtonText="Reportes de Clases"
        // Search config (pasado desde el padre)
        searchTerm={searchTerm}
        searchPlaceholder="Buscar clases..."
        searchFields={["title", "professorName", "location"]}
        // Permissions
        createPermission={{ module: "classes", action: "create" }}
        reportPermission={{ module: "classes", action: "export" }}
        // Filter config
        filters={filters}
        selectedFilters={selectedFilters || { employee: selectedEmployeeId }}
        onFiltersChange={
          onFiltersChange ||
          ((newFilters) => {
            if (newFilters.employee !== selectedEmployeeId) {
              changeSelectedEmployee(newFilters.employee || null);
            }
          })
        }
        // View config
        viewTypes={["month", "week", "day"]}
        defaultView="month"
        // Sidebar config
        sidebarTitle="Clases Programadas"
        sidebarEmptyText="No hay clases programadas"
        sidebarActions={sidebarActions}
        // Styling
        colorScheme="classes"
        className="classes-calendar"
      />

      {/* Modal de detalle de clase */}
      {showDetailModal && selectedClass && (
        <ClassDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedClass(null);
          }}
          classData={selectedClass.extendedProps || selectedClass}
        />
      )}
    </>
  );
};

export default ClassesCalendar;
