import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import DynamicSideBar from "../../../components/DynamicSideBar"; 
import { TopBar } from "./TopBar"; 

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true); 

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false); // Por defecto cerrado en móvil
        setIsExpanded(true); // Siempre expandido en el estado móvil para mostrar el contenido completo
      } else {
        setSidebarOpen(true); // Por defecto abierto en desktop
        setIsExpanded(true); // Por defecto expandido en desktop
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const toggleSidebarExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Overlay con blur para móvil */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <DynamicSideBar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isExpanded={isExpanded}
        setIsExpanded={toggleSidebarExpansion}
      />

      {/* Contenedor principal con flex-grow para ocupar el espacio restante */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isMobile
            ? "ml-0"
            : isExpanded
            ? "ml-[0rem]" // Ajustado, ya que, configurando mobile dejaba espacio en el web
            : "ml-[4.5rem]" 
        }`}
      >
        {/* Barra superior */}
        <div className="w-full bg-white shadow-md sticky top-0 z-20">
          <TopBar toggleSidebar={toggleSidebarExpansion} />
        </div>

        {/* Contenido dinámico */}
        <div className="flex-1 w-full overflow-y-auto px-0 sm:px-4 lg:px-6 pt-4 sm:pt-6 md:pt-8 pb-16 sm:pb-8">
          <Outlet />
        </div>
      </div>

      {/* Botón para mostrar/ocultar sidebar en móvil */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-6 right-6 lg:hidden z-50 p-3 rounded-full bg-primary-purple text-white shadow-lg"
        aria-label="Toggle sidebar"
      >
        <FaBars size={20} />
      </button>
    </div>
  );
}

export default DashboardLayout;