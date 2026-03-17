import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { FormField } from "../../../../../../../../../shared/components/FormField";
import { useFormEventValidation } from "../../hooks/useFormEventValidation";
import {
  showSuccessAlert,
  showConfirmAlert,
  showErrorAlert,
} from "../../../../../../../../../shared/utils/alerts.js";
import CloudinaryUpload from "./CloudinaryUpload";
import { MultiSelect } from "./MultiSelect";

export const EventModal = ({
  onClose,
  onSave,
  event,
  isNew,
  mode = "create",
  referenceData = { categories: [], types: [] },
}) => {
  const [tipoEvento, setTipoEvento] = useState(""); // Ahora almacena el ID del tipo
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
    categoryIds: [],
    typeId: null,
    estado: "Programado", // Estado por defecto al crear
    publicar: false,
    clearRegistrations: false, // Indicador para limpiar inscripciones
  });

  // Obtener el nombre del tipo de evento seleccionado
  const getSelectedTypeName = () => {
    const selectedType = referenceData.types.find((t) => t.id === tipoEvento);
    return selectedType?.name || "";
  };

  const {
    errors,
    touched,
    validate,
    handleBlur,
    handleChangeValidation,
    touchAllFields,
    isCheckingName,
  } = useFormEventValidation();

  // Función para formatear fecha a YYYY-MM-DD sin problemas de zona horaria
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    // Si ya está en formato correcto YYYY-MM-DD, devolverlo directamente
    if (
      typeof dateString === "string" &&
      dateString.match(/^\d{4}-\d{2}-\d{2}$/)
    ) {
      return dateString;
    }

    // Si es un string que contiene 'T' (ISO string), extraer solo la fecha
    if (typeof dateString === "string" && dateString.includes("T")) {
      return dateString.split("T")[0];
    }

    // Si es un objeto Date
    if (dateString instanceof Date) {
      const year = dateString.getFullYear();
      const month = String(dateString.getMonth() + 1).padStart(2, "0");
      const day = String(dateString.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    // Para cualquier otro caso, intentar convertir sin zona horaria
    if (typeof dateString === "string") {
      // Si contiene '/', convertir a formato ISO (MM/DD/YYYY)
      if (dateString.includes("/")) {
        const parts = dateString.split("/");
        if (parts.length === 3) {
          const month = parts[0].padStart(2, "0");
          const day = parts[1].padStart(2, "0");
          const year = parts[2];
          return `${year}-${month}-${day}`;
        }
      }
    }

    return dateString;
  };

  useEffect(() => {
    if (event) {
      if (isNew) {
        // Cuando es nuevo, solo cargar las fechas seleccionadas del calendario
        // Asegurar que las fechas y horas tengan valores válidos
        const getDefaultDate = () => {
          const oneWeekFromToday = new Date();
          oneWeekFromToday.setDate(oneWeekFromToday.getDate() + 7);
          const year = oneWeekFromToday.getFullYear();
          const month = String(oneWeekFromToday.getMonth() + 1).padStart(
            2,
            "0",
          );
          const day = String(oneWeekFromToday.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const fechaInicio =
          formatDateForInput(event.fechaInicio) || getDefaultDate();
        const fechaFin = formatDateForInput(event.fechaFin) || fechaInicio;
        const horaInicio = event.horaInicio || "09:00";
        const horaFin = event.horaFin || "10:00";

        setForm((prev) => ({
          ...prev,
          fechaInicio,
          fechaFin,
          horaInicio,
          horaFin,
        }));
      } else {
        // Cuando es edición, cargar todos los datos del evento
        // Buscar el ID del tipo basado en el nombre (para compatibilidad con datos existentes)
        const typeId =
          event.tipoId ||
          referenceData.types.find((t) => t.name === event.tipo)?.id ||
          "";
        setTipoEvento(typeId);
        setForm({
          id: event.id || null,
          nombre: event.nombre || "",
          descripcion: event.descripcion || "",
          fechaInicio: formatDateForInput(event.fechaInicio) || "",
          fechaFin: formatDateForInput(event.fechaFin) || "",
          horaInicio: event.horaInicio || "09:00",
          horaFin: event.horaFin || "10:00",
          ubicacion: event.ubicacion || "",
          telefono: event.telefono || "",
          imagen: event.imagen || null,
          cronograma: event.cronograma || null,
          patrocinador: event.patrocinador || [],
          categoryIds: event.categoryIds || [],
          typeId: typeId,
          estado: event.estadoOriginal || event.estado || "Programado",
          publicar: event.publicar || false,
          clearRegistrations: false, // Inicializar como false
        });
      }
    } else if (isNew) {
      // Si no hay evento pero es nuevo, establecer valores por defecto válidos
      const getDefaultDate = () => {
        const oneWeekFromToday = new Date();
        oneWeekFromToday.setDate(oneWeekFromToday.getDate() + 7);
        const year = oneWeekFromToday.getFullYear();
        const month = String(oneWeekFromToday.getMonth() + 1).padStart(2, "0");
        const day = String(oneWeekFromToday.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const defaultDate = getDefaultDate();
      setForm((prev) => ({
        ...prev,
        fechaInicio: defaultDate,
        fechaFin: defaultDate,
        horaInicio: "09:00",
        horaFin: "10:00",
      }));
    }
  }, [event, isNew, referenceData.types]);

  const handleFormChange = (name, value) => {
    setForm((prev) => {
      const nextForm = { ...prev, [name]: value };
      handleChangeValidation(name, value, nextForm);
      return nextForm;
    });
  };

  const handleSubmit = async () => {
    try {
      if (isCheckingName) {
        showErrorAlert(
          "Validando nombre",
          "Espera un momento mientras se valida la disponibilidad del nombre.",
        );
        return;
      }

      touchAllFields({ ...form, tipoEvento });
      const isValid = validate({ ...form, tipoEvento });

      if (!isValid) {
        showErrorAlert(
          "Formulario incompleto",
          "Por favor completa todos los campos requeridos correctamente.",
        );
        return;
      }

      if (!isNew) {
        const result = await showConfirmAlert(
          "¿Estás seguro de actualizar este evento?",
          "Los cambios se guardarán y no se podrán deshacer fácilmente.",
        );
        if (!result.isConfirmed) return;
      }

      // Obtener el nombre del tipo para guardarlo
      const selectedType = referenceData.types.find((t) => t.id === tipoEvento);

      const eventData = {
        ...form,
        tipo: selectedType?.name || "",
        typeId: tipoEvento, // Backend expects 'typeId', not 'tipoId'
        id: event?.id,
        clearRegistrations: form.clearRegistrations || false, // Indicar si se deben limpiar las inscripciones
      };

      // Si el evento está finalizado, no enviar el campo estado para evitar errores de validación
      if (form.estado === "Finalizado" || form.estado === "finalizado") {
        delete eventData.estado;
      }

      await onSave(eventData);

      showSuccessAlert(
        isNew
          ? "Evento creado exitosamente"
          : "Evento actualizado exitosamente",
        isNew
          ? "El evento ha sido registrado correctamente."
          : "El evento ha sido actualizado correctamente.",
      );

      onClose();
    } catch (error) {
      console.error("Error al guardar evento:", error);
      showErrorAlert(
        "Error al guardar",
        "No se pudo guardar el evento. Intenta de nuevo.",
      );
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999] p-2 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{ pointerEvents: "auto" }}
    >
      <motion.div
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -60 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col relative z-[10000] border border-gray-200"
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: "auto" }}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === "view"
              ? "Ver Evento"
              : isNew
                ? "Crear Evento"
                : "Editar Evento"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold transition-colors"
          >
            ✖
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* El resto de campos aparece cuando hay tipoEvento */}
          <>
            {/* Fila 1 - Tipo, Nombre, Ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <FormField
                  label="Tipo"
                  name="tipoEvento"
                  type="select"
                  value={tipoEvento}
                  onChange={async (name, value) => {
                    // Validar cambio de tipo si hay inscripciones
                    // Verificar si el evento tiene inscripciones (fallback si hasRegistrations no está definido)
                    // TEMPORAL: Siempre validar en modo edición para probar
                    if (!isNew && tipoEvento) {
                      const currentTypeName = referenceData.types.find(
                        (t) => t.id === tipoEvento,
                      )?.name;
                      const newTypeName = referenceData.types.find(
                        (t) => t.id === value,
                      )?.name;

                      // Verificar compatibilidad de tipos
                      const teamTypes = ["Festival", "Torneo"];
                      const athleteTypes = ["Taller", "Clausura"];

                      const currentIsTeamType =
                        teamTypes.includes(currentTypeName);
                      const newIsTeamType = teamTypes.includes(newTypeName);
                      const currentIsAthleteType =
                        athleteTypes.includes(currentTypeName);
                      const newIsAthleteType =
                        athleteTypes.includes(newTypeName);

                      // Si hay inscripciones y se intenta cambiar entre tipos incompatibles
                      if (
                        (currentIsTeamType && newIsAthleteType) ||
                        (currentIsAthleteType && newIsTeamType)
                      ) {
                        const result = await showConfirmAlert(
                          "¿Cambiar tipo de evento?",
                          `Al cambiar de ${currentTypeName} a ${newTypeName} podrían eliminarse las inscripciones existentes si las hay. ¿Deseas continuar?`,
                        );

                        if (!result.isConfirmed) {
                          return; // No cambiar el tipo si el usuario cancela
                        }

                        // Si el usuario confirma, marcar que se deben eliminar las inscripciones
                        setForm((prev) => ({
                          ...prev,
                          clearRegistrations: true,
                        }));
                      }
                    }
                    setTipoEvento(value);
                    handleChangeValidation("tipoEvento", value, {
                      ...form,
                      tipoEvento: value,
                    });
                  }}
                  onBlur={() => handleBlur("tipoEvento", tipoEvento, form)}
                  error={errors.tipoEvento}
                  touched={touched.tipoEvento}
                  placeholder="Seleccione tipo"
                  options={referenceData.types.map((type) => ({
                    value: type.id,
                    label: type.name,
                  }))}
                  required={mode !== "view"}
                  disabled={mode === "view"}
                />
              </div>

              <div className="relative">
                <FormField
                  label="Nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleFormChange}
                  onBlur={() => handleBlur("nombre", form.nombre, form)}
                  placeholder={`Nombre del ${
                    tipoEvento ? getSelectedTypeName().toLowerCase() : "evento"
                  }`}
                  error={errors.nombre}
                  touched={touched.nombre}
                  required={mode !== "view"}
                  disabled={mode === "view"}
                />
                {isCheckingName && (
                  <div className="absolute right-3 top-9 flex items-center">
                    <svg
                      className="animate-spin h-4 w-4 text-primary-purple"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                )}
              </div>

              <FormField
                label="Ubicación"
                name="ubicacion"
                value={form.ubicacion}
                onChange={handleFormChange}
                onBlur={() => handleBlur("ubicacion", form.ubicacion, form)}
                placeholder="Ubicación del evento"
                error={errors.ubicacion}
                touched={touched.ubicacion}
                required={mode !== "view"}
                disabled={mode === "view"}
              />
            </div>

            {/* Fila 1.5 - Categorías y Patrocinadores (Multi-select) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MultiSelect
                label="Categorías"
                name="categoryIds"
                options={referenceData.categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                  description: cat.ageRange,
                }))}
                value={form.categoryIds}
                onChange={handleFormChange}
                error={errors.categoryIds}
                touched={touched.categoryIds}
                disabled={mode === "view"}
                placeholder="Busca y selecciona categorías"
                required={true}
              />

              <MultiSelect
                label="Patrocinadores"
                name="patrocinador"
                options={(referenceData.sponsors || []).map((sponsor) => ({
                  value: sponsor.nombre,
                  label: sponsor.nombre,
                  description: sponsor.tipoPersona
                    ? `${sponsor.tipoPersona} - ${sponsor.ciudad || ""}`
                    : sponsor.ciudad || "",
                }))}
                value={form.patrocinador}
                onChange={handleFormChange}
                error={errors.patrocinador}
                touched={touched.patrocinador}
                disabled={mode === "view"}
                placeholder="Busca y selecciona patrocinadores"
                required={false}
              />
            </div>

            {/* Fila 2 - Teléfono y Descripción */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Teléfono"
                name="telefono"
                value={form.telefono}
                onChange={handleFormChange}
                onBlur={() => handleBlur("telefono", form.telefono, form)}
                placeholder="Teléfono de contacto"
                error={errors.telefono}
                touched={touched.telefono}
                required={mode !== "view"}
                disabled={mode === "view"}
              />

              <div className="md:col-span-2">
                <FormField
                  label="Descripción"
                  name="descripcion"
                  type="textarea"
                  value={form.descripcion}
                  onChange={handleFormChange}
                  onBlur={() =>
                    handleBlur("descripcion", form.descripcion, form)
                  }
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
                onChange={handleFormChange}
                onBlur={() => handleBlur("fechaInicio", form.fechaInicio, form)}
                error={errors.fechaInicio}
                touched={touched.fechaInicio}
                required={mode !== "view"}
                disabled={mode === "view"}
                min={
                  isNew
                    ? (() => {
                        const oneWeekFromToday = new Date();
                        oneWeekFromToday.setDate(
                          oneWeekFromToday.getDate() + 7,
                        );
                        return oneWeekFromToday.toISOString().split("T")[0];
                      })()
                    : undefined
                }
              />

              <FormField
                label="Fecha fin"
                name="fechaFin"
                type="date"
                value={form.fechaFin}
                onChange={handleFormChange}
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
                onChange={handleFormChange}
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
                onChange={handleFormChange}
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
                  onChange={(url) => handleFormChange("imagen", url)}
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
                  onChange={(url) => handleFormChange("cronograma", url)}
                  disabled={mode === "view"}
                  type="schedule"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Publicar Evento
                </label>
                <div className="flex items-center gap-3">
                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() =>
                      mode !== "view" &&
                      handleFormChange("publicar", !form.publicar)
                    }
                    disabled={mode === "view"}
                    className={`
                        relative inline-flex h-6 w-11 items-center rounded-full
                        transition-colors duration-200 ease-in-out
                        focus:outline-none focus:ring-2 focus:ring-primary-purple focus:ring-offset-2
                        ${
                          mode === "view"
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer"
                        }
                        ${form.publicar ? "bg-primary-purple" : "bg-gray-300"}
                      `}
                  >
                    <span
                      className={`
                          inline-block h-4 w-4 transform rounded-full bg-white
                          transition-transform duration-200 ease-in-out
                          ${form.publicar ? "translate-x-6" : "translate-x-1"}
                        `}
                    />
                  </button>

                  {/* Label con estado */}
                  <span
                    className={`text-sm font-medium ${
                      form.publicar ? "text-primary-purple" : "text-gray-500"
                    }`}
                  >
                    {form.publicar
                      ? "Visible para todos"
                      : "Solo visible para administradores"}
                  </span>
                </div>

                {/* Descripción */}
                <p className="text-xs text-gray-500">
                  {form.publicar
                    ? "El evento será visible en la página pública"
                    : "El evento solo será visible en el panel de administración"}
                </p>
              </div>

              {/* Estado - Visible en modo view y edit */}
              {mode === "view" ? (
                // Modo ver: mostrar el estado como solo lectura
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Estado
                  </label>
                  <div
                    className={`px-4 py-2.5 border rounded-lg font-medium ${
                      form.estado === "Finalizado" ||
                      form.estado === "finalizado"
                        ? "bg-gray-100 border-gray-300 text-gray-700"
                        : form.estado === "Programado"
                          ? "bg-green-50 border-green-300 text-green-700"
                          : form.estado === "Cancelado"
                            ? "bg-red-50 border-red-300 text-red-700"
                            : "bg-gray-100 border-gray-300 text-gray-700"
                    }`}
                  >
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
                    onChange={handleFormChange}
                    onBlur={() => handleBlur("estado", form.estado, form)}
                    placeholder="Seleccione estado"
                    options={[
                      { value: "Programado", label: "Programado" },
                      { value: "Cancelado", label: "Cancelado" },
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    className="w-full sm:w-auto px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
                    style={{ pointerEvents: "auto", cursor: "pointer" }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubmit();
                    }}
                    type="button"
                    className="w-full sm:w-auto px-5 py-2 rounded-lg bg-primary-purple text-white font-semibold hover:bg-primary-blue transition"
                    style={{ pointerEvents: "auto", cursor: "pointer" }}
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

  // Renderizar el modal usando un portal para evitar problemas de z-index
  return createPortal(modalContent, document.body);
};

