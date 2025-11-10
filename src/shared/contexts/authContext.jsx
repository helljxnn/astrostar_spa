import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (loginData) => {
    // Intentar login real con backend primero (silencioso)
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          const userToStore = result.data.user;
          const token = result.data.token;
          
          setIsAuthenticated(true);
          setUser(userToStore);
          localStorage.setItem("authToken", token);
          localStorage.setItem("user", JSON.stringify(userToStore));
          return true;
        }
      }
    } catch (error) {
      // Silencioso: el backend no está disponible, usar fallback
    }

    // Fallback: usar usuarios hardcodeados si el backend no está disponible
    const users = [
      {
        id: 1,
        email: "admin@example.com",
        password: "admin123",
        rol: "admin",
        nombre: "Admin",
        apellido: "Astro",
        tipoDocumento: "CC",
        identificacion: "123456789",
        correo: "admin@example.com",
        telefono: "3001234567",
        avatar: null,
      },
      {
        id: 6,
        email: "jenniferl.sosa15@gmail.com",
        password: "ZaEt8%2w84p4",
        rol: "admin",
        role: {
          name: "admin",
          permissions: {} // Los permisos de admin se generan automáticamente
        },
        nombre: "Jennifer",
        apellido: "Sosa",
        tipoDocumento: "CC",
        identificacion: "1234567890",
        correo: "jenniferl.sosa15@gmail.com",
        telefono: "3001234567",
        avatar: null,
      },
      {
        id: 2,
        email: "pro@example.com",
        password: "pro123",
        rol: "profesional_deportivo",
        nombre: "Carlos",
        apellido: "Ruiz",
        tipoDocumento: "CC",
        identificacion: "987654321",
        correo: "pro@example.com",
        telefono: "3017654321",
        avatar: null,
      },
      {
        id: 3,
        email: "salud@example.com",
        password: "salud123",
        rol: "profesional_salud",
        nombre: "Ana",
        apellido: "Pérez",
        tipoDocumento: "CE",
        identificacion: "1122334455",
        correo: "salud@example.com",
        telefono: "3021122334",
        avatar: null,
      },
      {
        id: 4,
        email: "deportista@example.com",
        password: "dep123",
        rol: "deportista",
        nombre: "Juan",
        apellido: "Pérez",
        tipoDocumento: "TI",
        identificacion: "100200300",
        correo: "deportista@example.com",
        telefono: "3032003000",
        avatar: null,
      },
      {
        id: 5,
        email: "acudiente@example.com",
        password: "acu123",
        rol: "acudiente",
        nombre: "Maria",
        apellido: "Gómez",
        tipoDocumento: "CC",
        identificacion: "55667788",
        correo: "acudiente@example.com",
        telefono: "3045566778",
        avatar: null,
      },
    ];

    const foundUser = users.find(
      (u) => u.email === loginData.email && u.password === loginData.password
    );

    if (foundUser) {
      const token = `fake-${foundUser.rol}-token`;
      const userToStore = { ...foundUser };
      delete userToStore.password; // No guardar la contraseña

      setIsAuthenticated(true);
      setUser(userToStore);
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(userToStore));
      return true;
    }

    return false;
  };

  const updateUser = (updatedData) => {
    setUser((prevUser) => {
      const newUser = { ...prevUser, ...updatedData };
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
