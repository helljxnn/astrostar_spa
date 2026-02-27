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
  helperText,
  isLoading = false,
  ...props
}) => {
  const isTouched = touched === undefined ? true : touched;
  const hasError = isTouched && Boolean(error);
  const errorMessage = hasError ? error : "";

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

  const handleBlur = (e) => {
    if (typeof onBlur === "function") {
      if (onBlur.length === 1) {
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
      className={`form-field space-y-1 ${type === "select" ? "has-dropdown" : ""}`}
    >
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === "select" ? (
        options.length > 10 ? (
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
                backgroundPosition: "right 0.75rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.5em 1.5em",
                paddingRight: "2.5rem",
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
        <div className="relative">
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
              ${isLoading ? "pr-10" : ""}
            `}
            {...props}
          />
          {isLoading && (
            <div key="document-loader" className="absolute right-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <div className="w-5 h-5 border-2 border-[#B595FF] border-t-transparent rounded-full animate-spin" role="status" aria-label="Validando"></div>
            </div>
          )}
        </div>
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
            <span className="flex items-center justify-center w-4 h-4 rounded-full border border-red-400 text-[10px] leading-none">
              !
            </span>
            <span>{errorMessage}</span>
          </motion.div>
        )}
        {!hasError && helperText && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-500 text-xs"
          >
            {helperText}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
