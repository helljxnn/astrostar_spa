import { useState, useEffect, useRef } from "react";
import {
  FaUpload,
  FaHistory,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaLock,
  FaTimes,
} from "react-icons/fa";

import { useAuth } from "../../../../../../../shared/contexts/authContext.jsx";
import PaymentsService from "./services/PaymentsService.js";
import { formatCurrency } from "./utils/currencyUtils.js";
import { showErrorAlert, showSuccessAlert } from "../../../../../../../shared/utils/alerts.js";

// ─────────────────────────────────────────────────────────────────────────────
// Modal de subida de comprobante
// ─────────────────────────────────────────────────────────────────────────────
const ReceiptUploadModal = ({ isOpen, onClose, obligationId, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const errors = PaymentsService.validateFile(file);
    if (errors.length > 0) {
      setFileError(errors.join(". "));
      setSelectedFile(null);
    } else {
      setFileError("");
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !obligationId) return;
    setUploading(true);
    try {
      await PaymentsService.uploadReceipt(obligationId, selectedFile);
      showSuccessAlert(
        "Comprobante subido",
        "Tu comprobante fue enviado exitosamente y será revisado por administración."
      );
      setSelectedFile(null);
      onSuccess();
      onClose();
    } catch (error) {
      const msg = error?.response?.data?.message || "Error al subir el comprobante";
      showErrorAlert("Error", msg);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setFileError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaUpload className="text-primary-blue" /> Subir Comprobante
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Sube la imagen o PDF del comprobante de pago. Máximo 5 MB. Formatos aceptados: JPG, PNG, WEBP, PDF.
        </p>

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-blue transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          {selectedFile ? (
            <div className="flex items-center justify-center gap-2 text-green-700">
              <FaCheckCircle />
              <span className="text-sm font-medium">{selectedFile.name}</span>
            </div>
          ) : (
            <div className="text-gray-400">
              <FaUpload className="mx-auto mb-2 text-2xl" />
              <p className="text-sm">Haz clic para seleccionar un archivo</p>
            </div>
          )}
        </div>

        {fileError && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <FaTimesCircle /> {fileError}
          </p>
        )}

        <div className="flex gap-3 mt-5">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={uploading}
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="flex-1 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Subiendo...
              </>
            ) : (
              <>
                <FaUpload /> Enviar comprobante
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal — Mis Pagos (vista deportista)
// ─────────────────────────────────────────────────────────────────────────────
const AthletePayments = () => {
  const { user } = useAuth();
  const athleteId = user?.athleteId;

  const [financialStatus, setFinancialStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("pendientes");

  // Modal de subida de comprobante
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedObligationId, setSelectedObligationId] = useState(null);

  // ── Cargar estado financiero ──
  const fetchFinancialStatus = async () => {
    if (!athleteId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await PaymentsService.getAthleteFinancialStatus(athleteId);
      setFinancialStatus(response.data || response);
    } catch (err) {
      console.error("Error cargando estado financiero:", err);
      setError("No se pudo cargar tu información de pagos. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialStatus();
  }, [athleteId]);

  // ── Abrir modal de subida ──
  const handleUploadReceipt = (obligationId) => {
    setSelectedObligationId(obligationId);
    setUploadModalOpen(true);
  };

  // ── Helpers ──
  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800 border border-yellow-200", text: "⏳ En revisión" },
      APPROVED: { color: "bg-green-100 text-green-800 border border-green-200", text: "✅ Aprobado" },
      REJECTED: { color: "bg-red-100 text-red-800 border border-red-200", text: "❌ Rechazado" },
    };
    if (!status) return { color: "bg-gray-100 text-gray-700 border border-gray-200", text: "📤 Sin comprobante" };
    return statusConfig[status] || { color: "bg-gray-100 text-gray-700 border border-gray-200", text: "Desconocido" };
  };

  const pendingObligations = financialStatus?.allMonthlyDebts?.filter(
    (d) => d.paymentStatus === null || d.paymentStatus === "REJECTED"
  ) || [];

  const inReviewObligations = financialStatus?.allMonthlyDebts?.filter(
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

  // ─── Caso: Matrícula inicial pendiente (ENROLLMENT_INITIAL) ───────────────
  if (
    financialStatus?.enrollment?.needsRenewal &&
    financialStatus.enrollment.type === "ENROLLMENT_INITIAL"
  ) {
    const enroll = financialStatus.enrollment;
    const canUpload = enroll.paymentStatus === null || enroll.paymentStatus === "REJECTED";

    return (
      <div className="p-6 font-questrial w-full max-w-full">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Mis Pagos</h1>

        {/* Banner de bloqueo — Matrícula inicial */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 mb-6 flex items-start gap-4">
          <div className="text-amber-500 text-3xl mt-0.5">🎓</div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-amber-800 mb-1">
              Pago de Matrícula Pendiente
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
              🎓 Matrícula Inicial
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
  if (
    financialStatus?.enrollment?.needsRenewal &&
    financialStatus.enrollment.type === "ENROLLMENT_RENEWAL"
  ) {
    return (
      <div className="p-6 font-questrial w-full max-w-full">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Mis Pagos</h1>
        <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-6 mb-6 flex items-start gap-4">
          <FaInfoCircle className="text-purple-500 text-2xl mt-0.5" />
          <div>
            <h2 className="text-lg font-bold text-purple-800 mb-1">
              Renovación de Matrícula Pendiente
            </h2>
            <p className="text-sm text-purple-700">
              Tu matrícula venció y la administración ha generado una obligación de renovación.
              Por favor, sube tu comprobante de pago para continuar usando el sistema.
            </p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-lg">
          <div className="flex justify-between font-semibold text-base mb-4">
            <span>Renovación Matrícula:</span>
            <span className="text-primary-blue">{formatCurrency(financialStatus.enrollment.amount)}</span>
          </div>
          {financialStatus.enrollment.paymentStatus === "PENDING" ? (
            <div className="flex items-center gap-2 px-4 py-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              Comprobante en revisión
            </div>
          ) : (
            <button
              onClick={() => handleUploadReceipt(financialStatus.enrollment.obligationId)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors font-medium"
            >
              <FaUpload /> Subir comprobante
            </button>
          )}
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

  // ─── Caso normal: vista de mensualidades ─────────────────────────────────
  const totalDebt = financialStatus?.totalDebt;
  const isBlocked = totalDebt?.maxDaysLate >= 15;

  return (
    <div className="p-6 font-questrial w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Mis Pagos</h1>
      </div>

      {/* Banner de bloqueo */}
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
      {totalDebt && (
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
            { key: "pendientes", label: "Pendientes", count: pendingObligations.length, activeColor: "bg-primary-purple/10 text-primary-purple", badgeActive: "bg-primary-purple text-white" },
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
          pendingObligations.length > 0 ? (
            pendingObligations.map(renderObligationCard)
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