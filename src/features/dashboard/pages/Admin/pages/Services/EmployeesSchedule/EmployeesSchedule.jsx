import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaCalendarAlt, FaBriefcase, FaExclamationCircle } from "react-icons/fa";
import { format } from "date-fns";
import { showErrorAlert } from "../../../../../../../shared/utils/alerts";

// Importar TUS componentes (asegúrate de que las rutas sean correctas)
import EmployeesScheduleCalendar from "./components/EmployeesScheduleCalendar";
import ScheduleModal from "./components/EmployeesScheduleModal";
import EmployeeScheduleReportGenerator from "./components/EmployeeScheduleReportGenerator";
import ScheduleDetailsModal from "./components/ScheduleDetailsModal";
import CancelScheduleModal from "./components/CancelScheduleModal";
import { useEmployeeSchedules } from "./hooks/useEmployeeSchedules";

// Importaciones para permisos
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard";
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

const NOVELTY_STORAGE_KEY = "employee-schedule-novelties";

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
  } = useEmployeeSchedules();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isNew, setIsNew] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const containerRef = useRef(null);
  const isLoading = loading || loadingEmployees;
  const selectedRoleSet = useMemo(() => new Set(selectedRoles), [selectedRoles]);
  const matchesSelectedRole = useCallback(
    (item = {}) => {
      if (selectedRoleSet.size === 0) return true;
      const key = resolveRoleId(item.cargo || item.area || item.role || item.rol || "");
      if (!key) return false;
      return selectedRoleSet.has(key);
    },
    [selectedRoleSet]
  );
  const filteredListSchedules = useMemo(
    () => rawSchedules.filter(matchesSelectedRole),
    [rawSchedules, matchesSelectedRole]
  );
  const filteredCalendarSchedules = useMemo(
    () => schedules.filter(matchesSelectedRole),
    [schedules, matchesSelectedRole]
  );

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedScheduleForAction, setSelectedScheduleForAction] = useState(null);
  const [noveltyKeys, setNoveltyKeys] = useState(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = window.localStorage.getItem(NOVELTY_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      return new Set();
    }
  });
  const canViewSchedules = useMemo(
    () => hasPermission("employeesSchedule", "Ver"),
    [hasPermission]
  );
  const canEditSchedules = useMemo(
    () => hasPermission("employeesSchedule", "Editar"),
    [hasPermission]
  );

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

  useEffect(() => {
    if (disabled) return;
    loadEmployees();
  }, [disabled, loadEmployees]);

  useEffect(() => {
    if (disabled || !canViewSchedules) return;
    loadSchedules({ page: 1 });
  }, [disabled, canViewSchedules, loadSchedules]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      NOVELTY_STORAGE_KEY,
      JSON.stringify([...noveltyKeys])
    );
  }, [noveltyKeys]);

  const createDefaultSchedule = ({ start, end } = {}) => {
    const now = start ? new Date(start) : new Date();
    const defaultStart = start || now;
    const defaultEnd = end || new Date(now.getTime() + 60 * 60 * 1000);

    return {
      empleadoId: "",
      empleado: "",
      cargo: "",
      fecha: format(defaultStart, "yyyy-MM-dd"),
      horaInicio: format(defaultStart, "HH:mm"),
      horaFin: format(defaultEnd, "HH:mm"),
      area: "",
      estado: "Programado",
      repeticion: "no",
      customRecurrence: null,
      descripcion: "",
      observaciones: "",
      motivoCancelacion: "",
      id: null,
    };
  };

  const noveltyKeyForSchedule = (schedule = {}) => {
    const id = schedule.scheduleId || schedule.id;
    const dateKey = getScheduleDateKey(schedule);
    if (!id || !dateKey) return "";
    return `${id}::${dateKey}`;
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
      estado: event.estado || "Programado",
      observaciones: event.observaciones || event.descripcion || "",
      descripcion: event.descripcion || event.observaciones || "",
      repeticion: event.repeticion || "no",
      customRecurrence: event.customRecurrence || null,
      motivoCancelacion: event.motivoCancelacion || "",
      _isReadOnly: readOnly,
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
    const noveltyKey = noveltyKeyForSchedule(scheduleWithReason);
    try {
      await registerNovelty(
        scheduleWithReason.scheduleId || scheduleWithReason.id,
        payload
      );
      if (noveltyKey) {
        setNoveltyKeys((prev) => {
          const next = new Set(prev);
          next.add(noveltyKey);
          return next;
        });
      }
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
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        if (isModalOpen) closeModal();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen]);

  const handleToggleRole = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const clearRoleFilters = () => setSelectedRoles([]);

  const disabledList =
    disabledSchedules.length > 0 ? disabledSchedules : schedules;

  const listSchedules = useMemo(() => {
    const map = new Map();

    const getDateValue = (item) => {
      const dateRef = item?.fecha || item?.start || item?.scheduleDate || 0;
      const dateObj = new Date(dateRef);
      const value = dateObj.getTime();
      return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
    };

    filteredListSchedules.forEach((s) => {
      const key =
        s?.recurrenceGroup ||
        s?.parentId ||
        s?.scheduleId ||
        s?.id ||
        `${s?.empleadoId || s?.empleado}-${s?.horaInicio || ""}-${s?.horaFin || ""}-${s?.area || ""}-${s?.repeticion || "no"}`;

      if (!map.has(key)) {
        map.set(key, s);
        return;
      }

      const currentValue = getDateValue(s);
      const existing = map.get(key);
      const existingValue = getDateValue(existing);

      if (currentValue < existingValue) {
        map.set(key, s);
      }
    });

    return Array.from(map.values());
  }, [filteredListSchedules]);

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
                    key={schedule.scheduleId || schedule.id || `${schedule.empleado}-${schedule.fecha}-${schedule.horaInicio}`}
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
    <div className="font-monserrat p-4" ref={containerRef}>
      <div className="schedule-header space-y-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Horario de Empleados
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                Filtra los horarios agrupados por cargo y haz clic sobre un horario para ver los detalles.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-end">
              {isLoading && (
                <span className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                  Cargando...
                </span>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <PermissionGuard module="employeesSchedule" action="Crear">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openModalForSlot(createDefaultSchedule())}
                    className="flex items-center gap-1 px-4 py-2 text-sm bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors font-medium"
                  >
                    <FaPlus className="text-xs" />
                    Crear
                  </motion.button>
                </PermissionGuard>
                <PermissionGuard module="employeesSchedule" action="Ver">
                  <EmployeeScheduleReportGenerator
                    className="text-sm"
                    data={listSchedules}
                    columns={[
                      { key: "empleado", label: "Empleado" },
                      { key: "cargo", label: "Cargo" },
                      { key: "fecha", label: "Fecha" },
                      { key: "horaInicio", label: "Hora inicio" },
                      { key: "horaFin", label: "Hora fin" },
                      { key: "estado", label: "Estado" },
                    ]}
                  />
                </PermissionGuard>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 mr-1">Cargos:</span>
            {availableRoles.map((role) => {
              const colors = getRoleColors(role.id);
              const isActive = selectedRoles.includes(role.id);
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleToggleRole(role.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-1"
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${colors.from}, ${colors.to})`
                      : colors.tagBg,
                    borderColor: colors.dot,
                    color: "#1f2937",
                  }}
                  aria-pressed={isActive}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: colors.dot }}
                  />
                  {role.label}
                </button>
              );
            })}

            {selectedRoles.length > 0 && (
              <button
                type="button"
                onClick={clearRoleFilters}
                className="text-xs font-semibold text-gray-600 px-3 py-1 rounded-full border border-gray-200 hover:bg-gray-100 transition"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          <span className="w-3 h-3 border-2 border-gray-300 border-t-[#c084fc] rounded-full animate-spin" />
          <span>Cargando horarios y empleados...</span>
        </div>
      )}

        <div className="schedule-content">
          <div
            className="order-1 xl:order-1 flex-1 min-w-0 w-full bg-white rounded-2xl shadow-lg p-4 border border-gray-200 calendar-area"
          >
              <EmployeesScheduleCalendar
                schedules={filteredCalendarSchedules}
                onOpenModalForSlot={hasPermission('employeesSchedule', 'Crear') ? openModalForSlot : null}
                onOpenModalForEvent={hasPermission('employeesSchedule', 'Ver') ? (event) => openModalForEvent(event, { readOnly: !hasPermission('employeesSchedule', 'Editar') }) : null}
                onEditEvent={hasPermission('employeesSchedule', 'Editar') ? (event) => openModalForEvent(event, { readOnly: false }) : null}
                onViewEvent={hasPermission('employeesSchedule', 'Ver') ? (event) => openDetailsModal(event) : null}
                onDeleteEvent={hasPermission('employeesSchedule', 'Eliminar') ? handleDeleteSchedule : null}
                onCancelEvent={hasPermission('employeesSchedule', 'Editar') ? openCancelModal : null}
                noveltyKeys={noveltyKeys}
              />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="order-2 xl:order-2 w-full xl:max-w-[360px] xl:min-w-[290px] bg-white rounded-2xl shadow-lg p-4 border border-gray-100 flex-shrink-0 sticky top-4 self-start activity-panel"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-lg font-semibold text-[#c084fc]">Actividades Programadas</h2>
            <span className="text-xs font-semibold text-gray-600 px-2 py-1 rounded-full bg-gray-100">
              {listSchedules.length} registros
            </span>
          </div>
          {listSchedules.length > 0 ? (
            <ul className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 pb-1 activity-list">
              {listSchedules.map((schedule) => {
                const hasNovedadBadge = scheduleHasNovedad(schedule);
                const colors = getRoleColors(schedule.cargo || schedule.area);
                const recurrenceLabel = buildRecurrenceLabel(schedule);
                const displayStatus =
                  schedule.estado === "Cancelado"
                    ? "Programado"
                    : schedule.estado;
                const statusColor =
                  displayStatus === "Completado"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-blue-100 text-blue-700";
                const dateLabel = schedule.fecha || schedule.start?.toLocaleDateString?.() || "";
                const timeLabel =
                  schedule.horaInicio && schedule.horaFin
                    ? `${schedule.horaInicio} - ${schedule.horaFin}`
                    : schedule.hora;

                return (
                  <motion.li
                    key={
                      schedule.scheduleId ||
                      schedule.id ||
                      `${schedule.empleado}-${schedule.fecha}-${schedule.horaInicio}`
                    }
                    whileHover={{ scale: 1.01 }}
                    className="activity-card"
                    style={{
                      borderColor: colors.dot,
                      background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                    }}
                    onClick={() => openDetailsModal(schedule)}
                  >
                    <div className="activity-card__header">
                      <div className="flex items-center gap-1">
                        <h3 className="text-sm font-bold text-gray-900">
                          {schedule.empleado || "Sin nombre"}
                        </h3>
                        {hasNovedadBadge && (
                          <FaExclamationCircle
                            className="text-red-500"
                            title="Horario con novedad"
                          />
                        )}
                      </div>
                      <p className="text-xs text-gray-700 flex flex-wrap gap-2 mt-1">
                        {schedule.cargo && (
                          <span className="badge" style={{ borderColor: colors.dot }}>
                            <FaBriefcase className="inline-block mr-1" />
                            {schedule.cargo}
                          </span>
                        )}
                        {schedule.area && <span className="text-[11px]">Área: {schedule.area}</span>}
                      </p>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${statusColor}`}
                      >
                        {displayStatus}
                      </span>
                    </div>

                    <div className="activity-card__body">
                      <div className="activity-card__row">
                        <span className="text-[11px] text-gray-800">Fecha</span>
                        <span className="font-semibold text-xs">{dateLabel || "Sin fecha"}</span>
                      </div>
                      {timeLabel && (
                        <div className="activity-card__row">
                          <span className="text-[11px] text-gray-800">Horario</span>
                          <span className="font-semibold text-xs">{timeLabel}</span>
                        </div>
                      )}
                      <div className="activity-card__row">
                        <span className="text-[11px] text-gray-800">Repetición</span>
                        <span className="text-xs text-gray-700" title={`Repite: ${recurrenceLabel}`}>
                          {recurrenceLabel}
                        </span>
                      </div>
                      {schedule.observaciones && (
                        <p className="text-[11px] text-gray-800 line-clamp-3 mt-1">
                          {schedule.observaciones}
                        </p>
                      )}
                      {(schedule.novedad || (Array.isArray(schedule.novedades) && schedule.novedades.length > 0)) && (
                        <div className="text-[11px] text-gray-700 mt-1">
                          <span className="font-semibold">Novedades:</span>{" "}
                          {(Array.isArray(schedule.novedades) ? schedule.novedades : [schedule.novedad])
                            .filter(Boolean)
                            .map((item, idx) => (
                              <span key={item + idx} className="block">
                                {item}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>

                  </motion.li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500 text-center text-sm">
              No hay actividades registradas.
            </p>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10"
            >
              <ScheduleModal
                schedule={selectedSchedule}
                isNew={isNew}
                isReadOnly={selectedSchedule?._isReadOnly}
                onClose={closeModal}
                onSave={handleSaveFromModal}
                employeesOptions={employees}
                existingSchedules={schedules}
                isLoadingEmployees={loadingEmployees}
              />
            </motion.div>
          </motion.div>
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
