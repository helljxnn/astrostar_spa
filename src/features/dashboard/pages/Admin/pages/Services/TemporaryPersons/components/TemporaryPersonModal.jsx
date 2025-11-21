import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FormField } from "../../../../../../../../shared/components/FormField";
import { DocumentField } from "../../../../../../../../shared/components/DocumentField";
import {
  showSuccessAlert,
  showConfirmAlert,
  showErrorAlert,
} from "../../../../../../../../shared/utils/alerts";
import temporaryPersonsService from "../services/temporaryPersonsService";


// Hook de validación personalizado para personas temporales
const useFormTemporaryPersonValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validar el campo específico
    const rule = validationRules[name];
    if (rule) {
      const error = rule(values[name], values);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validateAllFields = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const rule = validationRules[fieldName];
      const error = rule(values[fieldName], values);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    return isValid;
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAllFields,
    setValues,
    setErrors,
    setTouched
  };
};

// Reglas de validación mejoradas
const temporaryPersonValidationRules = {
  firstName: (value) => {
    if (!value || !value.trim()) return "El primer nombre es requerido";
    if (value.length < 2) return "El primer nombre debe tener al menos 2 caracteres";
    if (value.length > 100) return "El primer nombre no puede exceder 100 caracteres";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return "El primer nombre solo puede contener letras y espacios";
    return "";
  },
  middleName: (value) => {
    if (value && value.trim()) {
      if (value.length < 2) return "El segundo nombre debe tener al menos 2 caracteres";
      if (value.length > 100) return "El segundo nombre no puede exceder 100 caracteres";
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return "El segundo nombre solo puede contener letras y espacios";
    }
    return "";
  },
  lastName: (value) => {
    if (!value || !value.trim()) return "El primer apellido es requerido";
    if (value.length < 2) return "El primer apellido debe tener al menos 2 caracteres";
    if (value.length > 100) return "El primer apellido no puede exceder 100 caracteres";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return "El primer apellido solo puede contener letras y espacios";
    return "";
  },
  secondLastName: (value) => {
    if (value && value.trim()) {
      if (value.length < 2) return "El segundo apellido debe tener al menos 2 caracteres";
      if (value.length > 100) return "El segundo apellido no puede exceder 100 caracteres";
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return "El segundo apellido solo puede contener letras y espacios";
    }
    return "";
  },
  personType: (value) => {
    if (!value) return "El tipo de persona es requerido";
    const validTypes = ['Deportista', 'Entrenador', 'Participante'];
    if (!validTypes.includes(value)) return "Tipo de persona no válido";
    return "";
  },
  email: (value) => {
    if (!value || !value.trim()) return "El correo electrónico es requerido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "El formato del email no es válido";
    }
    if (value.length > 150) {
      return "El email no puede exceder 150 caracteres";
    }
    return "";
  },
  phone: (value) => {
    if (!value || !value.trim()) return "El número telefónico es requerido";
    const cleanPhone = value.replace(/[\s\-\+\(\)]/g, '');
    if (!/^[0-9]+$/.test(cleanPhone)) {
      return "El teléfono solo puede contener números, espacios, guiones, paréntesis y el signo +";
    }
    if (cleanPhone.length < 7 || cleanPhone.length > 14) {
      return "El teléfono debe tener entre 7 y 14 dígitos";
    }
    return "";
  },
  identification: (value) => {
    if (!value || !value.trim()) return "El número de documento es requerido";
    // La validación de longitud y formato se maneja automáticamente en DocumentField según el tipo de documento
    return "";
  },
  documentTypeId: (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) return "El tipo de documento es requerido";
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 1) {
      return "Tipo de documento no válido";
    }
    return "";
  },
  address: (value) => {
    if (!value || !value.trim()) return "La dirección es requerida";
    if (value.length > 200) {
      return "La dirección no puede exceder 200 caracteres";
    }
    return "";
  },
  birthDate: (value) => {
    if (!value || !value.trim()) return "La fecha de nacimiento es requerida";
    const birthDate = new Date(value);
    if (isNaN(birthDate.getTime())) {
      return "Fecha de nacimiento no válida";
    }
    
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
    
    if (birthDate < minDate) {
      return "La fecha de nacimiento no puede ser anterior a 120 años";
    }
    if (birthDate > maxDate) {
      return "La persona debe tener al menos 5 años de edad";
    }
    return "";
  },
  team: (value, allValues) => {
    // Los campos team y category son opcionales para todos los tipos de persona
    if (value && value.length > 100) {
      return "El nombre del equipo no puede exceder 100 caracteres";
    }
    return "";
  },
  category: (value, allValues) => {
    // Los campos team y category son opcionales para todos los tipos de persona
    if (value && value.length > 100) {
      return "La categoría no puede exceder 100 caracteres";
    }
    return "";
  },
  status: (value, formData, mode) => {
    // El estado solo es requerido en modo editar
    if (mode === 'edit') {
      if (!value) return "El estado es requerido";
      const validStatuses = ['Active', 'Inactive'];
      if (!validStatuses.includes(value)) return "Estado no válido";
    }
    return "";
  }
};

