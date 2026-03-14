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
} from "react-icons/fa";

import { useAuth } from "../../../../../../../shared/contexts/authContext.jsx";
import { paymentsService } from "./services/PaymentsService.js";
import { useAthleteFinancialStatus } from "./hooks/useAthleteFinancialStatus.js";
import { formatCurrency } from "./utils/currencyUtils.js";
import { showErrorAlert, showSuccessAlert } from "../../../../../../../shared/utils/alerts.js";

// ─────────────────────────────────────────────────────────────────────────────
// Modal de subida de comprobante
// ─────────────────────────────────────────────────────────────────────────────
const ReceiptUploadModal = ({ isOpen, onClose, obligationId, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const errors = paymentsService.validateFile(file);
    if (errors.length > 0) {
      setFileError(errors.join(". "));
      setSelectedFile(null);
      setPreviewUrl(null);
    } else {
      setFileError("");
      setSelectedFile(file);
      
      // Crear preview para imágenes
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
      const file = e.dataTransfer.files[0];
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
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !obligationId) return;
    setUploading(true);
    try {
      await paymentsService.uploadReceipt(obligationId, selectedFile);
      showSuccessAlert(
        "Comprobante subido",
        "Tu comprobante fue enviado exitosamente y será revisado por administración."
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
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileError("");
    setDragActive(false);
    onClose();
  };

  const handleChangeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  const getFileIcon = () => {
    if (!selectedFile) return <FaUpload className="text-gray-400" size={40} />;
    
    if (selectedFile.type === 'application/pdf') {
      return <FaTimesCircle className="text-red-500" size={40} />;
    }
    return <FaCheckCircle className="text-blue-500" size={40} />;
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-3 relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            onClick={handleClose}
            disabled={uploading}
          >
            ✕
          </button>
          <h2 className="text-lg font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center pr-8">
            Subir Comprobante
          </h2>
        </div>

        {/* Body - SIN overflow-y-auto para evitar scroll */}
        <div className="flex-1 p-4 space-y-3">
          <p className="text-xs text-gray-600">
            Sube la imagen o PDF del comprobante de pago. Máximo 5 MB. Formatos: JPG, PNG, WEBP, PDF.
          </p>

          {/* File Upload Area */}
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
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />

              <div className="space-y-3">
                <div className="flex justify-center">
                  <FaUpload className="text-gray-400" size={32} />
                </div>
                <div>
                  <p className="text-gray-700 font-medium text-sm">
                    Haz clic para seleccionar un archivo
                  </p>
                  <p className="text-xs text-gray-500">
                    o arrastra y suelta aquí
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Preview Area - Compacto */
            <div className="space-y-2">
              {/* Mini mensaje compacto */}
              <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <FaCheckCircle className="text-green-600 flex-shrink-0" size={14} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-green-700 font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-green-600">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {/* Image Preview - Más pequeño */}
              {previewUrl && (
                <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-1">Vista previa:</p>
                  <div className="flex justify-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-40 rounded-lg shadow-sm object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Change File Button */}
              <button
                onClick={handleChangeFile}
                className="w-full py-1.5 text-xs text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={uploading}
              >
                Cambiar archivo
              </button>
            </div>
          )}

          {fileError && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-600 flex items-center gap-2">
                <FaExclamationTriangle size={12} /> {fileError}
              </p>
            </div>
          )}

          {/* Important Notes - Compacto */}
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-2">
            <div className="flex items-start gap-2">
              <FaExclamationTriangle className="text-gray-500 flex-shrink-0 mt-0.5" size={11} />
              <div>
                <h5 className="font-semibold text-gray-700 mb-1 text-xs">Importante:</h5>
                <ul className="text-xs text-gray-600 space-y-0.5">
                  <li>• El comprobante debe mostrar claramente el monto pagado</li>
                  <li>• La imagen debe ser legible y completa</li>
                  <li>• Una vez enviado, estará en revisión por administración</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-3 bg-gray-50">
          <div className="flex justify-end gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={uploading}
            >
              Cancelar
            </button>
            {selectedFile ? (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-2 text-sm bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <FaUpload size={13} />
                    Enviar Comprobante
                  </>
                )}
              </button>
            ) : (
              <button
                disabled
                className="px-4 py-2 text-sm bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
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
// Componente principal — Mis Pagos (vista deportista)
// ─────────────────────────────────────────────────────────────────────────────
const AthletePayments = () => {
  const { user } = useAuth();
  
  // Intentar múltiples formas de obtener el athleteId
  const athleteId = user?.athleteId || user?.athlete_id || user?.id;
  
  // Usar el hook mejorado para estado financiero
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

  // Modal de subida de comprobante
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedObligationId, setSelectedObligationId] = useState(null);

  console.log("=== AthletePayments Debug ===");
  console.log("Usuario completo:", user);
  console.log("Posibles athleteId:", {
    athleteId: user?.athleteId,
    athlete_id: user?.athlete_id,
    id: user?.id,
    finalAthleteId: athleteId
  });
  console.log("Estado financiero completo:", financialStatus);
  console.log("Obligación de matrícula:", enrollmentObligation);
  console.log("Estado de matrícula:", financialStatus?.enrollment?.estado);
  console.log("Fecha de inicio matrícula:", financialStatus?.enrollment?.fechaInicio);

  // ── Lógica mejorada para detectar tipo de matrícula ──
  // Detectar si es realmente una matrícula inicial basándose en múltiples criterios
  const isReallyInitialEnrollment = enrollmentObligation && (
    // Criterio 1: Explícitamente marcado como inicial
    enrollmentObligation.isInitial === true ||
    enrollmentObligation.type === 'INITIAL_ENROLLMENT' ||
    enrollmentObligation.type === 'ENROLLMENT_INITIAL' ||
    // Criterio 2: Estado de matrícula pendiente de pago inicial
    financialStatus?.enrollment?.estado === 'Pending_Payment' ||
    // Criterio 3: No tiene needsRenewal o es false
    !enrollmentObligation.needsRenewal ||
    // Criterio 4: Es la primera matrícula (no hay fechas de activación previas)
    !financialStatus?.enrollment?.fechaInicio
  );

  const isReallyRenewal = enrollmentObligation && !isReallyInitialEnrollment && (
    enrollmentObligation.needsRenewal === true ||
    enrollmentObligation.type === 'RENEWAL' ||
    enrollmentObligation.type === 'ENROLLMENT_RENEWAL' ||
    financialStatus?.enrollment?.fechaInicio // Ya tuvo una activación previa
  );

  // CRÍTICO: Detectar matrícula inicial pendiente de pago
  // Una matrícula recién creada puede estar marcada como "Vigente" por error del backend
  // pero si no tiene fechaInicio significa que nunca se activó (nunca se pagó)
  const hasActiveEnrollment = financialStatus?.enrollment?.estado === 'Vigente' && 
                              financialStatus?.enrollment?.fechaInicio; // Solo vigente SI tiene fecha de inicio
  
  // Detectar matrícula inicial pendiente: 
  // 1. Hay obligación de matrícula Y
  // 2. (NO tiene matrícula activa O estado es Pending_Payment O no tiene fecha de inicio)
  const shouldShowEnrollmentPayment = enrollmentObligation && (
    !hasActiveEnrollment || 
    financialStatus?.enrollment?.estado === 'Pending_Payment' || 
    financialStatus?.enrollment?.estado === 'Vencida' ||
    !financialStatus?.enrollment?.fechaInicio // CLAVE: Sin fecha de inicio = nunca se activó
  );

  console.log("Estado de matrícula:", financialStatus?.enrollment?.estado);
  console.log("Tiene matrícula vigente:", hasActiveEnrollment);
  console.log("Debe mostrar pago de matrícula:", shouldShowEnrollmentPayment);
  console.log("Es matrícula inicial:", isReallyInitialEnrollment);
  console.log("Es renovación:", isReallyRenewal);

  // ── Abrir modal de subida ──
  const handleUploadReceipt = (obligationId) => {
    setSelectedObligationId(obligationId);
    setUploadModalOpen(true);
  };

  // ── Helpers ──
  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800 border border-yellow-200", text: "En revisión" },
      APPROVED: { color: "bg-green-100 text-green-800 border border-green-200", text: "Aprobado" },
      REJECTED: { color: "bg-red-100 text-red-800 border border-red-200", text: "Rechazado" },
    };
    if (!status) return { color: "bg-gray-100 text-gray-700 border border-gray-200", text: "Sin comprobante" };
    return statusConfig[status] || { color: "bg-gray-100 text-gray-700 border border-gray-200", text: "Desconocido" };
  };

  // Filtrar obligaciones por estado
  const pendingObligationsFiltered = pendingObligations?.filter(
    (d) => d.paymentStatus === null || d.paymentStatus === "REJECTED"
  ) || [];

  const inReviewObligations = pendingObligations?.filter(
    (d) => d.paymentStatus === "PENDING"
  ) || [];

  // ── Renderizado de tarjeta de obligación mensual ──
  const renderObligationCard = (obligation) => {
    const statusBadge = getStatusBadge(obligation.paymentStatus);
    const canUpload = obligation.paymentStatus === null || obligation.paymentStatus === "REJECTED";

    return (
      <div key={obligation.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              Mensualidad{" "}
              {obligation.period
                ? new Date(obligation.period + "-01").toLocaleDateString("es-ES", { month: "long", year: "numeric" })
                : ""}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1.5 ${statusBadge.color}`}>
              {statusBadge.text}
            </span>
          </div>
          {obligation.daysLate > 0 && (
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              obligation.daysLate >= 15
                ? "bg-red-100 text-red-700"
                : obligation.daysLate >= 8
                ? "bg-orange-100 text-orange-700"
                : "bg-yellow-100 text-yellow-700"
            }`}>
              {obligation.daysLate} días de mora
            </span>
          )}
        </div>

        <div className="space-y-1.5 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Valor mensualidad:</span>
            <span className="font-medium">{formatCurrency(obligation.baseAmount)}</span>
          </div>
          {obligation.lateFee > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Mora ({obligation.daysLate} días × $1.000):</span>
              <span className="font-medium text-red-600">+{formatCurrency(obligation.lateFee)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold border-t pt-2 mt-2 text-base">
            <span>Total a pagar:</span>
            <span className="text-primary-blue">{formatCurrency(obligation.totalToPay)}</span>
          </div>
        </div>

        {obligation.paymentStatus === "REJECTED" && obligation.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" size={13} />
              <div>
                <p className="text-xs font-semibold text-red-800 mb-0.5">Motivo de rechazo:</p>
                <p className="text-xs text-red-700">{obligation.rejectionReason}</p>
              </div>
            </div>
          </div>
        )}

        {canUpload && (
          <button
            onClick={() => handleUploadReceipt(obligation.id)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors text-sm font-medium"
          >
            <FaUpload className="w-3.5 h-3.5" />
            {obligation.paymentStatus === "REJECTED" ? "Subir nuevo comprobante" : "Subir comprobante"}
          </button>
        )}

        {obligation.paymentStatus === "PENDING" && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            Comprobante en revisión por administración
          </div>
        )}
      </div>
    );
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Mis Pagos</h1>
        <div className="flex justify-center items-center py-20 bg-white rounded-2xl shadow border border-gray-200">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-blue border-t-transparent" />
            <span className="text-sm text-gray-500">Cargando tus pagos...</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Mis Pagos</h1>
        <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-200">
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

  // ─── Caso: Matrícula inicial pendiente ───────────────
  // Usar la lógica mejorada para detectar matrícula inicial
  if (shouldShowEnrollmentPayment && isReallyInitialEnrollment) {
    const enroll = enrollmentObligation;
    const canUpload = enroll.paymentStatus === null || enroll.paymentStatus === "REJECTED";

    return (
      <div className="p-6 font-questrial w-full max-w-full">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Mis Pagos</h1>

        {/* Banner de bloqueo — Matrícula inicial */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 mb-6 flex items-start gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-amber-800 mb-1">
              Matrícula Inicial Requerida
            </h2>
            <p className="text-sm text-amber-700">
              Para acceder completamente al sistema debes completar el pago de tu matrícula inicial.
              Sube el comprobante de pago y queda pendiente de aprobación por la administración.
            </p>
            {enroll.dueDate && (
              <p className="text-xs text-amber-600 mt-1">
                Fecha límite sin mora: {new Date(enroll.dueDate).toLocaleDateString("es-ES")}
              </p>
            )}
          </div>
        </div>

        {/* Tarjeta de pago de matrícula */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              Matrícula Inicial
            </span>
          </div>

          <div className="space-y-2 mb-5 text-sm">
            <div className="flex justify-between font-medium text-base border-b pb-2">
              <span>Valor de matrícula:</span>
              <span className="text-primary-blue">{formatCurrency(enroll.amount)}</span>
            </div>
          </div>

          {enroll.paymentStatus === "REJECTED" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <FaTimesCircle className="text-red-500 mt-0.5 flex-shrink-0" size={13} />
                <div>
                  <p className="text-xs font-semibold text-red-800 mb-0.5">Comprobante rechazado</p>
                  <p className="text-xs text-red-700">
                    Tu comprobante anterior fue rechazado. Por favor sube uno nuevo con la información correcta.
                  </p>
                </div>
              </div>
            </div>
          )}

          {enroll.paymentStatus === "PENDING" ? (
            <div className="flex items-center gap-2 px-4 py-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              Tu comprobante está en revisión por administración
            </div>
          ) : canUpload ? (
            <button
              onClick={() => handleUploadReceipt(enroll.obligationId)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors font-medium"
            >
              <FaUpload />
              {enroll.paymentStatus === "REJECTED" ? "Subir nuevo comprobante" : "Subir comprobante de pago"}
            </button>
          ) : null}
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
  }

  // ─── Caso: Renovación de matrícula pendiente (ENROLLMENT_RENEWAL) ────────
  // Usar la lógica mejorada para detectar renovación
  if (shouldShowEnrollmentPayment && isReallyRenewal) {
    const enroll = enrollmentObligation;
    const canUpload = enroll.paymentStatus === null || enroll.paymentStatus === "REJECTED";

    return (
      <div className="p-6 font-questrial w-full max-w-full">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Mis Pagos</h1>

        {/* Banner de renovación */}
        <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-6 mb-6 flex items-start gap-4">
          <div className="text-purple-500 text-3xl mt-0.5">🔄</div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-purple-800 mb-1">
              Renovación de Matrícula Requerida
            </h2>
            <p className="text-sm text-purple-700">
              Tu matrícula ha vencido y necesitas renovarla para continuar accediendo al sistema.
              El sistema automático ha generado una obligación de renovación.
            </p>
            {enroll.dueDate && (
              <p className="text-xs text-purple-600 mt-1">
                Fecha límite: {new Date(enroll.dueDate).toLocaleDateString("es-ES")}
              </p>
            )}
          </div>
        </div>

        {/* Tarjeta de renovación */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
              🔄 Renovación Matrícula
            </span>
          </div>

          <div className="space-y-2 mb-5 text-sm">
            <div className="flex justify-between font-medium text-base border-b pb-2">
              <span>Valor de renovación:</span>
              <span className="text-primary-blue">{formatCurrency(enroll.amount)}</span>
            </div>
          </div>

          {enroll.paymentStatus === "REJECTED" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <FaTimesCircle className="text-red-500 mt-0.5 flex-shrink-0" size={13} />
                <div>
                  <p className="text-xs font-semibold text-red-800 mb-0.5">Comprobante rechazado</p>
                  <p className="text-xs text-red-700">
                    Tu comprobante de renovación fue rechazado. Por favor sube uno nuevo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {enroll.paymentStatus === "PENDING" ? (
            <div className="flex items-center gap-2 px-4 py-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              Comprobante de renovación en revisión
            </div>
          ) : canUpload ? (
            <button
              onClick={() => handleUploadReceipt(enroll.obligationId)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors font-medium"
            >
              <FaUpload />
              {enroll.paymentStatus === "REJECTED" ? "Subir nuevo comprobante" : "Subir comprobante de renovación"}
            </button>
          ) : null}
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
  }

  // ─── Caso normal: vista de mensualidades ─────────────────────────────────
  return (
    <div className="p-6 font-questrial w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Mis Pagos</h1>
        
        {/* Indicador de estado financiero */}
        {summary && (
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
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

      {/* Banner de restricción de acceso */}
      {isRestricted && accessStatus && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-6 flex items-center gap-3">
          <FaLock className="text-red-600 text-xl flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-800 text-sm">
              Acceso Restringido
            </p>
            <p className="text-xs text-red-600">
              {accessStatus.message || 'Tu acceso está limitado debido a pagos pendientes.'}
              {accessStatus.lateDays && ` (${accessStatus.lateDays} días de mora)`}
            </p>
          </div>
        </div>
      )}

      {/* Banner de bloqueo por mora */}
      {isBlocked && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-6 flex items-center gap-3">
          <FaLock className="text-red-600 text-xl flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-800 text-sm">
              Cuenta bloqueada por mora de {totalDebt?.maxDaysLate} días
            </p>
            <p className="text-xs text-red-600">
              Paga tus mensualidades pendientes para recuperar el acceso completo al sistema.
            </p>
          </div>
        </div>
      )}

      {/* Resumen financiero */}
      {totalDebt && totalDebt.totalAmount > 0 && (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-5 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Resumen Financiero</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDebt.totalAmount)}</div>
              <div className="text-xs text-gray-500 mt-1">Total a ponerse al día</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalDebt.monthlyAmount)}</div>
              <div className="text-xs text-gray-500 mt-1">Mensualidades</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalDebt.lateFeeAmount)}</div>
              <div className="text-xs text-gray-500 mt-1">Mora acumulada</div>
            </div>
          </div>

          {totalDebt.obligationsCount > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="text-yellow-500 flex-shrink-0" size={13} />
                <p className="text-xs text-yellow-800 font-medium">
                  Tienes {totalDebt.obligationsCount} obligación{totalDebt.obligationsCount !== 1 ? "es" : ""} pendiente
                  {totalDebt.maxDaysLate > 0 && ` · Mora máxima: ${totalDebt.maxDaysLate} días`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-5">
        <div className="inline-flex gap-2">
          {[
            { key: "pendientes", label: "Pendientes", count: pendingObligationsFiltered.length, activeColor: "bg-primary-purple/10 text-primary-purple", badgeActive: "bg-primary-purple text-white" },
            { key: "revision", label: "En Revisión", count: inReviewObligations.length, activeColor: "bg-yellow-100 text-yellow-800", badgeActive: "bg-yellow-600 text-white" },
            { key: "historial", label: "Historial", count: null, activeColor: "bg-green-100 text-green-800", badgeActive: "bg-green-600 text-white" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm ${
                activeTab === tab.key ? tab.activeColor : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.key === "historial" && <FaHistory className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`px-1.5 py-0.5 rounded-md text-xs font-medium ${
                  activeTab === tab.key ? tab.badgeActive : "bg-gray-200 text-gray-600"
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
          pendingObligationsFiltered.length > 0 ? (
            pendingObligationsFiltered.map(renderObligationCard)
          ) : (
            <div className="text-center text-gray-500 py-10 bg-white rounded-2xl shadow border border-gray-200">
              <FaCheckCircle className="mx-auto text-3xl text-green-400 mb-2" />
              <p>¡Estás al día! No tienes pagos pendientes.</p>
            </div>
          )
        )}

        {activeTab === "revision" && (
          inReviewObligations.length > 0 ? (
            inReviewObligations.map(renderObligationCard)
          ) : (
            <div className="text-center text-gray-500 py-10 bg-white rounded-2xl shadow border border-gray-200">
              No tienes pagos en revisión.
            </div>
          )
        )}

        {activeTab === "historial" && (
          <div className="text-center text-gray-500 py-10 bg-white rounded-2xl shadow border border-gray-200">
            <FaHistory className="mx-auto text-gray-300 text-3xl mb-2" />
            <p className="text-sm">El historial de pagos aprobados se mostrará aquí.</p>
          </div>
        )}
      </div>

      {/* Modal de subida de comprobante */}
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