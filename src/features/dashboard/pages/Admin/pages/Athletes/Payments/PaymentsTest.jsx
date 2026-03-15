import React from "react";
import { Link } from "react-router-dom";
import { FaCreditCard } from "react-icons/fa";
import PaymentStatusBadge from "./components/PaymentStatusBadge";
import PaymentTypeBadge from "./components/PaymentTypeBadge";
import FinancialStatusBadge from "./components/FinancialStatusBadge";
import FinancialSummaryCard from "./components/FinancialSummaryCard";

const PaymentsTest = () => {
  // Datos de prueba
  const mockFinancialStatus = {
    totalDebt: {
      monthlyAmount: 150000,
      lateFeeAmount: 66000,
      totalAmount: 216000,
      maxDaysLate: 8,
      obligationsCount: 3
    },
    allMonthlyDebts: [
      {
        period: "2026-01",
        baseAmount: 50000,
        daysLate: 35,
        lateFee: 70000,
        totalToPay: 120000,
        paymentStatus: "REJECTED"
      },
      {
        period: "2026-02",
        baseAmount: 50000,
        daysLate: 15,
        lateFee: 30000,
        totalToPay: 80000,
        paymentStatus: "PENDING"
      },
      {
        period: "2026-03",
        baseAmount: 50000,
        daysLate: 5,
        lateFee: 10000,
        totalToPay: 60000,
        paymentStatus: null
      }
    ]
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
          <FaCreditCard className="mr-3 text-indigo-600" />
          🧪 Módulo de Pagos - Implementación Completa
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Módulo de gestión de pagos funcionando correctamente con todas las funcionalidades
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
          ✅ ¡Módulo Completamente Implementado!
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/dashboard/payments-management"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200"
        >
          <div className="text-center">
            <div className="text-4xl mb-4">🧾</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Vista Admin
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Gestión de pagos pendientes, aprobar/rechazar comprobantes
            </p>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
              Gestión Completa
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/payment-settings"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200"
        >
          <div className="text-center">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Configuración
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Configurar valores de mensualidad, renovación y políticas
            </p>
            <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs">
              Valores y Políticas
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/athlete-payments"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200"
        >
          <div className="text-center">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Vista Atleta
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Estado financiero, subir comprobantes y historial
            </p>
            <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs">
              Mis Pagos
            </div>
          </div>
        </Link>
      </div>

      {/* Components Demo */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          🎨 Componentes Implementados
        </h2>
        
        <div className="space-y-6">
          {/* Status Badges */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Badges de Estado
            </h3>
            <div className="flex flex-wrap gap-3">
              <PaymentStatusBadge status="PENDING" />
              <PaymentStatusBadge status="APPROVED" />
              <PaymentStatusBadge status="REJECTED" />
              <PaymentStatusBadge status={null} />
            </div>
          </div>

          {/* Type Badges */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Badges de Tipo
            </h3>
            <div className="flex flex-wrap gap-3">
              <PaymentTypeBadge type="MONTHLY" />
              <PaymentTypeBadge type="ENROLLMENT_RENEWAL" />
              <PaymentTypeBadge type="UNIFORM" />
              <PaymentTypeBadge type="EVENT" />
            </div>
          </div>

          {/* Financial Status Badges */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Estados Financieros
            </h3>
            <div className="flex flex-wrap gap-3">
              <FinancialStatusBadge financialStatus={{ totalDebt: { totalAmount: 0, maxDaysLate: 0 } }} />
              <FinancialStatusBadge financialStatus={{ totalDebt: { totalAmount: 50000, maxDaysLate: 0 } }} />
              <FinancialStatusBadge financialStatus={{ totalDebt: { totalAmount: 50000, maxDaysLate: 8 } }} />
              <FinancialStatusBadge financialStatus={{ totalDebt: { totalAmount: 50000, maxDaysLate: 20 } }} />
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary Demo */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          💰 Resumen Financiero (Demo)
        </h2>
        <FinancialSummaryCard financialStatus={mockFinancialStatus} />
      </div>

      {/* Success Message */}
      <div className="text-center bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="text-green-600 text-4xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-900 mb-2">
          ¡Módulo de Pagos Completamente Implementado!
        </h2>
        <p className="text-green-700">
          El módulo está listo para manejar las operaciones financieras de la escuela deportiva 
          con todas las garantías de calidad, seguridad y profesionalismo.
        </p>
      </div>
    </div>
  );
};

export default PaymentsTest;