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
        if (!value) error = "La fecha de inicio es obligatoria.";
        break;

      case "fechaFin":
        if (!value) error = "La fecha de finalización es obligatoria.";
        else if (formData.fechaInicio && value < formData.fechaInicio) {
          error = "La fecha de finalización no puede ser menor a la de inicio.";
        }
        break;

      case "ubicacion":
        if (!value?.trim()) error = "La ubicación es obligatoria.";
        break;

      case "telefono":
        if (!value?.trim()) error = "El teléfono es obligatorio.";
        else if (!/^\d{7,15}$/.test(value)) {
          error = "Ingrese un número válido (7 a 15 dígitos).";
        }
        break;

      case "imagen":
        if (!value?.trim()) error = "La URL de la imagen es obligatoria.";
        else if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(value)) {
          error = "Ingrese una URL válida (jpg, png, gif, webp).";
        }
        break;

      case "detalles":
        if (!value?.trim()) error = "Los detalles son obligatorios.";
        else if (value.length < 15) error = "Los detalles deben tener al menos 15 caracteres.";
        break;

      case "patrocinador":
        if (!value?.trim()) error = "Seleccione un patrocinador.";
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

  const handleChange = (name, value, formData) => {
    const error = validateField(name, value, formData);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleBlur = (name, value, formData) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value, formData);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // 👇 Fuerza mostrar errores en todos los campos
  const touchAllFields = (formData) => {
    const allTouched = {};
    Object.keys(formData).forEach((name) => {
      allTouched[name] = true;
    });
    setTouched(allTouched);
  };

  return { errors, touched, validate, handleChange, handleBlur, touchAllFields };
};
