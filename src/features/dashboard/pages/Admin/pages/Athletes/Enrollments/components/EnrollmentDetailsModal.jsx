import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCalendarAlt, FaUser, FaIdCard, FaCheckCircle, FaClock } from "react-icons/fa";
import { extractCreationDate } from "../utils/enrollmentDataExtractor.js";
import EnrollmentStatusBadge from "./EnrollmentStatusBadge.jsx";

const EnrollmentDetailsModal = ({ isOpen, onClose, athlete, enrollment }) => {
  if (!isOpen || !athlete || !enrollment) return null;

  // Extraer datos del atleta y matrícula
  const athleteData = athlete.athlete || athlete;
  const user = athleteData.user || athlete.user || {};
  const enrollmentData = enrollment || athlete.latestEnrollment || {};

  const nombreCompleto = `${user.firstName || athleteData.firstName || ""} ${user.lastName || athleteData.lastName || ""}`.trim() || "Sin nombre";
  const numeroDocumento = user.identification || athleteData.identification || athleteData.numeroDocumento || "Sin documento";
  const fechaCreacion = extractCreationDate(enrollmentData, athlete);
  const fechaActivacion = enrollmentData.fechaInicio ? new Date(enrollmentData.fechaInicio).toLocaleDateString("es-ES") : "No activada";
  const fechaVencimiento = enrollmentData.fechaVencimiento ? new Date(enrollmentData.fechaVencimiento).toLocaleDateString("es-ES") : "N/A";
  const estado = enrollmentData.estado || enrollmentData.status || "Sin estado";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long", 
      day: "numeric"
    });
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative flex flex-col"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-3 relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                onClick={onClose}
              >
                <FaTimes size={18} />
              </button>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
                Detalles de Matrícula
              </h2>
              <p className="text-center text-gray-600 mt-2">
                Información completa de:{" "}
                <span className="font-semibold text-primary-purple">
                  {nombreCompleto}
                </span>
              </p>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Información del Atleta */}
                <motion.div
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <FaUser className="text-primary-purple" />
                    Información del Atleta
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nombre completo:</label>
                      <p className="text-gray-900 p-2 bg-white rounded border border-gray-200 mt-1">
                        {nombreCompleto}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                        <FaIdCard className="w-3 h-3" />
                        Documento:
                      </label>
                      <p className="text-gray-900 font-mono p-2 bg-white rounded border border-gray-200 mt-1">
                        {numeroDocumento}
                      </p>
                    </div>
                    {athleteData.categoria && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Categoría:</label>
                        <p className="text-gray-900 p-2 bg-white rounded border border-gray-200 mt-1">
                          {athleteData.categoria}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Información de la Matrícula */}
                <motion.div
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <FaCalendarAlt className="text-primary-blue" />
                    Información de Matrícula
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Estado:</label>
                      <div className="mt-1">
                        <EnrollmentStatusBadge status={estado} />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fecha de creación:</label>
                      <p className="text-gray-900 p-2 bg-white rounded border border-gray-200 mt-1">
                        {fechaCreacion}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fecha de activación:</label>
                      <p className={`p-2 bg-white rounded border border-gray-200 mt-1 ${fechaActivacion === "No activada" ? "text-gray-400 italic" : "text-gray-900"}`}>
                        {fechaActivacion}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fecha de vencimiento:</label>
                      <p className="text-gray-900 p-2 bg-white rounded border border-gray-200 mt-1">
                        {fechaVencimiento}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Información Técnica - Solo para administradores */}
              {false && enrollmentData.id && (
                <motion.div
                  className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <FaCheckCircle className="text-green-600" />
                    Información Técnica
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">ID de Matrícula:</label>
                      <p className="text-gray-900 font-mono p-2 bg-white rounded border border-gray-200 mt-1">
                        #{enrollmentData.id}
                      </p>
                    </div>
                    {athleteData.id && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">ID de Atleta:</label>
                        <p className="text-gray-900 font-mono p-2 bg-white rounded border border-gray-200 mt-1">
                          #{athleteData.id}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Información del Sistema */}
              {(enrollmentData.createdAt || enrollmentData.updatedAt) && (
                <motion.div
                  className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <FaClock className="text-gray-600" />
                    Información del Sistema
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {enrollmentData.createdAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Fecha de Creación:</label>
                        <p className="text-gray-900 p-2 bg-white rounded border border-gray-200 mt-1">
                          {formatDate(enrollmentData.createdAt)}
                        </p>
                      </div>
                    )}
                    {enrollmentData.updatedAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Última Actualización:</label>
                        <p className="text-gray-900 p-2 bg-white rounded border border-gray-200 mt-1">
                          {formatDate(enrollmentData.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-gray-200 p-3">
              <div className="flex justify-center">
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-primary-blue text-white rounded-lg hover:opacity-90 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default EnrollmentDetailsModal;