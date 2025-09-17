import React, { useState, useEffect } from "react";
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
} from "../../../../../../../../shared/utils/Alerts";

const TemporaryWorkerModal = ({ isOpen, onClose, onSave, worker, mode = "create" }) => {
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
      tipoDocumento: "",
      identificacion: "",
      telefono: "",
      fechaNacimiento: "",
      edad: "",
      categoria: "",
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
        tipoDocumento: "",
        identificacion: "",
        telefono: "",
        fechaNacimiento: "",
        edad: "",
        categoria: "",
        estado: "",
      });
  }, [worker, setFormData, isOpen]);

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
        mode === "edit" ? "Persona Temporal Editada" : "Persona Temporal Creada",
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto relative"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-4 z-10">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            {mode === "view" ? "Ver Persona Temporal" : mode === "edit" ? "Editar Persona Temporal" : "Crear Persona Temporal"}
          </h2>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                { value: "Jugadora", label: "Jugadora" },
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
              placeholder="Nombre completo"
              required={mode !== "view"}
              disabled={mode === "view"}
              value={formData.nombre}
              error={errors.nombre}
              touched={touched.nombre}
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
              disabled={mode === "view"}
              value={formData.edad}
              error={errors.edad}
              touched={touched.edad}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {/* Categoría */}
            {(formData.tipoPersona === "Jugadora" || (mode === "view" && formData.categoria)) && (
              <FormField
                label="Categoría"
                name="categoria"
                type="select"
                options={[
                  { value: "Sub 13", label: "Sub 13" },
                  { value: "Sub 15", label: "Sub 15" },
                  { value: "Sub 17", label: "Sub 17" },
                ]}
                required={mode !== "view" && formData.tipoPersona === "Jugadora"}
                disabled={mode === "view"}
                value={formData.categoria}
                error={errors.categoria}
                touched={touched.categoria}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            )}

            {/* Estado */}
            <FormField
              label="Estado Registro"
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
        {mode === "view" ? (
          /* Botón cerrar */
          <div className="flex justify-center py-3 px-4">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg hover:opacity-90 transition"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-between px-4 py-3 border-t border-gray-200"
          >
            <motion.button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancelar
            </motion.button>
            <motion.button
              onClick={handleSubmit}
              className="px-6 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg hover:from-primary-purple hover:to-primary-blue transition-all duration-200 font-medium shadow-lg"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 25px rgba(139, 92, 246, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              {mode === "edit" ? "Guardar Cambios" : "Crear Persona Temporal"}
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default TemporaryWorkerModal;
