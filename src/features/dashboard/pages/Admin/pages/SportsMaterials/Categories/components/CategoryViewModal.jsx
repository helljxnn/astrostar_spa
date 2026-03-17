import { createPortal } from "react-dom";
import { FormField } from "../../../../../../../../shared/components/FormField";

const CategoryViewModal = ({ isOpen, onClose, category, onEdit, canEdit }) => {
  if (!isOpen || !category) return null;

  const modalContent = (
    <div className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-3 relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            Detalles de la Categoría
          </h2>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-3">
            {/* Nombre */}
            <div>
              <FormField
                label="Nombre de la Categoría"
                name="nombre"
                type="text"
                value={category.nombre}
                disabled={true}
              />
            </div>

            {/* Descripción */}
            <div>
              <FormField
                label="Descripción"
                name="descripcion"
                type="textarea"
                value={category.descripcion || ""}
                disabled={true}
                rows={3}
              />
            </div>

            {/* Estado */}
            <div>
              <FormField
                label="Estado"
                name="estado"
                type="text"
                value={category.estado}
                disabled={true}
              />
            </div>

            {/* Materiales asociados */}
            {category.materialsCount !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Materiales Asociados
                </label>
                <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                  {category.materialsCount} material(es)
                </div>
              </div>
            )}

            {/* Información del sistema */}
            {category.createdAt && (
              <div className="mt-auto p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Información del Sistema
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Fecha de Creación:
                    </span>
                    <p className="text-gray-800">
                      {new Date(category.createdAt).toLocaleDateString(
                        "es-ES",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                  {category.updatedAt && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Última Actualización:
                      </span>
                      <p className="text-gray-800">
                        {new Date(category.updatedAt).toLocaleDateString(
                          "es-ES",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
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

  return createPortal(modalContent, document.body);
};

export default CategoryViewModal;

