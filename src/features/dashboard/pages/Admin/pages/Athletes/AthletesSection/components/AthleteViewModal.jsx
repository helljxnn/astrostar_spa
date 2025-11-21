"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaTimes, FaUserShield
} from "react-icons/fa";

const AthleteViewModal = ({ isOpen, onClose, athlete, guardian }) => {
  if (!isOpen || !athlete) return null;

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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden relative flex flex-col"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
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
                Detalles del Deportista
              </h2>
              <p className="text-center text-gray-600 mt-2">
                Información completa de:{" "}
                <span className="font-semibold text-primary-purple">
                  {athlete.nombres} {athlete.apellidos}
                </span>
              </p>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Nombres */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">
                    Nombres
                  </label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {athlete.nombres || "N/A"}
                  </p>
                </motion.div>

                {/* Apellidos */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">
                    Apellidos
                  </label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {athlete.apellidos || "N/A"}
                  </p>
                </motion.div>

                {/* Tipo de Documento */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">
                    Tipo de Documento
                  </label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {athlete.tipoDocumento ? 
                      athlete.tipoDocumento === "cedula" ? "Cédula de Ciudadanía" :
                      athlete.tipoDocumento === "tarjeta_identidad" ? "Tarjeta de Identidad" :
                      athlete.tipoDocumento === "cedula_extranjeria" ? "Cédula de Extranjería" :
                      athlete.tipoDocumento === "pasaporte" ? "Pasaporte" :
                      athlete.tipoDocumento : "N/A"}
                  </p>
                </motion.div>

                {/* Número de Documento */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">
                    Número de Documento
                  </label>
                  <p className="text-gray-900 font-mono p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {athlete.numeroDocumento || "N/A"}
                  </p>
                </motion.div>

                {/* Correo */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">
                    Correo Electrónico
                  </label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px] break-all">
                    {athlete.correo || "N/A"}
                  </p>
                </motion.div>

                {/* Teléfono */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">
                    Teléfono
                  </label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {athlete.telefono || "N/A"}
                  </p>
                </motion.div>

                {/* Fecha de Nacimiento */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">
                    Fecha de Nacimiento
                  </label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {formatDate(athlete.fechaNacimiento)}
                  </p>
                </motion.div>

                {/* Edad */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">
                    Edad
                  </label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {calculateAge(athlete.fechaNacimiento)}
                  </p>
                </motion.div>

                {/* Categoría */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">
                    Categoría
                  </label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {athlete.categoria || "N/A"}
                  </p>
                </motion.div>

                {/* Estado */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">
                    Estado del Deportista
                  </label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {athlete.estado || "N/A"}
                  </p>
                </motion.div>

                {/* Información del Acudiente */}
                <motion.div
                  className="md:col-span-2 lg:col-span-3 space-y-2 mt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <FaUserShield className="text-primary-purple" />
                    Información del Acudiente
                  </label>
                  
                  {guardian ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Nombre Completo del Acudiente */}
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1, duration: 0.4 }}
                      >
                        <label className="text-xs font-medium text-gray-600">
                          Nombre Completo
                        </label>
                        <p className="text-gray-900 p-2 bg-white rounded-lg border border-gray-200 min-h-[42px]">
                          {guardian.nombreCompleto}
                        </p>
                      </motion.div>

                      {/* Tipo de Documento del Acudiente */}
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.4 }}
                      >
                        <label className="text-xs font-medium text-gray-600">
                          Tipo de Documento
                        </label>
                        <p className="text-gray-900 p-2 bg-white rounded-lg border border-gray-200 min-h-[42px]">
                          {guardian.tipoDocumento ? 
                            guardian.tipoDocumento === "cedula" ? "Cédula de Ciudadanía" :
                            guardian.tipoDocumento === "tarjeta_identidad" ? "Tarjeta de Identidad" :
                            guardian.tipoDocumento === "cedula_extranjeria" ? "Cédula de Extranjería" :
                            guardian.tipoDocumento === "pasaporte" ? "Pasaporte" :
                            guardian.tipoDocumento : "N/A"}
                        </p>
                      </motion.div>

                      {/* Número de Documento del Acudiente */}
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3, duration: 0.4 }}
                      >
                        <label className="text-xs font-medium text-gray-600">
                          Número de Documento
                        </label>
                        <p className="text-gray-900 font-mono p-2 bg-white rounded-lg border border-gray-200 min-h-[42px]">
                          {guardian.identificacion || "N/A"}
                        </p>
                      </motion.div>

                      {/* Teléfono del Acudiente */}
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4, duration: 0.4 }}
                      >
                        <label className="text-xs font-medium text-gray-600">
                          Teléfono
                        </label>
                        <p className="text-gray-900 p-2 bg-white rounded-lg border border-gray-200 min-h-[42px]">
                          {guardian.telefono || "N/A"}
                        </p>
                      </motion.div>

                      {/* Correo del Acudiente */}
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 0.4 }}
                      >
                        <label className="text-xs font-medium text-gray-600">
                          Correo Electrónico
                        </label>
                        <p className="text-gray-900 p-2 bg-white rounded-lg border border-gray-200 min-h-[42px] break-all">
                          {guardian.correo || "N/A"}
                        </p>
                      </motion.div>

                      {/* Parentesco - ESTE ES EL CAMPO NUEVO/ARREGLADO */}
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.6, duration: 0.4 }}
                      >
                        <label className="text-xs font-medium text-gray-600">
                          Parentesco con el Deportista
                        </label>
                        <p className="text-gray-900 p-2 bg-white rounded-lg border border-gray-200 min-h-[42px] font-medium text-primary-purple">
                          {/* Mostrar el parentesco del deportista, no del acudiente */}
                          {athlete.parentesco || "N/A"}
                        </p>
                      </motion.div>
                    </div>
                  ) : (
                    <motion.div
                      className="text-center py-4 p-2 bg-gray-50 rounded-lg border border-gray-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1, duration: 0.4 }}
                    >
                      <FaUserShield className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Sin acudiente asignado</p>
                    </motion.div>
                  )}
                </motion.div>
              </div>
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
};

export default AthleteViewModal;