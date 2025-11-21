// src/features/dashboard/pages/Admin/pages/Users/components/UserViewModal.jsx
import React from "react";
import { motion } from "framer-motion";

const documentTypesLabels = {
  CC: "Cédula de ciudadanía",
  TI: "Tarjeta de identidad",
  CE: "Cédula de extranjería",
  PAS: "Pasaporte",
};

const UserViewModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user?._fullData) return null;

  const fullUser = user._fullData;

  const formatPhoneDisplay = (phone) => {
    if (!phone) return "No especificado";
    return phone;
  };

  const getDocumentTypeLabel = (type) => {
    return documentTypesLabels[type] || type;
  };

  const formatDate = (date) => {
    if (!date) return "No especificado";
    const d = new Date(date);
    return `${d.toLocaleDateString("es-ES")} ${d.toLocaleTimeString("es-ES")}`;
  };

  return (
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
            ✕
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            Detalles del Usuario
          </h2>
          <p className="text-center text-gray-600 mt-2">
            Información completa de:{" "}
            <span className="font-semibold text-primary-purple">
              {fullUser.firstName}{" "}
              {fullUser.middleName ? fullUser.middleName + " " : ""}
              {fullUser.lastName} {fullUser.secondLastName || ""}
            </span>
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Tipo de Documento */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <label className="text-sm font-medium text-gray-600">
                Tipo de documento
              </label>
              <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                {getDocumentTypeLabel(fullUser.documentType?.name || "N/A")}
              </p>
            </motion.div>

            {/* Identificación */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <label className="text-sm font-medium text-gray-600">
                Identificación
              </label>
              <p className="text-gray-900 font-mono p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                {fullUser.identification}
              </p>
            </motion.div>

            {/* Primer Nombre */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <label className="text-sm font-medium text-gray-600">
                Primer Nombre
              </label>
              <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                {fullUser.firstName}
              </p>
            </motion.div>

            {/* Segundo Nombre */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <label className="text-sm font-medium text-gray-600">
                Segundo Nombre
              </label>
              <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                {fullUser.middleName || "No especificado"}
              </p>
            </motion.div>

            {/* Primer Apellido */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <label className="text-sm font-medium text-gray-600">
                Primer Apellido
              </label>
              <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                {fullUser.lastName}
              </p>
            </motion.div>

            {/* Segundo Apellido */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              <label className="text-sm font-medium text-gray-600">
                Segundo Apellido
              </label>
              <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                {fullUser.secondLastName || "No especificado"}
              </p>
            </motion.div>

            {/* Rol */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <label className="text-sm font-medium text-gray-600">Rol</label>
              <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                {fullUser.role?.name || "N/A"}
              </p>
            </motion.div>

            {/* Correo */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <label className="text-sm font-medium text-gray-600">Correo</label>
              <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                {fullUser.email}
              </p>
            </motion.div>

            {/* Teléfono */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <label className="text-sm font-medium text-gray-600">
                Número Telefónico
              </label>
              <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                {formatPhoneDisplay(fullUser.phoneNumber)}
              </p>
            </motion.div>

            {/* Dirección */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.4 }}
            >
              <label className="text-sm font-medium text-gray-600">
                Dirección
              </label>
              <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                {fullUser.address || "No especificado"}
              </p>
            </motion.div>

            {/* Fecha de Nacimiento */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              <label className="text-sm font-medium text-gray-600">
                Fecha de Nacimiento
              </label>
              <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                {formatDate(fullUser.birthDate)}
              </p>
            </motion.div>

            {/* Estado */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.4 }}
            >
              <label className="text-sm font-medium text-gray-600">Estado</label>
              <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                {user.estado}
              </p>
            </motion.div>

            {/* Fecha de Creación */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
            >
              <label className="text-sm font-medium text-gray-600">
                Fecha de Creación
              </label>
              <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                {formatDate(fullUser.createdAt)}
              </p>
            </motion.div>

            {/* Última Actualización */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.4 }}
            >
              <label className="text-sm font-medium text-gray-600">
                Última Actualización
              </label>
              <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                {formatDate(fullUser.updatedAt)}
              </p>
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
  );
};

export default UserViewModal;