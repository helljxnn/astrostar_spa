import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

/**
 * Hook para cerrar sesión automáticamente después de un período de inactividad
 * @param {number} timeout - Tiempo de inactividad en milisegundos (default: 30 minutos)
 */
export const useInactivityTimeout = (timeout = 30 * 60 * 1000) => {
  const { logout, isAuthenticated } = useAuth();
  const timeoutRef = useRef(null);

  const resetTimer = useCallback(() => {
    // Limpiar el timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Solo establecer el timeout si el usuario está autenticado
    if (isAuthenticated) {
      timeoutRef.current = setTimeout(() => {
        logout();
      }, timeout);
    }
  }, [logout, timeout, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Eventos que indican actividad del usuario
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Resetear el timer en cada evento de actividad
    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    // Iniciar el timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimer, isAuthenticated]);
};
