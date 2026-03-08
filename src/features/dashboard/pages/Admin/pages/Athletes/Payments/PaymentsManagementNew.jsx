import { useState, useEffect } from "react";
import { FaEye, FaCheck, FaTimes } from "react-icons/fa";

import Table from "../../../../../../../shared/components/Table/table.jsx";
import SearchInput from "../../../../../../../shared/components/SearchInput.jsx";
import ReportButton from "../../../../../../../shared/components/ReportButton.jsx";
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard.jsx";
import PaymentRejectModal from "./components/PaymentRejectModal.jsx";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions.js";

import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../../../../../../../shared/utils/alerts.js";

import { PAGINATION_CONFIG } from "../../../../../../../shared/constants/paginationConfig.js";

const PaymentsManagementNew = () => {
  const { hasPermission } = usePermissions();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    type: ""
  });
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [paymentToReject, setPaymentToReject] = useState(null);

  // Datos de ejemplo
  const mockPayments = [
    {
      id: 1,
      athlete: {
        user: {
          firstName: "Juan",
          lastName: "Pérez",
          identification: "12345678"
        }
      },
      obligation: {
        type: "MONTHLY",
        period: "2026-03",
        baseAmount: 50000
      },
      uploadedAt: "2026-03-15T10:30:00Z",
      status: "PENDING",
      receiptUrl: "https://example.com/receipt1.jpg"
    },
    {
      id: 2,
      athlete: {
        user: {
          firstName: "María",
          lastName: "García",
          identification: "87654321"
        }
      },
      obligation: {
        type: "ENROLLMENT_RENEWAL",
        period: null,
        baseAmount: 100000
      },
      uploadedAt: "2026-03-14T15:45:00Z",
      status: "APPROVED",
      receiptUrl: "https://example.com/receipt2.pdf"
    },
    {
      id: 3,
      athlete: {
        user: {
          firstName: "Carlos",
          lastName: "López",
          identification: "11223344"
        }
      },
      obligation: {
        type: "MONTHLY",
        period: "2026-02",
        baseAmount: 50000
      },
      uploadedAt: "2026-02-28T09:15:00Z",
      status: "REJECTED",
      receiptUrl: "https://example.com/receipt3.jpg"
    }
  ];

  const handleApprove = async (payment) => {
    if (!hasPermission("paymentsManagement", "Editar")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para aprobar pagos"
      );
      return;
    }

    const confirmResult = await showConfirmAlert(
      "¿Aprobar pago?",
      `¿Estás seguro de aprobar el pago de ${payment.athlete?.user?.firstName} ${payment.athlete?.user?.lastName}?`,
      { confirmButtonText: "Sí, aprobar", cancelButtonText: "Cancelar" }
    );

    if (!confirmResult.isConfirmed) return;

    showSuccessAlert(
      "Pago aprobado",
      "El pago ha sido aprobado correctamente"
    );
  };

  const handleReject = async (payment) => {
    if (!hasPermission("paymentsManagement", "Editar")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para rechazar pagos"
      );
      return;
    }

    setPaymentToReject(payment);
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = async (paymentId, reason) => {
    if (!paymentToReject) return;

    showSuccessAlert(
      "Pago rechazado",
      `El pago de ${paymentToReject.athlete?.user?.firstName} ${paymentToReject.athlete?.user?.lastName} ha sido rechazado: ${reason}`
    );

    setIsRejectModalOpen(false);
    setPaymentToReject(null);
  };

  const handleViewPayment = (payment) => {
    // Abrir el comprobante en nueva pestaña
    if (payment.receiptUrl && payment.receiptUrl !== "#") {
      window.open(payment.receiptUrl, "_blank");
    } else {
      showErrorAlert("Error", "No hay comprobante disponible para este pago");
    }
  };

  // Filtrar datos según búsqueda y filtros
  const filteredPayments = mockPayments.filter(payment => {
    const matchesSearch = !searchTerm || 
      `${payment.athlete?.user?.firstName} ${payment.athlete?.user?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.athlete?.user?.identification?.includes(searchTerm);
    
    const matchesStatus = !filters.status || payment.status === filters.status;
    const matchesType = !filters.type || payment.obligation?.type === filters.type;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalRows = filteredPayments.length;
  const paginatedData = filteredPayments;

  return (
    <div className="p-6 font-questrial w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Gestión de Pagos</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar atleta..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <PermissionGuard module="paymentsManagement" action="Ver">
              <ReportButton
                data={filteredPayments.map((payment) => ({
                  atleta: `${payment.athlete?.user?.firstName} ${payment.athlete?.user?.lastName}`,
                  identificacion: payment.athlete?.user?.identification,
                  tipo: payment.obligation?.type === 'MONTHLY' ? 'Mensualidad' : 'Renovación',
                  periodo: payment.obligation?.period || 'Renovación',
                  monto: payment.obligation?.baseAmount,
                  fecha: new Date(payment.uploadedAt).toLocaleDateString('es-ES'),
                  estado: payment.status === 'PENDING' ? 'Pendiente' : 
                          payment.status === 'APPROVED' ? 'Aprobado' : 'Rechazado'
                }))}
                fileName="Pagos"
                columns={[
                  { header: "Atleta", accessor: "atleta" },
                  { header: "Identificación", accessor: "identificacion" },
                  { header: "Tipo", accessor: "tipo" },
                  { header: "Período", accessor: "periodo" },
                  { header: "Monto", accessor: "monto" },
                  { header: "Fecha", accessor: "fecha" },
                  { header: "Estado", accessor: "estado" }
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
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
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
              Tipo
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              <option value="">Todos los tipos</option>
              <option value="MONTHLY">Mensualidad</option>
              <option value="ENROLLMENT_RENEWAL">Renovación</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: "", type: "" })}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      {totalRows > 0 ? (
        <div className="w-full bg-white rounded-lg">
          <Table
            thead={{
              titles: [
                "Atleta",
                "Tipo",
                "Período",
                "Monto",
                "Fecha",
                "Estado"
              ],
              state: false,
              actions: true,
            }}
            tbody={{
              data: paginatedData.map((payment) => ({
                ...payment,
                atletaNombre: `${payment.athlete?.user?.firstName} ${payment.athlete?.user?.lastName}`,
                tipoTexto: payment.obligation?.type === 'MONTHLY' ? 'Mensualidad' : 'Renovación',
                periodoTexto: payment.obligation?.period || 'Renovación',
                montoTexto: `$${payment.obligation?.baseAmount?.toLocaleString()}`,
                fechaTexto: new Date(payment.uploadedAt).toLocaleDateString('es-ES'),
                estadoTexto: payment.status === 'PENDING' ? 'Pendiente' : 
                            payment.status === 'APPROVED' ? 'Aprobado' : 'Rechazado'
              })),
              dataPropertys: [
                "atletaNombre",
                "tipoTexto", 
                "periodoTexto",
                "montoTexto",
                "fechaTexto",
                "estadoTexto"
              ],
              state: false,
            }}
            onEdit={null}
            onDelete={null}
            onView={null}
            customActions={[
              {
                onClick: (payment) => handleViewPayment(payment),
                label: <FaEye className="w-4 h-4" />,
                className: "p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors",
                tooltip: "Ver comprobante",
              },
              {
                onClick: (payment) => handleApprove(payment),
                label: <FaCheck className="w-4 h-4" />,
                className: "p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors",
                tooltip: "Aprobar pago",
                show: (payment) => payment.status === 'PENDING' && hasPermission("paymentsManagement", "Editar"),
              },
              {
                onClick: (payment) => handleReject(payment),
                label: <FaTimes className="w-4 h-4" />,
                className: "p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors",
                tooltip: "Rechazar pago",
                show: (payment) => payment.status === 'PENDING' && hasPermission("paymentsManagement", "Editar"),
              }
            ]}
          />
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-10 py-8 bg-white rounded-2xl shadow border border-gray-200">
          No hay pagos registrados todavía.
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
      />
    </div>
  );
};

export default PaymentsManagementNew;