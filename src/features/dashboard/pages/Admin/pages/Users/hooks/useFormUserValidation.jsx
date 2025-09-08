import { useState, useEffect } from "react";

export const useFormUserValidation = (initialValues, validationRules) => {
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
    Object.keys(validationRules).forEach((name) => {
      const error = validateField(name, values[name]);
      if (error) newErrors[name] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    console.log("Cambiando campo:", e.target.name, e.target.value); // Depuración
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    console.log("Campo desenfocado:", e.target.name); // Depuración
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
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
  };
};

export const userValidationRules = {
  nombre: [
    (value) => (!value?.trim() ? "El nombre es obligatorio" : ""),
    (value) => (value?.length < 3 ? "El nombre debe tener al menos 3 caracteres" : ""),
    (value) => (value?.length > 50 ? "El nombre no puede exceder 50 caracteres" : ""),
    (value) =>
      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value || "")
        ? "El nombre solo puede contener letras y espacios"
        : "",
  ],
  tipoDocumento: [(value) => (!value ? "Debe seleccionar un tipo de documento" : "")],
  identificacion: [
    (value) => (!value?.trim() ? "La identificación es obligatoria" : ""),
    (value) => (!/^\d+$/.test(value || "") ? "La identificación debe contener solo números" : ""),
    (value) =>
      value?.length < 5 || value?.length > 20
        ? "La identificación debe tener entre 5 y 20 dígitos"
        : "",
  ],
  rol: [(value) => (!value ? "Debe seleccionar un rol" : "")],
  correo: [
    (value) => (!value?.trim() ? "El correo es obligatorio" : ""),
    (value) =>
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "") ? "El correo no es válido" : "",
  ],
  telefono: [
    (value) => (!value?.trim() ? "El número telefónico es obligatorio" : ""),
    (value) =>
      !/^\+?[\d\s-()]{10,15}$/.test(value || "")
        ? "El número telefónico no es válido (ej: +57 300 123 4567)"
        : "",
  ],
  estado: [(value) => (!value ? "Debe seleccionar un estado" : "")],
};