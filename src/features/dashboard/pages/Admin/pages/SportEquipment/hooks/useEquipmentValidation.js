import { useState } from "react";

/**
 * Reglas de validación para el formulario de material deportivo.
 */
export const equipmentValidationRules = {
  nombre: [
    (value) => (!value?.trim() ? "El nombre del material es obligatorio." : ""),
    (value) =>
      value.length < 3 ? "El nombre debe tener al menos 3 caracteres." : "",
  ],
  cantidadReal: [
    (value) =>
      value === "" || value === null ? "La cantidad es obligatoria." : "",
    (value) =>
      parseInt(value, 10) < 0 ? "La cantidad no puede ser negativa." : "",
  ],
  estado: [(value) => (!value ? "Debe seleccionar un estado." : "")],
};

/**
 * Hook reutilizable para manejar el estado y la validación de formularios.
 * @param {object} initialValues - Valores iniciales del formulario.
 * @param {object} validationRules - Objeto con las reglas de validación.
 */
export const useFormValidation = (initialValues, validationRules) => {
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

  const validateAllFields = () => {
    const newErrors = {};
    const allTouched = {};
    Object.keys(validationRules).forEach((name) => {
      const error = validateField(name, values[name]);
      if (error) newErrors[name] = error;
      allTouched[name] = true;
    });
    setErrors(newErrors);
    setTouched(allTouched);
    return Object.keys(newErrors).length === 0;
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
    setValues,
    handleChange,
    handleBlur,
    validateAllFields,
    resetForm,
  };
};
