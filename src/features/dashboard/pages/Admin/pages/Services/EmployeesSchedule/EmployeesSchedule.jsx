import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Filter } from "lucide-react";
import { FaCalendarAlt, FaBriefcase, FaExclamationCircle } from "react-icons/fa";
import { format } from "date-fns";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import { showErrorAlert } from "../../../../../../../shared/utils/alerts";

// Importar TUS componentes (asegúrate de que las rutas sean correctas)
import ScheduleModal from "./components/EmployeesScheduleModal";
import ScheduleDetailsModal from "./components/ScheduleDetailsModal";
import CancelScheduleModal from "./components/CancelScheduleModal";
import { BaseCalendar, CalendarReportGenerator } from "../../../../../../../shared/components/Calendar";
import { useEmployeeSchedules } from "./hooks/useEmployeeSchedules";

// Importaciones para permisos
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";

const ROLE_COLORS = {
  entrenador: { from: "#effbf2", to: "#d9f3d7", dot: "#4ade80", tagBg: "rgba(199, 249, 204, 0.25)" },
  fisioterapia: { from: "#f5f3ff", to: "#e3deff", dot: "#8b5cf6", tagBg: "rgba(224, 215, 255, 0.3)" },
  nutricion: { from: "#f0fbff", to: "#d6f0ff", dot: "#38bdf8", tagBg: "rgba(209, 242, 255, 0.35)" },
  psicologia: { from: "#fff5fb", to: "#ffe1f0", dot: "#fb7185", tagBg: "rgba(252, 225, 243, 0.3)" },
  default: { from: "#f5f6ff", to: "#e3e8ff", dot: "#6366f1", tagBg: "rgba(229, 237, 255, 0.45)" },
};

const ROLE_LABELS = {
  entrenador: "Entrenador",
  fisioterapia: "Fisioterapeuta",
  nutricion: "Nutricionista",
  psicologia: "Psicologia",
};

const ROLE_ALIASES = {
  psicologa: "psicologia",
  psicologo: "psicologia",
  psicologia: "psicologia",
  fisioterapeuta: "fisioterapia",
  fisioterapia: "fisioterapia",
  nutricionista: "nutricion",
  nutricion: "nutricion",
  entrenador: "entrenador",
  admin: "",
  administrador: "",
  administradora: "",
};


const normalizeRole = (cargo = "") =>
  cargo
    .toLowerCase()
    .replace(/[\u00e1]/g, "a")
    .replace(/[\u00e9]/g, "e")
    .replace(/[\u00ed]/g, "i")
    .replace(/[\u00f3]/g, "o")
    .replace(/[\u00fa]/g, "u")
    .replace(/[^a-z0-9]/g, "")
    .trim();

const resolveRoleId = (cargo = "") => {
  const key = normalizeRole(cargo);
  return ROLE_ALIASES[key] !== undefined ? ROLE_ALIASES[key] : key;
};

const getRoleColors = (cargoOrId = "") => {
  const key = resolveRoleId(cargoOrId);
  if (!key) return ROLE_COLORS.default;
  return ROLE_COLORS[key] || ROLE_COLORS.default;
};

const scheduleHasNovedad = (schedule = {}) => {
  if (!schedule) return false;
  if (schedule.cancellationReason || schedule.motivoCancelacion) return true;
  if (schedule.novedad) return true;
  if (Array.isArray(schedule.novedades) && schedule.novedades.some(Boolean)) {
    return true;
  }
  return false;
};


const formatScheduleTime = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "HH:mm");
};

const toDateKey = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "yyyy-MM-dd");
};

const getScheduleStartDate = (schedule = {}) => {
  if (schedule.start) {
    return new Date(schedule.start);
  }
  const fecha = schedule.fecha || schedule.fechaInicio;
  const time = schedule.horaInicio || schedule.hora || "00:00";
  if (fecha) {
    return new Date(`${fecha}T${time}`);
  }
  return null;
};

const getScheduleDateKey = (schedule = {}) => {
  const startDate = getScheduleStartDate(schedule);
  if (startDate) {
    return toDateKey(startDate);
  }
  const dateRef =
    schedule.fecha ||
    schedule.fechaInicio ||
    schedule.scheduleDate ||
    null;
  return toDateKey(dateRef);
};

