import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";
import { formatCurrency } from "../utils/currencyUtils";

const PaymentRejectModal = ({ isOpen, onClose, payment, onReject, loading = false }) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [errors, setErrors] = useState({});

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
    onClose();
  };

  if (!isOpen || !payment) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <FaExclamationTriangle className="text-red-500" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">
                Rechazar Pago
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              {/* Payment Info */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-red-900 mb-2">
                  Información del Pago
                </h4>
                <div className="text-sm text-red-700 space-y-1">
                  <p>
                    <strong>Atleta:</strong> {payment.athlete?.user?.firstName} {payment.athlete?.user?.lastName}
                  </p>
                  <p>
                    <strong>Identificación:</strong> {payment.athlete?.user?.identification}
                  </p>
                  <p>
                    <strong>Tipo:</strong> {payment.obligation?.type === 'MONTHLY' ? 'Mensualidad' : 'Renovación Matrícula'}
                  </p>
                  {payment.obligation?.period && (
                    <p>
                      <strong>Período:</strong> {payment.obligation.period}
                    </p>
                  )}
                  <p>
                    <strong>Monto:</strong> {formatCurrency(payment.obligation?.baseAmount)}
                  </p>
                </div>
              </div>

              {/* Rejection Reason */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo del Rechazo *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explica detalladamente por qué se rechaza este comprobante..."
                  rows={4}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.rejectionReason 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                />
                {errors.rejectionReason && (
                  <p className="mt-1 text-sm text-red-600">{errors.rejectionReason}</p>
                )}
              </div>

              {/* Warning */}
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FaExclamationTriangle className="text-yellow-500 mt-0.5" size={16} />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium mb-1">Importante:</p>
                    <ul className="space-y-1">
                      <li>• El atleta podrá subir un nuevo comprobante</li>
                      <li>• Se enviará una notificación con el motivo del rechazo</li>
                      <li>• Esta acción quedará registrada en el historial</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Rechazando...</span>
                  </>
                ) : (
                  <>
                    <FaExclamationTriangle />
                    <span>Rechazar Pago</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentRejectModal;