import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";

const ReadOnlyField = ({ label, value, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="space-y-1"
  >
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 min-h-[48px] flex items-center">
      {value || "No especificado"}
    </div>
  </motion.div>
);

const DonorSponsorViewModal = ({ isOpen, onClose, donorData }) => {
  if (!isOpen || !donorData) return null;

  const isNatural = donorData.tipoPersona === "Natural";
  const isJuridica = donorData.tipoPersona === "Juridica";
  const isSponsor = donorData.tipo === "Patrocinador";
  const phoneLabel = isJuridica ? "Tel\u00e9fono de contacto" : "Tel\u00e9fono";
  const emailLabel = isJuridica ? "Correo del representante" : "Correo Electr\u00f3nico";

  const formatDate = (dateString) => {
    if (!dateString) return "No especificado";
    const date = new Date(dateString);
    if (isNaN(date)) return "No especificado";
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const baseNombre = isJuridica ? donorData.razonSocial || donorData.nombre : donorData.nombreCompleto || donorData.nombre;
  const baseIdent = isJuridica ? donorData.nit || donorData.identificacion : donorData.numeroDocumento || donorData.identificacion;
  const creationDate = donorData.createdAt;
  const updateDate = donorData.updatedAt;
  const statusDate =
    donorData.statusAssignedAt ||
    donorData.estadoAsignado ||
    donorData.updatedAt ||
    donorData.createdAt;

  const fields = [
    { label: "Tipo", value: donorData.tipo },
    { label: "Tipo de Persona", value: donorData.tipoPersona },
    { label: isJuridica ? "Razon Social" : "Nombre completo", value: baseNombre },
    { label: isJuridica ? "NIT" : "Numero de documento", value: baseIdent },
    ...(isNatural
      ? [
          { label: "Tipo de documento", value: donorData.tipoDocumento },
        ]
      : []),
    ...(isJuridica
      ? [
          { label: "Representante legal", value: donorData.personaContacto },
        ]
      : []),
    // Que patrocina se omite para simplificar
    { label: phoneLabel, value: donorData.telefono },
    { label: emailLabel, value: donorData.correo },
    { label: "Direcci\u00f3n", value: donorData.direccion },
    { label: "Ciudad", value: donorData.ciudad },
    { label: "Pa\u00eds", value: donorData.pais },
    // Tipo de patrocinio se omite por simplicidad (fundacion deportiva)
    { label: "Estado", value: donorData.estado },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] relative flex flex-col overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-4 relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                onClick={onClose}
                aria-label="Cerrar"
              >
                <IoClose size={20} />
              </button>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
                Ver Donante/Patrocinador
              </h2>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {fields.map((field, index) => (
                  <ReadOnlyField
                    key={`${field.label}-${index}`}
                    label={field.label}
                    value={field.value}
                    delay={0.05 * (index + 1)}
                  />
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Informacion del Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Fecha de Creacion:</span>
                    <p className="text-gray-800">{formatDate(creationDate)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Ultima Actualizacion:</span>
                    <p className="text-gray-800">{formatDate(updateDate)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Estado Asignado:</span>
                    <p className="text-gray-800">{formatDate(statusDate)}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-gray-200 p-4">
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

export default DonorSponsorViewModal;
