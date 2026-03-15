import { FaExclamationTriangle, FaLock, FaCalendarTimes, FaClock } from "react-icons/fa";
import { BLOCKING_REASONS, BLOCKING_MESSAGES, BLOCKING_PRIORITIES } from "../constants/paymentConstants";

/**
 * Componente de alerta para mostrar restricciones de acceso del atleta
 * Muestra el bloqueo de mayor prioridad con diseño visual destacado
 */
const BlockingAlert = ({ accessStatus, className = "" }) => {
  if (!accessStatus || !accessStatus.restricted) return null;

  const reason = accessStatus.reason;
  const message = accessStatus.message || BLOCKING_MESSAGES[reason] || 'Acceso restringido';
  const priority = BLOCKING_PRIORITIES[reason] || 999;

  // Determinar ícono y colores según la razón
  const getAlertConfig = () => {
    switch (reason) {
      case BLOCKING_REASONS.ENROLLMENT_INITIAL_PENDING:
        return {
          icon: <FaLock className="w-5 h-5" />,
          title: 'Matrícula Pendiente',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-400',
          textColor: 'text-red-800',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          priority: 'ALTA',
          priorityColor: 'bg-red-600',
        };
      
      case BLOCKING_REASONS.MATRICULA_VENCIDA:
      case BLOCKING_REASONS.ENROLLMENT_RENEWAL_PENDING:
        return {
          icon: <FaCalendarTimes className="w-5 h-5" />,
          title: 'Matrícula Vencida',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-400',
          textColor: 'text-orange-800',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
          priority: 'MEDIA',
          priorityColor: 'bg-orange-600',
        };
      
      case BLOCKING_REASONS.MORA_MENSUALIDAD:
        return {
          icon: <FaClock className="w-5 h-5" />,
          title: 'Mora Acumulada',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-400',
          textColor: 'text-yellow-800',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          priority: 'BAJA',
          priorityColor: 'bg-yellow-600',
        };
      
      default:
        return {
          icon: <FaExclamationTriangle className="w-5 h-5" />,
          title: 'Acceso Restringido',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-400',
          textColor: 'text-gray-800',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          priority: 'MEDIA',
          priorityColor: 'bg-gray-600',
        };
    }
  };

  const config = getAlertConfig();

  return (
    <div className={`${config.bgColor} border-l-4 ${config.borderColor} rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        {/* Ícono */}
        <div className={`flex-shrink-0 w-10 h-10 ${config.iconBg} rounded-full flex items-center justify-center`}>
          <span className={config.iconColor}>
            {config.icon}
          </span>
        </div>

        {/* Contenido */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-base font-bold ${config.textColor}`}>
              {config.title}
            </h4>
            <span className={`text-xs font-semibold text-white px-2 py-0.5 rounded-full ${config.priorityColor}`}>
              Prioridad {config.priority}
            </span>
          </div>
          
          <p className={`text-sm ${config.textColor} leading-relaxed`}>
            {message}
          </p>

          {/* Información adicional según el tipo de bloqueo */}
          {reason === BLOCKING_REASONS.ENROLLMENT_INITIAL_PENDING && (
            <div className={`mt-3 p-2 bg-white rounded border ${config.borderColor}`}>
              <p className="text-xs text-gray-700">
                <strong>Acción requerida:</strong> Debes completar el pago de tu matrícula inicial para acceder a los servicios.
              </p>
            </div>
          )}

          {(reason === BLOCKING_REASONS.MATRICULA_VENCIDA || reason === BLOCKING_REASONS.ENROLLMENT_RENEWAL_PENDING) && (
            <div className={`mt-3 p-2 bg-white rounded border ${config.borderColor}`}>
              <p className="text-xs text-gray-700">
                <strong>Acción requerida:</strong> Debes renovar tu matrícula para continuar accediendo a los servicios.
              </p>
            </div>
          )}

          {reason === BLOCKING_REASONS.MORA_MENSUALIDAD && (
            <div className={`mt-3 p-2 bg-white rounded border ${config.borderColor}`}>
              <p className="text-xs text-gray-700">
                <strong>Acción requerida:</strong> Debes ponerte al día con tus mensualidades pendientes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockingAlert;
