import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCalendar, FaClock, FaUser, FaMapMarkerAlt, FaInfoCircle, FaBriefcase } from "react-icons/fa";

const ScheduleDetailsModal = ({ isOpen, onClose, employee }) => {
  if (!isOpen || !employee) return null;

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center"
            onClick={handleOverlayClick}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#9BE9FF] to-[#7dd3fc] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <FaInfoCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Detalles del Horario</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition"
                >
                  <FaTimes className="w-5 h-5 text-gray-800" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Empleado */}
                <div className="flex items-start gap-3">
                  <div className="bg-[#9BE9FF] bg-opacity-20 p-3 rounded-lg">
                    <FaUser className="w-5 h-5 text-[#9BE9FF]" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Empleado
                    </label>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {employee.empleado}
                    </p>
                  </div>
                </div>

                {/* Cargo */}
                {employee.cargo && (
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <FaBriefcase className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Cargo
                      </label>
                      <p className="text-base font-semibold text-gray-900 mt-1">
                        {employee.cargo}
                      </p>
                    </div>
                  </div>
                )}

                {/* Fecha y Hora */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-[#9BE9FF] bg-opacity-20 p-3 rounded-lg">
                      <FaCalendar className="w-5 h-5 text-[#9BE9FF]" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Fecha
                      </label>
                      <p className="text-base font-semibold text-gray-900 mt-1">
                        {employee.fecha}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <FaClock className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Hora
                      </label>
                      <p className="text-base font-semibold text-gray-900 mt-1">
                        {employee.hora || `${employee.horaInicio} - ${employee.horaFin}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Área */}
                {employee.area && (
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <FaMapMarkerAlt className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Área
                      </label>
                      <p className="text-base font-semibold text-gray-900 mt-1">
                        {employee.area}
                      </p>
                    </div>
                  </div>
                )}

                {/* Estado */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                    Estado
                  </label>
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                      employee.estado === "Programado"
                        ? "bg-blue-100 text-blue-700"
                        : employee.estado === "Cancelado"
                        ? "bg-red-100 text-red-700"
                        : employee.estado === "Completado"
                        ? "bg-green-100 text-green-700"
                        : employee.estado === "En curso"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {employee.estado || "Sin estado"}
                  </span>
                </div>

                {/* Descripción (si NO está cancelado) */}
                {employee.estado !== "Cancelado" && (employee.descripcion || employee.observaciones) && (
                  <div className="bg-blue-50 border-l-4 border-[#9BE9FF] p-4 rounded-lg">
                    <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide block mb-2">
                      Descripción
                    </label>
                    <p className="text-sm text-blue-900 leading-relaxed">
                      {employee.descripcion || employee.observaciones}
                    </p>
                  </div>
                )}

                {/* Motivo de cancelación (solo si está cancelado) */}
                {employee.estado === "Cancelado" && employee.motivoCancelacion && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                    <label className="text-xs font-semibold text-red-700 uppercase tracking-wide block mb-2">
                      Motivo de Cancelación
                    </label>
                    <p className="text-sm text-red-900 leading-relaxed">
                      {employee.motivoCancelacion}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#9BE9FF] hover:bg-[#7dd3fc] text-gray-800 rounded-lg font-medium text-sm transition shadow-sm hover:shadow"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ScheduleDetailsModal;