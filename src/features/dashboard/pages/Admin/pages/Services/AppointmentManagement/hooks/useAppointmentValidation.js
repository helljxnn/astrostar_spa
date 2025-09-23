import { useState } from "react";

// Un hook de validación simple para el formulario de citas
export const useAppointmentValidation = (initialValues, validationRules) => {
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
    setErrors(newErrors);
    setTouched(allTouched);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
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
    resetForm,
    setValues,
  };
};

// Reglas de validación para el formulario de citas
export const appointmentValidationRules = {
  specialty: [(value) => (!value ? "Debe seleccionar una especialidad" : "")],
  specialist: [(value) => (!value ? "Debe seleccionar un especialista" : "")],
  description: [
    (value) => (!value?.trim() ? "La descripción es obligatoria" : ""),
    (value) =>
      value?.trim().length < 10
        ? "La descripción debe tener al menos 10 caracteres"
        : "",
  ],
  date: [
    (value) => (!value ? "La fecha es obligatoria" : ""),
    (value) =>
      new Date(value) < new Date().setHours(0, 0, 0, 0)
        ? "La fecha no puede ser en el pasado"
        : "",
  ],
  time: [(value) => (!value ? "La hora es obligatoria" : "")],
};
