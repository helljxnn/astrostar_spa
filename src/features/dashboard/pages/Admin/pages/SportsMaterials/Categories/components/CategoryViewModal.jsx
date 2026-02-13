const CategoryViewModal = ({ isOpen, onClose, category, onEdit, canEdit }) => {
  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-primary-purple to-primary-blue p-6 relative">
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold text-white">Detalles de la Categoría</h2>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Nombre
              </label>
              <p className="text-lg font-semibold text-gray-900">{category.nombre}</p>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Descripción
              </label>
              <p className="text-gray-700">{category.descripcion || 'Sin descripción'}</p>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Estado
              </label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                category.estado === 'Activo'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {category.estado}
              </span>
            </div>

            {/* Información adicional */}
            {category.createdAt && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Fecha de Creación
                </label>
                <p className="text-gray-700">
                  {new Date(category.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Cerrar
            </button>
            {canEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(category);
                }}
                className="px-6 py-2 bg-primary-blue hover:bg-primary-purple text-white rounded-lg shadow transition-colors font-medium"
              >
                Editar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryViewModal;
