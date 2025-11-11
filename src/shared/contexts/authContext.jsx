// Importa useMemo y useEffect (que ya tenías)
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ApiClient from "@shared/services/apiClient"; // Importamos ApiClient

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // Hooks
  const navigate = useNavigate();

  // URLs para todo lo relacionado con la informacion del usuario
  const URLENDPOINTS = {
    LOGIN: "/auth/login", // Endpoint par la autenticacion del usuario
    PROFILE: "/auth/profile", // Endpoint para extraer los datos del usuario 
    LOGOUT: "/auth/logout", // Endpoint para cerrar sesión
    FORGOTPASSWORD: "/auth/forgotPassword", // Endpoint para la contraseña perdida
    RESETPASSWORD: "/auth/restorePassword", // Endpoint para restaurar contraseña
    VERIFYPASSWORD: "/auth/verifyCode", // Endpoint para la verificacion del codigo de seguridad
  };

  // 2. ÚNICA fuente de verdad para los datos del usuario
  const [user, setUser] = useState(null);
  // 3. Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🔧 Función para transformar los permisos del usuario
  const formatUserPermissions = (rolePermissions) => {
    if (!Array.isArray(rolePermissions)) return {};
    const formatted = {};

    rolePermissions.forEach((permission) => {
      formatted[permission.name] = permission.privileges.map((p) => p.name);
    });

    return formatted;
  };



  // Funcion para buscar los permisos y privilegios del usuario
  // donde al momento de recargar el aplicativo no redirija al usuario al 
  // login o a una vista de no autorizado
  const checkAuthStatus = async () => {
    try {

      // Intenta obtener el perfil del usuario
      const profileResponse = await ApiClient.post(URLENDPOINTS.PROFILE);
      // Verifica si la respuesta es exitosa y contiene datos
      if (profileResponse.success && profileResponse.data) {
        const userData = profileResponse.data;
        // 🔹 Transformar permisos a formato manejable
        const permissions = formatUserPermissions(userData.role?.permissions);

        // 🔹 Guardamos toda la información del usuario, incluyendo permisos
        const fullUserData = {
          ...userData,
          permissions,
        };

        // Actualiza el estado del usuario y la autenticación
        setUser(fullUserData);
        // Guarda el estado de autenticación como verdadero
        setIsAuthenticated(true);

        // Navega al dashboard si el usuario está autenticado y no en una página pública.
        navigate("/dashboard");
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
    const publicRoutes = ["/login", "/forgot-password", "/reset-password"];
    if (!publicRoutes.includes(window.location.pathname)) {
      checkAuthStatus();
    }
  }, []); // <-- Array vacío para que se ejecute solo una vez al cargar la app

  // ----- VALORES DERIVADOS CON useMemo -----
  const userRole = useMemo(() => user?.role?.name || null, [user]);
  const userPermissions = useMemo(() => user?.permissions || {}, [user]);

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
      if (response.success) {
        // Obtener el perfil del usuario
        const profileResponse = await ApiClient.post(URLENDPOINTS.PROFILE);
        // Verificar si la obtención del perfil fue exitosa
        if (profileResponse.success && profileResponse.data) {
          const userData = profileResponse.data;
          const permissions = formatUserPermissions(userData.role?.permissions);

          // 🔹 Guardamos toda la información del usuario, incluyendo permisos
          const fullUserData = {
            ...userData,
            permissions,
          };

          // Actualizar el estado del usuario y la autenticación
          setUser(fullUserData);
          // Guardar el estado de autenticación como verdadero
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
    // Realizar la petición para cerrar sesión
    try {
      // Solicitud al endpoint de logout
      const response = await ApiClient.get(URLENDPOINTS.LOGOUT);
      // Si el cierre de sesión es exitoso, limpiar el estado y redirigir al login
      if (response.success) {
        // Limpiar el estado del usuario
        setUser(null);
        // Guardar el estado de autenticación como falso
        setIsAuthenticated(false);
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
