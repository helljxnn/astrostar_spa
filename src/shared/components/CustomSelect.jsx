import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomSelect = ({
  name,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = "Seleccionar...",
  disabled = false,
  error = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filtrar opciones basado en búsqueda
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Encontrar la opción seleccionada
  const selectedOption = options.find(option => option.value === value);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar selección de opción
  const handleOptionSelect = (option) => {
    if (onChange) {
      if (typeof onChange === 'function') {
        if (onChange.length === 2) {
          onChange(name, option.value);
        } else {
          onChange({ target: { name, value: option.value } });
        }
      }
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  // Manejar blur
  const handleBlur = () => {
    if (onBlur) {
      if (typeof onBlur === 'function') {
        if (onBlur.length === 1) {
          onBlur(name);
        } else {
          onBlur({ target: { name } });
        }
      }
    }
  };

  return (
    <div ref={selectRef} className={`custom-select-container ${isOpen ? 'open' : ''} ${className}`}>
      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onBlur={handleBlur}
        disabled={disabled}
        className={`
          w-full p-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:border-transparent
          text-left bg-white flex items-center justify-between
          ${error
            ? "border-red-300 focus:ring-red-500"
            : "border-gray-300 focus:ring-purple-500"
          }
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer hover:border-gray-400"}
          ${isOpen ? "ring-2 ring-purple-500 border-transparent" : ""}
        `}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="custom-select-dropdown absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-hidden"
            style={{ zIndex: 9999 }}
          >
            {/* Search Input */}
            {options.length > 5 && (
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionSelect(option)}
                    className={`
                      w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors duration-150
                      ${value === option.value ? "bg-purple-50 text-purple-700" : "text-gray-900"}
                    `}
                  >
                    {option.label}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No se encontraron opciones
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;