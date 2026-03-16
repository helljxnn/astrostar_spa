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
const HistorialPagosSection = ({ athleteId, financialStatus }) => {
  const [historialPagos, setHistorialPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistorial = async () => {
      if (!athleteId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Obtener historial de pagos aprobados del atleta
        const response = await paymentsService.getAthletePaymentHistory(athleteId);
        setHistorialPagos(response.data || response || []);
      } catch (err) {
        console.error('Error fetching payment history:', err);
        setError('No se pudo cargar el historial de pagos');
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
      return obligation.period;
    }
    
    switch (obligation.type) {
      case "ENROLLMENT_INITIAL":
        return "Matrícula Inicial";
      case "ENROLLMENT_RENEWAL":
        return "Renovación Matrícula";
      case "MONTHLY":
        if (obligation.dueStart) {
          const fecha = new Date(obligation.dueStart);
          return fecha.toLocaleDateString("es-ES", { month: 'long', year: 'numeric' });
        }
        return "Mensualidad";
      default:
        return obligation.type || "—";
    }
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
        <p className="text-gray-600">No tienes pagos aprobados aún.</p>
        <p className="text-sm text-gray-500 mt-2">
          Cuando tus comprobantes sean aprobados, aparecerán aquí.
        </p>
      </div>
    );
  }

  const tableData = historialPagos.map((payment) => {
    const obligation = payment.obligation;
    const baseAmount = obligation?.baseAmount || 0;
    const totalAmount = obligation?.totalAmount || baseAmount;
    const lateFeeAmount = obligation?.lateFeeAmount || 0;
    
    // Calcular días de mora si hay información disponible
    let daysLate = 0;
    if (obligation?.type === 'MONTHLY' && obligation?.dueEnd && payment.processedAt) {
      const dueDate = new Date(obligation.dueEnd);
      const processedDate = new Date(payment.processedAt);
      if (processedDate > dueDate) {
        daysLate = Math.ceil((processedDate - dueDate) / (1000 * 60 * 60 * 24));
      }
    }

    return {
      ...payment,
      periodoTexto: getPeriodText(payment.obligation),
      montoTexto: formatCurrency(totalAmount),
      fechaTexto: payment.processedAt || payment.approvedAt || payment.updatedAt
        ? new Date(payment.processedAt || payment.approvedAt || payment.updatedAt).toLocaleDateString("es-ES")
        : "—",
      statusBadge: (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
          <FaCheckCircle size={12} />
          Aprobado
        </span>
      ),
      daysLate,
      lateFeeAmount,
      baseAmount,
      totalAmount
    };
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <FaHistory className="text-green-600" size={16} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Historial de Pagos</h3>
            <p className="text-sm text-gray-600">
              {historialPagos.length} pago{historialPagos.length !== 1 ? 's' : ''} aprobado{historialPagos.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {tableData && tableData.length > 0 ? (
          <Table
            thead={{
              titles: [
                "Período",
                "Monto",
                "Fecha Aprobación", 
                "Estado"
              ],
              state: false,
              actions: true,
            }}
            tbody={{
              data: tableData,
              dataPropertys: [
                "periodoTexto",
                "montoTexto", 
                "fechaTexto",
                "statusBadge"
              ],
              state: false,
              customRenderers: {
                periodoTexto: (value, row) => (
                  <div>
                    <div className="font-medium text-gray-900">{value}</div>
                    <div className="text-xs text-gray-500">
                      {row.obligation?.type === 'MONTHLY' ? 'Mensualidad' : 
                       row.obligation?.type === 'ENROLLMENT_INITIAL' ? 'Matrícula Inicial' :
                       row.obligation?.type === 'ENROLLMENT_RENEWAL' ? 'Renovación Matrícula' : 'Pago'}
                    </div>
                  </div>
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
                statusBadge: (value) => value
              }
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
      </div>
    </div>
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
    pendingObligations,
    enrollmentObligation,
    totalDebt,
    isBlocked,
    refresh: fetchFinancialStatus
  } = useAthleteFinancialStatus(athleteId);

  const [activeTab, setActiveTab] = useState("pendientes");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedObligationId, setSelectedObligationId] = useState(null);

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
  const pendingObligationsFiltered = pendingObligations?.filter(
    (d) => d.paymentStatus === null || d.paymentStatus === "REJECTED"
  ) || [];

  const inReviewObligations = pendingObligations?.filter(
    (d) => d.paymentStatus === "PENDING"
  ) || [];

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
      {isRestricted && accessStatus && (
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
              <div className="text-xl sm:text-2xl font-bold text-gray-800">{formatCurrency(totalDebt.totalAmount)}</div>
              <div className="text-xs text-gray-600 mt-1">Total pendiente</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-gray-800">{formatCurrency(totalDebt.monthlyAmount)}</div>
              <div className="text-xs text-gray-600 mt-1">Mensualidades</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-gray-800">{formatCurrency(totalDebt.lateFeeAmount)}</div>
              <div className="text-xs text-gray-600 mt-1">Mora acumulada</div>
            </div>
          </div>

          {totalDebt.maxDaysLate > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="text-yellow-600 flex-shrink-0" size={14} />
                <p className="text-sm text-yellow-800">
                  {totalDebt.obligationsCount} obligación{totalDebt.obligationsCount !== 1 ? "es" : ""} pendiente
                  {totalDebt.maxDaysLate > 0 && ` • Mora máxima: ${totalDebt.maxDaysLate} días`}
                </p>
              </div>
            </div>
          )}
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
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {/* Header de la tabla mejorado */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">Pagos Pendientes</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Mostrando {pendingObligationsFiltered.length} obligación{pendingObligationsFiltered.length !== 1 ? 'es' : ''} pendiente{pendingObligationsFiltered.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Tabla responsiva mejorada */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Período
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Monto
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Mora
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingObligationsFiltered.map((obligation, index) => {
                        const statusBadge = getStatusBadge(obligation.paymentStatus);
                        const StatusIcon = statusBadge.icon;
                        const canUpload = obligation.paymentStatus === null || obligation.paymentStatus === "REJECTED";
                        
                        return (
                          <tr key={obligation.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                            {/* Período */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {obligation.period 
                                  ? new Date(obligation.period + "-01").toLocaleDateString("es-ES", { month: 'long', year: 'numeric' })
                                  : "Mensualidad"
                                }
                              </div>
                            </td>

                            {/* Monto */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                <div className="font-semibold text-gray-900">
                                  {formatCurrency(obligation.totalToPay || obligation.baseAmount)}
                                </div>
                                {obligation.lateFee > 0 && (
                                  <div className="text-xs text-gray-500">
                                    Base: {formatCurrency(obligation.baseAmount)}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Mora */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              {obligation.daysLate > 0 ? (
                                <div className="text-sm">
                                  <div className="font-medium text-red-600">
                                    {obligation.daysLate} días
                                  </div>
                                  <div className="text-xs text-red-500">
                                    {formatCurrency(obligation.lateFee || 0)}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">—</span>
                              )}
                            </td>

                            {/* Estado */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                                <StatusIcon size={12} />
                                {statusBadge.text}
                              </div>
                              {obligation.paymentStatus === "REJECTED" && obligation.rejectionReason && (
                                obligation.rejectionReason.length > 80 ? (
                                  <>
                                    <div className="mt-2 text-xs text-red-600 sm:hidden">
                                      Motivo: ver detalle
                                    </div>
                                    <div className="mt-2 text-xs text-red-600 max-w-[260px] hidden sm:block">
                                      Motivo: {obligation.rejectionReason}
                                    </div>
                                  </>
                                ) : (
                                  <div className="mt-2 text-xs text-red-600 max-w-[260px]">
                                    Motivo: {obligation.rejectionReason}
                                  </div>
                                )
                              )}
                            </td>

                            {/* Acciones mejoradas */}
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {canUpload ? (
                                <button
                                  onClick={() => handleUploadReceipt(obligation.id)}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-blue text-white text-sm font-medium rounded-lg hover:bg-primary-purple transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  <FaUpload className="w-4 h-4" />
                                  <span className="hidden sm:inline">
                                    {obligation.paymentStatus === "REJECTED" ? "Resubir" : "Subir"}
                                  </span>
                                  <span className="sm:hidden">Subir</span>
                                </button>
                              ) : (
                                <div className="text-xs text-gray-400">
                                  No disponible
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
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
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                {/* Header de la tabla mejorado */}
                <div className="bg-gradient-to-r from-blue-50 via-white to-purple-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white shadow-sm border border-blue-100 flex items-center justify-center">
                      <FaClock className="text-primary-blue" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Pagos en Revisión</h3>
                      <p className="text-sm text-gray-600">
                        {inReviewObligations.length} comprobante{inReviewObligations.length !== 1 ? 's' : ''} siendo revisado{inReviewObligations.length !== 1 ? 's' : ''} por administración
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lista de pagos en revisión */}
                <div className="divide-y divide-gray-200">
                  {inReviewObligations.map((obligation, index) => {
                    const statusBadge = getStatusBadge(obligation.paymentStatus);
                    const StatusIcon = statusBadge.icon;
                    
                    return (
                      <div key={obligation.id} className={`p-6 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Información principal */}
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                              <h4 className="text-lg font-semibold text-gray-800">
                                Mensualidad {obligation.period 
                                  ? new Date(obligation.period + "-01").toLocaleDateString("es-ES", { month: 'long', year: 'numeric' })
                                  : ""
                                }
                              </h4>
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                                <StatusIcon size={12} />
                                {statusBadge.text}
                              </div>
                            </div>
                            
                            {/* Grid de información */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500 block">Monto base:</span>
                                <div className="font-medium text-gray-900">{formatCurrency(obligation.baseAmount)}</div>
                              </div>
                              {obligation.daysLate > 0 && (
                                <div>
                                  <span className="text-gray-500 block">Mora:</span>
                                  <div className="font-medium text-red-600">
                                    {obligation.daysLate} días
                                  </div>
                                  <div className="text-xs text-red-500">
                                    {formatCurrency(obligation.lateFee || 0)}
                                  </div>
                                </div>
                              )}
                              <div>
                                <span className="text-gray-500 block">Total:</span>
                                <div className="font-semibold text-primary-blue text-lg">
                                  {formatCurrency(obligation.totalToPay || obligation.baseAmount)}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500 block">Fecha envío:</span>
                                <div className="font-medium text-gray-700 text-xs">
                                  {obligation.uploadedAt 
                                    ? new Date(obligation.uploadedAt).toLocaleString("es-ES", { 
                                        day: 'numeric', 
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : "—"
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Banner de estado */}
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                          <div className="flex items-start gap-3">
                            <FaClock className="text-primary-blue flex-shrink-0 mt-0.5" size={16} />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800 mb-1">
                                Comprobante en revisión
                              </p>
                              <p className="text-xs text-gray-600">
                                Tu comprobante está siendo verificado por nuestro equipo administrativo. 
                                Te notificaremos por email cuando tengamos una respuesta.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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
          <HistorialPagosSection 
            athleteId={athleteId} 
            financialStatus={financialStatus}
          />
        )}
      </div>

      {/* Modal de subida */}
      <ReceiptUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        obligationId={selectedObligationId}
        onSuccess={fetchFinancialStatus}
      />
    </div>
  );
};

export default AthletePayments;
