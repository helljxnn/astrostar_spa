import apiClient from "../../../../../../../../shared/services/apiClient";

class DonationsService {
  async list(params = {}) {
    return apiClient.get("/donations", params);
  }

  async create(data) {
    return apiClient.post("/donations", data);
  }

  async update(id, data) {
    if (!id) return null;
    return apiClient.put(`/donations/${id}`, data);
  }

  async uploadFiles(donationId, files = [], fileType = "soporte") {
    if (!donationId || files.length === 0) return null;
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return apiClient.post(
      `/donations/${donationId}/files?fileType=${fileType}`,
      formData
    );
  }

  async getStatistics() {
    return apiClient.get("/donations", { params: { limit: 10000 } });
  }
}

export default new DonationsService();
