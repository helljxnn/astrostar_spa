import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaCalendar,
  FaClock,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaBriefcase,
  FaFileAlt,
} from "react-icons/fa";

const ScheduleDetailsModal = ({ isOpen, onClose, employee }) => {
  if (!isOpen || !employee) return null;

  const handleKeyDown = (e) => e.key === "Escape" && onClose();
  const handleOverlayClick = (e) => e.target === e.currentTarget && onClose();

  // 🔹 Normalizamos la descripción para evitar que salga vacía
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
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden"
          >
            {/* 🔹 HEADER azul claro */}
            <div className="flex justify-between items-center px-8 py-5 border-b border-gray-200 bg-[#9BE9FF]">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                <FaInfoCircle className="text-gray-800" />
                Detalles del Horario
              </h2>
              <button
                onClick={onClose}
                className="text-gray-700 hover:text-black transition p-2 rounded-full hover:bg-black/10"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            {/* BODY */}
            <div className="p-8 space-y-8 text-gray-800">
              {/* Datos principales */}
              <div className="border-b border-gray-100 pb-5">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {employee.empleado}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed max-w-2xl">
                  {descripcionFinal}
                </p>
              </div>

              {/* Información General */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Cargo */}
                {employee.cargo && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                      Cargo
                    </label>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                      <FaBriefcase className="text-[#007bb5]" />
                      <span className="font-medium text-gray-800">
                        {employee.cargo}
                      </span>
                    </div>
                  </div>
                )}

                {/* Área */}
                {employee.area && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                      Área
                    </label>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                      <FaMapMarkerAlt className="text-[#007bb5]" />
                      <span>{employee.area}</span>
                    </div>
                  </div>
                )}

                {/* Fecha */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                    Fecha
                  </label>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <FaCalendar className="text-[#007bb5]" />
                    <span>{employee.fecha}</span>
                  </div>
                </div>

                {/* Hora */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                    Hora
                  </label>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <FaClock className="text-[#007bb5]" />
                    <span>
                      {employee.hora ||
                        `${employee.horaInicio || ""} ${
                          employee.horaFin ? `- ${employee.horaFin}` : ""
                        }`}
                    </span>
                  </div>
                </div>

                {/* Estado */}
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

              {/* Descripción / Observaciones */}
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
                          : "text-[#007bb5]"
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
            </div>

            {/* FOOTER */}
            <div className="px-8 py-5 bg-gray-50 border-t flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition font-medium"
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
