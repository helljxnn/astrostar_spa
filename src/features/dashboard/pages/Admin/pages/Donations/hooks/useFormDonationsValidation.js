// ./hooks/useFormDonationsValidation.js
import { useState } from "react";

// Reglas de validación
export const donationsValidationRules = {
  nombreDonante: {
    required: "El nombre del donante es obligatorio",
  },
  descripcion: {
    required: "La descripción es obligatoria",
  },
  estado: {
    required: "El estado es obligatorio",
  },
  fechaDonacion: {
    required: "La fecha de donación es obligatoria",
  },
  fechaRegistro: {
    required: "La fecha de registro es obligatoria",
  },
  donacionesExtra: {
    required: "Debe agregar al menos un tipo y cantidad de donación",
  },
};

// Hook de validación
export const useFormDonationsValidation = (rules) => {
  const [errors, setErrors] = useState({});

  // Validar un campo individual
  const validateField = (field, value) => {
    let error = "";

    if (rules[field]?.required && (!value || value.length === 0)) {
      error = rules[field].required;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  // Validar todo el formulario
  const validateForm = (data) => {
    let newErrors = {};
    let isValid = true;

    for (let field in rules) {
      if (rules[field]?.required) {
        if (!data[field] || data[field].length === 0) {
          newErrors[field] = rules[field].required;
          isValid = false;
        }
      }
    }

    // Validación especial para donacionesExtra
    if (
      data.donacionesExtra.length === 0 ||
      data.donacionesExtra.some(
        (d) => !d.tipoDonacion || d.tipoDonacion === "" || !d.cantidad
      )
    ) {
      newErrors.donacionesExtra =
        "Debe completar todos los campos de tipo y cantidad";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  return { errors, validateField, validateForm };
};
