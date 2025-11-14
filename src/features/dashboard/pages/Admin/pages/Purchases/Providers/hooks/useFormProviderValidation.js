import { useState, useEffect, useCallback } from "react";

const hasDoubleSpaces = (value) => /\s{2,}/.test(value);
const isOnlyLetters = (value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
const isValidEmail = (email) => /^[a-zA-Z0-9]([a-zA-Z0-9._-])*[a-zA-Z0-9]@[a-zA-Z0-9]([a-zA-Z0-9.-])*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(email);
const cleanPhone = (phone) => phone.replace(/[\s\-\(\)]/g, '');

const validatePhone = (value) => {
  if (!value?.trim()) return "El número telefónico es obligatorio.";
  
  const phone = cleanPhone(value);
  
  if (phone.startsWith('+57') || phone.startsWith('57')) {
    const local = phone.replace(/^(\+57|57)/, '');
    
    if (!/^\d+$/.test(local)) {
      return "El número solo puede contener dígitos después del prefijo.";
    }
    
    if (local.length === 10 && /^3/.test(local)) {
      return "";
    }
    
    if (local.length === 7 && /^[2-8]/.test(local)) {
      return "";
    }
    
    if (local.length < 7) {
      return "Número incompleto. Celular: 3XXXXXXXXX (10 dígitos), Fijo: 2XXXXXXX-8XXXXXXX (7 dígitos)";
    }
    
    if (local.length === 10 && !/^3/.test(local)) {
      return "Los números celulares deben iniciar con 3.";
    }
    
    if (local.length === 7 && !/^[2-8]/.test(local)) {
      return "Los números fijos deben iniciar con 2-8.";
    }
    
    return "Número inválido. Celular: 3XXXXXXXXX, Fijo: 2XXXXXXX-8XXXXXXX";
  }

  if (!/^\d+$/.test(phone)) {
    return "El teléfono solo puede contener números.";
  }
  
  if (phone.length === 10 && /^3/.test(phone)) {
    return "";
  }
  
  if (phone.length === 7 && /^[2-8]/.test(phone)) {
    return "";
  }
  
  if (phone.length < 7) {
    return "El número debe tener al menos 7 dígitos.";
  }
  
  if (phone.length > 10) {
    return "Número demasiado largo. Máximo 10 dígitos para celular.";
  }
  
  if (phone.length === 10 && !/^3/.test(phone)) {
    return "Los números celulares deben iniciar con 3.";
  }
  
  if (phone.length === 7 && !/^[2-8]/.test(phone)) {
    return "Los números fijos deben iniciar con 2-8.";
  }
  
  if ([8, 9].includes(phone.length)) {
    return "Longitud inválida. Use 7 dígitos (fijo) o 10 dígitos (celular).";
  }
  
  return "Formato de teléfono inválido.";
};

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
      if (value?.trim() && value.trim().length < 3) {
        return values?.tipoEntidad === 'juridica'
          ? "La razón social debe tener al menos 3 caracteres."
          : "El nombre debe tener al menos 3 caracteres.";
      }
      return '';
    },
    (value) => value?.trim() && value.trim().length > 200 ? `El campo no puede exceder 200 caracteres (${value.trim().length}/200).` : '',
    (value) => value?.trim() && hasDoubleSpaces(value) ? "No se permiten espacios dobles." : '',
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
    (value, values) => {
      if (!value?.trim()) return '';
      const cleaned = value.trim().replace(/[\s.-]/g, '');
      
      if (values?.tipoEntidad === 'juridica') {
        // PERSONA JURÍDICA: Solo números
        if (!/^\d{8,15}$/.test(cleaned)) {
          return "El NIT debe contener entre 8 y 15 dígitos numéricos.";
        }
      } else {
        // PERSONA NATURAL: Permite letras y números
        if (!/^[a-zA-Z0-9\-]{6,20}$/.test(cleaned)) {
          return "El documento debe contener entre 6 y 20 caracteres alfanuméricos ";
        }
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
    (value) => value?.trim() && value.trim().length < 2 ? "El contacto debe tener al menos 2 caracteres." : '',
    (value) => value?.trim() && value.trim().length > 150 ? `El contacto no puede exceder 150 caracteres (${value.trim().length}/150).` : '',
    (value) => value?.trim() && !isOnlyLetters(value) ? "El contacto solo puede contener letras y espacios." : '',
    (value) => value?.trim() && hasDoubleSpaces(value) ? "No se permiten espacios dobles." : '',
  ],
  correo: [
    (value) => value?.trim() && !isValidEmail(value.trim()) ? "El correo electrónico no es válido." : '',
    (value) => value?.trim() && value.trim().length > 150 ? `El correo no puede exceder 150 caracteres (${value.trim().length}/150).` : ''
  ],
  telefono: [
    (value) => !value?.trim() ? "El número telefónico es obligatorio." : '',
    (value) => value?.trim() ? validatePhone(value) : ''
  ],
  direccion: [
    (value) => !value?.trim() ? "La dirección es obligatoria." : '',
    (value) => value?.trim() && value.trim().length < 10 ? "La dirección debe tener al menos 10 caracteres." : '',
    (value) => value?.trim() && value.trim().length > 200 ? `La dirección no puede exceder 200 caracteres (${value.trim().length}/200).` : '',
    (value) => value?.trim() && hasDoubleSpaces(value) ? "No se permiten espacios dobles." : ''
  ],
  ciudad: [
    (value) => !value?.trim() ? "La ciudad es obligatoria." : '',
    (value) => value?.trim() && value.trim().length < 2 ? "La ciudad debe tener al menos 2 caracteres." : '',
    (value) => value?.trim() && value.trim().length > 100 ? `La ciudad no puede exceder 100 caracteres (${value.trim().length}/100).` : '',
    (value) => value?.trim() && !isOnlyLetters(value) ? "La ciudad solo puede contener letras y espacios." : '',
    (value) => value?.trim() && hasDoubleSpaces(value) ? "No se permiten espacios dobles." : ''
  ],
  descripcion: [
    (value) => value?.trim() && value.trim().length > 500 ? `La descripción no puede exceder 500 caracteres (${value.trim().length}/500).` : "",
    (value) => value?.trim() && hasDoubleSpaces(value) ? "No se permiten espacios dobles." : ""
  ],
  estado: [
    (value) => !value ? "Debe seleccionar un estado válido (Activo o Inactivo)." : ''
  ],
  tipoEntidad: [
    (value) => !value ? "Debe seleccionar un tipo de entidad válido (Jurídica o Natural)." : ''
  ]
};

