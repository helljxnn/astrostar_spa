import React from 'react';
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../shared/contexts/authContext.jsx";
import { usePermissions } from '../shared/hooks/usePermissions.js';
import { motion } from 'framer-motion';

/**
 * Componente para proteger rutas basado en roles y permisos
 */
const PrivateRoute = ({
  allowedRoles, // Sistema legacy - array de roles
  module,       // Sistema nuevo - módulo específico
  action = 'Ver', // Sistema nuevo - acción específica
  fallbackPath = '/dashboard',
  showFallback = true,
  children
}) => {
  // Usamos useAuth para la autenticación básica y usePermissions para la lógica de permisos.
  const { isAuthenticated, userRole } = useAuth();
  const { isAdmin, hasPermission, hasModuleAccess } = usePermissions();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si no hay permisos cargados todavía (caso inicial), podríamos mostrar un loader.
  // Por ahora, si no está autenticado, ya lo hemos redirigido.
  // Si está autenticado pero los permisos son null, las comprobaciones de abajo fallarán y denegarán el acceso.
  // Esto es un comportamiento seguro.


  // Si es admin, permitir acceso a todo
  if (isAdmin) {
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
    return <Navigate to="/unauthorized" replace />;
  }

  // Si hay children, devolver los children, de lo contrario devolver Outlet
  return children ? children : <Outlet />;
};

/**
 * Componente para mostrar cuando no se tienen permisos
 */
const AccessDenied = () => {
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
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors"
        >
          Volver
        </motion.button>
      </motion.div>
    </div>
  );
};

export default PrivateRoute;
