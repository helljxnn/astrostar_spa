import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FormField } from "../../../../../../../../shared/components/FormField";
import { useFormScheduleValidation } from "../hooks/useFormSchedulealidation";
import {
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../../shared/utils/alerts";
import CustomRecurrenceModal from "./CustomRecurrenceModal";

/* ============================================================
   🔹 MOCK TEMPORAL DE EMPLEADOS
============================================================ */
const empleadosMock = [
  { id: 1, nombre: "Juan Pérez", cargo: "Entrenador" },
  { id: 2, nombre: "Ana Gómez", cargo: "Nutricionista" },
];

/* ============================================================
   🔹 COMPONENTE PRINCIPAL: ScheduleModal
============================================================ */
export default function ScheduleModal({ onClose, onSave, schedule, isNew }) {
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

  const { errors, touched, validate, handleBlur, touchAllFields, hasChanges } =
    useFormScheduleValidation();

  useEffect(() => {
    if (!isNew && schedule) {
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
      };
      setForm(filledForm);
      setOriginalForm(filledForm);
    }
  }, [schedule, isNew]);

  const handleChange = (name, value) => {
    if (name === "repeticion" && value === "personalizado") {
      setShowCustomModal(true);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = () => {
    touchAllFields(form);

    if (!validate(form)) return;

    if (!form.descripcion.trim()) {
      showErrorAlert("La descripción es obligatoria.");
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
      id: schedule?.id || Date.now(),
    };

    onSave(horarioFinal);

    showSuccessAlert(
      isNew
        ? "Horario de empleado creado exitosamente"
        : "Horario de empleado actualizado exitosamente"
    );

    onClose();
  };

  /* ============================================================
     🔹 RENDER
  ============================================================ */
  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-y-auto max-h-[90vh]"
        >
          {/* ---------------- Header ---------------- */}
          <div className="px-8 py-6 border-b border-gray-200 text-center">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#7B61FF] to-[#9BE9FF]">
              {isNew ? "Crear Horario" : "Editar Horario"}
            </h2>
          </div>

          {/* ---------------- Formulario ---------------- */}
          <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Empleado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empleado *
              </label>
              <select
                value={form.empleadoId}
                onChange={(e) => {
                  const emp = empleadosMock.find(
                    (x) => x.id === Number(e.target.value)
                  );
                  setForm((prev) => ({
                    ...prev,
                    empleadoId: emp?.id || "",
                    empleado: emp?.nombre || "",
                    cargo: emp?.cargo || "",
                  }));
                }}
                onBlur={() => handleBlur("empleado", form.empleado, form)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#9BE9FF] outline-none"
                required
              >
                <option value="">-- Selecciona un empleado --</option>
                {empleadosMock.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre}
                  </option>
                ))}
              </select>
              {errors.empleado && touched.empleado && (
                <p className="text-red-500 text-sm mt-1">{errors.empleado}</p>
              )}
            </div>

            {/* Cargo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cargo
              </label>
              <input
                type="text"
                value={form.cargo}
                readOnly
                className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
                placeholder="Cargo del empleado"
              />
            </div>

            {/* Fecha */}
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
            />

            {/* Hora inicio */}
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
            />

            {/* Hora fin */}
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
            />

            {/* Repetición */}
            <FormField
              label="Repetición"
              name="repeticion"
              type="select"
              value={form.repeticion}
              onChange={handleChange}
              options={[
                { value: "no", label: "No se repite" },
                { value: "dia", label: "Cada día" },
                { value: "semana", label: "Cada semana" },
                { value: "mes", label: "Cada mes" },
                { value: "anio", label: "Cada año" },
                { value: "laboral", label: "Días laborales" },
                { value: "personalizado", label: "Personalizar..." },
              ]}
            />

            {form.repeticion === "personalizado" && form.customRecurrence && (
              <div className="col-span-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                📅 {form.customRecurrence.label}
              </div>
            )}

            {/* Descripción */}
            <FormField
              label="Descripción *"
              name="descripcion"
              type="textarea"
              value={form.descripcion}
              onChange={handleChange}
              onBlur={() => handleBlur("descripcion", form.descripcion, form)}
              placeholder="Notas adicionales sobre el horario..."
              error={errors.descripcion}
              touched={touched.descripcion}
              required
            />

            {/* Estado */}
            {!isNew && (
              <FormField
                label="Estado"
                name="estado"
                type="select"
                value={form.estado}
                onChange={handleChange}
                options={[
                  { value: "Programado", label: "Programado" },
                  { value: "En curso", label: "En curso" },
                  { value: "Completado", label: "Completado" },
                ]}
              />
            )}
          </div>

          {/* ---------------- Botones ---------------- */}
          <div className="flex justify-end gap-4 px-8 pb-8 border-t border-gray-100 pt-6">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-lg text-white font-semibold bg-gradient-to-r from-[#9BE9FF] to-[#7B61FF] hover:opacity-90 transition"
            >
              {isNew ? "Crear Horario" : "Actualizar Horario"}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Modal de repetición personalizada */}
      {showCustomModal && (
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
