import { usePermissions } from "../hooks/usePermissions";
import { useDynamicPermissions } from "../hooks/useDynamicPermissions";
import { useAuth } from "../contexts/authContext";
import SmartRedirect from "./SmartRedirect";
import Dashboard from "../../features/dashboard/pages/Admin/pages/DashboardGraphics/Dashboard";

/**
 * Componente que maneja la página principal del dashboard
 * Si el usuario no tiene acceso al dashboard, lo redirige inteligentemente
 */
const DashboardHome = () => {
  const {
    hasModuleAccess: hasStaticAccess,
    isAdmin,
    loading: staticLoading,
  } = usePermissions();
  const { hasModuleAccess: hasDynamicAccess, loading: dynamicLoading } =
    useDynamicPermissions();
  const { user, userRole } = useAuth();

  // Normalizar el rol del usuario
  const normalizedRole = (user?.role?.name || user?.rol || userRole || "")
    .toString()
    .toLowerCase();
  const isAthleteOrGuardian =
    normalizedRole === "deportista" ||
    normalizedRole === "athlete" ||
    normalizedRole === "acudiente" ||
    normalizedRole === "guardian";

  // Determinar qué función de acceso usar
  const hasModuleAccess = isAthleteOrGuardian
    ? hasDynamicAccess
    : hasStaticAccess;
  const loading = isAthleteOrGuardian ? dynamicLoading : staticLoading;

  // Mostrar loading mientras se cargan los permisos
  if (loading) {
    return <div>Cargando...</div>;
  }

  // Si es admin o tiene acceso al dashboard, mostrar el dashboard
  if (isAdmin || hasModuleAccess("dashboard")) {
    return <Dashboard />;
  }

  // Si no tiene acceso, usar redirección inteligente
  return <SmartRedirect />;
};

export default DashboardHome;
