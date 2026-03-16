import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../shared/contexts/authContext.jsx";
import { usePermissions } from "../shared/hooks/usePermissions";
import { motion } from "framer-motion";
import Loader from "../shared/components/Loader/Loader";
import PaymentsService from "../features/dashboard/pages/Admin/pages/Athletes/Payments/services/PaymentsService";

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
    PaymentsService.checkAthleteAccess(athleteId)
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
  const { hasPermission, hasModuleAccess, loading, isAdmin } = usePermissions();

  // Calcular role antes de llamar al hook (el hook usa estos valores internamente)
  const normalizedRole = (user?.role?.name || user?.rol || userRole || "").toString().toLowerCase();
  const isAthleteOrGuardian =
    normalizedRole === "deportista" ||
    normalizedRole === "athlete" ||
    normalizedRole === "acudiente" ||
    normalizedRole === "guardian";

  // Hook de acceso pagos — SIEMPRE se llama, la lógica interna decide si hace fetch
  const { accessData, checkDone } = usePaymentAccessCheck(
    user?.athleteId,
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
  if ((module || action !== "Ver") && loading) {
    return <Loader isVisible={true} message="Cargando permisos..." />;
  }

  // Si es admin, permitir acceso a todo EXCEPTO módulos específicos de deportistas
  if (isAdmin) {
    // EXCEPCIÓN: Los administradores NO deben ver "Mis Pagos" (es solo para deportistas/acudientes)
    if (module === "myPayments") {
      if (showFallback) {
        return <AccessDenied />;
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
        return <AccessDenied />;
      }
      return <Navigate to={fallbackPath} replace />;
    }

    // Verificar acceso al módulo (cualquier acción)
    if (!action && !hasModuleAccess(module)) {
      if (showFallback) {
        return <AccessDenied />;
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

/**
 * Componente para mostrar cuando no se tienen permisos
 */
const AccessDenied = () => {
  const handleGoBack = () => {
    // Si hay historial, ir atrás, sino ir al dashboard principal
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-6xl mb-4"
        >
          🔒
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Acceso Denegado
        </h2>
        <p className="text-gray-600 mb-6">
          No tienes permisos para acceder a esta sección.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoBack}
          className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors"
        >
          Volver
        </motion.button>
      </motion.div>
    </div>
  );
};

export default PrivateRoute;

