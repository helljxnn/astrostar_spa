import { FaTimes, FaFileAlt, FaCalendar, FaDollarSign, FaCreditCard, FaUser, FaStickyNote } from 'react-icons/fa';

// Componente para ver detalles de una compra
const PurchaseViewModal = ({ isOpen, onClose, purchase }) => {
  if (!isOpen || !purchase) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isPDF = purchase.facturaUrl?.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png)$/i.test(purchase.facturaUrl);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-3 relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            Detalles de Compra
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-6">
          {/* Información Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Proveedor */}
            <div className="border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <FaUser className="text-sm" />
                <span className="text-sm font-medium">Proveedor</span>
              </div>
              <p className="text-base text-gray-900">{purchase.proveedor}</p>
            </div>

            {/* Fecha */}
            <div className="border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <FaCalendar className="text-sm" />
                <span className="text-sm font-medium">Fecha de Compra</span>
              </div>
              <p className="text-base text-gray-900">{formatDate(purchase.fechaCompra)}</p>
            </div>

            {/* Monto */}
            <div className="border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <FaDollarSign className="text-sm" />
                <span className="text-sm font-medium">Monto Total</span>
              </div>
              <p className="text-xl text-gray-900">{formatCurrency(purchase.montoTotal)}</p>
            </div>

            {/* Método de Pago */}
            <div className="border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <FaCreditCard className="text-sm" />
                <span className="text-sm font-medium">Método de Pago</span>
              </div>
              <p className="text-base text-gray-900">{purchase.metodoPago}</p>
            </div>
          </div>

          {/* Concepto */}
          <div className="border border-gray-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <FaFileAlt className="text-sm" />
              <span className="text-sm font-medium">Concepto</span>
            </div>
            <p className="text-gray-900">{purchase.concepto}</p>
          </div>

          {/* Observaciones */}
          {purchase.observaciones && (
            <div className="border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <FaStickyNote className="text-sm" />
                <span className="text-sm font-medium">Observaciones</span>
              </div>
              <p className="text-gray-900">{purchase.observaciones}</p>
            </div>
          )}

          {/* Factura */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-base text-gray-800 mb-4">Factura Adjunta</h3>

            {/* Preview de la factura */}
            <div className="bg-gray-50 rounded-lg p-4 min-h-[200px] flex items-center justify-center border border-gray-200">
              {isImage ? (
                <img
                  src={purchase.facturaUrl}
                  alt="Factura"
                  className="max-h-96 rounded-lg shadow"
                />
              ) : isPDF ? (
                <div className="text-center">
                  <FaFileAlt className="text-5xl text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Documento PDF</p>
                  <p className="text-sm text-gray-500 mt-2">Usa el botón de descarga en la tabla para ver el archivo</p>
                </div>
              ) : (
                <div className="text-center">
                  <FaFileAlt className="text-5xl text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Archivo adjunto</p>
                </div>
              )}
            </div>
          </div>

          {/* Información de Registro */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-500">
              Registrado el {formatDateTime(purchase.createdAt)}
            </p>
          </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-3">
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseViewModal;
