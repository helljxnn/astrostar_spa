"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const ProviderViewModal = ({ isOpen, onClose, provider }) => {
  if (!isOpen || !provider) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "No especificado";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric"
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
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
                Ver Proveedor
              </h2>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-3">
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
                      <span className="font-semibold text-primary-blue">
                        Persona Jurídica
                      </span>
                    ) : (
                      <span className="font-semibold text-primary-blue">
                        Persona Natural
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900">
                      {provider.estado || "N/A"}
                    </p>
                  </div>
                </motion.div>

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

              {/* Información Adicional (condicional) */}
              {(provider.servicios ||
                provider.observaciones ||
                provider.terminosPago ||
                provider.documentos) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  className="mt-6 pt-6 border-t border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Información Adicional
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

              {/* Información del Sistema*/}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mt-6 p-4 bg-gray-50 rounded-xl"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Información del Sistema
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Fecha de Creación:
                    </span>
                    <p className="text-gray-800">
                      {formatDate(provider.createdAt || provider.fechaRegistro)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Última Actualización:
                    </span>
                    <p className="text-gray-800">
                      {formatDate(provider.updatedAt)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Estado Asignado:
                    </span>
                    <p className="text-gray-800">
                      {formatDate(provider.statusAssignedAt || provider.updatedAt)}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-gray-200 p-3">
              <div className="flex justify-center">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors font-medium"
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