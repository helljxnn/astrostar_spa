import { useState } from "react";

export const useFormTempWorkerValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return "";

    for (const rule of rules) {
      const error = rule(value, values);
      if (error) return error;
    }
    return "";
  };

  const validateAllFields = () => {
    const newErrors = {};
    const allTouched = {};
    
    Object.keys(validationRules).forEach((name) => {
      allTouched[name] = true;
      const error = validateField(name, values[name]);
      if (error) newErrors[name] = error;
    });
    
    setTouched(allTouched);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const touchAllFields = () => {
    const allTouched = {};
    Object.keys(validationRules).forEach((name) => {
      allTouched[name] = true;
    });
    setTouched(allTouched);
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAllFields,
    setValues,
    touchAllFields,
  };
};

// Reglas
export const tempWorkerValidationRules = {
  tipoPersona: [(value) => (!value ? "Debe seleccionar un tipo de persona" : "")],
  nombre: [
    (value) => (!value?.trim() ? "El nombre es obligatorio" : ""),
    (value) => value?.length < 2 ? "Debe tener al menos 2 caracteres" : "",
  ],
  documentTypeId: [(value) => (!value ? "Debe seleccionar un tipo de documento" : "")],
  identificacion: [
    (value) => (!value?.trim() ? "La identificación es obligatoria" : ""),
    (value) => value?.length < 6 ? "Debe tener al menos 6 caracteres" : "",
  ],
  telefono: [
    (value) => (!value?.trim() ? "El teléfono es obligatorio" : ""),
    (value) => !/^\d{7,10}$/.test(value || "") ? "Teléfono debe tener entre 7 y 10 dígitos" : "",
  ],
  email: [
    (value) => {
      if (!value) return ""; // Email es opcional
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !emailRegex.test(value) ? "Email inválido" : "";
    }
  ],
  estado: [(value) => (!value ? "Debe seleccionar un estado" : "")],
};
