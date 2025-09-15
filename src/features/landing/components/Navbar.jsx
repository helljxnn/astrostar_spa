import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FiLogIn, FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  const linkClasses = ({ isActive }) =>
    `transition-colors duration-200 tracking-wide ${isActive
      ? "text-[#B595FF] hover:text-[#B595FF]"
      : "text-black hover:text-[#B595FF]"
    }`;

  const loginClasses = ({ isActive }) =>
    `flex items-center text-lg transition-colors duration-200 tracking-wide ${isActive
      ? "text-[#9BE9FF] hover:text-[#9BE9FF]"
      : "text-black hover:text-[#9BE9FF]"
    }`;

  return (
    <>
      {/* Espaciador para que el navbar fixed no tape el contenido */}
      <div className="h-[88px]"></div>

      <nav
        className={`fixed top-0 w-full z-50 bg-white shadow-md font-questrial transition-transform duration-300 ease-in-out ${isVisible ? "translate-y-0" : "-translate-y-full"
          }`}
      >
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

        {/* Links escritorio */}
        <div className="hidden md:flex flex-1 justify-end lg:justify-center">
          <ul className="flex space-x-6 lg:space-x-12 text-base lg:text-lg">
            <li><NavLink to="/about" className={linkClasses}>Acerca de</NavLink></li>
            <li><NavLink to="/events" className={linkClasses}>Eventos</NavLink></li>
            <li><NavLink to="/categories" className={linkClasses}>Categorías</NavLink></li>
            <li><NavLink to="/services" className={linkClasses}>Servicios</NavLink></li>
          </ul>
        </div>

        {/* Login escritorio */}
        <div className="hidden md:flex md:ml-6 lg:ml-12">
          <NavLink to="/login" className={loginClasses}>
            Iniciar Sesión
            <FiLogIn className="ml-2 text-[#9BE9FF] w-5 h-5" />
          </NavLink>
        </div>

        {/* Botón menú móvil */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Alternar menú de navegación"
        >
          {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </div>

      {/* Menú móvil */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <ul className="flex flex-col space-y-4 px-6 py-4 text-base sm:text-lg">
              <li><NavLink to="/about" className={linkClasses} onClick={() => setIsOpen(false)}>Acerca de</NavLink></li>
              <li><NavLink to="/events" className={linkClasses} onClick={() => setIsOpen(false)}>Eventos</NavLink></li>
              <li><NavLink to="/categories" className={linkClasses} onClick={() => setIsOpen(false)}>Categorías</NavLink></li>
              <li><NavLink to="/services" className={linkClasses} onClick={() => setIsOpen(false)}>Servicios</NavLink></li>
              <li className="border-t pt-4">
                <NavLink to="/login" className={loginClasses} onClick={() => setIsOpen(false)}>
                  Iniciar Sesión
                  <FiLogIn className="ml-2 text-[#9BE9FF] w-5 h-5" />
                </NavLink>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
