import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  validateDocument, 
  getDocumentPlaceholder, 
  formatDocumentNumber,
  getDocumentInfo,
  requiresDigitoVerificacion,
  calcularDigitoVerificacion
} from '../utils/documentValidation';

/**
 * Campo de documento con validación específica por tipo
 */
export const DocumentField = ({
  documentType,
  value,
  onChange,
  onBlur,
  error,
  touched,
  disabled = false,
  required = true,
  label = "Número de Documento",
  name = "identification"
}) => {
  const [localError, setLocalError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Validar cuando cambia el tipo de documento o el valor
  useEffect(() => {
    if (value && documentType) {
      const validation = validateDocument(documentType, value);
      if (!validation.isValid) {
        setLocalError(validation.error);
      } else {
        setLocalError('');
      }
    } else if (!value) {
      setLocalError('');
    }
  }, [documentType, value]);

  const handleChange = (e) => {
    const rawValue = e.target.value;
    
    // Formatear según el tipo de documento
    const formattedValue = documentType 
      ? formatDocumentNumber(documentType, rawValue)
      : rawValue;

    // Validar inmediatamente si ya se tocó el campo
    if (touched) {
      const validation = validateDocument(documentType, formattedValue);
      if (!validation.isValid) {
        setLocalError(validation.error);
      } else {
        setLocalError('');
      }
    }

    onChange(name, formattedValue);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(name);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const displayError = touched && (error || localError);
  const documentInfo = documentType ? getDocumentInfo(documentType) : null;
  const placeholder = documentType ? getDocumentPlaceholder(documentType) : 'Seleccione primero el tipo de documento';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          type="text"
          name={name}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled || !documentType}
          placeholder={placeholder}
          maxLength={documentType === 'Número de Identificación Tributaria' || documentType === 'NIT' ? 10 : undefined}
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
            ${displayError 
              ? 'border-red-300 focus:border-red-500 bg-red-50' 
              : isFocused
                ? 'border-purple-500 bg-white'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }
            ${disabled || !documentType ? 'bg-gray-100 cursor-not-allowed' : ''}
            focus:outline-none focus:ring-2 
            ${displayError ? 'focus:ring-red-200' : 'focus:ring-purple-200'}
            text-gray-900 placeholder-gray-400
          `}
        />

        {/* Contador de caracteres */}
        {documentInfo && value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {value.length}/{documentInfo.maxLength}
          </div>
        )}
      </div>

      {/* Información del documento */}
      {documentType && !displayError && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <span>ℹ️</span>
          <span>{documentInfo?.description}</span>
        </p>
      )}

      {/* Mostrar NIT calculado con dígito verificador */}
      {requiresDigitoVerificacion(documentType) && value && value.replace(/[^\d]/g, '').length === 9 && !displayError && (
        <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
          <span>✅</span>
          <span>
            NIT calculado: <strong>{value.replace(/[^\d]/g, '')}-{calcularDigitoVerificacion(value.replace(/[^\d]/g, ''))}</strong>
          </span>
        </div>
      )}

      {/* Error */}
      {displayError && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 flex items-center gap-1"
        >
          <span>⚠️</span>
          <span>{error || localError}</span>
        </motion.p>
      )}
    </motion.div>
  );
};
