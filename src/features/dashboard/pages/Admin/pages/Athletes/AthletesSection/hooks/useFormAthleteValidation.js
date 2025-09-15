import { useState } from "react";

// Funciones auxiliares de validación
const hasDoubleSpaces = (value) => /\s{2,}/.test(value);
const isOnlyLetters = (value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
const isValidEmail = (email) => /^[a-zA-Z0-9]([a-zA-Z0-9._-])*[a-zA-Z0-9]@[a-zA-Z0-9]([a-zA-Z0-9.-])*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(email);
const cleanPhone = (phone) => phone.replace(/[\s\-\(\)]/g, '');
const isOnlyNumbers = (value) => /^\d+$/.test(value);

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

// Validación de documento de identidad
const validateDocument = (value, tipoDocumento) => {
  if (!value?.trim()) return "El número de documento es obligatorio";
  
  const doc = value.trim().replace(/[\s.-]/g, '');
  
  switch (tipoDocumento) {
    case 'cedula':
      if (!/^\d{6,10}$/.test(doc)) return "La cédula debe tener entre 6 y 10 dígitos";
      break;
    case 'tarjeta_identidad':
      if (!/^\d{10,11}$/.test(doc)) return "La tarjeta de identidad debe tener 10 u 11 dígitos";
      break;
    case 'cedula_extranjeria':
      if (!/^\d{6,12}$/.test(doc)) return "La cédula de extranjería debe tener entre 6 y 12 dígitos";
      break;
    case 'pasaporte':
      if (!/^[A-Z0-9]{6,9}$/.test(doc.toUpperCase())) return "El pasaporte debe tener entre 6 y 9 caracteres alfanuméricos";
      break;
    default:
      if (!/^[A-Z0-9]{6,12}$/i.test(doc)) return "Formato de documento inválido";
  }
  
  return "";
};

// Validación de edad vs fecha de nacimiento
const validateAgeAndBirthDate = (edad, fechaNacimiento) => {
  if (!edad || !fechaNacimiento) return "";
  
  const birthDate = new Date(fechaNacimiento);
  const today = new Date();
  const calculatedAge = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
  
  if (Math.abs(calculatedAge - parseInt(edad)) > 1) {
    return "La edad no coincide con la fecha de nacimiento";
  }
  
  return "";
};

// Hook optimizado para atletas
export const useFormAthleteValidation = (initialValues, validationRules) => {
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

// Reglas de validación específicas para atletas
export const athleteValidationRules = {
  nombres: [
    (v) => !v?.trim() ? "El nombre es obligatorio" : "",
    (v) => v?.trim().length < 2 ? "El nombre debe tener al menos 2 caracteres" : "",
    (v) => v?.trim().length > 80 ? "El nombre no puede exceder 80 caracteres" : "",
    (v) => !isOnlyLetters(v?.trim()) ? "El nombre solo puede contener letras y espacios" : "",
    (v) => hasDoubleSpaces(v) ? "No se permiten espacios dobles" : ""
  ],
  tipoDocumento: [
    (v) => !v ? "Debe seleccionar un tipo de documento" : ""
  ],
  numeroDocumento: [
    (v, values) => validateDocument(v, values?.tipoDocumento)
  ],
  correo: [
    (v) => !v?.trim() ? "El correo es obligatorio" : "",
    (v) => !isValidEmail(v?.trim() || "") ? "El correo electrónico no es válido" : "",
    (v) => (v?.trim() || "").length > 100 ? "El correo no puede exceder 100 caracteres" : ""
  ],
  telefono: [validatePhone],
  edad: [
    (v) => !v || isNaN(parseInt(v)) ? "La edad es obligatoria" : "",
    (v) => {
      const edad = parseInt(v);
      if (isNaN(edad)) return "";
      if (edad < 12) return "La edad mínima es 12 años";
      if (edad > 65) return "La edad máxima es 65 años";
      return "";
    },
    (v, values) => validateAgeAndBirthDate(v, values?.fechaNacimiento)
  ],
  fechaNacimiento: [
    (v) => !v ? "La fecha de nacimiento es obligatoria" : "",
    (v) => {
      if (!v) return "";
      const birthDate = new Date(v);
      const today = new Date();
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 65);
      const maxDate = new Date();
      maxDate.setFullYear(today.getFullYear() - 12);
      
      if (birthDate < minDate) return "La fecha de nacimiento no puede ser anterior a 65 años";
      if (birthDate > maxDate) return "La fecha de nacimiento debe corresponder a una persona mayor de 12 años";
      if (birthDate > today) return "La fecha de nacimiento no puede ser futura";
      return "";
    },
    (v, values) => validateAgeAndBirthDate(values?.edad, v)
  ],
  categoria: [
    (v) => !v ? "Debe seleccionar una categoría" : ""
  ],
  estado: [
    (v) => !v ? "Debe seleccionar un estado" : ""
  ],
  deportes: [
    (v) => !v ? "Debe seleccionar al menos un deporte" : ""
  ]
};