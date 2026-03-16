import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { FormField } from "../../../../../../../../shared/components/FormField";
import SearchableSelect from "../../../../../../../../shared/components/SearchableSelect";
import { useFormScheduleValidation } from "../hooks/useFormSchedulealidation";
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts.js";
import CustomRecurrenceModal from "./CustomRecurrenceModal";

export default function ScheduleModal({
  onClose,
  onSave,
  schedule,
  isNew,
  employeesOptions = [],
  existingSchedules = [],
  isReadOnly = false,
  isLoadingEmployees = false,
  lockEmployeeSelection = false,
}) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [form, setForm] = useState({
    empleadoId: "",
    empleado: "",
    cargo: "",
    specialty: "",
    specialtyLabel: "",
    fecha: "",
    horaInicio: "",
    horaFin: "",
    repeticion: "no",
    customRecurrence: null,
    descripcion: "",
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

  const employeeSearchOptions = useMemo(
    () =>
      employeesOptions.map((emp) => ({
        value: String(emp.value),
        label: emp.label,
        sublabel: emp.cargo || "",
      })),
    [employeesOptions],
  );

  useEffect(() => {
    if (!schedule) return;
    const filledForm = {
      empleadoId: schedule.empleadoId || "",
      empleado: schedule.empleado || "",
      cargo: schedule.cargo || "",
      specialty: schedule.specialty || "",
      specialtyLabel: schedule.specialtyLabel || "",
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
      id: schedule.id || null,
    };
    setForm(filledForm);
    if (!isNew) setOriginalForm(filledForm);
  }, [schedule, isNew]);

  useEffect(() => {
    if (!form.empleadoId) return;
    if (form.specialty && form.specialtyLabel) return;
    const emp = employeesMap[form.empleadoId] || employeesMap[Number(form.empleadoId)];
    if (!emp) return;
    setForm((prev) => ({
      ...prev,
      specialty: prev.specialty || emp.specialty || "",
      specialtyLabel: prev.specialtyLabel || emp.specialtyLabel || "",
      cargo: prev.cargo || emp.cargo || "",
    }));
  }, [form.empleadoId, form.specialty, form.specialtyLabel, employeesMap]);

  const handleChange = (name, value) => {
    if (isReadOnly) return;
    if (name === "repeticion") {
      if (value === "personalizado") {
        setShowCustomModal(true);
        return;
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
      specialty: emp?.specialty || "",
      specialtyLabel: emp?.specialtyLabel || "",
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

    if (isNew && form.empleadoId && form.fecha) {
      const employeeIdValue = String(form.empleadoId).trim();
      const targetDate = form.fecha;
      if (
        employeeIdValue &&
        existingSchedules.some((record) => {
          const recordEmployeeId = String(record.empleadoId ?? record.employeeId ?? "").trim();
          return (
            recordEmployeeId &&
            recordEmployeeId === employeeIdValue &&
            (record.fecha === targetDate || record.scheduleDate === targetDate)
          );
        })
      ) {
        showErrorAlert(
          "Horario duplicado",
          "No se puede crear porque ese empleado ya está asociado a un horario ese día."
        );
        return;
      }
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

  const isHealthProfessionalCargo = useMemo(() => {
    const cargoKey = String(form.cargo || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
    return cargoKey === "profesional de la salud" || cargoKey === "profesional de salud";
  }, [form.cargo]);

  const specialtyDisplay = useMemo(() => {
    if (form.specialtyLabel) return form.specialtyLabel;
    const labels = {
      psicologia: "Psicologia",
      fisioterapia: "Fisioterapia",
      nutricion: "Nutricion",
    };
    return labels[form.specialty] || "";
  }, [form.specialty, form.specialtyLabel]);

  const disabledFields = isReadOnly;

  return createPortal(
    <>
      <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[2000]">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] border border-gray-100 flex flex-col overflow-hidden"
        >
          <div className="flex-shrink-0 relative px-6 py-5 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-primary-purple to-primary-blue text-transparent bg-clip-text">
              {isNew ? "Crear Horario" : isReadOnly ? "Detalle del Horario" : "Editar Horario"}
            </h2>
            {isReadOnly && (
              <p className="text-sm text-gray-500 text-center mt-1">
                Solo lectura. No tienes permisos para editar este registro.
              </p>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              &times;
            </button>
          </div>

          <div className="modal-body flex-1 overflow-y-auto md:overflow-visible px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Empleado *
                </label>
                <SearchableSelect
                  options={employeeSearchOptions}
                  value={String(form.empleadoId || "")}
                  onChange={(val) => handleEmployeeChange(val)}
                  loading={isLoadingEmployees}
                  disabled={
                    disabledFields || isLoadingEmployees || lockEmployeeSelection
                  }
                  placeholder="Buscar empleado..."
                  error={touched.empleadoId && errors.empleadoId ? errors.empleadoId : ""}
                />
                {isLoadingEmployees && (
                  <p className="text-xs text-gray-500">Cargando empleados...</p>
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

              {isHealthProfessionalCargo && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Especialidad
                  </label>
                  <input
                    type="text"
                    value={specialtyDisplay || "Sin especialidad"}
                    readOnly
                    className="w-full border rounded-xl px-4 py-3 bg-gray-100 cursor-not-allowed text-gray-700"
                    placeholder="Especialidad del profesional"
                  />
                </div>
              )}

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
                    { value: "personalizado", label: "Personalizar..." },
                  ]}
                />
              </div>

            </div>

            {recurrenceLabel && (
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border border-dashed border-gray-200 flex items-center justify-between">
                <span>{recurrenceLabel}</span>
                {!disabledFields && (
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(true)}
                    className="ml-3 px-3 py-1 text-xs bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition font-medium"
                  >
                    Editar
                  </button>
                )}
              </div>
            )}

            <div className="space-y-2">
              <FormField
                label="Descripcion (opcional)"
                name="descripcion"
                type="textarea"
                value={form.descripcion}
                onChange={handleChange}
                onBlur={() => handleBlur("descripcion", form.descripcion, form)}
                placeholder="Notas adicionales sobre el horario..."
                error={errors.descripcion}
                touched={touched.descripcion}
                readOnly={disabledFields}
              />
            </div>
          </div>

          <div className="flex-shrink-0 border-t border-gray-200 bg-white px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
            >
              {isReadOnly ? "Cerrar" : "Cancelar"}
            </button>
            {!disabledFields && (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition font-medium shadow-lg"
              >
                {isNew ? "Crear Horario" : "Actualizar Horario"}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>

      {showCustomModal && !disabledFields && (
        <CustomRecurrenceModal
          onClose={() => setShowCustomModal(false)}
          initialData={form.customRecurrence}
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
    </>,
    document.body,
  );
}

