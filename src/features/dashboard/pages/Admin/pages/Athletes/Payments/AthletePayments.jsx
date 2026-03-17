import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FaUpload,
  FaHistory,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaLock,
  FaTimes,
  FaClock,
  FaFileAlt,
  FaDownload,
  FaEye,
} from "react-icons/fa";

import { useAuth } from "../../../../../../../shared/contexts/authContext.jsx";
import { paymentsService } from "./services/PaymentsService.js";
import { useAthleteFinancialStatus } from "./hooks/useAthleteFinancialStatus.js";
import { formatCurrency } from "./utils/currencyUtils.js";
import { showErrorAlert, showSuccessAlert } from "../../../../../../../shared/utils/alerts.js";
import SearchInput from "../../../../../../../shared/components/SearchInput.jsx";
import { PAGINATION_CONFIG } from "../../../../../../../shared/constants/paginationConfig.js";
import PaymentReceiptViewModal from "./components/PaymentReceiptViewModal.jsx";
import Table from "../../../../../../../shared/components/Table/table.jsx";

// ─────────────────────────────────────────────────────────────────────────────
// Modal de subida de comprobante - Mejorado y consistente
// ─────────────────────────────────────────────────────────────────────────────
const ReceiptUploadModal = ({ isOpen, onClose, obligationId, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Limpiar al cerrar
  useEffect(() => {
    if (isOpen) {
      resetModal();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const resetModal = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileError("");
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (file) => {
    if (!file) return;
    
    const errors = paymentsService.validateFile(file);
    if (errors.length > 0) {
      setFileError(errors.join(". "));
      setSelectedFile(null);
      setPreviewUrl(null);
    } else {
      setFileError("");
      setSelectedFile(file);
      
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !obligationId) return;
    setUploading(true);
    try {
      await paymentsService.uploadReceipt(obligationId, selectedFile);
      showSuccessAlert(
        "Comprobante enviado",
        "Enviado correctamente."
      );
      handleClose();
      onSuccess();
    } catch (error) {
      const msg = error?.response?.data?.message || "Error al subir el comprobante";
      showErrorAlert("Error", msg);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      resetModal();
      onClose();
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return <FaUpload className="text-gray-400" size={40} />;
    
    if (selectedFile.type === 'application/pdf') {
      return <FaFileAlt className="text-red-500" size={40} />;
    }
    return <FaUpload className="text-blue-500" size={40} />;
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-hidden relative flex flex-col">
        {/* Header mejorado */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-4 relative">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            onClick={handleClose}
            disabled={uploading}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center pr-8">
            Subir Comprobante
          </h2>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 min-h-0">
          {/* Área de subida de archivo */}
          {!selectedFile ? (
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                dragActive
                  ? 'border-primary-blue bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />

              <div className="space-y-3">
                <div className="flex justify-center">
                  {getFileIcon()}
                </div>
                <div>
                  <p className="text-gray-700 font-medium mb-1">
                    Seleccionar archivo
                  </p>
                  <p className="text-xs text-gray-500">
                    o arrastra y suelta aquí
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  <p>JPG, PNG, WEBP, PDF • Máx. 5MB</p>
                </div>
              </div>
            </div>
          ) : (
            /* Vista previa del archivo */
            <div className="space-y-3">
              <div className="p-2">
                <p className="text-green-700 text-sm">
                  ✓ {selectedFile.name}
                </p>
              </div>

              {/* Vista previa de imagen */}
              {previewUrl && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Vista previa:</p>
                  <div className="flex justify-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-32 rounded object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Botón para cambiar archivo */}
              <button
                onClick={resetModal}
                className="w-full py-1.5 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                disabled={uploading}
              >
                Cambiar archivo
              </button>
            </div>
          )}

          {/* Error de validación */}
          {fileError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Error de validación</p>
                  <p className="text-xs text-red-700 mt-1">{fileError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notas importantes */}
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <FaExclamationTriangle className="text-gray-500 flex-shrink-0 mt-0.5 text-sm" />
              <div>
                <h5 className="font-medium text-gray-700 mb-1 text-sm">Importante:</h5>
                <ul className="text-xs text-gray-600 space-y-0.5">
                  <li>• El comprobante debe mostrar claramente el monto pagado</li>
                  <li>• La imagen debe ser legible y completa</li>
                  <li>• Una vez enviado, estará en revisión por administración</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer mejorado */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              disabled={uploading}
            >
              Cancelar
            </button>
            {selectedFile ? (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-2 text-sm bg-primary-blue text-white rounded hover:bg-primary-purple transition-colors disabled:opacity-50"
              >
                {uploading ? "Enviando..." : "Enviar Comprobante"}
              </button>
            ) : (
              <button
                disabled
                className="px-4 py-2 text-sm bg-gray-300 text-gray-500 rounded cursor-not-allowed"
              >
                Selecciona un archivo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente de Historial de Pagos para Deportistas
// ─────────────────────────────────────────────────────────────────────────────
const HistorialPagosSection = ({ athleteId }) => {
  const [historialPagos, setHistorialPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(PAGINATION_CONFIG.DEFAULT_PAGE);
  const [receiptModal, setReceiptModal] = useState({ isOpen: false, payment: null, initialTab: "receipt" });

  useEffect(() => {
    const fetchHistorial = async () => {
      if (!athleteId) return;

      setLoading(true);
      setError(null);

      try {
        // Historial de pagos (intentos) y filtrar solo mensualidades
        const response = await paymentsService.getAthletePaymentHistory(athleteId);
        const raw = response?.data || response || [];
        const filtered = Array.isArray(raw)
          ? raw.filter((payment) => payment?.obligation?.type === "MONTHLY")
          : [];
        setHistorialPagos(filtered);
      } catch (err) {
        console.error('Error fetching payment history:', err);
        setError('No se pudo cargar el historial de mensualidades');
        setHistorialPagos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [athleteId]);

  const handleDownloadReceipt = async (payment) => {
    try {
      if (!payment.receiptUrl) {
        showErrorAlert('Error', 'No hay comprobante disponible para descargar');
        return;
      }
      
      await paymentsService.downloadReceiptLegacy(payment);
      showSuccessAlert('Éxito', 'Comprobante descargado correctamente');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      showErrorAlert('Error', 'No se pudo descargar el comprobante');
    }
  };

  const getPeriodText = (obligation) => {
    if (!obligation) return "—";
    if (obligation.period) {
      const date = new Date(`${obligation.period}-01T00:00:00`);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
      }
      return obligation.period;
    }
    if (obligation.dueStart) {
      const fecha = new Date(obligation.dueStart);
      return fecha.toLocaleDateString("es-ES", { month: 'long', year: 'numeric' });
    }
    return "Mensualidad";
  };

  if (loading) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-600">Cargando historial...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-600 mb-4">{error}</p>
      </div>
    );
  }

  if (!historialPagos || historialPagos.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-600">No tienes historial de mensualidades aún.</p>
        <p className="text-sm text-gray-500 mt-2">
          Aquí verás los intentos aprobados y rechazados con su estado.
        </p>
      </div>
    );
  }

  const tableData = historialPagos.map((payment) => {
    const obligation = payment.obligation || {};
    const status = String(payment?.status || "").toUpperCase();
    const statusLabel =
      status === "APPROVED"
        ? "Aprobado"
      : status === "REJECTED"
        ? "Rechazado"
        : status || "—";

    const reviewedAt = payment.reviewedAt || payment.processedAt || payment.approvedAt || payment.updatedAt;

    const baseAmount = obligation.baseAmount || 0;
    const totalAmount = obligation.totalAmount ?? payment?.totalAmount ?? baseAmount;
    const lateFeeAmount = obligation.lateFee ?? obligation.lateFeeAmount ?? payment?.lateFee ?? 0;
    const daysLate = obligation.lateDays ?? payment?.lateDays ?? 0;

    return {
      ...payment,
      status,
      statusLabel,
      periodoTexto: getPeriodText(obligation),
      montoTexto: formatCurrency(totalAmount),
      fechaTexto: reviewedAt
        ? new Date(reviewedAt).toLocaleDateString("es-ES")
        : "—",
      daysLate,
      lateFeeAmount,
      baseAmount,
      totalAmount
    };
  });

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredData = !normalizedSearch
    ? tableData
    : tableData.filter((row) => {
        const pieces = [
          row.periodoTexto,
          row.montoTexto,
          row.fechaTexto,
          row.status,
          row.statusLabel,
          row.rejectionReason,
          row.reason,
          row.baseAmount,
          row.totalAmount,
          row.dueStart,
          row.dueEnd,
          row.receiptName,
          row.receiptUrl,
        ];
        const haystack = pieces
          .filter((v) => v !== undefined && v !== null)
          .join(" ")
          .toString()
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      });

  const rowsPerPage = PAGINATION_CONFIG.ROWS_PER_PAGE;
  const totalRows = filteredData.length;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  return (
    <>
      <div className="flex justify-end mb-3">
        <div className="w-full sm:w-64">
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(PAGINATION_CONFIG.DEFAULT_PAGE);
            }}
            placeholder="Buscar deportista o identificación..."
          />
        </div>
      </div>

      {filteredData && filteredData.length > 0 ? (
        <Table
          serverPagination={true}
          currentPage={currentPage}
          totalRows={totalRows}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          thead={{
            titles: [
              "Período",
              "Monto",
              "Fecha", 
              "Estado"
            ],
            state: false,
            actions: true,
          }}
          tbody={{
            data: paginatedData,
            dataPropertys: [
              "periodoTexto",
              "montoTexto", 
              "fechaTexto",
              "statusBadge"
            ],
            state: false,
            customRenderers: {
                periodoTexto: (value) => (
                  <div className="font-medium text-gray-900">{value}</div>
                ),
              montoTexto: (value, row) => {
                // Mostrar desglose si hay mora
                if (row.lateFeeAmount > 0) {
                  return (
                    <div>
                      <div className="font-semibold text-gray-900">{formatCurrency(row.totalAmount)}</div>
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <div>Base: {formatCurrency(row.baseAmount)}</div>
                        <div className="text-red-600">
                          Mora: {formatCurrency(row.lateFeeAmount)}
                          {row.daysLate > 0 && ` (${row.daysLate} días)`}
                        </div>
                      </div>
                    </div>
                  );
                }
                return <div className="font-semibold text-gray-900">{value}</div>;
              },
              fechaTexto: (value) => (
                <div className="text-sm text-gray-600">{value}</div>
              ),
              statusBadge: (_value, row) => {
                const isRejected = row.status === "REJECTED";
                const isApproved = row.status === "APPROVED";
                const isPending = row.status === "PENDING";
                return (
                  <div className="space-y-1">
                    {isApproved && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        Aprobado
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                        Rechazado
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                        En revisión
                      </span>
                    )}
                    {!isApproved && !isRejected && !isPending && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                        Sin comprobante
                      </span>
                    )}
                  </div>
                );
              }
            }
          }}
          onView={(payment) => setReceiptModal({ isOpen: true, payment, initialTab: "receipt" })}
          buttonConfig={{
            view: (payment) => ({
              show: Boolean(payment.receiptUrl),
              disabled: false,
              title: "Ver comprobante",
            }),
          }}
          customActions={[
            {
              onClick: (payment) => handleDownloadReceipt(payment),
              label: <FaDownload className="w-4 h-4" />,
              className: "p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded transition-colors disabled:opacity-40",
              tooltip: "Descargar comprobante",
              show: (payment) => payment.receiptUrl,
            },
          ]}
          emptyMessage="No hay pagos en el historial"
        />
      ) : (
        <div className="p-4 text-center text-gray-500">
          No hay datos para mostrar en el historial.
        </div>
      )}

      <PaymentReceiptViewModal
        isOpen={receiptModal.isOpen}
        onClose={() => setReceiptModal({ isOpen: false, payment: null, initialTab: "receipt" })}
        payment={receiptModal.payment}
        initialTab={receiptModal.initialTab}
      />
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal - Mis Pagos (Rediseñado minimalista y responsive)
// ─────────────────────────────────────────────────────────────────────────────
const AthletePayments = () => {
  const { user } = useAuth();
  const athleteId = user?.athleteId || user?.athlete_id || user?.id;
  
  const {
    financialStatus,
    accessStatus,
    loading,
    error,
    summary,
    isRestricted,
    highestRestriction,
    pendingObligations,
    enrollmentObligation,
    totalDebt,
    isBlocked,
    refresh: fetchFinancialStatus
  } = useAthleteFinancialStatus(athleteId);

  const [activeTab, setActiveTab] = useState("pendientes");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedObligationId, setSelectedObligationId] = useState(null);
  const [pendingReceiptModal, setPendingReceiptModal] = useState({ isOpen: false, payment: null, initialTab: "receipt" });
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [monthlyHistoryLoading, setMonthlyHistoryLoading] = useState(false);

  useEffect(() => {
    const fetchMonthlyHistory = async () => {
      if (!athleteId) return;
      setMonthlyHistoryLoading(true);
      try {
        const response = await paymentsService.getAthleteMonthlyHistory(athleteId);
        const history = response?.history || response?.data?.history || response?.data || [];
        setMonthlyHistory(Array.isArray(history) ? history : []);
      } catch (err) {
        console.error("Error fetching monthly history:", err);
        setMonthlyHistory([]);
      } finally {
        setMonthlyHistoryLoading(false);
      }
    };

    fetchMonthlyHistory();
  }, [athleteId]);

  // ── Lógica de matrícula ──
  const isReallyInitialEnrollment = enrollmentObligation && (
    enrollmentObligation.isInitial === true ||
    enrollmentObligation.type === 'ENROLLMENT_INITIAL' ||
    financialStatus?.enrollment?.estado === 'Pending_Payment' ||
    !enrollmentObligation.needsRenewal ||
    !financialStatus?.enrollment?.fechaInicio
  );

  const isReallyRenewal = enrollmentObligation && !isReallyInitialEnrollment && (
    enrollmentObligation.needsRenewal === true ||
    enrollmentObligation.type === 'ENROLLMENT_RENEWAL' ||
    financialStatus?.enrollment?.fechaInicio
  );

  const hasActiveEnrollment = financialStatus?.enrollment?.estado === 'Vigente' && 
                              financialStatus?.enrollment?.fechaInicio;
  
  const shouldShowEnrollmentPayment = enrollmentObligation && (
    !hasActiveEnrollment || 
    financialStatus?.enrollment?.estado === 'Pending_Payment' || 
    financialStatus?.enrollment?.estado === 'Vencida' ||
    !financialStatus?.enrollment?.fechaInicio
  );

  // ── Handlers ──
  const handleUploadReceipt = (obligationId) => {
    setSelectedObligationId(obligationId);
    setUploadModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const configs = {
      PENDING: { color: "bg-gray-50 text-gray-700 border-gray-200", text: "En revisión", icon: FaClock },
      APPROVED: { color: "bg-green-50 text-green-700 border-green-200", text: "Aprobado", icon: FaCheckCircle },
      REJECTED: { color: "bg-red-50 text-red-700 border-red-200", text: "Rechazado", icon: FaTimesCircle },
    };
    return configs[status] || { color: "bg-gray-50 text-gray-700 border-gray-200", text: "Sin comprobante", icon: FaFileAlt };
  };

  // Filtrar obligaciones
  const monthlySource = (monthlyHistory && monthlyHistory.length > 0) ? monthlyHistory : (pendingObligations || []);

  const pendingObligationsFiltered = monthlySource.filter(
    (d) => d.paymentStatus === null || d.paymentStatus === "REJECTED"
  );

  const inReviewObligations = monthlySource.filter(
    (d) => d.paymentStatus === "PENDING"
  );

  // ── Loading ──
  if (loading) {
    return (
      <div className="p-4 sm:p-6 font-questrial">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Mis Pagos</h1>
        <div className="flex justify-center items-center py-20 bg-white rounded-xl shadow border border-gray-200">
          <span className="text-sm text-gray-500">Cargando información...</span>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="p-4 sm:p-6 font-questrial">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Mis Pagos</h1>
        <div className="text-center py-16 bg-white rounded-xl shadow border border-gray-200">
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchFinancialStatus}
            className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors text-sm"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }
  // ─── Caso: Matrícula inicial pendiente ───
  if (shouldShowEnrollmentPayment && isReallyInitialEnrollment) {
    const enroll = enrollmentObligation;
    const canUpload = enroll.paymentStatus === null || enroll.paymentStatus === "REJECTED";

    return (
      <div className="p-4 sm:p-6 font-questrial">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Mis Pagos</h1>

        {/* Banner informativo */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-blue-800 mb-1">Matrícula Inicial Requerida</h2>
              <p className="text-sm text-blue-700">
                Completa el pago de tu matrícula inicial para acceder completamente al sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Tarjeta de pago */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Matrícula Inicial</h3>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(enroll.amount)}</div>
            </div>
          </div>

          {enroll.paymentStatus === "REJECTED" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <FaTimesCircle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                <div>
                  <p className="text-sm font-medium text-red-800">Comprobante rechazado</p>
                  <p className="text-xs text-red-700 mt-1">
                    Sube un nuevo comprobante con la información correcta.
                  </p>
                  {enroll.rejectionReason && (
                    <p className="text-xs text-red-700 mt-1">
                      Motivo: {enroll.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {enroll.paymentStatus === "PENDING" ? (
            <div className="flex items-center gap-2 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              <FaClock className="text-yellow-600" />
              <span className="text-yellow-800">Comprobante en revisión</span>
            </div>
          ) : canUpload ? (
            <button
              onClick={() => handleUploadReceipt(enroll.obligationId)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors font-medium"
            >
              <FaUpload />
              {enroll.paymentStatus === "REJECTED" ? "Subir nuevo comprobante" : "Subir comprobante"}
            </button>
          ) : null}
        </div>

        <ReceiptUploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          obligationId={selectedObligationId}
          onSuccess={fetchFinancialStatus}
        />
      </div>
    );
  }

  // ─── Caso: Renovación de matrícula ───
  if (shouldShowEnrollmentPayment && isReallyRenewal) {
    const enroll = enrollmentObligation;
    const canUpload = enroll.paymentStatus === null || enroll.paymentStatus === "REJECTED";

    return (
      <div className="p-4 sm:p-6 font-questrial">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Mis Pagos</h1>

        {/* Banner informativo */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 sm:p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-purple-800 mb-1">Renovación de Matrícula</h2>
              <p className="text-sm text-purple-700">
                Tu matrícula ha vencido. Renuévala para continuar accediendo al sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Tarjeta de renovación */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Renovación Matrícula</h3>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(enroll.amount)}</div>
            </div>
          </div>

          {enroll.paymentStatus === "REJECTED" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <FaTimesCircle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                <div>
                  <p className="text-sm font-medium text-red-800">Comprobante rechazado</p>
                  <p className="text-xs text-red-700 mt-1">Sube un nuevo comprobante.</p>
                  {enroll.rejectionReason && (
                    <p className="text-xs text-red-700 mt-1">
                      Motivo: {enroll.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {enroll.paymentStatus === "PENDING" ? (
            <div className="flex items-center gap-2 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              <FaClock className="text-yellow-600" />
              <span className="text-yellow-800">Comprobante en revisión</span>
            </div>
          ) : canUpload ? (
            <button
              onClick={() => handleUploadReceipt(enroll.obligationId)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors font-medium"
            >
              <FaUpload />
              {enroll.paymentStatus === "REJECTED" ? "Subir nuevo comprobante" : "Subir comprobante"}
            </button>
          ) : null}
        </div>

        <ReceiptUploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          obligationId={selectedObligationId}
          onSuccess={fetchFinancialStatus}
        />
      </div>
    );
  }
  // ─── Vista principal: Mensualidades ───
  return (
    <div className="p-4 sm:p-6 font-questrial">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Mis Pagos</h1>
        
        {/* Estado financiero */}
        {summary && (
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
            summary.status === 'current' ? 'bg-green-50 text-green-700 border-green-200' :
            summary.status === 'debt' ? 'bg-orange-50 text-orange-700 border-orange-200' :
            summary.status === 'blocked' ? 'bg-red-50 text-red-700 border-red-200' :
            summary.status === 'renewal' ? 'bg-purple-50 text-purple-700 border-purple-200' :
            'bg-gray-50 text-gray-700 border-gray-200'
          }`}>
            {summary.text}
          </div>
        )}
      </div>

      {/* Banner de restricción */}
      {isRestricted && accessStatus && highestRestriction?.blockType === "total" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <FaLock className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
            <div className="flex-1">
              <p className="font-medium text-red-800 text-sm">Acceso Restringido</p>
              <p className="text-xs text-red-600 mt-1">
                {accessStatus.message || 'Paga tus mensualidades pendientes para recuperar el acceso.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resumen financiero minimalista */}
      {totalDebt && totalDebt.totalAmount > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumen Financiero</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-gray-800">
                {formatCurrency(totalDebt.totalAmount)}
              </div>
              <div className="text-xs text-gray-600 mt-1">Total pendiente (Base + Mora)</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-gray-800">
                {formatCurrency(totalDebt.monthlyAmount)}
              </div>
              <div className="text-xs text-gray-600 mt-1">Base de mensualidades pendientes</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-gray-800">
                {formatCurrency(totalDebt.lateFeeAmount)}
              </div>
              <div className="text-xs text-gray-600 mt-1">Mora acumulada (días de atraso)</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <FaExclamationTriangle className="text-blue-600 flex-shrink-0 mt-0.5" size={14} />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Resumen claro:</p>
                <p>
                  {totalDebt.obligationsCount} mensualidad{totalDebt.obligationsCount !== 1 ? "es" : ""} pendiente{totalDebt.obligationsCount !== 1 ? "s" : ""}.
                  {totalDebt.maxDaysLate > 0 && ` Mora más alta: ${totalDebt.maxDaysLate} días.`}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  El total pendiente = base pendiente ({formatCurrency(totalDebt.monthlyAmount)}) + mora ({formatCurrency(totalDebt.lateFeeAmount)}).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs minimalistas */}
      <div className="mb-6">
        <div className="inline-flex gap-2">
          <button
            onClick={() => setActiveTab("pendientes")}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 relative ${
              activeTab === "pendientes"
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
            <span>Pendientes</span>
            {pendingObligationsFiltered.length > 0 && activeTab !== "pendientes" ? (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {pendingObligationsFiltered.length}
              </span>
            ) : (
              <span
                className={`px-1.5 py-0.5 rounded-md text-xs font-medium ${
                  activeTab === "pendientes"
                    ? "bg-primary-purple text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {pendingObligationsFiltered.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("revision")}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 relative ${
              activeTab === "revision"
                ? "bg-yellow-500/10 text-yellow-600"
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <span>En Revisión</span>
            {inReviewObligations.length > 0 && activeTab !== "revision" ? (
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {inReviewObligations.length}
              </span>
            ) : (
              <span
                className={`px-1.5 py-0.5 rounded-md text-xs font-medium ${
                  activeTab === "revision"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {inReviewObligations.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("historial")}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === "historial"
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Historial</span>
          </button>
        </div>
      </div>
      {/* Contenido de tabs */}
      <div className="space-y-4">
        {activeTab === "pendientes" && (
          <>
            {pendingObligationsFiltered.length > 0 ? (
              <Table
                thead={{
                  titles: ["Período", "Monto", "Mora", "Estado"],
                  state: false,
                  actions: true,
                }}
                tbody={{
                  data: pendingObligationsFiltered.map((obligation) => {
                    const statusLabel =
                      obligation.paymentStatus === "REJECTED"
                        ? "Rechazado"
                        : obligation.paymentStatus === "PENDING"
                          ? "En revisión"
                          : "Pendiente";
                    return {
                      ...obligation,
                      periodText: obligation.period
                        ? new Date(obligation.period + "-01T00:00:00").toLocaleDateString("es-ES", { month: "long", year: "numeric" })
                        : "Mensualidad",
                      amountText: formatCurrency(obligation.totalAmount || obligation.totalToPay || obligation.baseAmount || 0),
                      statusLabel,
                    };
                  }),
                  dataPropertys: ["periodText", "amountText", "lateText", "statusText"],
                  state: false,
                  customRenderers: {
                    amountText: (_value, row) => (
                      <div>
                        <div className="font-semibold text-gray-900">{formatCurrency(row.totalAmount || row.totalToPay || row.baseAmount || 0)}</div>
                        {(row.lateFee || 0) > 0 && (
                          <div className="text-xs text-gray-500">
                            Base: {formatCurrency(row.baseAmount)}
                          </div>
                        )}
                      </div>
                    ),
                    lateText: (_value, row) =>
                      row.daysLate > 0 ? (
                        <div className="text-sm">
                          <div className="font-medium text-red-600">
                            {row.daysLate} días
                          </div>
                          <div className="text-xs text-red-500">
                            {formatCurrency(row.lateFee || 0)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      ),
                    statusText: (_value, row) => (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        row.statusLabel === "Rechazado"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : row.statusLabel === "En revisión"
                            ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                            : "bg-gray-50 text-gray-700 border border-gray-200"
                      }`}>
                        {row.statusLabel}
                      </span>
                    ),
                  },
                }}
                onView={(row) =>
                  setPendingReceiptModal({
                    isOpen: true,
                    payment: { ...row, status: row.paymentStatus },
                    initialTab: row.paymentStatus === "REJECTED" ? "rejection" : "receipt",
                  })
                }
                buttonConfig={{
                  view: (row) => ({
                    show: Boolean(row.receiptUrl),
                    disabled: false,
                    title: "Ver comprobante",
                  }),
                }}
                customActions={[
                  {
                    onClick: (row) => handleUploadReceipt(row.id),
                    label: (row) => (
                      <span className="inline-flex items-center gap-2">
                        <FaUpload className="w-4 h-4" />
                        {row.paymentStatus === "REJECTED" ? "Resubir" : "Subir"}
                      </span>
                    ),
                    className: "inline-flex items-center gap-2 px-4 py-2 bg-primary-blue text-white text-sm font-medium rounded-lg hover:bg-primary-purple transition-all duration-200 shadow-sm hover:shadow-md",
                    tooltip: "Subir comprobante",
                    show: (row) => row.paymentStatus === null || row.paymentStatus === "REJECTED",
                  },
                ]}
              />
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <FaCheckCircle className="mx-auto text-4xl text-green-400 mb-3" />
                <p className="text-gray-600">¡Estás al día! No tienes pagos pendientes.</p>
              </div>
            )}
          </>
        )}

        {activeTab === "revision" && (
          <>
            {inReviewObligations.length > 0 ? (
              <Table
                thead={{
                  titles: ["Período", "Monto", "Fecha envío", "Estado"],
                  state: false,
                  actions: true,
                }}
                tbody={{
                  data: inReviewObligations.map((obligation) => ({
                    ...obligation,
                    periodText: obligation.period
                      ? new Date(obligation.period + "-01T00:00:00").toLocaleDateString("es-ES", { month: "long", year: "numeric" })
                      : "Mensualidad",
                    amountText: formatCurrency(obligation.totalAmount || obligation.totalToPay || obligation.baseAmount || 0),
                    uploadedText: obligation.uploadedAt
                      ? new Date(obligation.uploadedAt).toLocaleString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—",
                  })),
                  dataPropertys: ["periodText", "amountText", "uploadedText", "statusText"],
                  state: false,
                  customRenderers: {
                    amountText: (_value, row) => (
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(row.totalAmount || row.totalToPay || row.baseAmount || 0)}
                      </div>
                    ),
                    statusText: () => (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                        En revisión
                      </span>
                    ),
                  },
                }}
                onView={(row) =>
                  setPendingReceiptModal({
                    isOpen: true,
                    payment: { ...row, status: row.paymentStatus || "PENDING" },
                    initialTab: "receipt",
                  })
                }
                buttonConfig={{
                  view: (row) => ({
                    show: Boolean(row.receiptUrl),
                    disabled: false,
                    title: "Ver comprobante",
                  }),
                }}
              />
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <FaClock className="mx-auto text-4xl text-gray-300 mb-3" />
                <p className="text-gray-600">No tienes pagos en revisión.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Los comprobantes que subas aparecerán aquí mientras son verificados.
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === "historial" && (
          <HistorialPagosSection athleteId={athleteId} />
        )}
      </div>

      {/* Modal de subida */}
      <ReceiptUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        obligationId={selectedObligationId}
        onSuccess={fetchFinancialStatus}
      />

      <PaymentReceiptViewModal
        isOpen={pendingReceiptModal.isOpen}
        onClose={() => setPendingReceiptModal({ isOpen: false, payment: null, initialTab: "receipt" })}
        payment={pendingReceiptModal.payment}
        initialTab={pendingReceiptModal.initialTab}
      />
    </div>
  );
};

export default AthletePayments;
