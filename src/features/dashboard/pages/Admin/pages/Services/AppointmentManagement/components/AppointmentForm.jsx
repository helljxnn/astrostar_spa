import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { addMinutes } from "date-fns";
import { FaRunning, FaUserMd, FaCalendarAlt, FaFileAlt, FaSyncAlt, FaInfoCircle } from "react-icons/fa";
import { FormField } from "../../../../../../../../shared/components/FormField";
import SearchableSelect from "../../../../../../../../shared/components/SearchableSelect";
import { DatePickerField } from "../../../../../../../../shared/components/DatePickerField";
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts.js";
import apiClient from "../../../../../../../../shared/services/apiClient";

const DURATION_OPTIONS = [
  { value: "30", label: "30 minutos" },
  { value: "45", label: "45 minutos" },
  { value: "60", label: "60 minutos" },
  { value: "90", label: "90 minutos" },
  { value: "120", label: "120 minutos" },
];

const MAX_DESCRIPTION_LENGTH = 500;

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
  lockSpecialist = false,
  defaultSpecialistId = "",
  existingAppointments = [],
}) => {
  const [formData, setFormData] = useState({
    athleteId: "",
    specialty: "",
    specialistId: "",
    description: "",
    start: null,
    durationMinutes: "60",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [athletesByCategory, setAthletesByCategory] = useState([]);
  const [loadingAthletes2, setLoadingAthletes2] = useState(false);
  const [specialistSchedules, setSpecialistSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [athleteDateWarning, setAthleteDateWarning] = useState(null);

  // Resetear formulario
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        athleteId: "",
        specialty: "",
        specialistId: "",
        description: "",
        start: null,
        durationMinutes: "60",
      });
      setSelectedCategory("");
      setErrors({});
      setTouched({});
      setAthletesByCategory([]);
      setAthleteDateWarning(null);
      return;
    }

    if (initialData) {
      const startDate = initialData.start ? new Date(initialData.start) : null;
      const endDate = initialData.end ? new Date(initialData.end) : null;
      const duration =
        startDate && endDate
          ? Math.max(15, Math.round((endDate - startDate) / 60000))
          : "60";

      // Auto-completar especialidad desde el especialista bloqueado
      const autoSpecialty = lockSpecialist && defaultSpecialistId
        ? specialistList.find(s => String(s.id) === String(defaultSpecialistId))?.specialty || initialData.specialty || ""
        : initialData.specialty || "";

      setFormData({
        athleteId: initialData.athleteId || defaultAthleteId || "",
        specialty: autoSpecialty,
        specialistId: initialData.specialistId || defaultSpecialistId || "",
        description: initialData.description || "",
        start: startDate,
        durationMinutes: String(duration),
      });
    } else {
      // Auto-completar especialidad desde el especialista bloqueado
      const autoSpecialty = lockSpecialist && defaultSpecialistId
        ? specialistList.find(s => String(s.id) === String(defaultSpecialistId))?.specialty || ""
        : "";

      setFormData({
        athleteId: defaultAthleteId || "",
        specialty: autoSpecialty,
        specialistId: defaultSpecialistId || "",
        description: "",
        start: null,
        durationMinutes: "60",
      });
    }
  }, [isOpen, initialData, defaultAthleteId, defaultSpecialistId, lockSpecialist, specialistList]);

  // Validación en tiempo real: deportista ya tiene cita ese día
  useEffect(() => {
    const { athleteId, start } = formData;
    if (!athleteId || !start || !existingAppointments.length) {
      setAthleteDateWarning(null);
      return;
    }

    const selectedDay = new Date(start);
    selectedDay.setHours(0, 0, 0, 0);

    const conflict = existingAppointments.find((appt) => {
      if (String(appt.athleteId) !== String(athleteId)) return false;
      if (appt.status === "Cancelado") return false;
      if (initialData?.id && appt.id === initialData.id) return false;

      const apptDay = new Date(appt.appointmentDate || appt.date || appt.start);
      apptDay.setHours(0, 0, 0, 0);
      return apptDay.getTime() === selectedDay.getTime();
    });

    if (conflict) {
      const timeLabel = conflict.startTime || conflict.time || "";
      setAthleteDateWarning(
        `Este deportista ya tiene una cita programada el ${selectedDay.toLocaleDateString("es-ES", { weekday: "long", day: "2-digit", month: "long" })}${timeLabel ? ` a las ${timeLabel}` : ""}. Por favor elige otro horario.`
      );
    } else {
      setAthleteDateWarning(null);
    }
  }, [formData.athleteId, formData.start, existingAppointments, initialData]);

  // Cargar deportistas por categoría
  useEffect(() => {
    if (!selectedCategory) {
      setAthletesByCategory([]);
      return;
    }

    const loadAthletes = async () => {
      setLoadingAthletes2(true);
      try {
        const response = await apiClient.get(
          `/sports-categories/${selectedCategory}/athletes`,
          { page: 1, limit: 100 }
        );

        const list = response?.data?.data || response?.data || [];
        const normalized = Array.isArray(list)
          ? list.map((athlete) => ({
              id: athlete.id || athlete.athleteId,
              name: athlete.nombre || athlete.fullName || athlete.name || "",
              firstName: athlete.nombres || athlete.firstName || "",
              lastName: athlete.apellidos || athlete.lastName || "",
            }))
          : [];

        setAthletesByCategory(normalized);
      } catch (error) {
        console.error("Error:", error);
        setAthletesByCategory([]);
      } finally {
        setLoadingAthletes2(false);
      }
    };

    loadAthletes();
  }, [selectedCategory]);

  // Función para parsear customRecurrence
  const parseCustomRecurrence = useCallback((value) => {
    if (!value) return null;
    if (typeof value === "object") return value;
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn("Error parseando customRecurrence:", error);
      return null;
    }
  }, []);

  // Cargar horarios del especialista seleccionado
  useEffect(() => {
    if (!formData.specialistId) {
      setSpecialistSchedules([]);
      return;
    }

    const loadSchedules = async () => {
      setLoadingSchedules(true);
      try {
        const response = await apiClient.get(`/schedules/employee/${formData.specialistId}`);
        const schedules = response?.data?.data || response?.data || [];
        
        // Parsear customRecurrence si viene como string
        const parsedSchedules = Array.isArray(schedules) 
          ? schedules.map(schedule => ({
              ...schedule,
              customRecurrence: parseCustomRecurrence(schedule.customRecurrence)
            }))
          : [];
        
        setSpecialistSchedules(parsedSchedules);
      } catch (error) {
        console.error("Error cargando horarios:", error);
        setSpecialistSchedules([]);
      } finally {
        setLoadingSchedules(false);
      }
    };

    loadSchedules();
  }, [formData.specialistId, isOpen, parseCustomRecurrence]); // Recargar cuando se abre el modal

  // Función para refrescar horarios manualmente
  const refreshSchedules = useCallback(async () => {
    if (!formData.specialistId) return;
    
    setLoadingSchedules(true);
    try {
      const response = await apiClient.get(`/schedules/employee/${formData.specialistId}`);
      const schedules = response?.data?.data || response?.data || [];
      
      // Parsear customRecurrence si viene como string
      const parsedSchedules = Array.isArray(schedules) 
        ? schedules.map(schedule => ({
            ...schedule,
            customRecurrence: parseCustomRecurrence(schedule.customRecurrence)
          }))
        : [];
      
      setSpecialistSchedules(parsedSchedules);
    } catch (error) {
      console.error("Error cargando horarios:", error);
      showErrorAlert("Error", "No se pudieron cargar los horarios");
    } finally {
      setLoadingSchedules(false);
    }
  }, [formData.specialistId, parseCustomRecurrence]);

  // Opciones de categorías
  const categoryOptions = useMemo(() => {
    if (!sportsCategoryOptions || sportsCategoryOptions.length === 0) {
      return [];
    }

    return sportsCategoryOptions.map((cat) => ({
      value: String(cat.id || cat.value || cat.categoryId || ""),
      label: String(cat.name || cat.label || cat.nombre || ""),
    }));
  }, [sportsCategoryOptions]);

  // Opciones de deportistas
  const athleteOptions = useMemo(() => {
    const source = athletesByCategory.length > 0 ? athletesByCategory : [];
    return source.map((athlete) => ({
      value: String(athlete.id),
      label: `${athlete.firstName} ${athlete.lastName}`.trim() || athlete.name || "Deportista",
    }));
  }, [athletesByCategory]);

  // Opciones de especialistas
  const filteredSpecialists = useMemo(() => {
    if (lockSpecialist && defaultSpecialistId) {
      return specialistList.filter(s => String(s.id) === String(defaultSpecialistId));
    }
    if (!formData.specialty) return specialistList;
    return specialistList.filter((spec) => spec.specialty === formData.specialty);
  }, [specialistList, formData.specialty, lockSpecialist, defaultSpecialistId]);

  const specialistOptions = useMemo(
    () =>
      filteredSpecialists.map((specialist) => {
        const name = specialist.label || specialist.nombre || "Especialista";
        const role = specialist.cargo || specialist.role || "";
        const specialty = specialist.specialtyLabel || "";
        
        // Formato: Nombre - Rol (Especialidad)
        if (role && specialty) {
          return {
            value: String(specialist.id || specialist.specialistId),
            label: `${name} - ${role} (${specialty})`,
          };
        }
        // Si solo tiene especialidad
        if (specialty) {
          return {
            value: String(specialist.id || specialist.specialistId),
            label: `${name} (${specialty})`,
          };
        }
        // Si solo tiene rol
        if (role) {
          return {
            value: String(specialist.id || specialist.specialistId),
            label: `${name} - ${role}`,
          };
        }
        // Solo nombre
        return {
          value: String(specialist.id || specialist.specialistId),
          label: name,
        };
      }),
    [filteredSpecialists]
  );

  const handleChange = (e) => {
    if (!e || !e.target) {
      console.warn('handleChange called without valid event');
      return;
    }
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setFormData((prev) => ({ ...prev, athleteId: "" }));
    setTouched((prev) => ({ ...prev, athleteId: false }));
  };

  const handleSpecialtyChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value, specialistId: "" }));
    setTouched((prev) => ({ ...prev, [name]: true, specialistId: false }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, start: date }));
    setTouched((prev) => ({ ...prev, start: true }));
  };

  // Funciones auxiliares para cálculo de diferencias de tiempo
  const differenceInDays = useCallback((dateA, dateB) => {
    const a = new Date(dateA);
    const b = new Date(dateB);
    a.setHours(0, 0, 0, 0);
    b.setHours(0, 0, 0, 0);
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.floor((a - b) / msPerDay);
  }, []);

  const differenceInWeeks = useCallback((dateA, dateB) => {
    return Math.floor(differenceInDays(dateA, dateB) / 7);
  }, [differenceInDays]);

  const differenceInMonths = useCallback((dateA, dateB) => {
    const a = new Date(dateA);
    const b = new Date(dateB);
    a.setHours(0, 0, 0, 0);
    b.setHours(0, 0, 0, 0);
    return (a.getFullYear() - b.getFullYear()) * 12 + (a.getMonth() - b.getMonth());
  }, []);

  const differenceInYears = useCallback((dateA, dateB) => {
    const a = new Date(dateA);
    const b = new Date(dateB);
    return a.getFullYear() - b.getFullYear();
  }, []);

  // Verificar si un horario aplica para una fecha (considerando recurrencias)
  const isScheduleActiveOnDate = useCallback((schedule, targetDate) => {
    if (!schedule?.scheduleDate) return false;
    
    const scheduleDate = new Date(schedule.scheduleDate);
    scheduleDate.setHours(0, 0, 0, 0);
    const checkDate = new Date(targetDate);
    checkDate.setHours(0, 0, 0, 0);
    
    // Si la fecha objetivo es anterior a la fecha del horario, no aplica
    if (checkDate < scheduleDate) return false;
    
    const recurrence = (schedule.recurrence || schedule.repeticion || 'no').toLowerCase();
    
    // Sin recurrencia: solo aplica el día exacto
    if (recurrence === 'no') {
      return checkDate.getTime() === scheduleDate.getTime();
    }
    
    // Recurrencia diaria
    if (recurrence === 'dia' || recurrence === 'diaria') {
      return true;
    }
    
    // Recurrencia semanal: mismo día de la semana
    if (recurrence === 'semana' || recurrence === 'semanal') {
      return checkDate.getDay() === scheduleDate.getDay();
    }
    
    // Recurrencia mensual: mismo día del mes
    if (recurrence === 'mes' || recurrence === 'mensual') {
      return checkDate.getDate() === scheduleDate.getDate();
    }
    
    // Recurrencia anual: mismo día y mes
    if (recurrence === 'año' || recurrence === 'anual' || recurrence === 'anio') {
      return checkDate.getDate() === scheduleDate.getDate() && 
             checkDate.getMonth() === scheduleDate.getMonth();
    }
    
    // Recurrencia laboral: lunes a viernes
    if (recurrence === 'laboral') {
      const day = checkDate.getDay();
      return day >= 1 && day <= 5;
    }
    
    // Recurrencia personalizada (lógica mejorada basada en el backend)
    if (recurrence === 'personalizado' && schedule.customRecurrence) {
      const custom = schedule.customRecurrence;
      const interval = Number(custom.interval) || 1;
      const frequency = (custom.frequency || 'semana').toLowerCase();
      const dias = Array.isArray(custom.dias) ? custom.dias : [];
      const endType = custom.endType || '';
      const endDateValue = endType === 'el' 
        ? custom.endDate 
        : endType === 'despues' 
          ? custom.afterDate 
          : custom.endDate || custom.afterDate;

      // Verificar fecha límite
      if (endDateValue) {
        const limit = new Date(endDateValue);
        limit.setHours(0, 0, 0, 0);
        if (checkDate > limit) return false;
      }

      // Si es la fecha base, siempre es válida
      if (checkDate.getTime() === scheduleDate.getTime()) {
        return true;
      }

      // Si hay días específicos de la semana
      if (dias.length > 0) {
        const daysDiff = differenceInDays(checkDate, scheduleDate);
        const weeksDiff = differenceInWeeks(checkDate, scheduleDate);

        // Verificar intervalo según frecuencia
        if (frequency === 'dia' && daysDiff % interval !== 0) return false;
        if (frequency === 'semana' && weeksDiff % interval !== 0) return false;
        if ((frequency === 'mes' || frequency === 'anio') && daysDiff % 7 !== 0) {
          return false;
        }

        // Verificar si el día de la semana está en la lista
        return dias.includes(checkDate.getDay());
      }

      // Sin días específicos, usar solo la frecuencia
      if (frequency === 'dia') {
        return differenceInDays(checkDate, scheduleDate) % interval === 0;
      }
      if (frequency === 'semana') {
        return checkDate.getDay() === scheduleDate.getDay() &&
               differenceInWeeks(checkDate, scheduleDate) % interval === 0;
      }
      if (frequency === 'mes') {
        return checkDate.getDate() === scheduleDate.getDate() &&
               differenceInMonths(checkDate, scheduleDate) % interval === 0;
      }
      if (frequency === 'anio' || frequency === 'año') {
        return checkDate.getDate() === scheduleDate.getDate() &&
               checkDate.getMonth() === scheduleDate.getMonth() &&
               differenceInYears(checkDate, scheduleDate) % interval === 0;
      }
    }
    
    return false;
  }, [differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears]);

  // Filtrar días disponibles según horarios del especialista
  const filterAvailableDates = useCallback((date) => {
    if (!formData.specialistId || specialistSchedules.length === 0) {
      return true; // Si no hay especialista seleccionado, permitir todos los días
    }

    // Verificar si hay algún horario activo para esta fecha
    const hasActiveSchedule = specialistSchedules.some((schedule) => {
      return isScheduleActiveOnDate(schedule, date);
    });

    return hasActiveSchedule;
  }, [formData.specialistId, specialistSchedules, isScheduleActiveOnDate]);

  // Filtrar horas disponibles según horarios del especialista
  const filterAvailableTimes = useCallback((time) => {
    if (!formData.specialistId || specialistSchedules.length === 0) {
      return false; // Si no hay especialista seleccionado, no mostrar horas
    }

    const timeDate = new Date(time);
    const selectedDate = timeDate;
    
    // Verificar si hay algún horario activo para esta fecha y hora
    const hasActiveSchedule = specialistSchedules.some((schedule) => {
      // Verificar si el horario aplica para esta fecha (considerando recurrencias)
      const isActive = isScheduleActiveOnDate(schedule, selectedDate);
      
      if (!isActive) {
        return false;
      }

      // Verificar si la hora está dentro del rango del horario
      if (!schedule.startTime || !schedule.endTime) {
        return false;
      }

      const [startHour, startMin] = schedule.startTime.split(':').map(Number);
      const [endHour, endMin] = schedule.endTime.split(':').map(Number);
      
      const timeHours = timeDate.getHours();
      const timeMinutes = timeDate.getMinutes();
      const timeInMinutes = timeHours * 60 + timeMinutes;
      const startInMinutes = startHour * 60 + startMin;
      const endInMinutes = endHour * 60 + endMin;
      
      const isInRange = timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
      
      return isInRange;
    });

    return hasActiveSchedule;
  }, [formData.specialistId, specialistSchedules, isScheduleActiveOnDate]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.athleteId) newErrors.athleteId = "Seleccione un deportista";
    if (!formData.specialty) newErrors.specialty = "Seleccione una especialidad";
    if (!formData.specialistId) newErrors.specialistId = "Seleccione un especialista";
    if (!formData.description?.trim()) newErrors.description = "Ingrese una descripción";
    if (!formData.start) newErrors.start = "Seleccione fecha y hora";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Marcar todos como touched
    setTouched({
      athleteId: true,
      specialty: true,
      specialistId: true,
      description: true,
      start: true,
    });

    if (!validateForm()) {
      showErrorAlert("Error de validación", "Por favor complete todos los campos requeridos");
      return;
    }

    const duration = Number(formData.durationMinutes);
    const end = addMinutes(formData.start, duration);

    onSave({
      ...formData,
      athleteId: Number(formData.athleteId),
      specialistId: Number(formData.specialistId),
      durationMinutes: duration,
      end,
    });
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white rounded-t-3xl border-b border-gray-200 px-6 py-5 relative">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-purple">
              {initialData?.id ? "Editar cita" : "Nueva cita"}
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData?.id ? "Actualiza la informacion" : "Agendar cita"}
            </h2>
            <p className="text-sm text-gray-500">
              Completa los datos basicos para programar la atencion.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors text-2xl leading-none p-1 rounded-full hover:bg-gray-100"
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col min-h-0 bg-gray-50"
        >
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">

            {/* Deportista */}
            <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Deportista</p>
                <h3 className="text-lg font-semibold text-gray-800">Seleccion y categoria</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Categoria Deportiva
                  </label>
                  <SearchableSelect
                    options={categoryOptions}
                    value={selectedCategory}
                    onChange={(val) => handleCategoryChange({ target: { value: val } })}
                    loading={loadingCategories}
                    disabled={loadingCategories || lockAthlete}
                    placeholder={
                      loadingCategories
                        ? "Cargando categorias..."
                        : categoryOptions.length === 0
                        ? "No hay categorias disponibles"
                        : "Buscar categoria..."
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Deportista <span className="text-red-500 ml-1">*</span>
                  </label>
                  <SearchableSelect
                    options={athleteOptions}
                    value={formData.athleteId}
                    onChange={(val) => handleChange({ target: { name: "athleteId", value: val } })}
                    loading={loadingAthletes2}
                    disabled={!selectedCategory || lockAthlete}
                    placeholder={
                      !selectedCategory
                        ? "Seleccione una categoria primero"
                        : loadingAthletes2
                        ? "Cargando deportistas..."
                        : athleteOptions.length === 0
                        ? "No hay deportistas en esta categoria"
                        : "Buscar deportista..."
                    }
                    error={touched.athleteId && errors.athleteId ? errors.athleteId : ""}
                  />
                </div>
              </div>
            </section>

            {/* Especialista */}
            <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Profesional de salud</p>
                <h3 className="text-lg font-semibold text-gray-800">Especialidad y especialista</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Especialidad <span className="text-red-500 ml-1">*</span>
                  </label>
                  <SearchableSelect
                    options={specialtyOptions}
                    value={formData.specialty}
                    onChange={(val) => handleSpecialtyChange({ target: { name: "specialty", value: val } })}
                    loading={loadingSpecialists}
                    disabled={loadingSpecialists || lockSpecialist}
                    placeholder="Buscar especialidad..."
                    error={touched.specialty && errors.specialty ? errors.specialty : ""}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Especialista <span className="text-red-500 ml-1">*</span>
                  </label>
                  <SearchableSelect
                    options={specialistOptions}
                    value={formData.specialistId}
                    onChange={(val) => handleChange({ target: { name: "specialistId", value: val } })}
                    loading={loadingSpecialists}
                    disabled={lockSpecialist || !formData.specialty}
                    placeholder={
                      lockSpecialist
                        ? specialistOptions.find(o => o.value === String(formData.specialistId))?.label || "Especialista asignado"
                        : !formData.specialty
                        ? "Seleccione una especialidad primero"
                        : "Buscar especialista..."
                    }
                    error={touched.specialistId && errors.specialistId ? errors.specialistId : ""}
                  />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Programacion
                </p>
                <h3 className="text-lg font-semibold text-gray-800">
                  Fecha, hora y duracion
                </h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <DatePickerField
                    label="Seleccione fecha y hora"
                    selected={formData.start}
                    onChange={handleDateChange}
                    timeIntervals={15}
                    error={errors.start}
                    touched={touched.start}
                    required
                    placeholder="Seleccione fecha y hora"
                    minDate={new Date()}
                    filterDate={filterAvailableDates}
                    filterTime={filterAvailableTimes}
                    disabled={!formData.specialistId || loadingSchedules}
                  />
                  {athleteDateWarning && (
                    <div className="mt-2 flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2">
                      <svg className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>{athleteDateWarning}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <FormField
                    label="Duracion de la cita"
                    name="durationMinutes"
                    type="select"
                    options={DURATION_OPTIONS}
                    value={formData.durationMinutes}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {loadingSchedules && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span>Cargando horarios disponibles...</span>
                </div>
              )}
              
              {formData.specialistId && !loadingSchedules && specialistSchedules.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>El especialista no tiene horarios configurados. Crea un horario primero.</span>
                </div>
              )}

              {formData.specialistId && !loadingSchedules && specialistSchedules.length > 0 && (
                <div className="flex items-center justify-between gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{specialistSchedules.length} horario{specialistSchedules.length !== 1 ? 's' : ''} disponible{specialistSchedules.length !== 1 ? 's' : ''}</span>
                  </div>
                  <button
                    type="button"
                    onClick={refreshSchedules}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-100 rounded-md transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refrescar
                  </button>
                </div>
              )}

              {!formData.specialistId && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Seleccione un especialista para ver horarios disponibles</span>
                </div>
              )}
            </section>

            <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Motivo
                </p>
                <h3 className="text-lg font-semibold text-gray-800">
                  Descripcion de la cita
                </h3>
              </div>
              <FormField
                label="Descripcion"
                name="description"
                type="textarea"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.description}
                touched={touched.description}
                required
                placeholder="Describa el motivo de la cita..."
                rows={4}
                helperText={
                  formData.description.length > MAX_DESCRIPTION_LENGTH
                    ? `${formData.description.length}/${MAX_DESCRIPTION_LENGTH} caracteres (excedido por ${formData.description.length - MAX_DESCRIPTION_LENGTH})`
                    : `${formData.description.length}/${MAX_DESCRIPTION_LENGTH} caracteres`
                }
              />
            </section>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-white rounded-b-3xl">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium shadow-lg"
              >
                {initialData?.id ? "Guardar Cambios" : "Agendar Cita"}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AppointmentForm;



