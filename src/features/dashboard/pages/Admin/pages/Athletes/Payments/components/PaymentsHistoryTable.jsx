import { FaDownload } from "react-icons/fa";
import Table from "../../../../../../../../shared/components/Table/table.jsx";
import { usePermissions } from "../../../../../../../../shared/hooks/usePermissions.js";
import { usePayments } from "../hooks/usePayments.js";
import { useDownloadReceipt } from "../hooks/useDownloadReceipt.js";
import { formatCurrency } from "../utils/currencyUtils.js";
import { 
  calculateLateFee, 
  calculateLateDays,
  BUSINESS_CONSTANTS 
} from "../constants/paymentConstants.js";
import { PAGINATION_CONFIG } from "../../../../../../../../shared/constants/paginationConfig.js";

const PaymentsHistoryTable = ({ 
  onViewPayment, 
  searchTerm = "",
  statusFilter = "",
  typeFilter = "",
  dateFromFilter = "",
  dateToFilter = ""
}) => {
  const { hasPermission } = usePermissions();
  const {
    payments: allPayments,
    loading: allLoading,
    currentPage,
    totalRows,
    handlePageChange,
  } = usePayments('all', { 
    search: searchTerm,
    status: statusFilter,
    type: typeFilter,
    dateFrom: dateFromFilter,
    dateTo: dateToFilter
  });
  
  const { downloadReceipt, downloading } = useDownloadReceipt();

  // ── Descargar comprobante ──
  const handleDownloadPayment = async (payment) => {
    if (!payment.receiptUrl) return;
    await downloadReceipt(payment);
  };

  // El backend debería enviar solo pagos procesados (APPROVED/REJECTED)
  // pero por seguridad filtramos aquí también
  const processedPayments = allPayments.filter(p => p.status !== 'PENDING');

  const tableData = processedPayments.map((payment) => {
    // Generar texto del período
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
      ...payment,
      atletaNombre: `${payment.athlete?.user?.firstName || ""} ${payment.athlete?.user?.lastName || ""}`.trim(),
      atletaDoc: payment.athlete?.user?.identification || "",
      obligationType: payment.obligation?.type || "",
      periodoTexto,
      montoTexto: formatCurrency(payment.obligation?.totalAmount || payment.obligation?.baseAmount || 0),
      fechaTexto: payment.processedAt || payment.updatedAt
        ? new Date(payment.processedAt || payment.updatedAt).toLocaleDateString("es-ES")
        : "—",
    };
  });

  if (allLoading) {
    return (
      <div className="text-center text-gray-500 mt-10 py-8 bg-white rounded-2xl shadow border border-gray-200">
        Cargando historial de pagos...
      </div>
    );
  }

  if (allPayments.length === 0) {
    const hasFilters = searchTerm || statusFilter || typeFilter || dateFromFilter || dateToFilter;
    return (
      <div className="text-center text-gray-500 mt-10 py-8 bg-white rounded-2xl shadow border border-gray-200">
        <p>No hay pagos procesados{hasFilters ? " con los filtros actuales" : ""}.</p>
      </div>
    );
  }

  if (processedPayments.length === 0 && allPayments.length > 0) {
    return (
      <div className="text-center text-gray-500 mt-10 py-8 bg-white rounded-2xl shadow border border-gray-200">
        <p>Todos los pagos están pendientes de aprobación.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg">
      <Table
        serverPagination={true}
        totalRows={totalRows}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        rowsPerPage={PAGINATION_CONFIG.ROWS_PER_PAGE}
        thead={{
          titles: [
            "Nombre",
            "Identificación",
            "Tipo",
            "Período",
            "Monto",
            "Fecha Procesado",
            "Estado Final",
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
            obligationType: (value) => {
              const labels = {
                'MONTHLY': 'Mensualidad',
                'ENROLLMENT_INITIAL': 'Matrícula Inicial',
                'ENROLLMENT_RENEWAL': 'Renovación Matrícula'
              };
              return <span className="text-gray-700">{labels[value] || value}</span>;
            },
            montoTexto: (value, payment) => {
              const obligation = payment.obligation;
              if (!obligation) {
                return <span className="font-semibold">{value}</span>;
              }

              // ✅ SISTEMA EMPRESARIAL: Calcular mora usando funciones estándar
              const baseAmount = obligation.baseAmount || 0;
              let lateFeeAmount = 0;
              let totalAmount = baseAmount;
              let daysLate = 0;

              // Si es mensualidad, calcular mora hasta la fecha de procesamiento
              if (obligation.type === 'MONTHLY' && obligation.dueEnd) {
                // ✅ CRÍTICO: Para historial, usar fecha de procesamiento, no fecha actual
                const processedDate = new Date(payment.reviewedAt || payment.updatedAt);
                const dueDate = new Date(obligation.dueEnd);
                
                if (processedDate > dueDate) {
                  // Calcular mora hasta la fecha de procesamiento (Sistema Empresarial)
                  const daysLateAtProcessing = Math.ceil((processedDate - dueDate) / (1000 * 60 * 60 * 24));
                  daysLate = daysLateAtProcessing;
                  lateFeeAmount = calculateLateFee(daysLateAtProcessing);
                }
              }

              // Si el backend ya envía los montos calculados, usarlos
              if (obligation.lateFeeAmount !== undefined) {
                lateFeeAmount = obligation.lateFeeAmount;
              }
              if (obligation.totalAmount !== undefined) {
                totalAmount = obligation.totalAmount;
              } else {
                totalAmount = baseAmount + lateFeeAmount;
              }

              // Mostrar desglose si hay mora
              if (lateFeeAmount > 0) {
                return (
                  <div className="max-w-[140px] whitespace-normal break-words">
                    <div className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</div>
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <div>Base: {formatCurrency(baseAmount)}</div>
                      <div className="text-red-600">
                        Mora: {formatCurrency(lateFeeAmount)}
                        {daysLate > 0 && ` (${daysLate} días)`}
                      </div>
                    </div>
                  </div>
                );
              }
              
              return (
                <span className="font-semibold text-gray-900 max-w-[140px] whitespace-normal break-words block">
                  {formatCurrency(totalAmount)}
                </span>
              );
            },
            status: (value, payment) => {
              const statusLabels = {
                'APPROVED': 'Aprobado',
                'REJECTED': 'Rechazado',
                'PENDING': 'Pendiente' // No debería aparecer, pero por seguridad
              };
              const statusColors = {
                'APPROVED': 'text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium',
                'REJECTED': 'text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium',
                'PENDING': 'text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs font-medium'
              };
              
              const statusText = statusLabels[value] || value;
              const colorClass = statusColors[value] || 'text-gray-600 bg-gray-50 px-2 py-1 rounded-full text-xs font-medium';
              
              return (
                <span className={colorClass}>
                  {statusText}
                </span>
              );
            },
          },
        }}
        onEdit={null}
        onDelete={null}
        onView={hasPermission("paymentsManagement", "Ver") ? onViewPayment : null}
        buttonConfig={{
          view: (payment) => ({
            show: hasPermission("paymentsManagement", "Ver") && payment.receiptUrl,
            disabled: false,
            title: "Ver comprobante",
          }),
        }}
        customActions={[
          {
            onClick: (payment) => handleDownloadPayment(payment),
            label: <FaDownload className="w-4 h-4" />,
            className:
              "p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded transition-colors disabled:opacity-40",
            tooltip: "Descargar comprobante",
            show: (payment) => payment.receiptUrl,
          },
        ]}
      />
    </div>
  );
};

export default PaymentsHistoryTable;
