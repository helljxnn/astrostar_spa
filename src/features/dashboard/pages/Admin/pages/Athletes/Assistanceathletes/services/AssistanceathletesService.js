import apiClient from "../../../../../../../../shared/services/apiClient.js";

class AssistanceathletesService {
  async getAttendanceByDate(params = {}) {
    return apiClient.get("/assistance-athletes", params);
  }

  async saveAttendanceBulk(date, items = []) {
    return apiClient.put("/assistance-athletes/bulk", { date, items });
  }

  async getAthleteHistory(athleteId, params = {}) {
    return apiClient.get("/assistance-athletes/history", {
      athleteId,
      ...params,
    });
  }

  async getHistorySummary(params = {}) {
    return apiClient.get("/assistance-athletes/history/summary", params);
  }

  async getSportsCategories(params = {}) {
    return apiClient.get("/sports-categories", params);
  }
}

export default new AssistanceathletesService();
