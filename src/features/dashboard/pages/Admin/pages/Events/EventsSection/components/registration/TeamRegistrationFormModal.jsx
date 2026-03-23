import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaTimes } from "react-icons/fa";
import { createPortal } from "react-dom";
import RegistrationsService from "../../services/RegistrationsService";
import {
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../../../shared/utils/alerts.js";
import { AthleteRegistrationFormModal } from "./index";

const TeamRegistrationFormModal = ({
  isOpen,
  onClose,
  eventName,
  participantType,
  mode = "register", // 'register' o 'edit'
  initialSelectedTeams = [], // Equipos ya inscritos (para modo editar)
  eventId = null, // ID del evento
  eventSportsCategories = [],
  onSuccess = null, // Callback para ejecutar después de inscribir exitosamente
}) => {
  const isTeamType = participantType === "Equipos";
  const [searchResults, setSearchResults] = useState([]);
  const [availableTeams, setAvailableTeams] = useState([]); // Equipos disponibles filtrados por categoría
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState(initialSelectedTeams);
  const [initialTeams, setInitialTeams] = useState([]); // Guardar equipos iniciales para comparar
  const [searchTerm, setSearchTerm] = useState("");
  const [displayLimit, setDisplayLimit] = useState(6); // Límite inicial de equipos a mostrar
  const [selectedCategories, setSelectedCategories] = useState([]); // Categorías seleccionadas
  const [selectedTeamTypes, setSelectedTeamTypes] = useState([]); // Tipos seleccionados (Fundacion/Temporal)
  const [availableCategories, setAvailableCategories] = useState([]); // Categorías disponibles
  const searchTimeoutRef = useRef(null);

  // Helper para obtener estado RSVP
  const getRSVPStatus = (team) => {
    if (!team.eventInvitations || team.eventInvitations.length === 0) {
      return {
        status: "NO_SENT",
        label: "Sin invitación",
        color: "gray",
        icon: "📧",
      };
    }

    const invitation = team.eventInvitations[0];

    switch (invitation.status) {
      case "PENDING":
        return {
          status: "PENDING",
          label: "Pendiente",
          color: "orange",
          icon: "⏳",
        };
      case "CONFIRMED":
        return {
          status: "CONFIRMED",
          label: "Confirmado",
          color: "green",
          icon: "✅",
        };
      case "DECLINED":
        return {
          status: "DECLINED",
          label: "Declinado",
          color: "red",
          icon: "❌",
        };
      default:
        return {
          status: "UNKNOWN",
          label: "Desconocido",
          color: "gray",
          icon: "❓",
        };
    }
  };

  // Cargar equipos disponibles filtrados por categoría del evento
  const loadAvailableTeams = async () => {
    if (!eventId) {
      return;
    }

    setLoading(true);
    try {
      const response =
        await RegistrationsService.getTeamsByEventCategories(eventId);

      if (response.success) {
        // Combinar equipos de fundación y temporales
        const allTeams = [
          ...(response.data.foundation || []),
          ...(response.data.temporary || []),
        ];
        setAvailableTeams(allTeams);
      }
    } catch (error) {
      console.error("Error cargando equipos disponibles:", error);
      setAvailableTeams([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías deportivas desde el módulo de categorías
  const loadEventSportsCategories = () => {
    if (
      !Array.isArray(eventSportsCategories) ||
      eventSportsCategories.length === 0
    ) {
      setAvailableCategories([]);
      return;
    }

    const categories = [
      ...new Set(
        eventSportsCategories
          .map((cat) => (cat?.nombre || "").trim())
          .filter(Boolean),
      ),
    ];

    setAvailableCategories(categories);
  };

  const searchTeams = async (term) => {
    if (!term || term.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // Filtrar de los equipos disponibles (ya filtrados por categoría)
      const filtered = availableTeams.filter((team) => {
        const searchLower = term.toLowerCase();
        const matchesName = team.name.toLowerCase().includes(searchLower);
        const matchesCategory = team.category
          ?.toLowerCase()
          .includes(searchLower);
        const matchesCoach = team.coach?.toLowerCase().includes(searchLower);
        const notSelected = !selectedTeams.find((st) => st.id === team.id);

        return (matchesName || matchesCategory || matchesCoach) && notSelected;
      });

      setSearchResults(filtered);
    } catch (error) {
      console.error("Error buscando equipos:", error);
    } finally {
      setSearching(false);
    }
  };

  const loadRegisteredTeams = async () => {
    if (!eventId) {
      return;
    }

    setLoading(true);
    try {
      const response =
        await RegistrationsService.getEventRegistrations(eventId);

      if (response.success && Array.isArray(response.data)) {
        const registeredTeams = response.data
          .filter((reg) => reg.team)
          .map((reg) => ({
            ...reg.team,
            registrationId: reg.id,
            eventInvitations: reg.eventInvitations || [], // ✅ Incluir invitaciones
          }));

        setSelectedTeams(registeredTeams);
        setInitialTeams(registeredTeams); // Guardar como equipos iniciales para comparar
      }
    } catch (error) {
      console.error("Error cargando equipos inscritos:", error);
      // No mostrar error si no hay equipos inscritos, es normal
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Limpiar búsqueda al abrir modal y controlar scroll del body
    if (isOpen && isTeamType) {
      setSearchTerm("");
      setSearchResults([]);
      setDisplayLimit(6); // Reset al abrir
      setSelectedCategories([]); // Reset filtros
      setSelectedTeamTypes([]); // Reset filtros de tipo
      // Cargar equipos disponibles y categorias deportivas del evento
      loadAvailableTeams();
      loadEventSportsCategories();
      // Bloquear scroll del body
      document.body.classList.add("events-modal-open");
    } else {
      // Desbloquear scroll del body
      document.body.classList.remove("events-modal-open");
    }

    // Cleanup al desmontar
    return () => {
      document.body.classList.remove("events-modal-open");
    };
  }, [isOpen, isTeamType, eventId, eventSportsCategories]);

  const handleLoadMore = () => {
    setDisplayLimit((prev) => prev + 6);
  };

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
    setDisplayLimit(6);
  };

  const selectAllCategories = () => {
    if (selectedCategories.length === availableCategories.length) {
      // Si todas están seleccionadas, deseleccionar todas
      setSelectedCategories([]);
    } else {
      // Seleccionar todas
      setSelectedCategories([...availableCategories]);
    }
    setDisplayLimit(6);
  };

  const selectAllTeamTypes = () => {
    if (selectedTeamTypes.length === 2) {
      // Si ambos están seleccionados, deseleccionar todos
      setSelectedTeamTypes([]);
    } else {
      // Seleccionar ambos
      setSelectedTeamTypes(["Fundacion", "Temporal"]);
    }
    setDisplayLimit(6);
  };

  const toggleTeamType = (type) => {
    setSelectedTeamTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
    setDisplayLimit(6);
  };

  const selectAllFiltered = () => {
    const filtered = getFilteredTeams();
    const newSelections = filtered.filter(
      (team) => !selectedTeams.find((st) => st.id === team.id),
    );
    setSelectedTeams((prev) => [...prev, ...newSelections]);
  };

  const getFilteredTeams = () => {
    let filtered = availableTeams.filter(
      (team) => !selectedTeams.find((st) => st.id === team.id),
    );

    // Filtrar por categorías
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((team) =>
        selectedCategories.includes(team.category),
      );
    }

    // Filtrar por tipo
    if (selectedTeamTypes.length > 0) {
      filtered = filtered.filter((team) =>
        selectedTeamTypes.includes(team.teamType),
      );
    }

    return filtered;
  };

  useEffect(() => {
    // Búsqueda con debounce - ahora busca en availableTeams
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchTeams(searchTerm);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, availableTeams, selectedTeams]);

  useEffect(() => {
    // Modo unificado: siempre cargar equipos inscritos cuando se abre el modal
    if (isOpen && eventId && isTeamType) {
      setTimeout(() => {
        loadRegisteredTeams();
      }, 200);
    }
  }, [isOpen, eventId, isTeamType]);

  if (!isOpen) return null;

  // Si no es tipo Equipos, mostrar el modal de deportistas
  if (!isTeamType) {
    return (
      <AthleteRegistrationFormModal
        isOpen={isOpen}
        onClose={onClose}
        event={{
          id: eventId,
          name: eventName,
          sportsCategoriesData: eventSportsCategories,
        }}
        onSuccess={onSuccess}
        mode={mode}
      />
    );
  }

  const handleSelectTeam = (team) => {
    // Verificar que el equipo no esté ya seleccionado
    const alreadySelected = selectedTeams.find((t) => t.id === team.id);
    if (alreadySelected) {
      return; // No agregar duplicados
    }

    setSelectedTeams((prev) => [...prev, team]);
    // Remover de resultados de búsqueda
    setSearchResults((prev) => prev.filter((t) => t.id !== team.id));
    // Limpiar búsqueda
    setSearchTerm("");
  };

  const handleRemoveTeam = (teamId) => {
    setSelectedTeams((prev) => prev.filter((t) => t.id !== teamId));
  };

  const handleSave = async () => {
    if (!eventId) {
      showErrorAlert("Error", "No se pudo identificar el evento");
      return;
    }

    if (selectedTeams.length === 0) {
      showErrorAlert("Error", "Debes seleccionar al menos un equipo");
      return;
    }

    setLoading(true);
    try {
      // Modo unificado: siempre detectar cambios
      const initialIds = initialTeams.map((t) => t.id);
      const currentIds = selectedTeams.map((t) => t.id);

      // Equipos nuevos a inscribir
      const teamsToAdd = selectedTeams.filter(
        (t) => !initialIds.includes(t.id),
      );

      // Equipos a quitar (cancelar inscripción)
      const teamsToRemove = initialTeams.filter(
        (t) => !currentIds.includes(t.id),
      );

      // Cancelar inscripciones de equipos quitados
      if (teamsToRemove.length > 0) {
        for (const team of teamsToRemove) {
          if (team.registrationId) {
            await RegistrationsService.cancelRegistration(team.registrationId);
          }
        }
      }

      // Inscribir equipos nuevos
      if (teamsToAdd.length > 0) {
        const teamIdsToAdd = teamsToAdd.map((t) => t.id);
        await RegistrationsService.registerMultipleTeams(eventId, teamIdsToAdd);
      }

      // Mensaje según los cambios realizados
      if (teamsToAdd.length > 0 || teamsToRemove.length > 0) {
        showSuccessAlert(
          "Cambios guardados",
          `Se actualizó la inscripción: ${teamsToAdd.length} agregados, ${teamsToRemove.length} removidos`,
        );
      } else {
        showSuccessAlert(
          "Sin cambios",
          "No se realizaron cambios en las inscripciones",
        );
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al guardar inscripciones:", error);
      showErrorAlert("Error", "Ocurrió un error al guardar las inscripciones");
    } finally {
      setLoading(false);
    }
  };

  // Contar equipos seleccionados por tipo
  const selectedByType = selectedTeams.reduce(
    (acc, team) => {
      const type = team.teamType;
      if (type === "Fundacion") {
        acc.fundacion++;
      } else {
        acc.temporal++;
      }
      return acc;
    },
    { fundacion: 0, temporal: 0 },
  );

  // Renderizar el modal usando un portal para evitar problemas de z-index
  const modalContent = (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto event-modal-overlay"
      style={{
        zIndex: 999999,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl md:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col modal-content"
        style={{
          zIndex: 1000000,
          position: "relative",
          margin: "auto",
          maxHeight: "90vh",
          width: "100%",
          maxWidth: "80rem",
        }}
      >
        <div className="bg-primary-purple p-4 sm:p-6 text-white">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">
                Gestionar {participantType}
              </h2>
              <p className="text-blue-100 mt-1">Evento: {eventName}</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Buscar equipo por nombre, categoría o entrenador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
              autoFocus
            />
            <svg
              className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searching && (
              <div className="absolute right-3 top-3.5">
                <div className="w-5 h-5 border-2 border-primary-purple border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Filtros reorganizados */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-gray-700">Filtros</div>
              {(selectedCategories.length > 0 ||
                selectedTeamTypes.length > 0) && (
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedTeamTypes([]);
                  }}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start">
              {/* Filtros de tipo */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-gray-700">
                  Filtrar por tipo:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={selectAllTeamTypes}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedTeamTypes.length === 2
                        ? "bg-primary-purple text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-primary-purple"
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => toggleTeamType("Fundacion")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedTeamTypes.includes("Fundacion")
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-blue-600"
                    }`}
                  >
                    Fundación
                  </button>
                  <button
                    onClick={() => toggleTeamType("Temporal")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedTeamTypes.includes("Temporal")
                        ? "bg-orange-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-orange-600"
                    }`}
                  >
                    Temporal
                  </button>
                </div>
              </div>

              {/* Filtros de categoría */}
              {availableCategories.length > 0 && (
                <div className="flex flex-col gap-2 flex-1">
                  <p className="text-xs font-semibold text-gray-700">
                    Filtrar por categoría:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={selectAllCategories}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        selectedCategories.length === availableCategories.length
                          ? "bg-primary-purple text-white shadow-md"
                          : "bg-white text-gray-700 border border-gray-300 hover:border-primary-purple"
                      }`}
                    >
                      Todas
                    </button>
                    {availableCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          selectedCategories.includes(category)
                            ? "bg-primary-purple text-white shadow-md"
                            : "bg-white text-gray-700 border border-gray-300 hover:border-primary-purple"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botón seleccionar todos filtrados */}
          {(selectedCategories.length > 0 || selectedTeamTypes.length > 0) &&
            getFilteredTeams().length > 0 && (
              <button
                onClick={selectAllFiltered}
                className="w-full mb-3 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm font-semibold"
              >
                ✅ Seleccionar todos ({getFilteredTeams().length})
              </button>
            )}

          {/* Mostrar equipos disponibles cuando no hay búsqueda */}
          {searchTerm.length === 0 &&
            (selectedCategories.length > 0 || selectedTeamTypes.length > 0) && (
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2 font-medium">
                  Equipos disponibles ({getFilteredTeams().length})
                </p>
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {getFilteredTeams()
                    .slice(0, displayLimit)
                    .map((team) => {
                      const rsvpStatus = getRSVPStatus(team);
                      return (
                        <div
                          key={team.id}
                          onClick={() => handleSelectTeam(team)}
                          className="p-2.5 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <h4 className="font-semibold text-gray-900 text-sm truncate">
                                  {team.name}
                                </h4>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${
                                    team.teamType === "Fundacion"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-orange-100 text-orange-700"
                                  }`}
                                >
                                  {team.teamType === "Fundacion"
                                    ? "Fundación"
                                    : "Temporal"}
                                </span>
                                {team.category && (
                                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold flex-shrink-0">
                                    {team.category}
                                  </span>
                                )}
                                <span
                                  className={`px-1.5 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${
                                    rsvpStatus.color === "gray"
                                      ? "bg-gray-100 text-gray-700"
                                      : rsvpStatus.color === "orange"
                                        ? "bg-orange-100 text-orange-700"
                                        : rsvpStatus.color === "green"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {rsvpStatus.icon} {rsvpStatus.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="truncate">
                                  <span className="font-medium">
                                    Entrenador:
                                  </span>{" "}
                                  {team.coach || "Sin asignar"}
                                </span>
                              </div>
                            </div>
                            <svg
                              className="w-5 h-5 text-primary-purple flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </div>
                        </div>
                      );
                    })}
                  {/* Botón Ver más */}
                  {getFilteredTeams().length > displayLimit && (
                    <button
                      onClick={handleLoadMore}
                      className="w-full p-2.5 text-sm font-semibold text-primary-purple hover:bg-purple-50 transition-colors border-t border-gray-200"
                    >
                      Ver más equipos (
                      {getFilteredTeams().length - displayLimit} restantes)
                    </button>
                  )}
                </div>
              </div>
            )}

          {/* Mensaje cuando no hay filtros seleccionados */}
          {searchTerm.length === 0 &&
            selectedCategories.length === 0 &&
            selectedTeamTypes.length === 0 &&
            !loading && (
              <div className="mt-3 text-center py-6 bg-white border border-gray-200 rounded-lg">
                <svg
                  className="w-12 h-12 text-gray-300 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <p className="text-sm text-gray-600 font-medium">
                  Selecciona un tipo o categoría para ver equipos
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  O usa el buscador para encontrar equipos específicos
                </p>
              </div>
            )}

          {/* Resultados de búsqueda */}
          <AnimatePresence>
            {searchTerm.length >= 2 && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
              >
                {searchResults.map((team) => {
                  const rsvpStatus = getRSVPStatus(team);
                  return (
                    <div
                      key={team.id}
                      onClick={() => handleSelectTeam(team)}
                      className="p-2.5 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <h4 className="font-semibold text-gray-900 text-sm truncate">
                              {team.name}
                            </h4>
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${
                                team.teamType === "Fundacion"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {team.teamType === "Fundacion"
                                ? "Fundación"
                                : "Temporal"}
                            </span>
                            {team.category && (
                              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold flex-shrink-0">
                                {team.category}
                              </span>
                            )}
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${
                                rsvpStatus.color === "gray"
                                  ? "bg-gray-100 text-gray-700"
                                  : rsvpStatus.color === "orange"
                                    ? "bg-orange-100 text-orange-700"
                                    : rsvpStatus.color === "green"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                              }`}
                            >
                              {rsvpStatus.icon} {rsvpStatus.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="truncate">
                              <span className="font-medium">Entrenador:</span>{" "}
                              {team.coach || "Sin asignar"}
                            </span>
                            <span className="flex-shrink-0">
                              <span className="font-medium">Miembros:</span>{" "}
                              <span className="font-semibold text-indigo-600">
                                {team._count?.members || 0}
                              </span>
                            </span>
                          </div>
                        </div>
                        <svg
                          className="w-5 h-5 text-primary-purple flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {searchTerm.length > 0 && searchTerm.length < 2 && (
            <p className="text-xs text-gray-500 mt-2">
              Escribe al menos 2 caracteres para buscar
            </p>
          )}

          {searchTerm.length >= 2 &&
            searchResults.length === 0 &&
            !searching && (
              <p className="text-xs text-gray-500 mt-2">
                No se encontraron equipos que coincidan con "{searchTerm}"
              </p>
            )}

          {loading && (
            <div className="mt-3 flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary-purple border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-gray-600">
                Cargando equipos disponibles...
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {selectedTeams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay equipos seleccionados
              </h3>
              <p className="text-gray-500 text-sm text-center max-w-sm">
                Usa el buscador para encontrar y seleccionar los equipos que
                deseas inscribir
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  Equipos seleccionados ({selectedTeams.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <AnimatePresence>
                  {selectedTeams.map((team, index) => {
                    const rsvpStatus = getRSVPStatus(team);
                    return (
                      <motion.div
                        key={team.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative bg-white rounded-lg border-2 border-primary-purple/20 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-purple" />

                        <div className="p-3 pl-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="font-bold text-gray-900 text-sm truncate">
                                  {team.name}
                                </h4>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                                    team.teamType === "Fundacion"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-orange-100 text-orange-700"
                                  }`}
                                >
                                  {team.teamType === "Fundacion"
                                    ? "Fundación"
                                    : "Temporal"}
                                </span>
                                {team.category && (
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold flex-shrink-0">
                                    {team.category}
                                  </span>
                                )}
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                                    rsvpStatus.color === "gray"
                                      ? "bg-gray-100 text-gray-700"
                                      : rsvpStatus.color === "orange"
                                        ? "bg-orange-100 text-orange-700"
                                        : rsvpStatus.color === "green"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {rsvpStatus.icon} {rsvpStatus.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-600">
                                <span className="truncate">
                                  <span className="font-medium">
                                    Entrenador:
                                  </span>{" "}
                                  {team.coach || "Sin asignar"}
                                </span>
                                <span className="flex-shrink-0">
                                  <span className="font-medium">Miembros:</span>{" "}
                                  <span className="font-semibold text-indigo-600">
                                    {team._count?.members || 0}
                                  </span>
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleRemoveTeam(team.id)}
                              className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Quitar equipo"
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between gap-4">
            {/* Contador de selección */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl transition-all ${
                    selectedTeams.length > 0
                      ? "bg-primary-purple text-white shadow-lg"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {selectedTeams.length}
                </div>
                {selectedTeams.length > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-lg">
                  {selectedTeams.length}{" "}
                  {selectedTeams.length === 1 ? "equipo" : "equipos"}
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-500">
                    {selectedTeams.length === 0
                      ? "Selecciona al menos un equipo"
                      : "Listos para inscribir al evento"}
                  </p>
                  {selectedTeams.length > 0 && (
                    <div className="flex items-center gap-2">
                      {selectedByType.fundacion > 0 && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {selectedByType.fundacion} Fundación
                        </span>
                      )}
                      {selectedByType.temporal > 0 && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                          {selectedByType.temporal} Temporal
                          {selectedByType.temporal > 1 ? "es" : ""}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all hover:scale-105 active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={selectedTeams.length === 0}
                className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  selectedTeams.length === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-primary-purple text-white hover:bg-primary-blue hover:shadow-xl hover:scale-105 active:scale-95"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Guardar{" "}
                {selectedTeams.length > 0 && `(${selectedTeams.length})`}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Renderizar el modal usando un portal para evitar problemas de z-index
  return createPortal(modalContent, document.body);
};

export default TeamRegistrationFormModal;


