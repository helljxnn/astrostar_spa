import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import apiClient from "../services/apiClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef(null);
  const inactivityTimerRef = useRef(null);

  // Configuración de tiempos (en milisegundos)
  const REFRESH_INTERVAL = 25 * 60 * 1000; // 25 minutos (antes de que expire el token de 30 min)
  const INACTIVITY_TIMEOUT = 1 * 60 * 60 * 1000; // 1 hora de inactividad

  // Función para refrescar el token automáticamente
  const scheduleTokenRefresh = () => {
    // Limpiar timer anterior si existe
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    // Programar el próximo refresh
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const API_BASE_URL =
          import.meta.env.VITE_API_URL || "http://localhost:4000/api";
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          const accessToken = result.data.accessToken;
          const userData = result.data.user;

          // ✅ VALIDACIÓN: Verificar que el usuario siga activo
          if (userData && userData.status !== "Active") {
            console.warn("Usuario inactivado durante la sesión");
            alert("Tu cuenta ha sido inactivada. Contacta al administrador.");
            logout();
            return;
          }

          apiClient.setAccessToken(accessToken);

          // Actualizar datos del usuario si vienen en el refresh
          if (userData) {
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
          }

          // Programar el siguiente refresh
          scheduleTokenRefresh();
        } else {
          // Si falla el refresh, cerrar sesión
          logout();
        }
      } catch (error) {
        console.error("Error refrescando token:", error);
        logout();
      }
    }, REFRESH_INTERVAL);
  };

  // Función para resetear el timer de inactividad
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    if (isAuthenticated) {
      inactivityTimerRef.current = setTimeout(() => {
        // Mostrar alerta antes de cerrar sesión
        alert(
          "Tu sesión ha sido cerrada por inactividad (1 hora sin actividad).",
        );
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  };

  // Detectar actividad del usuario
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.addEventListener(event, resetInactivityTimer);
    });

    resetInactivityTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetInactivityTimer);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [isAuthenticated]);

  useEffect(() => {
    // Intentar restaurar sesión desde el servidor usando refresh token (cookie)
    const restoreSession = async () => {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          // Intentar obtener un nuevo access token usando el refresh token (cookie)
          const API_BASE_URL =
            import.meta.env.VITE_API_URL || "http://localhost:4000/api";
          const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include", // Enviar cookies
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const result = await response.json();
            const accessToken = result.data.accessToken;

            // Almacenar access token en memoria del apiClient
            apiClient.setAccessToken(accessToken);

            setIsAuthenticated(true);
            setUser(JSON.parse(storedUser));

            // Programar el próximo refresh automático
            scheduleTokenRefresh();
          } else {
            // Si falla, limpiar datos
            localStorage.removeItem("user");
          }
        } catch (error) {
          console.error("Error restaurando sesión:", error);
          localStorage.removeItem("user");
        }
      }

      setIsLoading(false);
    };

    restoreSession();

    // Cleanup al desmontar
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  const login = async (loginData) => {
    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:4000/api";
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include", // Importante: recibir cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const result = await response.json();

        if (result.success) {
          const userToStore = result.data.user;
          const accessToken = result.data.accessToken;

          // ✅ VALIDACIÓN: Verificar que el usuario esté activo
          if (userToStore.status !== "Active") {
            return { 
              success: false, 
              message: "Tu cuenta está inactiva. Contacta al administrador para más información." 
            };
          }

          // Almacenar access token SOLO en memoria del apiClient
          apiClient.setAccessToken(accessToken);

          // Almacenar solo datos del usuario en localStorage
          setIsAuthenticated(true);
          setUser(userToStore);
          localStorage.setItem("user", JSON.stringify(userToStore));

          // El refresh token ya está en una cookie HttpOnly

          // Programar el refresh automático del token
          scheduleTokenRefresh();

          return { success: true };
        }
      }

      // Si la respuesta no es ok, obtener el mensaje de error del servidor
      const errorData = await response.json().catch(() => ({}));

      // Personalizar mensajes según el código de estado
      let errorMessage = "Credenciales inválidas";

      if (response.status === 401) {
        errorMessage = errorData.message || "Correo o contraseña incorrectos";
      } else if (response.status === 403) {
        errorMessage = errorData.message || "Acceso denegado";
      } else if (response.status >= 500) {
        errorMessage = "Error del servidor. Intenta más tarde";
      } else if (!navigator.onLine) {
        errorMessage = "Sin conexión a internet";
      }

      return { success: false, message: errorMessage };
    } catch (error) {
      // Error de red o conexión
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        return {
          success: false,
          message: "No se pudo conectar con el servidor. Verifica tu conexión",
        };
      }
      return {
        success: false,
        message: error.message || "Error inesperado. Intenta de nuevo",
      };
    }
  };

  const updateUser = (updatedData) => {
    setUser((prevUser) => {
      const newUser = { ...prevUser, ...updatedData };
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };

  // Función para refrescar permisos después de acciones importantes
  const refreshUserPermissions = async () => {
    try {
      // Esto disparará el hook useDynamicPermissions para refrescar
      // No necesitamos hacer nada aquí, solo cambiar el timestamp para forzar re-render
      setUser(prevUser => ({ ...prevUser, lastPermissionRefresh: Date.now() }));
    } catch (error) {
      console.error('Error refreshing permissions:', error);
    }
  };

  const logout = async () => {
    try {
      // Limpiar timers
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      // Cerrar sesión en el servidor (limpia cookie HttpOnly)
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:4000/api";
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // Enviar cookies
        headers: {
          "Content-Type": "application/json",
        },
      }).catch(() => {
        // Ignorar errores de red al cerrar sesión
      });
    } finally {
      // Siempre limpiar el estado local
      apiClient.clearAccessToken();
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("user");

      // Redirigir al login después del logout
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        userRole: user?.rol || user?.role?.name,
        login,
        logout,
        updateUser,
        refreshUserPermissions,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
