import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";
import Loader from "./Loader/Loader";

/**
 * Componente que redirige inteligentemente al usuario a la primera página
 * a la que tiene acceso, en lugar de mostrar "Acceso Denegado"
 */
const SmartRedirect = () => {
  const { hasModuleAccess, isAdmin, loading } = usePermissions();

  // Mostrar loading mientras se cargan los permisos
  if (loading) {
    return <Loader isVisible={true} message="Cargando..." />;
  }

  /**
   * Orden de prioridad para la redirección
   * Se evalúa en orden y redirige a la primera página accesible
   */
  const redirectPriority = [
    // 1. Dashboard (si tiene acceso)
    { path: "/dashboard/analytics", module: "dashboard", label: "Dashboard" },

    // 2. Gestión de citas (común para deportistas y acudientes)
    {
      path: "/dashboard/appointment-management",
      module: "appointmentManagement",
      label: "Gestión de Citas",
    },

    // 3. Módulos de deportistas
    {
      path: "/dashboard/athletes-section",
      module: "athletesSection",
      label: "Deportistas",
    },
    {
      path: "/dashboard/sports-category",
      module: "sportsCategory",
      label: "Categorías Deportivas",
    },
    {
      path: "/dashboard/athletes-assistance",
      module: "athletesAssistance",
      label: "Asistencia Deportistas",
    },
    {
      path: "/dashboard/enrollments",
      module: "enrollments",
      label: "Matrículas",
    },

    // 4. Módulos de servicios
    { path: "/dashboard/employees", module: "employees", label: "Empleados" },
    {
      path: "/dashboard/employees-schedule",
      module: "employeesSchedule",
      label: "Horarios",
    },
    { path: "/dashboard/classes", module: "classes", label: "Clases" },

    // 5. Módulos de eventos
    { path: "/dashboard/events", module: "eventsManagement", label: "Eventos" },
    {
      path: "/dashboard/temporary-workers",
      module: "temporaryWorkers",
      label: "Personas Temporales",
    },
    {
      path: "/dashboard/temporary-teams",
      module: "temporaryTeams",
      label: "Equipos Temporales",
    },

    // 6. Módulos de donaciones
    {
      path: "/dashboard/donations",
      module: "donationsManagement",
      label: "Donaciones",
    },
    {
      path: "/dashboard/donors-sponsors",
      module: "donorsSponsors",
      label: "Donantes/Patrocinadores",
    },

    // 7. Módulos de compras
    {
      path: "/dashboard/purchases",
      module: "purchasesManagement",
      label: "Compras",
    },
    { path: "/dashboard/providers", module: "providers", label: "Proveedores" },

    // 8. Módulos administrativos
    { path: "/dashboard/users", module: "users", label: "Usuarios" },
    { path: "/dashboard/roles", module: "roles", label: "Roles" },
    {
      path: "/dashboard/sportsequipment",
      module: "sportsEquipment",
      label: "Material Deportivo",
    },
  ];

  // Si es admin, redirigir al dashboard
  if (isAdmin) {
    return <Navigate to="/dashboard/analytics" replace />;
  }

  // Buscar la primera página a la que tiene acceso
  for (const route of redirectPriority) {
    if (hasModuleAccess(route.module)) {
      console.log(`🔄 Redirigiendo a: ${route.label} (${route.path})`);
      return <Navigate to={route.path} replace />;
    }
  }

  // Si no tiene acceso a ningún módulo, redirigir a página de no autorizado
  console.warn("⚠️ Usuario sin acceso a ningún módulo");
  return <Navigate to="/unauthorized" replace />;
};

export default SmartRedirect;
