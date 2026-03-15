import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";
import { formatCurrency } from "../utils/currencyUtils";

const PaymentRejectModal = ({ isOpen, onClose, payment, onReject, loading = false }) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (isOpen) {
      setRejectionReason("");
      setErrors({});
      setTouched({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!rejectionReason.trim()) {
      newErrors.rejectionReason = "El motivo de rechazo es obligatorio";
    } else if (rejectionReason.trim().length < 10) {
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
      await onReject(payment.id, rejectionReason.trim());
      handleClose();
    } catch (error) {
      console.error('Error al rechazar pago:', error);
    }
  };

  const handleClose = () => {
    setRejectionReason("");
    setErrors({});
    setTouched({});
    onClose();
  };

  if (!isOpen || !payment) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-red-50 to-red-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-full">
              <FaExclamationTriangle className="text-red-600 w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Rechazar Comprobante
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Proporciona el motivo del rechazo
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-red-200 rounded-full transition-colors"
            disabled={loading}
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-6 flex-1 overflow-y-auto">
            {/* Payment Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Información del Pago
              </h4>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Deportista:</span>
                  <span className="font-medium text-gray-900">
                    {payment.athlete?.user?.firstName} {payment.athlete?.user?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Identificación:</span>
                  <span className="font-medium text-gray-900">
                    {payment.athlete?.user?.identification}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo de Pago:</span>
                  <span className="font-medium text-gray-900">
                    {{
                      MONTHLY: 'Mensualidad',
                      ENROLLMENT_INITIAL: 'Matrícula Inicial',
                      ENROLLMENT_RENEWAL: 'Renovación Matrícula',
                    }[payment.obligation?.type] || 'Otro'}
                  </span>
                </div>
                {payment.obligation?.period && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Período:</span>
                    <span className="font-medium text-gray-900">
                      {payment.obligation.period}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-gray-600">Monto:</span>
                  <span className="font-bold text-lg text-primary-blue">
                    {formatCurrency(payment.obligation?.baseAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Rejection Reason */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Motivo del Rechazo *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                onBlur={() => setTouched({ ...touched, rejectionReason: true })}
                placeholder="Describe detalladamente por qué se rechaza este comprobante de pago..."
                rows={4}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all resize-none ${
                  errors.rejectionReason && touched.rejectionReason
                    ? 'border-red-300 bg-red-50 focus:border-red-500' 
                    : 'border-gray-200 focus:border-primary-blue bg-white'
                }`}
              />
              {errors.rejectionReason && touched.rejectionReason && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="w-3 h-3" />
                  {errors.rejectionReason}
                </p>
              )}
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <FaExclamationTriangle className="text-amber-500 mt-0.5 flex-shrink-0" size={16} />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-2">Consecuencias del rechazo:</p>
                  <ul className="space-y-1 text-amber-700">
                    <li>• El deportista podrá subir un nuevo comprobante</li>
                    <li>• Se enviará notificación con el motivo del rechazo</li>
                    <li>• Esta acción quedará registrada en el historial</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-100 bg-gray-50">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !rejectionReason.trim()}
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Rechazando...</span>
                </>
              ) : (
                <>
                  <FaExclamationTriangle className="w-4 h-4" />
                  <span>Rechazar Comprobante</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PaymentRejectModal;