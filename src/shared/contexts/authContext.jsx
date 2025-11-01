import { createContext, useContext, useState, useEffect } from "react";
import Requests from "../hooks/requests";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Para saber si estamos verificando el estado inicial

  const URLENDPOINTS = {
    LOGIN: "http://localhost:3000/api/auth/login", // Endpoint par la autenticacion del usuario
    PASSWORD: "http://localhost:3000/api/auth/profile", // Endpoint para extraer los datos del usuario 
    LOGOUT: "http://localhost:3000/api/auth/logout", // Endpoint para cerrar sesión
    FORGOTPASSWORD: "http://localhost:3000/api/auth/forgotPassword",
    RESETPASSWORD: "http://localhost:3000/api/auth/restorePassword",
    VERIFYPASSWORD: "http://localhost:3000/api/auth/verifyCode",
  };

  const login = async (data) => {
    try {
      if (!data.email || !data.password) { // Corregido: data.email dos veces
        return { success: false, message: "Credenciales inválidas" };
      }
      // La petición de login se hace, y el backend se encarga de la cookie
      const response = await Requests(URLENDPOINTS.LOGIN, data, "POST");
      if (response.success) {
        // Después de un login exitoso, verificamos el token para obtener los datos del usuario
        await checkAuth();
      }
      return response;
    } catch (error) {
      // El hook Requests ya lanza un error con el mensaje del backend
      return { success: false, message: error.message };
    }
  };

  const checkAuth = async () => {
    try {
      const response = await Requests(URLENDPOINTS.VERIFY, null, "GET");
      if (response.isAuthenticated) {
        setUser(response.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Al cargar el provider, verificamos si ya hay una sesión activa
  useEffect(() => {
    checkAuth();
  }, []);



  return (
    <AuthContext.Provider
      value={{
        login,
        user,
        isAuthenticated,
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
