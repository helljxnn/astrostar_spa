import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft, FaSearch } from "react-icons/fa";
import { createPortal } from "react-dom";
import RegistrationsService from "../../services/RegistrationsService";
import { showErrorAlert } from "../../../../../../../../../shared/utils/alerts.js";

const ViewAthletesModal = ({ isOpen, onClose, eventName, eventId }) => {
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
  }, [isOpen, eventId]);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const response =
        await RegistrationsService.getEventAthleteRegistrations(eventId);

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

  // Transformar inscripciones a formato del componente
  const allAthletes = registrations
    .filter((reg) => reg.athlete)
    .map((reg) => ({
      id: reg.athlete.id,
      nombre:
        `${reg.athlete.user?.firstName || ""} ${
          reg.athlete.user?.lastName || ""
        }`.trim() || "Sin nombre",
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

  // Filtrar por búsqueda
  const filteredAthletes = useMemo(() => {
    if (!searchTerm) return allAthletes;

    return allAthletes.filter((athlete) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesName = athlete.nombre.toLowerCase().includes(searchLower);
      const matchesId = athlete.identificacion
        ?.toLowerCase()
        .includes(searchLower);
      const matchesCategory = athlete.categorias?.some((cat) =>
        cat.toLowerCase().includes(searchLower),
      );
      return matchesName || matchesId || matchesCategory;
    });
  }, [allAthletes, searchTerm]);

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
        <div className="bg-gradient-to-r from-primary-purple to-primary-blue p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <FaArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-bold">Deportistas Inscritos</h2>
                <p className="text-blue-100 mt-1">Evento: {eventName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{allAthletes.length}</p>
              <p className="text-blue-100 text-sm">Total</p>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="border-b bg-white">
          <div className="p-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, identificación o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Lista de deportistas */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredAthletes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg">
                {searchTerm
                  ? "No se encontraron resultados"
                  : "No hay deportistas inscritos"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredAthletes.map((athlete, index) => {
                const rsvpStatus = getRSVPStatus(athlete);
                return (
                  <motion.div
                    key={athlete.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-primary-purple/40 transition-all"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm flex-1">
                          {athlete.nombre}
                        </h3>
                      </div>

                      {athlete.categorias && athlete.categorias.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {athlete.categorias.slice(0, 2).map((cat, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
                            >
                              {cat}
                            </span>
                          ))}
                          {athlete.categorias.length > 2 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                              +{athlete.categorias.length - 2}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
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
                      )}

                      <div className="flex flex-col gap-1 text-xs text-gray-600 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">ID:</span>
                          <span>{athlete.identificacion}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Edad:</span>
                          <span>{athlete.edad} años</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Mostrando {filteredAthletes.length} de {allAthletes.length}{" "}
            deportistas
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
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

export default ViewAthletesModal;
