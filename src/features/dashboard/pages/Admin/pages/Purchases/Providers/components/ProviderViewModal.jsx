"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaTimes, FaBuilding, FaPhone, FaEnvelope, 
  FaUser, FaTag, FaMapMarkerAlt, FaCheckCircle,
  FaExclamationTriangle, FaIdCard
} from "react-icons/fa";

const ProviderViewModal = ({ isOpen, onClose, provider }) => {
  if (!isOpen || !provider) return null;

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
      "CC": "Cédula de ciudadanía",
      "TI": "Tarjeta de identidad",
      "CE": "Cédula de extranjería",
      "PAS": "Pasaporte"
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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
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
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
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
            <div className="p-6 space-y-6">
              {/* Información Empresarial */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
                  <FaBuilding className="text-primary-purple" />
                  Información {provider.tipoEntidad === "natural" ? "Personal" : "Empresarial"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tipo de Entidad */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      Tipo de Entidad
                    </label>
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg border border-gray-200 capitalize">
                      {provider.tipoEntidad === "juridica" ? "Persona Jurídica" : "Persona Natural"}
                    </p>
                  </div>

                  {/* Razón Social o Nombre */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      {provider.tipoEntidad === "juridica" ? "Razón Social" : "Nombre Completo"}
                    </label>
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {provider.razonSocial || "N/A"}
                    </p>
                  </div>

                  {/* NIT o Identificación */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      {provider.tipoEntidad === "juridica" ? "NIT" : "Identificación"}
                    </label>
                    <p className="text-gray-900 font-mono p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {provider.nit || "N/A"}
                    </p>
                  </div>

                  {/* Tipo de Documento - Solo para Persona Natural */}
                  {provider.tipoEntidad === "natural" && provider.tipoDocumento && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block flex items-center gap-2">
                        <FaIdCard className="text-primary-purple" />
                        Tipo de Documento
                      </label>
                      <p className="text-gray-900 p-3 bg-gradient-to-br from-primary-blue/5 to-primary-purple/5 rounded-lg border border-primary-blue/20">
                        {getDocumentTypeLabel(provider.tipoDocumento)}
                      </p>
                    </div>
                  )}
                  {/* Estado del Proveedor */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      Estado del Proveedor
                    </label>
                    <div className={`p-3 rounded-lg border border-gray-200 flex items-center gap-2 ${getStatusColor(provider.estado)}`}>
                      {getStatusIcon(provider.estado)}
                      <span>{provider.estado || "N/A"}</span>
                    </div>
                  </div>

                  {/* Fecha de Registro */}
                  {provider.fechaRegistro && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Fecha de Registro
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-900">
                          {formatDate(provider.fechaRegistro)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
                  <FaUser className="text-primary-purple" />
                  Información de Contacto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contacto Principal */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      Contacto Principal
                    </label>
                    <p className="text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {provider.contactoPrincipal || "N/A"}
                    </p>
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      Teléfono
                    </label>
                    <p className="text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {formatPhoneDisplay(provider.telefono)}
                    </p>
                  </div>

                  {/* Correo Electrónico */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      Correo Electrónico
                    </label>
                    <p className="text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-200 break-all">
                      {provider.correo || "N/A"}
                    </p>
                  </div>

                  {/* Dirección */}
                  {provider.direccion && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Dirección
                      </label>
                      <p className="text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {provider.direccion}
                      </p>
                    </div>
                  )}

                  {/* Ciudad */}
                  {provider.ciudad && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Ciudad
                      </label>
                      <p className="text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {provider.ciudad}
                      </p>
                    </div>
                  )}

                  {/* País */}
                  {provider.pais && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        País
                      </label>
                      <p className="text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {provider.pais}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información Adicional */}
              {(provider.descripcion || provider.servicios || provider.observaciones) && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaTag className="text-primary-purple" />
                    Información Adicional
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {/* Descripción */}
                    {provider.descripcion && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">
                          Descripción
                        </label>
                        <p className="text-gray-900 p-3 bg-white rounded-lg border border-gray-200 whitespace-pre-line">
                          {provider.descripcion}
                        </p>
                      </div>
                    )}

                    {/* Servicios */}
                    {provider.servicios && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">
                          Servicios Ofrecidos
                        </label>
                        <p className="text-gray-900 p-3 bg-white rounded-lg border border-gray-200">
                          {provider.servicios}
                        </p>
                      </div>
                    )}

                    {/* Observaciones */}
                    {provider.observaciones && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">
                          Observaciones
                        </label>
                        <p className="text-gray-900 p-3 bg-white rounded-lg border border-gray-200 whitespace-pre-line">
                          {provider.observaciones}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Información de Documentación */}
              {(provider.documentos || provider.terminosPago) && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    Información de Documentación
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Términos de Pago */}
                    {provider.terminosPago && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">
                          Términos de Pago
                        </label>
                        <p className="text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          {provider.terminosPago}
                        </p>
                      </div>
                    )}

                    {/* Documentos */}
                    {provider.documentos && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">
                          Documentos Adjuntos
                        </label>
                        <p className="text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          {provider.documentos}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
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

export default ProviderViewModal;