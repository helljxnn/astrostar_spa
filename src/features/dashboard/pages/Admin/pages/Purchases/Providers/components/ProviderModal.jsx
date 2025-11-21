import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormField } from "../../../../../../../../shared/components/FormField";
import { DocumentField } from "../../../../../../../../shared/components/DocumentField";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../../../../../../../../shared/utils/alerts";
import {
  useFormProviderValidation,
  providerValidationRules,
} from "../hooks/useFormProviderValidation";
import providersService from "../services/ProvidersService";

// Datos que deberían venir de la API pero se mantienen como constantes por ser estáticos
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

  const initialValues = {
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
  };

  // Obtener tipos de documento filtrados desde la API del módulo de empleados
  const [employeeDocumentTypes, setEmployeeDocumentTypes] = React.useState([]);

  // Usar los tipos de documento del módulo de empleados para personas naturales
  const filteredDocumentTypes = React.useMemo(() => {
    if (employeeDocumentTypes.length > 0) {
      return employeeDocumentTypes;
    }
    return [];
  }, [employeeDocumentTypes]);

  const {
    values,
    errors,
    touched,
    handleChange: originalHandleChange,
    handleBlur,
    validateAllFields,
    resetForm,
    resetValidation,
    setValues,
    setTouched,
    touchAllFields,
    setErrors,
    updateOriginalValues,
  } = useFormProviderValidation(
    initialValues,
    providerValidationRules,
    isEditing,
    filteredDocumentTypes
  );

  // HandleChange personalizado
  const handleChange = (name, value) => {
    if (name === "tipoEntidad") {
      console.log("Cambiando tipo entidad:", {
        from: values.tipoEntidad,
        to: value,
        isEditing,
        originalType: providerToEdit?.tipoEntidad,
        originalNit: providerToEdit?.nit,
        originalTipoDoc: providerToEdit?.tipoDocumento,
      });

      // Si estamos editando y volvemos al tipo original, restaurar valores originales
      if (isEditing && value === providerToEdit?.tipoEntidad) {
        console.log("Restaurando valores originales...");
        setValues((prev) => ({
          ...prev,
          tipoEntidad: value,
          nit: providerToEdit?.nit || "",
          tipoDocumento:
            value === "natural" ? providerToEdit?.tipoDocumento || "" : "",
        }));
      } else {
        originalHandleChange(name, value);
      }
    } else {
      originalHandleChange(name, value);
    }
  };

  // HandleChange personalizado para NIT que solo permite números
  const handleNitChange = (name, value) => {
    // Solo permitir números para el campo NIT
    const numericValue = value.replace(/[^0-9]/g, "");
    handleChange(name, numericValue);
  };

  // Validación en tiempo real similar a empleados
  const handleCustomBlur = async (name) => {
    handleBlur(name);

    // Validar unicidad para campos específicos solo si pasan la validación básica
    if (
      (name === "nit" || name === "razonSocial" || name === "correo") &&
      values[name]
    ) {
      // Primero validar que el campo cumpla con las reglas básicas
      const validationRule = providerValidationRules[name];
      let validationError = "";
      if (validationRule) {
        for (const rule of validationRule) {
          validationError = rule(values[name], values);
          if (validationError) break;
        }
      }

      // Solo hacer la petición al servidor si no hay errores de validación básica
      if (!validationError) {
        const excludeId = isEditing ? providerToEdit.id : null;

        try {
          let response;
          if (name === "nit") {
            response = await providersService.checkNitAvailability(
              values[name],
              excludeId,
              values.tipoEntidad
            );
          } else if (
            name === "razonSocial" &&
            values.tipoEntidad === "juridica"
          ) {
            response = await providersService.checkBusinessNameAvailability(
              values[name],
              excludeId,
              values.tipoEntidad
            );
          } else if (name === "correo") {
            response = await providersService.checkEmailAvailability(
              values[name],
              excludeId
            );
          }

          // Manejar respuesta del servidor
          if (response && !response.available) {
            const errorMessage =
              response.message ||
              `Este ${
                name === "nit"
                  ? "NIT/documento"
                  : name === "razonSocial"
                  ? "nombre/razón social"
                  : "correo"
              } ya está registrado`;
            // Establecer el error de unicidad
            setErrors((prev) => ({ ...prev, [name]: errorMessage }));
          }
        } catch (error) {
          console.error(`Error checking ${name} availability:`, error);
          // Continuar sin bloquear si hay error en la validación
        }
      }
    }
  };

  const getCombinedError = (fieldName) => {
    if (!touched[fieldName]) {
      return null;
    }
    return errors[fieldName];
  };

  const isFieldTouched = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  // Estado para mantener el tipoDocumento original durante la carga
  const [originalTipoDocumento, setOriginalTipoDocumento] = React.useState("");

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

      // Guardar el tipoDocumento original con más información de debug
      console.log("Datos del proveedor a editar:", {
        tipoEntidad: providerToEdit.tipoEntidad,
        tipoDocumento: providerToEdit.tipoDocumento,
        documentTypeId: providerToEdit.documentTypeId,
        fullProvider: providerToEdit,
      });

      // Guardar tanto tipoDocumento como documentTypeId por si acaso
      const originalDocType =
        providerToEdit.tipoDocumento || providerToEdit.documentTypeId || "";
      setOriginalTipoDocumento(originalDocType);

      // Si es persona natural y tiene tipoDocumento, asegurarse de que se mantenga
      if (providerToEdit.tipoEntidad === "natural" && originalDocType) {
        editData.tipoDocumento = originalDocType;
      }

      setValues(editData);

      // Actualizar valores originales para restauración
      updateOriginalValues(editData);
      // Limpiar validaciones al cargar datos de edición
      setTimeout(() => resetValidation(), 0);
    }
  }, [isOpen, isEditing, providerToEdit, setValues, setTouched]);

  const handleSubmit = async () => {
    touchAllFields();

    const hasValidationErrors = !validateAllFields();

    if (hasValidationErrors) {
      showErrorAlert(
        "Campos incompletos",
        "Por favor completa todos los campos correctamente antes de continuar."
      );
      return;
    }

    // Validar unicidad de NIT/documento antes del envío
    if (values.nit && !errors.nit) {
      try {
        const excludeId = isEditing ? providerToEdit.id : null;
        const nitCheck = await providersService.checkNitAvailability(
          values.nit,
          excludeId,
          values.tipoEntidad
        );

        if (!nitCheck.available) {
          showErrorAlert("Error", nitCheck.message);
          return;
        }
      } catch (error) {
        console.error("Error checking NIT availability:", error);
      }
    }

    // Validar unicidad de razón social/nombre antes del envío (solo para jurídicas)
    if (
      values.razonSocial &&
      !errors.razonSocial &&
      values.tipoEntidad === "juridica"
    ) {
      try {
        const excludeId = isEditing ? providerToEdit.id : null;
        const businessNameCheck =
          await providersService.checkBusinessNameAvailability(
            values.razonSocial,
            excludeId,
            values.tipoEntidad
          );

        if (!businessNameCheck.available) {
          showErrorAlert("Error", businessNameCheck.message);
          return;
        }
      } catch (error) {
        console.error("Error checking business name availability:", error);
      }
    }

    // Validar unicidad de email antes del envío
    if (values.correo && !errors.correo) {
      try {
        const excludeId = isEditing ? providerToEdit.id : null;
        const emailCheck = await providersService.checkEmailAvailability(
          values.correo,
          excludeId
        );

        if (!emailCheck.available) {
          showErrorAlert("Error", emailCheck.message);
          return;
        }
      } catch (error) {
        console.error("Error checking email availability:", error);
      }
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
      };

      // Solo establecer "Activo" por defecto si estamos creando Y no hay estado definido
      if (!isEditing && !providerData.estado) {
        providerData.estado = "Activo";
      }

      if (values.tipoEntidad === "juridica") {
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
        onClose();
      } else {
        throw new Error(
          result?.message ||
            `Error al ${isEditing ? "actualizar" : "crear"} el proveedor`
        );
      }
    } catch (error) {
      console.error(
        `Error al ${isEditing ? "actualizar" : "crear"} proveedor:`,
        error
      );
      showErrorAlert(
        "Error",
        error.message ||
          `Ocurrió un error al ${
            isEditing ? "actualizar" : "crear"
          } el proveedor`
      );
    }
  };

  const handleClose = () => {
    resetForm();
    setTouched({});

    // Limpiar tipoDocumento original y tipos de documento
    setOriginalTipoDocumento("");
    setEmployeeDocumentTypes([]);
    onClose();
  };

  const getDynamicLabel = (field) => {
    switch (field) {
      case "razonSocial":
        return values.tipoEntidad === "juridica"
          ? "Razón Social"
          : "Nombre Completo";
      case "razonSocialPlaceholder":
        return values.tipoEntidad === "juridica"
          ? "Nombre de la empresa"
          : "Nombre completo";
      default:
        return "";
    }
  };

  React.useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const response = await providersService.getDocumentTypes();
        if (response.success && response.data) {
          console.log("Tipos de documento cargados:", response.data);
          setEmployeeDocumentTypes(response.data);
        }
      } catch (error) {
        console.error("Error fetching document types:", error);
      }
    };

    // Cargar tipos de documento si es natural O si estamos editando un proveedor natural
    // Cargar inmediatamente cuando se abre el modal si es necesario
    if (
      isOpen &&
      (values.tipoEntidad === "natural" ||
        (isEditing && providerToEdit?.tipoEntidad === "natural"))
    ) {
      fetchDocumentTypes();
    }
  }, [isOpen, values.tipoEntidad, isEditing, providerToEdit?.tipoEntidad]);

  // Efecto para restaurar tipoDocumento cuando se cargan los tipos de documento en edición
  React.useEffect(() => {
    if (
      isEditing &&
      originalTipoDocumento &&
      employeeDocumentTypes.length > 0 &&
      values.tipoEntidad === "natural"
    ) {
      console.log("Intentando restaurar tipoDocumento:", {
        originalTipoDocumento,
        employeeDocumentTypes: employeeDocumentTypes.map((t) => ({
          id: t.id,
          name: t.name,
          value: t.value,
          label: t.label,
        })),
        currentTipoDoc: values.tipoDocumento,
      });

      // Buscar coincidencia por múltiples criterios
      const matchingType = employeeDocumentTypes.find((type) => {
        const typeId = type.id?.toString();
        const typeValue = type.value?.toString();
        const typeName = type.name;
        const typeLabel = type.label;
        const originalStr = originalTipoDocumento.toString();

        return (
          typeId === originalStr ||
          typeValue === originalStr ||
          typeName === originalStr ||
          typeLabel === originalStr
        );
      });

      if (matchingType) {
        // Priorizar value, luego id
        const valueToSet = matchingType.value || matchingType.id.toString();
        console.log(
          "Tipo encontrado, estableciendo:",
          valueToSet,
          "para tipo:",
          matchingType
        );

        // Solo actualizar si el valor actual es diferente para evitar loops
        if (values.tipoDocumento !== valueToSet) {
          setValues((prev) => ({ ...prev, tipoDocumento: valueToSet }));
        }
      } else {
        console.log(
          "No se encontró tipo matching para:",
          originalTipoDocumento
        );
        console.log("Tipos disponibles:", employeeDocumentTypes);

        // Intentar buscar por coincidencia parcial o similar
        const partialMatch = employeeDocumentTypes.find((type) => {
          const originalLower = originalTipoDocumento.toString().toLowerCase();
          return (
            type.name?.toLowerCase().includes(originalLower) ||
            type.label?.toLowerCase().includes(originalLower) ||
            originalLower.includes(type.name?.toLowerCase()) ||
            originalLower.includes(type.label?.toLowerCase())
          );
        });

        if (partialMatch) {
          const valueToSet = partialMatch.value || partialMatch.id.toString();
          console.log(
            "Coincidencia parcial encontrada:",
            valueToSet,
            "para tipo:",
            partialMatch
          );
          setValues((prev) => ({ ...prev, tipoDocumento: valueToSet }));
        } else if (!values.tipoDocumento && employeeDocumentTypes.length > 0) {
          console.log("Usando primer tipo disponible como fallback");
          const fallbackValue =
            employeeDocumentTypes[0].value ||
            employeeDocumentTypes[0].id.toString();
          setValues((prev) => ({ ...prev, tipoDocumento: fallbackValue }));
        }
      }
    }
  }, [
    employeeDocumentTypes,
    isEditing,
    originalTipoDocumento,
    values.tipoEntidad,
  ]);

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
                    onChange={(e) =>
                      handleChange("tipoEntidad", e.target.value)
                    }
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
                      <div
                        className={`p-1.5 rounded-lg mr-2 ${
                          values.tipoEntidad === type.value
                            ? "bg-primary-blue/20 text-primary-blue"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {type.value === "juridica" ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        )}
                      </div>
                      <div>
                        <span
                          className={`text-sm font-semibold block ${
                            values.tipoEntidad === type.value
                              ? "text-primary-blue"
                              : "text-gray-700"
                          }`}
                        >
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
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.div>
                  )}
                </motion.label>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <motion.div>
              <FormField
                label={getDynamicLabel("razonSocial")}
                name="razonSocial"
                type="text"
                placeholder={getDynamicLabel("razonSocialPlaceholder")}
                value={values.razonSocial}
                onChange={handleChange}
                onBlur={handleCustomBlur}
                error={getCombinedError("razonSocial")}
                touched={isFieldTouched("razonSocial")}
                required
              />
            </motion.div>

            <AnimatePresence mode="wait">
              {values.tipoEntidad === "natural" && (
                <motion.div
                  key="tipo-documento-natural"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  {employeeDocumentTypes.length === 0 ? (
                    <div className="flex items-center gap-2 text-gray-500 text-sm p-3 bg-gray-50 rounded-lg">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-blue"></div>
                      Cargando tipos de documento...
                    </div>
                  ) : (
                    <FormField
                      label="Tipo de documento"
                      name="tipoDocumento"
                      type="select"
                      placeholder="Seleccione el tipo de documento"
                      options={filteredDocumentTypes.map((doc) => ({
                        value: doc.value || doc.id.toString(),
                        label: doc.label || doc.name,
                      }))}
                      value={values.tipoDocumento || ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={getCombinedError("tipoDocumento")}
                      touched={isFieldTouched("tipoDocumento")}
                      required={values.tipoEntidad === "natural"}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div>
              {values.tipoEntidad === "natural" ? (
                <DocumentField
                  documentType={
                    filteredDocumentTypes.find(
                      (dt) =>
                        dt.id.toString() === values.tipoDocumento ||
                        dt.value === values.tipoDocumento
                    )?.name ||
                    filteredDocumentTypes.find(
                      (dt) =>
                        dt.id.toString() === values.tipoDocumento ||
                        dt.value === values.tipoDocumento
                    )?.label
                  }
                  value={values.nit}
                  onChange={handleChange}
                  onBlur={handleCustomBlur}
                  error={getCombinedError("nit")}
                  touched={isFieldTouched("nit")}
                  required
                  label={
                    filteredDocumentTypes.find(
                      (dt) =>
                        dt.id.toString() === values.tipoDocumento ||
                        dt.value === values.tipoDocumento
                    )?.name === "Número de Identificación Tributaria" ||
                    filteredDocumentTypes.find(
                      (dt) =>
                        dt.id.toString() === values.tipoDocumento ||
                        dt.value === values.tipoDocumento
                    )?.label === "Número de Identificación Tributaria"
                      ? "NIT"
                      : "Documento de Identidad"
                  }
                  name="nit"
                />
              ) : (
                <FormField
                  label="NIT"
                  name="nit"
                  type="text"
                  placeholder="10 dígitos (Solo números)"
                  value={values.nit}
                  onChange={handleNitChange}
                  onBlur={handleCustomBlur}
                  error={getCombinedError("nit")}
                  touched={isFieldTouched("nit")}
                  required
                  maxLength={10}
                />
              )}
            </motion.div>

            <motion.div>
              <FormField
                label="Contacto Principal"
                name="contactoPrincipal"
                type="text"
                placeholder="Nombre del contacto"
                value={values.contactoPrincipal}
                onChange={handleChange}
                onBlur={handleBlur}
                error={getCombinedError("contactoPrincipal")}
                touched={isFieldTouched("contactoPrincipal")}
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
                onBlur={handleCustomBlur}
                error={getCombinedError("correo")}
                touched={isFieldTouched("correo")}
              />
            </motion.div>

            <motion.div>
              <FormField
                label="Número Telefónico"
                name="telefono"
                type="text"
                placeholder="300 123 4567"
                value={values.telefono}
                onChange={handleChange}
                onBlur={handleBlur}
                error={getCombinedError("telefono")}
                touched={isFieldTouched("telefono")}
                maxLength={14}
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
                error={getCombinedError("direccion")}
                touched={isFieldTouched("direccion")}
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
                error={getCombinedError("ciudad")}
                touched={isFieldTouched("ciudad")}
                required
              />
            </motion.div>

            {isEditing && (
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
                  error={getCombinedError("estado")}
                  touched={isFieldTouched("estado")}
                  required
                />
              </motion.div>
            )}

            <motion.div className="lg:col-span-3">
              <FormField
                label="Descripción"
                name="descripcion"
                type="textarea"
                placeholder="Descripción detallada del proveedor... "
                value={values.descripcion}
                onChange={handleChange}
                onBlur={handleBlur}
                error={getCombinedError("descripcion")}
                touched={isFieldTouched("descripcion")}
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
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue hover:bg-primary-purple text-white rounded-lg shadow transition-colors"
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
