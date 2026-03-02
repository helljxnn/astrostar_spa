import apiClient from "../../../../../../../../shared/services/apiClient";

class CategoriesService {
  constructor() {
    this.endpoint = "/materials/categories";
  }

  async getCategories(params = {}) {
    const { page = 1, limit = 10, search = "", estado = "" } = params;

    const queryParams = {
      page,
      limit,
      search: search.toString().trim(),
    };

    if (estado) {
      queryParams.estado = estado;
    }

    const response = await apiClient.get(this.endpoint, queryParams);

    if (response.success && response.data) {
      response.data = response.data.map((cat) =>
        this.transformFromBackend(cat),
      );
      // Ordenar alfabéticamente
      response.data.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    return response;
  }

  async getActiveCategories() {
    const response = await apiClient.get(`${this.endpoint}/active`);

    if (response.success && response.data) {
      response.data = response.data.map((cat) =>
        this.transformFromBackend(cat),
      );
    }

    return response;
  }

  async getCategoryById(id) {
    if (!id) {
      throw new Error("ID de la categoría es requerido");
    }
    const response = await apiClient.get(`${this.endpoint}/${id}`);

    if (response.success && response.data) {
      response.data = this.transformFromBackend(response.data);
    }

    return response;
  }

  async createCategory(data) {
    // Aceptar tanto string como objeto
    const nombre = typeof data === "string" ? data : data.nombre;
    const descripcion = typeof data === "object" ? data.descripcion : "";
    const estado = typeof data === "object" ? data.estado : "Activo";

    if (!nombre || !nombre.trim()) {
      throw new Error("El nombre de la categoría es requerido");
    }

    const payload = {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || "",
      estado: estado || "Activo",
    };

    try {
      const response = await apiClient.post(this.endpoint, payload);

      if (response.success && response.data) {
        response.data = this.transformFromBackend(response.data);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateCategory(id, data) {
    if (!id) {
      throw new Error("ID de la categoría es requerido");
    }

    const payload = {
      nombre: data.nombre.trim(),
      descripcion: data.descripcion?.trim() || "",
      estado: data.estado,
    };

    const response = await apiClient.put(`${this.endpoint}/${id}`, payload);

    if (response.success && response.data) {
      response.data = this.transformFromBackend(response.data);
    }

    return response;
  }

  async toggleStatus(id) {
    if (!id) {
      throw new Error("ID de la categoría es requerido");
    }

    return apiClient.patch(`${this.endpoint}/${id}/status`);
  }

  async deleteCategory(id) {
    if (!id) {
      throw new Error("ID de la categoría es requerido");
    }

    return apiClient.delete(`${this.endpoint}/${id}`);
  }

  async checkCategoryExists(nombre, excludeId = null) {
    try {
      const params = {
        nombre: nombre.trim(),
      };

      if (excludeId) {
        params.excludeId = excludeId;
      }

      const response = await apiClient.get(
        `${this.endpoint}/check-name`,
        params,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  transformFromBackend(backendData) {
    if (!backendData) return null;

    return {
      id: backendData.id,
      nombre: backendData.nombre || backendData.name || "",
      descripcion: backendData.descripcion || backendData.description || "",
      estado: backendData.estado || backendData.status || "Activo",
      createdAt: backendData.createdAt || backendData.created_at || "",
      updatedAt: backendData.updatedAt || backendData.updated_at || "",
      createdBy: backendData.createdBy || backendData.created_by || null,
      updatedBy: backendData.updatedBy || backendData.updated_by || null,
      materialsCount: backendData._count?.materials || 0,
    };
  }
}

export default new CategoriesService();
