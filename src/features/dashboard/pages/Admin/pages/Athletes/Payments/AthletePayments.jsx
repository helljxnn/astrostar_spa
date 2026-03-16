import { useState, useRef } from "react";
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
        "Tu comprobante será revisado por administración. Te notificaremos por email cuando tengamos una respuesta."
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative flex flex-col">
        {/* Header mejorado */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 relative">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            onClick={handleClose}
            disabled={uploading}
          >
            <FaTimes size={16} />
          </button>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center pr-12">
            Subir Comprobante de Pago
          </h2>
          <p className="text-sm text-gray-600 text-center mt-2">
            Sube la imagen o PDF de tu comprobante para que sea verificado
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Área de subida de archivo */}
          {!selectedFile ? (
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive
                  ? 'border-primary-blue bg-blue-50 scale-105'
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

              <div className="space-y-4">
                <div className="flex justify-center">
                  {getFileIcon()}
                </div>
                <div>
                  <p className="text-gray-700 font-semibold text-xl mb-2">
                    Haz clic para seleccionar un archivo
                  </p>
                  <p className="text-sm text-gray-500">
                    o arrastra y suelta aquí
                  </p>
                </div>
                <div className="text-xs text-gray-500 space-y-1 bg-gray-50 rounded-lg p-4">
                  <p className="font-medium">Formatos aceptados:</p>
                  <p>• Imágenes: JPG, PNG, WEBP</p>
                  <p>• Documentos: PDF</p>
                  <p>• Tamaño máximo: 5 MB</p>
                </div>
              </div>
            </div>
          ) : (
            /* Vista previa del archivo */
            <div className="space-y-6">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getFileIcon()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-green-800 font-semibold text-lg mb-2">Archivo seleccionado</p>
                    <p className="text-sm text-green-700 font-medium truncate mb-1">{selectedFile.name}</p>
                    <p className="text-xs text-green-600">
                      Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Vista previa de imagen */}
              {previewUrl && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-4">Vista previa:</p>
                  <div className="flex justify-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-64 rounded-lg shadow-lg object-contain border border-gray-200"
                    />
                  </div>
                </div>
              )}

              {/* Botón para cambiar archivo */}
              <button
                onClick={resetModal}
                className="w-full py-3 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
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
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-amber-800 mb-2">Importante:</h5>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• El comprobante debe mostrar claramente el monto pagado</li>
                  <li>• Incluye fecha y concepto del pago</li>
                  <li>• La imagen debe ser legible y completa</li>
                  <li>• Una vez enviado, estará en revisión por administración</li>
                  <li>• Recibirás una notificación por email con el resultado</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer mejorado */}
        <div className="flex-shrink-0 border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={uploading}
            >
              Cancelar
            </button>
            {selectedFile ? (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <FaUpload className="w-4 h-4" />
                    Enviar Comprobante
                  </>
                )}
              </button>
            ) : (
              <button
                disabled
                className="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium"
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
      PENDING: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", text: "En revisión", icon: FaClock },
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
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-blue border-t-transparent" />
            <span className="text-sm text-gray-500">Cargando información...</span>
          </div>
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
          <FaExclamationTriangle className="mx-auto text-4xl text-red-400 mb-3" />
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
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <FaFileAlt className="text-blue-600" size={16} />
            </div>
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
              <p className="text-sm text-gray-600">Pago único de inscripción</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-blue">{formatCurrency(enroll.amount)}</div>
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
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <FaHistory className="text-purple-600" size={16} />
            </div>
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
              <p className="text-sm text-gray-600">Renovación anual</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-blue">{formatCurrency(enroll.amount)}</div>
            </div>
          </div>

          {enroll.paymentStatus === "REJECTED" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <FaTimesCircle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                <div>
                  <p className="text-sm font-medium text-red-800">Comprobante rechazado</p>
                  <p className="text-xs text-red-700 mt-1">Sube un nuevo comprobante.</p>
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
        <div className="flex flex-wrap gap-2">
          {[
            { key: "pendientes", label: "Pendientes", count: pendingObligationsFiltered.length },
            { key: "revision", label: "En Revisión", count: inReviewObligations.length },
            { key: "historial", label: "Historial", count: null },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm ${
                activeTab === tab.key 
                  ? "bg-primary-blue text-white" 
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab.key === "historial" && <FaHistory className="w-4 h-4" />}
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  activeTab === tab.key ? "bg-white text-primary-blue" : "bg-gray-200 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
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
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {/* Header de la tabla mejorado */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-800">Pagos en Revisión</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    {inReviewObligations.length} comprobante{inReviewObligations.length !== 1 ? 's' : ''} siendo revisado{inReviewObligations.length !== 1 ? 's' : ''} por administración
                  </p>
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
                                    ? new Date(obligation.uploadedAt).toLocaleDateString("es-ES", { 
                                        day: 'numeric', 
                                        month: 'short',
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
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <FaClock className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-yellow-800 mb-1">
                                Comprobante en revisión
                              </p>
                              <p className="text-xs text-yellow-700">
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
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FaHistory className="mx-auto text-4xl text-gray-300 mb-3" />
            <p className="text-gray-600">El historial de pagos aprobados se mostrará aquí.</p>
          </div>
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
