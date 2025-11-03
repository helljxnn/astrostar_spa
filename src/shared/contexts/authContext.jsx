// Importa useMemo y useEffect (que ya tenías)
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Requests from "../hooks/requests";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // Hooks
  const navigate = useNavigate();

  // URLs para todo lo relacionado con la informacion del usuario
  const URLENDPOINTS = {
    LOGIN: "http://localhost:3000/api/auth/login", // Endpoint par la autenticacion del usuario
    PROFILE: "http://localhost:3000/api/auth/profile", // Endpoint para extraer los datos del usuario 
    LOGOUT: "http://localhost:3000/api/auth/logout", // Endpoint para cerrar sesión
    FORGOTPASSWORD: "http://localhost:3000/api/auth/forgotPassword", // Endpoint para la contraseña perdida
    RESETPASSWORD: "http://localhost:3000/api/auth/restorePassword", // Endpoint para restaurar contraseña
    VERIFYPASSWORD: "http://localhost:3000/api/auth/verifyCode", // Endpoint para la verificacion del codigo de seguridad
  };

  // 2. ÚNICA fuente de verdad para los datos del usuario
  const [user, setUser] = useState(null);

  // 3. Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  // Funcion para buscar los permisos y privilegios del usuario
  // donde al momento de recargar el aplicativo no redirija al usuario al 
  // login o a una vista de no autorizado
  const checkAuthStatus = async () => {
      try {
        const profileResponse = await Requests(URLENDPOINTS.PROFILE, null, "GET");
        if (profileResponse.success && profileResponse.data) {
          setUser(profileResponse.data);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      }
    };

  // ----- Persistencia de sesion ------
  useEffect(() => {    
    checkAuthStatus();
  }, []); // <-- Array vacío para que se ejecute solo una vez al cargar la app

  // ----- VALORES DERIVADOS CON useMemo -----
  const userRole = useMemo(() => user?.role?.name || null, [user]);
  const userPermissions = useMemo(() => user?.role?.permissions || null, [user]);

  // ----- FUNCIONES DE AUTENTICACIÓN -----

  const Login = async (data) => {
    try {

      // Validacion para evitar enviar datos vacios
      if (!data.email || !data.password) {
        return { success: false, message: "Credenciales inválidas" };
      }

      // 
      const response = await Requests(URLENDPOINTS.LOGIN, data, "POST");

      if (response.success) {
        const profileResponse = await Requests(URLENDPOINTS.PROFILE, null, "GET");

        if (profileResponse.success && profileResponse.data) {
          setUser(profileResponse.data);
          setIsAuthenticated(true);
        } else {
          throw new Error("Login exitoso, pero falló al obtener el perfil.");
        }
        navigate("/dashboard");
      }
      return response;

    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, message: error.message || "Error al iniciar sesión" };
    }
  };

  const Logout = async () => {
    try {
      const response = await Requests(URLENDPOINTS.LOGOUT, null,"GET");
      if(response.success){
        setUser(null);
        setIsAuthenticated(false);
        navigate("/login");
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } 
  };

  return (
    <AuthContext.Provider
      value={{
        Login,
        Logout,
        user,
        isAuthenticated,
        userRole,
        userPermissions,
      }}
    >
      {/* Renderizamos los componentes hijos que envuelven al Provider */}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};