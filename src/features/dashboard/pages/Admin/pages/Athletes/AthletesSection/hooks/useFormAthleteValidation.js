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

// Validación de documento de identidad (igual que proveedores y empleados)
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
  
  // Validación genérica para otros tipos
  if (value.length > 20) {
    return "El documento no puede exceder los 20 caracteres.";
  }
  
  return '';
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

// Reglas de validación específicas para atletas (EXACTAMENTE IGUALES A EMPLEADOS)
export const athleteValidationRules = {
  firstName: [
    (value) => (!value?.trim() ? "El nombre es obligatorio" : ""),
    (value) => value?.length < 2 ? "El nombre debe tener al menos 2 caracteres" : "",
    (value) =>
      !/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(value || "") ? "Solo se permiten letras" : "",
  ],
  middleName: [
    (value) => {
      if (!value) return ""; // Campo opcional
      return !/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]*$/.test(value) ? "Solo se permiten letras" : "";
    },
  ],
  lastName: [
    (value) => (!value?.trim() ? "El apellido es obligatorio" : ""),
    (value) => value?.length < 2 ? "El apellido debe tener al menos 2 caracteres" : "",
    (value) =>
      !/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(value || "") ? "Solo se permiten letras" : "",
  ],
  secondLastName: [
    (value) => {
      if (!value) return ""; // Campo opcional
      return !/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]*$/.test(value) ? "Solo se permiten letras" : "";
    },
  ],
  documentTypeId: [(value) => (!value ? "Debe seleccionar el tipo de documento" : "")],
  identification: [
    (value) => (!value?.trim() ? "La identificación es obligatoria" : ""),
    (value) => value?.length < 6 ? "La identificación debe tener al menos 6 caracteres" : "",
    (value) => !/^[0-9A-Za-z\-]+$/.test(value || "") ? "Solo números, letras y guiones" : "",
  ],
  email: [
    (value) => (!value?.trim() ? "El correo es obligatorio" : ""),
    (value) =>
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "") ? "Formato de correo inválido" : "",
  ],
  phoneNumber: [
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
  birthDate: [
    (value) => (!value ? "La fecha de nacimiento es obligatoria" : ""),
    (value) => {
      if (!value) return "";
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      // Para deportistas, validar edad mínima de 5 años
      return age < 5 ? "Debe tener al menos 5 años" : "";
    },
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