import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";
import { useState, useEffect } from "react";

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
      setError("El motivo de cancelacion es obligatorio");
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#6C7EFF] to-[#8AD7FF] text-white">
              <div className="flex items-center gap-3">
                <FaExclamationTriangle className="w-5 h-5" />
                <div>
                  <p className="text-xs uppercase tracking-wide opacity-80">Cancelar horario</p>
                  <p className="text-lg font-semibold">Confirmar accion</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                <p className="text-sm text-gray-700">
                  Esta seguro de cancelar el horario de <span className="font-semibold">{employee.empleado}</span>
                  {employee.cargo ? ` (${employee.cargo})` : ""} el <span className="font-semibold">{employee.fecha}</span>?
                </p>
                {employee.hora && (
                  <p className="text-xs text-gray-600 mt-1">Hora: {employee.hora}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Motivo de la cancelacion <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => {
                    setCancelReason(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Describa el motivo..."
                  rows={5}
                  className={`w-full px-4 py-3 rounded-lg border text-sm focus:ring-2 focus:outline-none transition ${
                    error
                      ? "border-red-300 focus:ring-red-400 focus:border-red-400"
                      : "border-gray-300 focus:ring-[#7B61FF] focus:border-[#7B61FF]"
                  }`}
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
                <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                  <span>{cancelReason.length} caracteres</span>
                  <span>
                    Estado actual: <strong className="text-gray-700">{employee.estado || "Programado"}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium text-sm transition hover:bg-gray-100"
              >
                Cerrar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!cancelReason.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-[#6C7EFF] to-[#5B8DEF] text-white rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed shadow"
              >
                Confirmar cancelacion
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CancelScheduleModal;
