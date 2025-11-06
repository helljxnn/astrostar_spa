import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FormField } from "../../../../../../../../shared/components/FormField";
import {
  showSuccessAlert,
  showConfirmAlert,
  showErrorAlert,
} from "../../../../../../../../shared/utils/alerts";

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
    setValues
  };
};

// Reglas de validación
const temporaryPersonValidationRules = {
  firstName: (value) => {
    if (!value || !value.trim()) return "El nombre es requerido";
    if (value.length < 2) return "El nombre debe tener al menos 2 caracteres";
    return "";
  },
  lastName: (value) => {
    if (!value || !value.trim()) return "El apellido es requerido";
    if (value.length < 2) return "El apellido debe tener al menos 2 caracteres";
    return "";
  },
  personType: (value) => {
    if (!value) return "El tipo de persona es requerido";
    return "";
  },
  email: (value) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "El formato del email no es válido";
    }
    return "";
  },
  phone: (value) => {
    if (value && !/^\d{10}$/.test(value.replace(/\s/g, ''))) {
      return "El teléfono debe tener 10 dígitos";
    }
    return "";
  },
  identification: (value) => {
    if (value && value.length < 6) {
      return "La identificación debe tener al menos 6 caracteres";
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
  } = useFormTemporaryPersonValidation(
    {
      firstName: "",
      lastName: "",
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
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        age: age,
      }));
    } else {
      handleChange(name, value);
    }
  };

  // Cargar datos si es edición o limpiar si es creación
  useEffect(() => {
    if (person && mode === "edit") {
      const birthDate = person.birthDate ? person.birthDate.split("T")[0] : "";
      setFormData({
        firstName: person.firstName || "",
        lastName: person.lastName || "",
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
    } else {
      setFormData({
        firstName: "",
        lastName: "",
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
    }
  }, [person, setFormData, mode, isOpen]);

  const handleSubmit = async () => {
    try {
      const isValid = validateAllFields();
      if (!isValid) {
        showErrorAlert(
          "Campos incompletos",
          "Por favor, complete todos los campos obligatorios antes de continuar."
        );
        return;
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
        // Limpiar formulario
        setFormData({
          firstName: "",
          lastName: "",
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

        onClose();
      }
    } catch (error) {
      showErrorAlert(
        "Error al guardar",
        "No se pudo guardar la persona temporal. Intenta de nuevo."
      );
    }
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
            onClick={onClose}
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
              required={false}
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

            {/* Identificación */}
            <FormField
              label="Número de Documento"
              name="identification"
              type="text"
              placeholder="Número de documento"
              required={false}
              value={formData.identification}
              error={errors.identification}
              touched={touched.identification}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.2}
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

            {/* Apellido */}
            <FormField
              label="Apellido"
              name="lastName"
              type="text"
              placeholder="Apellido"
              required={true}
              value={formData.lastName}
              error={errors.lastName}
              touched={touched.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.35}
            />

            {/* Correo */}
            <FormField
              label="Correo Electrónico"
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              required={false}
              value={formData.email}
              error={errors.email}
              touched={touched.email}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.4}
            />

            {/* Teléfono */}
            <FormField
              label="Número Telefónico"
              name="phone"
              type="text"
              placeholder="300 123 4567"
              required={false}
              value={formData.phone}
              error={errors.phone}
              touched={touched.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.45}
            />

            {/* Dirección */}
            <FormField
              label="Dirección"
              name="address"
              type="text"
              placeholder="Dirección de residencia"
              required={false}
              value={formData.address}
              error={errors.address}
              touched={touched.address}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.5}
            />

            {/* Fecha de Nacimiento */}
            <FormField
              label="Fecha de Nacimiento"
              name="birthDate"
              type="date"
              placeholder="Fecha de nacimiento"
              required={false}
              value={formData.birthDate}
              error={errors.birthDate}
              touched={touched.birthDate}
              onChange={handleCustomChange}
              onBlur={handleBlur}
              delay={0.55}
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
              delay={0.6}
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
                delay={0.65}
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
                delay={0.67}
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
              delay={0.7}
            />

            {/* Estado */}
            <FormField
              label="Estado"
              name="status"
              type="select"
              placeholder="Seleccionar estado"
              required={false}
              options={[
                { value: "Active", label: "Activo" },
                { value: "Inactive", label: "Inactivo" },
              ]}
              value={formData.status}
              error={errors.status}
              touched={touched.status}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.75}
            />

          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-3">
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