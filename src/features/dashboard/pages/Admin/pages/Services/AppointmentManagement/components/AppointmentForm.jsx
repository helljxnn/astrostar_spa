import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  addMinutes,
  format,
  isSameDay,
  startOfDay,
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  differenceInCalendarMonths,
  differenceInCalendarYears,
} from "date-fns";
import { FormField } from "../../../../../../../../shared/components/FormField";
import {
  useAppointmentValidation,
  appointmentValidationRules,
} from "../hooks/useAppointmentValidation";
import { DatePickerField } from "../../../../../../../../shared/components/DatePickerField";
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts";
import employeeScheduleService from "../../EmployeesSchedule/services/employeeScheduleService";

const DURATION_OPTIONS = [
  { value: "30", label: "30 minutos" },
  { value: "45", label: "45 minutos" },
  { value: "60", label: "60 minutos" },
  { value: "90", label: "90 minutos" },
  { value: "120", label: "120 minutos" },
];

const initialAppointmentValues = {
  athleteId: "",
  specialty: "",
  specialistId: "",
  description: "",
  start: null,
  durationMinutes: "60",
};

const SCHEDULE_INFO_STYLES = {
  muted: "bg-gray-50 text-gray-600 border-gray-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-red-50 text-red-700 border-red-200",
};

