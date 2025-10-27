import { useState } from "react";

// Funciones auxiliares de validación
const hasDoubleSpaces = (value) => /\s{2,}/.test(value);
const isOnlyLetters = (value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
const isValidEmail = (email) => /^[a-zA-Z0-9]([a-zA-Z0-9._-])*[a-zA-Z0-9]@[a-zA-Z0-9]([a-zA-Z0-9.-])*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(email);
const cleanPhone = (phone) => phone.replace(/[\s\-\(\)]/g, '');

// Validación teléfono colombiano
const validatePhone = (value) => {
  if (!value?.trim()) return "El número telefónico es obligatorio";
  const phone = cleanPhone(value);
  
  if (phone.startsWith('+57') || phone.startsWith('57')) {
    const local = phone.replace(/^(\+57|57)/, '');
    if ((local.length === 10 && /^3/.test(local)) || (local.length === 7 && /^[2-8]/.test(local))) return "";
    return "Número inválido. Celular: 3XXXXXXXXX, Fijo: 2XXXXXXX-8XXXXXXX";
  }

  if (!/^\d+$/.test(phone)) return "El teléfono solo puede contener números";
  if ((phone.length === 10 && /^3/.test(phone)) || (phone.length === 7 && /^[2-8]/.test(phone))) return "";
  if (phone.length < 7) return "El número debe tener al menos 7 dígitos";
  if (phone.length > 10) return "Número demasiado largo. Máximo 10 dígitos para celular";
  if (phone.length === 10 && !/^3/.test(phone)) return "Los números celulares deben iniciar con 3";
  if (phone.length === 7 && !/^[2-8]/.test(phone)) return "Los números fijos deben iniciar con 2-8";
  if ([8,9].includes(phone.length)) return "Longitud inválida. Use 7 dígitos (fijo) o 10 dígitos (celular)";
  return "Formato de teléfono inválido";
};

// Función para verificar unicidad contra API
export const checkProviderUniqueness = async (field, value, excludeId = null) => {
  try {
    let url = '';
    
    if (field === 'nit') {
      url = `/api/providers/check-nit?nit=${encodeURIComponent(value)}`;
      if (excludeId) url += `&excludeId=${excludeId}`;
    }
    // Puedes agregar más verificaciones aquí para razón social y contacto
    
    const response = await fetch(url);
    const result = await response.json();
    
    return result.success ? result.data.available : false;
  } catch (error) {
    console.error('Error verificando unicidad:', error);
    return true; // En caso de error, permitir continuar
  }
};

// Hook optimizado
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
    Object.keys(validationRules).forEach(name => {
      // Saltar validación de tipoDocumento si es persona jurídica
      if (name === 'tipoDocumento' && values.tipoEntidad === 'juridica') {
        return;
      }
      
      const error = validateField(name, values[name]);
      if (error) newErrors[name] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (nameOrEvent, value) => {
    const { name, val } = typeof nameOrEvent === 'string'
      ? { name: nameOrEvent, val: value }
      : { name: nameOrEvent.target.name, val: nameOrEvent.target.value };

    setValues(prev => ({ ...prev, [name]: val }));

    if (touched[name]) {
      const error = validateField(name, val);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (nameOrEvent) => {
    const name = typeof nameOrEvent === 'string'
      ? nameOrEvent
      : nameOrEvent?.target?.name;
    if (!name) return;

    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return { values, errors, touched, handleChange, handleBlur, validateAllFields, setValues, setErrors, setTouched, resetForm };
};

// Reglas de validación usando funciones auxiliares
export const providerValidationRules = {
  razonSocial: [
    (v) => !v?.trim() ? "La razón social es obligatoria" : "",
    (v) => v?.trim().length < 3 ? "La razón social debe tener al menos 3 caracteres" : "",
    (v) => v?.trim().length > 200 ? "La razón social no puede exceder 200 caracteres" : "",
    (v) => hasDoubleSpaces(v) ? "No se permiten espacios dobles" : "",
  ],
  nit: [
    (v) => !v?.trim() ? "El NIT es obligatorio" : "",
    (v) => !/^\d{8,15}$/.test(v?.trim().replace(/[\s.-]/g, '')) ? "El NIT debe contener entre 8 y 15 dígitos" : ""
  ],
  tipoDocumento: [
    (v, values) => {
      // Solo validar si es persona natural
      if (values?.tipoEntidad === 'natural' && !v) {
        return "Debe seleccionar un tipo de documento";
      }
      return "";
    }
  ],
  contactoPrincipal: [
    (v) => !v?.trim() ? "El contacto principal es obligatorio" : "",
    (v) => v?.trim().length < 2 ? "El contacto debe tener al menos 2 caracteres" : "",
    (v) => v?.trim().length > 150 ? "El contacto no puede exceder 150 caracteres" : "",
    (v) => !isOnlyLetters(v) ? "El contacto solo puede contener letras y espacios" : "",
    (v) => hasDoubleSpaces(v) ? "No se permiten espacios dobles" : "",
  ],
  correo: [
    (v) => !v?.trim() ? "El correo es obligatorio" : "",
    (v) => !isValidEmail(v?.trim() || "") ? "El correo electrónico no es válido" : "",
    (v) => (v?.trim() || "").length > 150 ? "El correo no puede exceder 150 caracteres" : ""
  ],
  telefono: [validatePhone],
  direccion: [
    (v) => !v?.trim() ? "La dirección es obligatoria" : "",
    (v) => v?.trim().length < 10 ? "La dirección debe tener al menos 10 caracteres" : "",
    (v) => v?.trim().length > 200 ? "La dirección no puede exceder 200 caracteres" : "",
    (v) => hasDoubleSpaces(v) ? "No se permiten espacios dobles" : ""
  ],
  ciudad: [
    (v) => !v?.trim() ? "La ciudad es obligatoria" : "",
    (v) => v?.trim().length < 2 ? "La ciudad debe tener al menos 2 caracteres" : "",
    (v) => v?.trim().length > 100 ? "La ciudad no puede exceder 100 caracteres" : "",
    (v) => !isOnlyLetters(v) ? "La ciudad solo puede contener letras y espacios" : "",
    (v) => hasDoubleSpaces(v) ? "No se permiten espacios dobles" : ""
  ],
  descripcion: [
    (v) => !v?.trim() ? "" : v.trim().length > 500 ? "La descripción no puede exceder 500 caracteres" : "",
    (v) => !v?.trim() ? "" : hasDoubleSpaces(v) ? "No se permiten espacios dobles" : ""
  ],
  estado: [(v) => !v ? "Debe seleccionar un estado" : ""]
};