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
} from "../../../../../../../../shared/utils/alerts";

const TemporaryWorkerModal = ({ isOpen, onClose, onSave, worker }) => {
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

  const handleSubmit = () => {
    if (!validateAllFields()) return;

    if (worker) {
      // 🔹 Solo editar muestra confirmación
      showConfirmAlert("¿Deseas actualizar este registro?", "", {
        confirmButtonText: "Sí, actualizar",
      }).then((result) => {
        if (result.isConfirmed) {
          onSave(formData);
          showSuccessAlert(
            "Registro Actualizado",
            "La persona temporal ha sido actualizada exitosamente."
          );
          onClose();
        }
      });
    } else {
      // 🔹 Crear no muestra confirmación
      onSave(formData);
      showSuccessAlert(
        "Registro Creado",
        "La persona temporal ha sido registrada exitosamente."
      );
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
      onClose();
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            ✕
          </button>
          <h2 className="text-3xl font-bold text-center text-primary-purple">
            {worker ? "Editar Persona Temporal" : "Crear Persona Temporal"}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo Documento */}
            <FormField
              label="Tipo de Documento"
              name="tipoDocumento"
              type="select"
              required
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
              required
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
              required
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
              required
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
              required
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
              required
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
              required
              value={formData.edad}
              error={errors.edad}
              touched={touched.edad}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {/* Categoría */}
            {formData.tipoPersona === "Jugadora" && (
              <FormField
                label="Categoría"
                name="categoria"
                type="select"
                options={[
                  { value: "Sub 13", label: "Sub 13" },
                  { value: "Sub 15", label: "Sub 15" },
                  { value: "Sub 17", label: "Sub 17" },
                ]}
                required
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
              required
              value={formData.estado}
              error={errors.estado}
              touched={touched.estado}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between px-6 py-6 border-t border-gray-200">
          <motion.button
            type="button"
            onClick={onClose}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            Cancelar
          </motion.button>
          <motion.button
            onClick={handleSubmit}
            className="px-8 py-3 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-xl font-medium shadow-lg"
          >
            {worker ? "Actualizar" : "Crear"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TemporaryWorkerModal;
