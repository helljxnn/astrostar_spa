const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Config base
    const defaultOptions = {
      method: "GET",
      headers: {},
    };

    // 🔑 Si el body no es FormData, setear JSON
    if (!(options.body instanceof FormData)) {
      defaultOptions.headers["Content-Type"] = "application/json";
    }

    // 🔐 Token de autenticación
    const token = localStorage.getItem("authToken");
    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`;
    }

    // Combinar opciones finales
    const config = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        this.handleUnauthorized();
        throw new Error("No autorizado");
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
      console.error("🚨 Error en la solicitud:", error);
      throw error;
    }
  }

  handleUnauthorized() {
    localStorage.removeItem("authToken");
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
