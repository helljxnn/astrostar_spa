import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";

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
    "Sin descripcion registrada.";

  const observationText =
    employee.descripcion ||
    employee.observaciones ||
    employee.motivoCancelacion ||
    "Sin observaciones registradas.";

  const showObservation =
    observationText && observationText !== descripcionFinal;

  const scheduleTimeLabel =
    employee.hora ||
    [employee.horaInicio, employee.horaFin].filter(Boolean).join(" - ") ||
    "Sin horario asignado";

  const cargoKey = String(employee.cargo || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  const isHealthProfessionalCargo =
    cargoKey === "profesional de la salud" || cargoKey === "profesional de salud";

  const specialtyLabel =
    employee.specialtyLabel ||
    ({
      psicologia: "Psicologia",
      fisioterapia: "Fisioterapia",
      nutricion: "Nutricion",
    }[employee.specialty] || "");

  const detailFields = [
    { key: "empleado", label: "Empleado", value: employee.empleado },
    {
      key: "cargo",
      label: "Cargo",
      value: employee.cargo || "Sin cargo asignado",
    },
    ...(isHealthProfessionalCargo
      ? [
          {
            key: "specialty",
            label: "Especialidad",
            value: specialtyLabel || "Sin especialidad",
          },
        ]
      : []),
    ...(employee.area
      ? [
          {
            key: "area",
            label: "Area",
            value: employee.area,
          },
        ]
      : []),
    {
      key: "fecha",
      label: "Fecha",
      value: employee.fecha || "Sin fecha registrada",
    },
    {
      key: "hora",
      label: "Horario",
      value: scheduleTimeLabel,
    },
    {
      key: "repeticion",
      label: "Repeticion",
      value: employee.recurrenceLabel || "No se repite",
    },
  ];

  const noveltyList = (
    Array.isArray(employee.novedades)
      ? employee.novedades
      : employee.novedades
      ? [employee.novedades]
      : employee.novedad
      ? [employee.novedad]
      : []
  ).filter(Boolean);

  const hasNovedades = noveltyList.length > 0;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[2000]"
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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden relative flex flex-col"
          >
            <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                aria-label="Cerrar"
              >
                <FaTimes className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
                Detalles del Horario
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {detailFields.map((field) => (
                  <ReadOnlyField
                    key={field.key}
                    label={field.label}
                    value={field.value}
                  />
                ))}
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-sm font-semibold text-gray-500 mb-2">
                    Descripcion
                  </p>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {descripcionFinal}
                  </p>
                  {showObservation && (
                    <>
                      <p className="text-sm font-semibold text-gray-500 mt-4 mb-2">
                        Observaciones / Motivo
                      </p>
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {observationText}
                      </p>
                    </>
                  )}
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-sm font-semibold text-gray-500 mb-2">
                    Novedades del horario
                  </p>
                  {hasNovedades ? (
                    <ul className="space-y-2 text-sm text-gray-800">
                      {noveltyList.map((item, index) => (
                        <li
                          key={`${item}-${index}`}
                          className="flex items-start gap-2"
                        >
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary-purple" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Sin novedades registradas.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 border-t border-gray-200 p-6">
              <div className="flex justify-center">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

const ReadOnlyField = ({ label, value }) => {
  const displayValue =
    value === null || value === undefined || value === ""
      ? "No especificado"
      : value;

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 min-h-[48px] flex items-center">
        {displayValue}
      </div>
    </div>
  );
};

export default ScheduleDetailsModal;
