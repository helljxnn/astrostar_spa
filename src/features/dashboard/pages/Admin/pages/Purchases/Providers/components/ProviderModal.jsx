import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormField } from "../../../../../../../../shared/components/FormField";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../../../../../../../../shared/utils/alerts";
import {
  useFormProviderValidation,
  providerValidationRules,
} from "../hooks/useFormProviderValidation";

const entityTypes = [
  { value: "juridica", label: "Persona Jurídica" },
  { value: "natural", label: "Persona Natural" },
];

const documentTypes = [
  { value: "CC", label: "Cédula de ciudadanía" },
  { value: "TI", label: "Tarjeta de identidad" },
  { value: "CE", label: "Cédula de extranjería" },
  { value: "PAS", label: "Pasaporte" },
];

const states = [
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
];

const ProviderModal = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  providerToEdit = null,
  mode = providerToEdit ? "edit" : "create",
}) => {
  const isEditing = mode === "edit" || providerToEdit !== null;

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAllFields,
    resetForm,
    setTouched,
    setValues,
  } = useFormProviderValidation(
    {
      tipoEntidad: "juridica",
      razonSocial: "",
      nit: "",
      tipoDocumento: "",
      contactoPrincipal: "",
      correo: "",
      telefono: "",
      direccion: "",
      ciudad: "",
      descripcion: "",
      estado: "Activo",
    },
    providerValidationRules
  );

  // Cargar datos del proveedor cuando se abra el modal en modo edición
  useEffect(() => {
    if (isOpen && isEditing && providerToEdit) {
      setValues({
        tipoEntidad: providerToEdit.tipoEntidad || "juridica",
        razonSocial: providerToEdit.razonSocial || "",
        nit: providerToEdit.nit || "",
        tipoDocumento: providerToEdit.tipoDocumento || "CC",
        contactoPrincipal: providerToEdit.contactoPrincipal || "",
        correo: providerToEdit.correo || "",
        telefono: providerToEdit.telefono || "",
        direccion: providerToEdit.direccion || "",
        ciudad: providerToEdit.ciudad || "",
        descripcion: providerToEdit.descripcion || "",
        estado: providerToEdit.estado || "Activo",
      });
    }
  }, [isOpen, isEditing, providerToEdit, setValues]);

  const formatPhoneNumber = (phone) => {
    if (!phone) return phone;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (cleanPhone.startsWith("+57") || cleanPhone.startsWith("57")) return phone;
    if (/^\d{7,10}$/.test(cleanPhone)) return `+57 ${cleanPhone}`;
    return phone;
  };

  const handleSubmit = async () => {
    // 1. Marcar todos los campos como tocados
    const allTouched = {};
    Object.keys(providerValidationRules).forEach((field) => {
      // Solo validar tipoDocumento si es persona natural
      if (field === "tipoDocumento" && values.tipoEntidad === "juridica") {
        return;
      }
      allTouched[field] = true;
    });
    setTouched(allTouched);

    // 2. Validar todos los campos
    if (!validateAllFields()) {
      if (isEditing) {
        showErrorAlert(
          "Campos incompletos",
          "Por favor completa todos los campos correctamente antes de continuar."
        );
      }
      return;
    }

    // 3. Confirmar en modo edición
    if (isEditing) {
      const confirmResult = await showConfirmAlert(
        "¿Estás seguro?",
        `¿Deseas actualizar la información del proveedor ${providerToEdit.razonSocial}?`,
        {
          confirmButtonText: "Sí, actualizar",
          cancelButtonText: "Cancelar",
        }
      );
      if (!confirmResult.isConfirmed) {
        return;
      }
    }

    try {
      const providerData = {
        ...values,
        telefono: formatPhoneNumber(values.telefono),
        // Si es jurídica, no incluir tipoDocumento
        ...(values.tipoEntidad === "juridica" && { tipoDocumento: undefined }),
      };

      if (isEditing) {
        const updatedProviderData = { ...providerData, id: providerToEdit.id };
        await onUpdate(updatedProviderData);
        showSuccessAlert(
          "Proveedor actualizado",
          `Los datos de ${values.razonSocial} han sido actualizados exitosamente.`
        );
      } else {
        await onSave(providerData);
        showSuccessAlert(
          "Proveedor creado",
          "El proveedor ha sido creado exitosamente."
        );
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error(
        `Error al ${isEditing ? "actualizar" : "crear"} proveedor:`,
        error
      );
      showErrorAlert(
        "Error",
        error.message ||
          `Ocurrió un error al ${isEditing ? "actualizar" : "crear"} el proveedor`
      );
    }
  };

  // Función para cerrar el modal y resetear el formulario
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
            onClick={handleClose}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            {isEditing ? "Editar Proveedor" : "Crear Proveedor"}
          </h2>
          {isEditing && (
            <p className="text-center text-gray-600 mt-2">
              Modificando información de:{" "}
              <span className="font-semibold text-primary-purple">
                {providerToEdit.razonSocial}
              </span>
            </p>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Tipo de Entidad - Radio Buttons Estilizados */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="space-y-3 mb-3"
          >
            <label className="block text-sm font-medium text-gray-700">
              Tipo de Entidad *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {entityTypes.map((type) => (
                <motion.label
                  key={type.value}
                  className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    values.tipoEntidad === type.value
                      ? "border-primary-blue bg-gradient-to-br from-primary-blue/10 to-primary-purple/10 shadow-lg"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="radio"
                    name="tipoEntidad"
                    value={type.value}
                    checked={values.tipoEntidad === type.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  
                  {/* Custom Radio Button */}
                  <div className="flex items-center w-full">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        values.tipoEntidad === type.value
                          ? "border-primary-blue bg-primary-blue shadow-lg"
                          : "border-gray-300"
                      }`}
                    >
                      {values.tipoEntidad === type.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-white rounded-full"
                        />
                      )}
                    </div>
                    
                    {/* Label con icono */}
                    <div className="ml-3 flex items-center flex-1">
                      <div className={`p-1.5 rounded-lg mr-2 ${
                        values.tipoEntidad === type.value
                          ? "bg-primary-blue/20 text-primary-blue"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {type.value === "juridica" ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <span className={`text-sm font-semibold block ${
                          values.tipoEntidad === type.value
                            ? "text-primary-blue"
                            : "text-gray-700"
                        }`}>
                          {type.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Indicador de selección */}
                  {values.tipoEntidad === type.value && (
                    <motion.div
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute top-2 right-2 text-primary-blue"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </motion.label>
              ))}
            </div>
          </motion.div>

          {/* Grid de campos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <motion.div
              key={`razon-social-${values.tipoEntidad}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <FormField
                label={values.tipoEntidad === "juridica" ? "Razón Social" : "Nombre Completo"}
                name="razonSocial"
                type="text"
                placeholder={values.tipoEntidad === "juridica" ? "Nombre de la empresa" : "Nombre completo"}
                value={values.razonSocial}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.razonSocial}
                touched={touched.razonSocial}
                required
              />
            </motion.div>

            {/* Campo Tipo de Documento - Solo para Persona Natural */}
            <AnimatePresence mode="wait">
              {values.tipoEntidad === "natural" && (
                <motion.div
                  key="tipo-documento-natural"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    duration: 0.15,
                    ease: "easeOut"
                  }}
                >
                  <FormField
                    label="Tipo de documento"
                    name="tipoDocumento"
                    type="select"
                    placeholder="Selecciona el tipo de documento"
                    options={documentTypes}
                    value={values.tipoDocumento}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.tipoDocumento}
                    touched={touched.tipoDocumento}
                    required={values.tipoEntidad === "natural"}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              key={`nit-${values.tipoEntidad}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <FormField
                label={values.tipoEntidad === "juridica" ? "NIT" : "Identificación"}
                name="nit"
                type="text"
                placeholder={values.tipoEntidad === "juridica" ? "900123456-7" : "Número de identificación"}
                value={values.nit}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.nit}
                touched={touched.nit}
                required
              />
            </motion.div>

            <motion.div
              key={`contacto-${values.tipoEntidad}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <FormField
                label="Contacto Principal"
                name="contactoPrincipal"
                type="text"
                placeholder="Nombre del contacto"
                value={values.contactoPrincipal}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.contactoPrincipal}
                touched={touched.contactoPrincipal}
                required
              />
            </motion.div>

            <motion.div
              key={`correo-${values.tipoEntidad}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <FormField
                label="Correo Electrónico"
                name="correo"
                type="email"
                placeholder="correo@empresa.com"
                value={values.correo}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.correo}
                touched={touched.correo}
                required
              />
            </motion.div>

            <motion.div
              key={`telefono-${values.tipoEntidad}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              <FormField
                label="Número Telefónico"
                name="telefono"
                type="text"
                placeholder="3001234567"
                value={values.telefono}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.telefono}
                touched={touched.telefono}
                required
              />
            </motion.div>

            <motion.div
              key={`direccion-${values.tipoEntidad}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <FormField
                label="Dirección"
                name="direccion"
                type="text"
                placeholder="Dirección completa"
                value={values.direccion}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.direccion}
                touched={touched.direccion}
                required
              />
            </motion.div>

            <motion.div
              key={`ciudad-${values.tipoEntidad}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.4 }}
            >
              <FormField
                label="Ciudad"
                name="ciudad"
                type="text"
                placeholder="Ciudad donde opera"
                value={values.ciudad}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.ciudad}
                touched={touched.ciudad}
                required
              />
            </motion.div>

            <motion.div
              key={`estado-${values.tipoEntidad}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
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
                required
              />
            </motion.div>

            <motion.div
              key={`descripcion-${values.tipoEntidad}`}
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.4 }}
            >
              <FormField
                label="Descripción"
                name="descripcion"
                type="textarea"
                placeholder="Descripción detallada del proveedor..."
                value={values.descripcion}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.descripcion}
                touched={touched.descripcion}
                rows={3}
              />
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-3">
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
            >
              {isEditing ? "Actualizar Proveedor" : "Crear Proveedor"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProviderModal;