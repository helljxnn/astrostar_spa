import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, FileText, X, AlertCircle } from "lucide-react";

const CompleteAppointmentModal = ({ isOpen, onClose, onConfirm, appointmentData }) => {
  const [conclusion, setConclusion] = useState("");
  const [error, setError] = useState("");

  const minChars = 10;
  const maxChars = 500;
  const charCount = conclusion.length;
  const isValid = charCount >= minChars && charCount <= maxChars;

  const handleSubmit = () => {
    if (!conclusion.trim()) {
      setError("Debes ingresar una conclusión para completar la cita");
      return;
    }
    if (charCount < minChars) {
      setError(`La conclusión debe tener al menos ${minChars} caracteres`);
      return;
    }
    if (charCount > maxChars) {
      setError(`La conclusión no puede exceder ${maxChars} caracteres`);
      return;
    }
    onConfirm(conclusion);
    setConclusion("");
    setError("");
  };

  const handleClose = () => {
    setConclusion("");
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            style={{ zIndex: 99998 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <div 
            className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
            style={{ zIndex: 99999 }}
          >
            <motion.div
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl pointer-events-auto overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5 border-b border-green-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Completar Cita
                      </h2>
                      <p className="text-sm text-gray-600 mt-0.5">
                        Registra los resultados de la consulta
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
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Por favor, registre la conclusión o los resultados de la cita. Esta información será guardada en el historial médico.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Conclusión de la cita <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={conclusion}
                    onChange={(e) => {
                      if (e.target.value.length <= maxChars) {
                        setConclusion(e.target.value);
                        setError("");
                      }
                    }}
                    placeholder="Escribe la conclusión aquí..."
                    className={`w-full px-4 py-3 border rounded-xl resize-none focus:outline-none focus:ring-2 transition-all ${
                      error
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-200 focus:ring-primary-purple/30"
                    }`}
                    rows={5}
                    aria-label="Conclusión de la cita"
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
                          : 'Conclusión válida'
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
                      ? 'bg-primary-purple hover:bg-[#9d7bff]'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  Guardar y Completar
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CompleteAppointmentModal;
