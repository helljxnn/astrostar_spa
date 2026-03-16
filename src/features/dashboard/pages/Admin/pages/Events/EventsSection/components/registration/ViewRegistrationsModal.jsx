import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaUsers,
  FaUserTie,
  FaSearch,
  FaTrophy,
  FaUserFriends,
  FaChartBar,
} from "react-icons/fa";
import { createPortal } from "react-dom";
import RegistrationsService from "../../services/RegistrationsService";
import { showErrorAlert } from "../../../../../../../../../shared/utils/alerts.js";
import ViewAthletesModal from "./ViewAthletesModal";

const ViewRegistrationsModal = ({
  isOpen,
  onClose,
  eventName,
  participantType,
  eventId,
}) => {
  const isTeamType = participantType === "Equipos";
  const [selectedSection, setSelectedSection] = useState(
    isTeamType ? "fundacion" : "deportistas",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper para obtener estado RSVP
  const getRSVPStatus = (registration) => {
    if (
      !registration.eventInvitations ||
      registration.eventInvitations.length === 0
    ) {
      return {
        status: "NO_SENT",
        label: "Sin invitación",
        color: "gray",
        icon: "📧",
      };
    }

    const invitation = registration.eventInvitations[0];

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

  // Función para cerrar modal y limpiar scroll
  const handleClose = () => {
    document.body.classList.remove("events-modal-open");
    onClose();
  };

  // Cargar inscripciones cuando se abre el modal
  useEffect(() => {
    if (isOpen && eventId) {
      loadRegistrations();
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
  }, [isOpen, eventId]); // ✅ Removido isTeamType para evitar doble carga

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      let response;
      if (isTeamType) {
        response = await RegistrationsService.getEventRegistrations(eventId);
      } else {
        response =
          await RegistrationsService.getEventAthleteRegistrations(eventId);
      }

      if (response.success && response.data) {
        setRegistrations(response.data);
      }
    } catch (error) {
      console.error("Error cargando inscripciones:", error);
      showErrorAlert("Error", "No se pudieron cargar las inscripciones");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Si no es tipo Equipos, mostrar el modal de deportistas
  if (!isTeamType) {
    return (
      <ViewAthletesModal
        isOpen={isOpen}
        onClose={onClose}
        eventName={eventName}
        eventId={eventId}
      />
    );
  }

  // Transformar inscripciones a formato del componente
  const allItems = isTeamType
    ? registrations
        .filter((reg) => reg.team)
        .map((reg) => ({
          id: reg.team.id,
          nombre: reg.team.name || "Sin nombre",
          categoria: reg.team.category || "Sin categoría",
          miembros: reg.team._count?.members || 0,
          teamType: reg.team.teamType || "Fundacion",
          registrationId: reg.id,
          status: reg.status,
          eventInvitations: reg.eventInvitations || [], // ✅ Incluir invitaciones
        }))
    : registrations
        .filter((reg) => reg.athlete)
        .map((reg) => ({
          id: reg.athlete.id,
          nombre:
            `${reg.athlete.user?.firstName || ""} ${reg.athlete.user?.lastName || ""}`.trim() ||
            "Sin nombre",
          identificacion: reg.athlete.user?.identification || "N/A",
          edad: reg.athlete.user?.age || "N/A",
          categorias:
            reg.athlete.inscriptions
              ?.map((i) => i.sportsCategory?.nombre)
              .filter(Boolean) || [],
          registrationId: reg.id,
          status: reg.status,
          eventInvitations: reg.eventInvitations || [], // ✅ Incluir invitaciones
        }));

  // Filtrar por sección (fundación o temporal para equipos, todos para deportistas)
  const filteredBySection = isTeamType
    ? allItems.filter((item) =>
        selectedSection === "fundacion"
          ? item.teamType === "Fundacion"
          : item.teamType === "Temporal",
      )
    : allItems; // Para deportistas, mostrar todos

  // Filtrar por búsqueda
  const filteredItems = useMemo(() => {
    if (!searchTerm) return filteredBySection;
    return filteredBySection.filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesName = item.nombre.toLowerCase().includes(searchLower);

      if (isTeamType) {
        const matchesCategory = item.categoria
          ?.toLowerCase()
          .includes(searchLower);
        return matchesName || matchesCategory;
      } else {
        const matchesId = item.identificacion
          ?.toLowerCase()
          .includes(searchLower);
        const matchesCategory = item.categorias?.some((cat) =>
          cat.toLowerCase().includes(searchLower),
        );
        return matchesName || matchesId || matchesCategory;
      }
    });
  }, [filteredBySection, searchTerm, isTeamType]);

  // Estadísticas
  const stats = {
    total: allItems.length,
    fundacion: isTeamType
      ? allItems.filter((i) => i.teamType === "Fundacion").length
      : 0,
    temporal: isTeamType
      ? allItems.filter((i) => i.teamType === "Temporal").length
      : 0,
    totalMiembros: isTeamType
      ? allItems.reduce((sum, i) => sum + (i.miembros || 0), 0)
      : allItems.length,
  };

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
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col relative modal-content"
        style={{
          zIndex: 1000000,
          position: "relative",
          margin: "auto",
          maxHeight: "90vh",
          width: "100%",
          maxWidth: "72rem",
        }}
      >
        {/* Header */}
        <div className="bg-primary-purple p-6 text-white">
          <div className="flex items-center gap-4">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                {isTeamType ? "Equipos Inscritos" : "Deportistas Inscritos"}
              </h2>
              <p className="text-blue-100 mt-1">Evento: {eventName}</p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="p-6 bg-purple-50 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FaTrophy className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
              </div>
            </motion.div>

            {isTeamType && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FaUsers className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fundación</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.fundacion}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <FaUserTie className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Temporales</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.temporal}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FaUserFriends className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {isTeamType ? "Miembros" : "Participantes"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalMiembros}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tabs y Búsqueda */}
        <div className="border-b bg-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">
            {/* Tabs */}
            {isTeamType && (
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSection("fundacion")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedSection === "fundacion"
                      ? "bg-primary-purple text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FaUsers className="w-4 h-4" />
                  Fundación
                </button>
                <button
                  onClick={() => setSelectedSection("temporales")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedSection === "temporales"
                      ? "bg-primary-purple text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FaUserTie className="w-4 h-4" />
                  Temporales
                </button>
              </div>
            )}

            {/* Búsqueda */}
            <div className="relative flex-1 md:max-w-md">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Lista de inscritos */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg">
                No se encontraron resultados
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item, index) => {
                const rsvpStatus = getRSVPStatus(item);
                return (
                  <motion.div
                    key={`${item.id}-${selectedSection}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-primary-purple/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg mb-2">
                          {item.nombre}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          {isTeamType ? (
                            <>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  item.teamType === "Fundacion"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                {item.teamType === "Fundacion"
                                  ? "Fundación"
                                  : "Temporal"}
                              </span>
                              {item.categoria && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">
                                  {item.categoria}
                                </span>
                              )}
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
                          ) : (
                            <>
                              {item.categorias &&
                                item.categorias.length > 0 && (
                                  <>
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">
                                      {item.categorias[0]}
                                    </span>
                                    {item.categorias.length > 1 && (
                                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-semibold">
                                        +{item.categorias.length - 1}
                                      </span>
                                    )}
                                  </>
                                )}
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
                          )}
                        </div>
                      </div>
                    </div>

                    {isTeamType ? (
                      <div className="flex items-center gap-2 text-gray-600 mt-3 pt-3 border-t border-gray-100">
                        <FaUserFriends className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm">
                          <span className="font-semibold text-indigo-600">
                            {item.miembros}
                          </span>{" "}
                          miembros
                        </span>
                      </div>
                    ) : (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <span className="font-medium">ID:</span>
                          <span>{item.identificacion}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <span className="font-medium">Edad:</span>
                          <span>{item.edad} años</span>
                        </div>
                        {item.categorias && item.categorias.length > 0 && (
                          <div className="flex gap-1 flex-wrap mt-2">
                            {item.categorias.slice(0, 2).map((cat, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
                              >
                                {cat}
                              </span>
                            ))}
                            {item.categorias.length > 2 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                +{item.categorias.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Mostrando {filteredItems.length} de {filteredBySection.length}{" "}
            {isTeamType ? "equipos" : "deportistas"}
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );

  // Renderizar el modal usando un portal para evitar problemas de z-index
  return createPortal(modalContent, document.body);
};

export default ViewRegistrationsModal;

