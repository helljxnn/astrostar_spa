/**
 * Componente para mostrar estadísticas de validación de datos
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { FaCheck, FaExclamationTriangle, FaInfoCircle, FaChartBar } from "react-icons/fa";

const ValidationStats = ({ 
  data = [], 
  validationRules = {},
  title = "Estadísticas de Validación",
  className = "" 
}) => {
  // Calcular estadísticas de validación
  const stats = useMemo(() => {
    if (data.length === 0) {
      return {
        total: 0,
        valid: 0,
        warnings: 0,
        errors: 0,
        validPercentage: 0,
        warningPercentage: 0,
        errorPercentage: 0,
        details: {}
      };
    }

    let validCount = 0;
    let warningCount = 0;
    let errorCount = 0;
    const details = {};

    data.forEach(record => {
      let hasWarnings = false;
      let hasErrors = false;

      // Validaciones específicas
      if (validationRules.checkAge && record.age) {
        if (record.age < 18 && record.personType === 'Entrenador') {
          hasWarnings = true;
          details.youngTrainers = (details.youngTrainers || 0) + 1;
        }
      }

      if (validationRules.checkContact) {
        if (!record.email && !record.phone) {
          hasWarnings = true;
          details.noContact = (details.noContact || 0) + 1;
        }
      }

      if (validationRules.checkIdentification) {
        if (!record.identification && record.age >= 18) {
          hasWarnings = true;
          details.noIdentification = (details.noIdentification || 0) + 1;
        }
      }

      if (validationRules.checkTeamAssignment) {
        if ((record.personType === 'Deportista' || record.personType === 'Entrenador') && !record.team) {
          details.noTeam = (details.noTeam || 0) + 1;
        }
      }

      if (validationRules.checkStatus) {
        if (record.status === 'Inactive') {
          details.inactive = (details.inactive || 0) + 1;
        }
      }

      // Contar registros por estado
      if (hasErrors) {
        errorCount++;
      } else if (hasWarnings) {
        warningCount++;
      } else {
        validCount++;
      }
    });

    const total = data.length;
    const validPercentage = Math.round((validCount / total) * 100);
    const warningPercentage = Math.round((warningCount / total) * 100);
    const errorPercentage = Math.round((errorCount / total) * 100);

    return {
      total,
      valid: validCount,
      warnings: warningCount,
      errors: errorCount,
      validPercentage,
      warningPercentage,
      errorPercentage,
      details
    };
  }, [data, validationRules]);

  const statCards = [
    {
      title: "Válidos",
      count: stats.valid,
      percentage: stats.validPercentage,
      color: "green",
      icon: FaCheck
    },
    {
      title: "Advertencias",
      count: stats.warnings,
      percentage: stats.warningPercentage,
      color: "yellow",
      icon: FaExclamationTriangle
    },
    {
      title: "Errores",
      count: stats.errors,
      percentage: stats.errorPercentage,
      color: "red",
      icon: FaExclamationTriangle
    }
  ];

  const colorClasses = {
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-600",
      icon: "text-green-500"
    },
    yellow: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-600",
      icon: "text-yellow-500"
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-600",
      icon: "text-red-500"
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FaChartBar className="text-blue-500" size={20} />
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="text-sm text-gray-500">({stats.total} registros)</div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {statCards.map((card, index) => {
          const colors = colorClasses[card.color];
          const Icon = card.icon;
          
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`${colors.bg} ${colors.border} border rounded-lg p-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={colors.icon} size={16} />
                <span className={`text-2xl font-bold ${colors.text}`}>
                  {card.count}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{card.title}</span>
                <span className={`text-sm font-medium ${colors.text}`}>
                  {card.percentage}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detalles específicos */}
      {Object.keys(stats.details).length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaInfoCircle className="text-blue-500" size={14} />
            Detalles específicos
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats.details.youngTrainers && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Entrenadores menores de edad:</span>
                <span className="font-medium text-yellow-600">{stats.details.youngTrainers}</span>
              </div>
            )}
            {stats.details.noContact && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sin información de contacto:</span>
                <span className="font-medium text-yellow-600">{stats.details.noContact}</span>
              </div>
            )}
            {stats.details.noIdentification && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sin identificación (adultos):</span>
                <span className="font-medium text-yellow-600">{stats.details.noIdentification}</span>
              </div>
            )}
            {stats.details.noTeam && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sin equipo asignado:</span>
                <span className="font-medium text-blue-600">{stats.details.noTeam}</span>
              </div>
            )}
            {stats.details.inactive && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estado inactivo:</span>
                <span className="font-medium text-gray-600">{stats.details.inactive}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Barra de progreso general */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Calidad general de datos</span>
          <span>{stats.validPercentage}% válidos</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="flex h-3 rounded-full overflow-hidden">
            <motion.div
              className="bg-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${stats.validPercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
            <motion.div
              className="bg-yellow-500"
              initial={{ width: 0 }}
              animate={{ width: `${stats.warningPercentage}%` }}
              transition={{ duration: 1, delay: 0.7 }}
            />
            <motion.div
              className="bg-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${stats.errorPercentage}%` }}
              transition={{ duration: 1, delay: 0.9 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ValidationStats;