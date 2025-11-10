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

    // Config base
    const defaultOptions = {
      // Incluir credenciales (cookies) en todas las peticiones
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Combinar opciones finales
    const config = { ...defaultOptions, ...options };

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

          if (!refreshResponse.ok) {
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

  async post(endpoint, data, options = {}) {
    const config = {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...options,
    };
    if (!(data instanceof FormData)) {
      config.headers = {
        ...config.headers,
        "Content-Type": "application/json",
      };
    }
    return this.request(endpoint, config);
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
