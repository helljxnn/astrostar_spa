import React, { memo } from 'react';
import { PERFORMANCE_CONFIG } from '../constants/performanceConfig.js';

/**
 * Loader optimizado que evita re-renders innecesarios
 */
const OptimizedLoader = memo(({ 
  show = false, 
  message = "Cargando...", 
  size = "medium",
  overlay = true,
  className = ""
}) => {
  if (!show) return null;

  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8", 
    large: "w-12 h-12"
  };

  const LoaderSpinner = () => (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-purple ${sizeClasses[size]}`} />
  );

  if (!overlay) {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <LoaderSpinner />
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3 shadow-xl">
        <LoaderSpinner />
        <span className="text-gray-700 font-medium">{message}</span>
      </div>
    </div>
  );
});

OptimizedLoader.displayName = 'OptimizedLoader';

/**
 * Hook para manejar loaders optimizados
 */
export const useOptimizedLoader = () => {
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("Cargando...");

  const showLoader = React.useCallback((msg = "Cargando...", operation = null, silent = false) => {
    if (!PERFORMANCE_CONFIG.performanceUtils?.shouldShowLoader(operation, silent)) {
      return;
    }
    setMessage(msg);
    setLoading(true);
  }, []);

  const hideLoader = React.useCallback(() => {
    setLoading(false);
  }, []);

  return {
    loading,
    message,
    showLoader,
    hideLoader
  };
};

export default OptimizedLoader;