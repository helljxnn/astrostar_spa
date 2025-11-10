/**
 * Componente para mostrar indicadores de validación en tiempo real
 */

import { motion } from "framer-motion";
import { FaCheck, FaTimes, FaSpinner } from "react-icons/fa";

const ValidationIndicator = ({ 
  isValid, 
  isValidating, 
  error, 
  showSuccess = true,
  className = "" 
}) => {
  if (isValidating) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center text-blue-500 ${className}`}
      >
        <FaSpinner className="animate-spin mr-1" size={12} />
        <span className="text-xs">Validando...</span>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center text-red-500 ${className}`}
      >
        <FaTimes className="mr-1" size={12} />
        <span className="text-xs">{error}</span>
      </motion.div>
    );
  }

  if (isValid && showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center text-green-500 ${className}`}
      >
        <FaCheck className="mr-1" size={12} />
        <span className="text-xs">Válido</span>
      </motion.div>
    );
  }

  return null;
};

export default ValidationIndicator;