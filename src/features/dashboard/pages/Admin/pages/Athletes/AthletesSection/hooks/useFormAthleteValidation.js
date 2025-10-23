import { useState } from "react";

// Funciones auxiliares de validación
const hasDoubleSpaces = (value) => /\s{2,}/.test(value);
const isOnlyLetters = (value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
const isValidEmail = (email) => /^[a-zA-Z0-9]([a-zA-Z0-9._-])*[a-zA-Z0-9]@[a-zA-Z0-9]([a-zA-Z0-9.-])*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(email);
const cleanPhone = (phone) => phone.replace(/[\s\-\(\)]/g, '');
const isOnlyNumbers = (value) => /^\d+$/.test(value);

// Validación teléfono colombiano
const validatePhone = (value) => {
  if (!value?.trim()) return "";
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

// Validación de categoría
const isValidCategory = (value) => /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-()]+$/.test(value);

// Función auxiliar para calcular edad
const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const b = new Date(birthDate);
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) {
    age--;
  }
  return age;
};

// Hook optimizado para atletas
export const useFormAthleteValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value, allValues = values) => {
    const rules = validationRules[name];
    if (!rules) return '';
    
    // Si rules es un array de funciones
    if (Array.isArray(rules)) {
      for (const rule of rules) {
        const error = rule(value, allValues);
        if (error) return error;
      }
      return '';
    }
    
    // Si rules es un objeto con required
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return rules.message || `${name} es requerido`;
    }
    
    return '';
  };

  const validateAllFields = () => {
    const newErrors = {};
    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name], values);
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
    const error = validateField(name, values[name], values);
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
  telefono: [
    (v) => !v?.trim() ? "El número telefónico es obligatorio" : "",
    (v) => {
      if (!v?.trim()) return "";
      const phone = v.replace(/[\s\-\(\)]/g, '');
      if (phone.startsWith('+57') || phone.startsWith('57')) {
        const local = phone.replace(/^(\+57|57)/, '');
        if ((local.length === 10 && /^3/.test(local)) || (local.length === 7 && /^[2-8]/.test(local))) return "";
        return "Número inválido. Celular: 3XXXXXXXXX, Fijo: 2XXXXXXX-8XXXXXXX";
      }
      if (!/^\d+$/.test(phone)) return "El teléfono solo puede contener números";
      if ((phone.length === 10 && /^3/.test(phone)) || (phone.length === 7 && /^[2-8]/.test(phone))) return "";
      if (phone.length < 7) return "El número debe tener al menos 7 dígitos";
      if (phone.length > 10) return "Número demasiado largo. Máximo 10 dígitos para celular";
      return "Formato de teléfono inválido";
    }
  ],
  fechaNacimiento: [
    (v) => !v ? "La fecha de nacimiento es obligatoria" : "",
    (v) => {
      if (!v) return "";
      const birthDate = new Date(v);
      const today = new Date();
      if (birthDate > today) return "La fecha de nacimiento no puede ser futura";
      return "";
    }
  ],
  categoria: [
    (v) => !v?.trim() ? "La categoría es obligatoria" : "",
    (v) => v?.trim().length < 2 ? "La categoría debe tener al menos 2 caracteres" : "",
    (v) => v?.trim().length > 30 ? "La categoría no puede exceder 30 caracteres" : "",
    (v) => !isValidCategory(v?.trim()) ? "La categoría solo puede contener letras, números, espacios, guiones y paréntesis" : "",
    (v) => hasDoubleSpaces(v) ? "No se permiten espacios dobles" : ""
  ],
  estado: [
    (v) => !v ? "Debe seleccionar un estado" : ""
  ],
  acudiente: [
    (v, values) => {
      // Calcular si es menor de edad
      const age = calculateAge(values?.fechaNacimiento);
      const isMinor = age !== null && age < 18;
      const hasDateOfBirth = !!values?.fechaNacimiento;

      // Si no tiene fecha de nacimiento, no validar
      if (!hasDateOfBirth) return "";

      // Si es menor de edad, es obligatorio
      if (isMinor && !v) {
        return "Los menores de edad deben tener un acudiente asignado";
      }

      // Si es mayor de edad, es opcional
      return "";
    }
  ],
  conceptoInscripcion: [
    (v) => !v?.trim() ? "El concepto de estado es obligatorio" : "",
    (v) => v?.trim().length < 3 ? "El concepto debe tener al menos 3 caracteres" : "",
    (v) => v?.trim().length > 100 ? "El concepto no puede exceder 100 caracteres" : "",
    (v) => hasDoubleSpaces(v) ? "No se permiten espacios dobles" : ""
  ],
  fechaInscripcion: [
    (v) => !v ? "La fecha de inscripción es obligatoria" : ""
  ],
  estadoInscripcion: [
    (v) => !v ? "Debes seleccionar un estado de inscripción" : ""
  ],
  fechaConcepto: [
    (v) => !v ? "La fecha de concepto es obligatoria" : ""
  ],
};