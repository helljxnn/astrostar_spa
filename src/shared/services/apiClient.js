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

  /**
   * Método base para realizar peticiones HTTP
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const defaultOptions = {
      // Incluir credenciales (cookies) en todas las peticiones
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const config = { ...defaultOptions, ...options };

    try {
      let response = await fetch(url, config);

      // Si el token de acceso ha expirado (401)
      if (response.status === 401) {
        if (this.isRefreshing) {
          // Si ya se está refrescando, encolamos la petición para reintentarla después
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          })
            .then(() => {
              // Reintentar la petición original
              return fetch(url, config);
            })
            .then((res) => res.json());
        }

        this.isRefreshing = true;

        return new Promise(async (resolve, reject) => {
          try {
            // Intentamos obtener un nuevo token de acceso
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

            // Procesamos la cola de peticiones fallidas con éxito
            this.processQueue(null);
            // Reintentamos la petición original
            response = await fetch(url, config);
            resolve(response.json());
          } catch (error) {
            // Si el refresh token falla, procesamos la cola con error y deslogueamos
            this.processQueue(error);
            this.handleUnauthorized();
            reject(error);
          } finally {
            this.isRefreshing = false;
          }
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
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
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

export default new ApiClient();
