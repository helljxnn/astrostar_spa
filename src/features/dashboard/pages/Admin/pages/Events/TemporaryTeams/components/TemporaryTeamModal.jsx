import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  UserCheck,
  Users,
  X as XIcon,
  Trash2,
  ChevronDown,
  Plus,
} from "lucide-react";
import { FormField } from "../../../../../../../../shared/components/FormField";
import SelectionModal from "../components/SelectionModal";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../../../../../../../../shared/utils/alerts";
import {
  useFormTemporaryTeamsValidation,
  temporaryTeamsValidationRules,
} from "../hooks/useFormTemporaryTeamsValidation";

const states = [
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
];

const TemporaryTeamModal = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  teamToEdit = null,
  mode = teamToEdit ? "edit" : "create",
}) => {
  const isEditing = mode === "edit" || teamToEdit !== null;

  const [isTrainerModalOpen, setIsTrainerModalOpen] = useState(false);
  const [isPlayersModalOpen, setIsPlayersModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [teamType, setTeamType] = useState(null);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAllFields,
    resetForm,
    setTouched,
    setValues,
  } = useFormTemporaryTeamsValidation(
    {
      nombreEquipo: "",
      telefono: "",
      entrenador: "",
      jugadoras: [],
      estado: "Activo",
      descripcion: "",
    },
    temporaryTeamsValidationRules
  );

  // Cargar datos para edición
  useEffect(() => {
    if (isOpen && isEditing && teamToEdit) {
      setValues({
        nombreEquipo: teamToEdit.nombre || "",
        telefono: teamToEdit.telefono || "",
        entrenador: teamToEdit.entrenador || "",
        jugadoras: Array.isArray(teamToEdit.jugadoras)
          ? teamToEdit.jugadoras
          : [],
        estado: teamToEdit.estado || "Activo",
        descripcion: teamToEdit.descripcion || "",
      });

      // Restaurar entrenador seleccionado
      if (teamToEdit.entrenadorData) {
        setSelectedTrainer(teamToEdit.entrenadorData);
        setTeamType(teamToEdit.entrenadorData.type);
      }

      // Restaurar jugadoras seleccionadas
      if (Array.isArray(teamToEdit.jugadoras)) {
        setSelectedPlayers(teamToEdit.jugadoras);
      }
    } else if (isOpen && !isEditing) {
      // Limpiar al abrir para crear
      setSelectedTrainer(null);
      setSelectedPlayers([]);
      setTeamType(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEditing, teamToEdit]);

  const formatPhoneNumber = (phone) => {
    if (!phone) return phone;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (cleanPhone.startsWith("+57") || cleanPhone.startsWith("57"))
      return phone;
    if (/^\d{7,10}$/.test(cleanPhone)) return `+57 ${cleanPhone}`;
    return phone;
  };

  // Validar consistencia de tipos
  const validateTeamConsistency = () => {
    if (selectedTrainer && selectedPlayers.length > 0) {
      const trainerType = selectedTrainer.type;
      const playersType = selectedPlayers[0]?.type;

      if (trainerType !== playersType) {
        const trainerTypeText =
          trainerType === "fundacion" ? "Fundación" : "Temporal";
        const playersTypeText =
          playersType === "fundacion" ? "Fundación" : "Temporal";

        showErrorAlert(
          "Tipos inconsistentes",
          `El entrenador es de tipo ${trainerTypeText} pero las jugadoras son de tipo ${playersTypeText}. El equipo debe estar conformado únicamente por personas de la Fundación o únicamente por personas temporales.`
        );
        return false;
      }
    }

    return true;
  };

  // Manejar selección de entrenador
  const handleTrainerSelect = (trainer) => {
    setSelectedTrainer(trainer);
    setTeamType(trainer.type);
    handleChange("entrenador", trainer.name);
    setIsTrainerModalOpen(false);
  };

  // Manejar selección de jugadoras
  const handlePlayersSelect = (players) => {
    setSelectedPlayers(players);
    handleChange("jugadoras", players);
  };

  // Eliminar jugadora seleccionada
  const removePlayer = (playerId) => {
    const updated = selectedPlayers.filter((p) => p.id !== playerId);
    setSelectedPlayers(updated);
    handleChange("jugadoras", updated);

    // Si no hay jugadoras, resetear el tipo
    if (updated.length === 0) {
      setTeamType(selectedTrainer?.type || null);
    }
  };

  const handleSubmit = async () => {
    // Marcar todos como touched
    const allTouched = {};
    Object.keys(temporaryTeamsValidationRules).forEach((field) => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    if (!validateAllFields()) {
      const allTouched = {};
      Object.keys(temporaryTeamsValidationRules).forEach((field) => {
        allTouched[field] = true;
      });
      setTouched(allTouched);
      return;
    }

    // Validar consistencia de tipos
    if (!validateTeamConsistency()) {
      return;
    }

    if (isEditing) {
      const confirmResult = await showConfirmAlert(
        "¿Estás seguro?",
        `¿Deseas actualizar la información del equipo ${
          teamToEdit?.nombre || values.nombreEquipo
        }?`,
        { confirmButtonText: "Sí, actualizar", cancelButtonText: "Cancelar" }
      );
      if (!confirmResult.isConfirmed) return;
    }

    try {
      const teamData = {
        nombre: values.nombreEquipo,
        telefono: formatPhoneNumber(values.telefono),
        entrenador: values.entrenador,
        entrenadorData: selectedTrainer,
        jugadoras: selectedPlayers,
        jugadorasIds: selectedPlayers.map((j) => j.id),
        cantidadJugadoras: selectedPlayers.length,
        estado: values.estado,
        descripcion: values.descripcion,
        teamType: teamType, // Guardar el tipo de equipo
      };

      if (isEditing) {
        const updatedTeamData = { ...teamData, id: teamToEdit.id };
        await onUpdate(updatedTeamData);
        showSuccessAlert(
          "Equipo actualizado",
          `Los datos de ${teamData.nombre} han sido actualizados.`
        );
      } else {
        await onSave(teamData);
        showSuccessAlert(
          "Equipo creado",
          "El equipo ha sido creado exitosamente."
        );
      }

      resetForm();
      setSelectedTrainer(null);
      setSelectedPlayers([]);
      setTeamType(null);
      onClose();
    } catch (error) {
      console.error(error);
      showErrorAlert(
        "Error",
        error.message || "Ocurrió un error al guardar el equipo"
      );
    }
  };

  const handleClose = () => {
    resetForm();
    setSelectedTrainer(null);
    setSelectedPlayers([]);
    setTeamType(null);
    onClose();
  };

  // Obtener texto del tipo de equipo
  const getTeamTypeText = () => {
    if (!teamType) return null;
    return teamType === "fundacion" ? "Fundación" : "Temporales";
  };

  if (!isOpen) return null;

  return (
    <>
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
              onClick={handleClose}
            >
              <XIcon className="w-5 h-5" />
            </button>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
              {isEditing ? "Editar Equipo" : "Crear Equipo"}
            </h2>
            {isEditing && (
              <p className="text-center text-gray-600 mt-2">
                Modificando:{" "}
                <span className="font-semibold text-primary-purple">
                  {teamToEdit?.nombre}
                </span>
              </p>
            )}
            {teamType && (
              <div className="text-center mt-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    teamType === "fundacion"
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
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Nombre del Equipo"
                name="nombreEquipo"
                type="text"
                placeholder="Ej: Manuela Vanegas Sub-17"
                value={values.nombreEquipo}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.nombreEquipo}
                touched={touched.nombreEquipo}
                delay={0.15}
                required
              />

              <FormField
                label="Número Telefónico"
                name="telefono"
                type="text"
                placeholder="Número de contacto"
                value={values.telefono}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.telefono}
                touched={touched.telefono}
                delay={0.2}
                required
              />
            </div>

            {/* Selección de Entrenador - MEJORADO */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Entrenador <span className="text-red-500">*</span>
                {selectedTrainer && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    • Tipo: {getTeamTypeText()}
                  </span>
                )}
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsTrainerModalOpen(true)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${
                    touched.entrenador && errors.entrenador
                      ? "border-red-400"
                      : selectedTrainer
                      ? "border-primary-purple/30 bg-primary-purple/5 hover:border-primary-purple/50"
                      : "border-gray-300 bg-white hover:border-primary-purple hover:bg-primary-purple/3"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        selectedTrainer
                          ? "bg-primary-purple text-white"
                          : "bg-gray-100 text-gray-400 group-hover:bg-primary-purple/10 group-hover:text-primary-purple"
                      }`}
                    >
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      {selectedTrainer ? (
                        <div>
                          <p className="font-semibold text-gray-900">
                            {selectedTrainer.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-600">
                              {selectedTrainer.identification}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 group-hover:text-gray-700">
                          Seleccionar entrenador
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      selectedTrainer
                        ? "text-primary-purple"
                        : "group-hover:text-primary-purple"
                    }`}
                  />
                </button>

                {selectedTrainer && (
                  <motion.button
                    type="button"
                    onClick={() => {
                      setSelectedTrainer(null);
                      setTeamType(null);
                      handleChange("entrenador", "");
                    }}
                    className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <XIcon className="w-4 h-4" />
                  </motion.button>
                )}
              </div>

              {touched.entrenador && errors.entrenador && (
                <motion.p
                  className="text-sm text-red-500 flex items-center gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span>⚠</span> {errors.entrenador}
                </motion.p>
              )}
            </div>

            {/* Selección de Jugadoras - MEJORADO */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Jugadoras <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {selectedPlayers.length > 0 && (
                    <span className="text-sm text-primary-purple font-semibold bg-primary-purple/10 px-3 py-1 rounded-full">
                      {selectedPlayers.length} seleccionada
                      {selectedPlayers.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {teamType && selectedPlayers.length > 0 && (
                    <span className="text-sm text-gray-600">
                      • Tipo: {getTeamTypeText()}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setIsPlayersModalOpen(true)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${
                    touched.jugadoras && errors.jugadoras
                      ? "border-red-400"
                      : selectedPlayers.length > 0
                      ? "border-primary-purple/30 bg-primary-purple/5 hover:border-primary-purple/50"
                      : "border-gray-300 bg-white hover:border-primary-purple hover:bg-primary-purple/3"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        selectedPlayers.length > 0
                          ? "bg-primary-purple text-white"
                          : "bg-gray-100 text-gray-400 group-hover:bg-primary-purple/10 group-hover:text-primary-purple"
                      }`}
                    >
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p
                        className={`font-medium ${
                          selectedPlayers.length > 0
                            ? "text-gray-900"
                            : "text-gray-500 group-hover:text-gray-700"
                        }`}
                      >
                        {selectedPlayers.length > 0
                          ? "Modificar selección de jugadoras"
                          : "Seleccionar jugadoras"}
                      </p>
                      {selectedPlayers.length === 0 && (
                        <p className="text-sm text-gray-400 mt-1">
                          Haz clic para agregar jugadoras al equipo
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedPlayers.length > 0 && (
                      <div className="w-6 h-6 bg-primary-purple text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {selectedPlayers.length}
                      </div>
                    )}
                    <Plus
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        selectedPlayers.length > 0
                          ? "text-primary-purple"
                          : "group-hover:text-primary-purple"
                      }`}
                    />
                  </div>
                </button>

                {/* Lista de jugadoras seleccionadas - MEJORADA */}
                {selectedPlayers.length > 0 && (
                  <motion.div
                    className="space-y-2 max-h-60 overflow-y-auto p-4 bg-gray-50 rounded-xl border border-gray-200"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Jugadoras seleccionadas
                      </span>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                        {selectedPlayers.length} jugadoras
                      </span>
                    </div>
                    {selectedPlayers.map((player, index) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-purple/30 hover:shadow-sm transition-all group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 truncate">
                              {player.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                            {player.categoria && (
                              <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                                {player.categoria}
                              </span>
                            )}
                            {player.identification && (
                              <span>{player.identification}</span>
                            )}
                          </div>
                        </div>
                        <motion.button
                          type="button"
                          onClick={() => removePlayer(player.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Eliminar jugadora"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>

              {touched.jugadoras && errors.jugadoras && (
                <motion.p
                  className="text-sm text-red-500 flex items-center gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span>⚠</span> {errors.jugadoras}
                </motion.p>
              )}
            </div>

            {/* Estado y Descripción */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado del Equipo <span className="text-red-500">*</span>
                </label>
                <select
                  name="estado"
                  value={values.estado}
                  onChange={(e) => handleChange("estado", e.target.value)}
                  onBlur={() => handleBlur("estado")}
                  className={`w-full rounded-lg border px-4 py-2.5 transition focus:ring-2 focus:ring-primary-purple ${
                    touched.estado && errors.estado
                      ? "border-red-400"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Seleccione un estado</option>
                  {states.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>

                {touched.estado && errors.estado && (
                  <motion.p
                    className="mt-2 text-sm text-red-500 flex items-center gap-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span>⚠</span> {errors.estado}
                  </motion.p>
                )}
              </div>
              <FormField
                label="Descripción (Opcional)"
                name="descripcion"
                type="textarea"
                placeholder="Información adicional del equipo..."
                value={values.descripcion}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.descripcion}
                touched={touched.descripcion}
                rows={3}
                delay={0.4}
              />
            </div>

            {/* Botones de acción */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <motion.button
                type="button"
                onClick={handleClose}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancelar
              </motion.button>

              <motion.button
                onClick={handleSubmit}
                className="px-8 py-3 text-white rounded-xl transition-all duration-200 font-medium shadow-lg bg-gradient-to-r from-primary-purple to-primary-blue"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 25px rgba(139, 92, 246, 0.3)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                {isEditing ? "Actualizar Equipo" : "Crear Equipo"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Modales de selección */}
      <SelectionModal
        isOpen={isTrainerModalOpen}
        onClose={() => setIsTrainerModalOpen(false)}
        mode="trainer"
        onSelect={handleTrainerSelect}
        selectedItems={selectedTrainer ? [selectedTrainer] : []}
      />

      <SelectionModal
        isOpen={isPlayersModalOpen}
        onClose={() => setIsPlayersModalOpen(false)}
        mode="players"
        onSelect={handlePlayersSelect}
        selectedItems={selectedPlayers}
      />
    </>
  );
};

export default TemporaryTeamModal;
