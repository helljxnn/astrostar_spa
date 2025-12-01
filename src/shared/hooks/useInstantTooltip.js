import { useEffect } from 'react';
import { initInstantTooltips } from '../utils/instantTooltip';

/**
 * Custom hook para inicializar tooltips instantáneos
 * Se debe usar en el componente raíz de la aplicación (App.jsx)
 */
export function useInstantTooltip() {
  useEffect(() => {
    // Inicializar tooltips
    const cleanup = initInstantTooltips();

    // Limpiar event listeners al desmontar
    return cleanup;
  }, []);
}
