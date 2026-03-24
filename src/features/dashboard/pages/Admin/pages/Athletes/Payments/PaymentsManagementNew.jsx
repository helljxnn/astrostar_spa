import { useState } from "react";
import { FaFilter } from "react-icons/fa";
import SearchInput from "../../../../../../../shared/components/SearchInput.jsx";
import ReportButton from "../../../../../../../shared/components/ReportButton.jsx";
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard.jsx";
import PaymentRejectModal from "./components/PaymentRejectModal.jsx";
import PaymentReceiptViewModal from "./components/PaymentReceiptViewModal.jsx";
import PendingPaymentsTable from "./components/PendingPaymentsTable.jsx";
import PaymentsHistoryTable from "./components/PaymentsHistoryTable.jsx";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions.js";
import { usePayments } from "./hooks/usePayments.js";
import { formatCurrency } from "./utils/currencyUtils.js";
import { useReportDataWithService } from "../../../../../../../shared/hooks/useReportData";
import PaymentsService from "./services/PaymentsService";

const PaymentsManagementNew = () => {
  const { hasPermission } = usePermissions();
  
  // Hook para pagos pendientes - Solo obtener el conteo total
  const {
    totalRows: totalPendingPayments,
    refetch: refetchPendingCount,
  } = usePayments('pending');
  
  // Hook para rechazar pagos
  const {
    rejectPayment,
  } = usePayments('all');

  // Hook para reportes
  const paymentsServiceInstance = new PaymentsService();
  const { getReportData } = useReportDataWithService(
    (params) => paymentsServiceInstance.getAllForReport(params)
  );

  const [activeTab, setActiveTab] = useState("pending");
  const [pendingSearch, setPendingSearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [pendingFilters, setPendingFilters] = useState({ 
    type: "", 
    dateFrom: "", 
    dateTo: ""
  });
  const [historyFilters, setHistoryFilters] = useState({ 
    status: "", 
    type: "", 
    dateFrom: "", 
    dateTo: ""
  });
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [paymentToReject, setPaymentToReject] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewModal, setViewModal] = useState({ isOpen: false, payment: null });
  const [pendingRefreshKey, setPendingRefreshKey] = useState(0);

  // Aplicar filtros segun el tab activo
  const handleFilterChange = (key, value) => {
    if (activeTab === "pending") {
      setPendingFilters((prev) => ({ ...prev, [key]: value }));
      return;
    }
    setHistoryFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (activeTab === "pending") {
      setPendingSearch(value);
      return;
    }
    setHistorySearch(value);
  };

  const handleClearFilters = () => {
    if (activeTab === "pending") {
      setPendingFilters({ 
        type: "", 
        dateFrom: "", 
        dateTo: ""
      });
      setPendingSearch("");
      return;
    }
    setHistoryFilters({ 
      status: "", 
      type: "", 
      dateFrom: "", 
      dateTo: ""
    });
    setHistorySearch("");
  };
  // ── Rechazar ──
  const handleReject = (payment) => {
    if (!hasPermission("paymentsManagement", "Rechazar")) return;
    setPaymentToReject(payment);
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = async (paymentId, reason) => {
    const result = await rejectPayment(paymentId, reason);
    
    if (result.success) {
      setIsRejectModalOpen(false);
      setPaymentToReject(null);
      refetchPendingCount();
      setPendingRefreshKey((prev) => prev + 1);
    }
  };

  // ── Ver comprobante ──
  const handleViewPayment = (payment) => {
    setViewModal({ isOpen: true, payment });
  };

  const handleCloseViewModal = () => {
    setViewModal({ isOpen: false, payment: null });
  };

  // ── Función para obtener datos completos del reporte ──
  const getCompleteReportData = async () => {
    return await getReportData(
      {
        search: historySearch,
        status: historyFilters.status,
        type: historyFilters.type,
        dateFrom: historyFilters.dateFrom,
        dateTo: historyFilters.dateTo,
      },
      (data) => data.map((payment) => {
        let periodoTexto = "—";
        
        if (payment.obligation?.period) {
          periodoTexto = payment.obligation.period;
        } else if (payment.obligation?.type) {
          switch (payment.obligation.type) {
            case "ENROLLMENT_INITIAL":
              periodoTexto = "Matrícula Inicial";
              break;
            case "ENROLLMENT_RENEWAL":
              periodoTexto = "Renovación Matrícula";
              break;
            case "MONTHLY":
              if (payment.obligation.dueStart) {
                const fecha = new Date(payment.obligation.dueStart);
                periodoTexto = fecha.toLocaleDateString("es-ES", { month: 'long', year: 'numeric' });
              } else {
                periodoTexto = "Mensualidad";
              }
              break;
            default:
              periodoTexto = payment.obligation.type;
          }
        }

        const mora = payment.obligation?.lateFeeAmount ?? payment.lateFee ?? 0;
        const base = payment.obligation?.baseAmount || 0;
        const total = payment.obligation?.totalAmount ?? payment.calculatedAmount ?? (base + mora);

        return {
          atleta: `${payment.athlete?.user?.firstName || ""} ${payment.athlete?.user?.lastName || ""}`.trim(),
          identificacion: payment.athlete?.user?.identification || "",
          tipo: {
            MONTHLY: "Mensualidad",
            ENROLLMENT_INITIAL: "Matrícula Inicial",
            ENROLLMENT_RENEWAL: "Renovación Matrícula",
          }[payment.obligation?.type] || "Otro",
          periodo: periodoTexto,
          montoBase: formatCurrency(base),
          mora: formatCurrency(mora),
          total: formatCurrency(total),
          fechaSubida: payment.uploadedAt
            ? new Date(payment.uploadedAt).toLocaleDateString("es-ES")
            : "",
          estado:
            payment.status === "PENDING"
              ? "Pendiente"
              : payment.status === "APPROVED"
              ? "Aprobado"
              : "Rechazado",
        };
      })
    );
  };
  return (
    <div className="p-6 font-montserrat w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Gestión de Pagos</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <SearchInput
              value={activeTab === "pending" ? pendingSearch : historySearch}
              onChange={handleSearchChange}
              placeholder="Buscar deportista o identificación..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Botón de Filtros - Disponible en ambos tabs */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                showFilters
                  ? "bg-primary-blue text-white border-primary-blue"
                  : "border-gray-300 text-gray-700 hover:border-primary-blue hover:text-primary-blue"
              }`}
            >
              <FaFilter className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros</span>
            </button>

            {activeTab === "payments" && (
              <PermissionGuard module="paymentsManagement" action="Ver">
                <ReportButton
                  dataProvider={getCompleteReportData}
                  fileName="pagos_comprobantes"
                  columns={[
                    { header: "Atleta", accessor: "atleta" },
                    { header: "Identificación", accessor: "identificacion" },
                    { header: "Tipo", accessor: "tipo" },
                    { header: "Período", accessor: "periodo" },
                    { header: "Monto Base", accessor: "montoBase" },
                    { header: "Mora", accessor: "mora" },
                    { header: "Total", accessor: "total" },
                    { header: "Fecha Subida", accessor: "fechaSubida" },
                    { header: "Estado", accessor: "estado" },
                  ]}
                />
              </PermissionGuard>
            )}
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="mb-6">
        <div className="inline-flex gap-2">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 relative ${
              activeTab === "pending"
                ? "bg-primary-purple/10 text-primary-purple"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Pagos Pendientes</span>
            {totalPendingPayments > 0 && activeTab !== "pending" ? (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {totalPendingPayments}
              </span>
            ) : (
              <span
                className={`px-1.5 py-0.5 rounded-md text-xs font-medium ${
                  activeTab === "pending"
                    ? "bg-primary-purple text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {totalPendingPayments}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === "payments"
                ? "bg-primary-blue/10 text-primary-blue"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Historial de Pagos</span>
          </button>
        </div>
      </div>
      {/* Panel de Filtros - Adaptado según el tab activo */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
            <button
              onClick={() => {
                handleClearFilters();
                setShowFilters(false);
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Limpiar filtros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Filtro de Tipo de Pago - Disponible en pagos pendientes e historial */}
            {(activeTab === "pending" || activeTab === "payments") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de pago
                </label>
                <select
                  value={activeTab === "pending" ? pendingFilters.type : historyFilters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                >
                  <option value="">Todos los tipos</option>
                  <option value="MONTHLY">Mensualidad</option>
                  <option value="ENROLLMENT_INITIAL">Matrícula Inicial</option>
                  <option value="ENROLLMENT_RENEWAL">Renovación Matrícula</option>
                </select>
              </div>
            )}

            {/* Filtro de Estado Final - Solo en Historial */}
            {activeTab === "payments" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado Final
                </label>
                <select
                  value={historyFilters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                >
                  <option value="">Todos los estados</option>
                  <option value="APPROVED">Aprobado</option>
                  <option value="REJECTED">Rechazado</option>
                </select>
              </div>
            )}

            {/* Filtros de fecha - Solo para pagos pendientes e historial */}
            {(activeTab === "pending" || activeTab === "payments") && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha desde
                  </label>
                  <input
                    type="date"
                    value={(activeTab === "pending" ? pendingFilters.dateFrom : historyFilters.dateFrom) || ""}
                    onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha hasta
                  </label>
                  <input
                    type="date"
                    value={(activeTab === "pending" ? pendingFilters.dateTo : historyFilters.dateTo) || ""}
                    onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Contenido según tab activo */}
      {activeTab === "pending" ? (
        <PendingPaymentsTable 
          onViewPayment={handleViewPayment}
          onRejectPayment={handleReject}
          onPendingChanged={() => {
            refetchPendingCount();
            setPendingRefreshKey((prev) => prev + 1);
          }}
          refreshKey={pendingRefreshKey}
          typeFilter={pendingFilters.type}
          dateFromFilter={pendingFilters.dateFrom}
          dateToFilter={pendingFilters.dateTo}
          searchTerm={pendingSearch}
        />
      ) : (
        <PaymentsHistoryTable 
          onViewPayment={handleViewPayment}
          searchTerm={historySearch}
          statusFilter={historyFilters.status}
          typeFilter={historyFilters.type}
          dateFromFilter={historyFilters.dateFrom}
          dateToFilter={historyFilters.dateTo}
        />
      )}

      {/* Modal de rechazo */}
      <PaymentRejectModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setPaymentToReject(null);
        }}
        onReject={handleRejectConfirm}
        payment={paymentToReject}
        loading={false}
      />

      {/* Modal de Vista de Comprobante */}
      <PaymentReceiptViewModal
        isOpen={viewModal.isOpen}
        onClose={handleCloseViewModal}
        payment={viewModal.payment}
      />
    </div>
  );
};

export default PaymentsManagementNew;
