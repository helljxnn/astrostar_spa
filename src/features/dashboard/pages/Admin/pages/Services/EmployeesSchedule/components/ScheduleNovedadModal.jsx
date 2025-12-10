import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaStickyNote } from "react-icons/fa";

const ScheduleNovedadModal = ({ isOpen, onClose, schedule }) => {
  if (!isOpen || !schedule) return null;

  const novedades = Array.isArray(schedule.novedades)
    ? schedule.novedades
    : schedule.novedad
    ? [schedule.novedad]
    : [];

  const handleKeyDown = (event) => event.key === "Escape" && onClose();
  const handleOverlayClick = (event) => event.target === event.currentTarget && onClose();

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
            className="relative z-10 w-full mx-4 max-w-2xl rounded-3xl border border-gray-100 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <FaStickyNote className="text-primary-purple" />
                Novedades del horario
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5 text-sm text-gray-800">
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                  {schedule.cargo || "Cargo no registrado"}
                </span>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                  {schedule.fecha || "Fecha sin definir"}
                </span>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                  {schedule.hora ||
                    `${schedule.horaInicio || ""}${
                      schedule.horaFin ? ` - ${schedule.horaFin}` : ""
                    }`}
                </span>
              </div>
              {novedades.length === 0 ? (
                <p className="text-gray-600">
                  No hay novedades registradas para este horario.
                </p>
              ) : (
                <ul className="space-y-3">
                  {novedades.map((item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="rounded-2xl border border-dashed border-primary-purple/40 bg-primary-purple/5 px-4 py-3 text-gray-800"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-end border-t border-gray-200 px-6 py-4 bg-gray-50">
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
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

export default ScheduleNovedadModal;
