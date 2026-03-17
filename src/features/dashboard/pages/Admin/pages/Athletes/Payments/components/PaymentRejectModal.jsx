import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaExclamationTriangle } from "react-icons/fa";
import { FormField } from "../../../../../../../../shared/components/FormField";
import { formatCurrency } from "../utils/currencyUtils";

const PaymentRejectModal = ({ isOpen, onClose, payment, onReject, loading = false }) => {
  const [formData, setFormData] = useState({
    rejectionReason: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        rejectionReason: "",
      });
      setErrors({});
      setTouched({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.rejectionReason.trim()) {
      newErrors.rejectionReason = "El motivo de rechazo es obligatorio";
    } else if (formData.rejectionReason.trim().length < 10) {
      newErrors.rejectionReason = "El motivo debe tener al menos 10 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setTouched({ rejectionReason: true });
    
    if (!validateForm()) return;

    try {
      await onReject(payment.id, formData.rejectionReason.trim());
      onClose();
    } catch (error) {
      console.error('Error al rechazar pago:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateForm();
  };

  if (!isOpen || !payment) return null;

  const modalContent = (
    <div className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-4 relative">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            Rechazar Comprobante
          </h2>
        </div>

        {/* Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Deportista - Campo individual */}
            <FormField
              label="Deportista"
              name="deportista"
              type="text"
              value={`${payment.athlete?.user?.firstName} ${payment.athlete?.user?.lastName}`}
              readOnly
            />

            {/* Documento - Campo individual */}
            <FormField
              label="Documento"
              name="documento"
              type="text"
              value={payment.athlete?.user?.identification || ""}
              readOnly
            />

            {/* Tipo de Pago - Campo individual */}
            <FormField
              label="Tipo de Pago"
              name="tipoPago"
              type="text"
              value={{
                MONTHLY: 'Mensualidad',
                ENROLLMENT_INITIAL: 'Matrícula Inicial',
                ENROLLMENT_RENEWAL: 'Renovación Matrícula',
              }[payment.obligation?.type] || 'Otro'}
              readOnly
            />

            {/* Monto - Campo individual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto
              </label>
              <input
                type="text"
                value={formatCurrency(payment.obligation?.baseAmount)}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed text-gray-700"
              />
            </div>

            {/* Período - Campo individual (solo si existe) */}
            {payment.obligation?.period && (
              <FormField
                label="Período"
                name="periodo"
                type="text"
                value={payment.obligation.period}
                readOnly
              />
            )}

            {/* Motivo del Rechazo */}
            <FormField
              label="Motivo del Rechazo"
              name="rejectionReason"
              type="textarea"
              value={formData.rejectionReason}
              onChange={handleChange}
              onBlur={() => handleBlur("rejectionReason")}
              error={errors.rejectionReason}
              touched={touched.rejectionReason}
              required
              placeholder="Describe detalladamente por qué se rechaza este comprobante..."
              rows={3}
            />

            {/* Warning */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="text-gray-500 mt-0.5 flex-shrink-0" size={16} />
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-2 text-gray-600">Consecuencias del rechazo:</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• El deportista podrá subir un nuevo comprobante</li>
                    <li>• Se enviará notificación con el motivo del rechazo</li>
                    <li>• Esta acción quedará registrada en el historial</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={loading || !formData.rejectionReason.trim()}
              >
                {loading ? (
                  <span>Rechazando...</span>
                ) : (
                  <>
                    <FaExclamationTriangle className="w-4 h-4" />
                    <span>Rechazar</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PaymentRejectModal;

