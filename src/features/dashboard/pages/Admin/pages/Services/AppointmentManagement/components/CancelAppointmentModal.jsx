import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, AlertCircle, X } from "lucide-react";

const CancelAppointmentModal = ({ isOpen, onClose, onConfirm, appointmentData }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const minChars = 10;
  const maxChars = 500;
  const charCount = reason.length;
  const isValid = charCount >= minChars && charCount <= maxChars;

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError("Debes ingresar un motivo de cancelación");
      return;
    }
    if (charCount < minChars) {
      setError(`El motivo debe tener al menos ${minChars} caracteres`);
      return;
    }
    if (charCount > maxChars) {
      setError(`El motivo no puede exceder ${maxChars} caracteres`);
      return;
    }
    onConfirm(reason);
    setReason("");
    setError("");
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  if (typeof document === "undefined") return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <div className="pointer-events-none w-full flex items-center justify-center">
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl pointer-events-auto overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-5 border-b border-red-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Cancelar Cita
                      </h2>
                      <p className="text-sm text-gray-600 mt-0.5">
                        Esta acción no se puede deshacer
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Cerrar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    Por favor, indique el motivo de la cancelación. Esta información será registrada en el historial de la cita.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Motivo de cancelación <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => {
                      if (e.target.value.length <= maxChars) {
                        setReason(e.target.value);
                        setError("");
                      }
                    }}
                    placeholder="Escribe el motivo aquí..."
                    className={`w-full px-4 py-3 border rounded-xl resize-none focus:outline-none focus:ring-2 transition-all ${
                      error
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-200 focus:ring-primary-purple/30"
                    }`}
                    rows={4}
                    aria-label="Motivo de cancelación"
                  />
                  <div className="flex items-center justify-between mt-2">
                    {error ? (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </p>
                    ) : (
                      <p className={`text-sm ${charCount < minChars ? 'text-amber-600' : 'text-gray-500'}`}>
                        {charCount < minChars 
                          ? `Mínimo ${minChars} caracteres (faltan ${minChars - charCount})`
                          : 'Motivo válido'
                        }
                      </p>
                    )}
                    <p className={`text-sm ${charCount > maxChars * 0.9 ? 'text-amber-600' : 'text-gray-500'}`}>
                      {charCount}/{maxChars}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Volver
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isValid}
                  className={`px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm ${
                    isValid
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  Cancelar Cita
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default CancelAppointmentModal;

