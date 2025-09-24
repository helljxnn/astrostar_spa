import React, { useState, useRef, useEffect } from "react";
import { FaAngleDown } from 'react-icons/fa';
import { AnimatePresence } from "framer-motion";
import SubMenu from "./subMenu";

const PerfilLog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    const toggleMenu = () => setIsOpen(!isOpen);

    // Cierra el menú si se hace clic fuera de él
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    return (
        <div ref={menuRef} className="relative">
            <button
                onClick={toggleMenu}
                aria-label="Abrir menú de usuario"
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-purple/50"
            >
                {/* Avatar con inicial */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-purple to-primary-blue flex items-center justify-center text-white font-bold text-sm">
                    E
                </div>
                {/* Flecha desplegable */}
                <FaAngleDown
                    size={16}
                    className={`text-gray-500 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {/* Submenú con animación */}
            <AnimatePresence>
                {isOpen && <SubMenu />}
            </AnimatePresence>
        </div>
    );
}
export default PerfilLog;