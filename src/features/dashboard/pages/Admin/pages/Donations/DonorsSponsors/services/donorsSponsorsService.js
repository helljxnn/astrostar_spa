import apiClient from "../../../../../../../../shared/services/apiClient.js";

const REPORT_LIMIT = 5000;
const MAX_REPORT_PAGES = 100;

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

  // Metodo para obtener todos los datos para reportes
  async getAllForReport(params = {}) {
    const filters = { ...params };
    delete filters.page;
    delete filters.limit;
    let allData = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const response = await apiClient.get(this.endpoint, {
        ...filters,
        page: currentPage,
        limit: REPORT_LIMIT,
      });

      if (!response?.success) {
        return response;
      }

      const pageData = Array.isArray(response.data) ? response.data : [];
      allData = allData.concat(pageData);

      const hasNextPage = response.pagination?.hasNext;
      hasMorePages =
        typeof hasNextPage === "boolean"
          ? hasNextPage
          : pageData.length === REPORT_LIMIT;

      currentPage += 1;

      if (currentPage > MAX_REPORT_PAGES) {
        hasMorePages = false;
      }
    }

    return {
      success: true,
      data: allData,
      pagination: {
        total: allData.length,
        page: 1,
        limit: allData.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  async getReferenceData() {
    return apiClient.get(`${this.endpoint}/reference-data`);
  }
}

export default new DonorsSponsorsService();
