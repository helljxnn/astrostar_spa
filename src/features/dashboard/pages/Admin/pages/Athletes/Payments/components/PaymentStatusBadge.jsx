import React from "react";

/**
 * Badge para mostrar el estado de un pago
 */
const PaymentStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const configs = {
      'PENDING': {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '',
        text: 'Pendiente'
      },
      'APPROVED': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '',
        text: 'Aprobado'
      },
      'REJECTED': {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: '',
        text: 'Rechazado'
      },
      null: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: '',
        text: 'Sin comprobante'
      }
    };
    
    return configs[status] || configs[null];
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      {config.text}
    </span>
  );
};

export default PaymentStatusBadge;
