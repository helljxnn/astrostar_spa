import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useAuth } from "../../../../../../../../shared/contexts/authContext";
import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isAfter,
  format,
  differenceInCalendarDays,
  differenceInCalendarWeeks,
} from "date-fns";

import scheduleService from "../services/employeeScheduleService";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../../../../../../../shared/utils/alerts";

/* -------------------------------------------------------
 * CONSTANTES
 * -----------------------------------------------------*/
const CANCEL_TYPES = {
  FULL_DAY: "full",
  TIME_RANGE: "time",
};

/* -------------------------------------------------------
 * UTILS
 * -----------------------------------------------------*/
const parseCustomRecurrence = (raw) => {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn("No se pudo parsear customRecurrence", err);
    return null;
  }
};

const toDateKey = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "yyyy-MM-dd");
};

const normalizeTime = (value) => {
  if (!value) return null;
  const match = String(value).match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;
  const hours = String(match[1]).padStart(2, "0");
  const minutes = String(match[2]).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const parseTimeRange = (value) => {
  if (!value) return null;
  const match = String(value).match(/([01]?\d|2[0-3]):([0-5]\d)\s*-\s*([01]?\d|2[0-3]):([0-5]\d)/);
  if (!match) return null;
  const startTime = normalizeTime(`${match[1]}:${match[2]}`);
  const endTime = normalizeTime(`${match[3]}:${match[4]}`);
  if (!startTime || !endTime) return null;
  return { startTime, endTime };
};

const normalizeNoveltyFromApi = (novelty, fallbackDate) => {
  if (!novelty) return null;
  const dateKey = toDateKey(novelty.date || novelty.fecha || fallbackDate);
  if (!dateKey) return null;

  const rawType = String(novelty.type || novelty.tipoCancelacion || "").toLowerCase();
  const type = rawType === "time" ? "time" : "full";

  let startTime = normalizeTime(novelty.startTime || novelty.horaInicio || "");
  let endTime = normalizeTime(novelty.endTime || novelty.horaFin || "");

  if (!startTime || !endTime) {
    const parsed = parseTimeRange(novelty.tiempoCancelacion || novelty.timeRange || "");
    if (parsed) {
      startTime = parsed.startTime;
      endTime = parsed.endTime;
    }
  }

  const reason =
    novelty.reason ||
    novelty.motivoCancelacion ||
    novelty.explicacionTiempo ||
    novelty.descripcion ||
    "";

  return {
    id: novelty.id,
    date: dateKey,
    type,
    startTime,
    endTime,
    reason: reason ? String(reason).trim() : "",
  };
};

const getNoveltiesForDate = (schedule, dateKey) => {
  const novelties = Array.isArray(schedule?.novelties) ? schedule.novelties : [];
  return novelties.filter((novelty) => novelty?.date === dateKey);
};

/* -------------------------------------------------------
 * NORMALIZACIÓN DE DATOS
 * -----------------------------------------------------*/
  const normalizeScheduleFromApi = (apiSchedule, employeeMap = {}) => {
  const employeeData = apiSchedule.employee || {};
  const user = employeeData.user || {};

  const name =
    apiSchedule.empleado ||
    `${user.firstName || ""} ${user.middleName || ""} ${user.lastName || ""} ${
      user.secondLastName || ""
    }`
      .replace(/\s+/g, " ")
      .trim();

  const cargo =
    apiSchedule.cargo ||
    employeeMap[apiSchedule.employeeId]?.cargo ||
    user.role?.name ||
    "Empleado";

  const fechaBase = apiSchedule.scheduleDate || apiSchedule.fecha;
  const fecha = fechaBase
    ? format(new Date(fechaBase), "yyyy-MM-dd")
    : apiSchedule.fecha || "";

  const horaInicio = apiSchedule.startTime || apiSchedule.horaInicio || "";
  const horaFin = apiSchedule.endTime || apiSchedule.horaFin || "";

  const start = fecha ? new Date(`${fecha}T${horaInicio}`) : null;
  const end = fecha ? new Date(`${fecha}T${horaFin}`) : null;

  const normalizeText = (value) =>
    value ? String(value).trim().replace(/\s+/g, " ") : "";

  const cancelPayloadRaw =
    apiSchedule.cancelPayload
      ? { ...apiSchedule.cancelPayload }
      : apiSchedule.tipoCancelacion ||
        apiSchedule.tiempoCancelacion ||
        apiSchedule.explicacionTiempo
      ? {
          tipoCancelacion: apiSchedule.tipoCancelacion,
          tiempoCancelacion: apiSchedule.tiempoCancelacion,
          explicacionTiempo: apiSchedule.explicacionTiempo,
        }
      : null;

  const cancellationReason = normalizeText(
    cancelPayloadRaw?.motivoCancelacion ||
      apiSchedule.cancellationReason ||
      apiSchedule.motivoCancelacion ||
      ""
  );

  const rawNovelties =
    apiSchedule.novelties ||
    apiSchedule.novedadesDetalle ||
    apiSchedule.novedadesDetalleHorario ||
    [];
  const noveltiesList = Array.isArray(rawNovelties)
    ? rawNovelties
    : [rawNovelties];
  const novelties = noveltiesList
    .map((item) => normalizeNoveltyFromApi(item, fecha))
    .filter(Boolean);

  if (cancelPayloadRaw) {
    cancelPayloadRaw.motivoCancelacion = cancellationReason;
  }

  const hasTimeWindow =
    Boolean(cancelPayloadRaw?.tiempoCancelacion) ||
    Boolean(apiSchedule.tiempoCancelacion) ||
    Boolean(cancelPayloadRaw?.explicacionTiempo) ||
    Boolean(apiSchedule.explicacionTiempo);

  const cancelType =
    cancelPayloadRaw?.tipoCancelacion ||
    apiSchedule.tipoCancelacion ||
    (hasTimeWindow ? CANCEL_TYPES.TIME_RANGE : CANCEL_TYPES.FULL_DAY);

  const collectNovedades = [];
  if (apiSchedule.news) {
    if (Array.isArray(apiSchedule.news)) {
      collectNovedades.push(...apiSchedule.news);
    } else {
      collectNovedades.push(apiSchedule.news);
    }
  }

  if (apiSchedule.novedades) {
    if (Array.isArray(apiSchedule.novedades)) {
      collectNovedades.push(...apiSchedule.novedades);
    } else {
      collectNovedades.push(apiSchedule.novedades);
    }
  }

  if (apiSchedule.novedad) {
    collectNovedades.push(apiSchedule.novedad);
  }

  if (cancellationReason) {
    collectNovedades.unshift(cancellationReason);
  }

  const cleanedNovedades = [
    ...new Set(collectNovedades.map(normalizeText).filter(Boolean)),
  ];
  const primaryNovedad = cleanedNovedades[0] || "";

  return {
    id: apiSchedule.id,
    scheduleId: apiSchedule.id,
    empleadoId: apiSchedule.employeeId || apiSchedule.empleadoId,
    empleado: name,
    cargo,
    fecha,
    horaInicio,
    horaFin,
    repeticion: apiSchedule.recurrence || apiSchedule.repeticion || "no",
    customRecurrence: parseCustomRecurrence(apiSchedule.customRecurrence),
    descripcion: apiSchedule.description || apiSchedule.descripcion || "",
    observaciones: apiSchedule.description || apiSchedule.descripcion || "",
    novedad: primaryNovedad,
    novedades: cleanedNovedades,
    novelties,
    motivoCancelacion: cancellationReason,
    tipoCancelacion: cancelType,
    tiempoCancelacion:
      cancelPayloadRaw?.tiempoCancelacion || apiSchedule.tiempoCancelacion || "",
    explicacionTiempo:
      cancelPayloadRaw?.explicacionTiempo || apiSchedule.explicacionTiempo || "",
    cancelPayload: cancelPayloadRaw || null,
    start,
    end,
    title: `Turno - ${name}`,
  };
};

/* -------------------------------------------------------
 * EXPANSIÓN DE OCURRENCIAS
 * -----------------------------------------------------*/
const buildOccurrence = (schedule, date, occurrenceIndex) => {
  const dateStr = format(date, "yyyy-MM-dd");
  const start = new Date(`${dateStr}T${schedule.horaInicio}`);
  const end = new Date(`${dateStr}T${schedule.horaFin}`);

  const noveltiesForDate = getNoveltiesForDate(schedule, dateStr);
  const noveltyReasons = noveltiesForDate
    .map((novelty) => novelty?.reason)
    .filter(Boolean);
  const legacyReasons = Array.isArray(schedule.novedades)
    ? schedule.novedades
    : schedule.novedad
    ? [schedule.novedad]
    : [];
  const finalReasons = noveltyReasons.length > 0 ? noveltyReasons : legacyReasons;
  const primaryNovedad = finalReasons[0] || "";
  const timeNovelty = noveltiesForDate.find(
    (novelty) => novelty?.type === "time" && novelty?.startTime && novelty?.endTime
  );
  const fullNovelty = noveltiesForDate.find((novelty) => novelty?.type === "full");
  return {
    ...schedule,
    fecha: dateStr,
    start,
    end,
    id: `${schedule.id}-${occurrenceIndex}`,
    scheduleId: schedule.id,
    occurrenceIndex,
    title: `Turno - ${schedule.empleado}`,
    novedad: primaryNovedad,
    novedades: finalReasons,
    tipoCancelacion: fullNovelty ? "full" : timeNovelty ? "time" : schedule.tipoCancelacion,
    tiempoCancelacion: timeNovelty
      ? `${timeNovelty.startTime} - ${timeNovelty.endTime}`
      : schedule.tiempoCancelacion,
    explicacionTiempo: timeNovelty?.reason || schedule.explicacionTiempo,
    noveltiesForDate,
  };
};

const expandCustomRecurrence = (schedule, startDate, limitDate) => {
  const { dias = [], interval = 1, frequency = "semana" } =
    schedule.customRecurrence || {};

  const events = [];
  let idx = 0;

  events.push(buildOccurrence(schedule, startDate, idx++));

  // Si se seleccionaron días específicos
  if (dias.length > 0) {
    let walker = startDate;

    while (!isAfter(walker, limitDate) && events.length < 120) {
      walker = addDays(walker, 1);
      if (isAfter(walker, limitDate)) break;

      const day = walker.getDay();
      const daysDiff = differenceInCalendarDays(walker, startDate);
      const weeksDiff = differenceInCalendarWeeks(walker, startDate);

      if (frequency === "dia" && daysDiff % interval !== 0) continue;
      if (frequency === "semana" && weeksDiff % interval !== 0) continue;

      if ((frequency === "mes" || frequency === "anio") && daysDiff % 7 !== 0) {
        continue;
      }

      if (dias.includes(day)) {
        events.push(buildOccurrence(schedule, walker, idx++));
      }
    }
    return events;
  }

  // Sin días específicos
  const stepMap = {
    dia: addDays,
    semana: addWeeks,
    mes: addMonths,
    anio: addYears,
    año: addYears,
  };

  const stepFn = stepMap[frequency] || addWeeks;

  let cursor = startDate;
  while (events.length < 120) {
    cursor = stepFn(cursor, interval);
    if (isAfter(cursor, limitDate)) break;
    events.push(buildOccurrence(schedule, cursor, idx++));
  }

  return events;
};

const expandScheduleOccurrences = (schedule) => {
  if (!schedule.fecha || !schedule.horaInicio || !schedule.horaFin) return [];

  const baseDate = new Date(`${schedule.fecha}T00:00:00`);

  let limitDate = schedule.customRecurrence?.endDate
    ? new Date(schedule.customRecurrence.endDate)
    : schedule.customRecurrence?.afterDate
    ? new Date(schedule.customRecurrence.afterDate)
    : addMonths(baseDate, 2);

  const hardLimit = addMonths(baseDate, 6);
  if (isAfter(limitDate, hardLimit)) limitDate = hardLimit;

  const events = [];
  let idx = 0;

  events.push(buildOccurrence(schedule, baseDate, idx++));

  const intervalo = schedule.intervalo || 1;

  switch (schedule.repeticion) {
    case "dia":
      for (let d = addDays(baseDate, intervalo); !isAfter(d, limitDate); d = addDays(d, intervalo)) {
        events.push(buildOccurrence(schedule, d, idx++));
      }
      break;

    case "semana":
      for (let w = addWeeks(baseDate, intervalo); !isAfter(w, limitDate); w = addWeeks(w, intervalo)) {
        events.push(buildOccurrence(schedule, w, idx++));
      }
      break;

    case "mes":
      for (let m = addMonths(baseDate, intervalo); !isAfter(m, limitDate); m = addMonths(m, intervalo)) {
        events.push(buildOccurrence(schedule, m, idx++));
      }
      break;

    case "anio":
      for (let y = addYears(baseDate, intervalo); !isAfter(y, limitDate); y = addYears(y, intervalo)) {
        events.push(buildOccurrence(schedule, y, idx++));
      }
      break;

    case "laboral": {
      let cursor = baseDate;
      while (true) {
        cursor = addDays(cursor, 1);
        if (isAfter(cursor, limitDate)) break;
        const day = cursor.getDay();
        if (day >= 1 && day <= 5) events.push(buildOccurrence(schedule, cursor, idx++));
      }
      break;
    }

    case "personalizado":
      return expandCustomRecurrence(schedule, baseDate, limitDate);

    default:
      break;
  }

  return events;
};

/* -------------------------------------------------------
 * HOOK PRINCIPAL
 * -----------------------------------------------------*/
export const useEmployeeSchedules = () => {
  /* ---------- Estados ---------- */
  const [rawSchedules, setRawSchedules] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const paginationRef = useRef({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const [pagination, setPagination] = useState(paginationRef.current);

  /* ---------- Usuario actual ---------- */
  const { user } = useAuth();
  const employeeIdFromUser = useMemo(
    () =>
      user?.employeeId ||
      user?.empleadoId ||
      user?.employee?.id ||
      user?.employee?.empleadoId ||
      null,
    [user]
  );

  const isAdminUser = useMemo(() => {
    const roleName = (user?.role?.name || user?.rol || user?.role || "").toString().toLowerCase();
    return roleName === "admin" || roleName === "administrador";
  }, [user]);

  // Consideramos empleado a cualquier usuario NO admin que tenga employeeId asociado
  const isEmployeeScope = useMemo(
    () => !isAdminUser && Boolean(employeeIdFromUser),
    [isAdminUser, employeeIdFromUser]
  );

  /* ---------- Memo: Mapa de empleados ---------- */
  const employeeMap = useMemo(() => {
    const map = {};
    employees.forEach((emp) => (map[emp.value] = emp));
    return map;
  }, [employees]);

  /* ---------- Helpers ---------- */
  const mergeEmployeeData = useCallback(
    (schedule) => {
      const employeeInfo = employeeMap[schedule.empleadoId] || {};
      return {
        ...schedule,
        empleado: schedule.empleado || employeeInfo.label,
        cargo: schedule.cargo || employeeInfo.cargo,
      };
    },
    [employeeMap]
  );

  const buildFromApi = useCallback(
    (items = []) => items.map((item) => normalizeScheduleFromApi(item, employeeMap)),
    [employeeMap]
  );

  /* ---------- Expandir eventos con recurrencia ---------- */
  useEffect(() => {
    const intervalId = setInterval(() => {
      setRefreshTick((tick) => tick + 1);
    }, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const expanded = rawSchedules.flatMap((schedule) =>
      expandScheduleOccurrences(mergeEmployeeData(schedule))
    );

    // Deduplicar por horario/fecha/hora para evitar repeticiones exactas
    const unique = new Map();
    expanded.forEach((ev) => {
      const key = `${ev.scheduleId || ev.id}-${ev.fecha}-${ev.horaInicio || ""}-${ev.horaFin || ""}`;
      if (!unique.has(key)) unique.set(key, ev);
    });

    setSchedules(Array.from(unique.values()));
  }, [rawSchedules, mergeEmployeeData, refreshTick]);

/* -------------------------------------------------------
   * CARGA DE EMPLEADOS
   * -----------------------------------------------------*/
  const loadEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    try {
      const response = await scheduleService.getActiveEmployees();

      const rawList =
        response?.data ||
        response?.employees ||
        response?.data?.items ||
        [];

      const list = rawList.filter(Boolean);

      const formatted = list.map((emp) => {
        const fullName = emp.nombre || emp.label || emp.name || "Empleado sin nombre";
        const cargo = emp.cargo || "Empleado";
        return {
          value: emp.empleadoId || emp.id,
          label: fullName,
          cargo,
        };
      });

      const filtered = isEmployeeScope && employeeIdFromUser
        ? formatted.filter((emp) => String(emp.value) === String(employeeIdFromUser))
        : formatted;

      setEmployees(filtered);
    } catch (error) {
      console.error(error);
      showErrorAlert("Error", "No se pudieron cargar los empleados activos");
    } finally {
      setLoadingEmployees(false);
    }
  }, [isEmployeeScope, employeeIdFromUser]);

/* (resto sin cambios) */
  /* -------------------------------------------------------
   * CARGA DE HORARIOS
   * -----------------------------------------------------*/
  const loadSchedules = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        const page = params.page ?? paginationRef.current.page;
        const limit = params.limit ?? paginationRef.current.limit;

        const response = await scheduleService.getAll({
          page,
          limit,
          ...(isEmployeeScope && employeeIdFromUser ? { employeeId: employeeIdFromUser } : {}),
          ...params,
        });

        if (!response?.success) {
          throw new Error(response?.message || "No se pudieron cargar horarios");
        }

        const items =
          response?.data ||
          response?.schedules ||
          response?.data?.items ||
          [];

        setRawSchedules(buildFromApi(items));

        setPagination((prev) => {
          const next =
            response.pagination ||
            response?.data?.pagination || {
              ...prev,
              page,
              limit,
              total: items.length ?? prev.total,
              pages: Math.ceil((items.length ?? prev.total) / limit) || prev.pages,
            };

          paginationRef.current = next;
          return next;
        });
      } catch (error) {
        console.error(error);
        showErrorAlert("Error", error.message || "No se pudieron cargar horarios");
      } finally {
        setLoading(false);
      }
    },
    [buildFromApi, isEmployeeScope, employeeIdFromUser]
  );

      

  /* -------------------------------------------------------
   * SERIALIZACIÓN PARA API
   * -----------------------------------------------------*/
  const serializePayload = (data) => {
    const empleadoId =
      data.empleadoId !== undefined && data.empleadoId !== null && data.empleadoId !== ""
        ? Number(data.empleadoId)
        : data.empleado?.id || data.empleado;

    return {
      empleadoId,
      fecha: data.fecha,
      horaInicio: data.horaInicio,
      horaFin: data.horaFin,
      repeticion: data.repeticion || "no",
      customRecurrence: data.customRecurrence || null,
      descripcion: data.descripcion || data.observaciones || "",
    };
  };

  /* -------------------------------------------------------
   * CRUD
   * -----------------------------------------------------*/
  const createSchedule = useCallback(
    async (data) => {
      setLoading(true);
      try {
        const payload = serializePayload(data);
        const response = await scheduleService.create(payload);

        if (!response?.success) {
          throw new Error(response?.message || "No se pudo crear el horario");
        }

        showSuccessAlert("Horario creado", response.message);
        await loadSchedules({ page: 1 });
        return response.data;
      } catch (error) {
        console.error(error);
        showErrorAlert("Error", error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [loadSchedules]
  );

  const updateSchedule = useCallback(
    async (id, data) => {
      setLoading(true);
      try {
        const payload = serializePayload(data);
        const response = await scheduleService.update(id, payload);

        if (!response?.success) {
          throw new Error(response?.message || "No se pudo actualizar el horario");
        }

        showSuccessAlert("Horario actualizado", response.message);
        await loadSchedules();
        return response.data;
      } catch (error) {
        console.error(error);
        showErrorAlert("Error", error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [loadSchedules]
  );

  const registerNovelty = useCallback(
    async (id, payload = {}) => {
      setLoading(true);
      try {
        const body =
          payload && typeof payload === "object"
            ? payload
            : { motivoCancelacion: payload || "" };
        const response = await scheduleService.registerNovelty(id, body);

        if (!response?.success) {
          throw new Error(response?.message || "No se pudo registrar la novedad");
        }

        showSuccessAlert("Novedad registrada", response.message);
        await loadSchedules();
        return true;
      } catch (error) {
        console.error(error);
        showErrorAlert("Error", error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [loadSchedules]
  );

  const deleteSchedule = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const response = await scheduleService.delete(id);

        if (!response?.success) {
          throw new Error(response?.message || "No se pudo eliminar el horario");
        }

        showSuccessAlert("Horario eliminado", response.message);
        await loadSchedules();
        return true;
      } catch (error) {
        console.error(error);
        showErrorAlert("Error", error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [loadSchedules]
  );

  /* -------------------------------------------------------
   * RETURNS
   * -----------------------------------------------------*/
  return {
    schedules,
    rawSchedules,
    employees,
    loading,
    loadingEmployees,
    pagination,
    isEmployeeScope,
    employeeIdFromUser,
    loadSchedules,
    loadEmployees,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    registerNovelty,
    refresh: loadSchedules,
  };
};

export default useEmployeeSchedules;

