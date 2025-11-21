// useFormEventValidation.js
import { useState } from "react";
import apiClient from "../../../../../../../../shared/services/apiClient";

let nameCheckTimeout = null;

export const useFormEventValidation = () => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isCheckingName, setIsCheckingName] = useState(false);

  // Función para verificar disponibilidad del nombre en tiempo real
  const checkNameAvailability = async (name, eventId = null) => {
    // Limpiar timeout anterior
    if (nameCheckTimeout) {
      clearTimeout(nameCheckTimeout);
    }

    // Esperar 500ms después de que el usuario deje de escribir
    nameCheckTimeout = setTimeout(async () => {
      if (!name || name.length < 3) return;

      setIsCheckingName(true);
      try {
        let url = `/events/check-name?name=${encodeURIComponent(name)}`;
        if (eventId) {
          url += `&excludeId=${eventId}`;
        }

        const response = await apiClient.get(url);
        
        if (response.success && !response.available) {
          setErrors((prev) => ({ 
            ...prev, 
            nombre: response.message 
          }));
        } else {
          // Limpiar error de nombre si está disponible
          setErrors((prev) => {
            const newErrors = { ...prev };
            if (newErrors.nombre && newErrors.nombre.includes('Ya existe')) {
              delete newErrors.nombre;
            }
            return newErrors;
          });
        }
      } catch (error) {
        console.error('Error verificando nombre:', error);
      } finally {
        setIsCheckingName(false);
      }
    }, 500);
  };

  const validateField = (name, value, formData) => {
    let error = "";

    switch (name) {
      case "nombre":
        if (!value?.trim()) {
          error = "El nombre del evento es obligatorio.";
        } else if (value.length < 3) {
          error = "El nombre debe tener al menos 3 caracteres.";
        } else {
          // Validación asíncrona del nombre (se ejecutará después)
          checkNameAvailability(value, formData.id);
        }
        break;

      case "descripcion":
        if (!value?.trim()) error = "La descripción es obligatoria.";
        else if (value.length < 10) error = "La descripción debe tener al menos 10 caracteres.";
        break;

      case "fechaInicio":
        if (!value) {
          error = "La fecha de inicio es obligatoria.";
        }
        // Permitir fechas de inicio en el pasado
        break;

      case "fechaFin":
        if (!value) {
          error = "La fecha de finalización es obligatoria.";
        } else if (formData.fechaInicio && value < formData.fechaInicio) {
          error = "La fecha de finalización no puede ser menor a la de inicio.";
        } else if (!formData.id) {
          // Solo validar al crear eventos nuevos - la fecha y hora de fin deben ser futuras
          const now = new Date();
          const selectedDateTime = new Date(value + 'T' + (formData.horaFin || '23:59'));
          
          if (selectedDateTime <= now) {
            error = "La fecha y hora de finalización deben ser futuras.";
          }
        }
        break;

      case "horaInicio":
        if (!value) {
          error = "La hora de inicio es obligatoria.";
        }
        // Permitir horas de inicio en el pasado
        break;

      case "horaFin":
        if (!value) {
          error = "La hora de finalización es obligatoria.";
        } else if (formData.horaInicio && formData.fechaInicio === formData.fechaFin && value <= formData.horaInicio) {
          error = "La hora de finalización debe ser posterior a la de inicio.";
        } else if (!formData.id && formData.fechaFin) {
          // Validar que la fecha y hora de fin sean futuras
          const now = new Date();
          const selectedDateTime = new Date(formData.fechaFin + 'T' + value);
          
          if (selectedDateTime <= now) {
            error = "La fecha y hora de finalización deben ser futuras.";
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

  return { errors, touched, validate, handleBlur, touchAllFields, isCheckingName };
};
