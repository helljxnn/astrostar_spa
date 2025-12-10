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

  const displayState =
    employee.estado === "Cancelado"
      ? "Programado"
      : employee.estado || "Sin estado";
  const stateColor =
    displayState === "Completado"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-blue-100 text-blue-700";

  const scheduleTimeLabel =
    employee.hora ||
    [employee.horaInicio, employee.horaFin].filter(Boolean).join(" - ") ||
    "Sin horario asignado";
  const observationText =
    employee.descripcion ||
    employee.observaciones ||
    employee.motivoCancelacion ||
    "Sin observaciones registradas.";
  const detailFields = [
    {
      key: "cargo",
      label: "Cargo",
      value: employee.cargo || "Sin cargo asignado",
      icon: <FaBriefcase className="w-4 h-4 text-primary-purple" />,
    },
    ...(employee.area
      ? [
          {
            key: "area",
            label: "Área",
            value: employee.area,
            icon: <FaMapMarkerAlt className="w-4 h-4 text-primary-purple" />,
          },
        ]
      : []),
    {
      key: "fecha",
      label: "Fecha",
      value: employee.fecha || "Sin fecha registrada",
      icon: <FaCalendar className="w-4 h-4 text-primary-purple" />,
    },
    {
      key: "hora",
      label: "Horario",
      value: scheduleTimeLabel,
      icon: <FaClock className="w-4 h-4 text-primary-purple" />,
    },
    {
      key: "repeticion",
      label: "Repetición",
      value: employee.recurrenceLabel || "No se repite",
      icon: <FaRedo className="w-4 h-4 text-primary-purple" />,
    },
  ];
  const noveltyList = (
    Array.isArray(employee.novedades) ? employee.novedades : [employee.novedad]
  ).filter(Boolean);
  const hasNovedades = noveltyList.length > 0;

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
              <div className="rounded-3xl border border-gray-100 bg-gradient-to-r from-primary-purple/10 to-primary-blue/10 p-5 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Empleado
                    </p>
                    <h3 className="text-2xl font-semibold text-gray-900">
                      {employee.empleado}
                    </h3>
                  </div>
                  <span className={`px-4 py-1.5 text-xs font-semibold rounded-full ${stateColor}`}>
                    {displayState}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
                  {descripcionFinal}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {detailFields.map((field) => (
                  <div
                    key={field.key}
                    className="rounded-2xl border border-gray-200 bg-white/90 shadow-sm p-4 flex items-start gap-3"
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/90 border border-gray-100 text-primary-purple/90">
                      {field.icon}
                    </span>
                    <div className="flex-1">
                      <p className="text-[11px] uppercase tracking-wider text-gray-500">
                        {field.label}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {field.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <FaFileAlt className="w-4 h-4 text-primary-purple" />
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Observaciones / Descripción
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700">{observationText}</p>
                </div>

                <div className="rounded-2xl border border-primary-purple/40 bg-primary-purple/5 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-purple" />
                    <p className="text-xs uppercase tracking-wider text-primary-purple font-semibold">
                      Novedades del horario
                    </p>
                  </div>
                  {hasNovedades ? (
                    noveltyList.map((item, index) => (
                      <p
                        key={`${item}-${index}`}
                        className="text-sm text-gray-800 leading-relaxed flex items-start gap-2"
                      >
                        <span className="w-2 h-2 mt-1 rounded-full bg-primary-purple" />
                        <span>{item}</span>
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-gray-700">Sin novedades registradas.</p>
                  )}
                </div>
              </div>
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
