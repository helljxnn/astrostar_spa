import { useState, useEffect } from "react";

export const useFormRoleValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    for (const rule of rules) {
      const error = rule(value, values);
      if (error) return error;
    }
    return '';
  };

  const validateAllFields = () => {
    const newErrors = {};
    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) newErrors[name] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
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
    setTouched,
    resetForm
  };
};
// Reglas de validación para el formulario de roles
export const roleValidationRules = {
  nombre: [
    (value) => !value?.trim() ? 'El nombre es obligatorio' : '',
    (value) => value?.length < 3 ? 'El nombre debe tener al menos 3 caracteres' : '',
    (value) => value?.length > 50 ? 'El nombre no puede exceder 50 caracteres' : '',
    (value) => !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value || '') ? 'El nombre solo puede contener letras y espacios' : ''
  ],
  descripcion: [
    (value) => !value?.trim() ? 'La descripción es obligatoria' : '',
    (value) => value?.length > 200 ? 'La descripción no puede exceder 200 caracteres' : '',
  ],
  estado: [
    (value) => !value ? 'Debe seleccionar un estado' : ''
  ]
};