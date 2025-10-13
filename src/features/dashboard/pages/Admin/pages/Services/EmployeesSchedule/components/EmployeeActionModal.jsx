import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTrash, FaEye, FaBan, FaTimes } from "react-icons/fa";
import { useState } from "react";
import ScheduleDetailsModal from "./ScheduleDetailsModal";
import CancelScheduleModal from "./CancelScheduleModal";

const EmployeeActionModal = ({
  isOpen,
  onClose,
  onAction,
  position,
  employee = null,
  disabled = false,
}) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (!isOpen) return null;

  // === Definición de acciones disponibles ===
  const actions = [
    {
      id: "view",
      label: "Ver detalles del horario",
      icon: <FaEye className="w-4 h-4" />,
      color: "text-blue-600",
      hover: "hover:bg-blue-50",
      description: "Consultar información completa del horario",
      available: true,
    },
    {
      id: "edit",
      label: "Editar horario",
      icon: <FaEdit className="w-4 h-4" />,
      color: "text-green-600",
      hover: "hover:bg-green-50",
      description: "Modificar fecha, hora o área",
      available: !disabled,
    },
    {
      id: "cancel",
      label: "Cancelar horario",
      icon: <FaBan className="w-4 h-4" />,
      color: "text-orange-600",
      hover: "hover:bg-orange-50",
      description: "Marcar como cancelado",
      available: !disabled && employee?.estado !== "Cancelado",
    },
    {
      id: "delete",
      label: "Eliminar horario",
      icon: <FaTrash className="w-4 h-4" />,
      color: "text-red-600",
      hover: "hover:bg-red-50",
      description: "Eliminar permanentemente este horario",
      available: !disabled,
    },
  ].filter((a) => a.available);

  // === Handlers ===
  const handleAction = (actionId) => {
    if (actionId === "view") {
      // Abrir modal de detalles
      setShowDetailsModal(true);
      onClose(); // Cerrar el menú de acciones
      return;
    }
    
    if (actionId === "cancel") {
      // Abrir modal de cancelación
      setShowCancelModal(true);
      onClose(); // Cerrar el menú de acciones
      return;
    }

    // Para edit y delete, ejecutar directamente
    onAction(actionId, employee);
    onClose();
  };

  const handleCancelConfirm = (employeeWithReason) => {
    // Ejecutar la acción de cancelar con el motivo
    onAction("cancel", employeeWithReason);
    setShowCancelModal(false);
  };

  const handleKeyDown = (e) => e.key === "Escape" && onClose();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
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
                duration: 0.2,
                ease: "easeOut",
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="fixed z-[70] bg-white rounded-xl shadow-2xl border border-gray-200 min-w-[280px] max-w-[320px] overflow-hidden"
              style={{
                top: position?.top || "50%",
                left: position?.left || "50%",
                transform: position ? "none" : "translate(-50%, -50%)",
              }}
            >
              {/* === Header === */}
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
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </div>

              {/* === Acciones === */}
              <div className="py-2">
                {actions.length > 0 ? (
                  actions.map((action, i) => (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleAction(action.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-sm transition-all duration-200 ${action.color} ${action.hover} hover:scale-[1.02] active:scale-[0.98]`}
                    >
                      <div className="mt-0.5">{action.icon}</div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{action.label}</div>
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

              {/* === Footer === */}
              {employee && (
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-xs">
                  <div className="flex items-center justify-between">
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
                    <div className="flex items-center justify-between mt-2">
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

      {/* Modal de detalles */}
      <ScheduleDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        employee={employee}
      />

      {/* Modal de cancelación */}
      <CancelScheduleModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
        employee={employee}
      />
    </>
  );
};

export default EmployeeActionModal;