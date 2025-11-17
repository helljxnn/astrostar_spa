// useFormEventValidation.js
import { useState } from "react";

export const useFormEventValidation = () => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value, formData) => {
    let error = "";

    switch (name) {
      case "nombre":
        if (!value?.trim()) error = "El nombre del evento es obligatorio.";
        else if (value.length < 3) error = "El nombre debe tener al menos 3 caracteres.";
        break;

      case "descripcion":
        if (!value?.trim()) error = "La descripción es obligatoria.";
        else if (value.length < 10) error = "La descripción debe tener al menos 10 caracteres.";
        break;

      case "fechaInicio":
        if (!value) {
          error = "La fecha de inicio es obligatoria.";
        } else if (!formData.id) {
          // Solo validar al crear eventos nuevos
          const now = new Date();
          const selectedDateTime = new Date(value + 'T' + (formData.horaInicio || '00:00'));
          
          if (selectedDateTime < now) {
            error = "No puedes crear un evento con fecha y hora de inicio pasadas.";
          }
        }
        break;

      case "fechaFin":
        if (!value) {
          error = "La fecha de finalización es obligatoria.";
        } else if (formData.fechaInicio && value < formData.fechaInicio) {
          error = "La fecha de finalización no puede ser menor a la de inicio.";
        } else if (!formData.id) {
          // Solo validar al crear eventos nuevos
          const now = new Date();
          const selectedDateTime = new Date(value + 'T' + (formData.horaFin || '23:59'));
          
          if (selectedDateTime < now) {
            error = "No puedes crear un evento con fecha y hora de finalización pasadas.";
          }
        }
        break;

      case "horaInicio":
        if (!value) {
          error = "La hora de inicio es obligatoria.";
        } else if (!formData.id && formData.fechaInicio) {
          // Validar que la fecha y hora de inicio no sean pasadas
          const now = new Date();
          const selectedDateTime = new Date(formData.fechaInicio + 'T' + value);
          
          if (selectedDateTime < now) {
            error = "No puedes crear un evento con fecha y hora de inicio pasadas.";
          }
        }
        break;

      case "horaFin":
        if (!value) {
          error = "La hora de finalización es obligatoria.";
        } else if (formData.horaInicio && formData.fechaInicio === formData.fechaFin && value <= formData.horaInicio) {
          error = "La hora de finalización debe ser posterior a la de inicio.";
        } else if (!formData.id && formData.fechaFin) {
          // Validar que la fecha y hora de fin no sean pasadas
          const now = new Date();
          const selectedDateTime = new Date(formData.fechaFin + 'T' + value);
          
          if (selectedDateTime < now) {
            error = "No puedes crear un evento con fecha y hora de finalización pasadas.";
          }
        }
        break;

      case "ubicacion":
        if (!value?.trim()) error = "La ubicación es obligatoria.";
        break;

      case "telefono":
        if (!value?.trim()) {
          error = "El teléfono es obligatorio.";
        } else {
          // Validar formato: +57 seguido de 10 dígitos o solo 10 dígitos
          const phoneWithCode = /^\+57\s?\d{10}$/; // +57 3225658901 o +573225658901
          const phoneWithoutCode = /^\d{10}$/; // 3226758060
          
          if (!phoneWithCode.test(value) && !phoneWithoutCode.test(value)) {
            error = "Ingrese un número válido: 10 dígitos (ej: 3225658901) o con indicativo (ej: +57 3225658901)";
          }
        }
        break;

      case "imagen":
        // Haciendo la imagen opcional
        break;

      case "detalles":
        if (!value?.trim()) error = "Los detalles son obligatorios.";
        else if (value.length < 15) error = "Los detalles deben tener al menos 15 caracteres.";
        break;

      case "patrocinador":
        // Haciendo los patrocinadores opcionales
        break;

      case "categoria":
        if (!value?.trim()) error = "Debe seleccionar una categoría.";
        break;

      case "estado":
        if (!value?.trim()) error = "Debe seleccionar un estado.";
        break;

      case "tipoEvento":
        if (!value?.trim()) error = "Debe seleccionar un tipo de evento.";
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
    allTouched.tipoEvento = true;
    setTouched(allTouched);
  };

  return { errors, touched, validate, handleBlur, touchAllFields };
};
