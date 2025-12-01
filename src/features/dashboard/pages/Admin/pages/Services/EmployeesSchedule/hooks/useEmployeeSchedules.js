import { useState, useEffect, useMemo, useCallback } from "react";
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
import employeeService from "../../Employees/services/employeeService";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../../../../../../../shared/utils/alerts";

const STATUS_COLOR = {
  Programado: "bg-[#c084fc]",
  Completado: "bg-green-500",
  Cancelado: "bg-gray-400",
};

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

const normalizeScheduleFromApi = (apiSchedule, employeeMap = {}) => {
  const employeeData = apiSchedule.employee || {};
  const user = employeeData.user || {};
  const name =
    apiSchedule.empleado ||
    `${user.firstName || ""} ${user.middleName || ""} ${user.lastName || ""} ${
      user.secondLastName || ""
    }`.replace(/\s+/g, " ").trim();

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
    estado,
    motivoCancelacion:
      apiSchedule.cancellationReason || apiSchedule.motivoCancelacion || "",
    start,
    end,
    title: `Turno - ${name}${estado === "Cancelado" ? " (Cancelado)" : ""}`,
    color: STATUS_COLOR[estado] || STATUS_COLOR.Programado,
  };
};

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
  };
};

const expandCustomRecurrence = (schedule, startDate, limitDate) => {
  const { dias = [], interval = 1, frequency = "semana" } =
    schedule.customRecurrence || {};

  const events = [];
  let idx = 0;
  events.push(buildOccurrence(schedule, startDate, idx++));

  // Si se seleccionaron d��as espec��ficos, recorremos d��a a d��a respetando el intervalo
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
      if (
        (frequency === "mes" || frequency === "anio") &&
        daysDiff % 7 !== 0
      ) {
        // Evitamos disparar eventos diarios en intervalos mensuales/anuales cuando hay d��as seleccionados.
        continue;
      }

      if (dias.includes(day)) {
        events.push(buildOccurrence(schedule, walker, idx++));
      }
    }
    return events;
  }

  // Sin d��as espec��ficos: aplicamos el paso seg��n frecuencia
  const stepMap = {
    dia: addDays,
    semana: addWeeks,
    mes: addMonths,
    anio: addYears,
    a��o: addYears,
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
  if (!schedule.fecha || !schedule.horaInicio || !schedule.horaFin) {
    return [];
  }

  const baseDate = new Date(`${schedule.fecha}T00:00:00`);
  let limitDate = schedule.customRecurrence?.endDate
    ? new Date(schedule.customRecurrence.endDate)
    : schedule.customRecurrence?.afterDate
    ? new Date(schedule.customRecurrence.afterDate)
    : addMonths(baseDate, 2);

  // Evitar generar demasiados eventos (m��ximo 6 meses hacia adelante)
  const hardLimit = addMonths(baseDate, 6);
  if (isAfter(limitDate, hardLimit)) {
    limitDate = hardLimit;
  }

  const events = [];
  let idx = 0;
  events.push(buildOccurrence(schedule, baseDate, idx++));

  const intervalo = schedule.intervalo || 1;

  switch (schedule.repeticion) {
    case "dia": {
      let cursor = baseDate;
      while (true) {
        cursor = addDays(cursor, intervalo);
        if (isAfter(cursor, limitDate)) break;
        events.push(buildOccurrence(schedule, cursor, idx++));
      }
      break;
    }
    case "semana": {
      let cursor = baseDate;
      while (true) {
        cursor = addWeeks(cursor, intervalo);
        if (isAfter(cursor, limitDate)) break;
        events.push(buildOccurrence(schedule, cursor, idx++));
      }
      break;
    }
    case "mes": {
      let cursor = baseDate;
      while (true) {
        cursor = addMonths(cursor, intervalo);
        if (isAfter(cursor, limitDate)) break;
        events.push(buildOccurrence(schedule, cursor, idx++));
      }
      break;
    }
    case "anio": {
      let cursor = baseDate;
      while (true) {
        cursor = addYears(cursor, intervalo);
        if (isAfter(cursor, limitDate)) break;
        events.push(buildOccurrence(schedule, cursor, idx++));
      }
      break;
    }
    case "laboral": {
      let cursor = baseDate;
      while (true) {
        cursor = addDays(cursor, 1);
        if (isAfter(cursor, limitDate)) break;
        const day = cursor.getDay();
        if (day >= 1 && day <= 5) {
          events.push(buildOccurrence(schedule, cursor, idx++));
        }
      }
      break;
    }
    case "personalizado": {
      return expandCustomRecurrence(schedule, baseDate, limitDate);
    }
    default:
      break;
  }

  return events;
};

