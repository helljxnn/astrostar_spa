// Importa useMemo y useEffect (que ya tenías)
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Importamos useLocation
import ApiClient from "@shared/services/apiClient"; // Importamos ApiClient

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // Hooks
  const navigate = useNavigate();
  const location = useLocation(); // Obtenemos el objeto location

  // URLs para todo lo relacionado con la informacion del usuario
  const URLENDPOINTS = {
    LOGIN: "/auth/login", // Endpoint par la autenticacion del usuario
    PROFILE: "/auth/profile", // Endpoint para extraer los datos del usuario 
    LOGOUT: "/auth/logout", // Endpoint para cerrar sesión
    FORGOTPASSWORD: "/auth/forgotPassword", // Endpoint para la contraseña perdida
  };

  // 2. ÚNICA fuente de verdad para los datos del usuario
  const [user, setUser] = useState(null);
  // 3. Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  console.log(isAuthenticated);
  const checkAuthStatus = async () => {
    try {

      // Intenta obtener el perfil del usuario
      const profileResponse = await ApiClient.get(URLENDPOINTS.PROFILE);
      console.log(profileResponse);
      // Verifica si la respuesta es exitosa y contiene datos
      if (profileResponse.success && profileResponse.data) {
        const userData = profileResponse.data;
        // Actualiza el estado del usuario y la autenticación
        setUser(userData);
        // Guarda el estado de autenticación como verdadero
        setIsAuthenticated(true);
        navigate('/dashboard');
      } else {
        // Si no es exitoso, limpia el estado y redirige al login
        setUser(null);
        // Guarda el estado de autenticación como falso
        setIsAuthenticated(false);
        // Redirige al login
        navigate("/login")
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // ----- Persistencia de sesion ------
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // ----- VALORES DERIVADOS CON useMemo -----
  const userRole = useMemo(() => user?.role?.name || null, [user]);
  const userPermissions = useMemo(() => user?.role?.permissions || {}, [user]);

  // ----- FUNCIONES DE AUTENTICACIÓN -----

  const Login = async (data) => {
    try {

      // Validacion para evitar enviar datos vacios
      if (!data.email || !data.password) {
        return { success: false, message: "Credenciales inválidas" };
      }

      // Hacemos la petición de login
      const response = await ApiClient.post(URLENDPOINTS.LOGIN, data);
      // Si el login es exitoso, obtenemos el perfil del usuario
      console.log(response);
      if (response.success) {
        // Obtener el perfil del usuario
        const profileResponse = await ApiClient.get(URLENDPOINTS.PROFILE);
        // Verificar si la obtención del perfil fue exitosa
        if (profileResponse.success && profileResponse.data) {
          const userData = profileResponse.data;
          // Actualizar el estado del usuario y la autenticación
          setUser(userData);
          // Guardar el estado de autenticación como verdadero
          setIsAuthenticated(true);
          // Creamos una cookie 'bandera' para indicar que hay una sesión activa.
          // Esta cookie es accesible por JS y no contiene información sensible.
          document.cookie = "isLoggedIn=true; path=/; max-age=604800"; // max-age = 7 días
          navigate("/dashboard");
        } else {
          throw new Error("Login exitoso, pero falló al obtener el perfil.");
        }
      }
      return response;

    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, message: error.message || "Error al iniciar sesión" };
    }
  };

  const Logout = async () => {
    // Realizar la petición para cerrar sesión
    try {
      // Solicitud al endpoint de logout
      const response = await ApiClient.post(URLENDPOINTS.LOGOUT);
      // Si el cierre de sesión es exitoso, limpiar el estado y redirigir al login
      if (response.success) {
        // Limpiar el estado del usuario
        setUser(null);
        // Guardar el estado de autenticación como falso
        setIsAuthenticated(false);
        // Eliminamos la cookie 'bandera' al cerrar sesión.
        document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        // Redirigir al login
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
