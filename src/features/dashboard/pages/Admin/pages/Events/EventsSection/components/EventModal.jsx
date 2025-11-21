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
import CloudinaryUpload from "./CloudinaryUpload";

export const EventModal = ({
  onClose,
  onSave,
  event,
  isNew,
  mode = "create",
  referenceData = { categories: [], types: [] }
}) => {
  const [tipoEvento, setTipoEvento] = useState("");
  const [form, setForm] = useState({
    id: null, // ID del evento (para edición)
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
    categoriaId: null,
    tipoId: null,
    estado: "Programado", // Estado por defecto al crear
    publicar: false,
  });

  // Mapeo de tipos de evento a tipo de participante
  const eventTypeParticipantMap = {
    'Festival': 'Equipos',
    'Torneo': 'Equipos',
    'Clausura': 'Deportistas',
    'Taller': 'Deportistas'
  };

  // Obtener el tipo de participante según el tipo de evento
  const getParticipantType = () => {
    return eventTypeParticipantMap[tipoEvento] || 'Deportistas';
  };

  const { errors, touched, validate, handleBlur, touchAllFields, isCheckingName } =
    useFormEventValidation();

  // Función para formatear fecha a YYYY-MM-DD sin problemas de zona horaria
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    
    // Si ya está en formato correcto YYYY-MM-DD, devolverlo directamente
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    
    // Si es un string que contiene 'T' (ISO string), extraer solo la fecha
    if (typeof dateString === 'string' && dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    
    // Si es un objeto Date
    if (dateString instanceof Date) {
      const year = dateString.getFullYear();
      const month = String(dateString.getMonth() + 1).padStart(2, '0');
      const day = String(dateString.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // Para cualquier otro caso, intentar convertir sin zona horaria
    if (typeof dateString === 'string') {
      // Si contiene '/', convertir a formato ISO (MM/DD/YYYY)
      if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          const month = parts[0].padStart(2, '0');
          const day = parts[1].padStart(2, '0');
          const year = parts[2];
          return `${year}-${month}-${day}`;
        }
      }
    }
    
    return dateString;
  };

  useEffect(() => {
    if (!isNew && event) {
      setTipoEvento(event.tipo || "");
      setForm({
        id: event.id || null, // Agregar el ID del evento
        nombre: event.nombre || "",
        descripcion: event.descripcion || "",
        fechaInicio: formatDateForInput(event.fechaInicio) || "",
        fechaFin: formatDateForInput(event.fechaFin) || "",
        horaInicio: event.horaInicio || "",
        horaFin: event.horaFin || "",
        ubicacion: event.ubicacion || "",
        telefono: event.telefono || "",
        imagen: event.imagen || null,
        cronograma: event.cronograma || null,
        patrocinador: event.patrocinador || [],
        categoria: event.categoria || "",
        categoriaId: event.categoriaId || null,
        tipoId: event.tipoId || null,
        estado: event.estadoOriginal || event.estado || "Programado",
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

      // Encontrar los IDs de categoría y tipo
      const selectedType = referenceData.types.find(t => t.name === tipoEvento);
      const selectedCategory = referenceData.categories.find(c => c.name === form.categoria);

      const eventData = { 
        ...form, 
        tipo: tipoEvento,
        tipoId: selectedType?.id || form.tipoId,
        categoriaId: selectedCategory?.id || form.categoriaId,
        id: event?.id
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
            {/* Fila 1 - Tipo, Nombre, Categoría, Ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
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
                  options={referenceData.types.map(type => ({
                    value: type.name,
                    label: type.name
                  }))}
                  required={mode !== "view"}
                  disabled={mode === "view"}
                />
                {tipoEvento && (
                  <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-700">Inscripción:</span>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${
                      getParticipantType() === 'Equipos' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-green-500 text-white'
                    }`}>
                      {getParticipantType()}
                    </span>
                  </div>
                )}
              </div>

              <div className="relative">
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
                {isCheckingName && (
                  <div className="absolute right-3 top-9 flex items-center">
                    <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>

              <FormField
                label="Categoría"
                name="categoria"
                type="select"
                value={form.categoria}
                onChange={handleChange}
                onBlur={() => handleBlur("categoria", form.categoria, form)}
                options={referenceData.categories.map(cat => ({
                  value: cat.name,
                  label: cat.name
                }))}
                error={errors.categoria}
                touched={touched.categoria}
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
            </div>

            {/* Fila 2 - Teléfono, Patrocinadores y Descripción */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

              <SponsorsSelector
                value={form.patrocinador}
                onChange={(val) => handleChange("patrocinador", val)}
                error={errors.patrocinador}
                touched={touched.patrocinador}
                disabled={mode === "view"}
              />

              <div className="md:col-span-2">
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
              </div>
            </div>

            {/* Fila 3 - Fechas y Horas */}
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

            {/* Fila 4 - Imagen, Cronograma, Checkbox y Estado */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Subir Imagen
                  </label>
                  <CloudinaryUpload
                    archivo={form.imagen}
                    onChange={(url) => handleChange("imagen", url)}
                    disabled={mode === "view"}
                    type="image"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Subir Cronograma
                  </label>
                  <CloudinaryUpload
                    archivo={form.cronograma}
                    onChange={(url) => handleChange("cronograma", url)}
                    disabled={mode === "view"}
                    type="schedule"
                  />
                </div>

                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors h-fit">
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

                {/* Estado - Visible en modo view y edit */}
                {mode === "view" ? (
                  // Modo ver: mostrar el estado como solo lectura
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Estado
                    </label>
                    <div className={`px-4 py-2.5 border rounded-lg font-medium ${
                      form.estado === "Finalizado" || form.estado === "finalizado"
                        ? "bg-gray-100 border-gray-300 text-gray-700"
                        : form.estado === "Programado"
                        ? "bg-green-50 border-green-300 text-green-700"
                        : form.estado === "Cancelado"
                        ? "bg-red-50 border-red-300 text-red-700"
                        : form.estado === "Pausado"
                        ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                        : "bg-gray-100 border-gray-300 text-gray-700"
                    }`}>
                      {form.estado}
                    </div>
                  </div>
                ) : mode === "edit" ? (
                  form.estado === "Finalizado" || form.estado === "finalizado" ? (
                    // Si el evento está finalizado, mostrar como solo lectura
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Estado
                      </label>
                      <div className="px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium">
                        Finalizado
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Este evento ya finalizó y no se puede modificar su estado
                      </p>
                    </div>
                  ) : (
                    // Si no está finalizado, permitir cambiar el estado
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
                        { value: "Cancelado", label: "Cancelado" },
                        { value: "Pausado", label: "Pausado" },
                      ]}
                      error={errors.estado}
                      touched={touched.estado}
                      required
                      helperText="El estado 'Finalizado' se asigna automáticamente cuando termina el evento"
                    />
                  )
                ) : (
                  <div></div>
                )}
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
