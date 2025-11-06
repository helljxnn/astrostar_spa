/**
 * Componente para mostrar el progreso de validación en formularios
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { FaCheck, FaTimes, FaExclamationTriangle, FaSpinner } from "react-icons/fa";

const ValidationProgress = ({ 
  formData = {}, 
  validationRules = {},
  errors = {},
  isValidating = false,
  className = "" 
}) => {
  // Calcular el progreso de validación
  const validationProgress = useMemo(() => {
    const totalFields = Object.keys(validationRules).length;
    if (totalFields === 0) return { percentage: 100, validFields: 0, totalFields: 0 };

    let validFields = 0;
    let requiredFields = 0;
    let completedRequired = 0;

    Object.keys(validationRules).forEach(fieldName => {
      const value = formData[fieldName];
      const hasError = errors[fieldName];
      const rule = validationRules[fieldName];

      // Determinar si el campo es requerido
      const isRequired = fieldName === 'firstName' || fieldName === 'lastName' || fieldName === 'personType';
      if (isRequired) {
        requiredFields++;
        if (value && !hasError) {
          completedRequired++;
        }
      }

      // Contar campos válidos
      if (value && !hasError) {
        validFields++;
      }
    });

    const percentage = totalFields > 0 ? Math.round((validFields / totalFields) * 100) : 100;
    const requiredPercentage = requiredFields > 0 ? Math.round((completedRequired / requiredFields) * 100) : 100;

    return { 
      percentage, 
      validFields, 
      totalFields, 
      requiredPercentage, 
      completedRequired, 
      requiredFields 
    };
  }, [formData, validationRules, errors]);

  // Determinar el color de la barra de progreso
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Determinar el estado general
  const getValidationStatus = () => {
    if (isValidating) return 'validating';
    if (validationProgress.requiredPercentage === 100 && Object.keys(errors).length === 0) return 'valid';
    if (validationProgress.requiredPercentage === 100) return 'warning';
    return 'invalid';
  };

  const status = getValidationStatus();

  const statusConfig = {
    validating: {
      icon: <FaSpinner className="animate-spin text-blue-500" size={16} />,
      text: 'Validando...',
      color: 'text-blue-600'
    },
    valid: {
      icon: <FaCheck className="text-green-500" size={16} />,
      text: 'Formulario válido',
      color: 'text-green-600'
    },
    warning: {
      icon: <FaExclamationTriangle className="text-yellow-500" size={16} />,
      text: 'Campos opcionales con errores',
      color: 'text-yellow-600'
    },
    invalid: {
      icon: <FaTimes className="text-red-500" size={16} />,
      text: 'Campos requeridos incompletos',
      color: 'text-red-600'
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}
    >
      {/* Header con estado */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {statusConfig[status].icon}
          <span className={`text-sm font-medium ${statusConfig[status].color}`}>
            {statusConfig[status].text}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          {validationProgress.validFields}/{validationProgress.totalFields} campos
        </div>
      </div>

      {/* Barra de progreso general */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progreso general</span>
          <span>{validationProgress.percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${getProgressColor(validationProgress.percentage)}`}
            initial={{ width: 0 }}
            animate={{ width: `${validationProgress.percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Barra de progreso de campos requeridos */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Campos requeridos</span>
          <span>{validationProgress.requiredPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${getProgressColor(validationProgress.requiredPercentage)}`}
            initial={{ width: 0 }}
            animate={{ width: `${validationProgress.requiredPercentage}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </div>
      </div>

      {/* Resumen de errores */}
      {Object.keys(errors).length > 0 && (
        <div className="border-t border-gray-200 pt-3">
          <div className="text-xs text-gray-600 mb-2">Errores encontrados:</div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {Object.entries(errors).map(([field, error]) => (
              error && (
                <div key={field} className="flex items-start gap-2 text-xs">
                  <FaTimes className="text-red-500 mt-0.5 flex-shrink-0" size={10} />
                  <span className="text-red-600">{error}</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Consejos de validación */}
      {status === 'invalid' && (
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="text-xs text-gray-600 mb-2">Consejos:</div>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Complete los campos marcados como requeridos</li>
            <li>• Verifique el formato de email y teléfono</li>
            <li>• La identificación debe tener al menos 6 caracteres</li>
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default ValidationProgress;