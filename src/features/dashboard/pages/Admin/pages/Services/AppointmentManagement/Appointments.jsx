import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Filter,
  Stethoscope,
} from "lucide-react";
import AppointmentForm from "./components/AppointmentForm";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import AppointmentDetails from "./components/AppointmentDetails";
import CancelAppointmentModal from "./components/CancelAppointmentModal";
import CompleteAppointmentModal from "./components/CompleteAppointmentModal";
import {
  BaseCalendar,
  CalendarReportGenerator,
} from "../../../../../../../shared/components/Calendar";
import { useAppointments } from "./hooks/useAppointments";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";
import { useAuth } from "../../../../../../../shared/contexts/authContext";

// Colores pastel para cada especialista
const pastelColors = [
  "#FFB3BA", // Rosa pastel
  "#FFDFBA", // Durazno pastel
  "#FFFFBA", // Amarillo pastel
  "#BAFFC9", // Verde menta pastel
  "#BAE1FF", // Azul cielo pastel
  "#E0BBE4", // Lavanda pastel
  "#FFDFD3", // Coral pastel
  "#D4F1F4", // Aqua pastel
  "#FFE5B4", // Melocotón pastel
  "#C7CEEA", // Periwinkle pastel
  "#FFD1DC", // Rosa claro pastel
  "#B4E7CE", // Menta pastel
  "#FFF4E0", // Crema pastel
  "#E8D5C4", // Beige pastel
  "#C9E4DE", // Turquesa pastel
];

// Función para asignar color basado en el ID del especialista
const getSpecialistColor = (specialistId) => {
  if (!specialistId) return "#E0BBE4"; // Color por defecto
  const numericId = typeof specialistId === 'string' 
    ? parseInt(specialistId.replace(/\D/g, ''), 10) || 0
    : specialistId;
  return pastelColors[numericId % pastelColors.length];
};

const statusLabels = {
  Programado: "Programada",
  Completado: "Completada",
  Cancelado: "Cancelada",
};

