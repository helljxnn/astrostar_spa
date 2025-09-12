import { useState } from "react";

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

export const athleteValidationRules = {
  nombres: [
    (value) => (!value?.trim() ? "Los nombres son obligatorios" : ""),
    (value) => value?.trim().length < 2 ? "Los nombres deben tener al menos 2 caracteres" : "",
    (value) => value?.trim().length > 50 ? "Los nombres no pueden exceder 50 caracteres" : "",
    (value) => !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value?.trim() || "") ? "Los nombres solo pueden contener letras y espacios" : "",
    (value) => {
      const trimmed = value?.trim() || "";
      return /\s{2,}/.test(trimmed) ? "No se permiten espacios dobles" : "";
    }
  ],

  apellidos: [
    (value) => (!value?.trim() ? "Los apellidos son obligatorios" : ""),
    (value) => value?.trim().length < 2 ? "Los apellidos deben tener al menos 2 caracteres" : "",
    (value) => value?.trim().length > 50 ? "Los apellidos no pueden exceder 50 caracteres" : "",
    (value) => !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value?.trim() || "") ? "Los apellidos solo pueden contener letras y espacios" : "",
    (value) => {
      const trimmed = value?.trim() || "";
      return /\s{2,}/.test(trimmed) ? "No se permiten espacios dobles" : "";
    }
  ],

  tipoDocumento: [
    (value) => (!value ? "Debe seleccionar un tipo de documento" : "")
  ],

  numeroDocumento: [
    (value) => (!value?.trim() ? "El número de documento es obligatorio" : ""),
    (value, allValues) => {
      const cleaned = value?.trim() || "";
      const tipoDoc = allValues.tipoDocumento;
      
      if (tipoDoc === "cedula") {
        return !/^\d{7,10}$/.test(cleaned) ? "La cédula debe tener entre 7 y 10 dígitos" : "";
      }
      if (tipoDoc === "tarjeta_identidad") {
        return !/^\d{10,11}$/.test(cleaned) ? "La tarjeta de identidad debe tener entre 10 y 11 dígitos" : "";
      }
      if (tipoDoc === "cedula_extranjeria") {
        return !/^\d{6,12}$/.test(cleaned) ? "La cédula de extranjería debe tener entre 6 y 12 dígitos" : "";
      }
      if (tipoDoc === "pasaporte") {
        return !/^[A-Z0-9]{6,12}$/.test(cleaned.toUpperCase()) ? "El pasaporte debe tener entre 6 y 12 caracteres alfanuméricos" : "";
      }
      return "";
    }
  ],

  fechaNacimiento: [
    (value) => (!value ? "La fecha de nacimiento es obligatoria" : ""),
    (value) => {
      if (!value) return "";
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 12) return "El deportista debe tener al menos 12 años";
      if (age > 65) return "La edad máxima permitida es 65 años";
      return "";
    }
  ],

  genero: [
    (value) => (!value ? "Debe seleccionar el género" : "")
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

  correo: [
    (value) => (!value?.trim() ? "El correo es obligatorio" : ""),
    (value) => {
      const email = value?.trim() || "";
      const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-])*[a-zA-Z0-9]@[a-zA-Z0-9]([a-zA-Z0-9.-])*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      return !emailRegex.test(email) ? "El correo electrónico no es válido" : "";
    },
    (value) => {
      const email = value?.trim() || "";
      return email.length > 100 ? "El correo no puede exceder 100 caracteres" : "";
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

  deportePrincipal: [
    (value) => (!value ? "Debe seleccionar el deporte principal" : "")
  ],

  categoria: [
    (value) => (!value ? "Debe seleccionar una categoría" : "")
  ],

  posicion: [
    (value) => (!value?.trim() ? "La posición es obligatoria" : ""),
    (value) => value?.trim().length < 2 ? "La posición debe tener al menos 2 caracteres" : "",
    (value) => value?.trim().length > 50 ? "La posición no puede exceder 50 caracteres" : ""
  ],

  equipoClub: [
    (value) => (!value?.trim() ? "El equipo/club es obligatorio" : ""),
    (value) => value?.trim().length < 2 ? "El equipo/club debe tener al menos 2 caracteres" : "",
    (value) => value?.trim().length > 100 ? "El equipo/club no puede exceder 100 caracteres" : ""
  ],

  peso: [
    (value) => (!value || isNaN(parseFloat(value)) ? "El peso es obligatorio y debe ser un número" : ""),
    (value) => {
      const peso = parseFloat(value);
      if (isNaN(peso)) return "";
      if (peso < 30) return "El peso mínimo es 30 kg";
      if (peso > 200) return "El peso máximo es 200 kg";
      return "";
    }
  ],

  estatura: [
    (value) => (!value || isNaN(parseFloat(value)) ? "La estatura es obligatoria y debe ser un número" : ""),
    (value) => {
      const estatura = parseFloat(value);
      if (isNaN(estatura)) return "";
      if (estatura < 1.20) return "La estatura mínima es 1.20 m";
      if (estatura > 2.50) return "La estatura máxima es 2.50 m";
      return "";
    }
  ],

  contactoEmergencia: [
    (value) => (!value?.trim() ? "El contacto de emergencia es obligatorio" : ""),
    (value) => value?.trim().length < 5 ? "El contacto debe tener al menos 5 caracteres" : "",
    (value) => value?.trim().length > 100 ? "El contacto no puede exceder 100 caracteres" : ""
  ],

  observaciones: [
    (value) => {
      if (!value?.trim()) return ""; 
      return value.trim().length > 500 ? "Las observaciones no pueden exceder 500 caracteres" : "";
    }
  ],

  estado: [
    (value) => (!value ? "Debe seleccionar un estado" : "")
  ]
};