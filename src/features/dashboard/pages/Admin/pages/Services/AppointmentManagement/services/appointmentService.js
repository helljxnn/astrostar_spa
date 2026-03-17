import apiClient from "../../../../../../../../shared/services/apiClient";

class AppointmentService {
  constructor() {
    this.endpoint = "/appointments";
  }

  async getAll(params = {}) {
    return apiClient.get(this.endpoint, params);
  }

  async getById(id) {
    return apiClient.get(`${this.endpoint}/${id}`);
  }

  async getAthletes() {
    return apiClient.get(`${this.endpoint}/athletes`);
  }

  async getSpecialists(params = {}) {
    return apiClient.get(`${this.endpoint}/specialists`, params);
  }

  async getSpecialties() {
    return apiClient.get(`${this.endpoint}/specialties`);
  }

  async create(payload) {
    return apiClient.post(this.endpoint, payload);
  }

  async update(id, payload) {
    return apiClient.put(`${this.endpoint}/${id}`, payload);
  }

  async cancel(id, payload = {}) {
    return apiClient.request(`${this.endpoint}/${id}/cancel`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
  }

  async complete(id, formDataOrPayload = {}) {
    // Si es FormData, enviarlo directamente
    if (formDataOrPayload instanceof FormData) {
      return apiClient.request(`${this.endpoint}/${id}/complete`, {
        method: "PATCH",
        body: formDataOrPayload,
        // No establecer Content-Type, el navegador lo hará automáticamente con boundary
      });
    }
    
    // Si es un objeto normal, enviarlo como JSON
    return apiClient.request(`${this.endpoint}/${id}/complete`, {
      method: "PATCH",
      body: JSON.stringify(formDataOrPayload),
      headers: { "Content-Type": "application/json" },
    });
  }

  async delete(id) {
    return apiClient.delete(`${this.endpoint}/${id}`);
  }
}

export default new AppointmentService();

