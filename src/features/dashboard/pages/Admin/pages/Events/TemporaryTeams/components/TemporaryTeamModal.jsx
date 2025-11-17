"use client"

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
import TeamsService from "../services/TeamsService";

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
  const [isAthletesModalOpen, setIsAthletesModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedAthletes, setSelectedAthletes] = useState([]);
  const [teamType, setTeamType] = useState(null);
  const [currentCategoria, setCurrentCategoria] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    entrenador: "",
    estado: "Activo",
    descripcion: "",
    categoria: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && isEditing && teamToEdit) {
      setFormData({
        nombre: teamToEdit.nombre || "",
        telefono: teamToEdit.telefono || "",
        entrenador: teamToEdit.entrenador || "",
        estado: teamToEdit.estado || "Activo",
        descripcion: teamToEdit.descripcion || "",
        categoria: teamToEdit.categoria || "",
      });

      if (teamToEdit.entrenadorData) {
        setSelectedTrainer(teamToEdit.entrenadorData);
        setTeamType(teamToEdit.entrenadorData.type);
      }

      if (Array.isArray(teamToEdit.deportistas)) {
        setSelectedAthletes(teamToEdit.deportistas);
        if (teamToEdit.teamType === "fundacion" && teamToEdit.deportistas.length > 0) {
          setCurrentCategoria(teamToEdit.deportistas[0].categoria);
        }
      }
    } else if (isOpen && !isEditing) {
      setFormData({
        nombre: "",
        telefono: "",
        entrenador: "",
        estado: "Activo",
        descripcion: "",
        categoria: "",
      });
      setSelectedTrainer(null);
      setSelectedAthletes([]);
      setTeamType(null);
      setCurrentCategoria(null);
      setErrors({});
    }
  }, [isOpen, isEditing, teamToEdit]);

  useEffect(() => {
    if (teamType === "fundacion" && selectedAthletes.length > 0) {
      const categoria = selectedAthletes[0].categoria;
      setCurrentCategoria(categoria);
      setFormData(prev => ({ ...prev, categoria }));
    } else if (teamType === "temporal") {
      setCurrentCategoria(null);
    }
  }, [selectedAthletes, teamType]);

  const shouldShowCategoryField = teamType === "temporal";

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre?.trim()) {
      newErrors.nombre = "El nombre del equipo es obligatorio";
    }

    if (!formData.telefono?.trim()) {
      newErrors.telefono = "El teléfono es obligatorio";
    }

    if (!selectedTrainer) {
      newErrors.entrenador = "Debe seleccionar un entrenador";
    }

    if (selectedAthletes.length === 0) {
      newErrors.deportistas = "Debe seleccionar al menos un deportista";
    }

    if (teamType === "temporal" && !formData.categoria?.trim()) {
      newErrors.categoria = "La categoría es obligatoria para equipos temporales";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTrainerSelect = (trainer) => {
    if (selectedAthletes.length > 0 && trainer.type !== selectedAthletes[0]?.type) {
      showErrorAlert(
        "Tipo incompatible",
        `No se puede seleccionar un entrenador ${trainer.type === "fundacion" ? "de la fundación" : "temporal"} cuando tienes deportistas ${selectedAthletes[0]?.type === "fundacion" ? "de la fundación" : "temporales"} seleccionadas.`
      );
      return;
    }

    setSelectedTrainer(trainer);
    setTeamType(trainer.type);
    handleChange("entrenador", trainer.name);
    setIsTrainerModalOpen(false);
  };

  const handleAthletesSelect = (athletes) => {
    if (athletes.length > 0) {
      const firstAthleteType = athletes[0].type;
      const hasMixedTypes = athletes.some((athlete) => athlete.type !== firstAthleteType);

      if (hasMixedTypes) {
        showErrorAlert(
          "Tipos mixtos no permitidos",
          "No se pueden seleccionar deportistas de la fundación y temporales en el mismo equipo."
        );
        return;
      }

      if (selectedTrainer && selectedTrainer.type !== firstAthleteType) {
        showErrorAlert(
          "Tipo incompatible",
          `No se pueden seleccionar deportistas ${firstAthleteType === "fundacion" ? "de la fundación" : "temporales"} cuando tienes un entrenador ${selectedTrainer.type === "fundacion" ? "de la fundación" : "temporal"}.`
        );
        return;
      }

      if (firstAthleteType === "fundacion" && athletes.length > 1) {
        const firstCategory = athletes[0].categoria;
        const hasMixedCategories = athletes.some((athlete) => athlete.categoria !== firstCategory);

        if (hasMixedCategories) {
          showErrorAlert(
            "Categorías mixtas no permitidas",
            "Todas las deportistas de la fundación deben ser de la misma categoría."
          );
          return;
        }
      }
    }

    setSelectedAthletes(athletes);

    if (!selectedTrainer && athletes.length > 0) {
      setTeamType(athletes[0].type);
    }

    if (teamType === "fundacion" && athletes.length > 0) {
      const categoria = athletes[0].categoria;
      setCurrentCategoria(categoria);
      handleChange("categoria", categoria);
    }
  };

  const removeAthlete = (athleteId) => {
    const updated = selectedAthletes.filter((p) => p.id !== athleteId);
    setSelectedAthletes(updated);

    if (updated.length === 0) {
      setTeamType(selectedTrainer?.type || null);
      setCurrentCategoria(null);
      handleChange("categoria", "");
    } else if (teamType === "fundacion") {
      const categoria = updated[0].categoria;
      setCurrentCategoria(categoria);
      handleChange("categoria", categoria);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (selectedTrainer && selectedAthletes.length > 0 && selectedTrainer.type !== selectedAthletes[0]?.type) {
      showErrorAlert(
        "Error de validación",
        "No se pueden seleccionar un entrenador y deportistas de diferentes tipos (fundación o temporales)."
      );
      return;
    }

    if (selectedAthletes.length > 0) {
      const firstAthleteType = selectedAthletes[0].type;
      const hasMixedTypes = selectedAthletes.some((athlete) => athlete.type !== firstAthleteType);

      if (hasMixedTypes) {
        showErrorAlert(
          "Error de validación",
          "No se pueden seleccionar deportistas de diferentes tipos en el mismo equipo."
        );
        return;
      }
    }

    if (teamType === "fundacion" && selectedAthletes.length > 1) {
      const firstCategory = selectedAthletes[0].categoria;
      const hasMixedCategories = selectedAthletes.some((athlete) => athlete.categoria !== firstCategory);

      if (hasMixedCategories) {
        showErrorAlert(
          "Error de validación",
          "Todas las deportistas de la fundación deben ser de la misma categoría."
        );
        return;
      }
    }

    if (isEditing) {
      const confirmResult = await showConfirmAlert(
        "¿Confirmar actualización?",
        `Se actualizarán los datos del equipo ${teamToEdit?.nombre || formData.nombre}`,
        { confirmButtonText: "Actualizar", cancelButtonText: "Cancelar" }
      );
      if (!confirmResult.isConfirmed) return;
    }

    try {
      const teamData = {
        nombre: formData.nombre,
        telefono: formData.telefono,
        entrenador: formData.entrenador,
        entrenadorData: selectedTrainer,
        deportistas: selectedAthletes,
        deportistasIds: selectedAthletes.map(a => a.id),
        estado: formData.estado,
        descripcion: formData.descripcion,
        teamType: teamType,
        categoria: formData.categoria,
      };

      if (isEditing) {
        const updatedTeamData = { ...teamData, id: teamToEdit.id };
        await onUpdate(updatedTeamData);
      } else {
        await onSave(teamData);
      }

      onClose();
    } catch (error) {
      console.error("Error al guardar equipo:", error);
      showErrorAlert("Error", error.message || "No se pudo guardar el equipo");
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: "",
      telefono: "",
      entrenador: "",
      estado: "Activo",
      descripcion: "",
      categoria: "",
    });
    setSelectedTrainer(null);
    setSelectedAthletes([]);
    setTeamType(null);
    setCurrentCategoria(null);
    setErrors({});
    onClose();
  };

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
              onClick={handleClose}
            >
              <XIcon className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
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
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                >
                  Equipo de {getTeamTypeText()}
                </span>
                {teamType === "fundacion" && currentCategoria && (
                  <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-700">
                    Categoría: {currentCategoria}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-3">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <FormField
                  label="Nombre del Equipo"
                  name="nombre"
                  type="text"
                  placeholder="Ej: Manuela Vanegas Sub-17"
                  value={formData.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  error={errors.nombre}
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <FormField
                  label="Número Telefónico"
                  name="telefono"
                  type="text"
                  placeholder="Número de contacto"
                  value={formData.telefono}
                  onChange={(e) => handleChange("telefono", e.target.value)}
                  error={errors.telefono}
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Estado del Equipo <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={(e) => handleChange("estado", e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 transition focus:ring-2 focus:ring-primary-purple border-gray-300`}
                  >
                    <option value="">Seleccione un estado</option>
                    {states.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            </div>

            {/* Mostrar categoría automática para equipos de fundación */}
            {teamType === "fundacion" && currentCategoria && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Categoría del equipo:
                  </span>
                  <span className="text-sm text-gray-700 bg-gray-200 px-2 py-1 rounded-full">
                    {currentCategoria}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Selección de Entrenador */}
            <motion.div
              className="space-y-3 mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700">
                Entrenador <span className="text-red-500">*</span>
                {selectedTrainer && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    Tipo: {getTeamTypeText()}
                  </span>
                )}
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsTrainerModalOpen(true)}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-between group ${
                    errors.entrenador
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
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      {selectedTrainer ? (
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {selectedTrainer.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-600">
                              {selectedTrainer.identification}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 group-hover:text-gray-700 text-sm">
                          Seleccionar entrenador
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      selectedTrainer
                        ? "text-primary-purple"
                        : "group-hover:text-primary-purple"
                    }`}
                  />
                </button>

                {selectedTrainer && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTrainer(null);
                      setTeamType(
                        selectedAthletes.length > 0 ? selectedAthletes[0].type : null
                      );
                      handleChange("entrenador", "");
                      setCurrentCategoria(null);
                    }}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                )}
              </div>

              {errors.entrenador && (
                <p className="text-sm text-red-500 flex items-center gap-2">
                  <span>⚠</span> {errors.entrenador}
                </p>
              )}
            </motion.div>

            {/* Selección de Deportistas */}
            <motion.div
              className="space-y-3 mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Deportistas <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {selectedAthletes.length > 0 && (
                    <span className="text-sm text-primary-purple font-semibold bg-primary-purple/10 px-2 py-1 rounded-full">
                      {selectedAthletes.length} seleccionada
                      {selectedAthletes.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {teamType && selectedAthletes.length > 0 && (
                    <span className="text-sm text-gray-600">
                      Tipo: {getTeamTypeText()}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setIsAthletesModalOpen(true)}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-between group ${
                    errors.deportistas
                      ? "border-red-400"
                      : selectedAthletes.length > 0
                      ? "border-primary-purple/30 bg-primary-purple/5 hover:border-primary-purple/50"
                      : "border-gray-300 bg-white hover:border-primary-purple hover:bg-primary-purple/3"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        selectedAthletes.length > 0
                          ? "bg-primary-purple text-white"
                          : "bg-gray-100 text-gray-400 group-hover:bg-primary-purple/10 group-hover:text-primary-purple"
                      }`}
                    >
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p
                        className={`font-medium text-sm ${
                          selectedAthletes.length > 0
                            ? "text-gray-900"
                            : "text-gray-500 group-hover:text-gray-700"
                        }`}
                      >
                        {selectedAthletes.length > 0
                          ? "Modificar selección de deportistas"
                          : "Seleccionar deportistas"}
                      </p>
                      {selectedAthletes.length === 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          Haz clic para agregar deportistas al equipo
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedAthletes.length > 0 && (
                      <div className="w-5 h-5 bg-primary-purple text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {selectedAthletes.length}
                      </div>
                    )}
                    <Plus
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        selectedAthletes.length > 0
                          ? "text-primary-purple"
                          : "group-hover:text-primary-purple"
                      }`}
                    />
                  </div>
                </button>

                {/* Campo de categoría para equipos temporales */}
                {shouldShowCategoryField && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.4 }}
                  >
                    <FormField
                      label="Categoría del Equipo Temporal"
                      name="categoria"
                      type="text"
                      placeholder="Ej: Sub 17, Sub 15, Mayores"
                      value={formData.categoria}
                      onChange={(e) => handleChange("categoria", e.target.value)}
                      error={errors.categoria}
                      required
                    />
                  </motion.div>
                )}

                {/* Lista de deportistas seleccionadas */}
                {selectedAthletes.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Deportistas seleccionadas
                      </span>
                      <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">
                        {selectedAthletes.length} deportistas
                      </span>
                    </div>
                    {selectedAthletes.map((athlete, index) => (
                      <motion.div
                        key={athlete.id}
                        className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200 hover:border-primary-purple/30 hover:shadow-sm transition-all group"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.05, duration: 0.3 }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {athlete.name}
                            </p>
                            <span
                              className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800"
                            >
                              {athlete.type === "fundacion" ? "Fundación" : "Temporal"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                            {athlete.categoria && (
                              <span className="bg-gray-200 px-1.5 py-0.5 rounded-full text-gray-700">
                                {athlete.categoria}
                              </span>
                            )}
                            {athlete.identification && <span>{athlete.identification}</span>}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAthlete(athlete.id)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                          title="Eliminar deportista"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {errors.deportistas && (
                <p className="text-sm text-red-500 flex items-center gap-2">
                  <span>⚠</span> {errors.deportistas}
                </p>
              )}
            </motion.div>

            {/* Descripción */}
            <motion.div
              className="mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.4 }}
            >
              <FormField
                label="Descripción"
                name="descripcion"
                type="textarea"
                placeholder="Información adicional del equipo..."
                value={formData.descripcion}
                onChange={(e) => handleChange("descripcion", e.target.value)}
                rows={3}
              />
            </motion.div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 p-3">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancelar
              </button>

              <button
                onClick={handleSubmit}
                className="px-6 py-2 text-white rounded-lg transition-all duration-200 font-medium shadow-lg bg-primary-blue hover:bg-primary-purple"
              >
                {isEditing ? "Actualizar Equipo" : "Crear Equipo"}
              </button>
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
        teamType={teamType}
      />

      <SelectionModal
        isOpen={isAthletesModalOpen}
        onClose={() => setIsAthletesModalOpen(false)}
        mode="athletes"
        onSelect={handleAthletesSelect}
        selectedItems={selectedAthletes}
        currentCategoria={teamType === "fundacion" ? currentCategoria : null}
        teamType={teamType}
      />
    </>
  );
};

export default TemporaryTeamModal;