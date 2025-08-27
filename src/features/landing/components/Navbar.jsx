import React, { useState } from "react";
import { NavLink } from "react-router-dom"; 
import { FiLogIn, FiMenu, FiX } from "react-icons/fi";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  
  const linkClasses = ({ isActive }) =>
    `transition-colors duration-200 tracking-wide ${
      isActive
        ? "text-[#B595FF] hover:text-[#B595FF]" 
        : "text-black hover:text-[#B595FF]" 
    }`;

  
  const loginClasses = ({ isActive }) =>
    `flex items-center text-lg transition-colors duration-200 tracking-wide ${
      isActive
        ? "text-[#9BE9FF] hover:text-[#9BE9FF]" 
        : "text-black hover:text-[#9BE9FF]" 
    }`;

  return (
    <nav className="fixed top-0 w-full z-50 bg-white shadow-md font-questrial">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logos */}
        <NavLink to="/" className="flex items-center space-x-3">
          <img
            src="/assets/images/Logo1LFundacionMV.png"
            alt="Logo Fundación MV 1"
            className="h-auto max-h-10 cursor-pointer"
          />
          <img
            src="/assets/images/Logo2LFundacionMV.png"
            alt="Logo Fundación MV 2"
            className="h-auto max-h-14 cursor-pointer"
          />
        </NavLink>

        <div className="hidden md:flex flex-1 justify-center">
          <ul className="flex space-x-12 text-lg md:ml-0 lg:-ml-16 xl:-ml-32">
            <li>
              <NavLink
                to="/about"
                className={linkClasses}
                aria-label="Ir a la página Acerca de"
              >
                Acerca de
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/events"
                className={linkClasses}
                aria-label="Ir a la página de Eventos"
              >
                Eventos
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/categories"
                className={linkClasses}
                aria-label="Ir a la página de Categorías"
              >
                Categorías
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/services"
                className={linkClasses}
                aria-label="Ir a la página de Servicios"
              >
                Servicios
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Botón de inicio de sesión (escritorio) */}
        <div className="hidden md:flex md:ml-12">
          <NavLink
            to="/login"
            className={loginClasses}
            aria-label="Ir a la página de inicio de sesión"
          >
            Iniciar Sesión
            <FiLogIn className="ml-2 text-[#9BE9FF] w-5 h-5" />
          </NavLink>
        </div>

        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Alternar menú de navegación"
        >
          {isOpen ? (
            <FiX className="w-6 h-6" />
          ) : (
            <FiMenu className="w-6 h-6" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <ul className="flex flex-col space-y-4 px-6 py-4 text-lg">
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `block transition-colors duration-200 tracking-wide ${
                    isActive
                      ? "text-[#B595FF] hover:text-[#B595FF]" // Púrpura siempre cuando está activo
                      : "text-black hover:text-[#B595FF]"
                  }`
                }
                onClick={() => setIsOpen(false)}
                aria-label="Ir a la página Acerca de"
              >
                Acerca de
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/events"
                className={({ isActive }) =>
                  `block transition-colors duration-200 tracking-wide ${
                    isActive
                      ? "text-[#B595FF] hover:text-[#B595FF]" 
                      : "text-black hover:text-[#B595FF]"
                  }`
                }
                onClick={() => setIsOpen(false)}
                aria-label="Ir a la página de Eventos"
              >
                Eventos
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/categories"
                className={({ isActive }) =>
                  `block transition-colors duration-200 tracking-wide ${
                    isActive
                      ? "text-[#B595FF] hover:text-[#B595FF]" 
                      : "text-black hover:text-[#B595FF]"
                  }`
                }
                onClick={() => setIsOpen(false)}
                aria-label="Ir a la página de Categorías"
              >
                Categorías
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/services"
                className={({ isActive }) =>
                  `block transition-colors duration-200 tracking-wide ${
                    isActive
                      ? "text-[#B595FF] hover:text-[#B595FF]" 
                      : "text-black hover:text-[#B595FF]"
                  }`
                }
                onClick={() => setIsOpen(false)}
                aria-label="Ir a la página de Servicios"
              >
                Servicios
              </NavLink>
            </li>
            <li className="border-t pt-4">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `flex items-center transition-colors duration-200 tracking-wide ${
                    isActive
                      ? "text-[#9BE9FF] hover:text-[#9BE9FF]" 
                      : "text-black hover:text-[#9BE9FF]" 
                  }`
                }
                onClick={() => setIsOpen(false)}
                aria-label="Ir a la página de inicio de sesión"
              >
                Iniciar Sesión
                <FiLogIn className="ml-2 text-[#9BE9FF] w-5 h-5" />
              </NavLink>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};