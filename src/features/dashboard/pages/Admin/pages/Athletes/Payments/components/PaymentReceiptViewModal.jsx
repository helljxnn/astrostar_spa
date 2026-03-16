import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaEye, FaFileAlt, FaImage } from "react-icons/fa";

/**
 * Modal simple para visualizar solo el comprobante de pago
 * Enfocado únicamente en mostrar el archivo, sin información redundante
 */
const PaymentReceiptViewModal = ({ isOpen, onClose, payment }) => {
  if (!isOpen || !payment) return null;

  const receiptUrl = payment.receiptUrl;
  const hasReceipt = Boolean(receiptUrl);

  // Determinar tipo de archivo
  const getFileType = () => {
    if (!receiptUrl) return null;
    const extension = receiptUrl.split('.').pop()?.toLowerCase();
    return ['pdf'].includes(extension) ? 'pdf' : 'image';
  };

  const fileType = getFileType();

  const handleViewInNewTab = () => {
    if (hasReceipt) {
      window.open(receiptUrl, "_blank", "noopener,noreferrer");
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-lg w-full max-w-7xl max-h-[98vh] overflow-hidden relative flex flex-col"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-white rounded-t-xl border-b border-gray-100 p-3 relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                onClick={onClose}
              >
                ✕
              </button>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
                Comprobante de Pago
              </h2>
            </div>

            {/* Body - Solo el comprobante */}
            <div className="flex-1 overflow-y-auto p-3">
              {/* Mostrar motivo de rechazo si el pago fue rechazado */}
              {payment.status === 'REJECTED' && (payment.rejectionReason || payment.reason) && (
                <div className="mb-4 p-4 bg-red-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-red-600 text-sm font-bold">!</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-red-800 mb-2">
                        Comprobante Rechazado
                      </h4>
                      <div className="bg-white p-3 rounded-md">
                        <p className="text-sm font-medium text-gray-700 mb-1">Motivo del rechazo:</p>
                        <p className="text-sm text-red-700 leading-relaxed">
                          {payment.rejectionReason || payment.reason || 'No se especificó un motivo'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {hasReceipt ? (
                <div className="space-y-4">
                  {/* Vista previa para imágenes */}
                  {fileType === 'image' && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <img
                        src={receiptUrl}
                        alt="Comprobante de pago"
                        className="w-full h-auto max-h-[70vh] mx-auto rounded-lg object-contain cursor-zoom-in"
                        style={{ maxWidth: '100%', height: 'auto' }}
                        onClick={() => window.open(receiptUrl, '_blank')}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="hidden text-center text-gray-500 py-8">
                        <FaImage className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No se pudo cargar la imagen</p>
                      </div>
                    </div>
                  )}

                  {/* Vista para PDFs */}
                  {fileType === 'pdf' && (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <FaFileAlt className="w-20 h-20 mx-auto mb-4 text-red-500" />
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Documento PDF
                      </h3>
                      <p className="text-gray-600 mb-6">
                        El comprobante es un archivo PDF. Haz clic en el botón de abajo para abrirlo en una nueva pestaña.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <FaFileAlt className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Sin Comprobante
                  </h3>
                  <p className="text-gray-600">
                    Este pago aún no tiene un comprobante asociado.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-gray-100 p-3">
              <div className="flex justify-center gap-3">
                {hasReceipt && (
                  <button
                    onClick={handleViewInNewTab}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-purple hover:bg-primary-blue text-white rounded-lg transition-colors font-medium text-sm"
                  >
                    <FaEye className="w-4 h-4" />
                    Abrir en Nueva Pestaña
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default PaymentReceiptViewModal;