const parseCustomRecurrence = (value) => {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

const normalizeFrequency = (value = "") => {
  const frequency = String(value || "").toLowerCase();
  if (frequency === "año" || frequency === "ano") return "anio";
  return frequency || "semana";
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

const normalizeNovelty = (novelty, fallbackDate) => {
  if (!novelty) return null;
  const dateSource = novelty.date || novelty.fecha || fallbackDate;
  const date = dateSource ? startOfDay(new Date(dateSource)) : null;
  if (!date || Number.isNaN(date.getTime())) return null;

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
    date,
    type,
    startTime,
    endTime,
    reason: reason ? String(reason).trim() : "",
  };
};

const normalizeSchedule = (rawSchedule) => {
  if (!rawSchedule) return null;
  const dateSource = rawSchedule.scheduleDate || rawSchedule.fecha;
  const scheduleDate = dateSource ? new Date(dateSource) : null;
  if (scheduleDate && Number.isNaN(scheduleDate.getTime())) return null;
  if (scheduleDate) scheduleDate.setHours(0, 0, 0, 0);

  const rawNovelties =
    rawSchedule.novelties ||
    rawSchedule.novedadesDetalle ||
    rawSchedule.novedadesDetalleHorario ||
    [];
  const noveltiesList = Array.isArray(rawNovelties) ? rawNovelties : [rawNovelties];
  const novelties = noveltiesList
    .map((item) => normalizeNovelty(item, scheduleDate))
    .filter(Boolean);

  return {
    id: rawSchedule.id,
    employeeId: rawSchedule.employeeId || rawSchedule.empleadoId,
    scheduleDate,
    startTime: rawSchedule.startTime || rawSchedule.horaInicio || "",
    endTime: rawSchedule.endTime || rawSchedule.horaFin || "",
    recurrence: rawSchedule.recurrence || rawSchedule.repeticion || "no",
    customRecurrence: parseCustomRecurrence(rawSchedule.customRecurrence),
    novelties,
  };
};

const timeStringToMinutes = (value) => {
  if (!value) return null;
  const [hours, minutes] = String(value).split(":");
  const parsedHours = Number(hours);
  const parsedMinutes = Number(minutes);
  if (Number.isNaN(parsedHours) || Number.isNaN(parsedMinutes)) return null;
  return parsedHours * 60 + parsedMinutes;
};

const minutesToTimeString = (minutes) => {
  if (minutes === null || minutes === undefined || Number.isNaN(minutes)) return "";
  const hrs = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mins = String(minutes % 60).padStart(2, "0");
  return `${hrs}:${mins}`;
};

const isTimeRangeOverlap = (startA, endA, startB, endB) => {
  if ([startA, endA, startB, endB].some((value) => value === null)) return false;
  return startA < endB && endA > startB;
};

const getNoveltiesForDate = (schedule, date) => {
  const novelties = Array.isArray(schedule?.novelties) ? schedule.novelties : [];
  return novelties.filter((novelty) => isSameDay(novelty.date, date));
};

const hasFullDayNovelty = (schedule, date) =>
  getNoveltiesForDate(schedule, date).some((novelty) => novelty?.type === "full");

const isTimeBlockedByNovelty = (schedule, dateTime, durationMinutes) => {
  const novelties = getNoveltiesForDate(schedule, dateTime);
  if (novelties.length === 0) return false;
  if (novelties.some((novelty) => novelty?.type === "full")) return true;

  const startMinutes = dateTime.getHours() * 60 + dateTime.getMinutes();
  const duration = Number(durationMinutes || 0);
  const endMinutes = startMinutes + duration;

  return novelties.some((novelty) => {
    if (novelty?.type !== "time") return false;
    const noveltyStart = timeStringToMinutes(novelty.startTime);
    const noveltyEnd = timeStringToMinutes(novelty.endTime);
    if (noveltyStart === null || noveltyEnd === null) return true;
    return isTimeRangeOverlap(startMinutes, endMinutes, noveltyStart, noveltyEnd);
  });
};

const isValidScheduleWindow = (schedule) => {
  const start = timeStringToMinutes(schedule.startTime);
  const end = timeStringToMinutes(schedule.endTime);
  return start !== null && end !== null && end > start;
};

const isCustomRecurrenceActiveOnDate = (schedule, targetDate, baseDate) => {
  const custom = schedule.customRecurrence;
  if (!custom) return false;

  const interval = Number(custom.interval) || 1;
  const frequency = normalizeFrequency(custom.frequency || "semana");
  const dias = Array.isArray(custom.dias) ? custom.dias : [];
  const endType = custom.endType || "";
  const endDateValue =
    endType === "el"
      ? custom.endDate
      : endType === "despues"
      ? custom.afterDate
      : custom.endDate || custom.afterDate;

  if (endDateValue) {
    const limit = startOfDay(new Date(endDateValue));
    if (!Number.isNaN(limit.getTime()) && targetDate > limit) return false;
  }

  if (isSameDay(targetDate, baseDate)) return true;

  if (dias.length > 0) {
    const daysDiff = differenceInCalendarDays(targetDate, baseDate);
    const weeksDiff = differenceInCalendarWeeks(targetDate, baseDate);

    if (frequency === "dia" && daysDiff % interval !== 0) return false;
    if (frequency === "semana" && weeksDiff % interval !== 0) return false;
    if ((frequency === "mes" || frequency === "anio") && daysDiff % 7 !== 0) {
      return false;
    }

    return dias.includes(targetDate.getDay());
  }

  if (frequency === "dia") {
    return differenceInCalendarDays(targetDate, baseDate) % interval === 0;
  }
  if (frequency === "semana") {
    return (
      targetDate.getDay() === baseDate.getDay() &&
      differenceInCalendarWeeks(targetDate, baseDate) % interval === 0
    );
  }
  if (frequency === "mes") {
    return (
      targetDate.getDate() === baseDate.getDate() &&
      differenceInCalendarMonths(targetDate, baseDate) % interval === 0
    );
  }
  if (frequency === "anio") {
    return (
      targetDate.getDate() === baseDate.getDate() &&
      targetDate.getMonth() === baseDate.getMonth() &&
      differenceInCalendarYears(targetDate, baseDate) % interval === 0
    );
  }

  return false;
};

const isScheduleActiveOnDate = (schedule, date) => {
  if (!schedule?.scheduleDate) return false;
  const targetDate = startOfDay(date);
  const baseDate = startOfDay(schedule.scheduleDate);
  if (Number.isNaN(targetDate.getTime()) || Number.isNaN(baseDate.getTime())) {
    return false;
  }
  if (targetDate < baseDate) return false;

  const recurrenceRaw = String(schedule.recurrence || "no").toLowerCase();
  const recurrence = recurrenceRaw === "año" ? "anio" : recurrenceRaw;
  const interval = Number(schedule.intervalo) || 1;

  if (recurrence === "personalizado") {
    return isCustomRecurrenceActiveOnDate(schedule, targetDate, baseDate);
  }
  if (recurrence === "no") return isSameDay(targetDate, baseDate);
  if (recurrence === "laboral") {
    if (isSameDay(targetDate, baseDate)) return true;
    const day = targetDate.getDay();
    return day >= 1 && day <= 5;
  }
  if (recurrence === "dia") {
    return differenceInCalendarDays(targetDate, baseDate) % interval === 0;
  }
  if (recurrence === "semana") {
    return (
      targetDate.getDay() === baseDate.getDay() &&
      differenceInCalendarWeeks(targetDate, baseDate) % interval === 0
    );
  }
  if (recurrence === "mes") {
    return (
      targetDate.getDate() === baseDate.getDate() &&
      differenceInCalendarMonths(targetDate, baseDate) % interval === 0
    );
  }
  if (recurrence === "anio") {
    return (
      targetDate.getDate() === baseDate.getDate() &&
      targetDate.getMonth() === baseDate.getMonth() &&
      differenceInCalendarYears(targetDate, baseDate) % interval === 0
    );
  }

  return false;
};

const getSchedulesForDate = (schedules, date) =>
  schedules.filter(
    (schedule) =>
      isValidScheduleWindow(schedule) &&
      isScheduleActiveOnDate(schedule, date) &&
      !hasFullDayNovelty(schedule, date)
  );

const getScheduleBoundsForDate = (schedules, date) => {
  const daySchedules = getSchedulesForDate(schedules, date);
  if (daySchedules.length === 0) return null;

  let minStart = null;
  let maxEnd = null;
  daySchedules.forEach((schedule) => {
    const start = timeStringToMinutes(schedule.startTime);
    const end = timeStringToMinutes(schedule.endTime);
    if (start === null || end === null) return;
    if (minStart === null || start < minStart) minStart = start;
    if (maxEnd === null || end > maxEnd) maxEnd = end;
  });

  if (minStart === null || maxEnd === null) return null;
  return {
    minTime: minutesToTimeString(minStart),
    maxTime: minutesToTimeString(maxEnd),
    schedules: daySchedules,
  };
};

const AppointmentForm = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  athleteList = [],
  specialistList = [],
  specialtyOptions = [],
  loadingAthletes = false,
  loadingSpecialists = false,
}) => {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAllFields,
    resetForm,
    setValues,
    setFieldValue,
  } = useAppointmentValidation(initialAppointmentValues, appointmentValidationRules);

  const [scheduleItems, setScheduleItems] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState("");

  useEffect(() => {
    let isMounted = true;

    if (!isOpen || !values.specialistId) {
      setScheduleItems([]);
      setScheduleError("");
      return () => {
        isMounted = false;
      };
    }

    const loadSchedules = async () => {
      setScheduleItems([]);
      setScheduleLoading(true);
      setScheduleError("");
      try {
        const response = await employeeScheduleService.getByEmployee(
          values.specialistId
        );
        const rawList =
          response?.data || response?.schedules || response?.data?.items || [];
        const normalized = rawList
          .map((item) => normalizeSchedule(item))
          .filter(Boolean);
        if (isMounted) {
          setScheduleItems(normalized);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setScheduleItems([]);
          setScheduleError(
            "No se pudieron cargar los horarios del especialista."
          );
        }
      } finally {
        if (isMounted) {
          setScheduleLoading(false);
        }
      }
    };

    loadSchedules();

    return () => {
      isMounted = false;
    };
  }, [isOpen, values.specialistId]);

  const athleteOptions = useMemo(
    () =>
      athleteList.map((athlete) => {
        const label =
          athlete.label ||
          athlete.nombre ||
          athlete.fullName ||
          `${athlete.nombres || athlete.firstName || ""} ${
            athlete.apellidos || athlete.lastName || ""
          }`
            .replace(/\s+/g, " ")
            .trim();
        return {
          value: athlete.id || athlete.athleteId,
          label: label || "Deportista",
        };
      }),
    [athleteList]
  );

  const availableSpecialists = useMemo(() => {
    if (!values.specialty) return specialistList;
    const hasSpecialtyData = specialistList.some((spec) => spec.specialty);
    if (!hasSpecialtyData) return specialistList;
    return specialistList.filter(
      (spec) => spec.specialty === values.specialty
    );
  }, [specialistList, values.specialty]);

  const specialistOptions = useMemo(
    () =>
      availableSpecialists.map((specialist) => ({
        value: specialist.id || specialist.specialistId,
        label: specialist.label || specialist.nombre || "Especialista",
      })),
    [availableSpecialists]
  );

  const selectedSpecialist = useMemo(() => {
    if (!values.specialistId) return null;
    return specialistList.find(
      (spec) =>
        String(spec.id || spec.specialistId) === String(values.specialistId)
    );
  }, [specialistList, values.specialistId]);

  const selectedSpecialtyLabel = useMemo(() => {
    if (!values.specialty) return "";
    const option = specialtyOptions.find(
      (opt) => opt.value === values.specialty
    );
    return option?.label || values.specialty;
  }, [specialtyOptions, values.specialty]);

  const availableSchedules = useMemo(
    () => scheduleItems.filter(Boolean),
    [scheduleItems]
  );

  const scheduleInfo = useMemo(() => {
    if (!values.specialistId) {
      return {
        tone: "muted",
        text: "Seleccione un especialista para ver la disponibilidad.",
      };
    }

    if (scheduleLoading) {
      return {
        tone: "info",
        text: "Cargando horarios del especialista...",
      };
    }

    if (scheduleError) {
      return { tone: "error", text: scheduleError };
    }

    if (availableSchedules.length === 0) {
      return {
        tone: "warning",
        text: "Este especialista no tiene horarios activos.",
      };
    }

    if (!values.start) {
      return {
        tone: "muted",
        text: "Seleccione una fecha para ver horarios disponibles.",
      };
    }

    const daySchedules = getSchedulesForDate(availableSchedules, values.start);
    if (daySchedules.length === 0) {
      return {
        tone: "warning",
        text: "No hay horario disponible para esa fecha.",
      };
    }

    const label = daySchedules
      .map((schedule) => `${schedule.startTime} - ${schedule.endTime}`)
      .join(" / ");

    const noveltyRanges = daySchedules
      .flatMap((schedule) =>
        getNoveltiesForDate(schedule, values.start)
          .filter(
            (novelty) =>
              novelty?.type === "time" && novelty?.startTime && novelty?.endTime
          )
          .map((novelty) => `${novelty.startTime} - ${novelty.endTime}`)
      )
      .filter(Boolean);
    const noveltyNote =
      noveltyRanges.length > 0
        ? ` (Novedad en: ${noveltyRanges.join(" / ")})`
        : "";

    return {
      tone: "success",
      text: `Horario disponible: ${label}${noveltyNote}`,
    };
  }, [
    values.specialistId,
    scheduleLoading,
    scheduleError,
    availableSchedules,
    values.start,
  ]);

  const scheduleBounds = useMemo(() => {
    if (!values.start) return null;
    return getScheduleBoundsForDate(availableSchedules, values.start);
  }, [availableSchedules, values.start]);

  const minTime = useMemo(() => {
    const baseMinTime = scheduleBounds?.minTime || "06:00";
    if (values.start && isSameDay(values.start, new Date())) {
      const nowTime = format(new Date(), "HH:mm");
      const nowMinutes = timeStringToMinutes(nowTime);
      const baseMinutes = timeStringToMinutes(baseMinTime);
      if (
        nowMinutes !== null &&
        baseMinutes !== null &&
        nowMinutes > baseMinutes
      ) {
        return nowTime;
      }
    }
    return baseMinTime;
  }, [values.start, scheduleBounds]);

  const maxTime = useMemo(
    () => scheduleBounds?.maxTime || "22:00",
    [scheduleBounds]
  );

  const handleSpecialtyChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
      specialistId: "",
    }));
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }

    if (initialData) {
      const startDate = initialData.start
        ? new Date(initialData.start)
        : null;
      const endDate = initialData.end ? new Date(initialData.end) : null;
      const duration =
        startDate && endDate
          ? Math.max(15, Math.round((endDate - startDate) / 60000))
          : initialAppointmentValues.durationMinutes;

      setValues({
        ...initialAppointmentValues,
        athleteId:
          initialData.athleteId ||
          initialData.athlete ||
          initialData.athlete?.id ||
          "",
        specialty: initialData.specialty || "",
        specialistId:
          initialData.specialistId ||
          initialData.specialist ||
          initialData.specialist?.id ||
          "",
        description: initialData.description || "",
        start: startDate,
        durationMinutes: String(duration),
      });
    } else {
      resetForm();
    }
  }, [isOpen, initialData, resetForm, setValues]);

  const isTimeWithinSchedule = (dateTime, durationOverride = null) => {
    if (!values.specialistId || availableSchedules.length === 0) return false;
    const daySchedules = getSchedulesForDate(availableSchedules, dateTime);
    if (daySchedules.length === 0) return false;

    const startMinutes = dateTime.getHours() * 60 + dateTime.getMinutes();
    const duration =
      durationOverride !== null && durationOverride !== undefined
        ? Number(durationOverride)
        : Number(values.durationMinutes || 0);
    const endMinutes = startMinutes + (duration || 0);

    return daySchedules.some((schedule) => {
      const scheduleStart = timeStringToMinutes(schedule.startTime);
      const scheduleEnd = timeStringToMinutes(schedule.endTime);
      if (scheduleStart === null || scheduleEnd === null) return false;
      if (duration && duration > 0) {
        const isWithin = startMinutes >= scheduleStart && endMinutes <= scheduleEnd;
        if (!isWithin) return false;
        return !isTimeBlockedByNovelty(schedule, dateTime, duration);
      }
      const isWithin = startMinutes >= scheduleStart && startMinutes < scheduleEnd;
      if (!isWithin) return false;
      return !isTimeBlockedByNovelty(schedule, dateTime, duration);
    });
  };

  const filterDate = (date) => {
    const targetDate = startOfDay(date);
    if (targetDate < startOfDay(new Date())) return false;
    if (!values.specialistId) return false;
    if (availableSchedules.length === 0) return false;
    return getSchedulesForDate(availableSchedules, targetDate).length > 0;
  };

  const filterTime = (time) => isTimeWithinSchedule(time);

  const handleFormSubmit = () => {
    if (!validateAllFields()) {
      showErrorAlert(
        "Error de validación",
        "Por favor, complete todos los campos requeridos correctamente."
      );
      return;
    }

    if (availableSchedules.length === 0) {
      showErrorAlert(
        "Horario no disponible",
        "El especialista seleccionado no tiene horarios activos."
      );
      return;
    }

    if (!values.start) {
      showErrorAlert(
        "Error de validación",
        "Debe seleccionar una fecha y hora válidas."
      );
      return;
    }

    const duration = Number(values.durationMinutes || 0);
    if (!duration || duration <= 0) {
      showErrorAlert(
        "Error de validación",
        "Debe seleccionar una duración válida."
      );
      return;
    }

    if (!isTimeWithinSchedule(values.start, duration)) {
      showErrorAlert(
        "Horario no disponible",
        "La hora seleccionada no está dentro del horario del especialista."
      );
      return;
    }

    const end = addMinutes(values.start, duration);

    const finalValues = {
      ...values,
      athleteId: Number(values.athleteId),
      specialistId: Number(values.specialistId),
      durationMinutes: duration,
      start: values.start,
      end,
    };

    onSave(finalValues);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal-container bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] relative flex flex-col overflow-hidden"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-3 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
          >
            &times;
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            {initialData && initialData.id ? "Editar Cita" : "Crear Nueva Cita"}
          </h2>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleFormSubmit();
          }}
          className="flex-1 flex flex-col"
        >
          <div className="modal-body flex-1 overflow-y-auto p-3 relative">
            <div className="form-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 relative">
              <div className="lg:col-span-2">
                <FormField
                  label="Deportista"
                  name="athleteId"
                  type="select"
                  options={athleteOptions}
                  value={values.athleteId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.athleteId && errors.athleteId}
                  required
                  disabled={loadingAthletes}
                  placeholder={
                    loadingAthletes
                      ? "Cargando deportistas..."
                      : "Seleccione un deportista"
                  }
                />
              </div>
              <div className="lg:col-span-2">
                <FormField
                  label="Especialidad"
                  name="specialty"
                  type="select"
                  options={specialtyOptions}
                  value={values.specialty}
                  onChange={handleSpecialtyChange}
                  onBlur={handleBlur}
                  error={touched.specialty && errors.specialty}
                  required
                  disabled={loadingSpecialists}
                />
              </div>
              <div className="lg:col-span-2">
                <FormField
                  label="Especialista"
                  name="specialistId"
                  type="select"
                  options={specialistOptions}
                  value={values.specialistId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.specialistId && errors.specialistId}
                  required
                  disabled={!values.specialty || loadingSpecialists}
                  placeholder={
                    !values.specialty
                      ? "Seleccione una especialidad primero"
                      : loadingSpecialists
                      ? "Cargando especialistas..."
                      : "Seleccione un especialista"
                  }
                />
              </div>
              <div className="lg:col-span-2">
                <FormField
                  label="Duración"
                  name="durationMinutes"
                  type="select"
                  options={DURATION_OPTIONS}
                  value={values.durationMinutes}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.durationMinutes && errors.durationMinutes}
                  required
                />
              </div>

              {selectedSpecialist && (
                <div className="md:col-span-2 lg:col-span-4">
                  <div className="rounded-xl border border-[#e9e7ff] bg-[#f8f7ff] px-4 py-3 text-sm text-gray-700">
                    <div className="font-semibold text-gray-800">
                      Especialista seleccionado
                    </div>
                    <div className="mt-1">
                      <span className="font-medium">Nombre:</span>{" "}
                      {selectedSpecialist.nombre ||
                        selectedSpecialist.label ||
                        "Especialista"}
                    </div>
                    {selectedSpecialist.cargo && (
                      <div>
                        <span className="font-medium">Cargo:</span>{" "}
                        {selectedSpecialist.cargo}
                      </div>
                    )}
                    {selectedSpecialtyLabel && (
                      <div>
                        <span className="font-medium">Especialidad:</span>{" "}
                        {selectedSpecialtyLabel}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="md:col-span-2 lg:col-span-4">
                <DatePickerField
                  label="Fecha y Hora de la Cita"
                  selected={values.start}
                  onChange={(date) => setFieldValue("start", date)}
                  filterDate={filterDate}
                  filterTime={filterTime}
                  minTime={minTime}
                  maxTime={maxTime}
                  timeIntervals={15}
                  disabled={!values.specialistId}
                  error={touched.start && errors.start}
                  required
                />
              </div>

              {scheduleInfo?.text && (
                <div className="md:col-span-2 lg:col-span-4">
                  <div
                    className={`rounded-lg border px-3 py-2 text-xs ${SCHEDULE_INFO_STYLES[scheduleInfo.tone]}`}
                  >
                    {scheduleInfo.text}
                  </div>
                </div>
              )}

              <div className="md:col-span-2 lg:col-span-4">
                <FormField
                  label="Descripción / Motivo"
                  name="description"
                  type="textarea"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.description && errors.description}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 border-t border-gray-200 p-3">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-all duration-200 font-medium shadow-lg"
              >
                {initialData && initialData.id ? "Guardar Cambios" : "Agendar Cita"}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AppointmentForm;
