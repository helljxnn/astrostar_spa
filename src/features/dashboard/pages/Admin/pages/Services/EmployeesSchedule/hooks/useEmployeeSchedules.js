import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
const STATUS_COLOR = {
  Programado: "bg-[#c084fc]",
  Completado: "bg-green-500",
  Cancelado: "bg-gray-400",
};

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

  const estadoRaw = apiSchedule.status || apiSchedule.estado || "Programado";
  const estado = ["Programado", "Completado", "Cancelado"].includes(estadoRaw)
    ? estadoRaw
    : "Programado";

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
    estado,
    motivoCancelacion: cancellationReason,
    tipoCancelacion: cancelType,
    tiempoCancelacion:
      cancelPayloadRaw?.tiempoCancelacion || apiSchedule.tiempoCancelacion || "",
    explicacionTiempo:
      cancelPayloadRaw?.explicacionTiempo || apiSchedule.explicacionTiempo || "",
    cancelPayload: cancelPayloadRaw || null,
    start,
    end,
    title: `Turno - ${name}${estado === "Cancelado" ? " (Cancelado)" : ""}`,
    color: STATUS_COLOR[estado] || STATUS_COLOR.Programado,
  };
};

/* -------------------------------------------------------
 * EXPANSIÓN DE OCURRENCIAS
 * -----------------------------------------------------*/
const buildOccurrence = (schedule, date, occurrenceIndex) => {
  const dateStr = format(date, "yyyy-MM-dd");
  const start = new Date(`${dateStr}T${schedule.horaInicio}`);
  const end = new Date(`${dateStr}T${schedule.horaFin}`);

  return {
    ...schedule,
    fecha: dateStr,
    start,
    end,
    id: `${schedule.id}-${occurrenceIndex}`,
    scheduleId: schedule.id,
    occurrenceIndex,
    title: `Turno - ${schedule.empleado}${
      schedule.estado === "Cancelado" ? " (Cancelado)" : ""
    }`,
    color: STATUS_COLOR[schedule.estado] || STATUS_COLOR.Programado,
    novedad: schedule.novedad,
    novedades: schedule.novedades,
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

  const paginationRef = useRef({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const [pagination, setPagination] = useState(paginationRef.current);

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
  }, [rawSchedules, mergeEmployeeData]);

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

      setEmployees(formatted);
    } catch (error) {
      console.error(error);
      showErrorAlert("Error", "No se pudieron cargar los empleados activos");
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

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
    [buildFromApi]
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
      estado: data.estado || "Programado",
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
