const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.isRefreshing = false;
    this.failedQueue = [];

    this.processQueue = (error, token = null) => {
      this.failedQueue.forEach((prom) => {
        if (error) {
          prom.reject(error);
        } else {
          prom.resolve(token);
        }
      });
      this.failedQueue = [];
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Configuración base sin Content-Type por defecto
    const defaultOptions = {
      // Incluir credenciales (cookies) en todas las peticiones
      credentials: "include",
      headers: {}, // Lo dejamos vacío por defecto
    };

    // Combinar opciones finales
    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    // Si el cuerpo NO es FormData y no se ha especificado un Content-Type,
    // asumimos que es JSON.
    if (!(config.body instanceof FormData) && !config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    // Si es FormData, eliminamos explícitamente el Content-Type para que
    // el navegador lo genere automáticamente con el 'boundary'.
    if (config.body instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    try {
      let response = await fetch(url, config);

      // Si el token de acceso ha expirado (401)
      if (response.status === 401) {
        // Si ya hay un proceso de refresco en curso, encolamos la petición.
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(() => {
            // Una vez que el token se refresque, reintentamos la petición original.
            return this.request(endpoint, options);
          });
        }

        this.isRefreshing = true;

        try {
          // Intentamos obtener un nuevo token de acceso.
          const refreshResponse = await fetch(
            `${this.baseURL}/auth/refreshToken`,
            {
              method: "POST",
              credentials: "include",
            }
          );

          // Asumiendo que el refresh devuelve un JSON con { success: true }
          const refreshResult = await refreshResponse.json();
          if (!refreshResponse.ok || !refreshResult.success) {
            throw new Error("Failed to refresh token");
          }

          // Si el refresco es exitoso, procesamos la cola de peticiones pendientes.
          this.processQueue(null);
          // Y reintentamos la petición original que falló.
          return this.request(endpoint, options);
        } catch (error) {
          // Si el refresh token falla, procesamos la cola con error y deslogueamos.
          this.processQueue(error);
          this.handleUnauthorized();
          throw error; // Lanzamos el error para que la llamada original falle.
        } finally {
          this.isRefreshing = false;
        }
      }

      // Manejo de errores HTTP
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP ${response.status}`);
      }

      // Algunos endpoints no devuelven JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }
      return await response.text();
    } catch (error) {
      console.error("🚨 API Request failed:", error);
      if (error.message === "Failed to refresh token") {
        this.handleUnauthorized();
      }
      throw error;
    }
  }

  handleUnauthorized() {
    // Limpiamos cualquier dato de sesión y redirigimos al login
    // Esta es una forma segura de forzar el logout desde cualquier parte de la app.
    window.location.href = "/login";
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: "GET" });
  }

  // El método post ahora es más simple, solo pasa los datos
  async post(endpoint, data, options = {}) {
    const config = {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...options,
    };
    return this.request(endpoint, config);
  }

  async put(endpoint, data, options = {}) {
    const config = {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...options,
    };
    return this.request(endpoint, config);
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

export default new ApiClient();
