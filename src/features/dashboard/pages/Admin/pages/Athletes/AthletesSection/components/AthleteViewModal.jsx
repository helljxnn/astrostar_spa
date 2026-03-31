"use client";

import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaTimes, FaUserShield
} from "react-icons/fa";

const AthleteViewModal = ({ isOpen, onClose, athlete, guardian, referenceData = { documentTypes: [] } }) => {
  if (!isOpen || !athlete) return null;

  // Mapear campos del backend al frontend
  const firstName = athlete.firstName || "";
  const middleName = athlete.middleName || "";
  const lastName = athlete.lastName || "";
  const secondLastName = athlete.secondLastName || "";
  const documento = athlete.identification || athlete.numeroDocumento || "N/A";
  const correo = athlete.email || athlete.correo || "N/A";
  const telefono = athlete.phoneNumber || athlete.telefono || "N/A";
  const direccion = athlete.address || athlete.direccion || "N/A";
  const fechaNacimiento = athlete.birthDate || athlete.fechaNacimiento || "";
  const categoria = athlete.categoria || "N/A";
  const estado = athlete.estado || "N/A";
  const scholarshipStatus = athlete.isScholarship === true ? "Sí" : "No";
  
  // Obtener el nombre del tipo de documento
  let tipoDocumento = "N/A";
  const documentTypeId = athlete.documentTypeId || athlete.tipoDocumento;
  
  if (documentTypeId && referenceData.documentTypes) {
    // Si es un ID numérico, buscar por ID
    if (!isNaN(documentTypeId)) {
      const docType = referenceData.documentTypes.find(dt => dt.id === parseInt(documentTypeId));
      if (docType) {
        tipoDocumento = docType.name || docType.label;
      }
    } else {
      // Si es un string, usarlo directamente o buscar por nombre
      const docType = referenceData.documentTypes.find(
        dt => dt.name?.toLowerCase() === documentTypeId.toLowerCase() ||
              dt.label?.toLowerCase() === documentTypeId.toLowerCase()
      );
      tipoDocumento = docType ? (docType.name || docType.label) : documentTypeId;
    }
  }

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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden relative flex flex-col"
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
                Detalles del Deportista
              </h2>
              <p className="text-center text-gray-600 mt-2">
                Información completa de:{" "}
                <span className="font-semibold text-primary-purple">
                  {[firstName, middleName, lastName, secondLastName].filter(Boolean).join(' ')}
                </span>
              </p>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Primer Nombre */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">
                    Primer Nombre
                  </label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {firstName || "N/A"}
                  </p>
                </motion.div>

                {/* Segundo Nombre */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">
                    Segundo Nombre
                  </label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {middleName || "No especificado"}
                  </p>
                </motion.div>

                {/* Primer Apellido */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">
                    Primer Apellido
                  </label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {lastName || "N/A"}
                  </p>
                </motion.div>

                {/* Segundo Apellido */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">
                    Segundo Apellido
                  </label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {secondLastName || "No especificado"}
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
                    {tipoDocumento}
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
                    {documento}
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
                    {correo}
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
                    {telefono}
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
                    {formatDate(fechaNacimiento)}
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
                    {calculateAge(fechaNacimiento)}
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
                    {categoria}
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
                    {estado}
                  </p>
                </motion.div>

                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.95, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">
                    Beca
                  </label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {scholarshipStatus}
                  </p>
                </motion.div>

                {/* Dirección */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">
                    Dirección
                  </label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {athlete.address || athlete.direccion || "N/A"}
                  </p>
                </motion.div>

              </div>

              {/* Motivo de Inactividad - Solo si está inactivo */}
              {(athlete.status === 'Inactive' || athlete.estado === 'Inactivo') && 
               (athlete.inactivityReason || athlete.motivoInactividad) && (
                <motion.div
                  className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.4 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-lg">⚠️</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-red-800 mb-1">
                        Motivo de Inactividad
                      </h4>
                      <p className="text-sm text-red-700">
                        {athlete.inactivityReason || athlete.motivoInactividad}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Información de Matrícula */}
              {(athlete.enrollment || athlete.matricula) && (
                <motion.div
                  className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.4 }}
                >
                  <h4 className="text-sm font-semibold text-purple-800 mb-3">
                    Información de Matrícula
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-purple-600">Estado</label>
                      <p className={`text-sm font-semibold mt-1 ${
                        (athlete.enrollment?.estado === 'Vigente' || athlete.matricula?.estado === 'Vigente')
                          ? 'text-green-700'
                          : 'text-red-700'
                      }`}>
                        {athlete.enrollment?.estado || athlete.matricula?.estado || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-purple-600">Fecha Inicio</label>
                      <p className="text-sm text-purple-900 mt-1">
                        {formatDate(athlete.enrollment?.fechaInicio || athlete.matricula?.fechaInicio)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-purple-600">Fecha Vencimiento</label>
                      <p className="text-sm text-purple-900 mt-1">
                        {formatDate(athlete.enrollment?.fechaVencimiento || athlete.matricula?.fechaVencimiento)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Información del Sistema */}
              {(athlete.createdAt || athlete.updatedAt) && (
                <motion.div
                  className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3, duration: 0.4 }}
                >
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    Información del Sistema
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {athlete.createdAt && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Fecha de Creación:</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {formatDate(athlete.createdAt)}
                        </p>
                      </div>
                    )}
                    {athlete.updatedAt && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Última Actualización:</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {formatDate(athlete.updatedAt)}
                        </p>
                      </div>
                    )}
                    {athlete.statusAssignedAt && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Estado Asignado:</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {formatDate(athlete.statusAssignedAt)}
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

export default AthleteViewModal;
