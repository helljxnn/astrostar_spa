/**
 * Componente para mostrar mensajes de validación
 */

import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle, FaCheck, FaSpinner } from "react-icons/fa";

const ValidationMessage = ({ 
  type = "error", 
  message, 
  isVisible = true,
  className = "" 
}) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheck className="text-green-500" size={14} />;
      case "warning":
        return <FaExclamationTriangle className="text-yellow-500" size={14} />;
      case "loading":
        return <FaSpinner className="text-blue-500 animate-spin" size={14} />;
      default:
        return <FaExclamationTriangle className="text-red-500" size={14} />;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "loading":
        return "text-blue-600";
      default:
        return "text-red-600";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && message && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.2 }}
          className={`flex items-center gap-2 mt-1 ${getTextColor()} ${className}`}
        >
          {getIcon()}
          <span className="text-sm font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ValidationMessage;