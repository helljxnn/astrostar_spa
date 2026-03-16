import React from 'react';
import { ENROLLMENT_STATUS } from '../constants/enrollmentConstants.js';

/**
 * Badge para mostrar el estado de matrícula con colores apropiados
 * @param {Object} props - Propiedades del componente
 * @param {string} props.status - Estado de la matrícula
 * @param {string} props.label - Etiqueta a mostrar (opcional, usa status si no se proporciona)
 * @param {string} props.className - Clases CSS adicionales
 * @returns {JSX.Element} Badge del estado
 */
const EnrollmentStatusBadge = ({ 
  status, 
  label, 
  className = "" 
}) => {
  // Determinar el color basado en el estado (solo 3 estados)
  const getStatusColor = (status) => {
    if (status === ENROLLMENT_STATUS.PENDING_PAYMENT) {
      return 'bg-yellow-50 text-yellow-800 border border-yellow-200';
    }
    if (status === ENROLLMENT_STATUS.VIGENTE) {
      return 'bg-green-50 text-green-700 border border-green-200';
    }
    if (status === ENROLLMENT_STATUS.VENCIDA) {
      return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
    
    // Color por defecto para estados no reconocidos
    return 'bg-gray-50 text-gray-600 border border-gray-200';
  };

  const colorClasses = getStatusColor(status);
  const displayLabel = label || status || 'Sin estado';

  return (
    <span 
      className={`
        font-medium text-sm px-2 py-1 rounded
        ${colorClasses} 
        ${className}
      `.trim()}
      title={`Estado: ${displayLabel}`}
    >
      {displayLabel}
    </span>
  );
};

export default EnrollmentStatusBadge;
