import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaTimes,
  FaUserCircle,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaBirthdayCake,
  FaMapMarkerAlt,
  FaUserCheck,
} from "react-icons/fa";
import apiClient from "../../../shared/services/apiClient";

/**
 * Componente para mostrar un ítem con icono y texto
 */
const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-4 py-3">
    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-primary-purple">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 ">{label}</p>
      <p className="text-md font-semibold text-gray-800 break-words">
        {value || "No especificado"}
      </p>
    </div>
  </div>
);

const StatusItem = ({ label, value }) => (
  <div className="flex items-start gap-4 py-3">
    <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${value === 'Activo' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
      <FaUserCheck />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`text-md font-semibold break-words ${value === 'Activo' ? 'text-green-700' : 'text-gray-700'}`}>
        {value || "No especificado"}
      </p>
    </div>
  </div>
);

/**
 * Modal para mostrar la información del perfil de usuario autenticado
 */
const ViewProfileModal = ({ isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================================
  // Cargar datos del usuario desde el backend (POST)
  // ================================
  const fetchProfile = async () => {
    try {
      const response = await apiClient.get("/auth/profile");
      if (response?.success) {
        setUser(response.data);
      } else {
        console.warn("No se pudo obtener el perfil del usuario");
      }
    } catch (error) {
      console.error("Error al obtener el perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchProfile();
  }, [isOpen]);

  if (!isOpen) return null;

  // ================================
  // Formatear nombre de rol
  // ================================
  const formatRole = (role) => {
    if (!role?.name) return "No especificado";
    return role.name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // ================================
  // Formatear fecha
  // ================================
  const formatDate = (dateString) => {
    if (!dateString) return "No especificado";
    try {
      return new Date(dateString).toLocaleDateString("es-CO", { timeZone: 'UTC' });
    } catch (error) {
      return dateString; // Devuelve el original si falla
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            <FaTimes size={18} />
          </button>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            Perfil de Usuario
          </h2>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading ? (
            <p className="text-center text-gray-500">Cargando perfil...</p>
          ) : user ? (
            <>
              <div className="flex flex-col items-center mb-6">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-purple to-primary-blue flex items-center justify-center text-white font-bold text-4xl mb-3">
                    {user?.firstName
                      ? user.firstName.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-800">
                  {[
                    user?.firstName,
                    user?.middleName,
                    user?.lastName,
                    user?.secondLastName,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </h3>
                <p className="text-gray-500">{formatRole(user?.role)}</p>
              </div>

              {/* Contenedor de dos columnas para los detalles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                <div>
                  <DetailItem
                    icon={<FaUserCircle />}
                    label="Nombre Completo"
                    value={[
                      user?.firstName,
                      user?.middleName,
                      user?.lastName,
                      user?.secondLastName,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                  <DetailItem
                    icon={<FaIdCard />}
                    label="Documento"
                    value={`${user?.documentType} - ${user?.identification || "N/A"
                      }`}
                  />
                  <DetailItem
                    icon={<FaBirthdayCake />}
                    label="Fecha de Nacimiento"
                    value={formatDate(user?.birthDate)}
                  />
                  <DetailItem
                    icon={<FaBriefcase />}
                    label="Rol"
                    value={formatRole(user?.role)}
                  />
                </div>
                <div>
                  <DetailItem icon={<FaEnvelope />} label="Correo Electrónico" value={user?.email} />
                  <DetailItem icon={<FaPhone />} label="Número de Teléfono" value={user?.phoneNumber} />
                  <DetailItem icon={<FaMapMarkerAlt />} label="Dirección" value={user?.address} />
                  <DetailItem
                    icon={<FaBirthdayCake />}
                    label="Edad"
                    value={user?.age ? `${user.age} años` : 'No especificada'}
                  />
                  <StatusItem
                    label="Estado"
                    value={user?.status}
                  />
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-red-500">
              No se pudo cargar la información del usuario.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4 flex justify-center">
          <motion.button
            onClick={onClose}
            className="px-8 py-2.5 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-xl hover:opacity-90 transition font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cerrar
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ViewProfileModal;