const getEmployeeKey = (schedule = {}) => {
  const raw =
    schedule.empleadoId ||
    schedule.employeeId ||
    schedule.empleado ||
    schedule.employee ||
    schedule.title ||
    "";
  return raw.toString().trim().toLowerCase();
};

const isSchedulePastEditWindow = (schedule = {}) => {
  const startDate = getScheduleStartDate(schedule);
  if (!startDate) return false;
  const lockDate = new Date(startDate);
  lockDate.setDate(lockDate.getDate() + 1); // 24h after the start date
  return new Date() >= lockDate;
};

const filterActionsForSchedule = (schedule = {}, actions = []) => {
  if (!Array.isArray(actions) || actions.length === 0) return [];
  if (!isSchedulePastEditWindow(schedule)) return actions;
  return actions.filter((action) => ["view", "delete"].includes(action.id));
};

const BASE_ROLE_FILTERS = [
  { id: "entrenador", label: ROLE_LABELS.entrenador },
  { id: "fisioterapia", label: ROLE_LABELS.fisioterapia },
  { id: "nutricion", label: ROLE_LABELS.nutricion },
  { id: "psicologia", label: ROLE_LABELS.psicologia },
];

const EmployeeSchedule = ({ disabled = false, initialSchedules = [] }) => {
  const { hasPermission } = usePermissions();
  const {
    schedules,
    rawSchedules,
    employees,
    loading,
    loadingEmployees,
    loadSchedules,
    loadEmployees,
    createSchedule,
    updateSchedule,
    deleteSchedule: removeSchedule,
    registerNovelty,
    isEmployeeScope,
    employeeIdFromUser,
  } = useEmployeeSchedules();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isNew, setIsNew] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    role: "",
  });
  const containerRef = useRef(null);
  const isLoading = loading || loadingEmployees;

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedScheduleForAction, setSelectedScheduleForAction] = useState(null);
  const canViewSchedules = useMemo(
    () => hasPermission("employeesSchedule", "Ver"),
    [hasPermission]
  );
  const canEditSchedules = useMemo(
    () => hasPermission("employeesSchedule", "Editar"),
    [hasPermission]
  );
  const canCreateSchedules = hasPermission("employeesSchedule", "Crear") || true;
  const canExportSchedules = hasPermission("employeesSchedule", "Ver") || true;

  const disabledSchedules = useMemo(
    () =>
      initialSchedules.map((s) => ({
        ...s,
        start: s.start instanceof Date ? s.start : new Date(s.start),
        end: s.end instanceof Date ? s.end : new Date(s.end),
      })),
    [initialSchedules]
  );

  const availableRoles = useMemo(() => {
    const map = new Map();
    BASE_ROLE_FILTERS.forEach((role) => map.set(role.id, ROLE_LABELS[role.id] || role.label));

    rawSchedules.forEach((item) => {
      const key = resolveRoleId(item?.cargo || item?.area || "");
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, ROLE_LABELS[key] || item.cargo || item.area || "Cargo");
      }
    });

    employees.forEach((emp) => {
      const key = resolveRoleId(emp?.cargo || "");
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, ROLE_LABELS[key] || emp.cargo || emp.label || "Cargo");
      }
    });

    return Array.from(map.entries()).map(([id, label]) => ({
      id,
      label: ROLE_LABELS[id] || label || id,
    }));
  }, [rawSchedules, employees]);

  const filters = useMemo(
    () =>
      isEmployeeScope
        ? [] // si es empleado, no mostramos filtros por cargo
        : [
            {
              id: "role",
              label: "Cargo",
              field: "roleId",
              options: availableRoles.map((role) => ({
                value: role.id,
                label: role.label,
              })),
            },
          ],
    [availableRoles, isEmployeeScope]
  );

  const hasFilters = filters.length > 0;

  useEffect(() => {
    if (disabled) return;
    loadEmployees();
  }, [disabled, loadEmployees]);

  useEffect(() => {
    if (disabled || !canViewSchedules) return;
    loadSchedules({ page: 1 });
  }, [disabled, canViewSchedules, loadSchedules]);


  const selfEmployee = useMemo(() => {
    if (!isEmployeeScope || !employeeIdFromUser) return null;
    return employees.find((e) => String(e.value) === String(employeeIdFromUser)) || null;
  }, [employees, isEmployeeScope, employeeIdFromUser]);

  const createDefaultSchedule = ({ start, end } = {}) => {
    const now = start ? new Date(start) : new Date();
    const defaultStart = start || now;
    const defaultEnd = end || new Date(now.getTime() + 60 * 60 * 1000);

    return {
      empleadoId: isEmployeeScope ? (selfEmployee?.value || employeeIdFromUser || "") : "",
      empleado: isEmployeeScope ? selfEmployee?.label || "" : "",
      cargo: isEmployeeScope ? selfEmployee?.cargo || "" : "",
      fecha: format(defaultStart, "yyyy-MM-dd"),
      horaInicio: format(defaultStart, "HH:mm"),
      horaFin: format(defaultEnd, "HH:mm"),
      area: "",
      repeticion: "no",
      customRecurrence: null,
      descripcion: "",
      observaciones: "",
      motivoCancelacion: "",
      id: null,
    };
  };

  const openModalForSlot = ({ start, end } = {}) => {
    setSelectedSchedule(createDefaultSchedule({ start, end }));
    setIsNew(true);
    setIsModalOpen(true);
  };

  const openModalForEvent = (event, { readOnly = false } = {}) => {
    const startDate = event.start
      ? new Date(event.start)
      : event.fecha
      ? new Date(`${event.fecha}T${event.horaInicio || "00:00"}`)
      : new Date();
    const endDate = event.end
      ? new Date(event.end)
      : event.fecha
      ? new Date(`${event.fecha}T${event.horaFin || event.horaInicio || "00:00"}`)
      : startDate;

    const payload = {
      id: event.scheduleId || event.id,
      empleadoId: event.empleadoId || event.employeeId || "",
      empleado: (event.empleado || event.title || "").replace(/^Turno\s*-\s*/i, ""),
      cargo: event.cargo || "",
      fecha: format(startDate, "yyyy-MM-dd"),
      horaInicio: format(startDate, "HH:mm"),
      horaFin: format(endDate, "HH:mm"),
      area: event.area || "",
      observaciones: event.observaciones || event.descripcion || "",
      descripcion: event.descripcion || event.observaciones || "",
      repeticion: event.repeticion || "no",
      customRecurrence: event.customRecurrence || null,
      motivoCancelacion: event.motivoCancelacion || "",
      _isReadOnly: readOnly || isSchedulePastEditWindow(event),
    };
    setSelectedSchedule(payload);
    setIsNew(false);
    setIsModalOpen(true);
  };

  const openDetailsModal = (schedule) => {
    if (!schedule) return;
    const scheduleData = {
      ...schedule,
      scheduleId: schedule.scheduleId || schedule.id,
      hora: `${schedule.horaInicio || format(schedule.start, "HH:mm")} - ${
        schedule.horaFin || format(schedule.end, "HH:mm")
      }`,
      recurrenceLabel: buildRecurrenceLabel(schedule),
      novedades: schedule.novedades || schedule.novedad || [],
      novedad: schedule.novedad || (Array.isArray(schedule.novedades) ? schedule.novedades[0] : ""),
    };
    setSelectedScheduleForAction(scheduleData);
    setShowDetailsModal(true);
  };

  const openCancelModal = (schedule) => {
    const scheduleObj =
      typeof schedule === "string" || typeof schedule === "number"
        ? schedules.find((s) => (s.scheduleId || s.id) === schedule)
        : schedule;
    if (!scheduleObj) return;
    const startTime =
      scheduleObj.horaInicio || formatScheduleTime(scheduleObj.start);
    const endTime = scheduleObj.horaFin || formatScheduleTime(scheduleObj.end);
    const timeLabel = scheduleObj.hora
      ? scheduleObj.hora
      : [startTime, endTime].filter(Boolean).join(" - ");
    const scheduleData = {
      ...scheduleObj,
      scheduleId: scheduleObj.scheduleId || scheduleObj.id,
      horaInicio: startTime,
      horaFin: endTime,
      hora: timeLabel,
    };
    setSelectedScheduleForAction(scheduleData);
    setShowCancelModal(true);
  };

  const handleSaveFromModal = async (form) => {
  const payload = {
    ...form,
    descripcion: form.descripcion || form.observaciones || "",
    observaciones: form.descripcion || form.observaciones || "",
  };

  const payloadEmployeeKey = (payload.empleadoId || payload.empleado || "")
    .toString()
    .trim()
    .toLowerCase();
  const payloadDateKey = payload.fecha || toDateKey(payload.start);

  if (payloadEmployeeKey && payloadDateKey) {
    const isConflict = schedules.some((schedule) => {
      const scheduleEmployeeKey = getEmployeeKey(schedule);
      if (!scheduleEmployeeKey || scheduleEmployeeKey !== payloadEmployeeKey) return false;
      const scheduleDateKey = getScheduleDateKey(schedule);
      if (!scheduleDateKey || scheduleDateKey !== payloadDateKey) return false;

      if (!isNew) {
        const scheduleId =
          (schedule.scheduleId || schedule.id || "").toString();
        const payloadId = (payload.id || "").toString();
        if (scheduleId && payloadId && scheduleId === payloadId) {
          return false;
        }
      }

      return true;
    });

    if (isConflict) {
      showErrorAlert(
        "Horario duplicado",
        "Ese empleado ya tiene un horario en ese día."
      );
      return;
    }
  }

  try {
    if (isNew) {
      await createSchedule(payload);
    } else if (form.id) {
        await updateSchedule(form.id, payload);
      }
      closeModal();
    } catch (error) {
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSchedule(null);
  };

  const handleDeleteSchedule = async (id) => {
    if (!id) return;
    try {
      const confirmDelete = await showErrorAlert(
        "¿Deseas eliminar este horario?",
        "Esta acción no se puede deshacer.",
        "warning",
        true
      );
      if (!confirmDelete.isConfirmed) return;
      await removeSchedule(id);
      closeModal();
    } catch (error) {
    }
  };

  const handleNovedadConfirm = async (scheduleWithReason) => {
    if (!scheduleWithReason) return;
    const payload =
      scheduleWithReason.cancelPayload ||
      { motivoCancelacion: scheduleWithReason.motivoCancelacion || "" };
    const payloadWithDate = {
      ...payload,
      fecha:
        scheduleWithReason.fecha ||
        scheduleWithReason.scheduleDate ||
        scheduleWithReason.start ||
        null,
    };
    try {
      await registerNovelty(
        scheduleWithReason.scheduleId || scheduleWithReason.id,
        payloadWithDate
      );
      setShowCancelModal(false);
      setSelectedScheduleForAction(null);
    } catch (error) {
      // Alertas gestionadas en el hook
    }
  };

  const buildRecurrenceLabel = (item) => {
    const rep = item?.repeticion || "no";
    const interval = item?.intervalo || item?.customRecurrence?.interval || 1;
    const endDate =
      item?.customRecurrence?.endDate || item?.customRecurrence?.afterDate || "";

    const base = {
      no: "No se repite",
      dia: interval > 1 ? `Cada ${interval} dias` : "Cada dia",
      semana: interval > 1 ? `Cada ${interval} semanas` : "Cada semana",
      mes: interval > 1 ? `Cada ${interval} meses` : "Cada mes",
      anio: interval > 1 ? `Cada ${interval} años` : "Cada año",
      laboral: "Lunes a viernes",
      personalizado:
        item?.customRecurrence?.label ||
        (interval > 1
          ? `Recurrencia personalizada (cada ${interval} intervalos)`
          : "Recurrencia personalizada"),
    }[rep] || "No se repite";

    return endDate ? `${base} · hasta ${endDate}` : base;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Mientras el modal está abierto (portal en body), ignoramos este listener
      if (isModalOpen) return;
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        // comportamiento previo: cerrar si hacían clic fuera del contenedor
        // closeModal(); // ya no es necesario para el modal portaled
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen]);

  const handleSearch = (event) => {
    const term = event?.target ? event.target.value : event;
    setSearchTerm(term);
  };

  const handleFiltersChange = (newFilters) => {
    setSelectedFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const disabledList =
    disabledSchedules.length > 0 ? disabledSchedules : schedules;

  const scheduleEvents = useMemo(() => {
    return schedules.map((schedule) => {
      const startDate = schedule.start || getScheduleStartDate(schedule);
      const date = schedule.fecha || (startDate ? format(startDate, "yyyy-MM-dd") : "");
      const timeLabel =
        schedule.horaInicio && schedule.horaFin
          ? `${schedule.horaInicio} - ${schedule.horaFin}`
          : schedule.hora || "";
      const roleKey = resolveRoleId(
        schedule.cargo || schedule.area || schedule.role || schedule.rol
      );
      const colors = getRoleColors(roleKey);
      const title = schedule.empleado
        ? `Turno - ${schedule.empleado}`
        : schedule.title || "Turno";

      return {
        id: schedule.scheduleId || schedule.id,
        scheduleId: schedule.scheduleId || schedule.id,
        title,
        date,
        time: timeLabel,
        start: startDate,
        end: schedule.end || null,
        fecha: schedule.fecha || date,
        horaInicio: schedule.horaInicio,
        horaFin: schedule.horaFin,
        roleId: roleKey,
        cargo: schedule.cargo,
        area: schedule.area,
        empleado: schedule.empleado,
        backgroundColor: colors.to,
        borderColor: colors.dot,
        extendedProps: schedule,
      };
    });
  }, [schedules]);

  const sidebarActions = useMemo(() => {
    const actions = [
      {
        id: "view",
        label: "Ver",
        onClick: (event) => openDetailsModal(event?.extendedProps || event),
        permission: { module: "employeesSchedule", action: "Ver" },
        variant: "primary",
      },
    ];

    if (hasPermission("employeesSchedule", "Editar")) {
      actions.push({
        id: "edit",
        label: "Editar",
        onClick: (event) =>
          openModalForEvent(event?.extendedProps || event, { readOnly: false }),
        permission: { module: "employeesSchedule", action: "Editar" },
        variant: "primary",
      });
      actions.push({
        id: "novelty",
        label: "Novedad",
        onClick: (event) => openCancelModal(event?.extendedProps || event),
        permission: { module: "employeesSchedule", action: "Editar" },
        variant: "warning",
      });
    }

    if (hasPermission("employeesSchedule", "Eliminar")) {
      actions.push({
        id: "delete",
        label: "Eliminar",
        onClick: (event) =>
          handleDeleteSchedule(
            event?.scheduleId || event?.id || event?.extendedProps?.id
          ),
        permission: { module: "employeesSchedule", action: "Eliminar" },
        variant: "danger",
      });
    }

    return actions;
  }, [hasPermission, openDetailsModal, openModalForEvent, openCancelModal, handleDeleteSchedule]);

  const renderEvent = (event, variant) => {
    if (variant === "grid") {
      return (
        <div
          className="p-1 rounded text-black text-xs cursor-pointer hover:opacity-80"
          style={{ backgroundColor: event.backgroundColor || "#B595FF" }}
        >
          <div className="font-medium truncate text-xs leading-tight">
            {event.title}
          </div>
        </div>
      );
    }
    return <span>{event.title}</span>;
  };

  const renderSidebarItem = (event, actions) => {
    const schedule = event?.extendedProps || event;
    const colors = getRoleColors(schedule.cargo || schedule.area);
    const recurrenceLabel = buildRecurrenceLabel(schedule);
    const visibleActions = filterActionsForSchedule(schedule, actions);

    return (
      <div className="space-y-2">
        <div>
          <div className="flex items-center gap-1">
            <h4 className="font-medium text-gray-800 text-sm">
              {schedule.empleado || event.title}
            </h4>
            {scheduleHasNovedad(schedule) && (
              <FaExclamationCircle
                className="text-red-500"
                title="Horario con novedad"
              />
            )}
          </div>
          <div className="space-y-1 text-xs text-gray-600 mt-1">
            {schedule.cargo && (
              <div className="flex items-center gap-1">
                <FaBriefcase className="h-3 w-3" />
                {schedule.cargo}
              </div>
            )}
            {schedule.area && (
              <div className="text-[11px] text-gray-600">
                Área: {schedule.area}
              </div>
            )}
            {event.time && (
              <div className="text-xs text-gray-600">
                {event.time}
              </div>
            )}
            <div className="text-xs text-gray-700">
              {recurrenceLabel}
            </div>
          </div>
        </div>

        {visibleActions.length > 0 && (
          <div className="flex gap-1 flex-wrap pt-2 border-t border-gray-100">
            {visibleActions.map((action, actionIndex) => (
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
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (disabled) {
    return (
      <div className="font-monserrat p-6">
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">
            Horario de Empleados
          </label>
          <div className="p-4 bg-gray-100 rounded-lg">
            {disabledList.length > 0 ? (
              <div className="space-y-3">
                {disabledList.map((schedule) => (
                  <motion.div
                    key={
                      schedule.scheduleId ||
                      schedule.id ||
                      `${schedule.empleado}-${schedule.fecha}-${schedule.horaInicio}`
                    }
                    layout
                    className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm"
                  >
                    <FaCalendarAlt className="text-[#c084fc]" />
                    <div className="flex-1">
                      <span className="font-medium">{schedule.empleado}</span>
                      {schedule.cargo && (
                        <span className="ml-2 text-sm text-gray-600">
                          ({schedule.cargo})
                        </span>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>{schedule.fecha}</span>
                        <span>
                          {schedule.horaInicio} - {schedule.horaFin}
                        </span>
                        {schedule.area && (
                          <span className="px-2 py-1 bg-purple-50 text-[#c084fc] text-xs rounded-full">
                            {schedule.area}
                          </span>
                        )}
                      </div>
                      {schedule.observaciones && (
                        <p className="text-xs mt-1 text-gray-700 line-clamp-2">
                          <span className="font-semibold">Descripción:</span>{" "}
                          {schedule.observaciones}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <span className="text-gray-500">No hay horarios programados</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-monserrat p-4" ref={containerRef}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Horario de Empleados</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="w-full sm:w-auto">
            <SearchInput
              placeholder="Buscar horarios..."
              value={searchTerm}
              onChange={handleSearch}
              className="min-w-[200px]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {canCreateSchedules && (
              <motion.button
                onClick={() => openModalForSlot(createDefaultSchedule())}
                className="flex items-center gap-2 px-4 py-2 bg-[#B595FF] text-white rounded-lg font-medium hover:bg-[#9BE9FF] transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-4 w-4" />
                <span>Crear</span>
              </motion.button>
            )}

            {hasFilters && (
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
            )}

            {canExportSchedules && (
              <CalendarReportGenerator
                events={scheduleEvents}
                title="Reportes"
                entityName="horarios"
                reportTypes={["pdf", "excel"]}
                showDateFilter={true}
                customFields={[
                  { key: "empleado", label: "Empleado" },
                  { key: "cargo", label: "Cargo" },
                  { key: "fecha", label: "Fecha" },
                  { key: "horaInicio", label: "Hora inicio" },
                  { key: "horaFin", label: "Hora fin" },
                ]}
              />
            )}
          </div>
        </div>
      </div>

      {hasFilters && showFilters && (
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
        </motion.div>
      )}

      <BaseCalendar
        variant="custom"
        events={scheduleEvents}
        loading={isLoading}
        onEventClick={
          canViewSchedules
            ? (event) => openDetailsModal(event?.extendedProps || event)
            : null
        }
        onCreate={
          canCreateSchedules ? () => openModalForSlot(createDefaultSchedule()) : null
        }
        onDateSelect={
          canCreateSchedules ? (day) => openModalForSlot({ start: day }) : null
        }
        renderEvent={renderEvent}
        renderSidebarItem={renderSidebarItem}
        title="Calendario de Horarios"
        showHeader={false}
        showCreateButton={false}
        showReportButton={false}
        showSearch={false}
        showFilters={false}
        createButtonText="Crear Horario"
        reportButtonText="Reportes de Horarios"
        searchTerm={searchTerm}
        searchPlaceholder="Buscar horarios..."
        searchFields={[
          "empleado",
          "cargo",
          "area",
          "descripcion",
          "observaciones",
        ]}
        filters={filters}
        selectedFilters={selectedFilters}
        onFiltersChange={hasFilters ? handleFiltersChange : undefined}
        viewTypes={["month", "week", "day"]}
        defaultView="month"
        sidebarTitle="Horarios Programados"
        sidebarEmptyText="No hay horarios programados"
        sidebarActions={sidebarActions}
        colorScheme="schedule"
        className="employees-schedule-calendar"
      />
      <AnimatePresence>
        {isModalOpen && (
          <ScheduleModal
            schedule={selectedSchedule}
            isNew={isNew}
            isReadOnly={selectedSchedule?._isReadOnly}
            lockEmployeeSelection={isEmployeeScope}
            onClose={closeModal}
            onSave={handleSaveFromModal}
            employeesOptions={employees}
            existingSchedules={schedules}
            isLoadingEmployees={loadingEmployees}
          />
        )}
      </AnimatePresence>

      <ScheduleDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        employee={selectedScheduleForAction}
      />

      <CancelScheduleModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedScheduleForAction(null);
        }}
        onConfirm={handleNovedadConfirm}
        employee={selectedScheduleForAction}
      />
    </div>
  );
};

export default EmployeeSchedule;




