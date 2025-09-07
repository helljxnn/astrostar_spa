import React from "react";
import { FaRegUserCircle } from 'react-icons/fa';
import { FaAngleDown } from 'react-icons/fa';
import SubMenu from "./subMenu";

const PerfilLog = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const toggleMenu = () => setIsOpen(!isOpen);
    return (
        <div id="container-PerfilLog" className="relative w-auto h-auto flex flex-row gap-2 justify-center items-center p-1 bg-primary-purple-light shadow-md text-white rounded-lg">
            <div id="photo">
                <FaRegUserCircle size={32} className="text-white shrink-0" />
            </div>
            <div id="name-user">
                <h4>Estrella</h4>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-px h-6 bg-white/40 rounded-full" aria-hidden="true"></div>
                <button onClick={toggleMenu} id="indicator" aria-label="Desplegar menú de usuario" className="p-1 rounded-full hover:bg-primary-purple-light transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50">
                    <FaAngleDown size={18} className="text-white shrink-0" />
                </button>
            </div>
            <div id="subMenu" className={`absolute top-full right-0 mt-2 z-10 origin-top-right transition-all duration-200 ease-out ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
                <SubMenu />
            </div>
        </div>
    );
}
export default PerfilLog;