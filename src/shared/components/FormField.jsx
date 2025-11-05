// components/FormField.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import CustomSelect from "./CustomSelect";

export const FormField = ({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  options = [],
  value,
  error,
  touched,
  onChange,
  onBlur,
  delay = 0,
  disabled = false,
  ...props
}) => {
  const hasError = touched && error;

  const handleChange = (e) => {
    const val = e.target.value;
    if (typeof onChange === "function") {
      // Esta lógica soporta las dos firmas: onChange(e) y onChange(name, value).
      if (onChange.length === 2) {
        onChange(name, val);
        onChange(name, val);
      } else {
        onChange(e);
        onChange(e);
      }
    }
  };

  const handleBlur = (e) => {
    if (typeof onBlur === "function") {
      // Esta lógica soporta las dos firmas: onBlur(name) y onBlur(e).
      if (onBlur.length === 1) {
        onBlur(name);
        onBlur(name);
      } else {
        onBlur(e);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`form-field space-y-1 ${type === 'select' ? 'has-dropdown' : ''}`}
    >
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === "select" ? (
        options.length > 10 ? (
            // Usar CustomSelect para listas largas
            <CustomSelect
              name={name}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              options={options}
              placeholder={placeholder}
              disabled={disabled}
              error={hasError}
            />
          ) : (
            // Usar select nativo para listas cortas
            <div className="relative">
              <select
                name={name}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={disabled}
                className={`
                  w-full p-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:border-transparent
                  relative z-10 bg-white appearance-none cursor-pointer
                  ${
                    hasError
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-purple-500"
                  }
                  ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
                `}
                style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
                {...props}
              >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )
      ) : type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full p-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:border-transparent resize-none h-20
            ${
              hasError
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-purple-500"
            }
            ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
          `}
          {...props}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full p-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:border-transparent
            ${
              hasError
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-purple-500"
            }
            ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
          `}
          {...props}
        />
      )}

      <AnimatePresence>
        {hasError && error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-red-500 text-xs flex items-center gap-1"
          >
            <span>⚠️</span>
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};