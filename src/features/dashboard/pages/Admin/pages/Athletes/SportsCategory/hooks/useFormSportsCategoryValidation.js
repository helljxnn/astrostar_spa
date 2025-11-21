// ===============================================
// useFormSportsCategoryValidation.js (FINAL)
// ===============================================

import { useState } from "react";

export const sportsCategoryValidationRules = {
  nombre: {
    required: true,
    message: "El nombre es obligatorio",
  },
  descripcion: {
    required: true,
    message: "La descripción es obligatoria",
  },
  edadMinima: {
    required: true,
    isNumber: true,
    message: "Edad mínima obligatoria y numérica",
  },
  edadMaxima: {
    required: true,
    isNumber: true,
    message: "Edad máxima obligatoria y numérica",
  },
};

export const useFormSportsCategoryValidation = (
  initialValues = {},
  validationRules = {}
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ============================
  // VALIDACIÓN POR CAMPO
  // ============================
  const validateField = (name, value) => {
    const rule = validationRules[name];
    if (!rule) return "";

    if (rule.required && !value) return rule.message || "Campo obligatorio";
    if (rule.isNumber && isNaN(Number(value))) return "Debe ser numérico";

    return "";
  };

  // ============================
  // VALIDACIÓN COMPLETA
  // ============================
  const validateForm = () => {
    const newErrors = {};
    Object.keys(validationRules).forEach((field) => {
      const err = validateField(field, values[field]);
      if (err) newErrors[field] = err;
    });
    setErrors(newErrors);
    return newErrors;
  };

  // ============================
  // LIMPIAR TODO
  // ============================
  const clearValidation = () => {
    setErrors({});
    setTouched({});
  };

  // ============================
  // INPUT CHANGE
  // ============================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setValues((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  // ============================
  // ON BLUR
  // ============================
  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({ ...prev, [name]: true }));

    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  return {
    values,
    setValues,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    clearValidation, 
  };
};