function Appointments() {
  const {
    appointments,
    athletes,
    specialists,
    healthSpecialists,
    healthSpecialtyOptions,
    isHealthEmployee,
    currentSpecialistId,
    sportsCategories,
    specialtyOptions,
    loading,
    loadingAthletes,
    loadingSpecialists,
    loadingCategories,
    loadAppointments,
    loadAthletes,
    loadSpecialists,
    loadSportsCategories,
    createAppointment,
    cancelAppointment,
    completeAppointment,
    isAthleteScope,
    athleteIdFromUser,
  } = useAppointments();

  const { hasPermission } = usePermissions();
  
  // Verificar si el usuario es deportista directamente
  const { user } = useAuth();
  const userRole = (user?.role?.name || user?.rol || "").toString().toLowerCase();
  const isAthleteView = userRole === "athlete" || userRole === "deportista" || isAthleteScope;
  
  const canViewAppointments = hasPermission("appointmentManagement", "Ver");
  const canCreateAppointments = hasPermission(
    "appointmentManagement",
    "Crear",
  );
  const canEditAppointments = hasPermission("appointmentManagement", "Editar");
  const canCancelAppointments = hasPermission("appointmentManagement", "Cancelar");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [appointmentToComplete, setAppointmentToComplete] = useState(null);
  const [initialSlot, setInitialSlot] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    specialistId: "",
    status: "",
  });

  useEffect(() => {
    loadAppointments();
    loadAthletes();
    loadSpecialists();
    loadSportsCategories();
  }, [loadAppointments, loadAthletes, loadSpecialists, loadSportsCategories]);

  const specialistFilterOptions = useMemo(
    () =>
      specialists.map((spec) => ({
        value: spec.id || spec.specialistId,
        label: spec.label || spec.nombre || "Especialista",
      })),
    [specialists]
  );

  const filters = useMemo(
    () => [
      {
        id: "specialistId",
        label: "Especialista",
        field: "specialistId",
        options: specialistFilterOptions,
      },
      {
        id: "status",
        label: "Estado",
        field: "status",
        options: [
          { value: "Programado", label: "Programada" },
          { value: "Completado", label: "Completada" },
          { value: "Cancelado", label: "Cancelada" },
        ],
      },
    ],
    [specialistFilterOptions]
  );

  const handleFiltersChange = (nextFilters) => {
    setSelectedFilters((prev) => ({ ...prev, ...nextFilters }));
  };

  const appointmentEvents = useMemo(() => {
    return appointments.map((appointment) => {
      const startDate = appointment.start ? new Date(appointment.start) : null;
      const endDate = appointment.end ? new Date(appointment.end) : null;
      const date = appointment.appointmentDate || "";
      const time = appointment.startTime || "";
      const backgroundColor = getSpecialistColor(appointment.specialistId);

      return {
        id: appointment.id,
        title:
          appointment.title ||
          `Cita: ${appointment.athleteName} - ${appointment.specialistName}`,
        date,
        time,
        start: startDate,
        end: endDate,
        status: appointment.status,
        specialty: appointment.specialty,
        specialtyLabel: appointment.specialtyLabel,
        specialistId: appointment.specialistId
          ? String(appointment.specialistId)
          : "",
        specialistName: appointment.specialistName,
        athleteId: appointment.athleteId ? String(appointment.athleteId) : "",
        athleteName: appointment.athleteName,
        description: appointment.description,
        cancelReason: appointment.cancelReason,
        conclusion: appointment.conclusion,
        backgroundColor,
        borderColor: backgroundColor,
        extendedProps: {
          ...appointment,
        },
      };
    });
  }, [appointments]);

  const handleSelectAppointment = (appointment) => {
    if (!canViewAppointments) return;
    const appointmentData = appointment?.extendedProps || appointment;
    if (appointmentData?.specialty) {
      setSelectedAppointment(appointmentData);
      setIsViewModalOpen(true);
    }
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setTimeout(() => {
      setSelectedAppointment(null);
    }, 300);
  };

  const handleOpenCreateModal = () => {
    if (!canCreateAppointments) return;
    setInitialSlot(null);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setInitialSlot(null);
  };

  const handleEditAppointment = (appointmentData) => {
    setInitialSlot(appointmentData);
    setIsCreateModalOpen(true);
  };

  const handleDateSelect = useCallback((selectedDate) => {
    // Bloquear creación de citas para deportistas
    if (!canCreateAppointments || isAthleteView) return;
    setInitialSlot({ start: selectedDate });
    setIsCreateModalOpen(true);
  }, [canCreateAppointments, isAthleteView]);

  const handleCreateSubmit = async (formValues) => {
    try {
      await createAppointment(formValues);
    } catch (error) {
      // errores manejados por el hook
    }
  };

  const handleCancelAppointment = useCallback(
    async (appointment) => {
      setAppointmentToCancel(appointment);
      setIsCancelModalOpen(true);
    },
    [],
  );

  const handleConfirmCancel = async (reason) => {
    if (appointmentToCancel) {
      try {
        await cancelAppointment(appointmentToCancel.id, reason);
        setIsCancelModalOpen(false);
        setAppointmentToCancel(null);
        handleCloseViewModal();
      } catch (error) {
        // errores manejados por el hook
      }
    }
  };

  const handleMarkAsCompleted = async (appointmentToComplete) => {
    const appointmentDate = appointmentToComplete?.appointmentDate || appointmentToComplete?.date;
    if (appointmentDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const apptDate = new Date(appointmentDate);
      apptDate.setHours(0, 0, 0, 0);
      if (apptDate > today) {
        return;
      }
    }
    setAppointmentToComplete(appointmentToComplete);
    setIsCompleteModalOpen(true);
  };


  const canCompleteByDate = useCallback((event) => {
    const appointmentDate = event?.appointmentDate || event?.date;
    if (!appointmentDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const apptDate = new Date(appointmentDate);
    apptDate.setHours(0, 0, 0, 0);
    return apptDate <= today;
  }, []);
  const handleConfirmComplete = async (conclusion, shouldReschedule, file = null) => {
    if (appointmentToComplete) {
      try {
        await completeAppointment(appointmentToComplete.id, conclusion, file);
        setIsCompleteModalOpen(false);
        
        // Si se debe re-agendar, abrir el formulario con los datos pre-cargados
        if (shouldReschedule) {
          setInitialSlot({
            athleteId: appointmentToComplete.athleteId,
            specialistId: appointmentToComplete.specialistId,
            specialty: appointmentToComplete.specialty,
            description: `Seguimiento de cita anterior (ID: ${appointmentToComplete.id})`,
          });
          setIsCreateModalOpen(true);
        }
        
        setAppointmentToComplete(null);
        handleCloseViewModal();
      } catch (error) {
        // errores manejados por el hook
      }
    }
  };

  const renderEvent = (event, variant) => {
    const color = event.backgroundColor || "#B595FF";
    if (variant === "grid") {
      return (
        <div
          className="p-1 rounded text-black text-xs cursor-pointer hover:opacity-80"
          style={{ backgroundColor: color }}
        >
          <div className="font-medium truncate text-xs leading-tight">
            {event.title}
          </div>
        </div>
      );
    }
    return <span>{event.title}</span>;
  };

  const renderSidebarItem = (event) => {
    const statusLabel = statusLabels[event.status] || "Programada";
    const statusStyles =
      event.status === "Cancelado"
        ? "bg-red-100 text-red-700"
        : event.status === "Completado"
        ? "bg-green-100 text-green-700"
        : "bg-blue-100 text-blue-700";

    const isEditable = event.status === "Programado";
    const canComplete = isEditable && canCompleteByDate(event);

    return (
      <div className="space-y-1.5">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-medium text-gray-800 text-sm">
              {event.athleteName || "Deportista"}
            </h4>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusStyles}`}>
              {statusLabel}
            </span>
          </div>
          <div className="space-y-0.5 text-xs text-gray-600 mt-1">
            {event.specialistName && (
              <div className="flex items-center gap-1">
                <Stethoscope className="h-3 w-3" />
                <span className="text-[11px]">{event.specialistName}</span>
              </div>
            )}
            {event.specialtyLabel && (
              <div className="text-[11px] text-gray-600">
                {event.specialtyLabel}
              </div>
            )}
            {event.time && (
              <div className="text-[11px] text-gray-600">
                {event.time}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-1 flex-wrap pt-1.5 border-t border-gray-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSelectAppointment(event);
            }}
            className="flex items-center gap-1 px-2 py-0.5 text-[11px] rounded transition-colors text-[#B595FF] hover:bg-[#9BE9FF] hover:text-white"
          >
            Ver
          </button>
          {isEditable && !isAthleteView && canEditAppointments && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditAppointment(event);
                }}
                className="flex items-center gap-1 px-2 py-0.5 text-[11px] rounded transition-colors text-blue-600 hover:bg-blue-50"
              >
                Editar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!canComplete) return;
                  handleMarkAsCompleted(event);
                }}
                disabled={!canComplete}
                title={!canComplete ? "Disponible el dia de la cita" : "Completar cita"}
                className={`flex items-center gap-1 px-2 py-0.5 text-[11px] rounded transition-colors ${
                  canComplete
                    ? "text-green-600 hover:bg-green-50"
                    : "text-gray-400 bg-gray-100 cursor-not-allowed"
                }`}
              >
                Completar
              </button>
            </>
          )}
          {isEditable && canCancelAppointments && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCancelAppointment(event);
              }}
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] rounded transition-colors text-red-600 hover:bg-red-50"
            >
              Cancelar
            </button>
          )}

        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 font-monserrat p-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="w-full sm:w-auto">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar citas..."
              className="min-w-[200px]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {canCreateAppointments && !isAthleteView && (
              <motion.button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-[#B595FF] text-white rounded-lg font-medium hover:bg-[#9BE9FF] transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-4 w-4" />
                <span>Crear</span>
              </motion.button>
            )}
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg font-medium hover:border-[#B595FF] transition-all duration-300 ${
                showFilters
                  ? "bg-[#B595FF] text-white border-[#B595FF]"
                  : "text-gray-700 hover:text-[#B595FF]"}
                `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros</span>
            </motion.button>
            <CalendarReportGenerator
              events={appointmentEvents}
              title="Reportes"
              entityName="citas"
              reportTypes={["pdf", "excel"]}
              showDateFilter={true}
              customFields={[
                { key: "specialistName", label: "Especialista" },
                { key: "specialtyLabel", label: "Especialidad" },
                { key: "athleteName", label: "Deportista" },
                { key: "status", label: "Estado" },
              ]}
            />
          </div>
        </div>
      </div>

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
              &times;
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
                    handleFiltersChange({ [filter.id]: e.target.value })
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

          {(selectedFilters.specialistId ||
            selectedFilters.status) && (
            <div className="mt-4">
              <button
                onClick={() =>
                  setSelectedFilters({
                    specialistId: "",
                    status: "",
                  })
                }
                className="text-xs font-semibold text-gray-600 px-3 py-1 rounded-full border border-gray-200 hover:bg-gray-100 transition"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </motion.div>
      )}

      <BaseCalendar
        variant="custom"
        events={appointmentEvents}
        loading={loading}
        onEventClick={handleSelectAppointment}
        onCreate={handleOpenCreateModal}
        onDateSelect={handleDateSelect}
        renderEvent={renderEvent}
        renderSidebarItem={renderSidebarItem}
        title="Calendario de Citas"
        showHeader={false}
        showCreateButton={false}
        showReportButton={false}
        showSearch={false}
        showFilters={false}
        createButtonText="Crear Cita"
        reportButtonText="Reportes de Citas"
        searchTerm={searchTerm}
        searchPlaceholder="Buscar citas..."
        searchFields={[
          "title",
          "specialistName",
          "specialtyLabel",
          "athleteName",
          "description",
        ]}
        filters={filters}
        selectedFilters={selectedFilters}
        onFiltersChange={handleFiltersChange}
        viewTypes={["month", "week", "day"]}
        defaultView="month"
        sidebarTitle="Citas Programadas"
        sidebarEmptyText="No hay citas programadas"
        colorScheme="events"
        className="appointments-calendar"
        sidebarItemMinHeight="min-h-[120px]"
      />

      <AppointmentForm
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSave={handleCreateSubmit}
        initialData={initialSlot}
        athleteList={athletes}
        specialistList={isHealthEmployee ? healthSpecialists : specialists}
        sportsCategoryOptions={sportsCategories}
        specialtyOptions={isHealthEmployee ? healthSpecialtyOptions : specialtyOptions}
        loadingAthletes={loadingAthletes}
        loadingSpecialists={loadingSpecialists}
        loadingCategories={loadingCategories}
        defaultAthleteId={isAthleteScope ? athleteIdFromUser : ""}
        lockAthlete={isAthleteScope}
        lockSpecialist={isHealthEmployee}
        defaultSpecialistId={isHealthEmployee ? currentSpecialistId : ""}
        existingAppointments={appointments}
      />

      <AppointmentDetails
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        appointmentData={selectedAppointment}
        athleteList={athletes}
        specialtyOptions={specialtyOptions}
        onMarkAsCompleted={handleMarkAsCompleted}
        onCancelAppointment={handleCancelAppointment}
        isAthleteScope={isAthleteView}
        allAppointments={appointments}
      />

      <CancelAppointmentModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setAppointmentToCancel(null);
        }}
        onConfirm={handleConfirmCancel}
        appointmentData={appointmentToCancel}
      />

      <CompleteAppointmentModal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setAppointmentToComplete(null);
        }}
        onConfirm={handleConfirmComplete}
        appointmentData={appointmentToComplete}
      />
    </div>
  );
}

export default Appointments;




