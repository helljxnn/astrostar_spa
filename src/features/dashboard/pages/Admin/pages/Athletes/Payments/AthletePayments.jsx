import { useState, useEffect } from "react";
import { FaUpload, FaHistory, FaExclamationTriangle } from "react-icons/fa";

import PermissionGuard from "../../../../../../../shared/components/PermissionGuard.jsx";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions.js";

import {
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../shared/utils/alerts.js";

const AthletePayments = () => {
  const { hasPermission } = usePermissions();

  const [activeTab, setActiveTab] = useState("pendientes");
  const [loading, setLoading] = useState(false);

  // Datos de ejemplo para mostrar la funcionalidad
  const mockFinancialStatus = {
    currentMonth: {
      period: "2026-03",
      baseAmount: 50000,
      daysLate: 8,
      lateFee: 16000,
      totalToPay: 66000,
      paymentStatus: null,
    },
    allMonthlyDebts: [
      {
        id: 1,
        period: "2026-01",
        baseAmount: 50000,
        daysLate: 35,
        lateFee: 70000,
        totalToPay: 120000,
        paymentStatus: "REJECTED",
        rejectionReason: "Monto incorrecto en el comprobante",
      },
      {
        id: 2,
        period: "2026-02",
        baseAmount: 50000,
        daysLate: 15,
        lateFee: 30000,
        totalToPay: 80000,
        paymentStatus: "PENDING",
      },
      {
        id: 3,
        period: "2026-03",
        baseAmount: 50000,
        daysLate: 8,
        lateFee: 16000,
        totalToPay: 66000,
        paymentStatus: null,
      },
    ],
    totalDebt: {
      monthlyAmount: 150000,
      lateFeeAmount: 116000,
      totalAmount: 266000,
      maxDaysLate: 35,
      obligationsCount: 3,
    },
    enrollment: {
      needsRenewal: false,
    },
  };

  const mockPaymentHistory = [
    {
      id: 1,
      period: "2025-12",
      amount: 50000,
      paidDate: "2025-12-15",
      status: "APPROVED",
    },
    {
      id: 2,
      period: "2025-11",
      amount: 50000,
      paidDate: "2025-11-10",
      status: "APPROVED",
    },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", text: "En revisión" },
      APPROVED: { color: "bg-green-100 text-green-800", text: "Aprobado" },
      REJECTED: { color: "bg-red-100 text-red-800", text: "Rechazado" },
    };
    
    if (!status) {
      return { color: "bg-gray-100 text-gray-800", text: "Sin comprobante" };
    }
    
    return statusConfig[status] || { color: "bg-gray-100 text-gray-800", text: "Desconocido" };
  };

  const handleUploadReceipt = (obligationId) => {
    showSuccessAlert(
      "Subir comprobante",
      `Funcionalidad para subir comprobante de la obligación ${obligationId}`
    );
  };

  const getPendingObligations = () => {
    return mockFinancialStatus.allMonthlyDebts.filter(
      (debt) => debt.paymentStatus === null || debt.paymentStatus === "REJECTED"
    );
  };

  const getInReviewObligations = () => {
    return mockFinancialStatus.allMonthlyDebts.filter(
      (debt) => debt.paymentStatus === "PENDING"
    );
  };

  const getApprovedObligations = () => {
    return mockPaymentHistory;
  };

  const renderObligationCard = (obligation, showActions = true) => {
    const statusBadge = getStatusBadge(obligation.paymentStatus || obligation.status);
    
    return (
      <div key={obligation.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Mensualidad {obligation.period}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color} mt-2`}>
              {statusBadge.text}
            </span>
          </div>
          {obligation.daysLate > 0 && (
            <div className="text-right">
              <span className="text-sm text-red-600 font-medium">
                {obligation.daysLate} días de mora
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Valor base:</span>
            <span className="font-medium">{formatCurrency(obligation.baseAmount || obligation.amount)}</span>
          </div>
          {obligation.lateFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Mora ({obligation.daysLate} días):</span>
              <span className="font-medium text-red-600">{formatCurrency(obligation.lateFee)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold border-t pt-2">
            <span>Total a pagar:</span>
            <span className="text-primary-blue">{formatCurrency(obligation.totalToPay || obligation.amount)}</span>
          </div>
        </div>

        {obligation.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Motivo del rechazo:</p>
                <p className="text-sm text-red-700">{obligation.rejectionReason}</p>
              </div>
            </div>
          </div>
        )}

        {showActions && (
          <div className="flex gap-3">
            {(obligation.paymentStatus === null || obligation.paymentStatus === "REJECTED") && (
              <button
                onClick={() => handleUploadReceipt(obligation.id)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors"
              >
                <FaUpload className="w-4 h-4" />
                {obligation.paymentStatus === "REJECTED" ? "Subir nuevo comprobante" : "Subir comprobante"}
              </button>
            )}
            {obligation.paymentStatus === "PENDING" && (
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-800 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                En revisión por administración
              </div>
            )}
            {obligation.paymentStatus === "APPROVED" && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-800 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Pago aprobado
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 font-questrial w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Mis Pagos</h1>
      </div>

      {/* Resumen financiero */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumen Financiero</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(mockFinancialStatus.totalDebt.totalAmount)}
            </div>
            <div className="text-sm text-gray-600">Deuda Total</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(mockFinancialStatus.totalDebt.monthlyAmount)}
            </div>
            <div className="text-sm text-gray-600">Mensualidades</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(mockFinancialStatus.totalDebt.lateFeeAmount)}
            </div>
            <div className="text-sm text-gray-600">Mora Acumulada</div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Tienes {mockFinancialStatus.totalDebt.obligationsCount} obligaciones pendientes
              </p>
              <p className="text-sm text-yellow-700">
                Mora máxima: {mockFinancialStatus.totalDebt.maxDaysLate} días
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="inline-flex gap-2">
          <button
            onClick={() => setActiveTab("pendientes")}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === "pendientes"
                ? "bg-primary-purple/10 text-primary-purple"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span>Pendientes</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-xs font-medium ${
                activeTab === "pendientes"
                  ? "bg-primary-purple text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {getPendingObligations().length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab("revision")}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === "revision"
                ? "bg-yellow-100 text-yellow-800"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span>En Revisión</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-xs font-medium ${
                activeTab === "revision"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {getInReviewObligations().length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab("historial")}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === "historial"
                ? "bg-green-100 text-green-800"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FaHistory className="w-4 h-4" />
            <span>Historial</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-xs font-medium ${
                activeTab === "historial"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {getApprovedObligations().length}
            </span>
          </button>
        </div>
      </div>

      {/* Contenido según tab activo */}
      <div className="space-y-4">
        {activeTab === "pendientes" && (
          <>
            {getPendingObligations().length > 0 ? (
              getPendingObligations().map((obligation) => renderObligationCard(obligation))
            ) : (
              <div className="text-center text-gray-500 py-8 bg-white rounded-2xl shadow border border-gray-200">
                No tienes obligaciones pendientes.
              </div>
            )}
          </>
        )}

        {activeTab === "revision" && (
          <>
            {getInReviewObligations().length > 0 ? (
              getInReviewObligations().map((obligation) => renderObligationCard(obligation))
            ) : (
              <div className="text-center text-gray-500 py-8 bg-white rounded-2xl shadow border border-gray-200">
                No tienes pagos en revisión.
              </div>
            )}
          </>
        )}

        {activeTab === "historial" && (
          <>
            {getApprovedObligations().length > 0 ? (
              getApprovedObligations().map((payment) => (
                <div key={payment.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Mensualidad {payment.period}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                        Aprobado
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-800">
                        {formatCurrency(payment.amount)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Pagado el {new Date(payment.paidDate).toLocaleDateString("es-ES")}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8 bg-white rounded-2xl shadow border border-gray-200">
                No tienes historial de pagos.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AthletePayments;