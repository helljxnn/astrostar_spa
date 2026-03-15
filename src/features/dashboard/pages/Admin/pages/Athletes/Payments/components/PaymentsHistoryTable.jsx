import { FaDownload } from "react-icons/fa";
import Table from "../../../../../../../../shared/components/Table/table.jsx";
import { usePermissions } from "../../../../../../../../shared/hooks/usePermissions.js";
import { usePayments } from "../hooks/usePayments.js";
import { useDownloadReceipt } from "../hooks/useDownloadReceipt.js";
import { formatCurrency } from "../utils/currencyUtils.js";
import { PAGINATION_CONFIG } from "../../../../../../../../shared/constants/paginationConfig.js";

const PaymentsHistoryTable = ({ onViewPayment, filters, setFilters }) => {
  const { hasPermission } = usePermissions();
  const {
    payments: allPayments,
    loading: allLoading,
    currentPage,
    totalRows,
    handlePageChange,
  } = usePayments('all');
  
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
      montoTexto: formatCurrency(payment.obligation?.baseAmount),
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
    return (
      <div className="text-center text-gray-500 mt-10 py-8 bg-white rounded-2xl shadow border border-gray-200">
        <p>No hay pagos procesados{filters.status || filters.type ? " con los filtros seleccionados" : ""}.</p>
        <div className="text-sm mt-4 p-4 bg-blue-50 rounded-lg">
          <p><strong>💡 Información:</strong></p>
          <p>• Este historial muestra solo pagos <strong>aprobados</strong> o <strong>rechazados</strong></p>
          <p>• Los pagos <strong>pendientes</strong> aparecen en el tab "Pagos Pendientes"</p>
          <p>• Usa los filtros para buscar pagos específicos</p>
        </div>
      </div>
    );
  }

  if (processedPayments.length === 0 && allPayments.length > 0) {
    return (
      <div className="text-center text-gray-500 mt-10 py-8 bg-white rounded-2xl shadow border border-gray-200">
        <p>Todos los pagos están pendientes de aprobación.</p>
        <div className="text-sm mt-4 p-4 bg-yellow-50 rounded-lg">
          <p><strong>Estado actual:</strong></p>
          <p>• Se encontraron {allPayments.length} pagos, pero todos están <strong>PENDING</strong></p>
          <p>• Ve al tab "Pagos Pendientes" para aprobar o rechazar pagos</p>
          <p>• Una vez procesados, aparecerán en este historial</p>
        </div>
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
            label: downloading ? (
              <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full" />
            ) : (
              <FaDownload className="w-4 h-4" />
            ),
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