// hooks/useFormGuardianValidation.js
import { useState } from "react";

// Funciones auxiliares de validación
const hasDoubleSpaces = (value) => /\s{2,}/.test(value);
const isOnlyLetters = (value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value);

// Reglas de validación específicas para acudientes
export const guardianValidationRules = {
  nombreCompleto: [
    (v) => (!v?.trim() ? "El nombre completo es obligatorio" : ""),
    (v) =>
      v?.trim().length < 2 ? "El nombre debe tener al menos 2 caracteres" : "",
    (v) =>
      v?.trim().length > 100 ? "El nombre no puede exceder 100 caracteres" : "",
    (v) =>
      !isOnlyLetters(v?.trim())
        ? "El nombre solo puede contener letras y espacios"
        : "",
    (v) => (hasDoubleSpaces(v) ? "No se permiten espacios dobles" : ""),
  ],
  documentTypeId: [
    (value) => (!value ? "Debe seleccionar el tipo de documento" : ""),
  ],
  identification: [
    (value) => (!value?.trim() ? "La identificación es obligatoria" : ""),
    (value) =>
      value?.length < 6
        ? "La identificación debe tener al menos 6 caracteres"
        : "",
    (value) =>
      !/^[0-9A-Za-z\-]+$/.test(value || "")
        ? "Solo números, letras y guiones"
        : "",
  ],
  email: [
    (value) => (!value?.trim() ? "El correo es obligatorio" : ""),
    (value) =>
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "")
        ? "Formato de correo inválido"
        : "",
  ],
  phoneNumber: [
    (value) => (!value?.trim() ? "El número telefónico es obligatorio" : ""),
    (value) => {
      if (!value) return "";
      const phoneWithCode = /^\+57\s?\d{10}$/;
      const phoneWithoutCode = /^\d{10}$/;

      if (!phoneWithCode.test(value) && !phoneWithoutCode.test(value)) {
        return "Ingrese un número válido: 10 dígitos (ej: 3225658901) o con indicativo (ej: +57 3225658901)";
      }
      return "";
    },
  ],
  address: [
    (value) => (!value?.trim() ? "La dirección es obligatoria" : ""),
    (value) =>
      value?.length < 10
        ? "La dirección debe tener al menos 10 caracteres"
        : "",
    (value) =>
      value?.length > 200 ? "La dirección no puede exceder 200 caracteres" : "",
  ],
  fechaNacimiento: [
    (v) => (!v ? "La fecha de nacimiento es obligatoria" : ""),
    (v) => {
      if (!v) return "";
      const birthDate = new Date(v);
      if (isNaN(birthDate.getTime())) {
        return "Fecha de nacimiento no válida";
      }

      const today = new Date();
      const minDate = new Date(
        today.getFullYear() - 100,
        today.getMonth(),
        today.getDate(),
      );
      const maxDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate(),
      );

      if (birthDate < minDate)
        return "La fecha de nacimiento no puede ser anterior a 100 años atrás";
      if (birthDate > maxDate) return "El acudiente debe ser mayor de 18 años";
      if (birthDate > today)
        return "La fecha de nacimiento no puede ser futura";
      return "";
    },
  ],
};

export const useFormGuardianValidation = (initialValues, validationRules) => {
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
    // Solo validar campos que existen en el formulario
    const fieldsToValidate = Object.keys(values);
    
    fieldsToValidate.forEach((name) => {
      if (validationRules[name]) {
        const error = validateField(name, values[name]);
        if (error) newErrors[name] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (nameOrEvent, value) => {
    const { name, val } =
      typeof nameOrEvent === "string"
        ? { name: nameOrEvent, val: value }
        : { name: nameOrEvent.target.name, val: nameOrEvent.target.value };
    
    
    setValues((prev) => ({ ...prev, [name]: val }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    const error = validateField(name, val);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleBlur = (nameOrEvent) => {
    const name =
      typeof nameOrEvent === "string" ? nameOrEvent : nameOrEvent?.target?.name;
    if (!name) return;
    
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
    setValues,
    setErrors,
    setTouched,
    resetForm,
  };
};
