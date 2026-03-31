import { useState, useCallback, useEffect, useRef } from "react";

export const useFormEmployeeValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const initialValuesRef = useRef(initialValues);

  useEffect(() => {
    initialValuesRef.current = initialValues;
  }, [initialValues]);

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

  // Fuerza marcar todos como touched
  const touchAllFields = () => {
    const allTouched = {};
    Object.keys(validationRules).forEach((name) => {
      allTouched[name] = true;
    });
    setTouched(allTouched);
  };

  // Limpia todas las validaciones y errores
  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  // Resetea completamente el formulario
  const resetForm = useCallback(() => {
    setValues({ ...initialValuesRef.current });
    setErrors({});
    setTouched({});
  }, []);

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
    touchAllFields,
    resetValidation,
    resetForm,
  };
};

// Reglas de validación actualizadas para el backend
export const employeeValidationRules = {
  firstName: [
    (value) => (!value?.trim() ? "El nombre es obligatorio" : ""),
    (value) =>
      value?.length < 2 ? "El nombre debe tener al menos 2 caracteres" : "",
    (value) =>
      !/^[\p{L}\p{M}\s]+$/u.test(value || "") ? "Solo se permiten letras" : "",
  ],
  lastName: [
    (value) => (!value?.trim() ? "El apellido es obligatorio" : ""),
    (value) =>
      value?.length < 2 ? "El apellido debe tener al menos 2 caracteres" : "",
    (value) =>
      !/^[\p{L}\p{M}\s]+$/u.test(value || "") ? "Solo se permiten letras" : "",
  ],
  middleName: [
    (value) => {
      if (!value) return ""; // Campo opcional
      return !/^[\p{L}\p{M}\s]*$/u.test(value) ? "Solo se permiten letras" : "";
    },
  ],
  secondLastName: [
    (value) => {
      if (!value) return ""; // Campo opcional
      return !/^[\p{L}\p{M}\s]*$/u.test(value) ? "Solo se permiten letras" : "";
    },
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
      // Validar formato: +57 seguido de 10 dígitos o solo 10 dígitos
      const phoneWithCode = /^\+57\s?\d{10}$/; // +57 3225658901 o +573225658901
      const phoneWithoutCode = /^\d{10}$/; // 3226758060

      if (!phoneWithCode.test(value) && !phoneWithoutCode.test(value)) {
        return "Ingrese un número válido: 10 dígitos (ej: 3225658901) o con indicativo (ej: +57 3225658901)";
      }
      return "";
    },
  ],
  identification: [
    (value) => (!value?.trim() ? "La identificación es obligatoria" : ""),
    (value) =>
      value?.length < 6
        ? "La identificación debe tener al menos 6 caracteres"
        : "",
    (value) =>
      value?.length > 10
        ? "La identificación no puede exceder 10 caracteres"
        : "",
    (value) =>
      !/^[0-9A-Za-z\-]+$/.test(value || "")
        ? "Solo números, letras y guiones"
        : "",
  ],
  documentTypeId: [
    (value) => (!value ? "Debe seleccionar el tipo de documento" : ""),
  ],
  roleId: [(value) => (!value ? "Debe seleccionar un rol" : "")],
  specialty: [
    (value, formData) => {
      if (!formData?.roleNameNormalized) return "";
      if (
        formData.roleNameNormalized !== "profesionaldesalud" &&
        formData.roleNameNormalized !== "profesionaldelasalud"
      ) {
        return "";
      }
      return !value ? "Debe seleccionar una especialidad" : "";
    },
  ],
  status: [
    // El estado solo es requerido en modo editar, en crear se asigna automáticamente como "Activo"
    (value, formData, mode) =>
      mode !== "create" && !value ? "Debe seleccionar un estado" : "",
  ],
  birthDate: [
    (value) => (!value ? "La fecha de nacimiento es obligatoria" : ""),
    (value) => {
      if (!value) return "";
      const birthDate = new Date(value);
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

      if (birthDate < minDate) {
        return "La fecha de nacimiento no puede ser anterior a 100 años atrás";
      }
      if (birthDate > maxDate) {
        return "El empleado debe ser mayor de edad (18 años o más)";
      }
      if (birthDate > today) {
        return "La fecha de nacimiento no puede ser futura";
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
};
