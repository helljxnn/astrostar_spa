import { useState, useCallback, useMemo, useRef } from "react";
import { addMinutes, format } from "date-fns";
import appointmentService from "../services/appointmentService";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../../../../../../../shared/utils/alerts";

const SPECIALTY_LABELS = {
  psicologia: "Psicología Deportiva",
  fisioterapia: "Fisioterapia",
  nutricion: "Nutrición",
  medicina: "Medicina Deportiva",
};

const normalizeKey = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const resolveSpecialtyKey = (value) => {
  const key = normalizeKey(value);
  if (!key) return "";
  if (key.includes("psicolog")) return "psicologia";
  if (key.includes("fisioterap") || key.includes("fisio")) return "fisioterapia";
  if (key.includes("nutric")) return "nutricion";
  if (key.includes("medic")) return "medicina";
  return key;
};

const resolveSpecialtyLabel = (key) =>
  SPECIALTY_LABELS[key] || (key ? key.charAt(0).toUpperCase() + key.slice(1) : "");

const buildFullName = (user = {}) =>
  `${user.firstName || user.nombres || ""} ${user.middleName || ""} ${
    user.lastName || user.apellidos || ""
  } ${user.secondLastName || ""}`
    .replace(/\s+/g, " ")
    .trim();

const toDateKey = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "yyyy-MM-dd");
};

const toTimeKey = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "HH:mm");
};

const normalizeAppointmentFromApi = (apiAppointment) => {
  if (!apiAppointment) return null;

  const dateSource =
    apiAppointment.appointmentDate ||
    apiAppointment.date ||
    apiAppointment.fecha ||
    apiAppointment.start ||
    null;
  const dateKey = dateSource ? toDateKey(dateSource) : "";

  const startTime =
    apiAppointment.startTime || apiAppointment.horaInicio || apiAppointment.time || "";
  const endTime = apiAppointment.endTime || apiAppointment.horaFin || "";

  let start =
    dateKey && startTime ? new Date(`${dateKey}T${startTime}`) : null;
  let end = dateKey && endTime ? new Date(`${dateKey}T${endTime}`) : null;

  if (!start && apiAppointment.start) {
    start = new Date(apiAppointment.start);
  }
  if (!end && apiAppointment.end) {
    end = new Date(apiAppointment.end);
  }

  const athlete = apiAppointment.athlete || apiAppointment.deportista || {};
  const athleteUser = athlete.user || athlete;
  const athleteName =
    apiAppointment.athleteName || buildFullName(athleteUser) || "Deportista";

  const specialist =
    apiAppointment.specialist || apiAppointment.especialista || {};
  const specialistUser = specialist.user || specialist;
  const specialistName =
    apiAppointment.specialistName ||
    buildFullName(specialistUser) ||
    apiAppointment.specialist ||
    "Especialista";

  const specialtyKey = resolveSpecialtyKey(
    apiAppointment.specialty || apiAppointment.especialidad || ""
  );

  return {
    id: apiAppointment.id,
    athleteId: apiAppointment.athleteId || athlete.id || apiAppointment.athlete,
    athleteName,
    specialistId:
      apiAppointment.specialistId || specialist.id || apiAppointment.specialist,
    specialistName,
    specialty: specialtyKey,
    specialtyLabel: resolveSpecialtyLabel(specialtyKey),
    description:
      apiAppointment.description || apiAppointment.motivo || apiAppointment.notes || "",
    status: apiAppointment.status || "Programado",
    cancelReason: apiAppointment.cancelReason || apiAppointment.motivoCancelacion || "",
    conclusion: apiAppointment.conclusion || "",
    appointmentDate: dateKey,
    startTime: startTime || (start ? toTimeKey(start) : ""),
    endTime: endTime || (end ? toTimeKey(end) : ""),
    start,
    end,
    raw: apiAppointment,
  };
};

const serializePayload = (data = {}) => {
  const athleteId = data.athleteId || data.athlete;
  const specialistId = data.specialistId || data.specialist;

  let start = data.start instanceof Date ? data.start : data.start ? new Date(data.start) : null;
  let end = data.end instanceof Date ? data.end : data.end ? new Date(data.end) : null;

  if (!start && data.date && data.startTime) {
    start = new Date(`${data.date}T${data.startTime}`);
  }
  if (!end && data.date && data.endTime) {
    end = new Date(`${data.date}T${data.endTime}`);
  }

  if (!end && start && data.durationMinutes) {
    end = addMinutes(start, Number(data.durationMinutes));
  }

  const payload = {
    athleteId: athleteId ? Number(athleteId) : undefined,
    specialistId: specialistId ? Number(specialistId) : undefined,
    specialty: data.specialty,
    description: data.description?.trim(),
    start: start ? format(start, "yyyy-MM-dd'T'HH:mm") : undefined,
    end: end ? format(end, "yyyy-MM-dd'T'HH:mm") : undefined,
  };

  return payload;
};

