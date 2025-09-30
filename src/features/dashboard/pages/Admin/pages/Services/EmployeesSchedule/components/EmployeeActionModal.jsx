import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTrash, FaEye, FaBan, FaTimes } from "react-icons/fa";

const EmployeeActionModal = ({ 
  isOpen, 
  onClose, 
  onAction, 
  position,
  employee = null,
  disabled = false 
}) => {
  // Si no está abierto, no renderizar
  if (!isOpen) return null;

  // Definir acciones disponibles para empleados
  const employeeActions = [
    {
      id: "view",
      label: "Ver detalles del horario",
      icon: <FaEye className="w-4 h-4" />,
      color: "text-blue-600",
      hoverColor: "hover:bg-blue-50",
      description: "Consultar información completa",
      available: true,
    },
    {
      id: "edit",
      label: "Editar horario",
      icon: <FaEdit className="w-4 h-4" />,
      color: "text-green-600",
      hoverColor: "hover:bg-green-50",
      description: "Modificar fecha, hora y área",
      available: !disabled,
    },
    {
      id: "cancel",
      label: "Cancelar horario",
      icon: <FaBan className="w-4 h-4" />,
      color: "text-orange-600",
      hoverColor: "hover:bg-orange-50",
      description: "Marcar como cancelado",
      available: !disabled && employee?.estado !== "Cancelado",
    },
    {
      id: "delete",
      label: "Eliminar horario",
      icon: <FaTrash className="w-4 h-4" />,
      color: "text-red-600",
      hoverColor: "hover:bg-red-50",
      description: "Eliminar permanentemente",
      available: !disabled,
    },
  ];

  // Filtrar acciones disponibles
  const availableActions = employeeActions.filter(action => action.available);

  // Manejar acción y cerrar modal
  const handleAction = (actionId) => {
    onAction(actionId, employee);
    onClose();
  };

  // Cerrar modal con Escape
  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay invisible para cerrar */}
          <div
            className="fixed inset-0 z-[60] bg-transparent"
            onClick={onClose}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
          />

          {/* Modal principal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ 
              duration: 0.15, 
              ease: "easeOut",
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="fixed z-[70] bg-white rounded-xl shadow-2xl border border-gray-200 min-w-[280px] max-w-[320px] overflow-hidden"
            style={{
              top: position?.top || "50%",
              left: position?.left || "50%",
              transform: position ? "none" : "translate(-50%, -50%)",
            }}
          >
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Gestionar Horario
                </h3>
                {employee && (
                  <p className="text-xs text-gray-600 mt-1">
                    {employee.empleado} - {employee.fecha}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>

            {/* Lista de acciones */}
            <div className="py-2">
              {availableActions.length > 0 ? (
                availableActions.map((action, index) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleAction(action.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-sm transition-all duration-200 ${action.color} ${action.hoverColor} hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    <div className="mt-0.5">
                      {action.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">
                        {action.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {action.description}
                      </div>
                    </div>
                  </motion.button>
                ))
              ) : (
                <div className="px-4 py-6 text-center">
                  <FaBan className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    No hay acciones disponibles
                  </p>
                </div>
              )}
            </div>

            {/* Footer informativo */}
            {employee && (
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Estado:</span>
                  <span
                    className={`px-2 py-1 rounded-full font-medium ${
                      employee.estado === "Programado"
                        ? "bg-green-100 text-green-700"
                        : employee.estado === "Cancelado"
                        ? "bg-red-100 text-red-700"
                        : employee.estado === "Completado"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {employee.estado || "Sin estado"}
                  </span>
                </div>
                {employee.area && (
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="text-gray-500">Área:</span>
                    <span className="font-medium text-gray-700">
                      {employee.area}
                    </span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmployeeActionModal;