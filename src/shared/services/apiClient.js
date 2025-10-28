/**
 * Cliente HTTP Base - Configuración compartida
 * Proporciona configuración común para todos los servicios
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Método base para realizar peticiones HTTP
   * @param {string} endpoint - Endpoint de la API
   * @param {object} options - Opciones de la petición
   * @returns {Promise} Respuesta de la API
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Agregar token de autenticación si existe
    const token = localStorage.getItem("authToken");
    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`;
    }

    const config = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, config);

      // Manejar errores de autenticación
      if (response.status === 401) {
        // Redirigir a login o refrescar token
        this.handleUnauthorized();
        throw new Error("No autorizado");
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
      throw error;
    }
  }

  /**
   * Manejar errores de autorización
   */
  handleUnauthorized() {
    localStorage.removeItem("authToken");
    // Redirigir a login si es necesario
    // window.location.href = '/login';
  }

  // Métodos de conveniencia
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: "GET" });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
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
