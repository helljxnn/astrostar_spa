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
import { useRealtimeValidation } from "../hooks/useRealtimeValidation";
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

  const uniqueDocumentTypes = documentTypes ? documentTypes.filter((doc, index, self) => 
    index === self.findIndex(d => d.value === doc.value)
  ) : [];

  const {
    availabilityErrors,
    checkingFields,
    setCheckingFields,
    debouncedCheckNit,
    debouncedCheckBusinessName,
    resetAvailabilityErrors,
    clearAvailabilityError
  } = useRealtimeValidation(providerToEdit);

  const {
    values,
    errors,
    touched,
    handleChange: originalHandleChange,
    handleBlur,
    validateAllFields,
    resetForm,
    setValues,
    setTouched,
    touchAllFields
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

  const handleChange = (name, value) => {
    originalHandleChange(name, value);

    if (name === 'nit') {
      clearAvailabilityError('nit');
      const cleanedValue = value.replace(/[.\-\s]/g, '');
      if (cleanedValue.length >= 8) {
        setCheckingFields(prev => ({ ...prev, nit: true }));
        debouncedCheckNit(value, values.tipoEntidad);
      } else {
        clearAvailabilityError('nit');
      }
    }

    if (name === 'razonSocial') {
      clearAvailabilityError('razonSocial');
      if (value.trim().length >= 3) {
        setCheckingFields(prev => ({ ...prev, razonSocial: true }));
        debouncedCheckBusinessName(value, values.tipoEntidad);
      } else {
        clearAvailabilityError('razonSocial');
      }
    }

    if (name === 'tipoEntidad') {
      // Limpiar errores de disponibilidad
      clearAvailabilityError('nit');
      clearAvailabilityError('razonSocial');
      
      // Resetear el estado de verificación
      setCheckingFields({ nit: false, razonSocial: false });
      
      // Cancelar cualquier verificación pendiente
      if (debounceTimers.current.nit) {
        clearTimeout(debounceTimers.current.nit);
      }
      if (debounceTimers.current.razonSocial) {
        clearTimeout(debounceTimers.current.razonSocial);
      }

      // Reiniciar verificaciones si hay valores existentes
      if (values.nit && values.nit.trim().length >= 8) {
        setCheckingFields(prev => ({ ...prev, nit: true }));
        setTimeout(() => debouncedCheckNit(values.nit, value), 100);
      }
      if (values.razonSocial && values.razonSocial.trim().length >= 3) {
        setCheckingFields(prev => ({ ...prev, razonSocial: true }));
        setTimeout(() => debouncedCheckBusinessName(values.razonSocial, value), 100);
      }
    }
  };

  const getCombinedError = (fieldName) => {
    // Solo retornar error si el campo ha sido tocado
    if (!touched[fieldName]) {
      return null;
    }
    return availabilityErrors[fieldName] || errors[fieldName];
  };

  const isFieldTouched = (fieldName) => {
    // Solo mostrar error si el campo ha sido tocado Y tiene error
    return touched[fieldName] && (errors[fieldName] || availabilityErrors[fieldName]);
  };

  const shouldShowAvailabilityIndicator = (fieldName) => {
    const value = values[fieldName]?.trim();
    
    if (fieldName === 'razonSocial') {
      return value && value.length >= 3 && !errors[fieldName];
    }
    
    if (fieldName === 'nit') {
      const cleanedNit = value?.replace(/[.\-\s]/g, '');
      return cleanedNit && cleanedNit.length >= 8 && !errors[fieldName];
    }
    
    return false;
  };

  useEffect(() => {
    if (isOpen && isEditing && providerToEdit) {
      const editData = {
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
      };

      setValues(editData);
      setTouched({}); // Resetear touched al cargar datos de edición
      resetAvailabilityErrors();
      
      setTimeout(() => {
        if (editData.nit && editData.nit.trim().length >= 8) {
          debouncedCheckNit(editData.nit, editData.tipoEntidad);
        }
        if (editData.razonSocial && editData.razonSocial.trim().length >= 3) {
          debouncedCheckBusinessName(editData.razonSocial, editData.tipoEntidad);
        }
      }, 100);
    }
  }, [isOpen, isEditing, providerToEdit, setValues, setTouched, resetAvailabilityErrors, debouncedCheckNit, debouncedCheckBusinessName]);

  const formatPhoneNumber = (phone) => {
    if (!phone) return phone;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (cleanPhone.startsWith("+57") || cleanPhone.startsWith("57")) return phone;
    if (/^\d{7,10}$/.test(cleanPhone)) return `+57 ${cleanPhone}`;
    return phone;
  };

  const handleSubmit = async () => {
    touchAllFields();

    const hasValidationErrors = !validateAllFields();
    const hasAvailabilityErrors = Object.keys(availabilityErrors).length > 0;
    const isChecking = Object.values(checkingFields).some(checking => checking);

    if (isChecking) {
      showErrorAlert(
        "Validando datos",
        "Por favor espera mientras se verifican los datos..."
      );
      return;
    }

    if (hasAvailabilityErrors) {
      const errorMessages = Object.entries(availabilityErrors)
        .map(([field, message]) => message)
        .join('\n');
      
      showErrorAlert(
        "Datos duplicados",
        errorMessages || "Por favor corrige los campos marcados con error antes de continuar."
      );
      return;
    }

    if (hasValidationErrors) {
      showErrorAlert(
        "Campos incompletos",
        "Por favor completa todos los campos correctamente antes de continuar."
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
      };

      if (values.tipoEntidad === 'juridica') {
        delete providerData.tipoDocumento;
      }

      let result;
      if (isEditing) {
        const updatedProviderData = { ...providerData, id: providerToEdit.id };
        result = await onUpdate(updatedProviderData);
      } else {
        result = await onSave(providerData);
      }

      if (result && result.success) {
        showSuccessAlert(
          isEditing ? "Proveedor actualizado" : "Proveedor creado",
          isEditing 
            ? `Los datos de ${values.razonSocial} han sido actualizados exitosamente.`
            : "El proveedor ha sido creado exitosamente."
        );
        resetForm();
        setTouched({});
        resetAvailabilityErrors();
        onClose();
      } else {
        throw new Error(result?.message || `Error al ${isEditing ? "actualizar" : "crear"} el proveedor`);
      }
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
    setTouched({}); // Asegurar que se resetee el estado touched
    resetAvailabilityErrors();
    onClose();
  };

  const getDynamicLabel = (field) => {
    switch (field) {
      case 'razonSocial':
        return values.tipoEntidad === 'juridica' ? "Razón Social" : "Nombre Completo";
      case 'nit':
        return values.tipoEntidad === 'juridica' ? "NIT" : "Documento de Identidad";
      case 'razonSocialPlaceholder':
        return values.tipoEntidad === 'juridica' ? "Nombre de la empresa" : "Nombre completo";
      case 'nitPlaceholder':
        return values.tipoEntidad === 'juridica' ? "900123456-7" : "Número de identificación";
      default:
        return '';
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Tipo de Entidad */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="space-y-3 mb-3"
          >
            <label className="block text-sm font-medium text-gray-700">
              Tipo de Entidad
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

          {/* Campos del formulario */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Razón Social / Nombre con validación en tiempo real */}
            <motion.div className="relative">
              <FormField
                label={getDynamicLabel('razonSocial')}
                name="razonSocial"
                type="text"
                placeholder={getDynamicLabel('razonSocialPlaceholder')}
                value={values.razonSocial}
                onChange={handleChange}
                onBlur={handleBlur}
                error={getCombinedError('razonSocial')}
                touched={isFieldTouched('razonSocial')}
                required
              />
              
              {/* Indicadores de estado - SOLO cuando no hay errores */}
              {!getCombinedError('razonSocial') && shouldShowAvailabilityIndicator('razonSocial') && (
                <div className="mt-1">
                  {checkingFields.razonSocial ? (
                    <div className="text-blue-500 text-sm flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <span>Verificando disponibilidad...</span>
                    </div>
                  ) : (
                    <div className="text-green-500 text-sm flex items-center gap-1">
                      <span>✅</span>
                      <span>
                        {values.tipoEntidad === 'juridica' 
                          ? 'Razón social disponible' 
                          : 'Nombre disponible'
                        }
                      </span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Tipo de Documento (solo para persona natural) */}
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
                  {!documentTypesLoading && !documentTypesError && (
                    <FormField
                      label="Tipo de documento"
                      name="tipoDocumento"
                      type="select"
                      placeholder="Selecciona el tipo de documento"
                      options={uniqueDocumentTypes}
                      value={values.tipoDocumento}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={getCombinedError('tipoDocumento')}
                      touched={isFieldTouched('tipoDocumento')}
                      required={values.tipoEntidad === "natural"}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* NIT / Documento con validación en tiempo real */}
            <motion.div className="relative">
              <FormField
                label={getDynamicLabel('nit')}
                name="nit"
                type="text"
                placeholder={getDynamicLabel('nitPlaceholder')}
                value={values.nit}
                onChange={handleChange}
                onBlur={handleBlur}
                error={getCombinedError('nit')}
                touched={isFieldTouched('nit')}
                required
              />
              
              {/* Indicadores de estado - SOLO cuando no hay errores */}
              {!getCombinedError('nit') && shouldShowAvailabilityIndicator('nit') && (
                <div className="mt-1">
                  {checkingFields.nit ? (
                    <div className="text-blue-500 text-sm flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <span>Verificando disponibilidad...</span>
                    </div>
                  ) : (
                    <div className="text-green-500 text-sm flex items-center gap-1">
                      <span>✅</span>
                      <span>
                        {values.tipoEntidad === 'juridica' 
                          ? 'NIT disponible' 
                          : 'Documento disponible'
                        }
                      </span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Resto de campos */}
            <motion.div>
              <FormField
                label="Contacto Principal"
                name="contactoPrincipal"
                type="text"
                placeholder="Nombre del contacto"
                value={values.contactoPrincipal}
                onChange={handleChange}
                onBlur={handleBlur}
                error={getCombinedError('contactoPrincipal')}
                touched={isFieldTouched('contactoPrincipal')}
                required
              />
            </motion.div>

            <motion.div>
              <FormField
                label="Correo Electrónico"
                name="correo"
                type="email"
                placeholder="correo@empresa.com (opcional)"
                value={values.correo}
                onChange={handleChange}
                onBlur={handleBlur}
                error={getCombinedError('correo')}
                touched={isFieldTouched('correo')}
              />
            </motion.div>

            <motion.div>
              <FormField
                label="Número Telefónico"
                name="telefono"
                type="text"
                placeholder="3001234567"
                value={values.telefono}
                onChange={handleChange}
                onBlur={handleBlur}
                error={getCombinedError('telefono')}
                touched={isFieldTouched('telefono')}
                required
              />
            </motion.div>

            <motion.div>
              <FormField
                label="Dirección"
                name="direccion"
                type="text"
                placeholder="Dirección completa"
                value={values.direccion}
                onChange={handleChange}
                onBlur={handleBlur}
                error={getCombinedError('direccion')}
                touched={isFieldTouched('direccion')}
                required
              />
            </motion.div>

            <motion.div>
              <FormField
                label="Ciudad"
                name="ciudad"
                type="text"
                placeholder="Ciudad donde opera"
                value={values.ciudad}
                onChange={handleChange}
                onBlur={handleBlur}
                error={getCombinedError('ciudad')}
                touched={isFieldTouched('ciudad')}
                required
              />
            </motion.div>

            <motion.div>
              <FormField
                label="Estado"
                name="estado"
                type="select"
                placeholder="Selecciona el estado"
                options={states}
                value={values.estado}
                onChange={handleChange}
                onBlur={handleBlur}
                error={getCombinedError('estado')}
                touched={isFieldTouched('estado')}
                required
              />
            </motion.div>

            <motion.div className="lg:col-span-3">
              <FormField
                label="Descripción"
                name="descripcion"
                type="textarea"
                placeholder="Descripción detallada del proveedor... "
                value={values.descripcion}
                onChange={handleChange}
                onBlur={handleBlur}
                error={getCombinedError('descripcion')}
                touched={isFieldTouched('descripcion')}
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
              disabled={Object.values(checkingFields).some(checking => checking) || Object.keys(availabilityErrors).length > 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow transition-colors ${
                Object.values(checkingFields).some(checking => checking) || Object.keys(availabilityErrors).length > 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-blue hover:bg-primary-purple'
              } text-white`}
            >
              {Object.values(checkingFields).some(checking => checking) ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Validando...
                </>
              ) : Object.keys(availabilityErrors).length > 0 ? (
                "Corrige los errores"
              ) : (
                isEditing ? "Actualizar Proveedor" : "Crear Proveedor"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProviderModal;