import { formatDate } from '../../shared/utils/stockCalculations';
import { formatStock } from '../../../../../../../../shared/utils/numberFormat';
import { getTipoBajaLabel } from '../../shared/utils/tipoBajaLabels';

const MovementViewModal = ({ isOpen, onClose, movement }) => {
  if (!isOpen || !movement) return null;

  // Determinar el tipo de movimiento usando el campo correcto del backend
  const tipoMovimiento = movement.tipoMovimiento || movement.tipo_movimiento || '';
  
  // Detectar tipo basado en el campo "tipo" que viene del backend
  const esBaja = tipoMovimiento === 'BAJA' || tipoMovimiento === 'Baja';
  const esTransferencia = tipoMovimiento === 'TRANSFERENCIA' || tipoMovimiento === 'Transferencia';
  const esSalidaEvento = tipoMovimiento === 'SALIDA_EVENTO';
  
  // Es ingreso si es "Entrada" o si NO es ninguno de los tipos de salida
  const esIngreso = tipoMovimiento === 'Entrada' || (!esBaja && !esTransferencia && !esSalidaEvento);

  // Obtener cantidad
  const getCantidad = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'string') {
      const cleanValue = value.replace(/\./g, '');
      const parsed = parseInt(cleanValue, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof value === 'number') {
      return isNaN(value) ? 0 : value;
    }
    return 0;
  };

  const cantidad = getCantidad(movement.cantidad);

  // Determinar título del modal
  let titulo = 'Detalles del Movimiento';
  if (esIngreso) titulo = 'Detalles del Ingreso';
  else if (esBaja) titulo = 'Detalles de la Baja';
  else if (esTransferencia) titulo = 'Detalles de la Transferencia de Inventarios';
  else if (esSalidaEvento) titulo = 'Detalles de Salida por Evento';

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
            {titulo}
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
                  {esIngreso ? 'Fecha de Ingreso' : 'Fecha de Salida'}
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  {formatDate(movement.fechaIngreso || movement.fecha)}
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

            {/* Origen y Destino (para transferencias) */}
            {esTransferencia && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Desde (Origen)
                    </label>
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                      {movement.inventario_origen || movement.inventarioOrigen || 'No especificado'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hacia (Destino)
                    </label>
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                      {movement.inventario_destino || movement.inventarioDestino || 'No especificado'}
                    </div>
                  </div>
                </div>

                {/* Observaciones de transferencia - Filtrar texto automático del backend */}
                {(() => {
                  const obs = movement.observaciones || movement.descripcion || '';
                  // Filtrar mensajes automáticos del backend
                  const esTextoAutomatico = obs.includes('Transfer from') || 
                                           obs.includes('Transferencia:') ||
                                           obs.includes('De EVENTOS a') ||
                                           obs.includes('De FUNDACION a');
                  
                  // Solo mostrar si hay observaciones reales del usuario
                  if (obs && !esTextoAutomatico) {
                    return (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Observaciones
                        </label>
                        <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 whitespace-pre-wrap min-h-[60px]">
                          {obs}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </>
            )}

            {/* Origen (para bajas y salidas por evento) */}
            {(esBaja || esSalidaEvento) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inventario Origen
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  {movement.inventario_origen || movement.inventarioOrigen || 'No especificado'}
                </div>
              </div>
            )}

            {/* Evento (para salidas por evento) */}
            {esSalidaEvento && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evento
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  {movement.evento_nombre || movement.eventoNombre || 'Evento finalizado'}
                </div>
              </div>
            )}

            {/* Descripción (para bajas) */}
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

            {/* Destino (solo para ingresos) */}
            {esIngreso && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inventario Destino
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  {movement.inventario_destino || movement.inventarioDestino || 'No especificado'}
                </div>
              </div>
            )}

            {/* Proveedor (solo para ingresos) */}
            {esIngreso && (
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
            {esIngreso && movement.observaciones && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 whitespace-pre-wrap min-h-[80px]">
                  {movement.observaciones}
                </div>
              </div>
            )}

            {/* Información del Sistema (solo para ingresos) */}
            {esIngreso && movement.createdAt && (
              <div className="mt-auto p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Información del Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Fecha de Creación:</span>
                    <p className="text-gray-800">
                      {new Date(movement.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  {movement.updatedAt && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Última Actualización:</span>
                      <p className="text-gray-800">
                        {new Date(movement.updatedAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
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
