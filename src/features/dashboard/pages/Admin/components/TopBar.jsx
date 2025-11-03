import React from "react";
import { FaUserTie } from "react-icons/fa";
import PerfilLog from "./perfilLog";
import { useAuth } from "../../../../../shared/contexts/authContext.jsx";
import { motion } from "framer-motion";

export const TopBar = ({ onOpenProfileModals }) => {
  const { user } = useAuth();

  // Función para formatear el rol para mostrar
  const formatRole = (role) => {
    if (!role) return "";

    // Convertir formato snake_case a Título Capitalizado
    const words = role.split("_");
    return words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Función para obtener el nombre completo del usuario
  const getUserDisplayName = () => {
    // Prioridad 1: Estructura del backend (firstName, lastName)
    if (user?.firstName) {
      return `${user.firstName} ${user.lastName || ''}`.trim();
    }
    
    // Prioridad 2: Estructura del fallback (nombre, apellido)
    if (user?.nombre) {
      return `${user.nombre} ${user.apellido || ''}`.trim();
    }
    
    // Prioridad 3: Rol formateado
    const role = user?.role?.name || user?.rol;
    if (role) {
      return formatRole(role);
    }
    
    // Fallback: Usuario
    return "Usuario";
  };

  return (
    <header
      className="w-full h-16 px-6 flex items-center justify-between 
      bg-gradient-to-r from-white/70 via-white/60 to-white/70 
      backdrop-blur-lg shadow-md sticky top-0 z-40 border-b border-gray-200 font-montserrat"
    >
      {/* Usuario y Rol */}
      <motion.div
        className="flex items-center gap-3 cursor-default"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          whileHover={{ scale: 1.15, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="p-2 rounded-full bg-primary-purple/10 text-primary-purple shadow-sm"
        >
          <FaUserTie size={20} />
        </motion.div>
        <motion.div
          className="flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className="text-gray-800 font-semibold tracking-wide text-lg leading-tight">
            {getUserDisplayName()}
          </h4>
          <span className="text-gray-500 text-sm font-medium">
            {user?.role?.name || user?.rol || 'Usuario'}
          </span>
        </motion.div>
      </motion.div>

      {/* Submenu perfil */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <PerfilLog onOpenProfileModals={onOpenProfileModals} />
      </motion.div>
    </header>
  );
};
