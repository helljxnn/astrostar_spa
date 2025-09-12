import { useState } from "react";

export const useFormProviderValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    for (const rule of rules) {
      const error = rule(value, values);
      if (error) return error;
    }
    return '';
  };

  const validateAllFields = () => {
    const newErrors = {};
    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) newErrors[name] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (nameOrEvent, value) => {
    let name, val;
    
    // Detectar si es un evento o parámetros directos
    if (typeof nameOrEvent === 'string') {
      // Llamada directa: onChange(name, value)
      name = nameOrEvent;
      val = value;
    } else {
      // Evento: onChange(event)
      name = nameOrEvent.target.name;
      val = nameOrEvent.target.value;
    }

    setValues(prev => ({ ...prev, [name]: val }));

    if (touched[name]) {
      const error = validateField(name, val);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (nameOrEvent) => {
    let name;
    
    // Detectar si es un evento o nombre directo
    if (typeof nameOrEvent === 'string') {
      // Llamada directa: onBlur(name)
      name = nameOrEvent;
    } else if (nameOrEvent && nameOrEvent.target) {
      // Evento: onBlur(event)
      name = nameOrEvent.target.name;
    } else {
      // Llamada sin parámetros: onBlur()
      return;
    }

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

export const providerValidationRules = {
  razonSocial: [
    (value) => (!value?.trim() ? "La razón social es obligatoria" : ""),
    (value) => value?.trim().length < 3 ? "La razón social debe tener al menos 3 caracteres" : "",
    (value) => value?.trim().length > 100 ? "La razón social no puede exceder 100 caracteres" : "",
    (value) => {
      const trimmed = value?.trim() || "";
      return /\s{2,}/.test(trimmed) ? "No se permiten espacios dobles" : "";
    }
  ],
  
  nit: [
    (value) => (!value?.trim() ? "El NIT es obligatorio" : ""),
    (value) => {
      const cleaned = value?.trim().replace(/[\s.-]/g, '') || "";
      return !/^\d{8,15}$/.test(cleaned) ? "El NIT debe contener entre 8 y 15 dígitos" : "";
    },
    (value) => {
      const cleaned = value?.trim().replace(/[\s.-]/g, '') || "";
      // Validación básica de NIT colombiano
      if (cleaned.length >= 8 && cleaned.length <= 15) {
        const digits = cleaned.split('').map(Number);
        if (digits.some(isNaN)) {
          return "El NIT debe contener solo números";
        }
      }
      return "";
    }
  ],

  tipoProveedor: [
    (value) => (!value ? "Debe seleccionar un tipo de proveedor" : "")
  ],

  contactoPrincipal: [
    (value) => (!value?.trim() ? "El contacto principal es obligatorio" : ""),
    (value) => value?.trim().length < 2 ? "El contacto debe tener al menos 2 caracteres" : "",
    (value) => value?.trim().length > 80 ? "El contacto no puede exceder 80 caracteres" : "",
    (value) => !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value?.trim() || "") ? "El contacto solo puede contener letras y espacios" : "",
    (value) => {
      const trimmed = value?.trim() || "";
      return /\s{2,}/.test(trimmed) ? "No se permiten espacios dobles" : "";
    }
  ],

  correo: [
    (value) => (!value?.trim() ? "El correo es obligatorio" : ""),
    (value) => {
      const email = value?.trim() || "";
      // Validación más estricta de email corporativo
      const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-])*[a-zA-Z0-9]@[a-zA-Z0-9]([a-zA-Z0-9.-])*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      return !emailRegex.test(email) ? "El correo electrónico no es válido" : "";
    },
    (value) => {
      const email = value?.trim() || "";
      return email.length > 100 ? "El correo no puede exceder 100 caracteres" : "";
    }
  ],

  telefono: [
    (value) => (!value?.trim() ? "El número telefónico es obligatorio" : ""),
    (value) => {
      let phone = value?.trim() || "";
      // Limpiar el número removiendo espacios, guiones y paréntesis
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
      
      // Si ya tiene +57 o 57 al inicio, validar como está
      if (cleanPhone.startsWith('+57') || cleanPhone.startsWith('57')) {
        const localNumber = cleanPhone.replace(/^(\+57|57)/, '');
        // Validar número local después del código de país
        if (localNumber.length === 10 && /^3/.test(localNumber)) {
          return ""; // Celular válido
        }
        if (localNumber.length === 7 && /^[2-8]/.test(localNumber)) {
          return ""; // Fijo válido
        }
        return "Número inválido. Celular: 3XXXXXXXXX (10 dígitos), Fijo: 2XXXXXXX-8XXXXXXX (7 dígitos)";
      }

      // Si no tiene código de país, asumir que es número local colombiano
      if (!/^\d+$/.test(cleanPhone)) {
        return "El teléfono solo puede contener números";
      }

      // Validar número local (se asume +57 automáticamente)
      if (cleanPhone.length === 10 && /^3/.test(cleanPhone)) {
        return ""; // Celular colombiano válido
      }
      if (cleanPhone.length === 7 && /^[2-8]/.test(cleanPhone)) {
        return ""; // Teléfono fijo colombiano válido
      }

      // Mensajes de error específicos
      if (cleanPhone.length < 7) {
        return "El número debe tener al menos 7 dígitos";
      }
      if (cleanPhone.length > 10) {
        return "Número demasiado largo. Máximo 10 dígitos para celular";
      }
      if (cleanPhone.length === 10 && !/^3/.test(cleanPhone)) {
        return "Los números celulares deben iniciar con 3";
      }
      if (cleanPhone.length === 7 && !/^[2-8]/.test(cleanPhone)) {
        return "Los números fijos deben iniciar con 2, 3, 4, 5, 6, 7 u 8";
      }
      if (cleanPhone.length === 8 || cleanPhone.length === 9) {
        return "Longitud inválida. Use 7 dígitos (fijo) o 10 dígitos (celular)";
      }

      return "Formato de teléfono inválido";
    }
  ],

  direccion: [
    (value) => (!value?.trim() ? "La dirección es obligatoria" : ""),
    (value) => value?.trim().length < 10 ? "La dirección debe tener al menos 10 caracteres" : "",
    (value) => value?.trim().length > 200 ? "La dirección no puede exceder 200 caracteres" : "",
    (value) => {
      const trimmed = value?.trim() || "";
      return /\s{2,}/.test(trimmed) ? "No se permiten espacios dobles" : "";
    }
  ],

  ciudad: [
    (value) => (!value?.trim() ? "La ciudad es obligatoria" : ""),
    (value) => value?.trim().length < 2 ? "La ciudad debe tener al menos 2 caracteres" : "",
    (value) => value?.trim().length > 50 ? "La ciudad no puede exceder 50 caracteres" : "",
    (value) => !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value?.trim() || "") ? "La ciudad solo puede contener letras y espacios" : "",
    (value) => {
      const trimmed = value?.trim() || "";
      return /\s{2,}/.test(trimmed) ? "No se permiten espacios dobles" : "";
    }
  ],

  descripcion: [
    (value) => {
      if (!value?.trim()) return ""; // Opcional
      return value.trim().length > 500 ? "La descripción no puede exceder 500 caracteres" : "";
    },
    (value) => {
      if (!value?.trim()) return "";
      const trimmed = value.trim();
      return /\s{2,}/.test(trimmed) ? "No se permiten espacios dobles" : "";
    }
  ],

  estado: [
    (value) => (!value ? "Debe seleccionar un estado" : "")
  ]
};