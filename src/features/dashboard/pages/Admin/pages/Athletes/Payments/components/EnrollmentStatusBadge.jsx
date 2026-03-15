import { FaCheckCircle, FaExclamationTriangle, FaClock, FaSync } from "react-icons/fa";

/**
 * Badge para mostrar el estado de matrícula con iconos y colores apropiados
 * Integrado con el sistema de renovación automática del backend
 */
const EnrollmentStatusBadge = ({ 
  status, 
  needsRenewal = false, 
  daysToExpire = null,
  size = "sm" 
}) => {
  // Determinar configuración basada en el estado y necesidad de renovación
  const getStatusConfig = () => {
    // Casos especiales para renovación
    if (needsRenewal) {
      return {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: FaSync,
        text: 'Renovación Pendiente'
      };
    }

    // Estados normales de matrícula
    switch (status) {
      case 'Vigente':
        // Verificar si está próxima a vencer
        if (daysToExpire !== null) {
          if (daysToExpire < 0) {
            return {
              color: 'bg-red-100 text-red-800 border-red-200',
              icon: FaExclamationTriangle,
              text: `Vencida (${Math.abs(daysToExpire)} días)`
            };
          } else if (daysToExpire <= 7) {
            return {
              color: 'bg-orange-100 text-orange-800 border-orange-200',
              icon: FaClock,
              text: `Vence en ${daysToExpire} día${daysToExpire !== 1 ? 's' : ''}`
            };
          } else if (daysToExpire <= 30) {
            return {
              color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
              icon: FaClock,
              text: `Vence en ${daysToExpire} días`
            };
          }
        }
        
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: FaCheckCircle,
          text: 'Vigente'
        };

      case 'Vencida':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: FaExclamationTriangle,
          text: 'Vencida'
        };

      case 'Pending_Payment':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: FaClock,
          text: 'Esperando Pago'
        };

      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: null,
          text: status || 'Sin Estado'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;
  
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full font-medium border
      ${config.color}
      ${sizeClasses[size]}
    `}>
      {IconComponent && <IconComponent className="w-3 h-3 flex-shrink-0" />}
      <span>{config.text}</span>
    </span>
  );
};

export default EnrollmentStatusBadge;