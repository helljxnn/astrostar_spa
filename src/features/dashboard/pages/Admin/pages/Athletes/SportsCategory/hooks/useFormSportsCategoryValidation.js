// useFormSportsCategoryValidation.js
import { useState } from "react";

export const sportsCategoryValidationRules = {
  nombre: {
    required: true,
    message: "El nombre es obligatorio",
  },
  descripcion: {
    required: true,
    message: "La descripcion es obligatoria",
    maxLength: 200,
    maxLengthMessage: "Maximo 200 caracteres",
  },
  edadMinima: {
    required: true,
    isNumber: true,
    message: "Edad minima obligatoria y numerica",
  },
  edadMaxima: {
    required: true,
    isNumber: true,
    message: "Edad maxima obligatoria y numerica",
  },
};

export const useFormSportsCategoryValidation = (
  initialValues = {},
  validationRules = {}
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value) => {
    const rule = validationRules[name];
    if (!rule) return "";

    if (rule.required) {
      if (name === "archivo") {
        if (!value) return rule.message || "Campo obligatorio";
      } else if (value === undefined || value === null || String(value).trim() === "") {
        return rule.message || "Campo obligatorio";
      }
    }

    if (rule.isNumber && value !== "" && isNaN(Number(value))) {
      return "Debe ser numerico";
    }

    if (rule.maxLength) {
      const strVal = String(value || "");
      if (strVal.length > rule.maxLength) {
        return rule.maxLengthMessage || `Maximo ${rule.maxLength} caracteres`;
      }
    }

    return "";
  };

  const validateForm = () => {
    const newErrors = {};
    for (const field in validationRules) {
      const err = validateField(field, values[field]);
      if (err) newErrors[field] = err;
    }
    setErrors(newErrors);
    return newErrors;
  };

  const touchAllFields = () => {
    const all = {};
    for (const field in validationRules) all[field] = true;
    setTouched(all);
  };

  const clearValidation = () => {
    setErrors({});
    setTouched({});
  };

  const handleChange = (...args) => {
    if (args.length === 1 && args[0] && args[0].target) {
      const e = args[0];
      const { name, type } = e.target;

      let value;
      if (type === "checkbox") value = !!e.target.checked;
      else if (type === "file") value = e.target.files?.[0] ?? null;
      else value = e.target.value;

      setValues((prev) => ({ ...prev, [name]: value }));

      if (touched[name]) {
        const err = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: err }));
      }
      return;
    }

    if (args.length >= 2) {
      const name = args[0];
      const value = args[1];
      setValues((prev) => ({ ...prev, [name]: value }));

      if (touched[name]) {
        const err = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: err }));
      }
    }
  };

  const handleBlur = (arg) => {
    let name;
    if (arg && arg.target) {
      name = arg.target.name;
    } else {
      name = arg;
    }
    if (!name) return;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, values[name]);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  return {
    values,
    setValues,
    errors,
    setErrors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    touchAllFields,
    clearValidation,
    isSubmitting,
    setIsSubmitting,
  };
};

export default useFormSportsCategoryValidation;