export const useFormProviderValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((name, value, currentValues = values) => {
    const rules = validationRules[name];
    if (!rules) return '';

    if (name === 'tipoDocumento' && currentValues.tipoEntidad === 'juridica') {
      return '';
    }
    
    for (const rule of rules) {
      const error = rule(value, currentValues);
      if (error) return error;
    }
    return '';
  }, [values, validationRules]);

  const validateAllFields = () => {
    const newErrors = {};
    const allTouched = {};
    
    Object.keys(validationRules).forEach(name => {
      allTouched[name] = true;
      
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
    const previousTipoEntidad = values.tipoEntidad;
    
    setValues(prev => {
      const newValues = { ...prev, [name]: value };
      
      if (name === 'tipoEntidad') {
        if (value === 'juridica') {
          newValues.tipoDocumento = '';
        }
      }
      
      return newValues;
    });

    setTimeout(() => {
      const error = validateField(name, value);
      setErrors(prev => {
        if (error) {
          return { ...prev, [name]: error };
        } else {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        }
      });
    }, 0);

    if (!touched[name]) {
      setTimeout(() => {
        setTouched(prev => ({ ...prev, [name]: true }));
      }, 0);
    }

    // NUEVO: Resetear el estado "touched" cuando cambia el tipo de entidad
    if (name === 'tipoEntidad' && previousTipoEntidad !== value) {
      setTimeout(() => {
        // Resetear todos los campos touched
        setTouched({});
        
        // Re-validar campos dependientes del tipo de entidad
        const dependentFields = ['razonSocial', 'nit', 'tipoDocumento'];
        const newErrors = { ...errors };
        
        dependentFields.forEach(fieldName => {
          const error = validateField(fieldName, values[fieldName]);
          if (error) {
            newErrors[fieldName] = error;
          } else {
            delete newErrors[fieldName];
          }
        });
        
        setErrors(newErrors);
      }, 10);
    }
  };

  const handleBlur = (name) => {
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
    
    const error = validateField(name, values[name]);
    setErrors(prev => {
      if (error) {
        return { ...prev, [name]: error };
      } else {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
    });
  };

  useEffect(() => {
    const newErrors = { ...errors };
    let hasChanges = false;

    Object.keys(touched).forEach(fieldName => {
      if (touched[fieldName]) {
        const currentError = validateField(fieldName, values[fieldName]);
        const hasError = errors[fieldName];
        
        if (hasError && !currentError) {
          delete newErrors[fieldName];
          hasChanges = true;
        }
        else if (!hasError && currentError) {
          newErrors[fieldName] = currentError;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setErrors(newErrors);
    }
  }, [values, touched]);

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  const touchAllFields = () => {
    const allTouched = {};
    Object.keys(validationRules).forEach((name) => {
      allTouched[name] = true;
    });
    setTouched(allTouched);
    validateAllFields();
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
    resetForm,
    touchAllFields
  };
};