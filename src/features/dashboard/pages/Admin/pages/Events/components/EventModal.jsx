import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FormField } from "../../../../../../../shared/components/FormField";
import { useFormEventValidation } from "../hooks/useFormEventValidation";
import { showSuccessAlert } from "../../../../../../../shared/utils/alerts";
import { SponsorsSelector } from "./SponsorsSelector";

export const EventModal = ({ onClose, onSave, event }) => {
  const [tipoEvento, setTipoEvento] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
    ubicacion: "",
    telefono: "",
    imagen: null,
    cronograma: null, // cambiamos detalles por cronograma
    patrocinador: [],
    categoria: "",
    estado: "",
    publicar: false,
  });

  const {
    errors,
    touched,
    validate,
    handleBlur,
    touchAllFields,
  } = useFormEventValidation();

  // 🔹 Prellenar formulario si hay evento (modo editar)
  useEffect(() => {
    if (event) {
      setTipoEvento(event.tipo || "");
      setForm({
        nombre: event.nombre || "",
        descripcion: event.descripcion || "",
        fechaInicio: event.fechaInicio || "",
        fechaFin: event.fechaFin || "",
        ubicacion: event.ubicacion || "",
        telefono: event.telefono || "",
        imagen: event.imagen || null,
        cronograma: event.cronograma || null,
        patrocinador: event.patrocinador || [],
        categoria: event.categoria || "",
        estado: event.estado || "",
        publicar: event.publicar || false,
      });
    }
  }, [event]);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleChange("imagen", file);
  };

  const handleCronogramaChange = (e) => {
    const file = e.target.files[0];
    handleChange("cronograma", file);
  };

  const handleSubmit = () => {
    touchAllFields(form);
    if (validate({ ...form, tipoEvento })) {
      onSave({ ...form, tipo: tipoEvento, id: event?.id || Date.now() });
      showSuccessAlert(
        event ? "Evento actualizado exitosamente" : "Evento creado exitosamente"
      );
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
          <h2 className="text-3xl font-bold text-[#9BE9FF]">
            {event ? "Editar Evento" : "Crear Evento"}
          </h2>
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
          onBlur={() => handleBlur("tipoEvento", tipoEvento, form)}
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
              onBlur={() => handleBlur("nombre", form.nombre, form)}
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
              onBlur={() => handleBlur("descripcion", form.descripcion, form)}
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
              onBlur={() => handleBlur("fechaInicio", form.fechaInicio, form)}
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
              onBlur={() => handleBlur("fechaFin", form.fechaFin, form)}
              error={errors.fechaFin}
              touched={touched.fechaFin}
              required
            />

            <FormField
              label="Ubicación"
              name="ubicacion"
              value={form.ubicacion}
              onChange={handleChange}
              onBlur={() => handleBlur("ubicacion", form.ubicacion, form)}
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
              onBlur={() => handleBlur("telefono", form.telefono, form)}
              placeholder="Teléfono de contacto"
              error={errors.telefono}
              touched={touched.telefono}
              required
            />

            {/* Subir imagen */}
            <div className="flex flex-col">
              <label className="mb-2 font-medium text-gray-700">
                Imagen <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                onBlur={() => handleBlur("imagen", form.imagen, form)}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
                           file:rounded-full file:border-0 
                           file:text-sm file:font-semibold
                           file:bg-[#9BE9FF] file:text-gray-900 
                           hover:file:bg-[#80dfff] transition"
              />
              {errors.imagen && touched.imagen && (
                <span className="text-xs text-red-500 mt-1">{errors.imagen}</span>
              )}
              {form.imagen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-green-600"
                >
                  {form.imagen.name}
                </motion.span>
              )}
            </div>

            {/* Subir cronograma */}
            <div className="flex flex-col">
              <label className="mb-2 font-medium text-gray-700">
                Cronograma del evento <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleCronogramaChange}
                onBlur={() => handleBlur("cronograma", form.cronograma, form)}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
                           file:rounded-full file:border-0 
                           file:text-sm file:font-semibold
                           file:bg-[#9BE9FF] file:text-gray-900 
                           hover:file:bg-[#80dfff] transition"
              />
              {errors.cronograma && touched.cronograma && (
                <span className="text-xs text-red-500 mt-1">{errors.cronograma}</span>
              )}
              {form.cronograma && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-green-600"
                >
                  {form.cronograma.name}
                </motion.span>
              )}
            </div>

            <SponsorsSelector
              value={form.patrocinador}
              onChange={(val) => handleChange("patrocinador", val)}
              error={errors.patrocinador}
              touched={touched.patrocinador}
            />

            <FormField
              label="Categoría"
              name="categoria"
              type="select"
              value={form.categoria}
              onChange={handleChange}
              onBlur={() => handleBlur("categoria", form.categoria, form)}
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
              onBlur={() => handleBlur("estado", form.estado, form)}
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
              className="px-5 py-2 rounded-lg bg-[#9BE9FF] text-gray-900 font-semibold hover:bg-[#80dfff] transition"
            >
              {event ? "Actualizar" : "Guardar"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
