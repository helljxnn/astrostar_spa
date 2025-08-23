import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <nav className="flex items-center px-6 py-4 bg-white shadow-md relative">
      {/* Logo a la izquierda */}
      <div className="flex items-center space-x-2 ml-4">
        <span className="text-2xl font-bold text-black">MA</span>
        <img
          src="/assets/images/logo-fundacion.png"
          alt="Fundación Manuela Vanegas Logo"
          className="h-10"
        />
      </div>

      {/* Links centrados pero un poquito hacia la izquierda */}
      <div className="flex-1 flex justify-center -translate-x-40">
        <ul className="flex space-x-6">
          <li>
            <Link
              to="/acerca"
              className="text-black hover:text-[#B595FF] transition-colors duration-200 font-questrial"
            >
              Acerca de
            </Link>
          </li>
          <li>
            <Link
              to="/eventos"
              className="text-black hover:text-[#B595FF] transition-colors duration-200 font-questrial"
            >
              Eventos
            </Link>
          </li>
          <li>
            <Link
              to="/categorias"
              className="text-black hover:text-[#B595FF] transition-colors duration-200 font-questrial"
            >
              Categorias
            </Link>
          </li>
          <li>
            <Link
              to="/servicios"
              className="text-black hover:text-[#B595FF] transition-colors duration-200 font-questrial"
            >
              Servicios
            </Link>
          </li>
        </ul>
      </div>

      {/* Iniciar sesión a la derecha */}
      <div className="absolute right-4">
        <Link
          to="/login"
          className="text-black hover:text-[#9BE9FF] transition-colors duration-200 font-questrial"
        >
          Iniciar Sesión →
        </Link>
      </div>
    </nav>
  );
};
