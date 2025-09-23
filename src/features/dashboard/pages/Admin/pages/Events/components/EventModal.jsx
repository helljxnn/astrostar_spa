import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FormField } from "../../../../../../../shared/components/FormField";
import { useFormEventValidation } from "../hooks/useFormEventValidation";
import {
  showSuccessAlert,
  showConfirmAlert,
  showErrorAlert,
} from "../../../../../../../shared/utils/Alerts";
import { SponsorsSelector } from "./SponsorsSelector";

export const EventModal = ({
  onClose,
  onSave,
  event,
  isNew,
  mode = "create",
}) => {
  const [tipoEvento, setTipoEvento] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
    horaInicio: "",
    horaFin: "",
    ubicacion: "",
    telefono: "",
    imagen: null,
    cronograma: null,
    patrocinador: [],
    categoria: "",
    estado: "",
    publicar: false,
  });

  const { errors, touched, validate, handleBlur, touchAllFields } =
    useFormEventValidation();

  // Prellenar solo si estamos editando
  useEffect(() => {
    if (!isNew && event) {
      setTipoEvento(event.tipo || "");
      setForm({
        nombre: event.nombre || "",
        descripcion: event.descripcion || "",
        fechaInicio: event.fechaInicio || "",
        fechaFin: event.fechaFin || "",
        horaInicio: event.horaInicio || "",
        horaFin: event.horaFin || "",
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
  }, [event, isNew]);

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

  const handleSubmit = async () => {
    try {
      touchAllFields(form);
      if (!validate({ ...form, tipoEvento })) return;

      // Confirmación solo al editar
      if (!isNew) {
        const result = await showConfirmAlert(
          "¿Estás seguro de actualizar este evento?",
          "Los cambios se guardarán y no se podrán deshacer fácilmente."
        );
        if (!result.isConfirmed) return;
      }

      onSave({ ...form, tipo: tipoEvento, id: event?.id || Date.now() });

      showSuccessAlert(
        isNew
          ? "Evento creado exitosamente"
          : "Evento actualizado exitosamente",
        isNew
          ? "El evento ha sido registrado correctamente."
          : "El evento ha sido actualizado correctamente."
      );

      onClose();
    } catch (error) {
      console.error("Error al guardar evento:", error);
      showErrorAlert(
        "Error al guardar",
        "No se pudo guardar el evento. Intenta de nuevo."
      );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -60 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
            {mode === "view"
              ? "Ver Evento"
              : isNew
              ? "Crear Evento"
              : "Editar Evento"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ✖
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
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
            required={mode !== "view"}
            disabled={mode === "view"}
          />

          {/* Formulario dinámico */}
          {tipoEvento && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                label="Nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                onBlur={() => handleBlur("nombre", form.nombre, form)}
                placeholder={`Nombre del ${tipoEvento.toLowerCase()}`}
                error={errors.nombre}
                touched={touched.nombre}
                required={mode !== "view"}
                disabled={mode === "view"}
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
                required={mode !== "view"}
                disabled={mode === "view"}
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
                required={mode !== "view"}
                disabled={mode === "view"}
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
                required={mode !== "view"}
                disabled={mode === "view"}
              />

              <FormField
                label="Hora inicio"
                name="horaInicio"
                type="time"
                value={form.horaInicio}
                onChange={handleChange}
                onBlur={() => handleBlur("horaInicio", form.horaInicio, form)}
                error={errors.horaInicio}
                touched={touched.horaInicio}
                required={mode !== "view"}
                disabled={mode === "view"}
              />

              <FormField
                label="Hora finalización"
                name="horaFin"
                type="time"
                value={form.horaFin}
                onChange={handleChange}
                onBlur={() => handleBlur("horaFin", form.horaFin, form)}
                error={errors.horaFin}
                touched={touched.horaFin}
                required={mode !== "view"}
                disabled={mode === "view"}
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
                required={mode !== "view"}
                disabled={mode === "view"}
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
                required={mode !== "view"}
                disabled={mode === "view"}
              />

              {/* Subir imagen */}
              <div className="flex flex-col">
                <label className="mb-2 font-medium text-gray-700">
                  Imagen{" "}
                  {mode !== "view" && <span className="text-red-500">*</span>}
                </label>
                {mode === "view" ? (
                  <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                    {form.imagen
                      ? form.imagen.name || "Imagen cargada"
                      : "No hay imagen"}
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    onBlur={() => handleBlur("imagen", form.imagen, form)}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
                             file:rounded-full file:border-0 
                             file:text-sm file:font-semibold
                             file:bg-gradient-to-r file:from-primary-purple file:to-primary-blue file:text-white 
                             hover:file:opacity-90 transition"
                  />
                )}
                {errors.imagen && touched.imagen && mode !== "view" && (
                  <span className="text-xs text-red-500 mt-1">
                    {errors.imagen}
                  </span>
                )}
                {form.imagen && mode !== "view" && (
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
                  Cronograma del evento{" "}
                  {mode !== "view" && <span className="text-red-500">*</span>}
                </label>
                {mode === "view" ? (
                  <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                    {form.cronograma
                      ? form.cronograma.name || "Cronograma cargado"
                      : "No hay cronograma"}
                  </div>
                ) : (
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleCronogramaChange}
                    onBlur={() =>
                      handleBlur("cronograma", form.cronograma, form)
                    }
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
                             file:rounded-full file:border-0 
                             file:text-sm file:font-semibold
                             file:bg-gradient-to-r file:from-primary-purple file:to-primary-blue file:text-white 
                             hover:file:opacity-90 transition"
                  />
                )}
                {errors.cronograma && touched.cronograma && mode !== "view" && (
                  <span className="text-xs text-red-500 mt-1">
                    {errors.cronograma}
                  </span>
                )}
                {form.cronograma && mode !== "view" && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-sm text-green-600"
                  >
                    {form.cronograma.name}
                  </motion.span>
                )}
              </div>

              {/* Selector de patrocinadores */}
              <SponsorsSelector
                value={form.patrocinador}
                onChange={(val) => handleChange("patrocinador", val)}
                error={errors.patrocinador}
                touched={touched.patrocinador}
                disabled={mode === "view"}
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
                required={mode !== "view"}
                disabled={mode === "view"}
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
                  { value: "Finalizado", label: "Finalizado" },
                  { value: "Cancelado", label: "Cancelado" },
                  { value: "En pausa", label: "En pausa" },
                ]}
                error={errors.estado}
                touched={touched.estado}
                required={mode !== "view"}
                disabled={mode === "view"}
              />

              {/* Publicar */}
              <div className="flex items-center gap-2 col-span-1 md:col-span-2 lg:col-span-4">
                <input
                  type="checkbox"
                  name="publicar"
                  checked={form.publicar}
                  onChange={(e) => handleChange("publicar", e.target.checked)}
                  disabled={mode === "view"}
                  className="w-4 h-4 text-primary-purple focus:ring-primary-purple border-gray-300 rounded disabled:opacity-50"
                />
                <label className="text-sm font-medium text-gray-700">
                  Publicar evento
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {tipoEvento && (
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              {mode === "view" ? (
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-primary-purple to-primary-blue text-white font-semibold hover:opacity-90 transition"
                >
                  Cerrar
                </button>
              ) : (
                <>
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="w-full sm:w-auto px-5 py-2 rounded-lg bg-gradient-to-r from-primary-purple to-primary-blue text-white font-semibold hover:opacity-90 transition"
                  >
                    {isNew ? "Guardar" : "Actualizar"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
