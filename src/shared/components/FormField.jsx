// components/FormField.jsx
import React, { useState } from "react";
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
  // Soporte para estado 'touched' interno para formularios sin hook de validación.
  const isTouchedExternallyManaged = touched !== undefined;
  const [isTouchedInternal, setIsTouchedInternal] = useState(false);
  const wasTouched = isTouchedExternallyManaged ? touched : isTouchedInternal;

  // Lógica de validación.
  const isFieldEmpty = !value || (typeof value === 'string' && value.trim() === '');

  // El error puede venir de un hook externo o de la validación interna de 'required'.
  const externalError = wasTouched && error;
  const requiredError = wasTouched && required && isFieldEmpty && !error;

  const hasError = !!(externalError || requiredError);
  const errorMessage = externalError ? error : (requiredError ? `El campo '${label.toLowerCase()}' es obligatorio.` : null);

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
    // Si el estado 'touched' no se maneja externamente, lo actualizamos internamente.
    if (!isTouchedExternallyManaged) {
      setIsTouchedInternal(true);
    }

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
          <option value="">{placeholder || "Seleccione una opción"}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
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
        {hasError && errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-red-500 text-xs flex items-center gap-1"
          >
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
