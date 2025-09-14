import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../shared/contexts/authContext.jsx";

const PrivateRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, userRole } = useAuth();

  console.log("PrivateRoute - isAuthenticated:", isAuthenticated);
  console.log("PrivateRoute - userRole:", userRole);
  console.log("PrivateRoute - allowedRoles:", allowedRoles);

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    console.log("No autenticado, redirigiendo a login");
    return <Navigate to="/login" />;
  }

  // Verificar si el rol del usuario está en la lista de roles permitidos
  if (!allowedRoles.includes(userRole)) {
    console.log("Rol no autorizado, redirigiendo a unauthorized");
    return <Navigate to="/unauthorized" />;
  }

  console.log("Acceso permitido para el rol:", userRole);
  // Si hay children, devolver los children, de lo contrario devolver Outlet
  return children ? children : <Outlet />;
};

export default PrivateRoute;
