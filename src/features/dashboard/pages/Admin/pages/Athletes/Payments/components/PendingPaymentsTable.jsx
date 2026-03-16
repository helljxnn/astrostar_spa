import { FaTimes, FaDownload, FaCheck } from "react-icons/fa";
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
import { showConfirmAlert } from "../../../../../../../../shared/utils/alerts.js";
import { PAGINATION_CONFIG } from "../../../../../../../../shared/constants/paginationConfig.js";

const PendingPaymentsTable = ({ onViewPayment, onRejectPayment, typeFilter = "", dateFromFilter = "", dateToFilter = "", searchTerm = "" }) => {
  const { hasPermission } = usePermissions();
  const {
    payments: pendingPayments,
    loading: pendingLoading,
    actionLoading,
    currentPage,
    totalRows,
    handlePageChange,
    refetch: refetchPending,
    approvePayment: approvePendingPayment,
  } = usePayments('pending', { 
    search: searchTerm,
    type: typeFilter,
    dateFrom: dateFromFilter,
    dateTo: dateToFilter
  });
  
  const { downloadReceipt, downloading } = useDownloadReceipt();

  // ── Aprobar ──
  const handleApprove = async (payment) => {
    if (!hasPermission("paymentsManagement", "Editar")) return;

    const confirmResult = await showConfirmAlert(
      "¿Aprobar comprobante?",
      `¿Confirmas que el comprobante de ${payment.athlete?.user?.firstName} ${payment.athlete?.user?.lastName} es válido?`,
      { confirmButtonText: "Sí, aprobar", cancelButtonText: "Cancelar" }
    );
    if (!confirmResult.isConfirmed) return;

    await approvePendingPayment(payment.id);
    refetchPending();
  };

  // ── Descargar comprobante ──
  const handleDownloadPayment = async (payment) => {
    if (!payment.receiptUrl) return;
    await downloadReceipt(payment);
  };

  // ✅ SISTEMA EMPRESARIAL ESTÁNDAR: Calcular mora usando funciones corregidas
  const getMoraInfoFromBackend = (payment) => {
    const obligation = payment.obligation;
    if (!obligation) {
      return { diasMora: 0, diasMoraTexto: "—", montoConMora: 0, isSuspended: false };
    }

    // Verificar si está suspendida
    const isSuspended = obligation.metadata?.suspended === true;
    if (isSuspended) {
      return {
        diasMora: 0,
        diasMoraTexto: "Suspendida",
        montoConMora: obligation.totalAmount || obligation.baseAmount || 0,
        isSuspended: true
      };
    }

    // ✅ SISTEMA EMPRESARIAL: Calcular mora desde vencimiento hasta HOY
    let diasMora = 0;
    let lateFeeAmount = 0;
    const baseAmount = obligation.baseAmount || 0;

    if (obligation.type === 'MONTHLY' && obligation.dueEnd) {
      // ✅ CRÍTICO: Usar fecha actual, NO fecha de subida
      diasMora = calculateLateDays(obligation.dueEnd);
      lateFeeAmount = calculateLateFee(diasMora);
    }

    // Si el backend ya envía los datos calculados, usarlos (tienen prioridad)
    if (obligation.daysLate !== undefined) {
      diasMora = obligation.daysLate;
    }
    if (obligation.lateFeeAmount !== undefined) {
      lateFeeAmount = obligation.lateFeeAmount;
    }

    const montoConMora = baseAmount + lateFeeAmount;
    
    let diasMoraTexto = "Al día";
    if (diasMora > 0) {
      diasMoraTexto = `${diasMora} días`;
    }
    
    return { diasMora, diasMoraTexto, montoConMora, isSuspended: false };
  };

  const tableData = pendingPayments.map((payment) => {
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

    const moraInfo = getMoraInfoFromBackend(payment);
    
    return {
      ...payment,
      atletaNombre: `${payment.athlete?.user?.firstName || ""} ${payment.athlete?.user?.lastName || ""}`.trim(),
      atletaDoc: payment.athlete?.user?.identification || "",
      obligationType: payment.obligation?.type || "",
      periodoTexto,
      montoConMoraTexto: formatCurrency(moraInfo.montoConMora),
      moraTexto: moraInfo.diasMoraTexto || "—",
      fechaTexto: payment.uploadedAt
        ? new Date(payment.uploadedAt).toLocaleDateString("es-ES")
        : "—",
      moraInfo,
    };
  });

  if (pendingLoading) {
    return (
      <div className="text-center text-gray-500 mt-10 py-8 bg-white rounded-2xl shadow border border-gray-200">
        Cargando pagos pendientes...
      </div>
    );
  }

  if (tableData.length === 0) {
    const hasFilters = typeFilter || dateFromFilter || dateToFilter || searchTerm;
    return (
      <div className="text-center text-gray-500 mt-10 py-8 bg-white rounded-2xl shadow border border-gray-200">
        <p>
          {hasFilters 
            ? `No hay pagos pendientes con los filtros o búsqueda seleccionados.`
            : `No hay pagos pendientes de aprobación.`
          }
        </p>
        {hasFilters && (
          <p className="text-sm mt-2 text-gray-400">
            Prueba limpiando los filtros y la búsqueda para ver todos los pagos pendientes.
          </p>
        )}
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
            "Días de mora",
            "Fecha Subida",
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
            "montoConMoraTexto",
            "moraTexto",
            "fechaTexto",
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
            moraTexto: (value, payment) => {
              if (!payment.moraInfo || payment.obligationType !== 'MONTHLY') {
                return <span className="text-gray-400">—</span>;
              }
              
              const { diasMora, diasMoraTexto, isSuspended } = payment.moraInfo;
              
              // ✅ Mostrar estado suspendido
              if (isSuspended) {
                return (
                  <span className="inline-flex items-center gap-1 text-gray-600 font-medium">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    Suspendida
                  </span>
                );
              }
              
              if (diasMora > 0) {
                // ✅ Indicadores visuales según rangos de mora
                let colorClass = "text-red-600";
                let bgDot = "bg-red-500";
                
                if (diasMora >= 90) {
                  // 90+ días: Rojo crítico - límite máximo
                  colorClass = "text-red-700";
                  bgDot = "bg-red-600";
                } else if (diasMora >= 71) {
                  // 71-89 días: Naranja - cerca del límite
                  colorClass = "text-orange-600";
                  bgDot = "bg-orange-500";
                } else if (diasMora >= 16) {
                  // 16-70 días: Amarillo - mora considerable
                  colorClass = "text-yellow-600";
                  bgDot = "bg-yellow-500";
                } else {
                  // 1-15 días: Verde - mora moderada
                  colorClass = "text-green-600";
                  bgDot = "bg-green-500";
                }
                
                return (
                  <span className={`inline-flex items-center gap-1.5 ${colorClass} font-medium`}>
                    <span className={`w-2 h-2 ${bgDot} rounded-full`}></span>
                    {diasMoraTexto}
                  </span>
                );
              } else {
                return (
                  <span className="inline-flex items-center gap-1.5 text-green-600 font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {diasMoraTexto}
                  </span>
                );
              }
            },
            montoConMoraTexto: (value, payment) => {
              const obligation = payment.obligation;
              if (!obligation) {
                return <span className="font-semibold">{value}</span>;
              }

              // ✅ SISTEMA EMPRESARIAL: Calcular mora usando funciones estándar
              const baseAmount = obligation.baseAmount || 0;
              let lateFeeAmount = 0;
              let totalAmount = baseAmount;

              // Si es mensualidad, calcular mora actual desde vencimiento hasta HOY
              if (obligation.type === 'MONTHLY' && obligation.dueEnd) {
                const daysLate = calculateLateDays(obligation.dueEnd);
                lateFeeAmount = calculateLateFee(daysLate);
              }

              // Si el backend ya envía los montos calculados, usarlos (tienen prioridad)
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
                  <div>
                    <div className="font-semibold text-red-600">{formatCurrency(totalAmount)}</div>
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <div>Base: {formatCurrency(baseAmount)}</div>
                      <div className="text-red-600">Mora: {formatCurrency(lateFeeAmount)}</div>
                    </div>
                  </div>
                );
              }
              
              return <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>;
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
          {
            onClick: (payment) => handleApprove(payment),
            label: <FaCheck className="w-4 h-4" />,
            className:
              "p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors disabled:opacity-40",
            tooltip: "Aprobar pago",
            show: (payment) =>
              payment.status === "PENDING" &&
              hasPermission("paymentsManagement", "Editar"),
          },
          {
            onClick: (payment) => onRejectPayment(payment),
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
  );
};

export default PendingPaymentsTable;
