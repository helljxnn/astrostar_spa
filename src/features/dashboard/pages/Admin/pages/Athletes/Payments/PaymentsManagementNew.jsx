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

const PaymentsManagementNew = () => {
  const { hasPermission } = usePermissions();
  
  // Hook para pagos pendientes
  const {
    totalRows: totalPendingPayments,
  } = usePayments('pending');
  
  // Hook para todos los pagos (para reporte y historial)
  const {
    payments: allPayments,
    filters: allFilters,
    updateFilters: setAllFilters,
    rejectPayment,
  } = usePayments('all');

  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [localFilters, setLocalFilters] = useState({ status: "", type: "", dateFrom: "", dateTo: "" });
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [paymentToReject, setPaymentToReject] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewModal, setViewModal] = useState({ isOpen: false, payment: null });

  // Aplicar filtros según el tab activo
  const handleFilterChange = (key, value) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    
    // Aplicar filtros al backend según el tab
    if (activeTab === "payments") {
      // Historial: filtros completos
      setAllFilters({ status: updated.status, type: updated.type, search: searchTerm });
    }
    // Para "pending" los filtros se aplicarán en PendingPaymentsTable mediante props
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    
    if (activeTab === "payments") {
      setAllFilters({ search: e.target.value, status: localFilters.status, type: localFilters.type });
    }
  };

  const handleClearFilters = () => {
    setLocalFilters({ status: "", type: "", dateFrom: "" });
    setSearchTerm("");
    
    if (activeTab === "payments") {
      setAllFilters({ status: "", type: "", search: "" });
    }
  };
  // ── Rechazar ──
  const handleReject = (payment) => {
    if (!hasPermission("paymentsManagement", "Editar")) return;
    setPaymentToReject(payment);
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = async (paymentId, reason) => {
    const result = await rejectPayment(paymentId, reason);
    
    if (result.success) {
      setIsRejectModalOpen(false);
      setPaymentToReject(null);
    }
  };

  // ── Ver comprobante ──
  const handleViewPayment = (payment) => {
    setViewModal({ isOpen: true, payment });
  };

  const handleCloseViewModal = () => {
    setViewModal({ isOpen: false, payment: null });
  };

  // ── Datos para el reporte ──
  const reportData = allPayments.map((payment) => {
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

    return {
      atleta: `${payment.athlete?.user?.firstName || ""} ${payment.athlete?.user?.lastName || ""}`.trim(),
      identificacion: payment.athlete?.user?.identification || "",
      tipo: {
        MONTHLY: "Mensualidad",
        ENROLLMENT_INITIAL: "Matrícula Inicial",
        ENROLLMENT_RENEWAL: "Renovación Matrícula",
      }[payment.obligation?.type] || "Otro",
      periodo: periodoTexto,
      monto: formatCurrency(payment.obligation?.baseAmount),
      fecha: payment.uploadedAt
        ? new Date(payment.uploadedAt).toLocaleDateString("es-ES")
        : "",
      estado:
        payment.status === "PENDING"
          ? "Pendiente"
          : payment.status === "APPROVED"
          ? "Aprobado"
          : "Rechazado",
    };
  });
  return (
    <div className="p-6 font-questrial w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Gestión de Pagos</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar atleta o identificación..."
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
                  data={reportData}
                  fileName="Pagos_Comprobantes"
                  columns={[
                    { header: "Atleta", accessor: "atleta" },
                    { header: "Identificación", accessor: "identificacion" },
                    { header: "Tipo", accessor: "tipo" },
                    { header: "Período", accessor: "periodo" },
                    { header: "Monto", accessor: "monto" },
                    { header: "Fecha Subida", accessor: "fecha" },
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
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
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
            <span
              className={`px-1.5 py-0.5 rounded-md text-xs font-medium ${
                activeTab === "pending"
                  ? "bg-primary-purple text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {totalPendingPayments}
            </span>
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
            {/* Filtro de Tipo de Pago - Disponible en ambos tabs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de pago
              </label>
              <select
                value={localFilters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              >
                <option value="">Todos los tipos</option>
                <option value="MONTHLY">Mensualidad</option>
                <option value="ENROLLMENT_INITIAL">Matrícula Inicial</option>
                <option value="ENROLLMENT_RENEWAL">Renovación Matrícula</option>
              </select>
            </div>

            {/* Filtro de Estado Final - Solo en Historial */}
            {activeTab === "payments" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado Final
                </label>
                <select
                  value={localFilters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                >
                  <option value="">Todos los estados</option>
                  <option value="APPROVED">Aprobado</option>
                  <option value="REJECTED">Rechazado</option>
                </select>
              </div>
            )}

            {/* Filtro de Fecha Desde - Disponible en ambos tabs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha desde
              </label>
              <input
                type="date"
                value={localFilters.dateFrom || ""}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              />
            </div>

            {/* Filtro de Fecha Hasta - Disponible en ambos tabs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha hasta
              </label>
              <input
                type="date"
                value={localFilters.dateTo || ""}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
      {/* Contenido según tab activo */}
      {activeTab === "pending" ? (
        <PendingPaymentsTable 
          onViewPayment={handleViewPayment}
          onRejectPayment={handleReject}
          typeFilter={localFilters.type}
          dateFromFilter={localFilters.dateFrom}
          dateToFilter={localFilters.dateTo}
        />
      ) : (
        <PaymentsHistoryTable 
          onViewPayment={handleViewPayment}
          filters={allFilters}
          setFilters={setAllFilters}
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