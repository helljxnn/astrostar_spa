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
      return 'text-yellow-800';
    }
    if (status === ENROLLMENT_STATUS.VIGENTE) {
      return 'text-green-800';
    }
    if (status === ENROLLMENT_STATUS.VENCIDA) {
      return 'text-red-800';
    }
    
    // Color por defecto para estados no reconocidos
    return 'text-gray-800';
  };

  const colorClasses = getStatusColor(status);
  const displayLabel = label || status || 'Sin estado';

  return (
    <span 
      className={`
        font-medium text-sm
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