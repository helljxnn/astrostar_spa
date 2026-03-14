import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { addMinutes } from "date-fns";
import { FormField } from "../../../../../../../../shared/components/FormField";
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
      return;
    }

    if (initialData) {
      const startDate = initialData.start ? new Date(initialData.start) : null;
      const endDate = initialData.end ? new Date(initialData.end) : null;
      const duration =
        startDate && endDate
          ? Math.max(15, Math.round((endDate - startDate) / 60000))
          : "60";

      setFormData({
        athleteId: initialData.athleteId || defaultAthleteId || "",
        specialty: initialData.specialty || "",
        specialistId: initialData.specialistId || "",
        description: initialData.description || "",
        start: startDate,
        durationMinutes: String(duration),
      });
    } else {
      setFormData({
        athleteId: defaultAthleteId || "",
        specialty: "",
        specialistId: "",
        description: "",
        start: null,
        durationMinutes: "60",
      });
    }
  }, [isOpen, initialData, defaultAthleteId]);

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
        setSpecialistSchedules(Array.isArray(schedules) ? schedules : []);
      } catch (error) {
        console.error("Error cargando horarios:", error);
        setSpecialistSchedules([]);
      } finally {
        setLoadingSchedules(false);
      }
    };

    loadSchedules();
  }, [formData.specialistId]);

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
    if (!formData.specialty) return specialistList;
    return specialistList.filter((spec) => spec.specialty === formData.specialty);
  }, [specialistList, formData.specialty]);

  const specialistOptions = useMemo(
    () =>
      filteredSpecialists.map((specialist) => ({
        value: String(specialist.id || specialist.specialistId),
        label: specialist.label || specialist.nombre || "Especialista",
      })),
    [filteredSpecialists]
  );

  const handleChange = (e) => {
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

  // Filtrar horas disponibles según horarios del especialista
  const filterAvailableTimes = (time) => {
    if (!formData.specialistId || specialistSchedules.length === 0) {
      return true; // Si no hay especialista seleccionado, mostrar todas las horas
    }

    const selectedDate = formData.start || new Date();
    const timeDate = new Date(time);
    
    // Verificar si hay algún horario activo para esta fecha
    const hasActiveSchedule = specialistSchedules.some((schedule) => {
      const scheduleDate = new Date(schedule.scheduleDate);
      const isSameDay = 
        scheduleDate.getFullYear() === selectedDate.getFullYear() &&
        scheduleDate.getMonth() === selectedDate.getMonth() &&
        scheduleDate.getDate() === selectedDate.getDate();
      
      if (!isSameDay) return false;

      // Verificar si la hora está dentro del rango del horario
      const [startHour, startMin] = schedule.startTime.split(':').map(Number);
      const [endHour, endMin] = schedule.endTime.split(':').map(Number);
      
      const scheduleStart = new Date(selectedDate);
      scheduleStart.setHours(startHour, startMin, 0, 0);
      
      const scheduleEnd = new Date(selectedDate);
      scheduleEnd.setHours(endHour, endMin, 0, 0);
      
      return timeDate >= scheduleStart && timeDate <= scheduleEnd;
    });

    return hasActiveSchedule;
  };

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <section className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Deportista
                  </p>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Seleccion y categoria
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Categoria Deportiva"
                    name="category"
                    type="select"
                    options={categoryOptions}
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    disabled={loadingCategories || lockAthlete}
                    placeholder={
                      loadingCategories
                        ? "Cargando categorias..."
                        : categoryOptions.length === 0
                        ? "No hay categorias disponibles"
                        : "Seleccione una categoria"
                    }
                  />
                  <FormField
                    label="Deportista"
                    name="athleteId"
                    type="select"
                    options={athleteOptions}
                    value={formData.athleteId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.athleteId}
                    touched={touched.athleteId}
                    required
                    disabled={!selectedCategory || loadingAthletes2 || lockAthlete}
                    placeholder={
                      !selectedCategory
                        ? "Seleccione una categoria primero"
                        : loadingAthletes2
                        ? "Cargando deportistas..."
                        : athleteOptions.length === 0
                        ? "No hay deportistas en esta categoria"
                        : "Seleccione un deportista"
                    }
                  />
                </div>
              </section>

              <section className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Profesional de salud
                  </p>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Especialidad y especialista
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Especialidad"
                    name="specialty"
                    type="select"
                    options={specialtyOptions}
                    value={formData.specialty}
                    onChange={handleSpecialtyChange}
                    onBlur={handleBlur}
                    error={errors.specialty}
                    touched={touched.specialty}
                    required
                    disabled={loadingSpecialists}
                    placeholder="Seleccione una especialidad"
                  />
                  <FormField
                    label="Especialista"
                    name="specialistId"
                    type="select"
                    options={specialistOptions}
                    value={formData.specialistId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.specialistId}
                    touched={touched.specialistId}
                    required
                    disabled={!formData.specialty || loadingSpecialists}
                    placeholder={
                      !formData.specialty
                        ? "Seleccione una especialidad primero"
                        : "Seleccione un especialista"
                    }
                  />
                </div>
              </section>
            </div>

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
                    filterTime={filterAvailableTimes}
                    disabled={!formData.specialistId || loadingSchedules}
                  />
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
                  <span>El especialista no tiene horarios configurados</span>
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



