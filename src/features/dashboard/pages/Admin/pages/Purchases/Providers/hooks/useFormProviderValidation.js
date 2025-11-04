import { useState } from "react";

// ==================== FUNCIONES AUXILIARES ====================
const hasDoubleSpaces = (value) => /\s{2,}/.test(value);
const isOnlyLetters = (value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
const isValidEmail = (email) => /^[a-zA-Z0-9]([a-zA-Z0-9._-])*[a-zA-Z0-9]@[a-zA-Z0-9]([a-zA-Z0-9.-])*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(email);
const cleanPhone = (phone) => phone.replace(/[\s\-\(\)]/g, '');

// Validación teléfono colombiano
const validatePhone = (value) => {
  if (!value?.trim()) return "El número telefónico es obligatorio.";
  const phone = cleanPhone(value);
  
  if (phone.startsWith('+57') || phone.startsWith('57')) {
    const local = phone.replace(/^(\+57|57)/, '');
    if ((local.length === 10 && /^3/.test(local)) || (local.length === 7 && /^[2-8]/.test(local))) return "";
    return "Número inválido. Celular: 3XXXXXXXXX, Fijo: 2XXXXXXX-8XXXXXXX";
  }

  if (!/^\d+$/.test(phone)) return "El teléfono solo puede contener números.";
  if ((phone.length === 10 && /^3/.test(phone)) || (phone.length === 7 && /^[2-8]/.test(phone))) return "";
  if (phone.length < 7) return "El número debe tener al menos 7 dígitos.";
  if (phone.length > 10) return "Número demasiado largo. Máximo 10 dígitos para celular.";
  if (phone.length === 10 && !/^3/.test(phone)) return "Los números celulares deben iniciar con 3.";
  if (phone.length === 7 && !/^[2-8]/.test(phone)) return "Los números fijos deben iniciar con 2-8.";
  if ([8,9].includes(phone.length)) return "Longitud inválida. Use 7 dígitos (fijo) o 10 dígitos (celular).";
  return "Formato de teléfono inválido.";
};

// ==================== VALIDATION RULES ====================
export const providerValidationRules = {
  razonSocial: [
    (value, values) => {
      if (!value?.trim()) {
        return values?.tipoEntidad === 'juridica' 
          ? "La razón social es obligatoria." 
          : "El nombre completo es obligatorio.";
      }
      return '';
    },
    (value, values) => {
      if (value?.trim().length < 3) {
        return values?.tipoEntidad === 'juridica'
          ? "La razón social debe tener al menos 3 caracteres."
          : "El nombre debe tener al menos 3 caracteres.";
      }
      return '';
    },
    (value) => value?.trim().length > 200 ? `El campo no puede exceder 200 caracteres (${value?.trim().length}/200).` : '',
    (value) => hasDoubleSpaces(value) ? "No se permiten espacios dobles." : '',
  ],
  nit: [
    (value, values) => {
      if (!value?.trim()) {
        return values?.tipoEntidad === 'juridica'
          ? "El NIT es obligatorio."
          : "El documento de identidad es obligatorio.";
      }
      return '';
    },
    (value) => {
      const cleaned = value?.trim().replace(/[\s.-]/g, '');
      if (!/^\d{8,15}$/.test(cleaned)) {
        return "Debe contener entre 8 y 15 dígitos.";
      }
      return "";
    }
  ],
  tipoDocumento: [
    (value, values) => {
      if (values?.tipoEntidad === 'natural' && !value) {
        return "Debe seleccionar un tipo de documento.";
      }
      return "";
    }
  ],
  contactoPrincipal: [
    (value) => !value?.trim() ? "El contacto principal es obligatorio." : '',
    (value) => value?.trim().length < 2 ? "El contacto debe tener al menos 2 caracteres." : '',
    (value) => value?.trim().length > 150 ? `El contacto no puede exceder 150 caracteres (${value?.trim().length}/150).` : '',
    (value) => !isOnlyLetters(value) ? "El contacto solo puede contener letras y espacios." : '',
    (value) => hasDoubleSpaces(value) ? "No se permiten espacios dobles." : '',
  ],
  correo: [
    (value) => !value?.trim() ? "El correo es obligatorio." : '',
    (value) => !isValidEmail(value?.trim() || "") ? "El correo electrónico no es válido." : '',
    (value) => (value?.trim() || "").length > 150 ? `El correo no puede exceder 150 caracteres (${value?.trim().length}/150).` : ''
  ],
  telefono: [validatePhone],
  direccion: [
    (value) => !value?.trim() ? "La dirección es obligatoria." : '',
    (value) => value?.trim().length < 10 ? "La dirección debe tener al menos 10 caracteres." : '',
    (value) => value?.trim().length > 200 ? `La dirección no puede exceder 200 caracteres (${value?.trim().length}/200).` : '',
    (value) => hasDoubleSpaces(value) ? "No se permiten espacios dobles." : ''
  ],
  ciudad: [
    (value) => !value?.trim() ? "La ciudad es obligatoria." : '',
    (value) => value?.trim().length < 2 ? "La ciudad debe tener al menos 2 caracteres." : '',
    (value) => value?.trim().length > 100 ? `La ciudad no puede exceder 100 caracteres (${value?.trim().length}/100).` : '',
    (value) => !isOnlyLetters(value) ? "La ciudad solo puede contener letras y espacios." : '',
    (value) => hasDoubleSpaces(value) ? "No se permiten espacios dobles." : ''
  ],
  descripcion: [
    (value) => !value?.trim() ? "" : value.trim().length > 500 ? `La descripción no puede exceder 500 caracteres (${value?.trim().length}/500).` : "",
    (value) => !value?.trim() ? "" : hasDoubleSpaces(value) ? "No se permiten espacios dobles." : ""
  ],
  estado: [
    (value) => !value ? "Debe seleccionar un estado válido (Activo o Inactivo)." : ''
  ],
  tipoEntidad: [
    (value) => !value ? "Debe seleccionar un tipo de entidad válido (Jurídica o Natural)." : ''
  ]
};

// ==================== CUSTOM HOOK ====================
export const useFormProviderValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    // Si es tipoDocumento y la entidad es jurídica, no validar
    if (name === 'tipoDocumento' && values.tipoEntidad === 'juridica') {
      return '';
    }
    
    for (const rule of rules) {
      const error = rule(value, values);
      if (error) return error;
    }
    return '';
  };

  const validateAllFields = () => {
    const newErrors = {};
    const allTouched = {};
    
    Object.keys(validationRules).forEach(name => {
      allTouched[name] = true;
      
      // Saltar validación de tipoDocumento si es persona jurídica
      if (name === 'tipoDocumento' && values.tipoEntidad === 'juridica') {
        return;
      }
      
      const error = validateField(name, values[name]);
      if (error) newErrors[name] = error;
    });
    
    setTouched(allTouched);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name, value) => {
    setValues(prev => {
      const newValues = { ...prev, [name]: value };
      
      // Si cambia el tipoEntidad, ajustar tipoDocumento
      if (name === 'tipoEntidad') {
        if (value === 'juridica') {
          newValues.tipoDocumento = '';
          // Limpiar error de tipoDocumento
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.tipoDocumento;
            return newErrors;
          });
        } else if (value === 'natural' && !newValues.tipoDocumento) {
          newValues.tipoDocumento = 'CC';
        }
      }
      
      return newValues;
    });
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

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
    resetForm
  };
};