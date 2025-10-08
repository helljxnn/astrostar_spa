import { useState, useCallback } from "react";

// Un hook de validación simple para el formulario de citas
export const useAppointmentValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback(
    (name, value, currentValues) => {
      const rules = validationRules[name];
      if (!rules) return "";

      for (const rule of rules) {
        const error = rule(value, currentValues);
        if (error) return error;
      }
      return "";
    },
    [validationRules]
  );

  const validateAllFields = useCallback(() => {
    const newErrors = {};
    const allTouched = {};
    let isValid = true;
    Object.keys(validationRules).forEach((name) => {
      allTouched[name] = true;
      const error = validateField(name, values[name], values);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });
    setErrors(newErrors);
    setTouched(allTouched);
    return isValid;
  }, [values, validationRules, validateField]);

  const handleChange = useCallback(
    (e) => {
      // Si 'e' es un evento de React, tendrá un 'target'.
      // Si no, podría ser un valor directo de un componente personalizado.
      if (e && e.target) {
        const { name, value } = e.target;
        const newValues = { ...values, [name]: value };
        setValues(newValues);

        if (touched[name]) {
          const error = validateField(name, value, newValues);
          setErrors((prev) => ({ ...prev, [name]: error }));
        }
      } else {
        // Si no es un evento, no podemos determinar 'name' y 'value'.
        // En este caso, es mejor usar setFieldValue directamente.
        // Dejamos este bloque para evitar errores, pero la lógica se moverá.
      }
    },
    [touched, values, validateField]
  );

  const handleBlur = useCallback(
    (e) => {
      if (e && e.target) {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        const error = validateField(name, value, values);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [values, validateField]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAllFields,
    resetForm,
    setValues,
    setFieldValue,
  };
};

// Para evitar recalcular la fecha de hoy en cada render/validación.
const today = new Date();
today.setHours(0, 0, 0, 0); // Establece la hora a medianoche para comparar solo la fecha.

// Reglas de validación para el formulario de citas
export const appointmentValidationRules = {
  athlete: [(value) => (!value ? "Debe seleccionar un deportista" : "")],
  specialty: [(value) => (!value ? "Debe seleccionar una especialidad" : "")],
  specialist: [(value) => (!value ? "Debe seleccionar un especialista" : "")],
  description: [
    (value) => (!value?.trim() ? "La descripción es obligatoria" : ""),
    (value) =>
      value?.trim().length < 10
        ? "La descripción debe tener al menos 10 caracteres"
        : "",
  ],
  start: [
    (value) => (!value ? "Debe seleccionar una fecha y hora para la cita" : ""),
  ],
};
