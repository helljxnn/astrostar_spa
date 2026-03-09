import React from "react";

/**
 * Badge para mostrar el tipo de pago/obligación
 * Soporta: MONTHLY, ENROLLMENT_INITIAL, ENROLLMENT_RENEWAL
 */
const PaymentTypeBadge = ({ type }) => {
  const getTypeConfig = (type) => {
    const configs = {
      'MONTHLY': {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '📅',
        text: 'Mensualidad'
      },
      'ENROLLMENT_INITIAL': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '🎓',
        text: 'Matrícula Inicial'
      },
      'ENROLLMENT_RENEWAL': {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: '🔄',
        text: 'Renovación Matrícula'
      },
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