export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAthletes, setLoadingAthletes] = useState(false);
  const [loadingSpecialists, setLoadingSpecialists] = useState(false);

  const paginationRef = useRef({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const [pagination, setPagination] = useState(paginationRef.current);

  const specialtyOptions = useMemo(() => {
    const map = new Map();
    specialists.forEach((spec) => {
      if (!spec.specialty) return;
      if (!map.has(spec.specialty)) {
        map.set(
          spec.specialty,
          spec.specialtyLabel || resolveSpecialtyLabel(spec.specialty)
        );
      }
    });
    const computed = Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
    if (computed.length > 0) return computed;
    return Object.entries(SPECIALTY_LABELS).map(([value, label]) => ({
      value,
      label,
    }));
  }, [specialists]);

  const loadAppointments = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const page = params.page ?? paginationRef.current.page;
      const limit = params.limit ?? paginationRef.current.limit;

      const response = await appointmentService.getAll({
        page,
        limit,
        ...params,
      });

      if (!response?.success) {
        throw new Error(response?.message || "No se pudieron cargar las citas");
      }

      const items = response?.data || response?.appointments || [];
      const normalized = items.map(normalizeAppointmentFromApi).filter(Boolean);

      setAppointments(normalized);

      const nextPagination =
        response.pagination || response?.data?.pagination || {
          page,
          limit,
          total: items.length,
          pages: Math.ceil(items.length / limit) || 1,
        };

      paginationRef.current = nextPagination;
      setPagination(nextPagination);
    } catch (error) {
      console.error(error);
      showErrorAlert("Error", error.message || "No se pudieron cargar las citas");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAthletes = useCallback(async () => {
    setLoadingAthletes(true);
    try {
      const response = await appointmentService.getAthletes();
      const rawList = response?.data || response?.athletes || [];
      const formatted = rawList.map((athlete) => ({
        id: athlete.id || athlete.athleteId,
        athleteId: athlete.id || athlete.athleteId,
        label: athlete.nombre || athlete.fullName || "",
        nombres: athlete.nombres || athlete.firstName || "",
        apellidos: athlete.apellidos || athlete.lastName || "",
      }));
      setAthletes(formatted);
    } catch (error) {
      console.error(error);
      showErrorAlert("Error", "No se pudieron cargar los deportistas activos");
    } finally {
      setLoadingAthletes(false);
    }
  }, []);

  const loadSpecialists = useCallback(async () => {
    setLoadingSpecialists(true);
    try {
      const response = await appointmentService.getSpecialists();
      const rawList = response?.data || response?.specialists || [];
      const formatted = rawList.map((spec) => {
        const specialtyKey = resolveSpecialtyKey(spec.specialty || spec.cargo);
        return {
          id: spec.id || spec.specialistId,
          specialistId: spec.id || spec.specialistId,
          label: spec.nombre || spec.name || "",
          nombre: spec.nombre || spec.name || "",
          cargo: spec.cargo || spec.role || "",
          specialty: specialtyKey,
          specialtyLabel: spec.specialtyLabel || resolveSpecialtyLabel(specialtyKey),
        };
      });
      setSpecialists(formatted);
    } catch (error) {
      console.error(error);
      showErrorAlert("Error", "No se pudieron cargar los especialistas activos");
    } finally {
      setLoadingSpecialists(false);
    }
  }, []);

  const createAppointment = useCallback(
    async (data) => {
      setLoading(true);
      try {
        const payload = serializePayload(data);
        const response = await appointmentService.create(payload);

        if (!response?.success) {
          throw new Error(response?.message || "No se pudo crear la cita");
        }

        showSuccessAlert("Cita creada", response.message);
        await loadAppointments({ page: 1 });
        return response.data;
      } catch (error) {
        console.error(error);
        showErrorAlert("Error", error.message || "No se pudo crear la cita");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [loadAppointments]
  );

  const updateAppointment = useCallback(
    async (id, data) => {
      setLoading(true);
      try {
        const payload = serializePayload(data);
        const response = await appointmentService.update(id, payload);

        if (!response?.success) {
          throw new Error(response?.message || "No se pudo actualizar la cita");
        }

        showSuccessAlert("Cita actualizada", response.message);
        await loadAppointments();
        return response.data;
      } catch (error) {
        console.error(error);
        showErrorAlert("Error", error.message || "No se pudo actualizar la cita");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [loadAppointments]
  );

  const cancelAppointment = useCallback(
    async (id, cancelReason) => {
      setLoading(true);
      try {
        const response = await appointmentService.cancel(id, { cancelReason });

        if (!response?.success) {
          throw new Error(response?.message || "No se pudo cancelar la cita");
        }

        showSuccessAlert("Cita cancelada", response.message);
        await loadAppointments();
        return response.data;
      } catch (error) {
        console.error(error);
        showErrorAlert("Error", error.message || "No se pudo cancelar la cita");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [loadAppointments]
  );

  const completeAppointment = useCallback(
    async (id, conclusion) => {
      setLoading(true);
      try {
        const response = await appointmentService.complete(id, { conclusion });

        if (!response?.success) {
          throw new Error(response?.message || "No se pudo completar la cita");
        }

        showSuccessAlert("Cita completada", response.message);
        await loadAppointments();
        return response.data;
      } catch (error) {
        console.error(error);
        showErrorAlert("Error", error.message || "No se pudo completar la cita");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [loadAppointments]
  );

  const deleteAppointment = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const response = await appointmentService.delete(id);

        if (!response?.success) {
          throw new Error(response?.message || "No se pudo eliminar la cita");
        }

        showSuccessAlert("Cita eliminada", response.message);
        await loadAppointments();
        return true;
      } catch (error) {
        console.error(error);
        showErrorAlert("Error", error.message || "No se pudo eliminar la cita");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [loadAppointments]
  );

  return {
    appointments,
    athletes,
    specialists,
    specialtyOptions,
    loading,
    loadingAthletes,
    loadingSpecialists,
    pagination,
    loadAppointments,
    loadAthletes,
    loadSpecialists,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    completeAppointment,
    deleteAppointment,
  };
};

export default useAppointments;
