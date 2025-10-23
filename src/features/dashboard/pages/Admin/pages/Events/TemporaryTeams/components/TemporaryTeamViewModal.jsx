"use client";
import { motion } from "framer-motion";
import { X, UserCheck, Users } from "lucide-react";

const TemporaryTeamViewModal = ({ isOpen, onClose, team }) => {
  if (!isOpen || !team) return null;

  console.log("=== TEAM EN VIEW MODAL ===");
  console.log("Team completo:", team);
  console.log("team.teamType:", team.teamType);
  console.log("team.entrenadorData:", team.entrenadorData);
  console.log("team.deportistas:", team.deportistas);

  const formatPhoneDisplay = (phone) => {
    if (!phone) return "No especificado";
    return phone;
  };

  // Función simplificada y más robusta
  const getTeamTypeInfo = () => {
    let detectedType = null;

    // Prioridad 1: teamType directo
    if (
      team.teamType &&
      (team.teamType === "fundacion" || team.teamType === "temporal")
    ) {
      detectedType = team.teamType;
      console.log("Tipo detectado desde team.teamType:", detectedType);
    }
    // Prioridad 2: tipo del entrenador
    else if (team.entrenadorData?.type) {
      detectedType = team.entrenadorData.type;
      console.log("Tipo detectado desde entrenador:", detectedType);
    }
    // Prioridad 3: tipo de la primera deportista
    else {
      const deportistasList = team.deportistas || team.jugadoras || [];
      if (deportistasList.length > 0 && deportistasList[0]?.type) {
        detectedType = deportistasList[0].type;
        console.log("Tipo detectado desde deportistas:", detectedType);
      }
    }

    if (!detectedType) {
      console.warn("No se pudo detectar el tipo de equipo");
      return { type: null, text: "No especificado" };
    }

    return {
      type: detectedType,
      text: detectedType === "fundacion" ? "Fundación" : "Temporales",
    };
  };

  const teamTypeInfo = getTeamTypeInfo();
  console.log("TeamTypeInfo final:", teamTypeInfo);

  const deportistasList = team.deportistas || team.jugadoras || [];
  const cantidadDeportistas =
    team.cantidadDeportistas ?? deportistasList.length ?? 0;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden relative flex flex-col"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-3 relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            Detalles del Equipo
          </h2>
          <p className="text-center text-gray-600 mt-2">
            Información de:{" "}
            <span className="font-semibold text-primary-purple">
              {team.nombre}
            </span>
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del Equipo
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-semibold text-sm">
                    {team.nombre}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 text-sm">
                    {formatPhoneDisplay(team.telefono)}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Estado del Equipo
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 text-sm">{team.estado}</p>
                </div>
              </div>
            </motion.div>

            {/* Tipo de Equipo */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Equipo
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 text-sm">{teamTypeInfo.text}</p>
                </div>
              </div>
            </motion.div>

            {/* Categoría */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Categoría
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 text-sm">
                    {team.categoria || "No especificada"}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Entrenador */}
          <motion.div
            className="space-y-3 mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <label className="block text-sm font-medium text-gray-700">
              Entrenador
            </label>

            <div className="p-3 rounded-lg border-2 border-primary-purple/30 bg-primary-purple/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-purple text-white">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">
                    {team.entrenador}
                  </p>
                  {team.entrenadorData && (
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-600">
                        {team.entrenadorData.identification}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Deportistas */}
          <motion.div
            className="space-y-3 mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Deportistas
              </label>
              <span className="text-sm text-primary-purple font-semibold bg-primary-purple/10 px-2 py-1 rounded-full">
                {cantidadDeportistas} seleccionada
                {cantidadDeportistas !== 1 ? "s" : ""}
              </span>
            </div>

            {deportistasList && deportistasList.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Deportistas seleccionadas
                  </span>
                  <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">
                    {deportistasList.length} deportista
                    {deportistasList.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {deportistasList.map((athlete, index) => (
                  <motion.div
                    key={athlete.id || index}
                    className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200 hover:border-primary-purple/30 hover:shadow-sm transition-all"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05, duration: 0.3 }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {athlete.name || athlete}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600 flex-wrap">
                        {athlete.categoria && (
                          <span className="text-gray-600">
                            Categoría: {athlete.categoria}
                          </span>
                        )}
                        {athlete.identification && (
                          <span className="text-gray-600">
                            {athlete.identification}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">
                  No hay deportistas seleccionadas
                </p>
              </div>
            )}
          </motion.div>

          {/* Descripción */}
          <motion.div
            className="mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.4 }}
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[60px]">
                <p className="text-gray-900 text-sm whitespace-pre-wrap">
                  {team.descripcion || "Sin descripción"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-3">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-primary-blue text-white rounded-lg hover:opacity-90 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TemporaryTeamViewModal;
