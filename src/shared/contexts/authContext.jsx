import { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../services/apiClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Intentar restaurar sesión desde el servidor usando refresh token (cookie)
    const restoreSession = async () => {
      const storedUser = localStorage.getItem("user");
      
      if (storedUser) {
        try {
          // Intentar obtener un nuevo access token usando el refresh token (cookie)
          const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
          const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include', // Enviar cookies
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const result = await response.json();
            const accessToken = result.data.accessToken;
            
            // Almacenar access token en memoria del apiClient
            apiClient.setAccessToken(accessToken);
            
            setIsAuthenticated(true);
            setUser(JSON.parse(storedUser));
          } else {
            // Si falla, limpiar datos
            localStorage.removeItem("user");
          }
        } catch (error) {
          console.error('Error restaurando sesión:', error);
          localStorage.removeItem("user");
        }
      }
      
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (loginData) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include', // Importante: recibir cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          const userToStore = result.data.user;
          const accessToken = result.data.accessToken;
          
          // Almacenar access token SOLO en memoria del apiClient
          apiClient.setAccessToken(accessToken);
          
          // Almacenar solo datos del usuario en localStorage
          setIsAuthenticated(true);
          setUser(userToStore);
          localStorage.setItem("user", JSON.stringify(userToStore));
          
          // El refresh token ya está en una cookie HttpOnly
          
          return { success: true };
        }
      }
      
      // Si la respuesta no es ok, obtener el mensaje de error del servidor
      const errorData = await response.json().catch(() => ({}));
      
      // Personalizar mensajes según el código de estado
      let errorMessage = 'Credenciales inválidas';
      
      if (response.status === 401) {
        errorMessage = errorData.message || 'Correo o contraseña incorrectos';
      } else if (response.status === 403) {
        errorMessage = errorData.message || 'Acceso denegado';
      } else if (response.status >= 500) {
        errorMessage = 'Error del servidor. Intenta más tarde';
      } else if (!navigator.onLine) {
        errorMessage = 'Sin conexión a internet';
      }
      
      return { success: false, message: errorMessage };
    } catch (error) {
      // Error de red o conexión
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return { success: false, message: 'No se pudo conectar con el servidor. Verifica tu conexión' };
      }
      return { success: false, message: error.message || 'Error inesperado. Intenta de nuevo' };
    }
  };

  const updateUser = (updatedData) => {
    setUser((prevUser) => {
      const newUser = { ...prevUser, ...updatedData };
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };

  const logout = async () => {
    try {
      // Cerrar sesión en el servidor (limpia cookie HttpOnly)
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Enviar cookies
        headers: {
          'Content-Type': 'application/json',
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
