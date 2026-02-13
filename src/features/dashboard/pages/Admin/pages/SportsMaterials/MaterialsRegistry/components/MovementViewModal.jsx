import { formatDateTime } from '../../shared/utils/stockCalculations';

const MovementViewModal = ({ isOpen, onClose, movement }) => {
  if (!isOpen || !movement) return null;

  const getTipoColor = (tipo) => {
    return tipo === 'Entrada' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-3 relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            Detalles del Movimiento
          </h2>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Fecha y Hora
              </label>
              <p className="text-lg font-semibold text-gray-900">{formatDateTime(movement.fecha)}</p>
            </div>

            {/* Material */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Material
              </label>
              <p className="text-lg text-gray-900">{movement.materialNombre}</p>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Categoría
              </label>
              <p className="text-lg text-gray-900">{movement.categoria}</p>
            </div>

            {/* Tipo de Movimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Tipo de Movimiento
              </label>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getTipoColor(movement.tipoMovimiento)}`}>
                {movement.tipoMovimiento}
              </span>
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Cantidad
              </label>
              <p className="text-2xl font-bold text-primary-blue">{movement.cantidad} unidades</p>
            </div>

            {/* Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Stock Anterior
                </label>
                <p className="text-lg text-gray-900">{movement.stockAnterior} unidades</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Stock Nuevo
                </label>
                <p className="text-lg font-semibold text-gray-900">{movement.stockNuevo} unidades</p>
              </div>
            </div>

            {/* Origen */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Origen
              </label>
              <p className="text-lg text-gray-900">{movement.origen}</p>
            </div>

            {/* Observaciones */}
            {movement.observaciones && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Observaciones
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">{movement.observaciones}</p>
              </div>
            )}

            {/* Información de auditoría */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Información del Sistema</h3>
              <div className="text-sm">
                {movement.createdByName && (
                  <div>
                    <span className="text-gray-500">Registrado por:</span>
                    <p className="text-gray-900">{movement.createdByName}</p>
                  </div>
                )}
              </div>
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  ⚠️ Los movimientos no pueden ser editados ni eliminados para mantener la trazabilidad del inventario.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-3">
          <div className="flex justify-end">
            <button
              type="button"
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

export default MovementViewModal;
