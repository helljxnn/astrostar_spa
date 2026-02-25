import React, { useMemo, useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
import apiClient from "../../../../../../../../shared/services/apiClient";

const normalize = (value) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

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
   sportsCategoryOptions = [],
  specialtyOptions = [],
  loadingAthletes = false,
  loadingSpecialists = false,
  loadingCategories = false,
  defaultAthleteId = "",
  lockAthlete = false,
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
  const [athleteCategoryFilter, setAthleteCategoryFilter] = useState("");
  const [athleteCategoryLabel, setAthleteCategoryLabel] = useState("");
  const [categoryAthletes, setCategoryAthletes] = useState([]);
  const [loadingCategoryAthletes, setLoadingCategoryAthletes] = useState(false);
  const [localCategories, setLocalCategories] = useState([]);
  const [loadingLocalCategories, setLoadingLocalCategories] = useState(false);

  useEffect(() => {
    if (sportsCategoryOptions && sportsCategoryOptions.length > 0) {
      setLocalCategories(sportsCategoryOptions);
    }
  }, [sportsCategoryOptions]);

  // Cargar categorías si el padre aún no las tiene (evita modal vacío)
  useEffect(() => {
    if (!isOpen || (sportsCategoryOptions && sportsCategoryOptions.length > 0)) {
      return;
    }

    let isMounted = true;
    const fetchCategories = async () => {
      setLoadingLocalCategories(true);
      try {
        const response = await apiClient.get("/sports-categories", {
          page: 1,
          limit: 500,
        });
        const items =
          response?.data?.data?.items ||
          response?.data?.data?.data ||
          response?.data?.data ||
          response?.data?.items ||
          response?.items ||
          response?.results ||
          response?.data?.results ||
          response?.data ||
          response ||
          [];

        let normalized = Array.isArray(items)
          ? items.map((cat) => ({
              id:
                cat.id ??
                cat.categoryId ??
                cat.categoryID ??
                cat.CategoryId ??
                cat.CategoryID ??
                cat.Id ??
                cat.ID ??
                cat.sportsCategoryId ??
                cat.sportsCategoryID ??
                null,
              name:
                cat.name ??
                cat.nombre ??
                cat.nombreCategoria ??
                cat.label ??
                "Categoría",
              value:
                cat.id ??
                cat.categoryId ??
                cat.categoryID ??
                cat.CategoryId ??
                cat.CategoryID ??
                cat.Id ??
                cat.ID ??
                cat.sportsCategoryId ??
                cat.sportsCategoryID ??
                cat.value ??
                cat.name ??
                cat.nombre,
              label:
                cat.label ??
                cat.name ??
                cat.nombre ??
                cat.nombreCategoria ??
                "Categoría",
            }))
          : [];

        // fallback: si el catálogo viene vacío, usar categorías derivadas de deportistas
        if (normalized.length === 0 && athleteList && athleteList.length > 0) {
          normalized = athleteList
            .map((ath) => ({
              id:
                ath.categoryId ||
                ath.category?.id ||
                ath.sportsCategoryId ||
                ath.categoriaId ||
                ath.category,
              name:
                ath.categoryName ||
                ath.category?.name ||
                ath.category ||
                "Categoría",
            }))
            .filter((c) => c.name);
        }

        if (isMounted) {
          setLocalCategories(normalized);
        }
      } catch (error) {
        console.error("Error cargando categorías deportivas:", error);
      } finally {
        if (isMounted) {
          setLoadingLocalCategories(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [isOpen, sportsCategoryOptions]);

  const categoriesLoading = loadingCategories || loadingLocalCategories;

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

  const categoryOptions = useMemo(() => {
    // Preferir catálogo de categorías si existe (prop o cargado localmente)
    const baseCategories =
      (localCategories && localCategories.length > 0
        ? localCategories
        : sportsCategoryOptions) || [];

    const source =
      baseCategories.length > 0
        ? baseCategories.map((cat) => ({
            value:
              cat.value ||
              cat.id ||
              cat.categoryId ||
              cat.categoryID ||
              cat.CategoryId ||
              cat.CategoryID ||
              cat.sportsCategoryId ||
              cat.sportsCategoryID ||
              cat.name,
            label:
              cat.label ||
              cat.name ||
              cat.nombre ||
              cat.nombreCategoria ||
              "Categoría",
          }))
        : athleteList.map((athlete) => ({
            value:
              athlete.categoryId ||
              athlete.category?.id ||
              athlete.sportsCategoryId ||
              athlete.categoriaId ||
              athlete.categoryName ||
              athlete.category ||
              "Sin categoría",
            label:
              athlete.categoryName ||
              athlete.category?.name ||
              athlete.category ||
              "Sin categoría",
          }));

    const map = new Map();
    source.forEach((item) => {
      const key = String(item.value ?? "Sin categoría");
      if (!map.has(key)) {
        map.set(key, {
          value: item.value ?? "Sin categoría",
          label: item.label ?? "Sin categoría",
        });
      }
    });

    return [
      { value: "", label: "Todas las categorías" },
      ...Array.from(map.values()),
    ];
  }, [sportsCategoryOptions, localCategories, athleteList]);

  const filteredAthletes = useMemo(() => {
    // Si no se eligió categoría, no mostramos atletas (para obligar a filtrar).
    if (!athleteCategoryFilter) return [];
    return athleteList.filter((athlete) => {
      const categoryValue =
        athlete.categoryId || athlete.categoryName || athlete.category || "Sin categoría";
      const targetValue = normalize(athleteCategoryFilter);
      const targetLabel = normalize(
        athleteCategoryLabel ||
          categoryOptions.find((opt) => String(opt.value) === String(athleteCategoryFilter))
            ?.label
      );
      const athleteKey =
        athlete.categoryKey || normalize(categoryValue);
      return (
        normalize(categoryValue) === targetValue ||
        athleteKey === targetValue ||
        athleteKey === targetLabel
      );
    });
  }, [athleteCategoryFilter, athleteCategoryLabel, athleteList, categoryOptions]);

  const athleteOptions = useMemo(() => {
    const source =
      categoryAthletes.length > 0 ? categoryAthletes : filteredAthletes;
    return source.map((athlete) => {
      const label =
        athlete.label ||
        athlete.name ||
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
    });
  }, [categoryAthletes, filteredAthletes]);

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

  const handleCategoryFilterChange = (e) => {
    const { value } = e.target;
    const option = categoryOptions.find((opt) => String(opt.value) === String(value));
    setAthleteCategoryFilter(value);
    setAthleteCategoryLabel(option?.label || "");
    setValues((prev) => ({
      ...prev,
      athleteId: "",
    }));
    setCategoryAthletes([]);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      setAthleteCategoryFilter("");
      return;
    }

    if (initialData) {
      const startDate = initialData.start ? new Date(initialData.start) : null;
      const endDate = initialData.end ? new Date(initialData.end) : null;
      const duration =
        startDate && endDate
          ? Math.max(15, Math.round((endDate - startDate) / 60000))
          : initialAppointmentValues.durationMinutes;

      const nextAthleteId =
        initialData.athleteId ||
        initialData.athlete ||
        initialData.athlete?.id ||
        defaultAthleteId ||
        "";

      const athleteMatch = athleteList.find(
        (ath) => String(ath.id || ath.athleteId) === String(nextAthleteId)
      );

      setAthleteCategoryFilter(athleteMatch?.categoryId || "");

      setValues({
        ...initialAppointmentValues,
        athleteId: nextAthleteId,
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
      setValues({
        ...initialAppointmentValues,
        athleteId: defaultAthleteId || "",
      });
      setAthleteCategoryFilter("");
      setCategoryAthletes([]);
    }
  }, [isOpen, initialData, resetForm, setValues, defaultAthleteId, athleteList]);

  // Cargar deportistas por categoría cuando se selecciona
  useEffect(() => {
    const loadByCategory = async () => {
      if (!athleteCategoryFilter || athleteCategoryFilter === "Sin categoría") {
        setCategoryAthletes([]);
        return;
      }
      setLoadingCategoryAthletes(true);
      try {
        const response = await apiClient.get(
          `/sports-categories/${athleteCategoryFilter}/athletes`,
          { page: 1, limit: 200, status: "Active" }
        );
        const list = response?.data?.data || response?.data || [];
        const normalized = Array.isArray(list)
          ? list.map((athlete) => ({
              id: athlete.id || athlete.athleteId || athlete.athlete?.id,
              athleteId: athlete.id || athlete.athleteId || athlete.athlete?.id,
              label:
                athlete.nombre ||
                athlete.fullName ||
                athlete.name ||
                athlete.athlete?.name ||
                "",
              nombres:
                athlete.nombres ||
                athlete.firstName ||
                athlete.athlete?.firstName ||
                "",
              apellidos:
                athlete.apellidos ||
                athlete.lastName ||
                athlete.athlete?.lastName ||
                "",
              categoryId:
                athlete.sportsCategoryId ||
                athlete.categoryId ||
                athlete.category?.id ||
                athlete.categoriaId ||
                athlete.category ||
                athlete.categoria ||
                null,
              categoryName:
                athlete.categoryName ||
                athlete.category?.name ||
                athlete.categoria ||
                "",
              categoryKey: normalize(
                athlete.categoryId ||
                  athlete.categoryName ||
                  athlete.category?.name ||
                  athlete.categoria ||
                  ""
              ),
            }))
          : [];
        setCategoryAthletes(normalized);
      } catch (error) {
        console.error("Error cargando deportistas por categoría:", error);
        setCategoryAthletes([]);
      } finally {
        setLoadingCategoryAthletes(false);
      }
    };

    loadByCategory();
  }, [athleteCategoryFilter]);

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

  const modalContent = (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col"
        style={{ zIndex: 10001 }}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-primary-purple to-primary-blue p-4 sm:p-5 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            aria-label="Cerrar"
          >
            &times;
          </button>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-center">
            {initialData && initialData.id ? "Editar Cita" : "Crear Nueva Cita"}
          </h2>
          <p className="text-sm text-white/80 text-center mt-1">
            Agenda la cita seleccionando categoría, deportista y especialista.
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleFormSubmit();
          }}
          className="flex-1 flex flex-col"
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {/* Datos del deportista */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
              <div className="text-sm font-semibold text-gray-700 mb-3">
                Datos del deportista
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  label="Categoría deportiva"
                  name="athleteCategoryFilter"
                  type="select"
                  options={categoryOptions}
                  value={athleteCategoryFilter}
                  onChange={handleCategoryFilterChange}
                  disabled={loadingAthletes || categoriesLoading || lockAthlete}
                  placeholder={
                    categoriesLoading
                      ? "Cargando categorías..."
                      : categoryOptions.length === 0
                      ? "No hay categorías registradas"
                      : "Seleccione categoría"
                  }
                />
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
                  disabled={
                    loadingAthletes ||
                    categoriesLoading ||
                    loadingCategoryAthletes ||
                    lockAthlete ||
                    !athleteCategoryFilter
                  }
                  placeholder={
                    !athleteCategoryFilter
                      ? "Seleccione una categoría primero"
                      : loadingAthletes || loadingCategoryAthletes
                      ? "Cargando deportistas..."
                      : athleteOptions.length === 0
                      ? "Sin deportistas en esta categoría"
                      : "Seleccione un deportista"
                  }
                />
              </div>
            </div>

            {/* Especialidad y profesional */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
              <div className="text-sm font-semibold text-gray-700 mb-3">
                Profesional y especialidad
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

              {selectedSpecialist && (
                <div className="mt-3 rounded-lg border border-[#e9e7ff] bg-[#f8f7ff] px-4 py-3 text-sm text-gray-700">
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
              )}
            </div>

            {/* Programación */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm space-y-3">
              <div className="text-sm font-semibold text-gray-700">
                Programación
              </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              {scheduleInfo?.text && (
                <div
                  className={`rounded-lg border px-3 py-2 text-xs ${SCHEDULE_INFO_STYLES[scheduleInfo.tone]}`}
                >
                  {scheduleInfo.text}
                </div>
              )}
            </div>

            {/* Detalle */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
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

          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-gray-600">
                Verifique que la fecha esté dentro del horario del especialista.
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-all duration-200 font-medium shadow-lg"
                >
                  {initialData && initialData.id ? "Guardar Cambios" : "Agendar Cita"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
};

export default AppointmentForm;
