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
    const state = isMobile
      ? "closed"
      : sidebarOpen && isExpanded
        ? "expanded"
        : sidebarOpen && !isExpanded
          ? "collapsed"
          : "closed";

    return state;
  }, [isMobile, sidebarOpen, isExpanded]);

  // Calcular el margen izquierdo
  const getMarginLeft = useCallback(() => {
    const margin = isMobile
      ? "0px"
      : sidebarOpen && isExpanded
        ? "288px"
        : sidebarOpen && !isExpanded
          ? "80px"
          : "0px";

    return margin;
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
