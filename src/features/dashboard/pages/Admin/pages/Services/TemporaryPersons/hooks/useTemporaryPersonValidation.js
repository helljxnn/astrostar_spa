/**
 * Hook personalizado para validaciones de personas temporales
 * Centraliza todas las validaciones del frontend
 */

import { useState, useCallback } from 'react';
import temporaryPersonsService from '../services/temporaryPersonsService';

export const useTemporaryPersonValidation = () => {
  const [validationErrors, setValidationErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  // Reglas de validación centralizadas
  const validationRules = {
    firstName: (value) => {
      if (!value || !value.trim()) return "El nombre es requerido";
      if (value.length < 2) return "El nombre debe tener al menos 2 caracteres";
      if (value.length > 100) return "El nombre no puede exceder 100 caracteres";
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return "El nombre solo puede contener letras y espacios";
      return "";
    },
    
    lastName: (value) => {
      if (!value || !value.trim()) return "El apellido es requerido";
      if (value.length < 2) return "El apellido debe tener al menos 2 caracteres";
      if (value.length > 100) return "El apellido no puede exceder 100 caracteres";
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return "El apellido solo puede contener letras y espacios";
      return "";
    },
    
    personType: (value) => {
      if (!value) return "El tipo de persona es requerido";
      const validTypes = ['Deportista', 'Entrenador', 'Participante'];
      if (!validTypes.includes(value)) return "Tipo de persona no válido";
      return "";
    },
    
    email: (value) => {
      if (value && value.trim()) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "El formato del email no es válido";
        }
        if (value.length > 150) {
          return "El email no puede exceder 150 caracteres";
        }
      }
      return "";
    },
    
    phone: (value) => {
      if (value && value.trim()) {
        // Validar formato: +57 seguido de 10 dígitos o solo 10 dígitos
        const phoneWithCode = /^\+57\s?\d{10}$/; // +57 3225658901 o +573225658901
        const phoneWithoutCode = /^\d{10}$/; // 3226758060
        
        if (!phoneWithCode.test(value) && !phoneWithoutCode.test(value)) {
          return "Ingrese un número válido: 10 dígitos (ej: 3225658901) o con indicativo (ej: +57 3225658901)";
        }
      }
      return "";
    },
    
    identification: (value) => {
      if (value && value.trim()) {
        if (value.length < 6) {
          return "La identificación debe tener al menos 6 caracteres";
        }
        if (value.length > 50) {
          return "La identificación no puede exceder 50 caracteres";
        }
        if (!/^[a-zA-Z0-9\-]+$/.test(value)) {
          return "La identificación solo puede contener letras, números y guiones";
        }
      }
      return "";
    },
    
    birthDate: (value) => {
      if (value && value.trim()) {
        const birthDate = new Date(value);
        if (isNaN(birthDate.getTime())) {
          return "Fecha de nacimiento no válida";
        }
        
        const today = new Date();
        const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
        const maxDate = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
        
        if (birthDate < minDate) {
          return "La fecha de nacimiento no puede ser anterior a 120 años";
        }
        if (birthDate > maxDate) {
          return "La persona debe tener al menos 5 años de edad";
        }
      }
      return "";
    },
    
    address: (value) => {
      if (value && value.trim() && value.length > 200) {
        return "La dirección no puede exceder 200 caracteres";
      }
      return "";
    },
    
    team: (value, allValues) => {
      const personType = allValues?.personType;
      if ((personType === 'Deportista' || personType === 'Entrenador') && value && value.trim() === '') {
        return "Si se especifica un equipo, no puede estar vacío";
      }
      if (value && value.length > 100) {
        return "El nombre del equipo no puede exceder 100 caracteres";
      }
      return "";
    },
    
    category: (value, allValues) => {
      const personType = allValues?.personType;
      if ((personType === 'Deportista' || personType === 'Entrenador') && value && value.trim() === '') {
        return "Si se especifica una categoría, no puede estar vacía";
      }
      if (value && value.length > 100) {
        return "La categoría no puede exceder 100 caracteres";
      }
      return "";
    },
    
    documentTypeId: (value) => {
      if (value && (isNaN(parseInt(value)) || parseInt(value) < 1)) {
        return "Tipo de documento no válido";
      }
      return "";
    }
  };

  // Validar un campo específico
  const validateField = useCallback((fieldName, value, allValues = {}) => {
    const rule = validationRules[fieldName];
    if (!rule) return "";
    
    return rule(value, allValues);
  }, []);

  // Validar todos los campos
  const validateAllFields = useCallback((formData) => {
    const errors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName], formData);
      if (error) {
        errors[fieldName] = error;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return { isValid, errors };
  }, [validateField]);

  // Validar unicidad de identificación
  const validateIdentificationUniqueness = useCallback(async (identification, excludeId = null) => {
    if (!identification || !identification.trim()) return { isUnique: true, message: "" };

    setIsValidating(true);
    try {
      const response = await temporaryPersonsService.checkIdentificationAvailability(identification, excludeId);
      const isUnique = response.data.available;
      const message = isUnique ? "" : "Este número de documento ya está en uso";
      
      setValidationErrors(prev => ({
        ...prev,
        identification: message
      }));

      return { isUnique, message };
    } catch (error) {
      console.error('Error validating identification uniqueness:', error);
      return { isUnique: true, message: "" };
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Validar unicidad de email
  const validateEmailUniqueness = useCallback(async (email, excludeId = null) => {
    if (!email || !email.trim()) return { isUnique: true, message: "" };

    setIsValidating(true);
    try {
      const response = await temporaryPersonsService.checkEmailAvailability(email, excludeId);
      const isUnique = response.data.available;
      const message = isUnique ? "" : "Este email ya está en uso";
      
      setValidationErrors(prev => ({
        ...prev,
        email: message
      }));

      return { isUnique, message };
    } catch (error) {
      console.error('Error validating email uniqueness:', error);
      return { isUnique: true, message: "" };
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Validar lógica de negocio
  const validateBusinessLogic = useCallback((formData) => {
    const errors = [];

    // Validar coherencia entre fecha de nacimiento y edad
    if (formData.birthDate && formData.age) {
      const calculatedAge = calculateAge(formData.birthDate);
      if (Math.abs(calculatedAge - parseInt(formData.age)) > 1) {
        errors.push('La edad proporcionada no coincide con la fecha de nacimiento');
      }
    }

    // Validar que deportistas y entrenadores tengan información coherente
    if (formData.personType === 'Deportista' || formData.personType === 'Entrenador') {
      if (formData.team && formData.team.trim() === '') {
        errors.push('Si se especifica un equipo, no puede estar vacío');
      }
      if (formData.category && formData.category.trim() === '') {
        errors.push('Si se especifica una categoría, no puede estar vacía');
      }
    }

    return errors;
  }, []);

  // Validación completa antes del envío
  const validateForSubmission = useCallback(async (formData, excludeId = null) => {
    // Validar campos básicos
    const { isValid, errors } = validateAllFields(formData);
    
    if (!isValid) {
      return {
        isValid: false,
        errors,
        message: "Por favor, corrija los errores en el formulario"
      };
    }

    // Validar lógica de negocio
    const businessErrors = validateBusinessLogic(formData);
    if (businessErrors.length > 0) {
      return {
        isValid: false,
        errors: {},
        message: businessErrors.join('. ')
      };
    }

    // Validar unicidad de campos críticos
    const uniquenessChecks = [];
    
    if (formData.identification) {
      uniquenessChecks.push(validateIdentificationUniqueness(formData.identification, excludeId));
    }
    
    if (formData.email) {
      uniquenessChecks.push(validateEmailUniqueness(formData.email, excludeId));
    }

    if (uniquenessChecks.length > 0) {
      const results = await Promise.all(uniquenessChecks);
      const uniquenessErrors = results.filter(result => !result.isUnique);
      
      if (uniquenessErrors.length > 0) {
        return {
          isValid: false,
          errors: {},
          message: uniquenessErrors.map(error => error.message).join('. ')
        };
      }
    }

    return {
      isValid: true,
      errors: {},
      message: ""
    };
  }, [validateAllFields, validateBusinessLogic, validateIdentificationUniqueness, validateEmailUniqueness]);

  // Limpiar errores de validación
  const clearValidationErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  // Limpiar error de un campo específico
  const clearFieldError = useCallback((fieldName) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  return {
    validationErrors,
    isValidating,
    validateField,
    validateAllFields,
    validateIdentificationUniqueness,
    validateEmailUniqueness,
    validateBusinessLogic,
    validateForSubmission,
    clearValidationErrors,
    clearFieldError
  };
};

// Función auxiliar para calcular edad
function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age >= 0 ? age : 0;
}

export default useTemporaryPersonValidation;