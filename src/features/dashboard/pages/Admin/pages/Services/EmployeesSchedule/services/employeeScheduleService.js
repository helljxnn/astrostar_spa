import apiClient from "../../../../../../../../shared/services/apiClient";

class EmployeeScheduleService {
  constructor() {
    this.endpoint = "/schedules";
  }

  async getAll(params = {}) {
    return apiClient.get(this.endpoint, params);
  }

  async getById(id) {
    return apiClient.get(`${this.endpoint}/${id}`);
  }

  async getByEmployee(employeeId) {
    return apiClient.get(`${this.endpoint}/employee/${employeeId}`);
  }

  async getActiveEmployees() {
    return apiClient.get(`${this.endpoint}/employees`);
  }

  async create(scheduleData) {
    return apiClient.post(this.endpoint, scheduleData);
  }

  async update(id, scheduleData) {
    return apiClient.put(`${this.endpoint}/${id}`, scheduleData);
  }

  async cancel(id, motivoCancelacion) {
    return apiClient.request(`${this.endpoint}/${id}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ motivoCancelacion }),
      headers: { "Content-Type": "application/json" },
    });
  }

  async delete(id) {
    return apiClient.delete(`${this.endpoint}/${id}`);
  }
}

export default new EmployeeScheduleService();
