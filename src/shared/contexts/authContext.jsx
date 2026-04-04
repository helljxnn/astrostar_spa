import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import apiClient from "../services/apiClient";
import { showWarningAlert } from "../utils/alerts.js";

const AuthContext = createContext();
const DEV_REFRESH_TOKEN_KEY = "astrostar_dev_refresh_token";
const USER_STORAGE_KEY = "user";

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef(null);
  const inactivityTimerRef = useRef(null);

  // Configuración de tiempos (en milisegundos)
  const REFRESH_INTERVAL = 25 * 60 * 1000; // 25 minutos (antes de que expire el token de 30 min)
  const INACTIVITY_TIMEOUT = 1 * 60 * 60 * 1000; // 1 hora de inactividad
  const isDevMode = import.meta.env.DEV;
  const devClientHeaders = isDevMode ? { "X-Client-Type": "mobile" } : {};

  const getDevRefreshToken = () => {
    if (!isDevMode) return null;
    try {
      return sessionStorage.getItem(DEV_REFRESH_TOKEN_KEY);
    } catch (_error) {
      return null;
    }
  };

  const setDevRefreshToken = (token) => {
    if (!isDevMode || !token) return;
    try {
      sessionStorage.setItem(DEV_REFRESH_TOKEN_KEY, token);
    } catch (_error) {
      // Ignorar errores de sessionStorage en modo local.
    }
  };

  const clearDevRefreshToken = () => {
    if (!isDevMode) return;
    try {
      sessionStorage.removeItem(DEV_REFRESH_TOKEN_KEY);
    } catch (_error) {
      // Ignorar errores de sessionStorage en modo local.
    }
  };

  const asPlainObject = (value) =>
    value && typeof value === "object" && !Array.isArray(value) ? value : {};

  const pick = (source, keys) => {
    const safeSource = asPlainObject(source);
    return keys.reduce((acc, key) => {
      if (safeSource[key] !== undefined && safeSource[key] !== null) {
        acc[key] = safeSource[key];
      }
      return acc;
    }, {});
  };

  const sanitizeUserForStorage = (value) => {
    const safeUser = asPlainObject(value);
    if (!safeUser.id) return null;

    const safeRole = pick(safeUser.role, ["id", "name", "permissions"]);
    const safeEmployee = pick(safeUser.employee, ["id", "status"]);
    const safeAthlete = pick(safeUser.athlete, ["id", "status"]);

    return {
      ...pick(safeUser, [
        "id",
        "firstName",
        "middleName",
        "lastName",
        "secondLastName",
        "email",
        "status",
        "avatarColorIndex",
      ]),
      role: Object.keys(safeRole).length ? safeRole : undefined,
      employee: Object.keys(safeEmployee).length ? safeEmployee : undefined,
      athlete: Object.keys(safeAthlete).length ? safeAthlete : undefined,
      permissions: safeUser.permissions,
    };
  };

  const readStoredUser = () => {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return sanitizeUserForStorage(parsed);
    } catch (_error) {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  };

  const writeStoredUser = (value) => {
    const safeUser = sanitizeUserForStorage(value);
    if (!safeUser) {
      localStorage.removeItem(USER_STORAGE_KEY);
      return;
    }
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(safeUser));
  };

  const countKeys = (value) => Object.keys(asPlainObject(value)).length;

  const mergeUserWithStoredPermissions = (incomingUser, storedUser) => {
    if (!incomingUser) return storedUser || null;
    if (!storedUser) return incomingUser;

    const incomingPermissions =
      incomingUser?.role?.permissions || incomingUser?.permissions || null;
    const storedPermissions =
      storedUser?.role?.permissions || storedUser?.permissions || null;
    const hasIncomingPermissions = countKeys(incomingPermissions) > 0;
    const hasStoredPermissions = countKeys(storedPermissions) > 0;

    if (!hasIncomingPermissions && hasStoredPermissions) {
      return {
        ...storedUser,
        ...incomingUser,
        permissions: storedPermissions,
        role: {
          ...asPlainObject(storedUser.role),
          ...asPlainObject(incomingUser.role),
          permissions: storedPermissions,
        },
      };
    }

    return {
      ...storedUser,
      ...incomingUser,
      role: {
        ...asPlainObject(storedUser.role),
        ...asPlainObject(incomingUser.role),
      },
    };
  };

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
        const devRefreshToken = getDevRefreshToken();
        const refreshPayload = devRefreshToken
          ? JSON.stringify({ refreshToken: devRefreshToken })
          : undefined;
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...devClientHeaders,
          },
          body: refreshPayload,
        });

        if (response.ok) {
          const result = await response.json();
          const accessToken = result.data.accessToken;
          const userData = result.data.user;
          const storedUser = readStoredUser();
          const mergedUser = mergeUserWithStoredPermissions(userData, storedUser);

          // ✅ VALIDACIÓN: Verificar que el usuario siga activo
          if (mergedUser && mergedUser.status !== "Active") {
            showWarningAlert("Cuenta inactivada", "Tu cuenta ha sido inactivada. Contacta al administrador.");
            logout();
            return;
          }

          apiClient.setAccessToken(accessToken);

          // Actualizar datos del usuario si vienen en el refresh
          if (mergedUser) {
            setUser(mergedUser);
            writeStoredUser(mergedUser);
          }

          // Programar el siguiente refresh
          scheduleTokenRefresh();
        } else {
          // Si falla el refresh, cerrar sesión
          logout();
        }
      } catch (_error) {
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
        showWarningAlert(
          "Sesión cerrada por inactividad",
          "Tu sesión ha sido cerrada por inactividad (1 hora sin actividad)."
        ).then(() => {
          logout();
        });
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
      const storedUserParsed = readStoredUser();

      try {
        // Intentar obtener un nuevo access token usando el refresh token (cookie)
        // incluso cuando no exista localStorage.user.
        const API_BASE_URL =
          import.meta.env.VITE_API_URL || "http://localhost:4000/api";
        const devRefreshToken = getDevRefreshToken();
        const refreshPayload = devRefreshToken
          ? JSON.stringify({ refreshToken: devRefreshToken })
          : undefined;
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...devClientHeaders,
          },
          body: refreshPayload,
        });

        if (response.ok) {
          const result = await response.json();
          const accessToken = result.data.accessToken;
          let refreshedUser = mergeUserWithStoredPermissions(
            result.data.user,
            storedUserParsed,
          );

          apiClient.setAccessToken(accessToken);

          // Si el refresh no trae usuario y no hay caché local, pedir /auth/me.
          if (!refreshedUser) {
            const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
                ...devClientHeaders,
              },
            });

            if (meResponse.ok) {
              const meResult = await meResponse.json();
              refreshedUser = mergeUserWithStoredPermissions(
                meResult?.data,
                storedUserParsed,
              );
            }
          }

          if (refreshedUser) {
            setIsAuthenticated(true);
            setUser(refreshedUser);
            writeStoredUser(refreshedUser);

            // Programar el próximo refresh automático
            scheduleTokenRefresh();
          } else {
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem(USER_STORAGE_KEY);
          }
        } else {
          // Si no hay sesión válida en cookie, limpiar datos locales.
          setIsAuthenticated(false);
          setUser(null);
          localStorage.removeItem(USER_STORAGE_KEY);
          localStorage.removeItem("authToken");
          localStorage.removeItem("userRole");
          clearDevRefreshToken();
        }
      } catch (_error) {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        clearDevRefreshToken();
      } finally {
        setIsLoading(false);
      }
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
          ...devClientHeaders,
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
          setDevRefreshToken(result.data.refreshToken);

          // Almacenar solo datos del usuario en localStorage
          setIsAuthenticated(true);
          setUser(userToStore);
          writeStoredUser(userToStore);

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
      const newUser = mergeUserWithStoredPermissions(updatedData, prevUser);
      writeStoredUser(newUser);
      return newUser;
    });
  };

  // Función para refrescar permisos después de acciones importantes
  const refreshUserPermissions = async () => {
    try {
      // Esto disparará el hook useDynamicPermissions para refrescar
      // No necesitamos hacer nada aquí, solo cambiar el timestamp para forzar re-render
      setUser(prevUser => ({ ...prevUser, lastPermissionRefresh: Date.now() }));
    } catch (_error) {
      // Mantener flujo silencioso para no interrumpir al usuario.
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
      const devRefreshToken = getDevRefreshToken();
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // Enviar cookies
        headers: {
          "Content-Type": "application/json",
          ...devClientHeaders,
        },
        body: devRefreshToken
          ? JSON.stringify({ refreshToken: devRefreshToken })
          : undefined,
      }).catch(() => {
        // Ignorar errores de red al cerrar sesión
      });
    } finally {
      // Siempre limpiar el estado local
      apiClient.clearAccessToken();
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("lastKnownPermissionsByUser");
      clearDevRefreshToken();

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


