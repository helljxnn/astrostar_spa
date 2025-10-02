import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaPlus,
  FaEdit,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaBan,
  FaEye,
  FaExclamationTriangle,
  FaUserCircle,
  FaPauseCircle,
} from "react-icons/fa";
import { FormField } from "../../../../../../../../shared/components/FormField";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../../../../../../../../shared/utils/alerts";

// Estados de inscripción
const inscriptionStates = [
  { value: "Vigente", label: "Vigente" },
  { value: "Suspendida", label: "Suspendida" },
  { value: "Vencida", label: "Vencida" },
];

const categoryHierarchy = ["Infantil", "Sub 15", "Juvenil"];

const categoryOptions = [
  { value: "Infantil", label: "Infantil" },
  { value: "Sub 15", label: "Sub 15" },
  { value: "Juvenil", label: "Juvenil" },
];

const getAvailableCategories = (currentCategory) => {
  if (!currentCategory) return categoryOptions;

  const currentIndex = categoryHierarchy.indexOf(currentCategory);
  if (currentIndex === -1) return categoryOptions;

  return categoryOptions.filter((option) => {
    const optionIndex = categoryHierarchy.indexOf(option.value);
    return optionIndex >= currentIndex;
  });
};

const getStateIcon = (state) => {
  switch (state) {
    case "Vigente":
      return <FaCheckCircle className="text-green-500" size={20} />;
    case "Suspendida":
      return <FaPauseCircle className="text-orange-500" size={20} />;
    case "Vencida":
      return <FaClock className="text-yellow-500" size={20} />;
    default:
      return <FaCheckCircle className="text-gray-500" size={20} />;
  }
};

