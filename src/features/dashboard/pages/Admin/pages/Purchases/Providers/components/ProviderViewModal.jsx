"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaTag,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaIdCard,
} from "react-icons/fa";

const ProviderViewModal = ({ isOpen, onClose, provider }) => {
  if (!isOpen || !provider) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "activo":
        return "text-green-600 font-semibold";
      case "inactivo":
        return "text-red-600 font-semibold";
      case "suspendido":
        return "text-orange-600 font-semibold";
      case "pendiente":
        return "text-yellow-600 font-semibold";
      default:
        return "text-gray-600 font-semibold";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "activo":
        return <FaCheckCircle className="text-green-600" />;
      case "inactivo":
        return <FaExclamationTriangle className="text-red-600" />;
      case "suspendido":
        return <FaExclamationTriangle className="text-orange-600" />;
      case "pendiente":
        return <FaExclamationTriangle className="text-yellow-600" />;
      default:
        return <FaExclamationTriangle className="text-gray-600" />;
    }
  };

  const formatPhoneDisplay = (phone) => {
    if (!phone) return "N/A";
    return phone;
  };

  const getDocumentTypeLabel = (docType) => {
    const types = {
      CC: "Cédula de ciudadanía",
      TI: "Tarjeta de identidad",
      CE: "Cédula de extranjería",
      PAS: "Pasaporte",
    };
    return types[docType] || docType;
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
                onClick={onClose}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
              >
                <FaTimes size={18} />
              </button>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
                Detalles del Proveedor
              </h2>
              <p className="text-center text-gray-600 mt-2">
                Información completa de:{" "}
                <span className="font-semibold text-primary-purple">
                  {provider.razonSocial}
                </span>
              </p>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-3">
              {/* Tipo de Entidad */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="mb-3"
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Entidad
                </label>
                <div className="p-3 bg-gradient-to-br from-primary-blue/10 to-primary-purple/10 rounded-lg border-2 border-primary-blue/30">
                  <div className="flex items-center gap-2">
                    {provider.tipoEntidad === "juridica" ? (
                      <>
                        <FaBuilding className="text-primary-blue" />
                        <span className="font-semibold text-primary-blue">
                          Persona Jurídica
                        </span>
                      </>
                    ) : (
                      <>
                        <FaUser className="text-primary-blue" />
                        <span className="font-semibold text-primary-blue">
                          Persona Natural
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Grid de campos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Razón Social o Nombre */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {provider.tipoEntidad === "juridica"
                      ? "Razón Social"
                      : "Nombre Completo"}
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900 font-medium">
                      {provider.razonSocial || "N/A"}
                    </p>
                  </div>
                </motion.div>

                {/* Tipo de Documento - Solo para Persona Natural */}
                {provider.tipoEntidad === "natural" &&
                  provider.tipoDocumento && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.4 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de documento
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-900">
                          {getDocumentTypeLabel(provider.tipoDocumento)}
                        </p>
                      </div>
                    </motion.div>
                  )}

                {/* NIT o Identificación */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {provider.tipoEntidad === "juridica"
                      ? "NIT"
                      : "Identificación"}
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900 font-mono">
                      {provider.nit || "N/A"}
                    </p>
                  </div>
                </motion.div>

                {/* Contacto Principal */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contacto Principal
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900">
                      {provider.contactoPrincipal || "N/A"}
                    </p>
                  </div>
                </motion.div>

                {/* Correo Electrónico */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900 break-all text-sm">
                      {provider.correo || "N/A"}
                    </p>
                  </div>
                </motion.div>

                {/* Teléfono */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número Telefónico
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900">
                      {formatPhoneDisplay(provider.telefono)}
                    </p>
                  </div>
                </motion.div>

                {/* Dirección */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900">
                      {provider.direccion || "N/A"}
                    </p>
                  </div>
                </motion.div>

                {/* Ciudad */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900">{provider.ciudad || "N/A"}</p>
                  </div>
                </motion.div>

                {/* Estado */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900">{provider.estado || "N/A"}</p>
                  </div>
                </motion.div>

                {/* Descripción */}
                <motion.div
                  className="lg:col-span-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65, duration: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[80px]">
                    <p className="text-gray-900 whitespace-pre-line">
                      {provider.descripcion || "Sin descripción"}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Información Adicional (si existe) */}
              {(provider.fechaRegistro ||
                provider.servicios ||
                provider.observaciones ||
                provider.terminosPago ||
                provider.documentos) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  className="mt-6 pt-6 border-t border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaTag className="text-primary-purple" />
                    Información Adicional
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Fecha de Registro */}
                    {provider.fechaRegistro && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de Registro
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-900">
                            {formatDate(provider.fechaRegistro)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Términos de Pago */}
                    {provider.terminosPago && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Términos de Pago
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-900">
                            {provider.terminosPago}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Servicios */}
                    {provider.servicios && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Servicios Ofrecidos
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-900 whitespace-pre-line">
                            {provider.servicios}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Observaciones */}
                    {provider.observaciones && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Observaciones
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-900 whitespace-pre-line">
                            {provider.observaciones}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Documentos */}
                    {provider.documentos && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Documentos Adjuntos
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-900">{provider.documentos}</p>
                        </div>
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
};

export default ProviderViewModal;
