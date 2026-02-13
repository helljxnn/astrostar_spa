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
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Nombre del Material
              </label>
              <p className="text-lg font-semibold text-gray-900">{material.nombre}</p>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Categoría
              </label>
              <p className="text-lg text-gray-900">{material.categoria}</p>
            </div>

            {/* Stock Actual */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Stock Actual
              </label>
              <p className="text-2xl font-bold text-primary-blue">{material.stockActual || 0} unidades</p>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Estado
              </label>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                material.estado === 'Activo' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {material.estado}
              </span>
            </div>

            {/* Descripción */}
            {material.descripcion && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Descripción
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">{material.descripcion}</p>
              </div>
            )}

            {/* Información de auditoría */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Información del Sistema</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Creado:</span>
                  <p className="text-gray-900">{formatDate(material.createdAt)}</p>
                </div>
                {material.updatedAt && (
                  <div>
                    <span className="text-gray-500">Última actualización:</span>
                    <p className="text-gray-900">{formatDate(material.updatedAt)}</p>
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
