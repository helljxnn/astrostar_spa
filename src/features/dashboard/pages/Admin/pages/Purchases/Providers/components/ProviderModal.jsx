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
import { useProviderUniquenessValidation } from "../hooks/useProviderUniquenessValidation";
import { useDocumentTypes } from "../../../../../../../../shared/hooks/useDocumentTypes";

const entityTypes = [
  { value: "juridica", label: "Persona Jurídica" },
  { value: "natural", label: "Persona Natural" },
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
  const { documentTypes, loading: documentTypesLoading, error: documentTypesError } = useDocumentTypes();

  // Hook de validación del formulario
  const {
    values,
    errors,
    touched,
    handleChange: formHandleChange,
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

  // Hook de validación de campos únicos en tiempo real
  const {
    validations,
    validateField,
    reloadProviders,
    clearValidation,
    clearAllValidations
  } = useProviderUniquenessValidation(providerToEdit?.id);

  // Cargar datos al editar
  useEffect(() => {
    if (isOpen && isEditing && providerToEdit) {
      setValues({
        tipoEntidad: providerToEdit.tipoEntidad || "juridica",
        razonSocial: providerToEdit.razonSocial || "",
        nit: providerToEdit.nit || "",
        tipoDocumento: providerToEdit.tipoDocumento || "",
        contactoPrincipal: providerToEdit.contactoPrincipal || "",
        correo: providerToEdit.correo || "",
        telefono: providerToEdit.telefono || "",
        direccion: providerToEdit.direccion || "",
        ciudad: providerToEdit.ciudad || "",
        descripcion: providerToEdit.descripcion || "",
        estado: providerToEdit.estado || "Activo",
      });
      
      // Limpiar validaciones al cargar datos
      clearAllValidations();
    }
  }, [isOpen, isEditing, providerToEdit, setValues, clearAllValidations]);

  // Manejar cambios con validación en tiempo real
  const handleChange = (name, value) => {
    formHandleChange(name, value);
    
    // Validar campos únicos en tiempo real (solo backend)
    if (['nit', 'razonSocial', 'correo', 'contactoPrincipal'].includes(name)) {
      validateField(name, value, values.tipoEntidad);
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return phone;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (cleanPhone.startsWith("+57") || cleanPhone.startsWith("57")) return phone;
    if (/^\d{7,10}$/.test(cleanPhone)) return `+57 ${cleanPhone}`;
    return phone;
  };

  const handleSubmit = async () => {
    const allTouched = {};
    Object.keys(providerValidationRules).forEach((field) => {
      if (field === "tipoDocumento" && values.tipoEntidad === "juridica") {
        return;
      }
      allTouched[field] = true;
    });
    setTouched(allTouched);

    // Validar formulario
    if (!validateAllFields()) {
      showErrorAlert(
        "Campos incompletos",
        "Por favor completa todos los campos correctamente antes de continuar."
      );
      return;
    }

    // Verificar si hay campos duplicados validados por backend
    const hasDuplicates = Object.values(validations).some(v => v.backendValidated && v.isDuplicate);
    if (hasDuplicates) {
      showErrorAlert(
        "Datos duplicados",
        "Algunos campos ya están registrados. Por favor, verifica la información."
      );
      return;
    }

    // Verificar si aún se están validando campos
    const isStillChecking = Object.values(validations).some(v => v.isChecking);
    if (isStillChecking) {
      showErrorAlert(
        "Validando campos",
        "Por favor, espera mientras se valida la información."
      );
      return;
    }

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

      // Recargar proveedores para validación futura
      await reloadProviders();

      resetForm();
      clearAllValidations();
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

  const handleClose = () => {
    resetForm();
    clearAllValidations();
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

        <div className="flex-1 overflow-y-auto p-3">
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
                    onChange={(e) => handleChange('tipoEntidad', e.target.value)}
                    className="sr-only"
                  />
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Razón Social / Nombre */}
            <motion.div
              key={`razon-social-${values.tipoEntidad}`}
              className="space-y-2"
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
              
              {/* Estados de validación en tiempo real - SOLO BACKEND */}
              {validations.razonSocial.isChecking && (
                <div className="text-blue-500 text-xs flex items-center gap-2">
                  <div className="animate-spin w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span>Verificando disponibilidad...</span>
                </div>
              )}
              
              {validations.razonSocial.backendValidated && validations.razonSocial.isDuplicate && (
                <div className="text-red-500 text-xs flex items-center gap-1">
                  <span>❌</span>
                  <span>{validations.razonSocial.message}</span>
                </div>
              )}
              
              {validations.razonSocial.backendValidated && validations.razonSocial.isAvailable && (
                <div className="text-green-500 text-xs flex items-center gap-1">
                  <span>✅</span>
                  <span>
                    {values.tipoEntidad === 'juridica' 
                      ? 'Razón social disponible' 
                      : 'Nombre disponible'
                    }
                  </span>
                </div>
              )}
            </motion.div>

            {/* Tipo de Documento (solo persona natural) */}
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
                  {documentTypesLoading && (
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700">
                        Tipo de documento *
                      </label>
                      <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                        Cargando tipos de documento...
                      </div>
                    </div>
                  )}
                  
                  {documentTypesError && (
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700">
                        Tipo de documento *
                      </label>
                      <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                        Error: {documentTypesError}
                      </div>
                    </div>
                  )}
                  
                  {!documentTypesLoading && !documentTypesError && (
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
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* NIT / Identificación */}
            <motion.div
              key={`nit-${values.tipoEntidad}`}
              className="space-y-2"
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
              
              {/* Estados de validación en tiempo real - SOLO BACKEND */}
              {validations.nit.isChecking && (
                <div className="text-blue-500 text-xs flex items-center gap-2">
                  <div className="animate-spin w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span>Verificando {values.tipoEntidad === 'juridica' ? 'NIT' : 'documento'}...</span>
                </div>
              )}
              
              {validations.nit.backendValidated && validations.nit.isDuplicate && (
                <div className="text-red-500 text-xs flex items-center gap-1">
                  <span>❌</span>
                  <span>{validations.nit.message}</span>
                </div>
              )}
              
              {validations.nit.backendValidated && validations.nit.isAvailable && (
                <div className="text-green-500 text-xs flex items-center gap-1">
                  <span>✅</span>
                  <span>
                    {values.tipoEntidad === 'juridica' 
                      ? 'NIT disponible' 
                      : 'Documento disponible'
                    }
                  </span>
                </div>
              )}
            </motion.div>

            {/* Contacto Principal */}
            <motion.div
              key={`contacto-${values.tipoEntidad}`}
              className="space-y-2"
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
              
              {/* Estados de validación en tiempo real - SOLO BACKEND */}
              {validations.contactoPrincipal.isChecking && (
                <div className="text-blue-500 text-xs flex items-center gap-2">
                  <div className="animate-spin w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span>Verificando contacto...</span>
                </div>
              )}
              
              {validations.contactoPrincipal.backendValidated && validations.contactoPrincipal.isDuplicate && (
                <div className="text-red-500 text-xs flex items-center gap-1">
                  <span>❌</span>
                  <span>{validations.contactoPrincipal.message}</span>
                </div>
              )}
              
              {validations.contactoPrincipal.backendValidated && validations.contactoPrincipal.isAvailable && (
                <div className="text-green-500 text-xs flex items-center gap-1">
                  <span>✅</span>
                  <span>Contacto disponible</span>
                </div>
              )}
            </motion.div>

            {/* Correo Electrónico */}
            <motion.div
              key={`correo-${values.tipoEntidad}`}
              className="space-y-2"
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
              
              {/* Estados de validación en tiempo real - SOLO BACKEND */}
              {validations.correo.isChecking && (
                <div className="text-blue-500 text-xs flex items-center gap-2">
                  <div className="animate-spin w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span>Verificando email...</span>
                </div>
              )}
              
              {validations.correo.backendValidated && validations.correo.isDuplicate && (
                <div className="text-red-500 text-xs flex items-center gap-1">
                  <span>❌</span>
                  <span>{validations.correo.message}</span>
                </div>
              )}
              
              {validations.correo.backendValidated && validations.correo.isAvailable && (
                <div className="text-green-500 text-xs flex items-center gap-1">
                  <span>✅</span>
                  <span>Email disponible</span>
                </div>
              )}
            </motion.div>

            {/* Teléfono */}
            <motion.div
              key={`telefono-${values.tipoEntidad}`}
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

            {/* Dirección */}
            <motion.div
              key={`direccion-${values.tipoEntidad}`}
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

            {/* Ciudad */}
            <motion.div
              key={`ciudad-${values.tipoEntidad}`}
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

            {/* Estado */}
            <motion.div
              key={`estado-${values.tipoEntidad}`}
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

            {/* Descripción */}
            <motion.div
              key={`descripcion-${values.tipoEntidad}`}
              className="lg:col-span-3"
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