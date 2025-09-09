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
    }
  }, []);

  const login = (userData) => {
    // Lógica para el usuario quemado
    if (userData.email === "admin@example.com" && userData.password === "admin123") {
      const token = "fake-admin-token";
      setIsAuthenticated(true);
      setUserRole("admin");
      localStorage.setItem("authToken", token);
      localStorage.setItem("userRole", "admin");
      return true;
    }
    // Si no coincide con las credenciales quemadas
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
