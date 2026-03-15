import React from "react";

const FinancialStatusBadge = ({ financialStatus }) => {
  if (!financialStatus) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        ❓ Sin información
      </span>
    );
  }

  const { totalDebt } = financialStatus;

  // Determinar el estado financiero
  const getFinancialStatus = () => {
    if (totalDebt.totalAmount === 0) {
      return {
        status: 'up_to_date',
        color: 'green',
        icon: '✅',
        text: 'Al día'
      };
    }

    if (totalDebt.maxDaysLate >= 15) {
      return {
        status: 'blocked',
        color: 'red',
        icon: '🚫',
        text: 'Bloqueado'
      };
    }

    if (totalDebt.maxDaysLate > 0) {
      return {
        status: 'with_late_fee',
        color: 'orange',
        icon: '⚠️',
        text: 'Con mora'
      };
    }

    return {
      status: 'with_debt',
      color: 'blue',
      icon: '💰',
      text: 'Con deuda'
    };
  };

  const { color, icon, text } = getFinancialStatus();

  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    orange: 'bg-orange-100 text-orange-800',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color]}`}>
      <span className="mr-1">{icon}</span>
      {text}
    </span>
  );
};

export default FinancialStatusBadge;