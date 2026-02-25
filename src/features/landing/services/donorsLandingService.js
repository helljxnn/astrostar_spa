import apiClient from "../../../shared/services/apiClient.js";

class DonorsLandingService {
  constructor() {
    this.endpoint = "/donors-sponsors/landing";
  }

  async create(data) {
    return apiClient.post(this.endpoint, data);
  }
}

export default new DonorsLandingService();
