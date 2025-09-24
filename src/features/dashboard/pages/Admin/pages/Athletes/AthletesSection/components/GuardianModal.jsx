// components/GuardianModal.jsx
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { FormField } from "../../../../../../../../shared/components/FormField";
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from "../../../../../../../../shared/utils/alerts";
import { useFormGuardianValidation, guardianValidationRules } from "../hooks/useFormGuardianValidation";

const documentTypes = [
  { value: "CC", label: "Cédula de Ciudadanía" },
  { value: "TI", label: "Tarjeta de Identidad" },
  { value: "CE", label: "Cédula de Extranjería" },
  { value: "PA", label: "Pasaporte" },
];

const states = [
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
];

const GuardianModal = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  guardianToEdit = null,
  mode = guardianToEdit ? "edit" : "create",
}) => {
  const isEditing = mode === "edit" || guardianToEdit !== null;
  
  const { values, errors, touched, handleChange, handleBlur, validateAllFields, resetForm, setTouched, setValues } =
    useFormGuardianValidation(
      {
        nombreCompleto: "",
        tipoDocumento: "",
        identificacion: "",
        correo: "",
        telefono: "",
        fechaNacimiento: "",
        estado: "Activo",
      },
      guardianValidationRules
    );

  useEffect(() => {
    if (isOpen && isEditing && guardianToEdit) {
      setValues({
        nombreCompleto: guardianToEdit.nombreCompleto || "",
        tipoDocumento: guardianToEdit.tipoDocumento || "",
        identificacion: guardianToEdit.identificacion || "",
        correo: guardianToEdit.correo || "",
        telefono: guardianToEdit.telefono || "",
        fechaNacimiento: guardianToEdit.fechaNacimiento || "",
        estado: guardianToEdit.estado || "Activo",
      });
    }
  }, [isOpen, isEditing, guardianToEdit, setValues]);

  const handleSubmit = async () => {
    const allTouched = {};
    Object.keys(guardianValidationRules).forEach((f) => (allTouched[f] = true));
    setTouched(allTouched);
    
    if (!validateAllFields()) {
      return;
    }

    if (isEditing) {
      const confirm = await showConfirmAlert(
        "¿Actualizar?",
        `Actualizar datos de ${guardianToEdit.nombreCompleto}`,
        { confirmButtonText: "Sí, actualizar", cancelButtonText: "Cancelar" }
      );
      if (!confirm.isConfirmed) return;
    }

    try {
      const dataToSend = {
        ...values,
        nombreCompleto: values.nombreCompleto.trim(),
        identificacion: values.identificacion.trim(),
      };

      if (isEditing) {
        await onUpdate({ ...dataToSend, id: guardianToEdit.id });
        showSuccessAlert("Actualizado", "Acudiente actualizado exitosamente.");
      } else {
        const saved = await onSave(dataToSend);
        showSuccessAlert("Creado", "Acudiente creado correctamente.");
        return saved;
      }
      
      resetForm();
      onClose();
    } catch (err) {
      console.error(err);
      showErrorAlert("Error", "Ocurrió un error al guardar el acudiente.");
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            onClick={handleClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            {isEditing ? "Editar Acudiente" : "Crear Acudiente"}
          </h2>
          {isEditing && (
            <p className="text-center text-gray-600 mt-2">
              Modificando información de:{" "}
              <span className="font-semibold text-primary-purple">
                {guardianToEdit.nombreCompleto}
              </span>
            </p>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Nombre Completo"
              name="nombreCompleto"
              type="text"
              placeholder="Nombre completo del acudiente"
              value={values.nombreCompleto}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.nombreCompleto}
              touched={touched.nombreCompleto}
              delay={0.1}
              required
            />
            
            <FormField
              label="Tipo de Documento"
              name="tipoDocumento"
              type="select"
              placeholder="Selecciona el tipo de documento"
              options={documentTypes}
              value={values.tipoDocumento}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.tipoDocumento}
              touched={touched.tipoDocumento}
              delay={0.15}
              required
            />
            
            <FormField
              label="Número de Documento"
              name="identificacion"
              type="text"
              placeholder="Número de identificación"
              value={values.identificacion}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.identificacion}
              touched={touched.identificacion}
              delay={0.2}
              required
            />
            
            <FormField
              label="Correo Electrónico"
              name="correo"
              type="email"
              placeholder="correo@ejemplo.com"
              value={values.correo}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.correo}
              touched={touched.correo}
              delay={0.25}
              required
            />
            
            <FormField
              label="Número Telefónico"
              name="telefono"
              type="text"
              placeholder="3001234567 o 6012345678"
              value={values.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.telefono}
              touched={touched.telefono}
              delay={0.3}
              required
            />
            
            <FormField
              label="Fecha de Nacimiento"
              name="fechaNacimiento"
              type="date"
              placeholder="Selecciona la fecha"
              value={values.fechaNacimiento}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.fechaNacimiento}
              touched={touched.fechaNacimiento}
              delay={0.35}
              required
            />
            
            <FormField
              label="Estado"
              name="estado"
              type="select"
              placeholder="Selecciona el estado"
              options={states}
              value={values.estado}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.estado}
              touched={touched.estado}
              delay={0.4}
              required
            />
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between pt-6 border-t border-gray-200 p-6"
        >
          <motion.button
            type="button"
            onClick={handleClose}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancelar
          </motion.button>
          <motion.button
            onClick={handleSubmit}
            className="px-8 py-3 text-white rounded-xl font-medium shadow-lg bg-gradient-to-r from-primary-purple to-primary-blue"
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(139, 92, 246, 0.3)" }}
            whileTap={{ scale: 0.98 }}
          >
            {isEditing ? "Actualizar Acudiente" : "Crear Acudiente"}
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default GuardianModal;