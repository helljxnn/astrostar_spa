import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";
import { useState, useEffect } from "react";

/**
 * Modal para cancelar horario con motivo (diseño estilo Editar Horario)
 */
const CancelScheduleModal = ({ isOpen, onClose, onConfirm, employee }) => {
  const [cancelReason, setCancelReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setCancelReason("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen || !employee) return null;

  const handleSubmit = () => {
    if (!cancelReason.trim()) {
      setError("El motivo de cancelación es obligatorio");
      return;
    }

    onConfirm({ ...employee, motivoCancelacion: cancelReason.trim() });
    setCancelReason("");
    setError("");
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-2xl font-bold text-sky-400">Cancelar Horario</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-purple-100 rounded-full transition"
              >
                <FaTimes className="w-5 h-5 text-purple-500" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 grid grid-cols-1 gap-5">
              <div className="bg-sky-50 border-l-4 border-sky-400 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  ¿Está seguro de cancelar el horario de{" "}
                  <span className="font-semibold">{employee.empleado}</span> el{" "}
                  <span className="font-semibold">{employee.fecha}</span>?
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Motivo de la cancelación <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => {
                    setCancelReason(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Describa el motivo..."
                  rows={5}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    error
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-sky-400 focus:border-sky-400"
                  } text-sm focus:ring-2 focus:outline-none transition`}
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-600 mt-2 flex items-center gap-1"
                  >
                    <FaExclamationTriangle className="w-3 h-3" />
                    {error}
                  </motion.p>
                )}
              </div>

              <div className="text-right">
                <span
                  className={`text-xs ${
                    cancelReason.length < 10 ? "text-gray-400" : "text-green-600"
                  }`}
                >
                  {cancelReason.length} caracteres
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!cancelReason.trim()}
                className="px-5 py-2.5 bg-sky-400 hover:bg-sky-500 text-white rounded-lg font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Confirmar Cancelación
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CancelScheduleModal;
