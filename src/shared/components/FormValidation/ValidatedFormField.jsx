/**
 * Componente de campo de formulario con validaciones visuales mejoradas
 */

import { motion } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";

const ValidatedFormField = ({
  label,
  name,
  type = "text",
  placeholder = "",
  required = false,
  value = "",
  error = "",
  touched = false,
  disabled = false,
  options = [],
  onChange,
  onBlur,
  delay = 0,
  className = ""
}) => {
  const hasError = touched && error;
  const isRequired = required;

  const inputClasses = `
    w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2
    ${hasError 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50' 
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white'
    }
    ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}
    placeholder-gray-400
  `;

  const labelClasses = `
    block text-sm font-medium mb-2 transition-colors duration-200
    ${hasError ? 'text-red-600' : 'text-gray-700'}
  `;

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(name, newValue);
  };

  const handleInputBlur = () => {
    onBlur(name);
  };

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={value}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            disabled={disabled}
            className={inputClasses}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`${inputClasses} resize-none`}
            rows={3}
          />
        );
      
      default:
        return (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={inputClasses}
          />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`form-field ${className}`}
    >
      {/* Label con asterisco para campos requeridos */}
      <label htmlFor={name} className={labelClasses}>
        {label}
        {isRequired && (
          <span className="text-red-500 ml-1 font-bold">*</span>
        )}
      </label>

      {/* Input */}
      <div className="relative">
        {renderInput()}
        
        {/* Icono de error */}
        {hasError && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <FaExclamationTriangle className="text-red-500" size={16} />
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {hasError && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 mt-2 text-red-600"
        >
          <FaExclamationTriangle size={14} className="flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ValidatedFormField;