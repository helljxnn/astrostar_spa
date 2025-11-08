/**
 * Componente para validación de campos de búsqueda
 */

import { useState, useEffect } from "react";
import { FaSearch, FaExclamationTriangle } from "react-icons/fa";
import { motion } from "framer-motion";

const SearchValidation = ({ 
  value, 
  onChange, 
  placeholder = "Buscar...",
  maxLength = 100,
  minLength = 0,
  pattern = null,
  className = "",
  disabled = false 
}) => {
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(true);

  // Validar el valor de búsqueda
  useEffect(() => {
    if (!value || value.length === 0) {
      setError("");
      setIsValid(true);
      return;
    }

    const errors = [];

    // Validar longitud mínima
    if (minLength > 0 && value.length < minLength) {
      errors.push(`Mínimo ${minLength} caracteres`);
    }

    // Validar longitud máxima
    if (value.length > maxLength) {
      errors.push(`Máximo ${maxLength} caracteres`);
    }

    // Validar patrón si se proporciona
    if (pattern && !pattern.test(value)) {
      errors.push("Formato no válido");
    }

    // Validar caracteres especiales peligrosos
    const dangerousChars = /[<>'"&]/;
    if (dangerousChars.test(value)) {
      errors.push("Contiene caracteres no permitidos");
    }

    if (errors.length > 0) {
      setError(errors[0]);
      setIsValid(false);
    } else {
      setError("");
      setIsValid(true);
    }
  }, [value, minLength, maxLength, pattern]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    
    // Prevenir entrada de caracteres peligrosos
    const cleanValue = newValue.replace(/[<>'"&]/g, '');
    
    if (cleanValue !== newValue) {
      setError("Caracteres no permitidos eliminados");
      setTimeout(() => setError(""), 2000);
    }
    
    onChange(cleanValue);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={`
            w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors
            ${isValid 
              ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
              : 'border-red-300 focus:ring-red-500 focus:border-red-500'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
        />
        {!isValid && (
          <FaExclamationTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" size={16} />
        )}
      </div>
      
      {/* Mensaje de error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 mt-1 text-sm text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200 z-10"
        >
          {error}
        </motion.div>
      )}
      
      {/* Contador de caracteres */}
      {value && value.length > 0 && (
        <div className="absolute top-full right-0 mt-1 text-xs text-gray-500">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};

export default SearchValidation;