import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FormField } from "../../../../../../../../shared/components/FormField";
import { useFormEventValidation } from "../hooks/useFormEventValidation";
import {
  showSuccessAlert,
  showConfirmAlert,
  showErrorAlert,
} from "../../../../../../../../shared/utils/alerts";
import { SponsorsSelector } from "./SponsorsSelector";
import ButtonUpload from "./ButtonUpload";

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

  const handleSubmit = async () => {
    try {
      touchAllFields({ ...form, tipoEvento });
      const isValid = validate({ ...form, tipoEvento });
      
      if (!isValid) {
        showErrorAlert(
          "Formulario incompleto",
          "Por favor completa todos los campos requeridos correctamente."
        );
        return;
      }

      if (!isNew) {
        const result = await showConfirmAlert(
          "¿Estás seguro de actualizar este evento?",
          "Los cambios se guardarán y no se podrán deshacer fácilmente."
        );
        if (!result.isConfirmed) return;
      }

      const eventData = { 
        ...form, 
        tipo: tipoEvento, 
        id: event?.id || Date.now() 
      };
      
      await onSave(eventData);

      showSuccessAlert(
        isNew ? "Evento creado exitosamente" : "Evento actualizado exitosamente",
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* El resto de campos aparece cuando hay tipoEvento */}
          <>
            {/* Fila 1 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Tipo de evento ahora en la primera fila y más pequeño */}
              <div className="md:col-span-1">
                <FormField
                  label="Tipo"
                  name="tipoEvento"
                  type="select"
                  value={tipoEvento}
                  onChange={(name, value) => setTipoEvento(value)}
                  onBlur={() => handleBlur("tipoEvento", tipoEvento, form)}
                  error={errors.tipoEvento}
                  touched={touched.tipoEvento}
                  placeholder="Seleccione tipo"
                  options={[
                    { value: "Festival", label: "Festival" },
                    { value: "Torneo", label: "Torneo" },
                    { value: "Clausura", label: "Clausura" },
                    { value: "Taller", label: "Taller" },
                  ]}
                  required={mode !== "view"}
                  disabled={mode === "view"}
                />
              </div>

              <FormField
                label="Nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                onBlur={() => handleBlur("nombre", form.nombre, form)}
                placeholder={`Nombre del ${tipoEvento ? tipoEvento.toLowerCase() : 'evento'}`}
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
                placeholder="Breve descripción"
                error={errors.descripcion}
                touched={touched.descripcion}
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
            </div>

            {/* Fila 2 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  label="Fecha inicio"
                  name="fechaInicio"
                  type="date"
                  value={form.fechaInicio}
                  onChange={handleChange}
                  onBlur={() =>
                    handleBlur("fechaInicio", form.fechaInicio, form)
                  }
                  error={errors.fechaInicio}
                  touched={touched.fechaInicio}
                  required={mode !== "view"}
                  disabled={mode === "view"}
                />

                <FormField
                  label="Fecha fin"
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
                  label="Hora fin"
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
              </div>

              {/* Fila 3 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                <FormField
                  label="Categoría"
                  name="categoria"
                  type="select"
                  value={form.categoria}
                  onChange={handleChange}
                  onBlur={() => handleBlur("categoria", form.categoria, form)}
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

                <SponsorsSelector
                  value={form.patrocinador}
                  onChange={(val) => handleChange("patrocinador", val)}
                  error={errors.patrocinador}
                  touched={touched.patrocinador}
                  disabled={mode === "view"}
                />
              </div>

              {/* Fila 4 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Subir Imagen
                  </label>
                  <ButtonUpload
                    file={form.imagen}
                    onChange={(file) => handleChange("imagen", file)}
                    disabled={mode === "view"}
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Subir Cronograma
                  </label>
                  <ButtonUpload
                    file={form.cronograma}
                    onChange={(file) => handleChange("cronograma", file)}
                    disabled={mode === "view"}
                  />
                </div>

                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
                  <input
                    type="checkbox"
                    id="publicar-evento"
                    name="publicar"
                    checked={form.publicar}
                    onChange={(e) => handleChange("publicar", e.target.checked)}
                    disabled={mode === "view"}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500 focus:ring-1 border-purple-300 rounded cursor-pointer"
                  />
                  <label htmlFor="publicar-evento" className="text-xs font-medium text-purple-700 cursor-pointer select-none">
                    Publicar evento
                  </label>
                </div>
              </div>
            </> 
        </div>

        {/* Footer */}
        {tipoEvento && (
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              {mode === "view" ? (
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
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
                    type="button"
                    className="w-full sm:w-auto px-5 py-2 rounded-lg bg-primary-purple text-white font-semibold hover:bg-primary-blue transition"
                  >
                    {isNew ? "Crear" : "Actualizar"}
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
