import React from 'react'
import { FaUserTie } from 'react-icons/fa';
import PerfilLog from './perfilLog';

export const TopBar = () => {
  return (
      <div id="container-topBar" className="w-full h-full p-4 grid grid-cols-2 gap-4">
        {/* Container TopBar */}
        <div id="title-Rol" className="w-full h-full flex flex-row gap-2 items-center justify-start">
          {/* Container title-Rol and Icon */}
          <FaUserTie size={32} className="text-gray-500 shrink-0" />
          <h4>Administrador</h4>
        </div>
        <div id="subMenu" className="w-full h-full flex flex-row gap-2 items-center justify-end">
          {/* Container PerfilLog */}
          <PerfilLog />
        </div>
      </div>
  )
}
