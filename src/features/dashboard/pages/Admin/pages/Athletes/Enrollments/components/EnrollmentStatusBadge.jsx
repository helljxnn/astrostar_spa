import React from 'react';
import { ENROLLMENT_STATUS } from '../constants/enrollmentConstants.js';

/**
 * Badge para mostrar el estado de matrícula con el mismo estilo que PaymentStatusBadge
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
  const getStatusConfig = (status) => {
    const configs = {
      [ENROLLMENT_STATUS.VIGENTE]: {
        color: 'bg-green-100 text-green-800 border-green-200',
        text: 'Vigente'
      },
      [ENROLLMENT_STATUS.VENCIDA]: {
        color: 'bg-red-100 text-red-800 border-red-200',
        text: 'Vencida'
      },
      [ENROLLMENT_STATUS.PENDING_PAYMENT]: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'Pendiente de pago'
      },
      // Fallback para estados no reconocidos
      null: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        text: 'Sin estado'
      }
    };
    
    return configs[status] || configs[null];
  };

  const config = getStatusConfig(status);
  const displayLabel = label || config.text;

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color} ${className}`}
      title={`Estado: ${displayLabel}`}
    >
      {displayLabel}
    </span>
  );
};

export default EnrollmentStatusBadge;
