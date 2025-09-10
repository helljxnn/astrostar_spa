import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");
    if (token) {
      setIsAuthenticated(true);
      setUserRole(role);
      console.log("AuthContext - Sesión restaurada:", { token, role });
    } else {
      console.log("AuthContext - No hay sesión guardada");
    }
  }, []);

const login = (userData) => {
  console.log("AuthContext - Intentando login con:", userData);
  
  // Definir usuarios y sus roles
  const users = [
    { email: "admin@example.com", password: "admin123", role: "admin" },
    { email: "pro@example.com", password: "pro123", role: "profesional_deportivo" },
    { email: "salud@example.com", password: "salud123", role: "profesional_salud" },
    { email: "deportista@example.com", password: "dep123", role: "deportista" },
    { email: "acudiente@example.com", password: "acu123", role: "acudiente" }
  ];
  
  // Buscar el usuario que coincida con las credenciales
  const user = users.find(u => u.email === userData.email && u.password === userData.password);
  
  if (user) {
    const token = `fake-${user.role}-token`;
    setIsAuthenticated(true);
    setUserRole(user.role);
    localStorage.setItem("authToken", token);
    localStorage.setItem("userRole", user.role);
    console.log("AuthContext - Login exitoso:", { role: user.role, token });
    return true;
  }
  
  console.log("AuthContext - Login fallido: credenciales incorrectas");
  return false;
};


  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
