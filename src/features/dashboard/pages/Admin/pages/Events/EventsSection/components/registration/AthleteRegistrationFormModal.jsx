import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaTimes } from "react-icons/fa";
import { createPortal } from "react-dom";
import RegistrationsService from "../../services/RegistrationsService";
import {
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../../../shared/utils/alerts.js";

const AthleteRegistrationFormModal = ({
  isOpen,
  onClose,
  event,
  onSuccess,
  mode = "register", // 'register' o 'edit'
}) => {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [availableAthletes, setAvailableAthletes] = useState([]); // Deportistas disponibles
  const [selectedAthletes, setSelectedAthletes] = useState([]);
  const [initialAthletes, setInitialAthletes] = useState([]); // Guardar deportistas iniciales para comparar
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [displayLimit, setDisplayLimit] = useState(6); // Límite inicial de deportistas a mostrar
  const [selectedCategories, setSelectedCategories] = useState([]); // Categorías seleccionadas para filtrar
  const [availableCategories, setAvailableCategories] = useState([]); // Categorías disponibles
  const searchTimeoutRef = useRef(null);
  const hasLoadedRef = useRef(false); // Para evitar cargas múltiples
  const lastEventIdRef = useRef(null); // Para rastrear cambios de evento

  // Helper para obtener estado RSVP
  const getRSVPStatus = (athlete) => {
    if (!athlete.eventInvitations || athlete.eventInvitations.length === 0) {
      return {
        status: "NO_SENT",
        label: "Sin invitación",
        color: "gray",
        icon: "📧",
      };
    }

    const invitation = athlete.eventInvitations[0];

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

  // Cargar deportistas disponibles
  const loadAvailableAthletes = useCallback(async () => {
    if (!event?.id) {
      return;
    }

    setLoading(true);
    try {
      const response = await RegistrationsService.getAthletesByEventCategories(
        event.id,
      );

      if (response.success) {
        const athletesData = response.data.athletes || [];
        setAvailableAthletes(athletesData);
      }
    } catch (error) {
      console.error("Error cargando deportistas disponibles:", error);
      setAvailableAthletes([]);
    } finally {
      setLoading(false);
    }
  }, [event?.id]);

  // Cargar solo las categorías deportivas asignadas al evento
  const loadSportsCategories = useCallback(async () => {
    // Usar directamente las categorías del evento
    if (event?.sportsCategoriesData && event.sportsCategoriesData.length > 0) {
      setAvailableCategories(event.sportsCategoriesData.filter((c) => c.nombre));
      return;
    }
    // Fallback por si el evento no tiene categorías asignadas
    setAvailableCategories([]);
  }, [event?.sportsCategoriesData]);

  // Declarar searchAthletes antes de los useEffect que lo usan
  const searchAthletes = useCallback(
    async (term) => {
      if (!term || term.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        // Filtrar de los deportistas disponibles
        const filtered = availableAthletes.filter((athlete) => {
          const fullName = `${athlete.user?.firstName || ""} ${
            athlete.user?.lastName || ""
          }`.toLowerCase();
          const identification =
            athlete.user?.identification?.toLowerCase() || "";
          const searchLower = term.toLowerCase();

          // Buscar en nombre o documento
          const matchesNameOrDocument =
            fullName.includes(searchLower) ||
            identification.includes(searchLower);

          // Buscar en categorías
          const matchesCategory = athlete.inscriptions?.some((inscription) => {
            const categoryName =
              inscription.sportsCategory?.nombre?.toLowerCase() || "";
            return categoryName.includes(searchLower);
          });

          // Excluir deportistas ya seleccionados
          const notSelected = !selectedAthletes.find(
            (sa) => sa.id === athlete.id,
          );

          return (matchesNameOrDocument || matchesCategory) && notSelected;
        });

        setSearchResults(filtered);
      } catch (err) {
        console.error("Error searching athletes:", err);
      } finally {
        setSearching(false);
      }
    },
    [availableAthletes, selectedAthletes],
  );

  const loadRegisteredAthletes = useCallback(async () => {
    if (!event?.id) return;

    setLoading(true);
    try {
      const response = await RegistrationsService.getEventAthleteRegistrations(
        event.id,
      );

      if (response.success && Array.isArray(response.data)) {
        const registeredAthletes = response.data
          .filter((reg) => reg.athlete)
          .map((reg) => ({
            ...reg.athlete,
            registrationId: reg.id,
            eventInvitations: reg.eventInvitations || [], // ✅ Incluir invitaciones
          }));

        setSelectedAthletes(registeredAthletes);
        setInitialAthletes(registeredAthletes);
      }
    } catch (error) {
      console.error("Error cargando deportistas inscritos:", error);
      // No mostrar error si no hay deportistas inscritos, es normal
    } finally {
      setLoading(false);
    }
  }, [event?.id]);

  useEffect(() => {
    // Detectar si el evento cambió
    const eventChanged = event?.id !== lastEventIdRef.current;

    if (isOpen && event) {
      // Solo resetear si es un evento diferente o es la primera vez que se abre
      if (eventChanged || !hasLoadedRef.current) {
        setSearchTerm("");
        setSearchResults([]);
        lastEventIdRef.current = event.id;

        // Cargar deportistas disponibles y categorías deportivas
        loadAvailableAthletes();
        loadSportsCategories();

        // Modo unificado: siempre cargar deportistas inscritos
        hasLoadedRef.current = true;
        loadRegisteredAthletes();
      }

      // Bloquear scroll del body
      document.body.classList.add("events-modal-open");
    } else {
      // Desbloquear scroll del body
      document.body.classList.remove("events-modal-open");
    }

    // Reset cuando se cierra el modal
    if (!isOpen) {
      hasLoadedRef.current = false;
      lastEventIdRef.current = null;
    }

    // Cleanup al desmontar
    return () => {
      document.body.classList.remove("events-modal-open");
    };
  }, [
    isOpen,
    event?.id,
    loadRegisteredAthletes,
    loadAvailableAthletes,
    loadSportsCategories,
  ]);

  useEffect(() => {
    // Búsqueda con debounce - ahora busca en availableAthletes
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchAthletes(searchTerm);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, searchAthletes]);

  const handleSelectAthlete = (athlete) => {
    // Verificar que el deportista no esté ya seleccionado
    const alreadySelected = selectedAthletes.find((a) => a.id === athlete.id);
    if (alreadySelected) {
      return; // No agregar duplicados
    }

    setSelectedAthletes((prev) => [...prev, athlete]);
    // Remover de resultados de búsqueda
    setSearchResults((prev) => prev.filter((a) => a.id !== athlete.id));
    // Limpiar búsqueda
    setSearchTerm("");
  };

  const handleRemoveAthlete = (athleteId) => {
    setSelectedAthletes((prev) => prev.filter((a) => a.id !== athleteId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Modo unificado: siempre detectar cambios
      const initialIds = initialAthletes.map((a) => a.id);
      const currentIds = selectedAthletes.map((a) => a.id);

      // Deportistas nuevos a inscribir
      const athletesToAdd = selectedAthletes.filter(
        (a) => !initialIds.includes(a.id),
      );

      // Deportistas a quitar (cancelar inscripción)
      const athletesToRemove = initialAthletes.filter(
        (a) => !currentIds.includes(a.id),
      );

      // Cancelar inscripciones de deportistas quitados
      if (athletesToRemove.length > 0) {
        for (const athlete of athletesToRemove) {
          if (athlete.registrationId) {
            await RegistrationsService.cancelRegistration(
              athlete.registrationId,
            );
          }
        }
      }

      // Inscribir deportistas nuevos
      if (athletesToAdd.length > 0) {
        const athleteIdsToAdd = athletesToAdd.map((a) => a.id);

        const response = await RegistrationsService.registerAthletesBulk({
          serviceId: event.id,
          athleteIds: athleteIdsToAdd,
        });

        if (!response.success) {
          const errorMsg =
            response.message ||
            response.error ||
            "Error al inscribir deportista(s)";
          setError(errorMsg);
          showErrorAlert("Error", errorMsg);
          return;
        }

        // Verificar si hubo errores en la inscripción masiva
        const hasErrors =
          response.data?.errors && response.data.errors.length > 0;
        const successful = response.data?.successful || athletesToAdd.length;

        if (hasErrors && successful === 0) {
          // Todos fallaron
          const errorDetails = response.data.errors
            .map(
              (err) =>
                `${err.athleteName || `ID ${err.athleteId}`}: ${err.error}`,
            )
            .join("\n");
          setError(`No se pudo inscribir ningún deportista:\n${errorDetails}`);
          showErrorAlert(
            "Error",
            `No se pudo inscribir ningún deportista. ${response.data.errors[0].error}`,
          );
          return;
        }

        if (hasErrors && successful > 0) {
          // Algunos fallaron
          showErrorAlert(
            "Inscripción parcial",
            `Se inscribieron ${successful} de ${athletesToAdd.length} deportistas. ${response.data.errors.length} fallaron.`,
          );
        }
      }

      // Mensaje según los cambios realizados
      if (athletesToAdd.length > 0 || athletesToRemove.length > 0) {
        showSuccessAlert(
          "Cambios guardados",
          `Se actualizó la inscripción: ${athletesToAdd.length} agregados, ${athletesToRemove.length} removidos`,
        );
      } else {
        showSuccessAlert(
          "Sin cambios",
          "No se realizaron cambios en las inscripciones",
        );
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Error registering athletes:", err);
      const errorMsg =
        "Error al inscribir: " + (err.message || "Error desconocido");
      setError(errorMsg);
      showErrorAlert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedAthletes([]);
    setSearchTerm("");
    setError(null);
    setDisplayLimit(6); // Reset al cerrar
    setSelectedCategories([]); // Reset filtros
    onClose();
  };

  const handleLoadMore = () => {
    setDisplayLimit((prev) => prev + 6);
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
    setDisplayLimit(6); // Reset limit al cambiar filtro
  };

  const selectAllCategories = () => {
    if (selectedCategories.length === availableCategories.length) {
      // Si todas están seleccionadas, deseleccionar todas
      setSelectedCategories([]);
    } else {
      // Seleccionar todas
      setSelectedCategories(availableCategories.map((cat) => cat.id));
    }
    setDisplayLimit(6);
  };

  const selectAllFiltered = () => {
    const filtered = getFilteredAthletes();
    const newSelections = filtered.filter(
      (athlete) => !selectedAthletes.find((sa) => sa.id === athlete.id),
    );
    setSelectedAthletes((prev) => [...prev, ...newSelections]);
  };

  const getFilteredAthletes = () => {
    let filtered = availableAthletes.filter(
      (athlete) => !selectedAthletes.find((sa) => sa.id === athlete.id),
    );

    // Filtrar por categorías seleccionadas
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((athlete) =>
        athlete.inscriptions?.some((inscription) =>
          selectedCategories.includes(inscription.sportsCategory?.id),
        ),
      );
    }

    return filtered;
  };

  if (!isOpen) return null;

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
        {/* Header */}
        <div className="bg-primary-purple p-4 sm:p-6 text-white">
          <div className="flex items-center gap-4">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">
                Gestionar Deportistas
              </h2>
              <p className="text-blue-100 mt-1">Evento: {event?.name}</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 mb-3">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar deportista por nombre, documento o categoría..."
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
          </div>

          {/* Filtros por categoría */}
          {availableCategories.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-700">
                  Filtrar por categoría:
                </p>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {/* Botón Todas */}
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
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedCategories.includes(category.id)
                        ? "bg-primary-purple text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-primary-purple"
                    }`}
                  >
                    {category.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botón seleccionar todos filtrados */}
          {selectedCategories.length > 0 &&
            getFilteredAthletes().length > 0 && (
              <button
                onClick={selectAllFiltered}
                className="w-full mb-3 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm font-semibold"
              >
                ✓ Seleccionar todos ({getFilteredAthletes().length})
              </button>
            )}

          {/* Mostrar deportistas disponibles cuando no hay búsqueda */}
          {searchTerm.length === 0 && selectedCategories.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-600 mb-2 font-medium">
                Deportistas disponibles ({getFilteredAthletes().length})
              </p>
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {getFilteredAthletes()
                  .slice(0, displayLimit)
                  .map((athlete) => {
                    const rsvpStatus = getRSVPStatus(athlete);
                    return (
                      <div
                        key={athlete.id}
                        onClick={() => handleSelectAthlete(athlete)}
                        className="p-2.5 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <h4 className="font-semibold text-gray-900 text-sm truncate">
                                {athlete.user?.firstName}{" "}
                                {athlete.user?.lastName}
                              </h4>
                              {athlete.inscriptions &&
                                athlete.inscriptions.length > 0 && (
                                  <>
                                    {(() => {
                                      const uniqueCategories =
                                        athlete.inscriptions.reduce(
                                          (acc, inscription) => {
                                            const categoryId =
                                              inscription.sportsCategory?.id;
                                            if (
                                              categoryId &&
                                              !acc.find(
                                                (item) =>
                                                  item.sportsCategory?.id ===
                                                  categoryId,
                                              )
                                            ) {
                                              acc.push(inscription);
                                            }
                                            return acc;
                                          },
                                          [],
                                        );

                                      return (
                                        <>
                                          {uniqueCategories
                                            .slice(0, 1)
                                            .map((inscription, idx) => (
                                              <span
                                                key={
                                                  inscription.sportsCategory
                                                    ?.id || idx
                                                }
                                                className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold flex-shrink-0"
                                              >
                                                {
                                                  inscription.sportsCategory
                                                    ?.nombre
                                                }
                                              </span>
                                            ))}
                                          {uniqueCategories.length > 1 && (
                                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-semibold flex-shrink-0">
                                              +{uniqueCategories.length - 1}
                                            </span>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </>
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
                                ID: {athlete.user?.identification || "N/A"}
                              </span>
                              {athlete.user?.age && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span className="flex-shrink-0">
                                    {athlete.user.age} años
                                  </span>
                                </>
                              )}
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
                {getFilteredAthletes().length > displayLimit && (
                  <button
                    onClick={handleLoadMore}
                    className="w-full p-2.5 text-sm font-semibold text-primary-purple hover:bg-purple-50 transition-colors border-t border-gray-200"
                  >
                    Ver más deportistas (
                    {getFilteredAthletes().length - displayLimit} restantes)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Mensaje cuando no hay filtros seleccionados */}
          {searchTerm.length === 0 &&
            selectedCategories.length === 0 &&
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
                  Selecciona una categoría para ver deportistas
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  O usa el buscador para encontrar deportistas específicos
                </p>
              </div>
            )}

          {/* Resultados de búsqueda */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
              >
                {searchResults.map((athlete) => {
                  const rsvpStatus = getRSVPStatus(athlete);
                  return (
                    <div
                      key={athlete.id}
                      onClick={() => handleSelectAthlete(athlete)}
                      className="p-2.5 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <h4 className="font-semibold text-gray-900 text-sm truncate">
                              {athlete.user?.firstName} {athlete.user?.lastName}
                            </h4>
                            {athlete.inscriptions &&
                              athlete.inscriptions.length > 0 && (
                                <>
                                  {(() => {
                                    // Filtrar categorías únicas por ID
                                    const uniqueCategories =
                                      athlete.inscriptions.reduce(
                                        (acc, inscription) => {
                                          const categoryId =
                                            inscription.sportsCategory?.id;
                                          if (
                                            categoryId &&
                                            !acc.find(
                                              (item) =>
                                                item.sportsCategory?.id ===
                                                categoryId,
                                            )
                                          ) {
                                            acc.push(inscription);
                                          }
                                          return acc;
                                        },
                                        [],
                                      );

                                    return (
                                      <>
                                        {uniqueCategories
                                          .slice(0, 1)
                                          .map((inscription, idx) => (
                                            <span
                                              key={
                                                inscription.sportsCategory
                                                  ?.id || idx
                                              }
                                              className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-semibold flex-shrink-0"
                                            >
                                              {
                                                inscription.sportsCategory
                                                  ?.nombre
                                              }
                                            </span>
                                          ))}
                                        {uniqueCategories.length > 1 && (
                                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-semibold flex-shrink-0">
                                            +{uniqueCategories.length - 1}
                                          </span>
                                        )}
                                      </>
                                    );
                                  })()}
                                </>
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
                              ID: {athlete.user?.identification || "N/A"}
                            </span>
                            {athlete.user?.age && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="flex-shrink-0">
                                  {athlete.user.age} años
                                </span>
                              </>
                            )}
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
                No se encontraron deportistas que coincidan con "{searchTerm}"
              </p>
            )}

          {loading && (
            <div className="mt-3 flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary-purple border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-gray-600">
                Cargando deportistas disponibles...
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Athletes List */}
          {selectedAthletes.length === 0 ? (
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay deportistas seleccionados
              </h3>
              <p className="text-gray-500 text-sm text-center max-w-sm">
                Usa el buscador para encontrar y seleccionar los deportistas que
                deseas inscribir
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  Deportistas seleccionados ({selectedAthletes.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                <AnimatePresence>
                  {selectedAthletes.map((athlete, index) => {
                    const rsvpStatus = getRSVPStatus(athlete);
                    return (
                      <motion.div
                        key={athlete.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.03 }}
                        className="relative bg-white rounded-lg border-2 border-primary-purple/20 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-purple" />

                        <div className="p-2.5 pl-3.5">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-gray-900 text-xs flex-1 leading-tight">
                                {athlete.user?.firstName}{" "}
                                {athlete.user?.lastName}
                              </h4>
                              <button
                                onClick={() => handleRemoveAthlete(athlete.id)}
                                className="flex-shrink-0 p-0.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Quitar deportista"
                              >
                                <FaTimes className="w-3 h-3" />
                              </button>
                            </div>

                            {athlete.inscriptions &&
                              athlete.inscriptions.length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {(() => {
                                    // Filtrar categorías únicas por ID
                                    const uniqueCategories =
                                      athlete.inscriptions.reduce(
                                        (acc, inscription) => {
                                          const categoryId =
                                            inscription.sportsCategory?.id;
                                          if (
                                            categoryId &&
                                            !acc.find(
                                              (item) =>
                                                item.sportsCategory?.id ===
                                                categoryId,
                                            )
                                          ) {
                                            acc.push(inscription);
                                          }
                                          return acc;
                                        },
                                        [],
                                      );

                                    return (
                                      <>
                                        {uniqueCategories
                                          .slice(0, 1)
                                          .map((inscription) => (
                                            <span
                                              key={
                                                inscription.sportsCategory?.id
                                              }
                                              className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-medium truncate max-w-[120px]"
                                              title={
                                                inscription.sportsCategory
                                                  ?.nombre
                                              }
                                            >
                                              {
                                                inscription.sportsCategory
                                                  ?.nombre
                                              }
                                            </span>
                                          ))}
                                        {uniqueCategories.length > 1 && (
                                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">
                                            +{uniqueCategories.length - 1}
                                          </span>
                                        )}
                                        <span
                                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 ${
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
                                      </>
                                    );
                                  })()}
                                </div>
                              )}

                            <div className="flex flex-col gap-0.5 text-[10px] text-gray-600 pt-1.5 border-t border-gray-100">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium">ID:</span>
                                <span className="truncate">
                                  {athlete.user?.identification || "N/A"}
                                </span>
                              </div>
                              {athlete.user?.age && (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-medium">Edad:</span>
                                  <span>{athlete.user.age} años</span>
                                </div>
                              )}
                            </div>
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

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between gap-4">
            {/* Contador de selección */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl transition-all ${
                    selectedAthletes.length > 0
                      ? "bg-primary-purple text-white shadow-lg"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {selectedAthletes.length}
                </div>
                {selectedAthletes.length > 0 && (
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
                  {selectedAthletes.length}{" "}
                  {selectedAthletes.length === 1 ? "deportista" : "deportistas"}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedAthletes.length === 0
                    ? "Sin deportistas seleccionados"
                    : "Listos para inscribir al evento"}
                </p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleClose}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-primary-purple text-white hover:bg-primary-blue hover:shadow-xl hover:scale-105 active:scale-95"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Inscribiendo...
                  </>
                ) : (
                  <>
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
                    {selectedAthletes.length > 0 &&
                      `(${selectedAthletes.length})`}
                  </>
                )}
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

export default AthleteRegistrationFormModal;

