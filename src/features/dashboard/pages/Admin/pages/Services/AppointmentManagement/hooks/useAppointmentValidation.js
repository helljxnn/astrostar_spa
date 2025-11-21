import { useState, useCallback } from "react";

/**
 * A simple validation hook for forms.
 * @param {object} initialValues - The initial state of the form values.
 * @param {object} validationRules - An object containing validation functions for each field.
 * @returns {object} - Form state and handlers.
 */
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
      if (e && e.target) {
        const { name, value } = e.target;
        const newValues = { ...values, [name]: value };
        setValues(newValues);

        if (touched[name]) {
          const error = validateField(name, value, newValues);
          setErrors((prev) => ({ ...prev, [name]: error }));
        }
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

// Validation rules for the simplified appointment form
export const appointmentValidationRules = {
  title: [
      (value) => (!value?.trim() ? "Title is required" : ""),
      (value) =>
        value?.trim().length < 5
          ? "Title must be at least 5 characters long"
          : "",
    ],
  description: [
    (value) => (!value?.trim() ? "Description is required" : ""),
    (value) =>
      value?.trim().length < 10
        ? "Description must be at least 10 characters long"
        : "",
  ],
  date: [
    (value) => (!value ? "Date is required" : ""),
  ],
  time: [
    (value) => (!value ? "Time is required" : ""),
  ]
};
