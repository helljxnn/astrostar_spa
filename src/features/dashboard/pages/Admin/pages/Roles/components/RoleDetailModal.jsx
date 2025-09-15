import { motion } from "framer-motion";
import { FaLock, FaFolderOpen } from "react-icons/fa";

const RoleDetailModal = ({ isOpen, onClose, roleData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
      >
        {/* Encabezado */}
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Detalle del Rol
        </h2>

        {/* Info básica */}
        <div className="space-y-2 text-gray-700 mb-6">
          <p>
            <span className="font-semibold">Nombre:</span> {roleData?.nombre}
          </p>
          <p>
            <span className="font-semibold">Descripción:</span>{" "}
            {roleData?.descripcion}
          </p>
          <p>
            <span className="font-semibold">Estado:</span>{" "}
            <span
              className={`px-2 py-1 rounded-md text-sm ${
                roleData?.estado
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {roleData?.estado ? "Activo" : "Inactivo"}
            </span>
          </p>
        </div>

        {/* Lista de permisos por módulo */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaLock className="text-primary-purple" /> Permisos por módulo
          </h3>

          {roleData?.modulos && roleData.modulos.length > 0 ? (
            <div className="space-y-3">
              {roleData.modulos
                .filter((mod) => mod.permisos && mod.permisos.length > 0)
                .map((modulo, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg p-4 shadow-sm bg-gray-50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FaFolderOpen className="text-primary-blue" />
                      <span className="font-semibold text-gray-800">
                        {modulo.nombre}
                      </span>
                    </div>
                    <ul className="list-disc list-inside text-gray-600">
                      {modulo.permisos.map((permiso, pIdx) => (
                        <li key={pIdx}>{permiso}</li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Este rol no tiene permisos asignados.
            </p>
          )}
        </div>

        {/* Botón cerrar */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg hover:opacity-90 transition"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleDetailModal;
