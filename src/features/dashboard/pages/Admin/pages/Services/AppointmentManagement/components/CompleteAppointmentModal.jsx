import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, FileText, X, AlertCircle } from "lucide-react";

const CompleteAppointmentModal = ({ isOpen, onClose, onConfirm, appointmentData }) => {
  const [conclusion, setConclusion] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const minChars = 10;
  const maxChars = 500;
  const charCount = conclusion.length;
  const isValid = charCount >= minChars && charCount <= maxChars;

  const handleSubmit = async () => {
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
    
    setUploading(true);
    try {
      await onConfirm(conclusion, false, null);
      setConclusion("");
      setError("");
    } catch (err) {
      setError(err.message || 'Error al completar la cita');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setConclusion("");
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
                    Por favor, registre una conclusión detallada de la cita con el deportista.
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
                    placeholder="Describa los resultados y observaciones de la consulta..."
                    className={`w-full px-4 py-3 border rounded-xl resize-none focus:outline-none focus:ring-2 transition-all ${
                      error
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-200 focus:ring-primary-purple/30"
                    }`}
                    rows={6}
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
                  disabled={!isValid || uploading}
                  className={`px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm ${
                    isValid && !uploading
                      ? 'bg-primary-purple hover:bg-[#9d7bff]'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {uploading ? 'Guardando...' : 'Guardar y Completar'}
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

export default CompleteAppointmentModal;
