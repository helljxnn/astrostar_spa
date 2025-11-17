/**
 * Reglas de validación para tipos de documento en Colombia
 */

export const documentValidationRules = {
  'Cédula de Ciudadanía': {
    minLength: 6,
    maxLength: 10,
    pattern: /^[0-9]+$/,
    errorMessageMin: 'La identificación debe tener al menos 6 caracteres',
    errorMessageMax: 'La identificación no puede exceder 10 caracteres',
    errorMessagePattern: 'La cédula solo debe contener números'
  },
  'Tarjeta de Identidad': {
    minLength: 10,
    maxLength: 11,
    pattern: /^[0-9]+$/,
    errorMessageMin: 'La identificación debe tener al menos 10 caracteres',
    errorMessageMax: 'La identificación no puede exceder 11 caracteres',
    errorMessagePattern: 'La tarjeta de identidad solo debe contener números'
  },
  'Cédula de Extranjería': {
    minLength: 6,
    maxLength: 10,
    pattern: /^[0-9]+$/,
    errorMessageMin: 'La identificación debe tener al menos 6 caracteres',
    errorMessageMax: 'La identificación no puede exceder 10 caracteres',
    errorMessagePattern: 'La cédula de extranjería solo debe contener números'
  },
  'Pasaporte': {
    minLength: 6,
    maxLength: 20,
    pattern: /^[A-Z0-9]+$/,
    errorMessageMin: 'La identificación debe tener al menos 6 caracteres',
    errorMessageMax: 'La identificación no puede exceder 20 caracteres',
    errorMessagePattern: 'El pasaporte solo debe contener letras y números'
  },
  'Permiso de Permanencia': {
    minLength: 6,
    maxLength: 15,
    pattern: /^[A-Z0-9-]+$/,
    errorMessageMin: 'La identificación debe tener al menos 6 caracteres',
    errorMessageMax: 'La identificación no puede exceder 15 caracteres',
    errorMessagePattern: 'El permiso solo debe contener letras, números y guiones'
  },
  'Tarjeta de Extranjería': {
    minLength: 6,
    maxLength: 15,
    pattern: /^[A-Z0-9-]+$/,
    errorMessageMin: 'La identificación debe tener al menos 6 caracteres',
    errorMessageMax: 'La identificación no puede exceder 15 caracteres',
    errorMessagePattern: 'La tarjeta solo debe contener letras, números y guiones'
  },
  'Número de Identificación Extranjero': {
    minLength: 6,
    maxLength: 20,
    pattern: /^[A-Z0-9-]+$/,
    errorMessageMin: 'La identificación debe tener al menos 6 caracteres',
    errorMessageMax: 'La identificación no puede exceder 20 caracteres',
    errorMessagePattern: 'El número solo debe contener letras, números y guiones'
  },
  'Número de Identificación Tributaria': {
    minLength: 9,
    maxLength: 10,
    pattern: /^[0-9]+$/,
    errorMessageMin: 'La identificación debe tener al menos 9 caracteres',
    errorMessageMax: 'La identificación no puede exceder 10 caracteres',
    errorMessagePattern: 'El NIT solo debe contener números'
  }
};

/**
 * Valida un número de documento según su tipo
 * @param {string} documentType - Tipo de documento
 * @param {string} documentNumber - Número de documento a validar
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateDocument = (documentType, documentNumber) => {
  if (!documentNumber || !documentNumber.trim()) {
    return {
      isValid: false,
      error: 'El número de documento es obligatorio'
    };
  }

  const rules = documentValidationRules[documentType];
  
  if (!rules) {
    // Si no hay reglas específicas, validación básica
    if (documentNumber.length < 6 || documentNumber.length > 20) {
      return {
        isValid: false,
        error: 'El documento debe tener entre 6 y 20 caracteres'
      };
    }
    return { isValid: true, error: '' };
  }

  const trimmedDoc = documentNumber.trim().toUpperCase();

  // Validar longitud mínima
  if (trimmedDoc.length < rules.minLength) {
    return {
      isValid: false,
      error: rules.errorMessageMin
    };
  }

  // Validar longitud máxima
  if (trimmedDoc.length > rules.maxLength) {
    return {
      isValid: false,
      error: rules.errorMessageMax
    };
  }

  // Validar patrón
  if (!rules.pattern.test(trimmedDoc)) {
    return {
      isValid: false,
      error: rules.errorMessagePattern
    };
  }

  return { isValid: true, error: '' };
};

/**
 * Obtiene el placeholder apropiado para un tipo de documento
 * @param {string} documentType - Tipo de documento
 * @returns {string} Placeholder text
 */
export const getDocumentPlaceholder = (documentType) => {
  const placeholders = {
    'Cédula de Ciudadanía': 'Ej: 1234567890',
    'Tarjeta de Identidad': 'Ej: 1234567890',
    'Cédula de Extranjería': 'Ej: 123456789',
    'Pasaporte': 'Ej: AB123456',
    'Permiso de Permanencia': 'Ej: PP-123456',
    'Tarjeta de Extranjería': 'Ej: TE-123456',
    'Número de Identificación Extranjero': 'Ej: NIE-123456',
    'Número de Identificación Tributaria': 'Ej: 900123456'
  };

  return placeholders[documentType] || 'Ingrese el número de documento';
};

/**
 * Formatea el número de documento según su tipo
 * @param {string} documentType - Tipo de documento
 * @param {string} value - Valor a formatear
 * @returns {string} Valor formateado
 */
export const formatDocumentNumber = (documentType, value) => {
  if (!value) return '';

  const rules = documentValidationRules[documentType];
  if (!rules) return value;

  // Para documentos numéricos, solo permitir números
  if (rules.pattern.toString().includes('[0-9]') && !rules.pattern.toString().includes('A-Z')) {
    return value.replace(/[^0-9]/g, '');
  }

  // Para documentos alfanuméricos, convertir a mayúsculas
  if (rules.pattern.toString().includes('A-Z')) {
    return value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  }

  return value;
};

/**
 * Obtiene información sobre las reglas de un tipo de documento
 * @param {string} documentType - Tipo de documento
 * @returns {Object} Información de las reglas
 */
export const getDocumentInfo = (documentType) => {
  const rules = documentValidationRules[documentType];
  if (!rules) {
    return {
      minLength: 6,
      maxLength: 20,
      description: 'Entre 6 y 20 caracteres'
    };
  }

  return {
    minLength: rules.minLength,
    maxLength: rules.maxLength,
    description: `Entre ${rules.minLength} y ${rules.maxLength} caracteres`
  };
};
