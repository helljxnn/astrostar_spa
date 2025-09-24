import { useState } from "react";

export const useFormUserValidation = (initialValues, validationRules) => {
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

export const userValidationRules = {
  nombre: [
    (value) => (!value?.trim() ? "El nombre es obligatorio" : ""),
    (value) =>
      value?.trim().length < 2 ? "El nombre debe tener al menos 2 caracteres" : "",
    (value) =>
      value?.trim().length > 50 ? "El nombre no puede exceder 50 caracteres" : "",
    (value) =>
      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value?.trim() || "")
        ? "El nombre solo puede contener letras y espacios"
        : "",
    (value) => {
      const trimmed = value?.trim() || "";
      return /\s{2,}/.test(trimmed) ? "No se permiten espacios dobles" : "";
    }
  ],
  
  apellido: [
    (value) => (!value?.trim() ? "El apellido es obligatorio" : ""),
    (value) =>
      value?.trim().length < 2 ? "El apellido debe tener al menos 2 caracteres" : "",
    (value) =>
      value?.trim().length > 50 ? "El apellido no puede exceder 50 caracteres" : "",
    (value) =>
      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value?.trim() || "")
        ? "El apellido solo puede contener letras y espacios"
        : "",
    (value) => {
      const trimmed = value?.trim() || "";
      return /\s{2,}/.test(trimmed) ? "No se permiten espacios dobles" : "";
    }
  ],

  tipoDocumento: [(value) => (!value ? "Debe seleccionar un tipo de documento" : "")],

  identificacion: [
    (value) => (!value?.trim() ? "La identificación es obligatoria" : ""),
    (value) => {
      const cleaned = value?.trim().replace(/\s/g, '') || "";
      return !/^\d+$/.test(cleaned) ? "La identificación debe contener solo números" : "";
    },
    (value, allValues) => {
      const cleaned = value?.trim().replace(/\s/g, '') || "";
      const tipoDoc = allValues?.tipoDocumento;
      
      if (!tipoDoc || !cleaned) return "";
      
      // Validaciones específicas por tipo de documento colombiano
      switch (tipoDoc) {
        case "CC": // Cédula de Ciudadanía
          if (cleaned.length < 6 || cleaned.length > 10) {
            return "La cédula debe tener entre 6 y 10 dígitos";
          }
          break;
        case "TI": // Tarjeta de Identidad
          if (cleaned.length < 10 || cleaned.length > 11) {
            return "La tarjeta de identidad debe tener entre 10 y 11 dígitos";
          }
          break;
        case "CE": // Cédula de Extranjería
          if (cleaned.length < 6 || cleaned.length > 12) {
            return "La cédula de extranjería debe tener entre 6 y 12 dígitos";
          }
          break;
        case "PAS": // Pasaporte
          if (cleaned.length < 6 || cleaned.length > 15) {
            return "El pasaporte debe tener entre 6 y 15 caracteres";
          }
          // Los pasaportes pueden tener letras y números
          if (!/^[A-Z0-9]+$/i.test(value?.trim() || "")) {
            return "El pasaporte solo puede contener letras y números";
          }
          break;
      }
      return "";
    }
  ],

  rol: [(value) => (!value ? "Debe seleccionar un rol" : "")],

  correo: [
    (value) => (!value?.trim() ? "El correo es obligatorio" : ""),
    (value) => {
      const email = value?.trim() || "";
      // Validación más estricta de email
      const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-])*[a-zA-Z0-9]@[a-zA-Z0-9]([a-zA-Z0-9.-])*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      return !emailRegex.test(email) ? "El correo electrónico no es válido" : "";
    },
    (value) => {
      const email = value?.trim() || "";
      return email.length > 100 ? "El correo no puede exceder 100 caracteres" : "";
    },
    (value) => {
      const email = value?.trim() || "";
      // Verificar dominios comunes malformados
      const commonDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'live.com'];
      const domain = email.split('@')[1]?.toLowerCase();
      if (domain && commonDomains.includes(domain.replace(/[^a-z.]/g, ''))) {
        return !commonDomains.includes(domain) ? `¿Quisiste decir @${domain.replace(/[^a-z.]/g, '')}?` : "";
      }
      return "";
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
        return ""; // Celular colombiano válido (se agregará +57 automáticamente)
      }
      
      if (cleanPhone.length === 7 && /^[2-8]/.test(cleanPhone)) {
        return ""; // Teléfono fijo colombiano válido (se agregará +57 automáticamente)
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

  estado: [(value) => (!value ? "Debe seleccionar un estado" : "")]
};