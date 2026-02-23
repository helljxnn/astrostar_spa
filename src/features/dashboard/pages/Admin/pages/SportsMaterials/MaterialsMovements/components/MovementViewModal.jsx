import { formatDate } from '../../shared/utils/stockCalculations';
import { formatStock } from '../../../../../../../../shared/utils/numberFormat';
import { getTipoBajaLabel } from '../../shared/utils/tipoBajaLabels';

const MovementViewModal = ({ isOpen, onClose, movement }) => {
  if (!isOpen || !movement) return null;

  // Determinar si es una baja o un ingreso
  const esBaja = movement.tipoMovimiento === 'Salida' || 
                 movement.tipoMovimiento === 'salida' ||
                 movement.tipoMovimiento === 'Baja' ||
                 movement.tipoMovimiento === 'baja' ||
                 movement.tipo_baja;

  // Validaciones defensivas para asegurar valores correctos
  const getStockValue = (value) => {
    // Si el valor es null, undefined o no es un número válido, retornar 0
    if (value === null || value === undefined) return 0;
    
    // Si es string, intentar parsearlo
    if (typeof value === 'string') {
      // Si ya está formateado (contiene puntos), limpiar y parsear
      const cleanValue = value.replace(/\./g, '');
      const parsed = parseInt(cleanValue, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    // Si es número, retornarlo
    if (typeof value === 'number') {
      return isNaN(value) ? 0 : value;
    }
    
    return 0;
  };

  // Obtener valores validados
  const stockAnterior = getStockValue(movement.stockAnterior);
  const stockNuevo = getStockValue(movement.stockNuevo);
  const cantidad = getStockValue(movement.cantidad);

  // Validación de consistencia: Stock Nuevo debe ser Stock Anterior + Cantidad
  const stockCalculado = stockAnterior + cantidad;
  const stockMostrar = stockNuevo || stockCalculado; // Si stockNuevo no existe, usar el calculado

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
            {esBaja ? 'Detalles de la Baja' : 'Detalles del Ingreso'}
          </h2>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-3">
            {/* Material */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material
              </label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 min-h-[42px] break-words">
                {movement.materialNombre}
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                {movement.categoria}
              </div>
            </div>

            {/* Cantidad y Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-semibold">
                  {formatStock(cantidad)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {esBaja ? 'Fecha de Baja' : 'Fecha de Ingreso'}
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  {formatDate(movement.fechaIngreso || movement.fecha)}
                </div>
              </div>
            </div>

            {/* Stock Anterior y Nuevo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Anterior
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  {formatStock(stockAnterior)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Nuevo
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  {formatStock(stockMostrar)}
                </div>
              </div>
            </div>

            {/* Tipo de Baja (solo para bajas) */}
            {esBaja && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Baja
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  {getTipoBajaLabel(movement.tipo_baja || movement.tipoBaja)}
                </div>
              </div>
            )}

            {/* Descripción (solo para bajas) */}
            {esBaja && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 whitespace-pre-wrap min-h-[80px]">
                  {movement.descripcion || movement.observaciones || 'Sin descripción'}
                </div>
              </div>
            )}

            {/* Proveedor (solo para ingresos) */}
            {!esBaja && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proveedor
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  {movement.proveedor ? (
                    <div>
                      <p className="font-medium">{movement.proveedor}</p>
                      {movement.proveedorNit && (
                        <p className="text-sm text-gray-600 mt-1">
                          {movement.proveedorTipoEntidad === 'Juridica' 
                            ? `NIT: ${movement.proveedorNit}`
                            : movement.proveedorTipoDocumento
                              ? `${movement.proveedorTipoDocumento}: ${movement.proveedorNit}`
                              : `Identificación: ${movement.proveedorNit}`
                          }
                        </p>
                      )}
                    </div>
                  ) : (
                    'Sin proveedor'
                  )}
                </div>
              </div>
            )}

            {/* Observaciones (solo para ingresos) */}
            {!esBaja && movement.observaciones && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 whitespace-pre-wrap min-h-[80px]">
                  {movement.observaciones}
                </div>
              </div>
            )}
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
