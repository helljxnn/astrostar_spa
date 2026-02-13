import { useState, useCallback, useEffect } from "react";

const hasDoubleSpaces = (value) => /\s{2,}/.test(value);
const isOnlyLetters = (value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
const isValidEmail = (email) => /^[a-zA-Z0-9]([a-zA-Z0-9._-])*@[a-zA-Z0-9]([a-zA-Z0-9.-])*\.[a-zA-Z]{2,}$/.test(email);

// Validaciones específicas por tipo de documento (del módulo de empleados)
const getDocumentValidation = (documentTypeName, value) => {
  if (!documentTypeName || !value?.trim()) return '';
  
  const docName = documentTypeName.toLowerCase();
  
  // Cédula de Ciudadanía
  if (docName.includes('cédula') || docName.includes('cedula') || docName.includes('ciudadanía')) {
    if (!/^\d+$/.test(value)) {
      return "La cédula solo puede contener números.";
    }
    if (value.length < 6 || value.length > 10) {
      return "La cédula debe tener entre 6 y 10 dígitos.";
    }
    return '';
  }
  
  // Cédula de Extranjería
  if (docName.includes('extranjería') || docName.includes('extranjeria')) {
    if (!/^\d+$/.test(value)) {
      return "La cédula de extranjería solo puede contener números.";
    }
    if (value.length < 6 || value.length > 12) {
      return "La cédula de extranjería debe tener entre 6 y 12 dígitos.";
    }
    return '';
  }
  
  // Pasaporte
  if (docName.includes('pasaporte')) {
    if (!/^[A-Za-z0-9]+$/.test(value)) {
      return "El pasaporte solo puede contener letras y números.";
    }
    if (value.length < 6 || value.length > 15) {
      return "El pasaporte debe tener entre 6 y 15 caracteres.";
    }
    return '';
  }
  
  // Tarjeta de Identidad
  if (docName.includes('tarjeta') && docName.includes('identidad')) {
    if (!/^\d+$/.test(value)) {
      return "La tarjeta de identidad solo puede contener números.";
    }
    if (value.length < 8 || value.length > 11) {
      return "La tarjeta de identidad debe tener entre 8 y 11 dígitos.";
    }
    return '';
  }
  
  // NIT (Número de Identificación Tributaria)
  if (docName.includes('tributaria') || docName.includes('nit')) {
    if (!/^\d+$/.test(value)) {
      return "El NIT solo puede contener números, sin guiones ni puntos.";
    }
    if (value.length !== 10) {
      return "El NIT debe tener exactamente 10 dígitos.";
    }
    return '';
  }
  
  // Registro Civil
  if (docName.includes('registro') && docName.includes('civil')) {
    if (!/^\d+$/.test(value)) {
      return "El registro civil solo puede contener números.";
    }
    if (value.length < 8 || value.length > 15) {
      return "El registro civil debe tener entre 8 y 15 dígitos.";
    }
    return '';
  }
  
  // Validación genérica para otros tipos
  if (value.length > 20) {
    return "El documento no puede exceder los 20 caracteres.";
  }
  
  return '';
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
    (value, values, documentTypes = []) => {
      if (!value?.trim()) return '';
      
      if (values?.tipoEntidad === 'juridica') {
        // PERSONA JURÍDICA: Exactamente 10 dígitos, solo números
        if (!/^\d+$/.test(value)) {
          return "El NIT solo puede contener números, sin guiones ni puntos.";
        }
        if (value.length !== 10) {
          return "El NIT debe tener exactamente 10 dígitos.";
        }
      } else {
        // PERSONA NATURAL: Verificar si seleccionó NIT
        const selectedDocType = documentTypes.find(
          dt => (dt.id?.toString() === values?.tipoDocumento || dt.value === values?.tipoDocumento)
        );
        
        // Detectar si es NIT por nombre o label
        const docName = selectedDocType?.name || selectedDocType?.label || '';
        const isNIT = docName.toLowerCase().includes('tributaria') || docName.toLowerCase().includes('nit');
        
        if (isNIT) {
          // PERSONA NATURAL CON NIT: Exactamente las mismas validaciones que jurídica
          if (!/^\d+$/.test(value)) {
            return "El NIT solo puede contener números, sin guiones ni puntos.";
          }
          if (value.length !== 10) {
            return "El NIT debe tener exactamente 10 dígitos.";
          }
        } else {
          // PERSONA NATURAL CON OTROS DOCUMENTOS: Usar validaciones específicas
          return getDocumentValidation(docName, value);
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

export const useFormProviderValidation = (initialValues, validationRules, isEditing = false, documentTypes = []) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [originalValues, setOriginalValues] = useState(initialValues);

  const validateField = useCallback((name, value, currentValues = values) => {
    const rules = validationRules[name];
    if (!rules) return '';

    if (name === 'tipoDocumento' && currentValues.tipoEntidad === 'juridica') {
      return '';
    }
    
    for (const rule of rules) {
      const error = rule(value, currentValues, documentTypes);
      if (error) return error;
    }
    return '';
  }, [values, validationRules, documentTypes]);

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
        if (!isEditing) {
          // MODO CREAR: Limpiar todos los campos
          newValues.tipoDocumento = '';
          newValues.nit = '';
          newValues.razonSocial = '';
          newValues.contactoPrincipal = '';
          newValues.correo = '';
          newValues.telefono = '';
          newValues.direccion = '';
          newValues.ciudad = '';
          newValues.descripcion = '';
        }
        // En modo edición, no limpiar automáticamente - dejar que el componente maneje la restauración
      }
      
      return newValues;
    });

    setTimeout(() => {
      const error = validateField(name, value);
      setErrors(prev => {
        if (error) {
          return { ...prev, [name]: error };
        } else {
          const { [name]: removed, ...newErrors } = prev;
          return newErrors;
        }
      });
    }, 0);

    if (!touched[name]) {
      setTimeout(() => {
        setTouched(prev => ({ ...prev, [name]: true }));
      }, 0);
    }

    if (name === 'tipoDocumento') {
      // Limpiar el campo nit cuando se cambia el tipo de documento
      setTimeout(() => {
        setValues(prev => ({ ...prev, nit: '' }));
        setErrors(prev => {
          const { nit: removed, ...newErrors } = prev;
          return newErrors;
        });
      }, 0);
    }

    if (name === 'tipoEntidad' && previousTipoEntidad !== value && !isEditing) {
      setTimeout(() => {
        // Limpiar TODOS los touched y errores al cambiar tipo de entidad (solo en modo crear)
        setTouched({});
        setErrors({});
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
        const { [name]: removed, ...newErrors } = prev;
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
    setOriginalValues(initialValues);
  };

  const updateOriginalValues = (newValues) => {
    setOriginalValues(newValues);
  };

  const resetValidation = () => {
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
    resetValidation,
    touchAllFields,
    updateOriginalValues
  };
};