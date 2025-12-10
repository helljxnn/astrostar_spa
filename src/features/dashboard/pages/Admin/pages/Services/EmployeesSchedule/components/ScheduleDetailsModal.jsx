import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaCalendar,
  FaClock,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaBriefcase,
  FaFileAlt,
  FaRedo,
} from "react-icons/fa";

const ScheduleDetailsModal = ({ isOpen, onClose, employee }) => {
  if (!isOpen || !employee) return null;

  const handleKeyDown = (e) => e.key === "Escape" && onClose();
  const handleOverlayClick = (e) => e.target === e.currentTarget && onClose();

  const descripcionFinal =
    employee.descripcionEmpleado ||
    employee.descripcion ||
    employee.observaciones ||
    employee.detalle ||
    employee.motivo ||
    "Sin descripción registrada.";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden border border-gray-100 flex flex-col"
          >
            <div className="flex-shrink-0 relative px-6 py-5 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-primary-purple to-primary-blue text-transparent bg-clip-text flex items-center justify-center gap-3">
                <FaInfoCircle className="text-primary-purple" />
                Detalles del Horario
              </h2>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="modal-body px-6 py-6 space-y-6 text-gray-800">
              <div className="border-b border-gray-100 pb-5">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {employee.empleado}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed max-w-2xl">
                  {descripcionFinal}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {employee.cargo && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                      Cargo
                    </label>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                      <FaBriefcase className="text-[#2B6CB0]" />
                      <span className="font-medium text-gray-800">
                        {employee.cargo}
                      </span>
                    </div>
                  </div>
                )}

                {employee.area && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                      Área
                    </label>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                      <FaMapMarkerAlt className="text-[#2B6CB0]" />
                      <span>{employee.area}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                    Fecha
                  </label>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <FaCalendar className="text-[#2B6CB0]" />
                    <span>{employee.fecha}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                    Hora
                  </label>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <FaClock className="text-[#2B6CB0]" />
                    <span>
                      {employee.hora ||
                        `${employee.horaInicio || ""}${
                          employee.horaFin ? ` - ${employee.horaFin}` : ""
                        }`}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                    Repeticion
                  </label>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <FaRedo className="text-[#2B6CB0]" />
                    <span>{employee.recurrenceLabel || "No se repite"}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                    Estado
                  </label>
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                      employee.estado === "Programado"
                        ? "bg-blue-100 text-blue-700"
                        : employee.estado === "Cancelado"
                        ? "bg-red-100 text-red-700"
                        : employee.estado === "Completado"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {employee.estado || "Sin estado"}
                  </span>
                </div>
              </div>

              {(employee.descripcion ||
                employee.observaciones ||
                employee.motivoCancelacion) && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                    {employee.estado === "Cancelado"
                      ? "Motivo de Cancelación"
                      : "Observaciones / Descripción"}
                  </label>
                  <div
                    className={`flex items-start gap-3 p-5 rounded-lg border text-sm leading-relaxed ${
                      employee.estado === "Cancelado"
                        ? "bg-red-50 border-red-300 text-red-900"
                        : "bg-gray-50 border-gray-200 text-gray-800"
                    }`}
                  >
                    <FaFileAlt
                      className={`w-5 h-5 mt-1 ${
                        employee.estado === "Cancelado"
                          ? "text-red-600"
                          : "text-[#2B6CB0]"
                      }`}
                    />
                    <p>
                      {employee.motivoCancelacion ||
                        employee.descripcion ||
                        employee.observaciones}
                    </p>
                  </div>
                </div>
              )}
              {(employee.novedades?.length || employee.novedad) && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                    Novedades del horario
                  </label>
                  <div className="flex flex-col gap-2 p-4 rounded-lg border border-dashed border-primary-purple/30 bg-primary-purple/5 text-sm text-gray-800">
                    {(Array.isArray(employee.novedades)
                      ? employee.novedades
                      : [employee.novedad])
                      .filter(Boolean)
                      .map((item, index) => (
                        <p key={`${item}-${index}`} className="flex items-start gap-2">
                          <span className="w-2 h-2 mt-1 rounded-full bg-primary-purple" />
                          <span>{item}</span>
                        </p>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition font-medium"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScheduleDetailsModal;
