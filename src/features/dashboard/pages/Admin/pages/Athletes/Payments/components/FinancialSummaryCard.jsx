import React from "react";
import { formatCurrency } from "../utils/currencyUtils";
import LateFeeDisplay from "./LateFeeDisplay";
import SuspendedObligationBadge from "./SuspendedObligationBadge";
import { FaExclamationTriangle } from "react-icons/fa";

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

  const { totalDebt, allMonthlyDebts = [] } = financialStatus;
  
  // ✅ NUEVO: Detectar obligaciones suspendidas
  const suspendedObligations = allMonthlyDebts.filter(
    obligation => obligation?.metadata?.suspended === true
  );
  const hasSuspendedObligations = suspendedObligations.length > 0;
  
  // ✅ NUEVO: Detectar si está en el límite de mora
  const isAtLateFeeLimit = totalDebt.maxDaysLate >= 90;
  
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
    if (totalDebt.maxDaysLate >= 15) return "Bloqueado por mora"; // ✅ Actualizado: 15 días
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

      {/* ✅ NUEVO: Alerta de obligaciones suspendidas */}
      {hasSuspendedObligations && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <SuspendedObligationBadge obligation={suspendedObligations[0]} />
            <span className="text-sm text-gray-700">
              Tienes {suspendedObligations.length} obligación(es) suspendida(s)
            </span>
          </div>
          <p className="text-xs text-gray-600">
            La mora de estas obligaciones está congelada mientras tu estado sea inactivo.
          </p>
        </div>
      )}

      {/* ✅ NUEVO: Alerta de límite de mora alcanzado */}
      {isAtLateFeeLimit && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-red-700">
              <p className="font-semibold mb-1">Límite de mora alcanzado</p>
              <p>
                Has alcanzado el límite máximo de 90 días de mora. 
                No se acumulará más mora, pero debes ponerte al día lo antes posible.
              </p>
            </div>
          </div>
        </div>
      )}

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
          <div className="text-sm text-orange-600 font-medium mb-2">
            Mora Acumulada
          </div>
          {/* ✅ Usar LateFeeDisplay para mostrar mora con indicadores visuales */}
          <LateFeeDisplay 
            lateDays={totalDebt.maxDaysLate || 0}
            lateFeeAmount={totalDebt.lateFeeAmount || 0}
            showDetails={false}
          />
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
            <span className={`${isAtLateFeeLimit ? 'text-red-600 font-bold' : 'text-orange-600'}`}>
              Mora máxima: {totalDebt.maxDaysLate} días
              {isAtLateFeeLimit && " ⚠️"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialSummaryCard;
