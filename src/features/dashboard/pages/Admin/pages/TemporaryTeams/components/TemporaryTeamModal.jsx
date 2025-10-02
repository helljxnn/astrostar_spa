import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserCheck, Users, X as XIcon, Trash2 } from "lucide-react";
import { FormField } from "../../../../../../../shared/components/FormField";
import SelectionModal from "../components/SelectionModal";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../../../../../../../shared/utils/alerts";
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
        jugadoras: Array.isArray(teamToEdit.jugadoras) ? teamToEdit.jugadoras : [],
        estado: teamToEdit.estado || "Activo",
        descripcion: teamToEdit.descripcion || "",
      });

      // Restaurar entrenador seleccionado
      if (teamToEdit.entrenadorData) {
        setSelectedTrainer(teamToEdit.entrenadorData);
      }

      // Restaurar jugadoras seleccionadas
      if (Array.isArray(teamToEdit.jugadoras)) {
        setSelectedPlayers(teamToEdit.jugadoras);
      }
    } else if (isOpen && !isEditing) {
      // Limpiar al abrir para crear
      setSelectedTrainer(null);
      setSelectedPlayers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEditing, teamToEdit]);

  const formatPhoneNumber = (phone) => {
    if (!phone) return phone;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (cleanPhone.startsWith("+57") || cleanPhone.startsWith("57")) return phone;
    if (/^\d{7,10}$/.test(cleanPhone)) return `+57 ${cleanPhone}`;
    return phone;
  };

  // Manejar selección de entrenador
  const handleTrainerSelect = (trainer) => {
    setSelectedTrainer(trainer);
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
    const updated = selectedPlayers.filter(p => p.id !== playerId);
    setSelectedPlayers(updated);
    handleChange("jugadoras", updated);
  };

  const handleSubmit = async () => {
    // Marcar todos como touched
    const allTouched = {};
    Object.keys(temporaryTeamsValidationRules).forEach((field) => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    if (!validateAllFields()) {
      showErrorAlert(
        "Campos incompletos",
        "Por favor completa todos los campos correctamente antes de continuar."
      );
      return;
    }

    if (isEditing) {
      const confirmResult = await showConfirmAlert(
        "¿Estás seguro?",
        `¿Deseas actualizar la información del equipo ${teamToEdit?.nombre || values.nombreEquipo}?`,
        { confirmButtonText: "Sí, actualizar", cancelButtonText: "Cancelar" }
      );
      if (!confirmResult.isConfirmed) return;
    }

    try {
      const teamData = {
        nombre: values.nombreEquipo,
        telefono: formatPhoneNumber(values.telefono),
        entrenador: values.entrenador,
        entrenadorData: selectedTrainer, // Guardar datos completos del entrenador
        jugadoras: selectedPlayers, // Array de objetos completos
        jugadorasIds: selectedPlayers.map((j) => j.id),
        cantidadJugadoras: selectedPlayers.length,
        estado: values.estado,
        descripcion: values.descripcion,
      };

      if (isEditing) {
        const updatedTeamData = { ...teamData, id: teamToEdit.id };
        await onUpdate(updatedTeamData);
        showSuccessAlert("Equipo actualizado", `Los datos de ${teamData.nombre} han sido actualizados.`);
      } else {
        await onSave(teamData);
        showSuccessAlert("Equipo creado", "El equipo ha sido creado exitosamente.");
      }

      resetForm();
      setSelectedTrainer(null);
      setSelectedPlayers([]);
      onClose();
    } catch (error) {
      console.error(error);
      showErrorAlert("Error", error.message || "Ocurrió un error al guardar el equipo");
    }
  };

  const handleClose = () => {
    resetForm();
    setSelectedTrainer(null);
    setSelectedPlayers([]);
    onClose();
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
                Modificando: <span className="font-semibold text-primary-purple">{teamToEdit?.nombre}</span>
              </p>
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

            {/* Selección de Entrenador */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entrenador <span className="text-red-500">*</span>
              </label>
              
              {selectedTrainer ? (
                <div className="flex items-center gap-3 p-4 border-2 border-primary-purple/30 bg-primary-purple/5 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-purple to-primary-blue flex items-center justify-center text-white font-bold text-lg">
                    {selectedTrainer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{selectedTrainer.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${selectedTrainer.badgeColor}`}>
                        {selectedTrainer.badge}
                      </span>
                      {selectedTrainer.identification && (
                        <span className="text-xs text-gray-600">{selectedTrainer.identification}</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTrainerModalOpen(true)}
                    className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsTrainerModalOpen(true)}
                  className={`w-full p-4 border-2 border-dashed rounded-xl transition-all flex items-center justify-center gap-2 ${
                    touched.entrenador && errors.entrenador
                      ? "border-red-400 bg-red-50 text-red-600"
                      : "border-gray-300 hover:border-primary-purple hover:bg-primary-purple/5 text-gray-600"
                  }`}
                >
                  <UserCheck className="w-5 h-5" />
                  <span className="font-medium">Seleccionar Entrenador</span>
                </button>
              )}
              
              {touched.entrenador && errors.entrenador && (
                <p className="text-sm text-red-500 mt-2">{errors.entrenador}</p>
              )}
            </div>

            {/* Selección de Jugadoras */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jugadoras <span className="text-red-500">*</span>
                {selectedPlayers.length > 0 && (
                  <span className="ml-2 text-primary-purple font-semibold">
                    ({selectedPlayers.length} seleccionadas)
                  </span>
                )}
              </label>

              <button
                type="button"
                onClick={() => setIsPlayersModalOpen(true)}
                className={`w-full p-4 border-2 border-dashed rounded-xl transition-all flex items-center justify-center gap-2 mb-3 ${
                  touched.jugadoras && errors.jugadoras
                    ? "border-red-400 bg-red-50 text-red-600"
                    : "border-gray-300 hover:border-primary-purple hover:bg-primary-purple/5 text-gray-600"
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">
                  {selectedPlayers.length > 0 ? "Modificar Jugadoras" : "Seleccionar Jugadoras"}
                </span>
              </button>

              {/* Lista de jugadoras seleccionadas */}
              {selectedPlayers.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto p-3 bg-gray-50 rounded-xl border border-gray-200">
                  {selectedPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-purple/50 transition"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{player.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${player.badgeColor}`}>
                            {player.badge}
                          </span>
                          {player.categoria && (
                            <span className="text-xs text-gray-600">{player.categoria}</span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePlayer(player.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Eliminar jugadora"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {touched.jugadoras && errors.jugadoras && (
                <p className="text-sm text-red-500 mt-2">{errors.jugadoras}</p>
              )}
            </div>

            {/* Estado y Descripción */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado del Equipo
                </label>
                <select
                  name="estado"
                  value={values.estado}
                  onChange={(e) => handleChange("estado", e.target.value)}
                  onBlur={handleBlur}
                  className={`w-full rounded-lg border px-4 py-2.5 transition focus:ring-2 focus:ring-primary-purple ${
                    touched.estado && errors.estado ? "border-red-400" : "border-gray-300"
                  }`}
                >
                  {states.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {touched.estado && errors.estado && (
                  <p className="text-sm text-red-500 mt-1">{errors.estado}</p>
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