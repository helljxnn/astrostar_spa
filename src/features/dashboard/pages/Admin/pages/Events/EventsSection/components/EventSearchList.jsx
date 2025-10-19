import { useState } from "react";
import { FaCog, FaUsers } from "react-icons/fa";
import EventActionModal from "./EventActionModal";
import EventRegistrationModal from "./EventRegistrationModal";

const EventSearchList = ({
  events,
  onCrudAction,
  onRegistrationAction,
}) => {
  // Estados para modales (igual que en EventsCalendar)
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    position: null,
    event: null,
  });
  const [registrationModal, setRegistrationModal] = useState({
    isOpen: false,
    position: null,
    event: null,
  });

  // Manejar click en acciones de evento (similar a EventsCalendar)
  const handleActionClick = (e, actionType, event) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const modalWidth = 220;
    const modalHeight = 150;

    // Posición predeterminada (abajo del botón)
    let top = rect.bottom + 5;
    let left = rect.left;

    // Ajustar posición para evitar que se corte
    if (left + modalWidth > viewportWidth) {
      left = rect.right - modalWidth;
    }

    if (top + modalHeight > viewportHeight) {
      top = rect.top - modalHeight - 5;
    }

    if (left < 10) left = 10;
    if (top < 10) top = rect.bottom + 5;

    const position = { top, left };

    if (actionType === "crud") {
      setActionModal({ isOpen: true, position, event });
    } else if (actionType === "registration") {
      setRegistrationModal({ isOpen: true, position, event });
    }
  };

  // Cerrar modales
  const closeAllModals = () => {
    setActionModal({ isOpen: false, position: null, event: null });
    setRegistrationModal({ isOpen: false, position: null, event: null });
  };

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow">
        <p className="text-gray-500 text-lg">No se encontraron eventos</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="grid gap-4 p-4">
        {events.map((event, index) => (
          <div
            key={event.id || index}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-800 truncate">
                {event.nombre}
              </h3>
              <div className="mt-1 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {event.tipo}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {new Date(event.fechaInicio).toLocaleDateString()}
                </span>
                {/* Estado del evento con colores según su valor */}
                {event.estado === "programado" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    Programado
                  </span>
                )}
                {event.estado === "en-curso" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    En curso
                  </span>
                )}
                {event.estado === "finalizado" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    Finalizado
                  </span>
                )}
                {event.estado === "cancelado" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                    Cancelado
                  </span>
                )}
                {event.estado === "en-pausa" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                    En pausa
                  </span>
                )}
                {![
                  "programado",
                  "en-curso",
                  "finalizado",
                  "cancelado",
                  "en-pausa",
                ].includes(event.estado) && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    {event.estado}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {event.descripcion}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
              <button
                onClick={(e) => handleActionClick(e, "crud", event)}
                className="flex items-center gap-1 px-3 py-1 bg-primary-blue text-white rounded-lg text-sm font-medium shadow-sm hover:bg-primary-purple transition-colors"
                title="Gestionar evento"
              >
                <FaCog size={12} />
                Gestionar
              </button>
              <button
                onClick={(e) => handleActionClick(e, "registration", event)}
                className="flex items-center gap-1 px-3 py-1 bg-primary-blue text-white rounded-lg text-sm font-medium shadow-sm hover:bg-primary-purple transition-colors"
                title="Inscribir a evento"
              >
                <FaUsers size={12} />
                Inscribir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modales */}
      {actionModal.isOpen && (
        <EventActionModal
          isOpen={actionModal.isOpen}
          onClose={closeAllModals}
          onAction={(action) => onCrudAction(action, actionModal.event)}
          position={actionModal.position}
        />
      )}

      {registrationModal.isOpen && (
        <EventRegistrationModal
          isOpen={registrationModal.isOpen}
          onClose={closeAllModals}
          onAction={(action, participantType) =>
            onRegistrationAction(
              action,
              participantType,
              registrationModal.event
            )
          }
          position={registrationModal.position}
          eventType={registrationModal.event?.tipo}
        />
      )}
    </div>
  );
};

export default EventSearchList;
