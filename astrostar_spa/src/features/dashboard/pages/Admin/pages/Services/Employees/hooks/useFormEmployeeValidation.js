import { useState } from "react";

export const useFormEmployeeValidation = (initialValues, validationRules) => {
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

// Reglas de validación
export const employeeValidationRules = {
  nombre: [
    (value) => (!value?.trim() ? "El nombre es obligatorio" : ""),
    (value) => value?.length < 3 ? "El nombre debe tener al menos 3 caracteres" : "",
    (value) =>
      !/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(value || "") ? "Solo se permiten letras" : "",
  ],
  apellido: [
    (value) => (!value?.trim() ? "El apellido es obligatorio" : ""),
    (value) => value?.length < 3 ? "El apellido debe tener al menos 3 caracteres" : "",
    (value) =>
      !/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(value || "") ? "Solo se permiten letras" : "",
  ],
  correo: [
    (value) => (!value?.trim() ? "El correo es obligatorio" : ""),
    (value) =>
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "") ? "Formato de correo inválido" : "",
  ],
  telefono: [
    (value) => (!value?.trim() ? "El teléfono es obligatorio" : ""),
    (value) => !/^\d+$/.test(value || "") ? "Solo se permiten números" : "",
    (value) =>
      value?.length < 7 || value?.length > 15 ? "El teléfono debe tener entre 7 y 15 dígitos" : "",
  ],
  edad: [
    (value) => (!value ? "La edad es obligatoria" : ""),
    (value) => !/^\d+$/.test(value || "") ? "La edad debe ser un número" : "",
    (value) => parseInt(value) < 18 ? "Debe ser mayor de 18 años" : "",
    (value) => parseInt(value) > 65 ? "La edad máxima permitida es 65 años" : "",
  ],
  identificacion: [
    (value) => (!value?.trim() ? "La identificación es obligatoria" : ""),
    (value) => !/^\d+$/.test(value || "") ? "Solo se permiten números" : "",
  ],
  tipoDocumento: [(value) => (!value ? "Debe seleccionar el tipo de documento" : "")],
  tipoEmpleado: [(value) => (!value ? "Debe seleccionar el tipo de empleado" : "")],
  rol: [(value) => (!value ? "Debe seleccionar un rol" : "")],
  estado: [(value) => (!value ? "Debe seleccionar un estado" : "")],
  fechaAsignacion: [(value) => (!value ? "Debe seleccionar una fecha de asignación" : "")],
};