const TemporaryPersonModal = ({
  isOpen,
  onClose,
  onSave,
  person,
  mode = "create",
  referenceData = { documentTypes: [] },
}) => {
  const {
    values: formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAllFields,
    setValues: setFormData,
    setErrors,
    setTouched,
  } = useFormTemporaryPersonValidation(
    {
      firstName: "",
      middleName: "",
      lastName: "",
      secondLastName: "",
      identification: "",
      email: "",
      phone: "",
      birthDate: "",
      address: "",
      team: "",
      category: "",
      documentTypeId: "",
      personType: "Participante",
      status: "Active",
      age: ""
    },
    temporaryPersonValidationRules
  );

  // Función para calcular la edad
  const calculateAge = (birthDate) => {
    if (!birthDate) return "";

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age >= 0 ? age.toString() : "";
  };

  // Función personalizada para manejar cambios
  const handleCustomChange = (name, value) => {
    if (name === "birthDate") {
      const age = calculateAge(value);
      // Usar handleChange para mantener la consistencia del estado
      handleChange(name, value);
      handleChange("age", age);
    } else if (name === "personType") {
      // Al cambiar el tipo de persona, limpiar equipo y categoría si no aplican
      handleChange(name, value);
      if (value === 'Participante') {
        handleChange("team", '');
        handleChange("category", '');
      }
    } else {
      handleChange(name, value);
    }
  };

  // Función personalizada para manejar blur con validación de unicidad
  const handleCustomBlur = async (name) => {
    handleBlur(name);
    
    // Validar unicidad para campos específicos solo si pasan la validación básica
    if ((name === 'identification' || name === 'email') && formData[name]) {
      // Primero validar que el campo cumpla con las reglas básicas
      const validationRule = temporaryPersonValidationRules[name];
      const validationError = validationRule ? validationRule(formData[name], formData) : "";
      
      // Solo hacer la petición al servidor si no hay errores de validación básica
      if (!validationError) {
        const currentId = person && mode === 'edit' ? person.id : null;
        
        try {
          let response;
          if (name === 'identification') {
            response = await temporaryPersonsService.checkIdentificationAvailability(formData[name], currentId);
          } else if (name === 'email') {
            response = await temporaryPersonsService.checkEmailAvailability(formData[name], currentId);
          }

          // Manejar diferentes estructuras de respuesta
          const isAvailable = response?.data?.available ?? response?.available ?? true;
          if (response && !isAvailable) {
            const errorMessage = response?.data?.message || response?.message || `Este ${name === 'identification' ? 'número de documento' : 'email'} ya está en uso`;
            // Establecer el error de unicidad
            setErrors(prev => ({ ...prev, [name]: errorMessage }));
          }
        } catch (error) {
          // Continuar sin bloquear si hay error en la validación
        }
      }
    }
  };

  // Cargar datos si es edición o limpiar si es creación
  useEffect(() => {
    if (person && mode === "edit") {
      const birthDate = person.birthDate ? person.birthDate.split("T")[0] : "";
      setFormData({
        firstName: person.firstName || "",
        middleName: person.middleName || "",
        lastName: person.lastName || "",
        secondLastName: person.secondLastName || "",
        identification: person.identification || "",
        email: person.email || "",
        phone: person.phone || "",
        birthDate: birthDate,
        address: person.address || "",
        team: person.team || "",
        category: person.category || "",
        documentTypeId: person.documentTypeId?.toString() || "",
        personType: person.personType || "Participante",
        status: person.status || "Active",
        age: calculateAge(birthDate)
      });
      // Limpiar errores al cargar datos de edición
      setErrors({});
      setTouched({});
    } else if (isOpen) {
      // Solo limpiar cuando se abre el modal en modo crear
      clearForm();
    }
  }, [person, setFormData, mode, isOpen]);

  const handleSubmit = async () => {
    try {
      // Validar todos los campos
      const isValid = validateAllFields();
      
      if (!isValid) {
        showErrorAlert(
          "Campos incompletos",
          "Por favor, corrija los errores en el formulario antes de continuar."
        );
        return;
      }

      // Validaciones adicionales de lógica de negocio
      const businessValidationErrors = validateBusinessLogic();
      if (businessValidationErrors.length > 0) {
        showErrorAlert(
          "Errores de validación",
          businessValidationErrors.join('. ')
        );
        return;
      }

      // Validar unicidad de campos críticos antes del envío (solo si pasan validación básica)
      if (formData.identification && !errors.identification) {
        const currentId = person && mode === 'edit' ? person.id : null;
        try {
          const identificationCheck = await temporaryPersonsService.checkIdentificationAvailability(
            formData.identification, 
            currentId
          );
          // Manejar diferentes estructuras de respuesta
          const isAvailable = identificationCheck?.data?.available ?? identificationCheck?.available ?? true;
          if (!isAvailable) {
            showErrorAlert(
              "Identificación duplicada",
              "Este número de documento ya está en uso por otra persona temporal."
            );
            return;
          }
        } catch (error) {
          // Continuar sin bloquear si hay error en la validación
        }
      }

      if (formData.email && !errors.email) {
        const currentId = person && mode === 'edit' ? person.id : null;
        try {
          const emailCheck = await temporaryPersonsService.checkEmailAvailability(
            formData.email, 
            currentId
          );
          // Manejar diferentes estructuras de respuesta
          const isAvailable = emailCheck?.data?.available ?? emailCheck?.available ?? true;
          if (!isAvailable) {
            showErrorAlert(
              "Email duplicado",
              "Este email ya está en uso por otra persona temporal."
            );
            return;
          }
        } catch (error) {
          // Continuar sin bloquear si hay error en la validación
        }
      }

      // Confirmación solo al editar
      if (mode === "edit") {
        const result = await showConfirmAlert(
          "¿Estás seguro de actualizar esta persona temporal?",
          "Los cambios se guardarán y no se podrán deshacer fácilmente."
        );
        if (!result.isConfirmed) return;
      }

      // Llamar onSave y esperar el resultado
      const success = await onSave(formData);

      // Solo cerrar el modal si la operación fue exitosa
      if (success) {
        clearForm();
        onClose();
      }
    } catch (error) {
      showErrorAlert(
        "Error al guardar",
        "No se pudo guardar la persona temporal. Intenta de nuevo."
      );
    }
  };

  // Función para limpiar completamente el formulario
  const clearForm = () => {
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      secondLastName: "",
      identification: "",
      email: "",
      phone: "",
      birthDate: "",
      address: "",
      team: "",
      category: "",
      documentTypeId: "",
      personType: "Participante",
      status: "Active",
      age: ""
    });
    // También limpiar errores y estado touched
    setErrors({});
    setTouched({});
  };

  // Función para manejar el cierre del modal
  const handleClose = () => {
    clearForm();
    onClose();
  };

  // Validaciones de lógica de negocio
  const validateBusinessLogic = () => {
    const errors = [];
    // Simplificado - sin validaciones adicionales por ahora
    return errors;
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal-container bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] relative flex flex-col overflow-hidden"
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
            {mode === "edit" ? "Editar Persona Temporal" : "Crear Persona Temporal"}
          </h2>
        </div>

        {/* Body */}
        <div className="modal-body flex-1 overflow-y-auto p-3 relative">
          <div className="form-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 relative">
            
            {/* Tipo Documento */}
            <FormField
              label="Tipo de Documento"
              name="documentTypeId"
              type="select"
              placeholder="Seleccionar tipo de documento"
              required={true}
              options={referenceData.documentTypes.map((type) => ({
                value: type.id,
                label: type.name,
              }))}
              value={formData.documentTypeId}
              error={errors.documentTypeId}
              touched={touched.documentTypeId}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.1}
            />

            {/* Identificación con validación por tipo de documento */}
            <DocumentField
              documentType={
                referenceData.documentTypes.find(
                  (dt) => dt.id === parseInt(formData.documentTypeId)
                )?.name
              }
              value={formData.identification}
              onChange={handleChange}
              onBlur={handleCustomBlur}
              error={errors.identification}
              touched={touched.identification}
              required={true}
              label="Número de Documento"
              name="identification"
            />

            {/* Primer Nombre */}
            <FormField
              label="Primer Nombre"
              name="firstName"
              type="text"
              placeholder="Primer nombre"
              required={true}
              value={formData.firstName}
              error={errors.firstName}
              touched={touched.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.3}
            />

            {/* Segundo Nombre */}
            <FormField
              label="Segundo Nombre"
              name="middleName"
              type="text"
              placeholder="Segundo nombre (opcional)"
              required={false}
              value={formData.middleName}
              error={errors.middleName}
              touched={touched.middleName}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.32}
            />

            {/* Primer Apellido */}
            <FormField
              label="Primer Apellido"
              name="lastName"
              type="text"
              placeholder="Primer apellido"
              required={true}
              value={formData.lastName}
              error={errors.lastName}
              touched={touched.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.35}
            />

            {/* Segundo Apellido */}
            <FormField
              label="Segundo Apellido"
              name="secondLastName"
              type="text"
              placeholder="Segundo apellido (opcional)"
              required={false}
              value={formData.secondLastName}
              error={errors.secondLastName}
              touched={touched.secondLastName}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.37}
            />

            {/* Correo */}
            <FormField
              label="Correo Electrónico"
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              required={true}
              value={formData.email}
              error={errors.email}
              touched={touched.email}
              onChange={handleChange}
              onBlur={handleCustomBlur}
              delay={0.4}
            />

            {/* Teléfono */}
            <FormField
              label="Número Telefónico"
              name="phone"
              type="text"
              placeholder="300 123 4567"
              required={true}
              value={formData.phone}
              error={errors.phone}
              touched={touched.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={14}
              delay={0.42}
            />

            {/* Dirección */}
            <FormField
              label="Dirección"
              name="address"
              type="text"
              placeholder="Dirección de residencia"
              required={true}
              value={formData.address}
              error={errors.address}
              touched={touched.address}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.45}
            />

            {/* Fecha de Nacimiento */}
            <FormField
              label="Fecha de Nacimiento"
              name="birthDate"
              type="date"
              placeholder="Fecha de nacimiento"
              required={true}
              value={formData.birthDate}
              error={errors.birthDate}
              touched={touched.birthDate}
              onChange={handleCustomChange}
              onBlur={handleBlur}
              delay={0.47}
            />

            {/* Edad (calculada automáticamente) */}
            <FormField
              label="Edad"
              name="age"
              type="text"
              placeholder="Se calcula automáticamente"
              required={false}
              disabled={true}
              value={formData.age ? `${formData.age} años` : ""}
              delay={0.5}
            />

            {/* Equipo - Solo para Deportista y Entrenador */}
            {(formData.personType === 'Deportista' || formData.personType === 'Entrenador') && (
              <FormField
                label="Equipo"
                name="team"
                type="text"
                placeholder="(no asignado)"
                required={false}
                disabled={true}
                value={formData.team || '(no asignado)'}
                error={errors.team}
                touched={touched.team}
                delay={0.52}
              />
            )}

            {/* Categoría - Solo para Deportista y Entrenador */}
            {(formData.personType === 'Deportista' || formData.personType === 'Entrenador') && (
              <FormField
                label="Categoría"
                name="category"
                type="text"
                placeholder="(no asignado)"
                required={false}
                disabled={true}
                value={formData.category || '(no asignado)'}
                error={errors.category}
                touched={touched.category}
                delay={0.55}
              />
            )}

            {/* Tipo de Persona */}
            <FormField
              label="Tipo de Persona"
              name="personType"
              type="select"
              placeholder="Seleccionar tipo"
              required={true}
              options={[
                { value: "Participante", label: "Participante" },
                { value: "Deportista", label: "Deportista" },
                { value: "Entrenador", label: "Entrenador" },
              ]}
              value={formData.personType}
              error={errors.personType}
              touched={touched.personType}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.57}
            />

            {/* Estado - Solo visible en modo editar */}
            {mode === "edit" && (
              <FormField
                label="Estado"
                name="status"
                type="select"
                placeholder="Seleccionar estado"
                required={true}
                options={[
                  { value: "Active", label: "Activo" },
                  { value: "Inactive", label: "Inactivo" },
                ]}
                value={formData.status}
                error={errors.status}
                touched={touched.status}
                onChange={handleChange}
                onBlur={handleBlur}
                delay={0.6}
              />
            )}

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
              className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-all duration-200 font-medium shadow-lg"
            >
              {mode === "edit" ? "Guardar Cambios" : "Crear Persona Temporal"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TemporaryPersonModal;