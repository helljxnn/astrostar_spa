// useFormSportsCategoryValidation.js
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
  archivo: {
    required: true,
    message: "La imagen es obligatoria",
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

  /* ----------------------------------------------------------
     Validate single field
  ---------------------------------------------------------- */
  const validateField = (name, value) => {
    const rule = validationRules[name];
    if (!rule) return "";

    if (rule.required) {
      // For file, explicitly check File instance or truthy
      if (name === "archivo") {
        if (!value) return rule.message || "Campo obligatorio";
      } else if (value === undefined || value === null || String(value).trim() === "") {
        return rule.message || "Campo obligatorio";
      }
    }

    if (rule.isNumber && value !== "" && isNaN(Number(value))) {
      return "Debe ser numérico";
    }

    return "";
  };

  /* ----------------------------------------------------------
     Validate entire form -> returns errors object
  ---------------------------------------------------------- */
  const validateForm = () => {
    const newErrors = {};
    for (const field in validationRules) {
      const err = validateField(field, values[field]);
      if (err) newErrors[field] = err;
    }
    setErrors(newErrors);
    return newErrors;
  };

  /* ----------------------------------------------------------
     Touch all fields (mark as visited)
  ---------------------------------------------------------- */
  const touchAllFields = (optionalValues) => {
    const all = {};
    for (const field in validationRules) all[field] = true;
    setTouched(all);
  };

  /* ----------------------------------------------------------
     Clear validations
  ---------------------------------------------------------- */
  const clearValidation = () => {
    setErrors({});
    setTouched({});
  };

  /* ----------------------------------------------------------
     handleChange flexible:
       - handleChange(event)
       - handleChange(name, value)
  ---------------------------------------------------------- */
  const handleChange = (...args) => {
    // event form
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

    // name, value form
    if (args.length >= 2) {
      const name = args[0];
      const value = args[1];
      setValues((prev) => ({ ...prev, [name]: value }));

      if (touched[name]) {
        const err = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: err }));
      }
      return;
    }
  };

  /* ----------------------------------------------------------
     handleBlur flexible:
       - handleBlur(event)
       - handleBlur(name)
  ---------------------------------------------------------- */
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
