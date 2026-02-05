import { showGlobalLoader, hideGlobalLoader } from "./useLoader";

// Contador de peticiones activas
let activeRequests = 0;

// Función para mostrar loader si hay peticiones activas
const updateLoaderVisibility = () => {
  if (activeRequests > 0) {
    showGlobalLoader();
  } else {
    hideGlobalLoader();
  }
};

// Interceptor para axios
export const setupLoaderInterceptor = (axiosInstance) => {
  // Request interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      // Solo mostrar loader para peticiones que no tengan la flag skipLoader
      if (!config.skipLoader) {
        activeRequests++;
        updateLoaderVisibility();
      }
      return config;
    },
    (error) => {
      activeRequests--;
      updateLoaderVisibility();
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => {
      if (!response.config.skipLoader) {
        activeRequests--;
        updateLoaderVisibility();
      }
      return response;
    },
    (error) => {
      if (!error.config?.skipLoader) {
        activeRequests--;
        updateLoaderVisibility();
      }
      return Promise.reject(error);
    }
  );
};

// Función para hacer peticiones sin mostrar loader
export const withoutLoader = (config) => ({
  ...config,
  skipLoader: true,
});
