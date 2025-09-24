import React from "react";
import { motion } from "framer-motion";

const GuardianViewModal = ({ isOpen, onClose, guardian, athletes }) => {
  if (!isOpen || !guardian) return null;

  const guardianAthletes = athletes.filter((a) => a.acudiente === guardian.id);

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] relative"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            ✕
          </button>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            Detalles del Acudiente
          </h2>
          <p className="text-center text-gray-600 mt-2">
            Información completa de:{" "}
            <span className="font-semibold text-primary-purple">
              {guardian.nombreCompleto || "N/A"}
            </span>
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Información Personal del Acudiente */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nombre</label>
                <p className="text-gray-900 font-medium">{guardian.nombre || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Documento</label>
                <p className="text-gray-900 font-mono">
                  {guardian.tipoDocumento || "N/A"} - {guardian.identificacion || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Correo</label>
                <p className="text-gray-900">{guardian.correo || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Teléfono</label>
                <p className="text-gray-900">{guardian.telefono || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Fecha de Nacimiento</label>
                <p className="text-gray-900">{guardian.fechaNacimiento || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Estado</label>
                <p
                  className={
                    guardian.estado === "Activo"
                      ? "text-primary-purple font-semibold"
                      : "text-primary-blue font-semibold"
                  }
                >
                  {guardian.estado || "N/A"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Deportistas Asociados */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Deportistas Inscritos
            </h3>
            {guardianAthletes.length > 0 ? (
              <ul className="list-none space-y-3">
                {guardianAthletes.map((a) => (
                  <li key={a.id} className="p-3 bg-gray-100 rounded-lg shadow-sm">
                    <p className="font-semibold text-gray-900">{a.nombres} {a.apellidos}</p>
                    <p className="text-sm text-gray-600">{a.deportePrincipal} ({a.categoria})</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 mt-2">No tiene deportistas asociados.</p>
            )}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end pt-6 border-t border-gray-200 mt-6"
        >
          <motion.button
            type="button"
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-xl hover:opacity-90 transition-all duration-200 font-medium shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cerrar
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default GuardianViewModal;