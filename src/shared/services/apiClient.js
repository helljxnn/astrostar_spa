const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.isRefreshing = false;
    this.failedQueue = [];
    this.accessToken = null; // Almacenar en memoria, NO en localStorage
  }

  // Establecer access token en memoria
  setAccessToken(token) {
    this.accessToken = token;
  }

  // Obtener access token desde memoria
  getAccessToken() {
    return this.accessToken;
  }

  // Limpiar access token
  clearAccessToken() {
    this.accessToken = null;
  }

  processQueue(error, token = null) {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  async refreshAccessToken() {
    try {
      // El refresh token está en una cookie HttpOnly, no necesitamos enviarlo
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Importante: enviar cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();
      const newAccessToken = data.data.accessToken;
      
      // Almacenar en memoria, NO en localStorage
      this.setAccessToken(newAccessToken);
      return newAccessToken;
    } catch (error) {
      // Si falla el refresh, limpiar todo y redirigir
      this.handleUnauthorized();
      throw error;
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Config base
    const defaultOptions = {
      method: "GET",
      headers: {},
      credentials: "include", // Importante: siempre enviar cookies
    };

    // Si el body no es FormData, setear JSON
    if (!(options.body instanceof FormData)) {
      defaultOptions.headers["Content-Type"] = "application/json";
    }

    // Token de autenticación desde memoria
    const token = this.getAccessToken();
    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`;
    }

    // Combinar opciones finales - IMPORTANTE: mergear headers correctamente
    const config = { 
      ...defaultOptions, 
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {})
      }
    };

    try {
      const response = await fetch(url, config);

      // Manejo de errores HTTP
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Si es 401 o 403 y el mensaje indica problema con el token, intentar refresh
        if ((response.status === 401 || response.status === 403) && 
            (errorData.message === "Token expirado" || 
             errorData.message === "Token de acceso requerido" ||
             errorData.message === "Token inválido")) {
          
          if (this.isRefreshing) {
            // Si ya estamos refrescando, agregar a la cola
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(token => {
                config.headers.Authorization = `Bearer ${token}`;
                return fetch(url, config).then(res => {
                  if (!res.ok) throw new Error('Retry failed');
                  return res.json();
                });
              })
              .catch(err => {
                throw err;
              });
          }

          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            this.processQueue(null, newToken);
            
            // Reintentar la petición original con el nuevo token
            config.headers.Authorization = `Bearer ${newToken}`;
            const retryResponse = await fetch(url, config);
            
            if (!retryResponse.ok) {
              const retryErrorData = await retryResponse.json().catch(() => ({}));
              throw new Error(retryErrorData.message || `Error HTTP ${retryResponse.status}`);
            }

            const contentType = retryResponse.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              return await retryResponse.json();
            }
            return await retryResponse.text();
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            throw refreshError;
          } finally {
            this.isRefreshing = false;
          }
        }
        
        if (response.status === 401) {
          // Redirigir al login después de un pequeño delay
          setTimeout(() => {
            this.handleUnauthorized();
          }, 100);
          
          throw new Error(errorData.message || "Token inválido");
        }
        
        throw new Error(
          errorData.message || `Error HTTP ${response.status}`
        );
      }

      // Algunos endpoints no devuelven JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }
      return await response.text();
    } catch (error) {
      throw error;
    }
  }

  handleUnauthorized() {
    this.clearAccessToken();
    localStorage.removeItem("user");
    // Redirigir al login
    window.location.href = "/login";
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: "GET" });
  }

  async post(endpoint, data) {
    const isFormData = data instanceof FormData;
    const body = isFormData ? data : JSON.stringify(data);
    return this.request(endpoint, {
      method: "POST",
      body,
      // ⚠️ No forzar headers si es FormData
      headers: isFormData ? {} : { "Content-Type": "application/json" },
    });
  }

  async put(endpoint, data) {
    const isFormData = data instanceof FormData;
    const body = isFormData ? data : JSON.stringify(data);
    return this.request(endpoint, {
      method: "PUT",
      body,
      headers: isFormData ? {} : { "Content-Type": "application/json" },
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

export default new ApiClient();
