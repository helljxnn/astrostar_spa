import { usePermissions } from "../hooks/usePermissions";
import SmartRedirect from "./SmartRedirect";
import Dashboard from "../../features/dashboard/pages/Admin/pages/DashboardGraphics/Dashboard";

/**
 * Componente que maneja la página principal del dashboard
 * Si el usuario no tiene acceso al dashboard, lo redirige inteligentemente
 */
const DashboardHome = () => {
  const { hasModuleAccess, isAdmin, loading } = usePermissions();

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

