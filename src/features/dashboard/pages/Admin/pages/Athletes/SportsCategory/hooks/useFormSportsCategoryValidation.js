import { useState } from "react";

export const useFormSportsCategoryValidation = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value, currentValues = values) => {
    const rules = validationRules[name];
    if (!rules) return "";
    for (const rule of rules) {
      const error = rule(value, currentValues);
      if (error) return error;
    }
    return "";
  };

  const validateAllFields = (vals = values) => {
    const newErrors = {};
    Object.keys(validationRules).forEach((name) => {
      const error = validateField(name, vals[name], vals);
      if (error) newErrors[name] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Función validate para compatibilidad con el modal
  const validate = (formData) => {
    return validateAllFields(formData);
  };

  // ✅ para marcar todos los campos como "tocados"
  const touchAllFields = (vals = values) => {
    const allTouched = {};
    Object.keys(vals).forEach((k) => { allTouched[k] = true; });
    setTouched(allTouched);
  };

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value, { ...values, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  // ✅ handleBlur compatible con el modal (recibe name, value, form)
  const handleBlur = (name, value = values[name], formData = values) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value, formData);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAllFields,
    validate, // ✅ Agregado para compatibilidad
    touchAllFields,
    setValues,
  };
};

// ✅ Reglas de validación actualizadas y más específicas
export const sportsCategoryValidationRules = {
  nombreCategoria: [
    (v) => (!v?.trim() ? "El nombre de la categoría es obligatorio" : ""),
    (v) => (v?.trim().length < 3 ? "El nombre debe tener al menos 3 caracteres" : ""),
    (v) => (v?.trim().length > 50 ? "El nombre no puede exceder 50 caracteres" : ""),
  ],
  edadMinima: [
    (v) => (!v || v === "" ? "La edad mínima es obligatoria" : ""),
    (v) => (isNaN(Number(v)) ? "La edad mínima debe ser un número válido" : ""),
    (v) => (Number(v) < 5 ? "La edad mínima debe ser mayor o igual a 5 años" : ""),
    (v) => (Number(v) > 50 ? "La edad mínima no puede ser mayor a 50 años" : ""),
  ],
  edadMaxima: [
    (v) => (!v || v === "" ? "La edad máxima es obligatoria" : ""),
    (v) => (isNaN(Number(v)) ? "La edad máxima debe ser un número válido" : ""),
    (v) => (Number(v) > 80 ? "La edad máxima no puede ser mayor a 80 años" : ""),
    (v, values) =>
      values?.edadMinima && Number(v) <= Number(values.edadMinima)
        ? "La edad máxima debe ser mayor que la edad mínima"
        : "",
  ],
  descripcion: [
    // Descripción opcional, pero si se llena debe tener mínimo
    (v) => (v && v.trim().length > 0 && v.trim().length < 10 ? "La descripción debe tener al menos 10 caracteres" : ""),
    (v) => (v && v.trim().length > 500 ? "La descripción no puede exceder 500 caracteres" : ""),
  ],
  estado: [
    (v) => (!v ? "Debe seleccionar un estado para la categoría" : ""),
  ],
  archivo: [
    (v) => (!v ? "Debe subir un archivo antes de continuar" : ""),
  ],
};