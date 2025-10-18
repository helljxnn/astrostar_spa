import { useEffect } from "react";
import { motion } from "framer-motion";
import { FormField } from "../../../../../../../../shared/components/FormField";
import {
  useFormTempWorkerValidation,
  tempWorkerValidationRules,
} from "../hooks/useFormTempWorkerValidation";
import {
  showSuccessAlert,
  showConfirmAlert,
  showErrorAlert,
} from "../../../../../../../../shared/utils/alerts";

const TemporaryWorkerModal = ({
  isOpen,
  onClose,
  onSave,
  worker,
  mode = "create",
}) => {
  const {
    values: formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAllFields,
    setValues: setFormData,
  } = useFormTempWorkerValidation(
    {
      tipoPersona: "",
      nombre: "",
      apellido: "",
      tipoDocumento: "",
      identificacion: "",
      telefono: "",
      fechaNacimiento: "",
      edad: "",
      categoria: "",
      equipo: "",
      estado: "",
    },
    tempWorkerValidationRules
  );

  // Prellenar si es edición
  useEffect(() => {
    if (worker) setFormData(worker);
    else
      setFormData({
        tipoPersona: "",
        nombre: "",
        apellido: "",
        tipoDocumento: "",
        identificacion: "",
        telefono: "",
        fechaNacimiento: "",
        edad: "",
        categoria: "",
        equipo: "",
        estado: "",
      });
  }, [worker, setFormData, isOpen]);

  // Calcular edad automáticamente cuando cambia la fecha de nacimiento
  useEffect(() => {
    if (formData.fechaNacimiento) {
      const birthDate = new Date(formData.fechaNacimiento);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      setFormData((prevData) => ({
        ...prevData,
        edad: age.toString(),
      }));
    }
  }, [formData.fechaNacimiento]);

  // Manejar cambios en el equipo para deportistas y entrenadores
  useEffect(() => {
    if (formData.equipo && formData.tipoPersona === "Deportista") {
      // Simular obtener categoría del equipo (esto vendría de la API en producción)
      const equiposCategorias = {
        "Águilas Doradas": "Sub 15",
        "Leones FC": "Sub 17",
        "Tigres Unidos": "Sub 13",
        "Panteras Negras": "Sub 15",
        "Halcones Rojos": "Sub 17",
        "Lobos Grises": "Sub 13",
      };

      const categoria = equiposCategorias[formData.equipo] || "No asignada";
      setFormData((prevData) => ({
        ...prevData,
        categoria: categoria,
      }));
    } else if (formData.tipoPersona === "Deportista" && !formData.equipo) {
      // Si es deportista sin equipo, categoría "No asignada"
      setFormData((prevData) => ({
        ...prevData,
        categoria: "No asignada",
      }));
    } else if (formData.tipoPersona !== "Deportista") {
      // Para entrenadores y participantes, siempre "No aplica"
      setFormData((prevData) => ({
        ...prevData,
        categoria: "No aplica",
      }));
    }
  }, [formData.equipo, formData.tipoPersona]);

  const handleSubmit = async () => {
    try {
      const isValid = validateAllFields();
      if (!isValid) return;

      // Confirmación solo al editar
      if (mode === "edit") {
        const result = await showConfirmAlert(
          "¿Estás seguro de actualizar esta persona temporal?",
          "Los cambios se guardarán y no se podrán deshacer fácilmente."
        );
        if (!result.isConfirmed) return;
      }

      onSave(formData);

      showSuccessAlert(
        mode === "edit"
          ? "Persona Temporal Editada"
          : "Persona Temporal Creada",
        mode === "edit"
          ? "La persona temporal ha sido actualizada exitosamente."
          : "La persona temporal ha sido registrada exitosamente."
      );

      onClose();
    } catch (error) {
      console.error("Error al guardar persona temporal:", error);
      showErrorAlert(
        "Error al guardar",
        "No se pudo guardar la persona temporal. Intenta de nuevo."
      );
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden relative flex flex-col"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-3 relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            {mode === "view"
              ? "Ver Persona Temporal"
              : mode === "edit"
              ? "Editar Persona Temporal"
              : "Crear Persona Temporal"}
          </h2>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Tipo Documento */}
            <FormField
              label="Tipo de Documento"
              name="tipoDocumento"
              type="select"
              required={mode !== "view"}
              disabled={mode === "view"}
              options={[
                {
                  value: "Tarjeta de Identidad",
                  label: "Tarjeta de Identidad",
                },
                {
                  value: "Cédula de Ciudadanía",
                  label: "Cédula de Ciudadanía",
                },
                {
                  value: "Permiso Especial de Permanencia",
                  label: "Permiso Especial de Permanencia",
                },
                {
                  value: "Tarjeta de Extranjería",
                  label: "Tarjeta de Extranjería",
                },
                {
                  value: "Cédula de Extranjería",
                  label: "Cédula de Extranjería",
                },
                {
                  value: "Número de Identificación Tributaria",
                  label: "Número de Identificación Tributaria",
                },
                { value: "Pasaporte", label: "Pasaporte" },
                {
                  value: "Documento de Identificación Extranjero",
                  label: "Documento de Identificación Extranjero",
                },
              ]}
              value={formData.tipoDocumento}
              error={errors.tipoDocumento}
              touched={touched.tipoDocumento}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {/* Identificación */}
            <FormField
              label="Número de Documento"
              name="identificacion"
              type="text"
              placeholder="Número de documento"
              required={mode !== "view"}
              disabled={mode === "view"}
              value={formData.identificacion}
              error={errors.identificacion}
              touched={touched.identificacion}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {/* Tipo Persona */}
            <FormField
              label="Tipo de Persona"
              name="tipoPersona"
              type="select"
              required={mode !== "view"}
              disabled={mode === "view"}
              options={[
                { value: "Deportista", label: "Deportista" },
                { value: "Entrenador", label: "Entrenador" },
                { value: "Participante", label: "Participante" },
              ]}
              value={formData.tipoPersona}
              error={errors.tipoPersona}
              touched={touched.tipoPersona}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {/* Nombre */}
            <FormField
              label="Nombre"
              name="nombre"
              type="text"
              placeholder="Nombre"
              required={mode !== "view"}
              disabled={mode === "view"}
              value={formData.nombre}
              error={errors.nombre}
              touched={touched.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {/* Apellido */}
            <FormField
              label="Apellido"
              name="apellido"
              type="text"
              placeholder="Apellido"
              required={mode !== "view"}
              disabled={mode === "view"}
              value={formData.apellido}
              error={errors.apellido}
              touched={touched.apellido}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {/* Teléfono */}
            <FormField
              label="Número Telefónico"
              name="telefono"
              type="text"
              placeholder="Número de teléfono"
              required={mode !== "view"}
              disabled={mode === "view"}
              value={formData.telefono}
              error={errors.telefono}
              touched={touched.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {/* Fecha Nacimiento */}
            <FormField
              label="Fecha de Nacimiento"
              name="fechaNacimiento"
              type="date"
              required={mode !== "view"}
              disabled={mode === "view"}
              value={formData.fechaNacimiento}
              error={errors.fechaNacimiento}
              touched={touched.fechaNacimiento}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {/* Edad */}
            <FormField
              label="Edad"
              name="edad"
              type="number"
              placeholder="Edad"
              required={mode !== "view"}
              disabled={true}
              value={formData.edad}
              error={errors.edad}
              touched={touched.edad}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {/* Campo de Equipo - Solo para Entrenadores y Deportistas (NO para Participantes) */}
            {(formData.tipoPersona === "Entrenador" ||
              formData.tipoPersona === "Deportista") && (
              <FormField
                label="Equipo Asignado"
                name="equipo"
                type="text"
                required={false}
                disabled={true} // Siempre deshabilitado - se asigna desde módulo de equipos
                value={formData.equipo || "No asignado"}
                error={errors.equipo}
                touched={touched.equipo}
                onChange={handleChange}
                onBlur={handleBlur}
                helpText="El equipo se asigna desde el módulo de equipos"
              />
            )}

            {/* Categoría - Solo para Deportistas y Entrenadores (NO para Participantes) */}
            {(formData.tipoPersona === "Deportista" ||
              formData.tipoPersona === "Entrenador") && (
              <FormField
                label="Categoría"
                name="categoria"
                type="text"
                required={false}
                disabled={true} // Siempre deshabilitado - se asigna automáticamente
                value={
                  formData.categoria ||
                  (formData.tipoPersona === "Deportista"
                    ? "No asignada"
                    : "No aplica")
                }
                error={errors.categoria}
                touched={touched.categoria}
                onChange={handleChange}
                onBlur={handleBlur}
                helpText={
                  formData.tipoPersona === "Deportista"
                    ? "La categoría se asigna automáticamente desde el equipo"
                    : "No aplica para este tipo de persona"
                }
              />
            )}

            {/* Estado */}
            <FormField
              label="Estado Persona"
              name="estado"
              type="select"
              options={[
                { value: "Activo", label: "Activo" },
                { value: "Inactivo", label: "Inactivo" },
              ]}
              required={mode !== "view"}
              disabled={mode === "view"}
              value={formData.estado}
              error={errors.estado}
              touched={touched.estado}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-3">
          {mode === "view" ? (
            <div className="flex justify-center">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-primary-blue text-white rounded-lg hover:opacity-90 transition"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <div className="flex justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium shadow-lg"
              >
                {mode === "edit" ? "Guardar Cambios" : "Crear Persona Temporal"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TemporaryWorkerModal;
