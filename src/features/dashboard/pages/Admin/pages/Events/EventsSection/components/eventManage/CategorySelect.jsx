import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

export const CategorySelect = ({
  options = [],
  value = null,
  onChange,
  error,
  touched,
  disabled = false,
  placeholder = "Selecciona una categoría",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Obtener la opción seleccionada
  const selectedOption = options.find((opt) => opt.value === value);

  // Seleccionar una opción
  const selectOption = (optionValue) => {
    if (disabled) return;
    onChange("categoryId", optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Categoría <span className="text-red-500">*</span>
      </label>

      {/* Campo de selección */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          min-h-[42px] px-3 py-2 border rounded-lg cursor-pointer
          transition-all duration-200 flex items-center justify-between
          ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : "bg-white hover:border-primary-purple"
          }
          ${
            error && touched
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-primary-purple"
          }
          ${isOpen ? "ring-2 ring-primary-purple border-primary-purple" : ""}
        `}
      >
        <div className="flex-1">
          {selectedOption ? (
            <div>
              <span className="text-sm font-medium text-gray-700">
                {selectedOption.label}
              </span>
              {selectedOption.description && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedOption.description}
                </p>
              )}
            </div>
          ) : (
            <span className="text-gray-400 text-sm">{placeholder}</span>
          )}
        </div>

        <FaChevronDown
          className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "transform rotate-180" : ""
          }`}
          size={14}
        />
      </div>

      {/* Mensaje de error */}
      {error && touched && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-xs text-red-500"
        >
          {error}
        </motion.p>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
          >
            {/* Lista de opciones */}
            <div className="max-h-60 overflow-y-auto">
              {options.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  <div className="text-3xl mb-2">📂</div>
                  No hay categorías disponibles
                </div>
              ) : (
                options.map((option) => {
                  const selected = option.value === value;
                  return (
                    <motion.div
                      key={option.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectOption(option.value);
                      }}
                      whileHover={{ backgroundColor: "#f9fafb" }}
                      className={`
                        px-4 py-3 cursor-pointer transition-colors
                        border-b border-gray-100 last:border-b-0
                        ${selected ? "bg-purple-50" : "bg-white"}
                      `}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-medium ${
                                selected
                                  ? "text-primary-purple"
                                  : "text-gray-700"
                              }`}
                            >
                              {option.label}
                            </span>
                          </div>
                          {option.description && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {option.description}
                            </p>
                          )}
                        </div>

                        {/* Indicador de selección */}
                        {selected && (
                          <div className="w-2 h-2 bg-primary-purple rounded-full flex-shrink-0" />
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

