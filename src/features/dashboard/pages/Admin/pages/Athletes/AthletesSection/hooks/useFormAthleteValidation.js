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
    case 'CC':
      if (!/^\d{6,10}$/.test(doc)) return "La cédula debe tener entre 6 y 10 dígitos";
      break;
    case 'TI':
      if (!/^\d{10,11}$/.test(doc)) return "La tarjeta de identidad debe tener 10 u 11 dígitos";
      break;
    case 'CE':
      if (!/^\d{6,12}$/.test(doc)) return "La cédula de extranjería debe tener entre 6 y 12 dígitos";
      break;
    case 'PA':
      if (!/^[A-Z0-9]{6,9}$/.test(doc.toUpperCase())) return "El pasaporte debe tener entre 6 y 9 caracteres alfanuméricos";
      break;
    default:
      if (!/^[A-Z0-9]{6,12}$/i.test(doc)) return "Formato de documento inválido";
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
  apellidos: [
    (v) => !v?.trim() ? "Los apellidos son obligatorios" : "",
    (v) => v?.trim().length < 2 ? "Los apellidos deben tener al menos 2 caracteres" : "",
    (v) => v?.trim().length > 80 ? "Los apellidos no pueden exceder 80 caracteres" : "",
    (v) => !isOnlyLetters(v?.trim()) ? "Los apellidos solo pueden contener letras y espacios" : "",
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
  fechaNacimiento: [
    (v) => !v ? "La fecha de nacimiento es obligatoria" : "",
    (v) => {
      if (!v) return "";
      const birthDate = new Date(v);
      const today = new Date();
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 65);
      const maxDate = new Date();
      maxDate.setFullYear(today.getFullYear() - 5);
      
      if (birthDate < minDate) return "La fecha de nacimiento no puede ser anterior a 65 años";
      if (birthDate > maxDate) return "La fecha de nacimiento debe corresponder a una persona mayor de 5 años";
      if (birthDate > today) return "La fecha de nacimiento no puede ser futura";
      return "";
    }
  ],
  deportePrincipal: [
    (v) => !v?.trim() ? "El deporte principal es obligatorio" : "",
    (v) => v?.trim().length < 2 ? "El deporte debe tener al menos 2 caracteres" : "",
    (v) => v?.trim().length > 30 ? "El deporte no puede exceder 30 caracteres" : "",
    (v) => !isOnlyLetters(v?.trim()) ? "El deporte solo puede contener letras y espacios" : "",
    (v) => hasDoubleSpaces(v) ? "No se permiten espacios dobles" : ""
  ],
  categoria: [
    (v) => !v?.trim() ? "La categoría es obligatoria" : "",
    (v) => v?.trim().length < 2 ? "La categoría debe tener al menos 2 caracteres" : "",
    (v) => v?.trim().length > 30 ? "La categoría no puede exceder 30 caracteres" : "",
    (v) => !isOnlyLetters(v?.trim()) ? "La categoría solo puede contener letras y espacios" : "",
    (v) => hasDoubleSpaces(v) ? "No se permiten espacios dobles" : ""
  ],
  estado: [
    (v) => !v ? "Debe seleccionar un estado" : ""
  ],
  acudiente: [
  (v) => !v ? "Debes seleccionar un acudiente" : ""
],
estadoInscripcion: [
    (v) => !v ? "Debes seleccionar un estado de inscripción" : ""
  ],
  conceptoInscripcion: [
    (v) => !v?.trim() ? "El concepto de inscripción es obligatorio" : "",
    (v) => v?.trim().length < 3 ? "El concepto debe tener al menos 3 caracteres" : "",
    (v) => v?.trim().length > 100 ? "El concepto no puede exceder 100 caracteres" : "",
    (v) => hasDoubleSpaces(v) ? "No se permiten espacios dobles" : ""
  ],
  fechaInscripcion: [
    (v) => !v ? "La fecha de inscripción es obligatoria" : ""
  ],
  fechaConcepto: [
    (v) => !v ? "La fecha de concepto es obligatoria" : ""
  ],
};