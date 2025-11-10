// src/features/dashboard/pages/Admin/pages/Athletes/SportsCategory/hooks/useFormSportsCategoryValidation.js
import { useState } from "react";

/* ==================== HOOK PRINCIPAL ==================== */
export const useFormSportsCategoryValidation = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /* ---------- Validar campo individual ---------- */
  const validateField = (name, value, currentValues = values) => {
    const rules = validationRules[name];
    if (!rules || !Array.isArray(rules)) return "";
    for (const rule of rules) {
      if (typeof rule === "function") {
        const error = rule(value, currentValues);
        if (error) return error;
      }
    }
    return "";
  };

  /* ---------- Validar todos los campos ---------- */
  const validateAllFields = (vals = values) => {
    const newErrors = {};
    const allTouched = {};

    Object.keys(validationRules).forEach((name) => {
      allTouched[name] = true;
      const error = validateField(name, vals[name], vals);
      if (error) newErrors[name] = error;
    });

    setTouched(allTouched);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------- Marcar todos los campos como "tocados" ---------- */
  const touchAllFields = (vals = values) => {
    const allTouched = {};
    Object.keys(validationRules).forEach((name) => {
      allTouched[name] = true;
    });
    setTouched(allTouched);

    const newErrors = {};
    Object.keys(validationRules).forEach((name) => {
      const err = validateField(name, vals[name], vals);
      if (err) newErrors[name] = err;
    });
    setErrors(newErrors);
  };

  /* ---------- Manejadores ---------- */
  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value, { ...values, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name], values);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  /* ---------- Retorno ---------- */
  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAllFields,
    touchAllFields,
    setValues,
    setErrors,
    setTouched,
    resetForm,
  };
};

/* ==================== REGLAS DE VALIDACIÓN ==================== */
export const sportsCategoryValidationRules = {
  nombre: [
    (value) =>
      !value?.trim() ? "El nombre de la categoría es obligatorio." : "",
    (value) =>
      value?.trim().length < 3
        ? "El nombre debe tener al menos 3 caracteres."
        : "",
    (value) =>
      value?.trim().length > 100
        ? `El nombre no puede exceder 100 caracteres (${value?.trim().length}/100).`
        : "",
    (value) =>
      !/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_]+$/.test(value?.trim() || "")
        ? "Solo se permiten letras, números, espacios, guiones (-) y guiones bajos (_)."
        : "",
  ],

  edadMinima: [
    (value) =>
      value === undefined || value === "" || value === null
        ? "La edad mínima es obligatoria."
        : "",
    (value) =>
      isNaN(Number(value)) || !Number.isInteger(Number(value))
        ? "La edad mínima debe ser un número entero."
        : "",
    (value) =>
      Number(value) < 5 ? "La edad mínima debe ser al menos 5 años." : "",
    (value) =>
      Number(value) > 79 ? "La edad mínima no puede superar los 79 años." : "",
  ],

  edadMaxima: [
    (value) =>
      value === undefined || value === "" || value === null
        ? "La edad máxima es obligatoria."
        : "",
    (value) =>
      isNaN(Number(value)) || !Number.isInteger(Number(value))
        ? "La edad máxima debe ser un número entero."
        : "",
    (value) =>
      Number(value) < 6 ? "La edad máxima debe ser al menos 6 años." : "",
    (value) =>
      Number(value) > 80 ? "La edad máxima no puede superar los 80 años." : "",
    (value, values) => {
      const min = Number(values?.edadMinima);
      const max = Number(value);
      return !isNaN(min) && !isNaN(max) && max <= min
        ? "La edad máxima debe ser mayor que la edad mínima."
        : "";
    },
  ],

  descripcion: [
    (value) =>
      value &&
      typeof value === "string" &&
      value.trim().length > 0 &&
      value.trim().length < 10
        ? "La descripción debe tener al menos 10 caracteres si se proporciona."
        : "",
    (value) =>
      value &&
      typeof value === "string" &&
      value.trim().length > 500
        ? `La descripción no puede exceder 500 caracteres (${value.trim().length}/500).`
        : "",
  ],

  estado: [
    (value) =>
      !value || (value !== "Active" && value !== "Inactive")
        ? "Seleccione un estado válido: Activo o Inactivo."
        : "",
  ],

  // Archivo opcional — validación simple (opcional)
  /*
  archivo: [
    (file) => {
      if (!file || !(file instanceof File)) return "";
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!validTypes.includes(file.type))
        return "Solo se permiten archivos JPG, PNG o WEBP.";
      if (file.size > maxSize)
        return "El archivo no puede superar los 5 MB.";
      return "";
    },
  ],
  */
};
