// EventModal.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { FormField } from "../../../../../../../shared/components/FormField";
import { useFormEventValidation } from "../hooks/useFormEventValidation";
import { showSuccessAlert } from "../../../../../../../shared/utils/Alerts";

export const EventModal = ({ onClose, onSave }) => {
  const [tipoEvento, setTipoEvento] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
    ubicacion: "",
    telefono: "",
    imagen: "",
    detalles: "",
    patrocinador: "",
    categoria: "",
    estado: "",
    publicar: false,
  });

  const [touched, setTouched] = useState({});
  const { errors, validate } = useFormEventValidation();

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = () => {
    if (validate(form, tipoEvento)) {
      onSave({ ...form, tipo: tipoEvento });
      showSuccessAlert("Evento creado exitosamente");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -60 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-5xl overflow-y-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-[#9BE9FF]">Crear Evento</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ✖
          </button>
        </div>

        {/* Tipo de evento */}
        <FormField
          label="Tipo de evento"
          name="tipoEvento"
          type="select"
          value={tipoEvento}
          onChange={(name, value) => setTipoEvento(value)}
          onBlur={handleBlur}
          error={errors.tipoEvento}
          touched={touched.tipoEvento}
          placeholder="Seleccione el tipo de evento"
          options={[
            { value: "Festival", label: "Festival" },
            { value: "Torneo", label: "Torneo" },
            { value: "Clausura", label: "Clausura" },
            { value: "Taller", label: "Taller" },
          ]}
          required
        />

        {/* Formulario dinámico */}
        {tipoEvento && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={`Nombre del ${tipoEvento.toLowerCase()}`}
              error={errors.nombre}
              touched={touched.nombre}
              required
            />

            <FormField
              label="Descripción"
              name="descripcion"
              type="textarea"
              value={form.descripcion}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={`Descripción del ${tipoEvento.toLowerCase()}`}
              error={errors.descripcion}
              touched={touched.descripcion}
              required
            />

            <FormField
              label="Fecha inicio"
              name="fechaInicio"
              type="date"
              value={form.fechaInicio}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.fechaInicio}
              touched={touched.fechaInicio}
              required
            />

            <FormField
              label="Fecha finalización"
              name="fechaFin"
              type="date"
              value={form.fechaFin}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.fechaFin}
              touched={touched.fechaFin}
              required
            />

            <FormField
              label="Ubicación"
              name="ubicacion"
              value={form.ubicacion}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ubicación del evento"
              error={errors.ubicacion}
              touched={touched.ubicacion}
              required
            />

            <FormField
              label="Teléfono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Teléfono de contacto"
              error={errors.telefono}
              touched={touched.telefono}
              required
            />

            <FormField
              label="Url Imagen"
              name="imagen"
              value={form.imagen}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="https://ejemplo.com/imagen.png"
              error={errors.imagen}
              touched={touched.imagen}
              required
            />

            <FormField
              label="Detalles"
              name="detalles"
              type="textarea"
              value={form.detalles}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Detalles del evento"
              error={errors.detalles}
              touched={touched.detalles}
              required
            />

            <FormField
              label="Patrocinador"
              name="patrocinador"
              type="select"
              value={form.patrocinador}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Seleccione un patrocinador"
              options={[
                { value: "Natipan", label: "Natipan" },
                { value: "Ponymalta", label: "Ponymalta" },
                { value: "NovaSport", label: "NovaSport" },
                { value: "Adidas", label: "Adidas" },
              ]}
              error={errors.patrocinador}
              touched={touched.patrocinador}
              required
            />

            <FormField
              label="Categoría"
              name="categoria"
              type="select"
              value={form.categoria}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Seleccione categoría"
              options={[
                { value: "Infantil", label: "Infantil" },
                { value: "Pre Juvenil", label: "Pre Juvenil" },
                { value: "Juvenil", label: "Juvenil" },
                { value: "Todas", label: "Todas" },
              ]}
              error={errors.categoria}
              touched={touched.categoria}
              required
            />

            <FormField
              label="Estado"
              name="estado"
              type="select"
              value={form.estado}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Seleccione estado"
              options={[
                { value: "Programado", label: "Programado" },
                { value: "Ejecutado", label: "Ejecutado" },
                { value: "Cancelado", label: "Cancelado" },
                { value: "En pausa", label: "En pausa" },
              ]}
              error={errors.estado}
              touched={touched.estado}
              required
            />

            {/* Publicar */}
            <div className="flex items-center gap-2 col-span-2">
              <input
                type="checkbox"
                name="publicar"
                checked={form.publicar}
                onChange={(e) => handleChange("publicar", e.target.checked)}
                className="w-4 h-4 text-[#9BE9FF] focus:ring-[#9BE9FF] border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Publicar evento
              </label>
            </div>
          </div>
        )}

        {/* Botones */}
        {tipoEvento && (
          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 rounded-lg bg-primary-purple hover:bg-prima text-black font-semibold transition"
            >
              Guardar
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
