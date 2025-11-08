/**
 * Componente para validación de filtros de selección
 */

import { useState, useEffect } from "react";
import { FaFilter, FaExclamationTriangle, FaCheck } from "react-icons/fa";
import { motion } from "framer-motion";

const FilterValidation = ({ 
  value, 
  onChange, 
  options = [],
  placeholder = "Seleccionar...",
  label = "",
  allowEmpty = true,
  className = "",
  disabled = false 
}) => {
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(true);

  // Validar el valor seleccionado
  useEffect(() => {
    if (!value || value === "") {
      if (!allowEmpty) {
        setError("Selección requerida");
        setIsValid(false);
      } else {
        setError("");
        setIsValid(true);
      }
      return;
    }

    // Verificar que el valor esté en las opciones válidas
    const validOption = options.find(option => option.value === value);
    if (!validOption) {
      setError("Opción no válida");
      setIsValid(false);
    } else {
      setError("");
      setIsValid(true);
    }
  }, [value, options, allowEmpty]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {!allowEmpty && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
        <select
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`
            w-full pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors appearance-none
            ${isValid 
              ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
              : 'border-red-300 focus:ring-red-500 focus:border-red-500'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'}
          `}
        >
          {allowEmpty && (
            <option value="">{placeholder}</option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Icono de estado */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isValid && value ? (
            <FaCheck className="text-green-500" size={14} />
          ) : !isValid ? (
            <FaExclamationTriangle className="text-red-500" size={14} />
          ) : null}
        </div>
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
      
      {/* Información adicional */}
      {isValid && value && (
        <div className="absolute top-full right-0 mt-1 text-xs text-green-600">
          Filtro aplicado
        </div>
      )}
    </div>
  );
};

export default FilterValidation;