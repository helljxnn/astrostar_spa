/* "use client" */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
import SearchableSelect from "../../../../../../../../shared/components/SearchableSelect";
import SelectionModal from "../components/SelectionModal";
import {
  showErrorAlert,
  showConfirmAlert,
} from "../../../../../../../../shared/utils/alerts.js";
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
  const [isSecondTrainerModalOpen, setIsSecondTrainerModalOpen] =
    useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedSecondTrainer, setSelectedSecondTrainer] = useState(null);
  const [selectedAthletes, setSelectedAthletes] = useState([]);
  const [teamType, setTeamType] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    entrenador: "",
    segundoEntrenador: "",
    estado: "Activo",
    descripcion: "",
    categoria: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [duplicateWarnings, setDuplicateWarnings] = useState({
    trainer: null,
    athletes: null,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [unavailableAthleteIds, setUnavailableAthleteIds] = useState([]);

  useEffect(() => {
    if (isOpen && isEditing && teamToEdit) {
      setIsInitialLoad(true); // Marcar como carga inicial

      setFormData({
        nombre: teamToEdit.nombre || "",
        entrenador: teamToEdit.entrenador || "",
        segundoEntrenador: teamToEdit.segundoEntrenador || "",
        estado: teamToEdit.estado || "Activo",
        descripcion: teamToEdit.descripcion || "",
        categoria: teamToEdit.categoria || "",
      });

      if (teamToEdit.segundoEntrenadorData) {
        setSelectedSecondTrainer(teamToEdit.segundoEntrenadorData);
      }

      if (teamToEdit.entrenadorData) {
        setSelectedTrainer(teamToEdit.entrenadorData);
        setTeamType(teamToEdit.entrenadorData.type);
      }

      if (Array.isArray(teamToEdit.deportistas)) {
        setSelectedAthletes(teamToEdit.deportistas);
      }

      // Despus de cargar todo, marcar como no inicial
      setTimeout(() => {
        setIsInitialLoad(false);
      }, 500);
    } else if (isOpen && !isEditing) {
      setIsInitialLoad(false); // No es carga inicial si es creacin

      setFormData({
        nombre: "",
        entrenador: "",
        segundoEntrenador: "",
        estado: "Activo",
        descripcion: "",
        categoria: "",
      });
      setSelectedTrainer(null);
      setSelectedSecondTrainer(null);
      setSelectedAthletes([]);
      setTeamType(null);
      setErrors({});
      setTouched({});
    }
  }, [isOpen, isEditing, teamToEdit]);

  // Actualizar validación de deportistas cuando cambie la selección
  useEffect(() => {
    if (touched.deportistas) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (selectedAthletes.length === 0) {
          newErrors.deportistas = "Debe seleccionar al menos un deportista";
        } else {
          delete newErrors.deportistas;
        }
        return newErrors;
      });
    }
  }, [selectedAthletes, touched.deportistas]);

  // Validar disponibilidad de entrenador temporal en tiempo real
  useEffect(() => {
    // Si es carga inicial y estamos editando, no validar
    if (isInitialLoad && teamToEdit) {
      return;
    }

    if (
      !selectedTrainer ||
      selectedTrainer.type !== "temporal" ||
      !selectedTrainer.id
    ) {
      setDuplicateWarnings((prev) => ({ ...prev, trainer: null }));
      return;
    }

    const validateTrainer = async () => {
      try {
        const result = await TeamsService.checkTemporalPersonAvailability(
          selectedTrainer.id,
          teamToEdit?.id,
        );

        if (!result.available) {
          setDuplicateWarnings((prev) => ({
            ...prev,
            trainer:
              result.message || "Entrenador ya est registrado en otro equipo",
          }));
        } else {
          setDuplicateWarnings((prev) => ({ ...prev, trainer: null }));
        }
      } catch (error) {
        console.error("? Error validando entrenador:", error);
      }
    };

    validateTrainer();
  }, [selectedTrainer, teamToEdit?.id, isInitialLoad, teamToEdit]);

  // Validar nombre del equipo en tiempo real
  useEffect(() => {
    const validateName = async () => {
      // No validar si el campo está vacío
      if (!formData.nombre?.trim()) {
        // Limpiar error si el campo est vaco
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.nombre;
          return newErrors;
        });
        return;
      }

      // Solo validar si el campo ha sido tocado al menos una vez
      if (!touched.nombre) {
        return;
      }

      // Si es carga inicial y estamos editando, no validar
      if (isInitialLoad && teamToEdit) {
        return;
      }

      try {
        const result = await TeamsService.checkNameAvailability(
          formData.nombre,
          teamToEdit?.id,
        );

        if (result.success && !result.available) {
          setErrors((prev) => ({
            ...prev,
            nombre: "Este nombre ya est registrado",
          }));
          // Marcar como tocado para que el error persista
          setTouched((prev) => ({
            ...prev,
            nombre: true,
          }));
        } else if (result.success && result.available) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.nombre;
            return newErrors;
          });
        }
      } catch (error) {
        console.error("? Error validando nombre:", error);
      }
    };

    // Debounce para evitar muchas llamadas a la API
    const timeoutId = setTimeout(() => {
      validateName();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    formData.nombre,
    touched.nombre,
    teamToEdit?.id,
    isInitialLoad,
    teamToEdit,
  ]);

  // Validar entrenador en tiempo real (solo después de interactuar)
  useEffect(() => {
    // Solo validar si el campo ya fue tocado
    if (touched.entrenador) {
      if (!selectedTrainer) {
        // Si no hay entrenador seleccionado, marcar error
        setErrors((prev) => ({
          ...prev,
          entrenador: "Debe seleccionar un entrenador",
        }));
      } else {
        // Si hay entrenador, limpiar error
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.entrenador;
          return newErrors;
        });
      }
    }
  }, [selectedTrainer, touched.entrenador]);

  // Validar disponibilidad de deportistas temporales en tiempo real
  useEffect(() => {
    // Si es carga inicial y estamos editando, no validar
    if (isInitialLoad && teamToEdit) {
      return;
    }

    if (!selectedAthletes || selectedAthletes.length === 0) {
      setDuplicateWarnings((prev) => ({ ...prev, athletes: null }));
      return;
    }

    const temporalAthletes = selectedAthletes.filter(
      (d) => d.type === "temporal" && d.id,
    );

    if (temporalAthletes.length === 0) {
      setDuplicateWarnings((prev) => ({ ...prev, athletes: null }));
      return;
    }

    const validateAthletes = async () => {
      try {
        const unavailableAthletes = [];

        for (const athlete of temporalAthletes) {
          const result = await TeamsService.checkTemporalPersonAvailability(
            athlete.id,
            teamToEdit?.id,
          );

          if (!result.available) {
            unavailableAthletes.push({
              name: athlete.name,
              message: result.message,
            });
          }
        }

        if (unavailableAthletes.length > 0) {
          const message =
            unavailableAthletes.length === 1
              ? unavailableAthletes[0].message
              : `Hay ${unavailableAthletes.length} deportistas que ya están registradas en otros equipos`;

          // Guardar los IDs de las deportistas no disponibles
          const unavailableIds = temporalAthletes
            .filter((athlete) =>
              unavailableAthletes.some((ua) => ua.name === athlete.name),
            )
            .map((athlete) => athlete.id);
          setUnavailableAthleteIds(unavailableIds);
          setDuplicateWarnings((prev) => ({
            ...prev,
            athletes: message,
          }));
        } else {
          setUnavailableAthleteIds([]);
          setDuplicateWarnings((prev) => ({ ...prev, athletes: null }));
        }
      } catch (error) {
        console.error("❌ Error validando deportistas:", error);
      }
    };

    validateAthletes();
  }, [selectedAthletes, teamToEdit?.id, isInitialLoad, teamToEdit]);

  const shouldShowCategoryField = teamType === "temporal" || teamType === "fundacion"; // CAMBIO: Mostrar campo de categoría para ambos tipos
  const shouldShowSecondTrainer = teamType === "fundacion";

  // Cargar categorías deportivas cuando se necesiten
  useEffect(() => {
    const loadCategories = async () => {
      if (shouldShowCategoryField && categories.length === 0) {
        setLoadingCategories(true);
        try {
          const result = await TeamsService.getSportsCategories();
          if (result.success) {
            setCategories(result.data || []);
          } else {
            console.error("Error loading categories:", result.error);
          }
        } catch (error) {
          console.error("Error loading categories:", error);
        } finally {
          setLoadingCategories(false);
        }
      }
    };

    loadCategories();
  }, [shouldShowCategoryField, categories.length]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Marcar como tocado inmediatamente para validacin en tiempo real
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validar inmediatamente en tiempo real con el nuevo valor
    validateFieldWithValue(field, value);
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateFieldWithValue = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case "nombre":
        if (!value?.trim()) {
          newErrors.nombre = "El nombre del equipo es obligatorio";
        } else if (value.trim().length < 3) {
          newErrors.nombre = "El nombre debe tener al menos 3 caracteres";
        } else if (value.trim().length > 100) {
          newErrors.nombre = "El nombre no puede exceder 100 caracteres";
        } else if (/\s{2,}/.test(value)) {
          newErrors.nombre = "No se permiten espacios dobles";
        } else {
          // NO eliminar el error aquí, el useEffect de validación de nombre duplicado lo manejará
          // Solo eliminar si no hay error de duplicado
          if (errors.nombre !== "Este nombre ya está registrado") {
            delete newErrors.nombre;
          }
        }
        break;
      case "entrenador":
        // Para entrenador, verificar si hay un entrenador seleccionado
        if (!selectedTrainer && !value) {
          newErrors.entrenador = "Debe seleccionar un entrenador";
        } else {
          delete newErrors.entrenador;
        }
        break;
      case "deportistas":
        // Para deportistas, verificar el estado actual
        if (selectedAthletes.length === 0) {
          newErrors.deportistas = "Debe seleccionar al menos un deportista";
        } else {
          delete newErrors.deportistas;
        }
        break;
      case "categoria":
        // CAMBIO: La categoría ahora es obligatoria para ambos tipos de equipos
        if (!value?.trim()) {
          newErrors.categoria = "La categoría es obligatoria";
        } else {
          delete newErrors.categoria;
        }
        break;
      case "descripcion":
        // La descripcin no es obligatoria
        delete newErrors.descripcion;
        break;
    }

    setErrors(newErrors);
  };

  const validateField = (field) => {
    validateFieldWithValue(field, formData[field]);
  };

  const isFieldTouched = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  const getCombinedError = (fieldName) => {
    // Para el campo nombre, si hay error de duplicado, mostrarlo siempre
    if (
      fieldName === "nombre" &&
      errors[fieldName] === "Este nombre ya est registrado"
    ) {
      return errors[fieldName];
    }

    // Para otros errores, solo mostrar si el campo fue tocado
    if (!touched[fieldName]) {
      return null;
    }
    return errors[fieldName];
  };

  const touchAllFields = () => {
    setTouched({
      nombre: true,
      entrenador: true,
      deportistas: true,
      categoria: true,
    });
  };

  const validateAllFields = () => {
    const newErrors = {};

    if (!formData.nombre?.trim()) {
      newErrors.nombre = "El nombre del equipo es obligatorio";
    }

    if (!selectedTrainer) {
      newErrors.entrenador = "Debe seleccionar un entrenador";
    }

    if (selectedAthletes.length === 0) {
      newErrors.deportistas = "Debe seleccionar al menos un deportista";
    }

    // CAMBIO: La categoría ahora es obligatoria para ambos tipos de equipos
    if (!formData.categoria?.trim()) {
      newErrors.categoria = "La categoría es obligatoria";
    }

    // La descripción no es obligatoria

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTrainerSelect = (trainer) => {
    // Si trainer es null, significa que se deseleccionó
    if (trainer === null) {
      setSelectedTrainer(null);
      setFormData((prev) => ({ ...prev, entrenador: "" }));

      // Marcar como tocado para activar validacin
      setTouched((prev) => ({ ...prev, entrenador: true }));

      // Si no hay deportistas, limpiar el tipo de equipo
      if (selectedAthletes.length === 0) {
        setTeamType(null);
      }
      return;
    }

    if (
      selectedAthletes.length > 0 &&
      trainer.type !== selectedAthletes[0]?.type
    ) {
      showErrorAlert(
        "Tipo incompatible",
        `No se puede seleccionar un entrenador ${
          trainer.type === "fundacion" ? "de la fundación" : "temporal"
        } cuando tienes deportistas ${
          selectedAthletes[0]?.type === "fundacion"
            ? "de la fundación"
            : "temporales"
        } seleccionadas.`,
      );
      return;
    }

    setSelectedTrainer(trainer);
    setTeamType(trainer.type);
    setFormData((prev) => ({ ...prev, entrenador: trainer.name }));

    // Limpiar error de entrenador al seleccionar
    setTouched((prev) => ({ ...prev, entrenador: true }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.entrenador;
      return newErrors;
    });

    setIsTrainerModalOpen(false);
  };

  const handleSecondTrainerSelect = (trainer) => {
    // Si trainer es null, significa que se deseleccionó
    if (trainer === null) {
      setSelectedSecondTrainer(null);
      setFormData((prev) => ({ ...prev, segundoEntrenador: "" }));
      setIsSecondTrainerModalOpen(false);
      return;
    }

    setSelectedSecondTrainer(trainer);
    setFormData((prev) => ({ ...prev, segundoEntrenador: trainer.name }));
    setIsSecondTrainerModalOpen(false);
  };

  const handleAthletesSelect = (athletes) => {
    if (athletes.length > 0) {
      const firstAthleteType = athletes[0].type;
      const hasMixedTypes = athletes.some(
        (athlete) => athlete.type !== firstAthleteType,
      );

      if (hasMixedTypes) {
        showErrorAlert(
          "Tipos mixtos no permitidos",
          "No se pueden seleccionar deportistas de la fundación y temporales en el mismo equipo.",
        );
        return;
      }

      if (selectedTrainer && selectedTrainer.type !== firstAthleteType) {
        showErrorAlert(
          "Tipo incompatible",
          `No se pueden seleccionar deportistas ${
            firstAthleteType === "fundacion" ? "de la fundación" : "temporales"
          } cuando tienes un entrenador ${
            selectedTrainer.type === "fundacion"
              ? "de la fundación"
              : "temporal"
          }.`,
        );
        return;
      }

      if (firstAthleteType === "fundacion" && athletes.length > 1) {
        // CAMBIO: Ahora permitimos deportistas de diferentes categorías en equipos de fundación
        // const firstCategory = athletes[0].categoria;
        // const hasMixedCategories = athletes.some(
        //   (athlete) => athlete.categoria !== firstCategory,
        // );

        // if (hasMixedCategories) {
        //   showErrorAlert(
        //     "Categorías mixtas no permitidas",
        //     "Todas las deportistas de la fundación deben ser de la misma categoría.",
        //   );
        //   return;
        // }
      }
    }

    setSelectedAthletes(athletes);

    // Marcar como tocado para activar validacin
    setTouched((prev) => ({ ...prev, deportistas: true }));

    if (!selectedTrainer && athletes.length > 0) {
      setTeamType(athletes[0].type);
    }

    // CAMBIO: Ya no asignamos automáticamente la categoría para equipos de fundación
    // if (teamType === "fundacion") {
    //   if (athletes.length > 0) {
    //     const categoria = athletes[0].categoria;
    //     setCurrentCategoria(categoria);
    //     handleChange("categoria", categoria);
    //   } else {
    //     setCurrentCategoria(null);
    //     handleChange("categoria", "");
    //   }
    // }
  };

  const removeAthlete = (athleteId) => {
    const updated = selectedAthletes.filter((p) => p.id !== athleteId);
    setSelectedAthletes(updated);

    if (updated.length === 0) {
      setTeamType(selectedTrainer?.type || null);
      // CAMBIO: Ya no limpiamos la categoría automáticamente
      // setCurrentCategoria(null);
      // handleChange("categoria", "");
    }
    // CAMBIO: Ya no actualizamos la categoría automáticamente
    // else if (teamType === "fundacion") {
    //   const categoria = updated[0].categoria;
    //   setCurrentCategoria(categoria);
    //   handleChange("categoria", categoria);
    // }
  };

  const handleSubmit = async () => {
    touchAllFields();

    const hasValidationErrors = !validateAllFields();

    if (hasValidationErrors) {
      showErrorAlert(
        "Campos incompletos",
        "Por favor completa todos los campos correctamente antes de continuar.",
      );
      return;
    }

    // Bloquear creación si hay advertencias de duplicados
    if (duplicateWarnings.trainer || duplicateWarnings.athletes) {
      showErrorAlert(
        "No se puede crear el equipo",
        "Hay entrenadores o deportistas temporales que ya están registrados en otros equipos. Por favor, selecciona otros miembros.",
      );
      return;
    }

    if (
      selectedTrainer &&
      selectedAthletes.length > 0 &&
      selectedTrainer.type !== selectedAthletes[0]?.type
    ) {
      showErrorAlert(
        "Error de validación",
        "No se pueden seleccionar un entrenador y deportistas de diferentes tipos (fundación o temporales).",
      );
      return;
    }

    if (selectedAthletes.length > 0) {
      const firstAthleteType = selectedAthletes[0].type;
      const hasMixedTypes = selectedAthletes.some(
        (athlete) => athlete.type !== firstAthleteType,
      );

      if (hasMixedTypes) {
        showErrorAlert(
          "Error de validación",
          "No se pueden seleccionar deportistas de diferentes tipos en el mismo equipo.",
        );
        return;
      }
    }

    if (teamType === "fundacion" && selectedAthletes.length > 1) {
      // CAMBIO: Ahora permitimos deportistas de diferentes categorías en equipos de fundación
      // const firstCategory = selectedAthletes[0].categoria;
      // const hasMixedCategories = selectedAthletes.some(
      //   (athlete) => athlete.categoria !== firstCategory,
      // );

      // if (hasMixedCategories) {
      //   showErrorAlert(
      //     "Error de validación",
      //     "Todas las deportistas de la fundación deben ser de la misma categoría.",
      //   );
      //   return;
      // }
    }

    if (isEditing) {
      const confirmResult = await showConfirmAlert(
        "¿Confirmar actualización?",
        `Se actualizarán los datos del equipo ${
          teamToEdit?.nombre || formData.nombre
        }`,
        { confirmButtonText: "Actualizar", cancelButtonText: "Cancelar" },
      );
      if (!confirmResult.isConfirmed) return;
    }

    try {
      const teamData = {
        nombre: formData.nombre,
        telefono: "", // Campo temporal vacío para compatibilidad con backend
        entrenador: formData.entrenador,
        entrenadorData: selectedTrainer,
        deportistas: selectedAthletes,
        deportistasIds: selectedAthletes.map((a) => a.id),
        estado: isEditing ? formData.estado : "Activo", // Siempre "Activo" al crear
        descripcion: formData.descripcion,
        teamType: teamType,
        categoria: formData.categoria,
      };

      // Solo agregar segundo entrenador si existe
      if (selectedSecondTrainer) {
        teamData.segundoEntrenador = formData.segundoEntrenador;
        teamData.segundoEntrenadorData = selectedSecondTrainer;
      }
      if (isEditing) {
        const updatedTeamData = { ...teamData, id: teamToEdit.id };
        await onUpdate(updatedTeamData);
      } else {
        await onSave(teamData);
      }

      onClose();
    } catch (error) {
      console.error("❌ Error al guardar equipo:", error);
      showErrorAlert("Error", error.message || "No se pudo guardar el equipo");
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: "",
      entrenador: "",
      estado: "Activo",
      descripcion: "",
      categoria: "",
    });
    setSelectedTrainer(null);
    setSelectedSecondTrainer(null);
    setSelectedAthletes([]);
    setTeamType(null);
    setErrors({});
    setTouched({});
    setDuplicateWarnings({ trainer: null, athletes: null });
    onClose();
  };

  const getTeamTypeText = () => {
    if (!teamType) return null;
    return teamType === "fundacion" ? "Fundación" : "Temporales";
  };

  if (!isOpen) return null;

  const modalContent = (
    <>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
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
          onClick={(e) => e.stopPropagation()}
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
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  Equipo de {getTeamTypeText()}
                </span>
              </div>
            )}
          </div>

          {/* Body */}
          <motion.div className="flex-1 overflow-y-auto p-3">
            {/* Información básica */}
            {/* Campo de nombre - Ancho completo */}
            <motion.div
              className="mb-3"
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
                onBlur={() => handleBlur("nombre")}
                error={getCombinedError("nombre")}
                touched={isFieldTouched("nombre")}
                required
              />
            </motion.div>

            {/* Campo de estado - Solo en modo edición */}
            {isEditing && (
              <motion.div
                className="mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
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
                    getCombinedError("entrenador") || duplicateWarnings.trainer
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
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-gray-600">
                              {selectedTrainer.identification}
                            </span>
                            {selectedTrainer.phoneNumber && (
                              <>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-600">
                                  {selectedTrainer.phoneNumber}
                                </span>
                              </>
                            )}
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
                        selectedAthletes.length > 0
                          ? selectedAthletes[0].type
                          : null,
                      );
                      handleChange("entrenador", "");
                      // Limpiar segundo entrenador si se quita el principal
                      setSelectedSecondTrainer(null);
                      handleChange("segundoEntrenador", "");
                    }}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                )}
              </div>

              {getCombinedError("entrenador") && (
                <div className="text-red-500 text-xs flex items-center gap-1 mt-1">
                  <span>⚠️</span>
                  <span>{getCombinedError("entrenador")}</span>
                </div>
              )}

              {duplicateWarnings.trainer && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-red-500 text-xs flex items-center gap-1 mt-1"
                  >
                    <span>⚠️</span>
                    <span>{duplicateWarnings.trainer}</span>
                  </motion.div>
                </>
              )}
            </motion.div>

            {/* Segundo Entrenador - Solo para equipos de fundación */}
            {shouldShowSecondTrainer && (
              <motion.div
                className="space-y-3 mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-700">
                  Segundo Entrenador (Opcional)
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSecondTrainerModalOpen(true)}
                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-between group ${
                      getCombinedError("entrenador") ||
                      duplicateWarnings.trainer
                        ? "border-red-400"
                        : selectedTrainer
                          ? "border-primary-purple/30 bg-primary-purple/5 hover:border-primary-purple/50"
                          : "border-gray-300 bg-white hover:border-primary-purple hover:bg-primary-purple/3"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          selectedSecondTrainer
                            ? "bg-primary-purple text-white"
                            : "bg-gray-100 text-gray-400 group-hover:bg-primary-purple/10 group-hover:text-primary-purple"
                        }`}
                      >
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        {selectedSecondTrainer ? (
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {selectedSecondTrainer.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-xs text-gray-600">
                                {selectedSecondTrainer.identification}
                              </span>
                              {selectedSecondTrainer.phoneNumber && (
                                <>
                                  <span className="text-xs text-gray-400">
                                    •
                                  </span>
                                  <span className="text-xs text-gray-600">
                                    {selectedSecondTrainer.phoneNumber}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 group-hover:text-gray-700 text-sm">
                            Seleccionar segundo entrenador
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        selectedSecondTrainer
                          ? "text-primary-purple"
                          : "group-hover:text-primary-purple"
                      }`}
                    />
                  </button>

                  {selectedSecondTrainer && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTrainer(null);
                        setTeamType(
                          selectedAthletes.length > 0
                            ? selectedAthletes[0].type
                            : null,
                        );
                        handleChange("entrenador", "");
                        // Limpiar segundo entrenador si se quita el principal
                        setSelectedSecondTrainer(null);
                        handleChange("segundoEntrenador", "");
                      }}
                      className="absolute right-10 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}

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
                    (touched.deportistas && errors.deportistas) ||
                    duplicateWarnings.athletes
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

                {/* Mensajes de error y advertencia - Justo después del botón */}
                {touched.deportistas && errors.deportistas && (
                  <div className="text-red-500 text-xs flex items-center gap-1 mt-2">
                    <span>⚠️</span>
                    <span>{errors.deportistas}</span>
                  </div>
                )}

                {duplicateWarnings.athletes && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-red-500 text-xs flex items-center gap-1 mt-2"
                    >
                      <span>⚠️</span>
                      <span>{duplicateWarnings.athletes}</span>
                    </motion.div>
                  </>
                )}

                {/* Campo de categoría - Ahora para ambos tipos de equipos */}
                {shouldShowCategoryField && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.4 }}
                  >
                    {loadingCategories ? (
                      <div className="flex items-center gap-2 text-gray-500 text-sm p-3 bg-gray-50 rounded-lg">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-blue"></div>
                        Cargando categorías...
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Categoría del Equipo{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <SearchableSelect
                          options={categories
                            .map((cat) => cat?.name || cat?.nombre || "")
                            .filter(Boolean)
                            .map((name) => ({ value: name, label: name }))}
                          value={formData.categoria}
                          onChange={(value) => handleChange("categoria", value)}
                          placeholder="Buscar y seleccionar categoría..."
                          loading={loadingCategories}
                          error={getCombinedError("categoria") || ""}
                        />
                      </div>
                    )}
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
                        transition={{
                          delay: 0.6 + index * 0.05,
                          duration: 0.3,
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {athlete.name}
                            </p>
                            <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                              {athlete.type === "fundacion"
                                ? "Fundación"
                                : "Temporal"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-600 flex-wrap">
                            {athlete.categoria && (
                              <span className="bg-gray-200 px-1.5 py-0.5 rounded-full text-gray-700">
                                {athlete.categoria}
                              </span>
                            )}
                            {athlete.identification && (
                              <span>{athlete.identification}</span>
                            )}
                            {athlete.phoneNumber && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span>{athlete.phoneNumber}</span>
                              </>
                            )}
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
                placeholder="Información del equipo..."
                value={formData.descripcion}
                onChange={(e) => handleChange("descripcion", e.target.value)}
                rows={3}
              />
            </motion.div>
          </motion.div>

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
        initialTabType={teamType}
      />

      <SelectionModal
        isOpen={isAthletesModalOpen}
        onClose={() => setIsAthletesModalOpen(false)}
        mode="athletes"
        onSelect={handleAthletesSelect}
        selectedItems={selectedAthletes}
        teamType={teamType}
        initialTabType={teamType}
        unavailableAthleteIds={unavailableAthleteIds}
      />

      <SelectionModal
        isOpen={isSecondTrainerModalOpen}
        onClose={() => setIsSecondTrainerModalOpen(false)}
        mode="trainer"
        onSelect={handleSecondTrainerSelect}
        selectedItems={selectedSecondTrainer ? [selectedSecondTrainer] : []}
        teamType="fundacion"
        forceFoundationType={true}
        excludeTrainerId={selectedTrainer?.id}
        initialTabType="fundacion"
      />
    </>
  );

  return createPortal(modalContent, document.body);
};

export default TemporaryTeamModal;

