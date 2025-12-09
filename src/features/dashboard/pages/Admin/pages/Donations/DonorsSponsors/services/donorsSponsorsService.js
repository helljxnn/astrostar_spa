import apiClient from "../../../../../../../../shared/services/apiClient.js";

class DonorsSponsorsService {
  constructor() {
    this.endpoint = "/donors-sponsors";
  }

  async getAll(params = {}) {
    return apiClient.get(this.endpoint, params);
  }

  async getById(id) {
    return apiClient.get(`${this.endpoint}/${id}`);
  }

  async create(data) {
    return apiClient.post(this.endpoint, data);
  }

  async update(id, data) {
    return apiClient.put(`${this.endpoint}/${id}`, data);
  }

  async delete(id) {
    return apiClient.delete(`${this.endpoint}/${id}`);
  }

  async changeStatus(id, status) {
    return apiClient.request(`${this.endpoint}/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async checkIdentificationAvailability(identification, excludeId = null) {
    const params = { identification };
    if (excludeId) params.excludeId = excludeId;
    return apiClient.get(`${this.endpoint}/check-identification`, params);
  }

  async checkEmailAvailability(email, excludeId = null) {
    const params = { email };
    if (excludeId) params.excludeId = excludeId;
    return apiClient.get(`${this.endpoint}/check-email`, params);
  }

  async getStats() {
    return apiClient.get(`${this.endpoint}/stats`);
  }

  async getReferenceData() {
    return apiClient.get(`${this.endpoint}/reference-data`);
  }
}

export default new DonorsSponsorsService();
