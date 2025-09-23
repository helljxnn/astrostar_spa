import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../shared/contexts/authContext.jsx";

const PrivateRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, userRole } = useAuth();
<<<<<<< HEAD

  console.log("PrivateRoute - isAuthenticated:", isAuthenticated);
  console.log("PrivateRoute - userRole:", userRole);
  console.log("PrivateRoute - allowedRoles:", allowedRoles);
=======
  

>>>>>>> 9358916994bcb3af4fb559d19496a18cf28dcca2

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Verificar si el rol del usuario está en la lista de roles permitidos
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }

  // Si hay children, devolver los children, de lo contrario devolver Outlet
  return children ? children : <Outlet />;
};

export default PrivateRoute;
