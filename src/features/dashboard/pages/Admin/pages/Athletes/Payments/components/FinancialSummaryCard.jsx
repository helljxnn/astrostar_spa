import React from "react";
import { formatCurrency } from "../utils/currencyUtils";

const FinancialSummaryCard = ({ financialStatus, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!financialStatus) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-center">No hay información financiera disponible</p>
      </div>
    );
  }

  const { totalDebt } = financialStatus;
  
  const getDebtStatusColor = () => {
    if (totalDebt.totalAmount === 0) return "text-green-600";
    if (totalDebt.maxDaysLate >= 15) return "text-red-600";
    if (totalDebt.maxDaysLate > 0) return "text-orange-600";
    return "text-blue-600";
  };

  const getDebtStatusIcon = () => {
    if (totalDebt.totalAmount === 0) return "✅";
    if (totalDebt.maxDaysLate >= 15) return "🚫";
    if (totalDebt.maxDaysLate > 0) return "⚠️";
    return "💰";
  };

  const getDebtStatusText = () => {
    if (totalDebt.totalAmount === 0) return "Al día";
    if (totalDebt.maxDaysLate >= 15) return "Bloqueado por mora";
    if (totalDebt.maxDaysLate > 0) return "Con mora";
    return "Con deuda";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          💰 Resumen Financiero
        </h3>
        <div className={`flex items-center space-x-2 ${getDebtStatusColor()}`}>
          <span className="text-xl">{getDebtStatusIcon()}</span>
          <span className="font-medium">{getDebtStatusText()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium mb-1">
            Mensualidades Pendientes
          </div>
          <div className="text-2xl font-bold text-blue-800">
            {formatCurrency(totalDebt.monthlyAmount)}
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-sm text-orange-600 font-medium mb-1">
            Mora Acumulada
          </div>
          <div className="text-2xl font-bold text-orange-800">
            {formatCurrency(totalDebt.lateFeeAmount)}
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium mb-1">
            Total a Pagar
          </div>
          <div className="text-2xl font-bold text-purple-800">
            {formatCurrency(totalDebt.totalAmount)}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Obligaciones pendientes: {totalDebt.obligationsCount}</span>
          {totalDebt.maxDaysLate > 0 && (
            <span className="text-orange-600">
              Mora máxima: {totalDebt.maxDaysLate} días
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialSummaryCard;