import { motion } from "framer-motion";
import { FaUserPlus, FaEdit, FaEye } from "react-icons/fa";
import { createPortal } from "react-dom";

const EventRegistrationOptionsModal = ({
  isOpen,
  onClose,
  onAction,
  position,
  eventType,
  hasRegistrations = false,
  eventStatus = "",
}) => {
  if (!isOpen) {
    return null;
  }

  // Determinar el tipo de participante según el tipo de evento
  const getParticipantType = () => {
    switch (eventType) {
      case "Festival":
      case "Torneo":
        return "Equipos";
      case "Clausura":
      case "Taller":
        return "Deportistas";
      default:
        return "Participantes";
    }
  };

  const participantType = getParticipantType();

  // Verificar si el evento está finalizado o cancelado
  const isEventFinishedOrCancelled =
    eventStatus === "Finalizado" ||
    eventStatus === "finalizado" ||
    eventStatus === "Cancelado" ||
    eventStatus === "cancelado";

  // Definir acciones según el estado del evento
  let actions = [];

  if (isEventFinishedOrCancelled) {
    // Si el evento está finalizado o cancelado, solo mostrar "Ver inscritos"
    actions = [
      {
        id: "viewRegistrations",
        label: "Ver inscritos",
        icon: <FaEye className="w-4 h-4" />,
        color: "text-gray-600",
        hoverColor: "hover:bg-gray-50",
      },
    ];
  } else {
    // Si el evento está activo: Inscribir (modo unificado) + Ver
    actions = [
      {
        id: "register",
        label: `Inscribir ${participantType}`,
        icon: <FaUserPlus className="w-4 h-4" />,
        color: "text-green-600",
        hoverColor: "hover:bg-green-50",
      },
      {
        id: "viewRegistrations",
        label: "Ver inscritos",
        icon: <FaEye className="w-4 h-4" />,
        color: "text-gray-600",
        hoverColor: "hover:bg-gray-50",
      },
    ];
  }

  // Renderizar el modal usando portal
  const modalContent = (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={onClose}
        style={{
          pointerEvents: "auto",
          zIndex: 9999998,
          backgroundColor: "transparent",
        }}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-gray-200 min-w-[220px] max-w-[280px]"
        style={{
          top: position?.top || "50%",
          left: position?.left || "50%",
          transform: position ? "none" : "translate(-50%, -50%)",
          pointerEvents: "auto",
          zIndex: 9999999,
          position: "fixed",
        }}
      >
        <div className="p-2">
          <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b border-gray-100">
            Inscribir a evento
          </div>
          <div className="py-1">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => {
                  onAction(action.id, participantType);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors rounded-lg ${action.color} ${action.hoverColor}`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );

  // Renderizar usando portal para evitar problemas de z-index
  return createPortal(modalContent, document.body);
};

export default EventRegistrationOptionsModal;
