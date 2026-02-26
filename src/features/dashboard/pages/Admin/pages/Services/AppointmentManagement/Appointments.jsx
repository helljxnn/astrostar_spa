import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Filter,
  Eye,
  PencilLine,
  XCircle,
  CheckCircle2,
  CalendarClock,
  UserRound,
  Stethoscope,
} from "lucide-react";
import Swal from "sweetalert2";
import AppointmentForm from "./components/AppointmentForm";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import AppointmentDetails from "./components/AppointmentDetails";
import {
  BaseCalendar,
  CalendarReportGenerator,
} from "../../../../../../../shared/components/Calendar";
import { useAppointments } from "./hooks/useAppointments";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";

const specialtyColors = {
  psicologia: "#EAB308",
  fisioterapia: "#22C55E",
  nutricion: "#3B82F6",
  medicina: "#EF4444",
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
  const canViewAppointments = hasPermission("appointmentManagement", "Ver") || true;
  const canCreateAppointments =
    hasPermission("appointmentManagement", "Crear") || true;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [initialSlot, setInitialSlot] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    specialty: "",
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
        id: "specialty",
        label: "Especialidad",
        field: "specialty",
        options: specialtyOptions,
      },
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
    [specialtyOptions, specialistFilterOptions]
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
      const backgroundColor =
        specialtyColors[appointment.specialty] || "#B595FF";

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
    if (!canCreateAppointments) return;
    setInitialSlot({ start: selectedDate });
    setIsCreateModalOpen(true);
  }, [canCreateAppointments]);

  const handleCreateSubmit = async (formValues) => {
    try {
      await createAppointment(formValues);
    } catch (error) {
      // errores manejados por el hook
    }
  };

  const handleCancelAppointment = useCallback(
    async (appointment) => {
      const { value: reason } = await Swal.fire({
        title: "Motivo de cancelación",
        input: "textarea",
        inputLabel: "Por favor, indique el motivo de la cancelación",
        inputPlaceholder: "Escribe el motivo aquí...",
        inputAttributes: {
          "aria-label": "Motivo de cancelación",
        },
        showCancelButton: true,
        confirmButtonText: "Cancelar cita",
        cancelButtonText: "Volver",
        customClass: {
          confirmButton:
            "bg-primary-purple text-white font-bold px-6 py-2 rounded-lg mr-2",
          cancelButton:
            "bg-primary-blue text-white font-bold px-6 py-2 rounded-lg",
        },
        buttonsStyling: false,
        inputValidator: (value) => {
          if (!value) {
            return "Debes ingresar un motivo";
          }
        },
      });

      if (reason) {
        try {
          await cancelAppointment(appointment.id, reason);
          handleCloseViewModal();
        } catch (error) {
          // errores manejados por el hook
        }
      }
    },
    [cancelAppointment, handleCloseViewModal],
  );

  const handleMarkAsCompleted = async (appointmentToComplete) => {
    const { value: conclusion } = await Swal.fire({
      title: "Conclusión de la Cita",
      input: "textarea",
      inputLabel: "Por favor, registre la conclusión o los resultados de la cita",
      inputPlaceholder: "Escribe la conclusión aquí...",
      inputAttributes: {
        "aria-label": "Conclusión de la cita",
      },
      showCancelButton: true,
      confirmButtonText: "Guardar y Completar",
      cancelButtonText: "Volver",
      customClass: {
        confirmButton:
          "bg-primary-purple text-white font-bold px-6 py-2 rounded-lg mr-2",
        cancelButton:
          "bg-primary-blue text-white font-bold px-6 py-2 rounded-lg",
      },
      buttonsStyling: false,
      inputValidator: (value) => {
        if (!value) {
          return "Debes ingresar una conclusión para completar la cita.";
        }
      },
    });

    if (conclusion) {
      try {
        await completeAppointment(appointmentToComplete.id, conclusion);
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

    const actions = [
      {
        label: "Ver",
        icon: Eye,
        onClick: () => handleSelectAppointment(event),
      },
      ...(isEditable
        ? [
            {
              label: "Editar",
              icon: PencilLine,
              onClick: () => handleEditAppointment(event),
            },
            {
              label: "Cancelar",
              icon: XCircle,
              onClick: () => handleCancelAppointment(event),
            },
            {
              label: "Completar",
              icon: CheckCircle2,
              onClick: () => handleMarkAsCompleted(event),
            },
          ]
        : []),
    ];

    return (
      <div
        className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition flex flex-col gap-3"
        onClick={() => handleSelectAppointment(event)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-wide">
              <CalendarClock className="h-4 w-4 text-[#B595FF]" />
              <span>{event.date || "Sin fecha"}</span>
              {event.time && <span>• {event.time}</span>}
            </div>
            <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
              {event.title}
            </h4>
            <div className="flex flex-wrap gap-2 text-[11px] text-gray-600">
              {event.athleteName && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100">
                  <UserRound className="h-3 w-3 text-[#B595FF]" />
                  {event.athleteName}
                </span>
              )}
              {event.specialistName && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100">
                  <Stethoscope className="h-3 w-3 text-[#9BE9FF]" />
                  {event.specialistName}
                </span>
              )}
              {event.specialtyLabel && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#F5F1FF] text-[#7C3AED]">
                  {event.specialtyLabel}
                </span>
              )}
            </div>
            {event.description && (
              <p className="text-xs text-gray-500 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyles}`}
          >
            {statusLabel}
          </span>
        </div>

        {actions.length > 0 && (
          <div className="flex gap-2 flex-wrap pt-2 border-t border-gray-100 mt-auto">
            {actions.map((action, actionIndex) => (
              <button
                key={actionIndex}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick(event);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors bg-gray-50 text-gray-700 hover:bg-[#9BE9FF] hover:text-white"
              >
                {action.icon && <action.icon className="h-3.5 w-3.5" />}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>
          <p className="text-gray-500 mt-1">
            Visualiza, crea y gestiona las citas
          </p>
        </div>

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
            {canCreateAppointments && (
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
              x
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

          {(selectedFilters.specialty ||
            selectedFilters.specialistId ||
            selectedFilters.status) && (
            <div className="mt-4">
              <button
                onClick={() =>
                  setSelectedFilters({
                    specialty: "",
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
        sidebarItemMinHeight="min-h-[190px]"
      />

      <AppointmentForm
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSave={handleCreateSubmit}
        initialData={initialSlot}
        athleteList={athletes}
        specialistList={specialists}
        sportsCategoryOptions={sportsCategories}
        specialtyOptions={specialtyOptions}
        loadingAthletes={loadingAthletes}
        loadingSpecialists={loadingSpecialists}
        loadingCategories={loadingCategories}
        defaultAthleteId={isAthleteScope ? athleteIdFromUser : ""}
        lockAthlete={isAthleteScope}
      />

      <AppointmentDetails
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        appointmentData={selectedAppointment}
        athleteList={athletes}
        specialtyOptions={specialtyOptions}
        onMarkAsCompleted={handleMarkAsCompleted}
        onCancelAppointment={handleCancelAppointment}
      />
    </div>
  );
}

export default Appointments;
