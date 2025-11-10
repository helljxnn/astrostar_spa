import apiClient from "../../../../../../../../shared/services/apiClient"; // Ajusta la ruta según tu proyecto

class SportsCategoriesService {
  /**
   * GET /api/sports-categories
   */
  async getAll(params = {}) {
    // Backend espera: page, limit, search, status (en inglés)
    return apiClient.get("/sports-categories", params);
  }

  /**
   * GET /api/sports-categories/:id
   */
  async getById(id) {
    return apiClient.get(`/sports-categories/${id}`);
  }

  /**
   * POST /api/sports-categories
   * 
   * Si NO usas uploads → JSON (recomendado si no hay archivo)
   * Si SÍ usas uploads → FormData (como ahora)
   */
  async create(data) {
    // ✅ Opción A: Solo JSON (si no hay archivo)
    if (!data.file) {
      return apiClient.post("/sports-categories", {
        name: data.name,
        description: data.description || null,
        minAge: Number(data.minAge),
        maxAge: Number(data.maxAge),
        gender: data.gender || "Mixed",
        status: data.status || "Active"
      });
    }

    // ✅ Opción B: FormData (si hay archivo)
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("minAge", data.minAge);
    formData.append("maxAge", data.maxAge);
    if (data.description) formData.append("description", data.description);
    formData.append("gender", data.gender || "Mixed");
    formData.append("status", data.status || "Active");
    
    if (data.file instanceof File) {
      formData.append("file", data.file); // ← Backend debe esperar "file"
    }

    return apiClient.post("/sports-categories", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }

  /**
   * PUT /api/sports-categories/:id
   */
  async update(id, data) {
    // ✅ JSON (sin archivo)
    if (!data.file) {
      return apiClient.put(`/sports-categories/${id}`, {
        name: data.name,
        description: data.description,
        minAge: data.minAge !== undefined ? Number(data.minAge) : undefined,
        maxAge: data.maxAge !== undefined ? Number(data.maxAge) : undefined,
        gender: data.gender,
        status: data.status
      });
    }

    // ✅ FormData (con archivo)
    const formData = new FormData();
    if (data.name !== undefined) formData.append("name", data.name);
    if (data.minAge !== undefined) formData.append("minAge", data.minAge);
    if (data.maxAge !== undefined) formData.append("maxAge", data.maxAge);
    if (data.description !== undefined) formData.append("description", data.description || "");
    if (data.gender !== undefined) formData.append("gender", data.gender);
    if (data.status !== undefined) formData.append("status", data.status);
    if (data.file instanceof File) formData.append("file", data.file);

    return apiClient.put(`/sports-categories/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }

  /**
   * DELETE /api/sports-categories/:id
   */
  async delete(id) {
    return apiClient.delete(`/sports-categories/${id}`);
  }

  /**
   * GET /api/sports-categories/stats
   */
  async getStats() {
    return apiClient.get("/sports-categories/stats");
  }

  /**
   * GET /api/sports-categories/check-name?name=...&excludeId=...
   */
  async checkName(name, excludeId = null) {
    const params = { name };
    if (excludeId) params.excludeId = excludeId;
    return apiClient.get("/sports-categories/check-name", { params });
  }
}

export default new SportsCategoriesService();