import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { FormField } from "../../../../../../../../shared/components/FormField";
import { useFormScheduleValidation } from "../hooks/useFormSchedulealidation";
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts";
import CustomRecurrenceModal from "./CustomRecurrenceModal";

export default function ScheduleModal({
  onClose,
  onSave,
  schedule,
  isNew,
  employeesOptions = [],
  isReadOnly = false,
  isLoadingEmployees = false,
}) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [form, setForm] = useState({
    empleadoId: "",
    empleado: "",
    cargo: "",
    fecha: "",
    horaInicio: "",
    horaFin: "",
    repeticion: "no",
    customRecurrence: null,
    descripcion: "",
    estado: "Programado",
  });
  const [originalForm, setOriginalForm] = useState(null);

  const { errors, touched, validate, handleBlur, handleChangeValidation, touchAllFields, hasChanges } =
    useFormScheduleValidation();

  const employeesMap = useMemo(() => {
    const map = {};
    employeesOptions.forEach((emp) => {
      map[emp.value] = emp;
    });
    return map;
  }, [employeesOptions]);

  useEffect(() => {
    if (!schedule) return;
    const filledForm = {
      empleadoId: schedule.empleadoId || "",
      empleado: schedule.empleado || "",
      cargo: schedule.cargo || "",
      fecha: schedule.fecha || "",
      horaInicio: schedule.horaInicio || "",
      horaFin: schedule.horaFin || "",
      repeticion: schedule.repeticion || "no",
      customRecurrence: schedule.customRecurrence || null,
      descripcion:
        schedule.descripcion ||
        schedule.observaciones ||
        schedule.detalle ||
        schedule.motivo ||
        "",
      estado: schedule.estado || "Programado",
      id: schedule.id || null,
    };
    setForm(filledForm);
    if (!isNew) setOriginalForm(filledForm);
  }, [schedule, isNew]);

  const handleChange = (name, value) => {
    if (isReadOnly) return;
    if (name === "repeticion") {
      if (value === "personalizado") {
        setShowCustomModal(true);
      }
      setForm((prev) => ({
        ...prev,
        repeticion: value,
        customRecurrence: value === "personalizado" ? prev.customRecurrence : null,
      }));
      handleChangeValidation(name, value, { ...form, repeticion: value });
      return;
    }
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);
    handleChangeValidation(name, value, nextForm);
  };

  const handleEmployeeChange = (value) => {
    if (isReadOnly) return;
    const parsedValue = value || "";
    const emp = employeesMap[parsedValue] || employeesMap[Number(parsedValue)];
    setForm((prev) => ({
      ...prev,
      empleadoId: parsedValue,
      empleado: emp?.label || "",
      cargo: emp?.cargo || "",
    }));
    handleChangeValidation("empleadoId", parsedValue, { ...form, empleadoId: parsedValue });
  };

  const handleSubmit = async () => {
    if (isReadOnly) return;
    touchAllFields(form);

    if (!form.empleadoId) {
      showErrorAlert("Error", "Debes seleccionar un empleado.");
      return;
    }

    if (!validate(form)) return;

    if (!form.descripcion?.trim()) {
      showErrorAlert("La descripcion es obligatoria.");
      return;
    }

    if (!isNew && originalForm && !hasChanges(originalForm, form)) {
      showErrorAlert("No se realizaron cambios para actualizar.");
      return;
    }

    const horarioFinal = {
      ...form,
      observaciones: form.descripcion,
      descripcion: form.descripcion,
      id: schedule?.id || form.id || Date.now(),
    };

    try {
      await onSave(horarioFinal);
      onClose();
    } catch (error) {
      // Errores manejados por el padre
    }
  };

  const recurrenceLabel =
    form.repeticion === "personalizado" && form.customRecurrence
      ? form.customRecurrence.label
      : "";

  const disabledFields = isReadOnly;

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden border border-gray-100"
        >
          <div className="relative px-10 py-6 border-b border-gray-200 bg-gradient-to-r from-[#eef2ff] via-white to-[#e8f8ff] text-center">
            <h2 className="text-3xl font-semibold text-[#8aa9ff]">
              {isNew ? "Crear Horario" : isReadOnly ? "Detalle del Horario" : "Editar Horario"}
            </h2>
            {isReadOnly && (
              <p className="text-sm text-gray-500 mt-1">
                Solo lectura. No tienes permisos para editar este registro.
              </p>
            )}
            <button
              onClick={onClose}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-2xl font-bold transition"
              aria-label="Cerrar"
              type="button"
            >
              &times;
            </button>
          </div>

          <div className="px-10 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
              <div className="xl:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Empleado *
                </label>
                <select
                  value={form.empleadoId}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                  onBlur={() => handleBlur("empleadoId", form.empleadoId, form)}
                  className="w-full border rounded-xl px-4 py-3 bg-gray-50 focus:border-[#7cafff] focus:ring-2 focus:ring-[#7cafff]/30 outline-none disabled:bg-gray-100"
                  required
                  disabled={disabledFields || isLoadingEmployees}
                >
                  <option value="">-- Selecciona un empleado --</option>
                  {employeesOptions.map((emp) => (
                    <option key={emp.value} value={emp.value}>
                      {emp.label}
                      {emp.cargo ? ` - ${emp.cargo}` : ""}
                    </option>
                  ))}
                </select>
                {isLoadingEmployees && (
                  <p className="text-xs text-gray-500">Cargando empleados...</p>
                )}
                {errors.empleadoId && touched.empleadoId && (
                  <p className="text-red-500 text-sm">{errors.empleadoId}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cargo
                </label>
                <input
                  type="text"
                  value={form.cargo}
                  readOnly
                  className="w-full border rounded-xl px-4 py-3 bg-gray-100 cursor-not-allowed text-gray-700"
                  placeholder="Cargo del empleado"
                />
              </div>

              <div className="space-y-2">
                <FormField
                  label="Fecha *"
                  name="fecha"
                  type="date"
                  value={form.fecha}
                  onChange={handleChange}
                  onBlur={() => handleBlur("fecha", form.fecha, form)}
                  error={errors.fecha}
                  touched={touched.fecha}
                  required
                  disabled={disabledFields}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  label="Hora inicio *"
                  name="horaInicio"
                  type="time"
                  value={form.horaInicio}
                  onChange={handleChange}
                  onBlur={() => handleBlur("horaInicio", form.horaInicio, form)}
                  error={errors.horaInicio}
                  touched={touched.horaInicio}
                  required
                  disabled={disabledFields}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  label="Hora fin *"
                  name="horaFin"
                  type="time"
                  value={form.horaFin}
                  onChange={handleChange}
                  onBlur={() => handleBlur("horaFin", form.horaFin, form)}
                  error={errors.horaFin}
                  touched={touched.horaFin}
                  required
                  disabled={disabledFields}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  label="Repeticion"
                  name="repeticion"
                  type="select"
                  value={form.repeticion}
                  onChange={handleChange}
                  disabled={disabledFields}
                  options={[
                    { value: "no", label: "No se repite" },
                    { value: "dia", label: "Cada dia" },
                    { value: "semana", label: "Cada semana" },
                    { value: "mes", label: "Cada mes" },
                    { value: "anio", label: "Cada ano" },
                    { value: "laboral", label: "Dias laborales" },
                    { value: "personalizado", label: "Personalizar..." },
                  ]}
                />
              </div>

              {recurrenceLabel && (
                <div className="xl:col-span-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border border-dashed border-gray-200">
                  {recurrenceLabel}
                </div>
              )}

              <div className="xl:col-span-4 space-y-2">
                <FormField
                  label="Descripcion *"
                  name="descripcion"
                  type="textarea"
                  value={form.descripcion}
                  onChange={handleChange}
                  onBlur={() => handleBlur("descripcion", form.descripcion, form)}
                  placeholder="Notas adicionales sobre el horario..."
                  error={errors.descripcion}
                  touched={touched.descripcion}
                  required
                  readOnly={disabledFields}
                />
              </div>

              <div className="md:col-span-1 space-y-2">
                <FormField
                  label="Estado"
                  name="estado"
                  type="select"
                  value={form.estado}
                  onChange={handleChange}
                  disabled={disabledFields}
                  options={[
                    { value: "Programado", label: "Programado" },
                    { value: "Completado", label: "Completado" },
                    { value: "Cancelado", label: "Cancelado" },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 px-10 pb-8 border-t border-gray-200 pt-6 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition shadow-sm"
            >
              {isReadOnly ? "Cerrar" : "Cancelar"}
            </button>
            {!disabledFields && (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl text-white font-semibold bg-[#74D5F4] hover:bg-[#5fc4e3] transition shadow-sm"
              >
                {isNew ? "Crear Horario" : "Actualizar Horario"}
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {showCustomModal && !disabledFields && (
        <CustomRecurrenceModal
          onClose={() => setShowCustomModal(false)}
          onSave={(customData) => {
            setForm((prev) => ({
              ...prev,
              repeticion: "personalizado",
              customRecurrence: customData,
            }));
            setShowCustomModal(false);
          }}
        />
      )}
    </>
  );
}
