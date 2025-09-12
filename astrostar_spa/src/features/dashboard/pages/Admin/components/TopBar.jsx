import React from "react";
import { FaUserTie } from "react-icons/fa";
import PerfilLog from "./perfilLog";

export const TopBar = () => {
  return (
    <header className="w-full h-16 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
      {/* Rol */}
      <div className="flex items-center gap-2">
        <FaUserTie size={18} className="text-primary-purple" />
        <h4 className="text-gray-700 font-medium">Administrador</h4>
      </div>

      {/* Submenu perfil */}
      <div className="relative">
        <PerfilLog />
      </div>
    </header>
  );
};