export const useEmployeeSchedules = () => {
  const [rawSchedules, setRawSchedules] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const employeeMap = useMemo(() => {
    const map = {};
    employees.forEach((emp) => {
      map[emp.value] = emp;
    });
    return map;
  }, [employees]);

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
    (items = []) =>
      items.map((item) => normalizeScheduleFromApi(item, employeeMap)),
    [employeeMap]
  );

  useEffect(() => {
    const expanded = rawSchedules.flatMap((schedule) =>
      expandScheduleOccurrences(mergeEmployeeData(schedule))
    );
    setSchedules(expanded);
  }, [rawSchedules, mergeEmployeeData]);

  const loadEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    try {
      const response = await employeeService.getAll({
        page: 1,
        limit: 200,
        status: "Active",
      });

      const list = response.data || response.employees || [];
      const formatted = list.map((emp) => {
        const user = emp.user || {};
        const fullName = `${user.firstName || ""} ${user.middleName || ""} ${
          user.lastName || ""
        } ${user.secondLastName || ""}`
          .replace(/\s+/g, " ")
          .trim();
        return {
          value: emp.id,
          label: fullName || "Empleado sin nombre",
          cargo: user.role?.name || "Empleado",
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

  const loadSchedules = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        const response = await scheduleService.getAll({
          page: pagination.page,
          limit: pagination.limit,
          ...params,
        });

        if (!response?.success) {
          throw new Error(response?.message || "No se pudieron cargar horarios");
        }

        const normalized = buildFromApi(response.data || response.schedules || []);
        setRawSchedules(normalized);
        setPagination(response.pagination || pagination);
      } catch (error) {
        console.error(error);
        showErrorAlert("Error", error.message || "No se pudieron cargar horarios");
      } finally {
        setLoading(false);
      }
    },
    [buildFromApi, pagination]
  );

  const serializePayload = (data) => ({
    empleadoId:
      data.empleadoId !== undefined && data.empleadoId !== null && data.empleadoId !== ""
        ? Number(data.empleadoId)
        : data.empleado?.id || data.empleado,
    fecha: data.fecha,
    horaInicio: data.horaInicio,
    horaFin: data.horaFin,
    repeticion: data.repeticion || "no",
    customRecurrence: data.customRecurrence || null,
    descripcion: data.descripcion || data.observaciones || "",
    estado: data.estado || "Programado",
  });

  const createSchedule = useCallback(
    async (data) => {
      setLoading(true);
      try {
        const payload = serializePayload(data);
        const response = await scheduleService.create(payload);

        if (!response?.success) {
          throw new Error(response?.message || "No se pudo crear el horario");
        }

        showSuccessAlert(
          "Horario creado",
          response.message || "El horario se registr�� correctamente"
        );
        await loadSchedules({ page: 1 });
        return response.data;
      } catch (error) {
        console.error(error);
        showErrorAlert("Error", error.message || "No se pudo crear el horario");
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
        showErrorAlert("Error", error.message || "No se pudo actualizar el horario");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [loadSchedules]
  );

  const cancelSchedule = useCallback(
    async (id, motivoCancelacion) => {
      setLoading(true);
      try {
        const response = await scheduleService.cancel(id, motivoCancelacion);
        if (!response?.success) {
          throw new Error(response?.message || "No se pudo cancelar el horario");
        }
        showSuccessAlert("Horario cancelado", response.message);
        await loadSchedules();
        return true;
      } catch (error) {
        console.error(error);
        showErrorAlert(
          "Error",
          error.message || "No se pudo cancelar el horario seleccionado"
        );
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
        showErrorAlert(
          "Error",
          error.message || "No se pudo eliminar el horario seleccionado"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [loadSchedules]
  );

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
    cancelSchedule,
    refresh: loadSchedules,
  };
};

export default useEmployeeSchedules;
