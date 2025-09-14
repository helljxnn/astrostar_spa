// components/FormField.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  ...props 
}) => {
  const hasError = touched && error;

  
  const handleChange = (e) => {
    const val = e.target.value;
    if (typeof onChange === "function") {
      if (onChange.length === 2) {
        onChange(name, val); 
      } else {
        onChange(e); 
      }
    }
  };

  const handleBlur = () => {
    if (typeof onBlur === "function") {
      if (onBlur.length === 1) {
        onBlur(name); 
      } else {
        onBlur(); 
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="space-y-1"
    >
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`
            w-full p-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:border-transparent
            ${hasError 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-purple-500'
            }
          `}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`
            w-full p-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:border-transparent resize-none h-20
            ${hasError 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-purple-500'
            }
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
          className={`
            w-full p-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:border-transparent
            ${hasError 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-purple-500'
            }
          `}
          {...props}
        />
      )}

      <AnimatePresence>
        {hasError && (
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
