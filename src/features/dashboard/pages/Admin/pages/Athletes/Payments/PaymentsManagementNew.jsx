import { useState } from "react";
import { FaEye, FaCheck, FaTimes, FaSync } from "react-icons/fa";

import Table from "../../../../../../../shared/components/Table/table.jsx";
import SearchInput from "../../../../../../../shared/components/SearchInput.jsx";
import ReportButton from "../../../../../../../shared/components/ReportButton.jsx";
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard.jsx";
import PaymentRejectModal from "./components/PaymentRejectModal.jsx";
import PaymentTypeBadge from "./components/PaymentTypeBadge.jsx";
import PaymentStatusBadge from "./components/PaymentStatusBadge.jsx";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions.js";
import { usePayments } from "./hooks/usePayments.js";
import { formatCurrency } from "./utils/currencyUtils.js";
import { showConfirmAlert } from "../../../../../../../shared/utils/alerts.js";

const PaymentsManagementNew = () => {
  const { hasPermission } = usePermissions();
  const {
    payments,
    loading,
    actionLoading,
    pagination,
    filters,
    setFilters,
    refetch,
    approvePayment,
    rejectPayment,
  } = usePayments();

  const [searchTerm, setSearchTerm] = useState("");
  const [localFilters, setLocalFilters] = useState({ status: "", type: "" });
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [paymentToReject, setPaymentToReject] = useState(null);

  // Aplicar filtros al hook
  const handleFilterChange = (key, value) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    setFilters({ status: updated.status, type: updated.type, search: searchTerm });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setFilters({ ...localFilters, search: e.target.value });
  };

  const handleClearFilters = () => {
    setLocalFilters({ status: "", type: "" });
    setSearchTerm("");
    setFilters({ status: "", type: "", search: "" });
  };

  // ── Aprobar ──
  const handleApprove = async (payment) => {
    if (!hasPermission("paymentsManagement", "Editar")) return;

    const confirmResult = await showConfirmAlert(
      "¿Aprobar comprobante?",
      `¿Confirmas que el comprobante de ${payment.athlete?.user?.firstName} ${payment.athlete?.user?.lastName} es válido?`,
      { confirmButtonText: "Sí, aprobar", cancelButtonText: "Cancelar" }
    );
    if (!confirmResult.isConfirmed) return;

    await approvePayment(payment.id);
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
    if (payment.receiptUrl) {
      window.open(payment.receiptUrl, "_blank");
    }
  };

  // ── Datos para la tabla ──
  const tableData = payments.map((payment) => ({
    ...payment,
    atletaNombre: `${payment.athlete?.user?.firstName || ""} ${payment.athlete?.user?.lastName || ""}`.trim(),
    atletaDoc: payment.athlete?.user?.identification || "",
    obligationType: payment.obligation?.type || "",
    periodoTexto: payment.obligation?.period || "—",
    montoTexto: formatCurrency(payment.obligation?.baseAmount),
    fechaTexto: payment.uploadedAt
      ? new Date(payment.uploadedAt).toLocaleDateString("es-ES")
      : "—",
  }));

  // ── Datos para el reporte ──
  const reportData = payments.map((payment) => ({
    atleta: `${payment.athlete?.user?.firstName || ""} ${payment.athlete?.user?.lastName || ""}`.trim(),
    identificacion: payment.athlete?.user?.identification || "",
    tipo: {
      MONTHLY: "Mensualidad",
      ENROLLMENT_INITIAL: "Matrícula Inicial",
      ENROLLMENT_RENEWAL: "Renovación Matrícula",
    }[payment.obligation?.type] || "Otro",
    periodo: payment.obligation?.period || "—",
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
  }));

  return (
    <div className="p-6 font-questrial w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Gestión de Pagos</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar atleta o identificación..."
            />
          </div>

          <div className="flex gap-2">
            {/* Botón refrescar */}
            <button
              onClick={refetch}
              disabled={loading}
              className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:border-primary-blue hover:text-primary-blue transition-colors disabled:opacity-50"
              title="Refrescar lista"
            >
              <FaSync className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

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
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={localFilters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              <option value="">Todos los estados</option>
              <option value="PENDING">Pendiente</option>
              <option value="APPROVED">Aprobado</option>
              <option value="REJECTED">Rechazado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de pago
            </label>
            <select
              value={localFilters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              <option value="">Todos los tipos</option>
              <option value="MONTHLY">Mensualidad</option>
              <option value="ENROLLMENT_INITIAL">Matrícula Inicial</option>
              <option value="ENROLLMENT_RENEWAL">Renovación Matrícula</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Info de paginación */}
      {pagination.total > 0 && (
        <p className="text-sm text-gray-500 mb-3">
          Mostrando {payments.length} de {pagination.total} comprobantes
        </p>
      )}

      {/* Tabla */}
      {loading ? (
        <div className="flex justify-center items-center py-16 bg-white rounded-2xl shadow border border-gray-200">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-blue border-t-transparent" />
            <span className="text-sm text-gray-500">Cargando comprobantes...</span>
          </div>
        </div>
      ) : tableData.length > 0 ? (
        <div className="w-full bg-white rounded-lg">
          <Table
            thead={{
              titles: [
                "Atleta",
                "Identificación",
                "Tipo",
                "Período",
                "Monto",
                "Fecha",
                "Estado",
              ],
              state: false,
              actions: true,
            }}
            tbody={{
              data: tableData,
              dataPropertys: [
                "atletaNombre",
                "atletaDoc",
                "obligationType",
                "periodoTexto",
                "montoTexto",
                "fechaTexto",
                "status",
              ],
              state: false,
              customRenderers: {
                obligationType: (value) => (
                  <PaymentTypeBadge type={value} />
                ),
                status: (value) => (
                  <PaymentStatusBadge status={value} />
                ),
              },
            }}
            onEdit={null}
            onDelete={null}
            onView={null}
            customActions={[
              {
                onClick: (payment) => handleViewPayment(payment),
                label: <FaEye className="w-4 h-4" />,
                className:
                  "p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors",
                tooltip: "Ver comprobante",
              },
              {
                onClick: (payment) => handleApprove(payment),
                label: actionLoading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full" />
                ) : (
                  <FaCheck className="w-4 h-4" />
                ),
                className:
                  "p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors disabled:opacity-40",
                tooltip: "Aprobar pago",
                show: (payment) =>
                  payment.status === "PENDING" &&
                  hasPermission("paymentsManagement", "Editar"),
              },
              {
                onClick: (payment) => handleReject(payment),
                label: <FaTimes className="w-4 h-4" />,
                className:
                  "p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors",
                tooltip: "Rechazar pago",
                show: (payment) =>
                  payment.status === "PENDING" &&
                  hasPermission("paymentsManagement", "Editar"),
              },
            ]}
          />
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-10 py-8 bg-white rounded-2xl shadow border border-gray-200">
          No hay comprobantes{localFilters.status || localFilters.type ? " con los filtros seleccionados" : ""}.
        </div>
      )}

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={!pagination.hasPrev}
            onClick={() => setFilters({ page: pagination.currentPage - 1 })}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:border-primary-blue transition-colors"
          >
            ← Anterior
          </button>
          <span className="px-3 py-1 text-sm text-gray-600">
            Página {pagination.currentPage} de {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasNext}
            onClick={() => setFilters({ page: pagination.currentPage + 1 })}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:border-primary-blue transition-colors"
          >
            Siguiente →
          </button>
        </div>
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
        loading={actionLoading}
      />
    </div>
  );
};

export default PaymentsManagementNew;