import { calculateDaysToExpiration, getExpirationStatus } from '../utils/expirationUtils.js';

/**
 * Componente para mostrar el indicador de días hasta vencimiento
 * @param {Object} props - Propiedades del componente
 * @param {string} props.expirationDate - Fecha de vencimiento
 * @param {string} props.enrollmentStatus - Estado de la matrícula
 * @param {boolean} props.showIcon - Mostrar icono (opcional)
 * @returns {JSX.Element} Componente del indicador
 */
const ExpirationIndicator = ({ 
  expirationDate, 
  enrollmentStatus, 
  showIcon = false 
}) => {
  // Si está pendiente de pago, mostrar mensaje específico
  if (enrollmentStatus === 'Pending_Payment') {
    return (
      <div className="text-left pl-4">
        <span className="text-gray-400">Pendiente de activación</span>
      </div>
    );
  }

  // Si no hay fecha de vencimiento
  if (!expirationDate) {
    return (
      <div className="text-left pl-4">
        <span className="text-gray-400">Sin fecha</span>
      </div>
    );
  }

  const daysToExpiration = calculateDaysToExpiration(expirationDate);
  const status = getExpirationStatus(daysToExpiration);

  // Formatear la fecha para mostrar
  const formattedDate = new Date(expirationDate).toLocaleDateString("es-ES");

  // Iconos según el tipo de estado
  const getIcon = (type) => {
    if (!showIcon) return null;
    
    switch (type) {
      case 'expired':
        return <span className="text-red-600 mr-1">⚠️</span>;
      case 'today':
        return <span className="text-red-600 mr-1">🚨</span>;
      case 'critical':
        return <span className="text-red-600 mr-1">⏰</span>;
      case 'warning':
        return <span className="text-orange-600 mr-1">⚡</span>;
      case 'attention':
        return <span className="text-yellow-600 mr-1">⏳</span>;
      default:
        return null;
    }
  };

  return (
    <div className="text-left pl-4">
      <div className="flex flex-col">
        <span className="text-gray-700 text-sm">
          {formattedDate}
        </span>
        <div className="flex items-center mt-1">
          {getIcon(status.type)}
          <span className={`text-xs ${status.className}`}>
            {status.message}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExpirationIndicator;