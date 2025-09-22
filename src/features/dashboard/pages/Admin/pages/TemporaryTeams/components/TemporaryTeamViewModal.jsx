// TemporaryTeamViewModal.jsx
import React from "react";
import { motion } from "framer-motion";

const TemporaryTeamViewModal = ({ isOpen, onClose, team }) => {
  if (!isOpen || !team) return null;

  const formatPhoneDisplay = (phone) => {
    if (!phone) return "No especificado";
    return phone;
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            ✕
          </button>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            Detalles del Equipo
          </h2>
          <p className="text-center text-gray-600 mt-2">
            Información completa de: <span className="font-semibold text-primary-purple">{team.nombre}</span>
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Información</h3>

              <div>
                <label className="text-sm font-medium text-gray-600">Nombre</label>
                <p className="text-gray-900 font-medium">{team.nombre}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Entrenador</label>
                <p className="text-gray-900">{team.entrenador}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Teléfono</label>
                <p className="text-gray-900">{formatPhoneDisplay(team.telefono)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Cantidad Jugadoras</label>
                <p className="text-gray-900">{team.cantidadJugadoras ?? (team.jugadoras?.length ?? 0)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Jugadoras</h3>

              <div>
                {team.jugadoras && team.jugadoras.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {team.jugadoras.map((j, idx) => (
                      <li key={j.id || idx} className="text-gray-900">{j.name || j}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No hay jugadoras seleccionadas.</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Estado</label>
                <p className={team.estado === "Activo" ? "text-primary-purple font-semibold" : "text-primary-blue font-semibold"}>
                  {team.estado}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
            <motion.button
              type="button"
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-xl hover:opacity-90 transition-all duration-200 font-medium shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cerrar
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TemporaryTeamViewModal;
