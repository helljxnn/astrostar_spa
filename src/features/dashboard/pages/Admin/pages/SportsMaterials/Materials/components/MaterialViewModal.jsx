import { FaEdit } from 'react-icons/fa';
import { formatDate } from '../../shared/utils/stockCalculations';

const MaterialViewModal = ({ isOpen, onClose, material, onEdit, canEdit }) => {
  if (!isOpen || !material) return null;

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
            Detalles del Material
          </h2>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-3">
            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                {material.categoria}
              </div>
            </div>

            {/* Nombre del Material */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Material
              </label>
              <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                {material.nombre}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 min-h-[80px]">
                {material.descripcion || 'Sin descripción'}
              </div>
            </div>

            {/* Stock Actual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desglose de Stock
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Stock Disponible
                  </label>
                  <div className="px-3 py-2 bg-green-50 border border-green-300 rounded-lg text-green-800 font-semibold">
                    {material.stockDisponible || 0} unidades
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Stock Reservado
                  </label>
                  <div className="px-3 py-2 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-800 font-semibold">
                    {material.stockReservado || 0} unidades
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Stock Total
                  </label>
                  <div className="px-3 py-2 bg-blue-50 border border-blue-300 rounded-lg text-blue-800 font-semibold">
                    {material.stockActual || 0} unidades
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                El stock solo se modifica desde Ingresos de Materiales
              </p>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                {material.estado}
              </div>
            </div>

            {/* Información del Sistema */}
            <div className="border-t border-gray-200 pt-3 mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Información del Sistema
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Fecha de Creación
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900">
                    {formatDate(material.createdAt)}
                  </div>
                </div>
                {material.updatedAt && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Última Actualización
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900">
                      {formatDate(material.updatedAt)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-3">
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Cerrar
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(material);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary-blue hover:bg-primary-purple text-white rounded-lg shadow transition-colors"
              >
                <FaEdit /> Editar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialViewModal;
