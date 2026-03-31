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
    `transition-colors duration-200 tracking-wide ${
      isActive ? "text-[#B595FF]" : "text-black hover:text-[#B595FF]"
    }`;

  const loginClasses = ({ isActive }) =>
    `flex items-center text-lg transition-colors duration-200 tracking-wide ${
      isActive ? "text-[#9BE9FF]" : "text-black hover:text-[#9BE9FF]"
    }`;

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-md font-montserrat transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex-shrink-0 w-1/4 min-w-[120px]">
            <NavLink to="/" className="flex items-center space-x-2 sm:space-x-3">
              <img
                src="/assets/images/Logo1LFundacionMV.png"
                alt="Logo Fundación MV 1"
                className="h-8 sm:h-10 cursor-pointer"
              />
              <img
                src="/assets/images/Logo2LFundacionMV.png"
                alt="Logo Fundación MV 2"
                className="h-10 sm:h-14 cursor-pointer"
              />
            </NavLink>
          </div>

          <div className="hidden md:flex justify-center w-2/4 max-w-[660px] mx-2 sm:mx-4">
            <ul className="flex space-x-2 md:space-x-4 lg:space-x-7 text-sm lg:text-base">
              <li><NavLink to="/" className={linkClasses}>Inicio</NavLink></li>
              <li><NavLink to="/fundacion" className={linkClasses}>Fundación</NavLink></li>
              <li><NavLink to="/areas-proyectos" className={linkClasses}>Áreas</NavLink></li>
              <li><NavLink to="/historias" className={linkClasses}>Historias</NavLink></li>
              <li><NavLink to="/galeria" className={linkClasses}>Galería</NavLink></li>
              <li><NavLink to="/events" className={linkClasses}>Eventos</NavLink></li>
              <li><NavLink to="/donacion" className={linkClasses}>Donación</NavLink></li>
            </ul>
          </div>

          <div className="hidden md:flex justify-end w-1/4">
            <NavLink to="/login" className={loginClasses}>
              Iniciar Sesión
              <FiLogIn className="ml-2 text-[#9BE9FF] w-5 h-5" />
            </NavLink>
          </div>

          <div className="md:hidden flex justify-end">
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Alternar menú de navegación"
            >
              {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

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
                <li><NavLink to="/" className={linkClasses} onClick={() => setIsOpen(false)}>Inicio</NavLink></li>
                <li><NavLink to="/fundacion" className={linkClasses} onClick={() => setIsOpen(false)}>Fundación</NavLink></li>
                <li><NavLink to="/areas-proyectos" className={linkClasses} onClick={() => setIsOpen(false)}>Áreas y Proyectos</NavLink></li>
                <li><NavLink to="/historias" className={linkClasses} onClick={() => setIsOpen(false)}>Historias</NavLink></li>
                <li><NavLink to="/galeria" className={linkClasses} onClick={() => setIsOpen(false)}>Galería</NavLink></li>
                <li><NavLink to="/events" className={linkClasses} onClick={() => setIsOpen(false)}>Eventos</NavLink></li>
                <li><NavLink to="/donacion" className={linkClasses} onClick={() => setIsOpen(false)}>Donación</NavLink></li>
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
    </>
  );
};