const getStateColor = (state) => {
  switch (state) {
    case "Vigente":
      return "bg-green-50 border-green-200";
    case "Suspendida":
      return "bg-orange-50 border-orange-200";
    case "Vencida":
      return "bg-yellow-50 border-yellow-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
};

const getStateBadgeColor = (state) => {
  switch (state) {
    case "Vigente":
      return "bg-green-100 text-green-800 border-green-300";
    case "Suspendida":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "Vencida":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

const getAvailableStateChanges = (currentState) => {
  switch (currentState) {
    case "Vigente":
      return [
        { value: "Vigente", label: "Vigente" },
        { value: "Suspendida", label: "Suspendida" },
      ];
    case "Suspendida":
      return [
        { value: "Suspendida", label: "Suspendida" },
        { value: "Vigente", label: "Vigente" },
      ];
    case "Vencida":
      return [{ value: "Vencida", label: "Vencida" }];
    default:
      return [];
  }
};

// ✅ CORREGIDO: Manejo seguro de cambios en el formulario
const handleFormChange = (field, value, setFormFunction) => {
  setFormFunction((prev) => ({
    ...prev,
    [field]: value,
  }));
};

const InscriptionManagementModal = ({
  isOpen,
  onClose,
  athlete,
  guardians = [],
  onUpdateAthlete,
}) => {
  const [activeTab, setActiveTab] = useState("current");
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingInscription, setEditingInscription] = useState(null);
  const [showConceptoFields, setShowConceptoFields] = useState(false);

  // Función para obtener fecha y hora actual
  const getCurrentDateTime = () => {
    return new Date().toISOString();
  };

  // Función para obtener solo la fecha (para inputs de tipo date)
  const getCurrentDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const [newInscriptionForm, setNewInscriptionForm] = useState({
    estado: "Vigente",
    fechaInscripcion: getCurrentDate(), // Usar la función que existe
    categoria: "",
  });

  const [editForm, setEditForm] = useState({
    estado: "",
    conceptoEstado: "",
    fechaConcepto: getCurrentDate(), // Usar la función que existe
  });

  const calculateAge = () => {
    if (!athlete?.fechaNacimiento) return 0;
    try {
      const birthDate = new Date(athlete.fechaNacimiento);
      const today = new Date();
      if (isNaN(birthDate.getTime())) return 0;

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age;
    } catch (error) {
      console.error("Error calculating age:", error);
      return 0;
    }
  };

  const age = calculateAge();
  const guardian = guardians?.find(
    (g) => String(g.id) === String(athlete?.acudiente)
  );
  const currentYear = new Date().getFullYear();

  const sortedInscriptions = (athlete?.inscripciones || []).sort((a, b) => {
    try {
      const dateA = new Date(a.fechaInscripcion || 0);
      const dateB = new Date(b.fechaInscripcion || 0);
      return dateB - dateA;
    } catch (error) {
      console.error("Error ordenando inscripciones:", error);
      return 0;
    }
  });

  const currentInscription = sortedInscriptions[0];
  const availableCategories = getAvailableCategories(athlete?.categoria);

  useEffect(() => {
    if (athlete && isOpen) {
      const initialCategory =
        athlete.categoria || availableCategories[0]?.value || "";

      setNewInscriptionForm({
        estado: "Vigente",
        fechaInscripcion: getCurrentDate(), // Usar la función correcta
        categoria: initialCategory,
      });
    }
  }, [athlete, isOpen, availableCategories]);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab("current");
      setEditingInscription(null);
      setIsProcessing(false);
      setShowConceptoFields(false);
      setEditForm({ 
        estado: "", 
        conceptoEstado: "", 
        fechaConcepto: getCurrentDate() // Usar la función correcta
      });
    }
  }, [isOpen]);

  // Manejo seguro de cambios para nueva inscripción
  const handleNewInscriptionChange = (field, value) => {
    handleFormChange(field, value, setNewInscriptionForm);
  };

  // Manejo seguro de cambios para edición
  const handleEditFormChange = (field, value) => {
    if (field === "estado") {
      const isStateChanged = value !== currentInscription?.estado;

      setEditForm((prev) => ({
        ...prev,
        estado: value,
        fechaConcepto: getCurrentDate(), // Usar fecha para el form
      }));

      setShowConceptoFields(isStateChanged);
    } else {
      handleFormChange(field, value, setEditForm);
    }
  };

  const handleStartEdit = (inscription) => {
    if (!inscription) return;

    setEditingInscription(inscription.id);
    setEditForm({
      estado: inscription.estado ?? currentInscription?.estado ?? "Vigente",
      conceptoEstado: "",
      fechaConcepto: getCurrentDate(), // Usar la función correcta
    });

    setShowConceptoFields(false);
  };

  const handleCancelEdit = () => {
    setEditingInscription(null);
    setEditForm({ 
      estado: "", 
      conceptoEstado: "", 
      fechaConcepto: getCurrentDate() // Usar la función correcta
    });
    setShowConceptoFields(false);
  };

  const handleCreateInscription = async () => {
    if (currentInscription && currentInscription.estado !== "Vencida") {
      showErrorAlert(
        "No se puede renovar",
        `Solo puede renovar cuando la inscripción actual esté Vencida. Estado actual: ${currentInscription.estado}`
      );
      return;
    }

    if (isProcessing) return;

    if (!newInscriptionForm.categoria) {
      showErrorAlert("Campo requerido", "Debes seleccionar una categoría.");
      return;
    }

    try {
      setIsProcessing(true);

      const newInscription = {
        id: crypto.randomUUID(),
        estado: "Vigente",
        concepto: `Renovación ${currentYear}`,
        fechaInscripcion: getCurrentDateTime(), // Usar fecha/hora completa para el registro
        categoria: newInscriptionForm.categoria,
        fechaConcepto: getCurrentDateTime(), // Usar fecha/hora completa para el registro
        tipo: "renovacion",
        estadoAnterior: currentInscription?.estado || "Vencida"
      };

      const updatedAthlete = {
        ...athlete,
        categoria: newInscriptionForm.categoria,
        estadoInscripcion: "Vigente",
        inscripciones: [newInscription, ...(athlete.inscripciones || [])],
      };

      await onUpdateAthlete(updatedAthlete);

      showSuccessAlert(
        "Inscripción renovada",
        `Se creó una nueva inscripción vigente para ${athlete.nombres} ${athlete.apellidos}.`
      );

      setNewInscriptionForm({
        estado: "Vigente",
        fechaInscripcion: getCurrentDate(), // Solo fecha para el form
        categoria: newInscriptionForm.categoria,
      });

      setActiveTab("current");
    } catch (error) {
      console.error("Error creating inscription:", error);
      showErrorAlert(
        "Error al crear inscripción",
        error.message || "Ocurrió un error al crear la inscripción."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveEdit = async (inscriptionId) => {
    try {
      if (!currentInscription) {
        showErrorAlert("Error", "No se encontró la inscripción a editar");
        return;
      }

      if (editForm.estado !== currentInscription.estado) {
        if (!editForm.conceptoEstado?.trim()) {
          showErrorAlert(
            "Campo requerido",
            "Debe proporcionar un concepto para el cambio de estado"
          );
          return;
        }
      }

      const confirmResult = await showConfirmAlert(
        "¿Confirmar cambios?",
        "¿Estás seguro de que quieres guardar los cambios en esta inscripción?"
      );

      if (!confirmResult.isConfirmed) return;

      setIsProcessing(true);

      let updatedInscriptions;

      if (editForm.estado !== currentInscription.estado) {
        // ✅ CREAR NUEVO REGISTRO para el cambio de estado
        const newStateChange = {
          id: crypto.randomUUID(),
          estado: editForm.estado,
          estadoAnterior: currentInscription.estado,
          concepto: editForm.conceptoEstado,
          fechaInscripcion: currentInscription.fechaInscripcion,
          fechaConcepto: getCurrentDateTime(), // Usar fecha/hora completa
          categoria: currentInscription.categoria,
          tipo: "cambio_estado"
        };

        updatedInscriptions = [newStateChange, ...(athlete.inscripciones || [])];
      } else {
        // Si no hay cambio de estado, solo actualizar el concepto
        updatedInscriptions = (athlete.inscripciones || []).map((inscription) =>
          inscription.id === inscriptionId
            ? {
                ...inscription,
                concepto: editForm.conceptoEstado || inscription.concepto,
                fechaConcepto: editForm.conceptoEstado ? getCurrentDateTime() : inscription.fechaConcepto
              }
            : inscription
        );
      }

      const latestInscription = updatedInscriptions[0];

      const updatedAthlete = {
        ...athlete,
        inscripciones: updatedInscriptions,
        estadoInscripcion: latestInscription?.estado || athlete.estadoInscripcion,
        ...(editForm.estado !== currentInscription.estado && {
          estadoInscripcion: editForm.estado
        })
      };

      await onUpdateAthlete(updatedAthlete);

      showSuccessAlert(
        editForm.estado !== currentInscription.estado 
          ? "Cambio de estado registrado"
          : "Concepto actualizado",
        editForm.estado !== currentInscription.estado
          ? `El estado ha sido cambiado de "${currentInscription.estado}" a "${editForm.estado}"`
          : "El concepto ha sido actualizado correctamente."
      );

      setEditingInscription(null);
      setEditForm({ 
        estado: "", 
        conceptoEstado: "", 
        fechaConcepto: getCurrentDate() 
      });
      setShowConceptoFields(false);
    } catch (error) {
      console.error("Error updating inscription:", error);
      showErrorAlert(
        "Error al actualizar",
        error.message || "Ocurrió un error al actualizar la inscripción."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setActiveTab("current");
    setEditingInscription(null);
    setIsProcessing(false);
    setShowConceptoFields(false);
    onClose();
  };

  if (!isOpen || !athlete) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden relative flex flex-col"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* El resto del JSX se mantiene igual */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            onClick={handleClose}
            disabled={isProcessing}
          >
            <FaTimes size={18} />
          </button>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center mb-3">
            Gestión de Inscripciones
          </h2>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <FaUserCircle className="text-primary-purple" size={20} />
            <span className="font-semibold text-gray-800">
              {athlete.nombres} {athlete.apellidos}
            </span>
            {guardian && (
              <span className="text-sm text-gray-500">
                • Acudiente: {guardian.nombreCompleto}
              </span>
            )}
          </div>
        </div>

        <div className="bg-gray-50 border-b border-gray-200">
          <div className="flex justify-center gap-2 p-3">
            <motion.button
              onClick={() => setActiveTab("current")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === "current"
                  ? "bg-gradient-to-r from-primary-purple to-primary-blue text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
              disabled={isProcessing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaEye size={16} />
              Estado Actual
            </motion.button>

            <motion.button
              onClick={() => setActiveTab("new")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === "new"
                  ? "bg-gradient-to-r from-primary-purple to-primary-blue text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
              disabled={isProcessing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaPlus size={16} />
              Renovar Inscripción
            </motion.button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {activeTab === "current" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaUserCircle className="text-primary-purple" />
                    Información del Deportista
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Edad actual</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {age} años
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">
                        Categoría actual
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {athlete.categoria || "Por asignar"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <FaCalendarAlt className="text-primary-purple" />
                      Estado Actual de Inscripción
                    </h3>
                    {currentInscription &&
                      !editingInscription &&
                      getAvailableStateChanges(currentInscription.estado)
                        .length > 0 && (
                        <motion.button
                          onClick={() => handleStartEdit(currentInscription)}
                          className="flex items-center gap-2 px-4 py-2 bg-primary-purple text-white rounded-lg shadow hover:opacity-90 transition whitespace-nowrap"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <FaEdit size={14} />
                          Editar Estado
                        </motion.button>
                      )}
                  </div>

                  {currentInscription ? (
                    editingInscription === currentInscription.id ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4 bg-gray-50 rounded-lg p-6 border border-gray-200"
                      >
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-blue-800 mb-2">
                            📋 Estado actual:{" "}
                            <span className="text-blue-900">
                              {currentInscription.estado}
                            </span>
                          </h4>
                          <div className="text-sm text-blue-700 space-y-1">
                            {currentInscription.estado === "Vigente" && (
                              <p>
                                • Puede cambiar a <strong>Suspendida</strong>
                              </p>
                            )}
                            {currentInscription.estado === "Suspendida" && (
                              <p>
                                • Puede cambiar a <strong>Vigente</strong>
                              </p>
                            )}
                            {currentInscription.estado === "Vencida" && (
                              <p>
                                • No puede cambiar el estado. Use la pestaña
                                'Renovar Inscripción'
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            label="Estado de Inscripción"
                            name="estado"
                            type="select"
                            options={getAvailableStateChanges(
                              currentInscription.estado
                            )}
                            value={editForm.estado}
                            onChange={(e) =>
                              handleEditFormChange("estado", e.target.value)
                            }
                          />
                        </div>

                        <AnimatePresence>
                          {showConceptoFields && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-4 overflow-hidden"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  label="Fecha del Concepto"
                                  name="fechaConcepto"
                                  type="date"
                                  value={editForm.fechaConcepto}
                                  onChange={(e) =>
                                    handleEditFormChange(
                                      "fechaConcepto",
                                      e.target.value
                                    )
                                  }
                                  required={showConceptoFields}
                                  readOnly
                                  helperText="Fecha automática (no editable)"
                                />
                              </div>

                              <FormField
                                label="Concepto del Cambio"
                                name="conceptoEstado"
                                type="text"
                                value={editForm.conceptoEstado || ""}
                                onChange={(e) =>
                                  handleEditFormChange(
                                    "conceptoEstado",
                                    e.target.value
                                  )
                                }
                                placeholder="Ingrese el concepto del cambio de estado"
                                helperText="Campo requerido para cambios de estado"
                                required={showConceptoFields}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                          <motion.button
                            onClick={() =>
                              handleSaveEdit(currentInscription.id)
                            }
                            disabled={
                              isProcessing ||
                              (showConceptoFields &&
                                !editForm.conceptoEstado?.trim())
                            }
                            className="px-6 py-2 bg-primary-purple text-white rounded-lg shadow hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {isProcessing ? "Guardando..." : "Guardar Cambios"}
                          </motion.button>
                          <motion.button
                            onClick={handleCancelEdit}
                            disabled={isProcessing}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Cancelar
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`border-2 rounded-xl p-6 ${getStateColor(
                          currentInscription.estado
                        )}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {getStateIcon(currentInscription.estado)}
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <h4 className="text-xl font-bold text-gray-800">
                                Estado: {currentInscription.estado}
                              </h4>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStateBadgeColor(
                                  currentInscription.estado
                                )}`}
                              >
                                {currentInscription.estado.toUpperCase()}
                              </span>
                            </div>

                            {currentInscription.concepto && (
                              <div className="bg-white/50 rounded-lg p-3">
                                <p className="text-sm font-semibold text-gray-700 mb-1">
                                  Concepto:
                                </p>
                                <p className="text-gray-800">
                                  {currentInscription.concepto}
                                </p>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                              <div className="bg-white/50 rounded-lg p-3">
                                <p className="text-sm font-semibold text-gray-700 mb-1">
                                  Fecha de inscripción:
                                </p>
                                <p className="text-gray-800 font-medium">
                                  {new Date(
                                    currentInscription.fechaInscripcion
                                  ).toLocaleDateString("es-ES", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Vence:{" "}
                                  {new Date(
                                    new Date(
                                      currentInscription.fechaInscripcion
                                    ).setFullYear(
                                      new Date(
                                        currentInscription.fechaInscripcion
                                      ).getFullYear() + 1
                                    )
                                  ).toLocaleDateString("es-ES")}
                                </p>
                              </div>

                              {currentInscription.fechaConcepto && (
                                <div className="bg-white/50 rounded-lg p-3">
                                  <p className="text-sm font-semibold text-gray-700 mb-1">
                                    Fecha del concepto:
                                  </p>
                                  <p className="text-gray-800 font-medium">
                                    {new Date(
                                      currentInscription.fechaConcepto
                                    ).toLocaleDateString("es-ES", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="bg-white/50 rounded-lg p-3">
                              <p className="text-sm font-semibold text-gray-700 mb-1">
                                Categoría:
                              </p>
                              <p className="text-gray-800 font-medium">
                                {currentInscription.categoria}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                      <FaBan className="mx-auto text-gray-300 mb-3" size={48} />
                      <p className="text-gray-600 font-medium">
                        No hay inscripciones registradas
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Crea una nueva inscripción desde la pestaña "Renovar
                        Inscripción"
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-2 mt-1">
                      <FaClock className="text-blue-600" size={16} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-1">
                        Cambio automático de estado
                      </h4>
                      <p className="text-sm text-blue-700">
                        Las inscripciones con estado "Vigente" o "Suspendida" se
                        cambiarán automáticamente a "Vencida" cuando pase más de
                        un año desde la fecha de inscripción.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "new" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {currentInscription &&
                  currentInscription.estado !== "Vencida" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-yellow-100 rounded-full p-2 mt-1">
                          <FaExclamationTriangle
                            className="text-yellow-600"
                            size={16}
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-yellow-800 mb-1">
                            No se puede renovar
                          </h4>
                          <p className="text-sm text-yellow-700">
                            Solo puede renovar cuando la inscripción actual esté{" "}
                            <strong>Vencida</strong>. Estado actual:{" "}
                            <strong>{currentInscription.estado}</strong>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-200 pb-3">
                    <FaPlus className="text-primary-purple" />
                    {currentInscription?.estado === "Vencida"
                      ? "Renovar Inscripción"
                      : "Crear Nueva Inscripción"}
                  </h3>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        label="Categoría"
                        name="categoria"
                        type="select"
                        options={availableCategories}
                        value={newInscriptionForm.categoria}
                        onChange={(e) =>
                          handleNewInscriptionChange(
                            "categoria",
                            e.target.value
                          )
                        }
                        required
                        helperText={
                          availableCategories.length < categoryOptions.length
                            ? `Categorías disponibles: igual o superior a ${
                                athlete.categoria || "la actual"
                              }`
                            : "Todas las categorías disponibles"
                        }
                      />

                      <FormField
                        label="Fecha de Inscripción"
                        name="fechaInscripcion"
                        type="date"
                        value={newInscriptionForm.fechaInscripcion}
                        onChange={(e) =>
                          handleNewInscriptionChange(
                            "fechaInscripcion",
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <motion.button
                        onClick={handleCreateInscription}
                        disabled={
                          isProcessing ||
                          !newInscriptionForm.categoria ||
                          (currentInscription &&
                            currentInscription.estado !== "Vencida")
                        }
                        className="px-8 py-3 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Creando...
                          </>
                        ) : (
                          <>
                            <FaPlus size={16} />
                            {currentInscription?.estado === "Vencida"
                              ? "Renovar Inscripción"
                              : "Crear Inscripción"}
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <div className="flex justify-end">
            <motion.button
              onClick={handleClose}
              disabled={isProcessing}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50"
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

export default InscriptionManagementModal;