import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

/**
 * Hook personalizado para manejar el estado del sidebar
 * Evita problemas de sobreposición al cambiar de módulo
 */
export const useSidebarState = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Detectar si es móvil
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      if (mobile) {
        setSidebarOpen(false);
        setIsExpanded(true);
      } else {
        setSidebarOpen(true);
        setIsExpanded(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Forzar actualización del layout cuando cambia la ruta
  useEffect(() => {
    const timer = setTimeout(() => {
      // Forzar recálculo del layout
      if (typeof window !== "undefined" && window.dispatchEvent) {
        window.dispatchEvent(new Event("resize"));
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Calcular el estado del sidebar para CSS
  const getSidebarState = useCallback(() => {
    if (isMobile) return "closed";
    if (sidebarOpen && isExpanded) return "expanded";
    if (sidebarOpen && !isExpanded) return "collapsed";
    return "closed";
  }, [isMobile, sidebarOpen, isExpanded]);

  // Calcular el margen izquierdo
  const getMarginLeft = useCallback(() => {
    if (isMobile) return "0px";
    if (sidebarOpen && isExpanded) return "288px";
    if (sidebarOpen && !isExpanded) return "80px";
    return "0px";
  }, [isMobile, sidebarOpen, isExpanded]);

  // Toggle del sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  // Toggle de expansión
  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return {
    sidebarOpen,
    setSidebarOpen,
    isExpanded,
    setIsExpanded,
    isMobile,
    getSidebarState,
    getMarginLeft,
    toggleSidebar,
    toggleExpanded,
  };
};
