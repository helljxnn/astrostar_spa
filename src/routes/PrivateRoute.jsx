import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../shared/contexts/authContext.jsx";

const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
