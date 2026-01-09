import { useState, useCallback } from "react";

// Estado global del loader
let globalLoaderState = {
  isLoading: false,
  message: "Cargando...",
  listeners: new Set(),
};

// Función para notificar a todos los listeners
const notifyListeners = () => {
  globalLoaderState.listeners.forEach((listener) => listener());
};

// Hook para manejar el loader
export const useLoader = () => {
  const [, forceUpdate] = useState({});

  // Función para forzar re-render
  const updateComponent = useCallback(() => {
    forceUpdate({});
  }, []);

  // Registrar listener al montar el componente
  useState(() => {
    globalLoaderState.listeners.add(updateComponent);
    return () => {
      globalLoaderState.listeners.delete(updateComponent);
    };
  });

  const showLoader = useCallback((message = "Cargando...") => {
    globalLoaderState.isLoading = true;
    globalLoaderState.message = message;
    notifyListeners();
  }, []);

  const hideLoader = useCallback(() => {
    globalLoaderState.isLoading = false;
    notifyListeners();
  }, []);

  const setLoaderMessage = useCallback((message) => {
    globalLoaderState.message = message;
    notifyListeners();
  }, []);

  return {
    isLoading: globalLoaderState.isLoading,
    message: globalLoaderState.message,
    showLoader,
    hideLoader,
    setLoaderMessage,
  };
};

// Funciones utilitarias para usar sin hook
export const showGlobalLoader = (message = "Cargando...") => {
  globalLoaderState.isLoading = true;
  globalLoaderState.message = message;
  notifyListeners();
};

export const hideGlobalLoader = () => {
  globalLoaderState.isLoading = false;
  notifyListeners();
};

export const setGlobalLoaderMessage = (message) => {
  globalLoaderState.message = message;
  notifyListeners();
};
