import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../shared/contexts/authContext.jsx";
import { usePermissions } from "../shared/hooks/usePermissions";
import Loader from "../shared/components/Loader/Loader";
import { paymentsService } from "../features/dashboard/pages/Admin/pages/Athletes/Payments/services/PaymentsService";

/**
 * Hook para verificar restricciones de acceso del atleta
 * Consulta el endpoint /api/payments/athletes/:athleteId/access-check
 */
const usePaymentAccessCheck = (athleteId, isAthleteOrGuardian, currentModule) => {
  const [accessData, setAccessData] = useState(null);
  const [checkDone, setCheckDone] = useState(false);

  useEffect(() => {
    // Solo hacer el check si es deportista/acudiente y NO está ya en mis-pagos
    if (!isAthleteOrGuardian || !athleteId || currentModule === "myPayments") {
      setCheckDone(true);
      return;
    }

    let cancelled = false;
    paymentsService.checkAthleteAccess(athleteId)
      .then((res) => {
        if (!cancelled) {
          setAccessData(res.data || res);
          setCheckDone(true);
        }
      })
      .catch(() => {
        // Si falla la verificación, no bloquear— asumir sin restricción
        if (!cancelled) setCheckDone(true);
      });

    return () => { cancelled = true; };
  }, [athleteId, isAthleteOrGuardian, currentModule]);

  return { accessData, checkDone };
};

/**
 * Componente para proteger rutas basado en roles y permisos
 */
const PrivateRoute = ({
  allowedRoles, // Sistema legacy - array de roles
  module, // Sistema nuevo - módulo específico
  action = "Ver", // Sistema nuevo - acción específica
  fallbackPath = "/dashboard",
  showFallback = true,
  children,
}) => {
  // ── Todos los hooks al inicio (reglas de React Hooks) ──
  const { isAuthenticated, userRole, isLoading, user } = useAuth();
  const { hasPermission, hasModuleAccess, loading, isAdmin, permissions } = usePermissions();

  // Calcular role antes de llamar al hook (el hook usa estos valores internamente)
  const normalizedRole = (user?.role?.name || user?.rol || userRole || "").toString().toLowerCase();
  const isAthleteOrGuardian =
    normalizedRole === "deportista" ||
    normalizedRole === "athlete" ||
    normalizedRole === "acudiente" ||
    normalizedRole === "guardian";

  // Hook de acceso pagos — SIEMPRE se llama, la lógica interna decide si hace fetch
  const { accessData, checkDone } = usePaymentAccessCheck(
    user?.athlete?.id || user?.athleteId,
    isAthleteOrGuardian,
    module
  );

  // ── Early returns (después de los hooks) ──

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return <Loader isVisible={true} message="Verificando autenticación..." />;
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Mostrar loading mientras se cargan los permisos
  if ((module || action !== "Ver") && (loading || permissions === null)) {
    return <Loader isVisible={true} message="Cargando permisos..." />;
  }

  // Si es admin, permitir acceso a todo EXCEPTO módulos específicos de deportistas
  if (isAdmin) {
    // EXCEPCIÓN: Los administradores NO deben ver "Mis Pagos" (es solo para deportistas/acudientes)
    if (module === "myPayments") {
      if (showFallback) {
        return <Navigate to="/unauthorized" replace />;
      }
      return <Navigate to={fallbackPath} replace />;
    }
    return children ? children : <Outlet />;
  }

  // ── Lógica de acceso para deportistas/acudientes ──

  // Mientras no termine el check de pagos, mostrar loader
  if (isAthleteOrGuardian && module !== "myPayments" && !checkDone) {
    return <Loader isVisible={true} message="Verificando acceso..." />;
  }

  // Si el check detecta restricción, redirigir a Mis Pagos
  if (
    isAthleteOrGuardian &&
    module !== "myPayments" &&
    checkDone &&
    accessData?.restricted
  ) {
    return <Navigate to="/dashboard/athlete-payments" replace />;
  }

  // EXCEPCIÓN: Deportistas y acudientes siempre tienen acceso a Gestión de Citas
  if (module === "appointmentManagement" && isAthleteOrGuardian) {
    return children ? children : <Outlet />;
  }

  // EXCEPCIÓN: Deportistas y acudientes siempre tienen acceso a Mis Pagos
  if (module === "myPayments" && isAthleteOrGuardian) {
    return children ? children : <Outlet />;
  }

  // Verificación por permisos granulares
  if (module) {
    // Verificar permisos específicos
    if (action && !hasPermission(module, action)) {
      if (showFallback) {
        return <Navigate to="/unauthorized" replace />;
      }
      return <Navigate to={fallbackPath} replace />;
    }

    // Verificar acceso al módulo (cualquier acción)
    if (!action && !hasModuleAccess(module)) {
      if (showFallback) {
        return <Navigate to="/unauthorized" replace />;
      }
      return <Navigate to={fallbackPath} replace />;
    }

    return children ? children : <Outlet />;
  }

  // SISTEMA LEGACY: Verificación por roles (mantener compatibilidad)
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }

  // Si hay children, devolver los children, de lo contrario devolver Outlet
  return children ? children : <Outlet />;
};

export default PrivateRoute;


PrivateRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  module: PropTypes.string,
  action: PropTypes.string,
  fallbackPath: PropTypes.string,
  showFallback: PropTypes.bool,
  children: PropTypes.node,
};


