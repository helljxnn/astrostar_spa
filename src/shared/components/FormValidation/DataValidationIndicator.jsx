/**
 * Componente para mostrar indicadores de validación en los datos de la tabla
 */

import { FaExclamationTriangle, FaInfoCircle, FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const DataValidationIndicator = ({ 
  data, 
  validationRules = {},
  className = "" 
}) => {
  // Función para validar un registro de datos
  const validateRecord = (record) => {
    const warnings = [];
    const errors = [];
    const info = [];

    // Validaciones específicas para personas temporales
    if (validationRules.checkAge && record.age) {
      if (record.age < 18 && record.personType === 'Entrenador') {
        warnings.push('Entrenador menor de edad');
      }
      if (record.age > 65 && record.personType === 'Deportista') {
        info.push('Deportista senior');
      }
    }

    if (validationRules.checkContact) {
      if (!record.email && !record.phone) {
        warnings.push('Sin información de contacto');
      }
    }

    if (validationRules.checkIdentification) {
      if (!record.identification && record.age >= 18) {
        warnings.push('Sin identificación registrada');
      }
    }

    if (validationRules.checkTeamAssignment) {
      if ((record.personType === 'Deportista' || record.personType === 'Entrenador') && !record.team) {
        info.push('Sin equipo asignado');
      }
    }

    if (validationRules.checkStatus) {
      if (record.status === 'Inactive') {
        info.push('Estado inactivo');
      }
    }

    return { warnings, errors, info };
  };

  // Validar todos los registros
  const validationResults = data.map(record => ({
    id: record.id,
    ...validateRecord(record)
  }));

  // Contar totales
  const totalWarnings = validationResults.reduce((sum, result) => sum + result.warnings.length, 0);
  const totalErrors = validationResults.reduce((sum, result) => sum + result.errors.length, 0);
  const totalInfo = validationResults.reduce((sum, result) => sum + result.info.length, 0);

  if (totalWarnings === 0 && totalErrors === 0 && totalInfo === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200 ${className}`}
      >
        <FaCheckCircle size={16} />
        <span className="text-sm font-medium">Todos los datos están validados correctamente</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-2 ${className}`}
    >
      {/* Errores */}
      {totalErrors > 0 && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          <FaExclamationTriangle size={16} />
          <span className="text-sm font-medium">
            {totalErrors} error{totalErrors > 1 ? 'es' : ''} encontrado{totalErrors > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Advertencias */}
      {totalWarnings > 0 && (
        <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
          <FaExclamationTriangle size={16} />
          <span className="text-sm font-medium">
            {totalWarnings} advertencia{totalWarnings > 1 ? 's' : ''} encontrada{totalWarnings > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Información */}
      {totalInfo > 0 && (
        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
          <FaInfoCircle size={16} />
          <span className="text-sm font-medium">
            {totalInfo} observación{totalInfo > 1 ? 'es' : ''} encontrada{totalInfo > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </motion.div>
  );
};

// Componente para mostrar indicadores individuales en las filas de la tabla
export const RowValidationIndicator = ({ 
  record, 
  validationRules = {},
  size = "sm" 
}) => {
  const validateRecord = (record) => {
    const warnings = [];
    const errors = [];

    // Mismas validaciones que el componente principal
    if (validationRules.checkAge && record.age) {
      if (record.age < 18 && record.personType === 'Entrenador') {
        warnings.push('Entrenador menor de edad');
      }
    }

    if (validationRules.checkContact) {
      if (!record.email && !record.phone) {
        warnings.push('Sin contacto');
      }
    }

    if (validationRules.checkIdentification) {
      if (!record.identification && record.age >= 18) {
        warnings.push('Sin identificación');
      }
    }

    return { warnings, errors };
  };

  const { warnings, errors } = validateRecord(record);
  const iconSize = size === "sm" ? 12 : 16;

  if (errors.length > 0) {
    return (
      <div className="flex items-center gap-1" title={errors.join(', ')}>
        <FaExclamationTriangle className="text-red-500" size={iconSize} />
        {size !== "sm" && <span className="text-xs text-red-600">{errors.length}</span>}
      </div>
    );
  }

  if (warnings.length > 0) {
    return (
      <div className="flex items-center gap-1" title={warnings.join(', ')}>
        <FaExclamationTriangle className="text-yellow-500" size={iconSize} />
        {size !== "sm" && <span className="text-xs text-yellow-600">{warnings.length}</span>}
      </div>
    );
  }

  return null;
};

export default DataValidationIndicator;