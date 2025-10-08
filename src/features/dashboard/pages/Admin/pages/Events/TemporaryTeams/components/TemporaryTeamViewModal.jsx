// TemporaryTeamViewModal.jsx
import React from "react";
import { motion } from "framer-motion";
import { X as XIcon, UserCheck, Users, Phone, Info } from "lucide-react";

const TemporaryTeamViewModal = ({ isOpen, onClose, team }) => {
  if (!isOpen || !team) return null;

  const formatPhoneDisplay = (phone) => {
    if (!phone) return "No especificado";
    return phone;
  };

  const getTeamTypeText = () => {
    if (!team.teamType) return null;
    return team.teamType === "fundacion" ? "Fundación" : "Temporales";
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            <XIcon className="w-5 h-5" />
          </button>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            Detalles del Equipo
          </h2>
          <p className="text-center text-gray-600 mt-2">
            Información completa de:{" "}
            <span className="font-semibold text-primary-purple">
              {team.nombre}
            </span>
          </p>
          {team.teamType && (
            <div className="text-center mt-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  team.teamType === "fundacion"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                Equipo de {getTeamTypeText()}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre del Equipo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Nombre del Equipo
              </label>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-gray-900 font-semibold">{team.nombre}</p>
              </div>
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Teléfono
              </label>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-gray-900">{formatPhoneDisplay(team.telefono)}</p>
              </div>
            </div>
          </div>

          {/* Entrenador */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Entrenador
            </label>
            <div className="p-4 bg-primary-purple/5 rounded-xl border-2 border-primary-purple/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-purple text-white">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{team.entrenador}</p>
                  {team.entrenadorData && (
                    <p className="text-xs text-gray-600 mt-1">
                      {team.entrenadorData.identification}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Jugadoras */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Jugadoras
              </label>
              <span className="text-sm text-primary-purple font-semibold bg-primary-purple/10 px-3 py-1 rounded-full">
                {team.cantidadJugadoras ?? (team.jugadoras?.length ?? 0)}{" "}
                jugadora{(team.cantidadJugadoras ?? team.jugadoras?.length) !== 1 ? "s" : ""}
              </span>
            </div>

            {team.jugadoras && team.jugadoras.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto p-4 bg-gray-50 rounded-xl border border-gray-200">
                {team.jugadoras.map((j, idx) => (
                  <motion.div
                    key={j.id || idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-purple/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {j.name || j}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                        {j.categoria && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                            {j.categoria}
                          </span>
                        )}
                        {j.identification && <span>{j.identification}</span>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No hay jugadoras seleccionadas</p>
              </div>
            )}
          </div>

          {/* Estado y Descripción */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Estado */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Estado del Equipo
              </label>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    team.estado === "Activo"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {team.estado}
                </span>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Descripción
              </label>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 min-h-[80px]">
                <p className="text-gray-900 text-sm">
                  {team.descripcion || "Sin descripción"}
                </p>
              </div>
            </div>
          </div>

          {/* Botón de cierre */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <motion.button
              type="button"
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-xl transition-all duration-200 font-medium shadow-lg"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 25px rgba(139, 92, 246, 0.3)",
              }}
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