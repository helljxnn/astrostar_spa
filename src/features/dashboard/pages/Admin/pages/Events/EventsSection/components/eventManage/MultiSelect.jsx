import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaTimes, FaCheck } from "react-icons/fa";

export const MultiSelect = ({ 
  label,
  options = [], 
  value = [], 
  onChange, 
  error, 
  touched, 
  disabled = false,
  placeholder = "Selecciona opciones",
  required = false,
  name = "items"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  // Filtrar opciones según búsqueda
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Verificar si una opción está seleccionada
  const isSelected = (optionValue) => {
    return value.includes(optionValue);
  };

  // Toggle selección de una opción
  const toggleOption = (optionValue) => {
    if (disabled) return;

    const newValue = isSelected(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    
    onChange(name, newValue);
  };

  // Remover una opción seleccionada
  const removeItem = (optionValue, e) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(name, value.filter(v => v !== optionValue));
  };

  // Obtener el label de una opción por su valor
  const getOptionLabel = (optionValue) => {
    const option = options.find(opt => opt.value === optionValue);
    return option ? option.label : optionValue;
  };

  // Seleccionar todas las opciones
  const selectAll = () => {
    if (disabled) return;
    onChange(name, filteredOptions.map(opt => opt.value));
  };

  // Limpiar todas las selecciones
  const clearAll = () => {
    if (disabled) return;
    onChange(name, []);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block mb-2 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Campo de selección */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          min-h-[42px] px-3 py-2 border rounded-lg cursor-pointer
          transition-all duration-200
          ${disabled 
            ? 'bg-gray-100 cursor-not-allowed' 
            : 'bg-white hover:border-primary-purple'
          }
          ${error && touched 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-primary-purple'
          }
          ${isOpen ? 'ring-2 ring-primary-purple border-primary-purple' : ''}
        `}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 flex flex-wrap gap-1.5">
            {value.length === 0 ? (
              <span className="text-gray-400 text-sm">{placeholder}</span>
            ) : (
              value.map((val) => (
                <motion.span
                  key={val}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-purple text-white text-xs font-medium rounded-full shadow-sm"
                >
                  <span>{getOptionLabel(val)}</span>
                  {!disabled && (
                    <button
                      onClick={(e) => removeItem(val, e)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <FaTimes size={10} />
                    </button>
                  )}
                </motion.span>
              ))
            )}
          </div>
          
          <FaChevronDown
            className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            size={14}
          />
        </div>
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
            {/* Barra de búsqueda */}
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Acciones rápidas */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
              <span className="text-xs text-gray-600 font-medium">
                {value.length} de {options.length} seleccionadas
              </span>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selectAll();
                  }}
                  className="text-xs text-primary-purple hover:text-primary-blue font-medium transition-colors"
                >
                  Todas
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAll();
                  }}
                  className="text-xs text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Ninguna
                </button>
              </div>
            </div>

            {/* Lista de opciones */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  <div className="text-3xl mb-2">🔍</div>
                  No se encontraron resultados
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const selected = isSelected(option.value);
                  return (
                    <motion.div
                      key={option.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOption(option.value);
                      }}
                      whileHover={{ backgroundColor: "#f9fafb" }}
                      className={`
                        px-4 py-3 cursor-pointer transition-colors
                        border-b border-gray-100 last:border-b-0
                        ${selected ? 'bg-purple-50' : 'bg-white'}
                      `}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${
                              selected ? 'text-primary-purple' : 'text-gray-700'
                            }`}>
                              {option.label}
                            </span>
                          </div>
                          {option.description && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {option.description}
                            </p>
                          )}
                        </div>
                        
                        {/* Checkbox visual */}
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center
                          transition-all duration-200 flex-shrink-0
                          ${selected 
                            ? 'bg-primary-purple border-primary-purple' 
                            : 'border-gray-300 bg-white'
                          }
                        `}>
                          {selected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                              <FaCheck className="text-white" size={10} />
                            </motion.div>
                          )}
                        </div>
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
