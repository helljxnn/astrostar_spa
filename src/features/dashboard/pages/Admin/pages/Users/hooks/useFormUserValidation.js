import { useState } from "react";

// Funciones auxiliares
const hasDoubleSpaces = (value) => /\s{2,}/.test(value);
const isOnlyLetters = (value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
const isValidEmail = (email) =>
  /^[a-zA-Z0-9]([a-zA-Z0-9._-])*[a-zA-Z0-9]@[a-zA-Z0-9]([a-zA-Z0-9.-])*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(email);
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

// Hook optimizado
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
export const userValidationRules = {
  nombre: [
    (v) => !v?.trim() ? "El nombre es obligatorio" : "",
    (v) => v?.trim().length < 2 ? "El nombre debe tener al menos 2 caracteres" : "",
    (v) => v?.trim().length > 50 ? "El nombre no puede exceder 50 caracteres" : "",
    (v) => !isOnlyLetters(v) ? "El nombre solo puede contener letras y espacios" : "",
    (v) => hasDoubleSpaces(v) ? "No se permiten espacios dobles" : ""
  ],
  apellido: [
    (v) => !v?.trim() ? "El apellido es obligatorio" : "",
    (v) => v?.trim().length < 2 ? "El apellido debe tener al menos 2 caracteres" : "",
    (v) => v?.trim().length > 50 ? "El apellido no puede exceder 50 caracteres" : "",
    (v) => !isOnlyLetters(v) ? "El apellido solo puede contener letras y espacios" : "",
    (v) => hasDoubleSpaces(v) ? "No se permiten espacios dobles" : ""
  ],
  tipoDocumento: [(v) => !v ? "Debe seleccionar un tipo de documento" : ""],
  identificacion: [
    (v) => !v?.trim() ? "La identificación es obligatoria" : "",
    (v) => !/^\d+$/.test(v?.trim().replace(/\s/g,'')) ? "La identificación debe contener solo números" : "",
    (v, all) => {
      const cleaned = v?.trim().replace(/\s/g,'') || "";
      const tipoDoc = all?.tipoDocumento;
      if (!tipoDoc || !cleaned) return "";
      switch (tipoDoc) {
        case "CC": if (cleaned.length <6 || cleaned.length>10) return "La cédula debe tener entre 6 y 10 dígitos"; break;
        case "TI": if (cleaned.length <10 || cleaned.length>11) return "La tarjeta de identidad debe tener entre 10 y 11 dígitos"; break;
        case "CE": if (cleaned.length <6 || cleaned.length>12) return "La cédula de extranjería debe tener entre 6 y 12 dígitos"; break;
        case "PAS": 
          if (cleaned.length <6 || cleaned.length>15) return "El pasaporte debe tener entre 6 y 15 caracteres";
          if (!/^[A-Z0-9]+$/i.test(v?.trim()||"")) return "El pasaporte solo puede contener letras y números";
          break;
      }
      return "";
    }
  ],
  rol: [(v) => !v ? "Debe seleccionar un rol" : ""],
  correo: [
    (v) => !v?.trim() ? "El correo es obligatorio" : "",
    (v) => !isValidEmail(v?.trim()||"") ? "El correo electrónico no es válido" : "",
    (v) => (v?.trim()||"").length > 100 ? "El correo no puede exceder 100 caracteres" : "",
    (v) => {
      const email = v?.trim() || "";
      const commonDomains = ['gmail.com','hotmail.com','yahoo.com','outlook.com','live.com'];
      const domain = email.split('@')[1]?.toLowerCase();
      if(domain && commonDomains.includes(domain.replace(/[^a-z.]/g,''))){
        return !commonDomains.includes(domain) ? `¿Quisiste decir @${domain.replace(/[^a-z.]/g,'')}?` : "";
      }
      return "";
    }
  ],
  telefono: [validatePhone],
  estado: [(v) => !v ? "Debe seleccionar un estado" : ""]
};
