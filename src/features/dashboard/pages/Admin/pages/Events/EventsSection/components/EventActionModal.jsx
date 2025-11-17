import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

const EventActionModal = ({ isOpen, onClose, onAction, position, eventStatus }) => {
  if (!isOpen) return null;

  // Verificar si el evento está finalizado
  const isFinalized = eventStatus === "Finalizado" || eventStatus === "finalizado";

  const allActions = [
    {
      id: "edit",
      label: "Editar evento",
      icon: <FaEdit className="w-4 h-4" />,
      color: "text-blue-600",
      hoverColor: "hover:bg-blue-50",
      showWhen: !isFinalized, // Solo mostrar si NO está finalizado
    },
    {
      id: "delete",
      label: "Eliminar evento",
      icon: <FaTrash className="w-4 h-4" />,
      color: "text-red-600",
      hoverColor: "hover:bg-red-50",
      showWhen: true, // Siempre mostrar
    },
    {
      id: "view",
      label: "Ver detalles del evento",
      icon: <FaEye className="w-4 h-4" />,
      color: "text-gray-600",
      hoverColor: "hover:bg-gray-50",
      showWhen: true, // Siempre mostrar
    },
  ];

  // Filtrar acciones según el estado del evento
  const actions = allActions.filter(action => action.showWhen);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[60]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="fixed z-[70] bg-white rounded-xl shadow-2xl border border-gray-200 min-w-[220px] max-w-[280px]"
        style={{
          top: position?.top || "50%",
          left: position?.left || "50%",
          transform: position ? "none" : "translate(-50%, -50%)",
        }}
      >
        <div className="p-2">
          <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b border-gray-100">
            Gestionar evento
          </div>
          <div className="py-1">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => {
                  onAction(action.id);
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
};

export default EventActionModal;