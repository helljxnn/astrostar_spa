"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaTimes, FaUser, FaUserShield, FaIdCard, FaPhone, 
  FaEnvelope, FaCalendarAlt, FaTag, FaMapMarkerAlt, FaVenusMars 
} from "react-icons/fa";

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
        return "text-green-600 font-semibold";
      case "vencida":
        return "text-yellow-600 font-semibold";
      case "suspendida":
        return "text-orange-600 font-semibold";
      case "cancelada":
        return "text-red-600 font-semibold";
      default:
        return "text-gray-600 font-semibold";
    }
  };

  const getStateColor = (state) => {
    switch (state?.toLowerCase()) {
      case "activo":
        return "text-primary-purple font-semibold";
      case "inactivo":
        return "text-red-600 font-semibold";
      case "lesionado":
        return "text-yellow-600 font-semibold";
      case "suspendido":
        return "text-orange-600 font-semibold";
      default:
        return "text-gray-600 font-semibold";
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
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header - Mismo estilo que AthleteModal */}
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <FaTimes size={18} />
              </button>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
                Detalles del Deportista
              </h2>
              <p className="text-center text-gray-600 mt-2">
                Información completa de:{" "}
                <span className="font-semibold text-primary-purple">
                  {athlete.nombres} {athlete.apellidos}
                </span>
              </p>
            </div>

            {/* Body - Mismo estilo que AthleteModal */}
            <div className="p-6 space-y-6">
              {/* Información Personal - Mismo diseño de sección */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  Información Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre Completo */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      Nombres
                    </label>
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {athlete.nombres || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      Apellidos
                    </label>
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {athlete.apellidos || "N/A"}
                    </p>
                  </div>

                  {/* Documento */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      Tipo de Documento
                    </label>
                    <p className="text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {athlete.tipoDocumento ? 
                        athlete.tipoDocumento === "cedula" ? "Cédula de Ciudadanía" :
                        athlete.tipoDocumento === "tarjeta_identidad" ? "Tarjeta de Identidad" :
                        athlete.tipoDocumento === "cedula_extranjeria" ? "Cédula de Extranjería" :
                        athlete.tipoDocumento === "pasaporte" ? "Pasaporte" :
                        athlete.tipoDocumento : "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      Número de Documento
                    </label>
                    <p className="text-gray-900 font-mono p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {athlete.numeroDocumento || "N/A"}
                    </p>
                  </div>

                  {/* Fecha de Nacimiento y Edad */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      Fecha de Nacimiento
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">
                        {formatDate(athlete.fechaNacimiento)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {calculateAge(athlete.fechaNacimiento)}
                      </p>
                    </div>
                  </div>

                  {/* Género */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      Género
                    </label>
                    <p className="text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-200 capitalize">
                      {athlete.genero || "N/A"}
                    </p>
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      Categoría
                    </label>
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {athlete.categoria || "N/A"}
                    </p>
                  </div>

                  {/* Estado del Deportista */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      Estado del Deportista
                    </label>
                    <p className={`p-3 rounded-lg border border-gray-200 ${getStateColor(athlete.estado)}`}>
                      {athlete.estado || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  Información de Contacto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      Correo Electrónico
                    </label>
                    <p className="text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-200 break-all">
                      {athlete.correo || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      Teléfono
                    </label>
                    <p className="text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {athlete.telefono || "N/A"}
                    </p>
                  </div>

                  {athlete.direccion && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Dirección
                      </label>
                      <p className="text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {athlete.direccion}
                      </p>
                    </div>
                  )}

                  {athlete.ciudad && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Ciudad
                      </label>
                      <p className="text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {athlete.ciudad}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información del Acudiente - Mismo estilo de sección */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaUserShield className="text-primary-purple" />
                  Información del Acudiente
                </h3>
                
                {guardian ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Nombre Completo
                      </label>
                      <p className="text-gray-900 font-medium p-3 bg-white rounded-lg border border-gray-200">
                        {guardian.nombreCompleto}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Tipo de Documento
                      </label>
                      <p className="text-gray-900 p-3 bg-white rounded-lg border border-gray-200">
                        {guardian.tipoDocumento ? 
                          guardian.tipoDocumento === "cedula" ? "Cédula de Ciudadanía" :
                          guardian.tipoDocumento === "tarjeta_identidad" ? "Tarjeta de Identidad" :
                          guardian.tipoDocumento === "cedula_extranjeria" ? "Cédula de Extranjería" :
                          guardian.tipoDocumento === "pasaporte" ? "Pasaporte" :
                          guardian.tipoDocumento : "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Número de Documento
                      </label>
                      <p className="text-gray-900 font-mono p-3 bg-white rounded-lg border border-gray-200">
                        {guardian.identificacion || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Teléfono
                      </label>
                      <p className="text-gray-900 p-3 bg-white rounded-lg border border-gray-200">
                        {guardian.telefono || "N/A"}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Correo Electrónico
                      </label>
                      <p className="text-gray-900 p-3 bg-white rounded-lg border border-gray-200 break-all">
                        {guardian.correo || "N/A"}
                      </p>
                    </div>

                    {guardian.parentesco && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">
                          Parentesco
                        </label>
                        <p className="text-gray-900 p-3 bg-white rounded-lg border border-gray-200">
                          {guardian.parentesco}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaUserShield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Sin acudiente asignado</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Este deportista no tiene un acudiente registrado
                    </p>
                  </div>
                )}
              </div>

              {/* Información de Inscripción */}
              {athlete.inscripciones && athlete.inscripciones.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    Información de Inscripción
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Estado de Inscripción
                      </label>
                      <p className={`p-3 rounded-lg border border-gray-200 ${getStatusColor(athlete.estadoInscripcion)}`}>
                        {athlete.estadoInscripcion || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Fecha de Inscripción
                      </label>
                      <p className="text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {formatDate(athlete.inscripciones[0].fechaInscripcion)}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Concepto
                      </label>
                      <p className="text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {athlete.inscripciones[0].concepto || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Total de Inscripciones
                      </label>
                      <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {athlete.inscripciones.length}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Mismo estilo que AthleteModal */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-end"
              >
                <motion.button
                  onClick={onClose}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cerrar
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AthleteViewModal;