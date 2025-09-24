"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaUser, FaUserShield, FaIdCard, FaPhone, FaEnvelope, FaCalendarAlt, FaTag, FaInfoCircle } from "react-icons/fa";

const AthleteViewModal = ({ isOpen, onClose, athlete, guardian }) => {
  if (!isOpen || !athlete) return null;

  // Calcular edad actual
  const calculateAge = (birthDate) => {
    if (!birthDate) return "N/A";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} años`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long", 
      day: "numeric"
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "vigente":
        return "bg-green-100 text-green-800 border-green-200";
      case "vencida":
        return "bg-red-100 text-red-800 border-red-200";
      case "cancelada":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStateColor = (state) => {
    switch (state?.toLowerCase()) {
      case "activo":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactivo":
        return "bg-red-100 text-red-800 border-red-200";
      case "lesionado":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "suspendido":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <FaTimes size={18} />
              </button>

              <div className="flex items-center gap-4">
                <div className="rounded-full bg-gradient-to-r from-primary-purple to-primary-blue p-3 text-white">
                  <FaUser size={20} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                    Información del Deportista
                  </h2>
                  <p className="text-gray-600">
                    {athlete.nombres} {athlete.apellidos}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Información Personal */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaUser className="text-primary-purple" />
                  Información Personal
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FaUser className="text-gray-400 text-sm" />
                      <p className="text-sm font-medium text-gray-600">Nombre Completo</p>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {athlete.nombres} {athlete.apellidos}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FaIdCard className="text-gray-400 text-sm" />
                      <p className="text-sm font-medium text-gray-600">Documento</p>
                    </div>
                    <p className="text-gray-900 font-mono">
                      {athlete.tipoDocumento || "N/A"} - {athlete.numeroDocumento || "N/A"}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FaCalendarAlt className="text-gray-400 text-sm" />
                      <p className="text-sm font-medium text-gray-600">Fecha de Nacimiento</p>
                    </div>
                    <p className="text-gray-900">
                      {formatDate(athlete.fechaNacimiento)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {calculateAge(athlete.fechaNacimiento)}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FaPhone className="text-gray-400 text-sm" />
                      <p className="text-sm font-medium text-gray-600">Teléfono</p>
                    </div>
                    <p className="text-gray-900">{athlete.telefono || "N/A"}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FaEnvelope className="text-gray-400 text-sm" />
                      <p className="text-sm font-medium text-gray-600">Correo Electrónico</p>
                    </div>
                    <p className="text-gray-900">{athlete.correo || "N/A"}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FaTag className="text-gray-400 text-sm" />
                      <p className="text-sm font-medium text-gray-600">Categoría</p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {athlete.categoria || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Estados */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Estado del Deportista</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStateColor(athlete.estado)}`}>
                      {athlete.estado || "N/A"}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Estado de Inscripción</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(athlete.estadoInscripcion)}`}>
                      {athlete.estadoInscripcion || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información del Acudiente */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaUserShield className="text-primary-purple" />
                  Información del Acudiente
                </h3>
                
                {guardian ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FaUser className="text-gray-400 text-sm" />
                        <p className="text-sm font-medium text-gray-600">Nombre Completo</p>
                      </div>
                      <p className="text-gray-900 font-medium">{guardian.nombreCompleto}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FaIdCard className="text-gray-400 text-sm" />
                        <p className="text-sm font-medium text-gray-600">Documento</p>
                      </div>
                      <p className="text-gray-900 font-mono">
                        {guardian.tipoDocumento || "N/A"} - {guardian.identificacion || "N/A"}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FaPhone className="text-gray-400 text-sm" />
                        <p className="text-sm font-medium text-gray-600">Teléfono</p>
                      </div>
                      <p className="text-gray-900">{guardian.telefono || "N/A"}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FaEnvelope className="text-gray-400 text-sm" />
                        <p className="text-sm font-medium text-gray-600">Correo Electrónico</p>
                      </div>
                      <p className="text-gray-900">{guardian.correo || "N/A"}</p>
                    </div>

                    {guardian.parentesco && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <FaUserShield className="text-gray-400 text-sm" />
                          <p className="text-sm font-medium text-gray-600">Parentesco</p>
                        </div>
                        <p className="text-gray-900">{guardian.parentesco}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaUserShield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Sin acudiente asignado</p>
                  </div>
                )}
              </div>

              {/* Información de Inscripciones */}
              {athlete.inscripciones && athlete.inscripciones.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaInfoCircle className="text-primary-purple" />
                    Última Inscripción
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {athlete.inscripciones[0] && (
                      <>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Fecha de Inscripción</p>
                          <p className="text-gray-900">{formatDate(athlete.inscripciones[0].fechaInscripcion)}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Estado</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(athlete.inscripciones[0].estadoInscripcion)}`}>
                            {athlete.inscripciones[0].estadoInscripcion || "N/A"}
                          </span>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Concepto</p>
                          <p className="text-gray-900">{athlete.inscripciones[0].concepto || "N/A"}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Total de Inscripciones</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                            {athlete.inscripciones.length} inscripción{athlete.inscripciones.length !== 1 ? "es" : ""}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <div className="flex justify-center">
                <motion.button
                  onClick={onClose}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cerrar
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AthleteViewModal;