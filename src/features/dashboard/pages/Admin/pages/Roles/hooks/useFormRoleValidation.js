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
    const allTouched = {};
    
    Object.keys(validationRules).forEach(name => {
      allTouched[name] = true;
      const error = validateField(name, values[name]);
      if (error) newErrors[name] = error;
    });
    
    setTouched(allTouched);
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
// Reglas de validación para el formulario de roles (mensajes simplificados)
export const roleValidationRules = {
  nombre: [
    (value) => !value?.trim() ? 'El nombre del rol es obligatorio.' : '',
    (value) => value?.trim().length < 2 ? 'El nombre debe tener al menos 2 caracteres.' : '',
    (value) => value?.trim().length > 50 ? `El nombre no puede exceder 50 caracteres (${value?.trim().length}/50).` : '',
    (value) => !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/.test(value?.trim() || '') ? 'Solo se permiten letras, números y espacios.' : ''
  ],
  descripcion: [
    (value) => !value?.trim() ? 'La descripción es obligatoria.' : '',
    (value) => value?.trim().length < 10 ? 'La descripción debe tener al menos 10 caracteres.' : '',
    (value) => value?.trim().length > 200 ? `La descripción no puede exceder 200 caracteres (${value?.trim().length}/200).` : '',
  ]
};