import { FaExclamationTriangle, FaLock, FaCalendarTimes, FaClock } from "react-icons/fa";
import { 
  getRestrictionMessage, 
  getRestrictionBadgeColors 
} from "../utils/restrictionUtils.js";

/**
 * Componente de alerta para mostrar restricciones de acceso del atleta
 * ✅ ACTUALIZADO: Usa lógica centralizada de restricciones con prioridades
 */
const BlockingAlert = ({ financialStatus, accessStatus, className = "" }) => {
  // ✅ NUEVO: Usar lógica centralizada para obtener mensaje de restricción
  const restrictionInfo = getRestrictionMessage(financialStatus, accessStatus);
  
  if (restrictionInfo.type === 'none') return null;

  // Determinar ícono según el tipo de restricción
  const getIcon = () => {
    switch (restrictionInfo.type) {
      case 'enrollment_initial':
        return <FaLock className="w-5 h-5" />;
      case 'enrollment_expired':
      case 'enrollment_renewal':
        return <FaCalendarTimes className="w-5 h-5" />;
      case 'overdue_payments':
        return <FaClock className="w-5 h-5" />;
      default:
        return <FaExclamationTriangle className="w-5 h-5" />;
    }
  };

  // ✅ NUEVO: Usar colores centralizados
  const colors = getRestrictionBadgeColors(restrictionInfo.severity);

  return (
    <div className={`${colors.bg} border-l-4 ${colors.border} rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        {/* Ícono */}
        <div className={`flex-shrink-0 w-10 h-10 ${colors.bg} rounded-full flex items-center justify-center border ${colors.border}`}>
          <span className={colors.icon}>
            {getIcon()}
          </span>
        </div>

        {/* Contenido */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-base font-bold ${colors.text}`}>
              {restrictionInfo.title}
            </h4>
            {restrictionInfo.restriction && (
              <span className={`text-xs font-semibold text-white px-2 py-0.5 rounded-full bg-${restrictionInfo.severity === 'critical' ? 'red' : restrictionInfo.severity === 'important' ? 'orange' : 'yellow'}-600`}>
                Prioridad {restrictionInfo.restriction.priority}
              </span>
            )}
          </div>
          
          <p className={`text-sm ${colors.text} leading-relaxed`}>
            {restrictionInfo.message}
          </p>

          {/* Información adicional según el tipo de bloqueo */}
          {restrictionInfo.type === 'enrollment_initial' && (
            <div className={`mt-3 p-2 bg-white rounded border ${colors.border}`}>
              <p className="text-xs text-gray-700">
                <strong>Acción requerida:</strong> Debes completar el pago de tu matrícula inicial para acceder a los servicios.
              </p>
              {restrictionInfo.restriction?.data?.amount && (
                <p className="text-xs text-gray-600 mt-1">
                  Monto: ${restrictionInfo.restriction.data.amount.toLocaleString()}
                </p>
              )}
            </div>
          )}

          {(restrictionInfo.type === 'enrollment_expired' || restrictionInfo.type === 'enrollment_renewal') && (
            <div className={`mt-3 p-2 bg-white rounded border ${colors.border}`}>
              <p className="text-xs text-gray-700">
                <strong>Acción requerida:</strong> Debes renovar tu matrícula para continuar accediendo a los servicios.
              </p>
              {restrictionInfo.restriction?.data?.expirationDate && (
                <p className="text-xs text-gray-600 mt-1">
                  Venció: {new Date(restrictionInfo.restriction.data.expirationDate).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {restrictionInfo.type === 'overdue_payments' && (
            <div className={`mt-3 p-2 bg-white rounded border ${colors.border}`}>
              <p className="text-xs text-gray-700">
                <strong>Acción requerida:</strong> Debes ponerte al día con tus mensualidades pendientes.
              </p>
              {restrictionInfo.restriction?.data && (
                <div className="text-xs text-gray-600 mt-1 space-y-1">
                  <p>Días de mora: {restrictionInfo.restriction.data.daysLate}</p>
                  <p>Deuda total: ${restrictionInfo.restriction.data.totalDebt?.toLocaleString()}</p>
                  <p>Obligaciones: {restrictionInfo.restriction.data.obligationsCount}</p>
                </div>
              )}
            </div>
          )}

          {/* Mostrar módulos permitidos */}
          {restrictionInfo.allowedModules && restrictionInfo.allowedModules.length > 0 && (
            <div className={`mt-3 p-2 bg-white rounded border ${colors.border}`}>
              <p className="text-xs text-gray-700">
                <strong>Acceso permitido a:</strong> {restrictionInfo.allowedModules.join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockingAlert;

