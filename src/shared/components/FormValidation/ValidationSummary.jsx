/**
 * Componente para mostrar un resumen de errores de validación
 */

import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";

const ValidationSummary = ({ 
  errors = {}, 
  isVisible = true, 
  onClose,
  title = "Errores de validación",
  className = "" 
}) => {
  const errorList = Object.entries(errors).filter(([key, value]) => value && value.trim());

  if (!isVisible || errorList.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className={`bg-red-50 border border-red-200 rounded-lg p-4 mb-4 ${className}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <FaExclamationTriangle className="text-red-500 mt-0.5" size={16} />
            <div className="flex-1">
              <h4 className="text-red-800 font-semibold text-sm mb-2">{title}</h4>
              <ul className="space-y-1">
                {errorList.map(([field, error], index) => (
                  <motion.li
                    key={field}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-red-700 text-sm flex items-start gap-2"
                  >
                    <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{error}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-red-400 hover:text-red-600 transition-colors p-1"
              aria-label="Cerrar resumen de errores"
            >
              <FaTimes size={14} />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ValidationSummary;