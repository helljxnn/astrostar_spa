// useFormScheduleValidation.js
import { useState } from "react";

export const useFormScheduleValidation = () => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value, formData) => {
    let error = "";

    switch (name) {
      case "empleado":
        if (!value?.trim()) error = "El nombre del empleado es obligatorio.";
        else if (value.length < 3)
          error = "El nombre debe tener al menos 3 caracteres.";
        break;

      case "fecha":
        if (!value) error = "La fecha es obligatoria.";
        break;

      case "horaInicio":
        if (!value) error = "La hora de inicio es obligatoria.";
        break;

      case "horaFin":
        if (!value) error = "La hora de finalización es obligatoria.";
        else if (formData.horaInicio && value <= formData.horaInicio)
          error = "La hora de finalización debe ser mayor que la hora de inicio.";
        break;

      case "area":
        if (!value?.trim()) error = "El área o departamento es obligatorio.";
        break;

      case "estado":
        if (!value?.trim()) error = "Debe seleccionar un estado.";
        break;

      case "descripcion":
      case "observaciones":
        if (value && value.length < 5)
          error = "Las observaciones deben tener al menos 5 caracteres.";
        break;

      default:
        break;
    }

    return error;
  };

  const validate = (formData) => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key], formData);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (name, value, formData) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value, formData);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const touchAllFields = (formData) => {
    const allTouched = {};
    Object.keys(formData).forEach((name) => {
      allTouched[name] = true;
    });
    setTouched(allTouched);
  };

  const hasChanges = (original, current) => {
    return Object.keys(current).some((key) => current[key] !== original[key]);
  };

  return { errors, touched, validate, handleBlur, touchAllFields, hasChanges };
};
