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

  // 👇 Fuerza marcar todos como touched
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
    (value) => value?.length < 3 ? "Debe tener al menos 3 caracteres" : "",
  ],
  tipoDocumento: [(value) => (!value ? "Debe seleccionar un tipo de documento" : "")],
  identificacion: [
    (value) => (!value?.trim() ? "La identificación es obligatoria" : ""),
    (value) => !/^\d+$/.test(value || "") ? "Solo números válidos" : "",
  ],
  telefono: [
    (value) => (!value?.trim() ? "El teléfono es obligatorio" : ""),
    (value) => !/^\d{7,10}$/.test(value || "") ? "Teléfono inválido" : "",
  ],
  fechaNacimiento: [(value) => (!value ? "Debe seleccionar una fecha" : "")],
  edad: [(value) => (!value ? "La edad es obligatoria" : "")],
  categoria: [
    (value, values) =>
      values.tipoPersona === "Jugadora" && !value ? "Debe seleccionar una categoría" : "",
  ],
  estado: [(value) => (!value ? "Debe seleccionar un estado" : "")],
};
