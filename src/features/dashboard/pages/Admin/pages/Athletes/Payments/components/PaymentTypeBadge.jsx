import React from "react";
import PaymentsService from "../services/PaymentsService";

/**
 * Badge para mostrar el tipo de pago
 */
const PaymentTypeBadge = ({ type }) => {
  const getTypeConfig = (type) => {
    const configs = {
      'MONTHLY': {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '📅',
        text: 'Mensualidad'
      },
      'ENROLLMENT_RENEWAL': {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: '🎓',
        text: 'Renovación'
      },
      'UNIFORM': {
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        icon: '👕',
        text: 'Uniforme'
      },
      'EVENT': {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: '🏆',
        text: 'Evento'
      }
    };
    
    return configs[type] || {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: '💰',
      text: 'Otro'
    };
  };

  const config = getTypeConfig(type);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {config.text}
    </span>
  );
};

export default PaymentTypeBadge;