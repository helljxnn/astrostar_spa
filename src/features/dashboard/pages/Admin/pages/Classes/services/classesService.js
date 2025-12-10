import apiClient from "../../../../../../../shared/services/apiClient";

class ClassesService {
  /**
   * Obtener todas las clases con filtros
   */
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.search) queryParams.append("search", params.search);
    if (params.status) queryParams.append("status", params.status);
    if (params.employeeId) queryParams.append("employeeId", params.employeeId);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    return await apiClient.get(`/classes?${queryParams.toString()}`);
  }

  /**
   * Obtener clase por ID
   */
  async getById(id) {
    return await apiClient.get(`/classes/${id}`);
  }

  /**
   * Crear nueva clase
   */
  async create(data) {
    return await apiClient.post("/classes", data);
  }

  /**
   * Actualizar clase
   */
  async update(id, data) {
    return await apiClient.put(`/classes/${id}`, data);
  }

  /**
   * Eliminar clase
   */
  async delete(id) {
    return await apiClient.delete(`/classes/${id}`);
  }

  /**
   * Obtener clases para calendario
   */
  async getCalendarClasses(startDate, endDate, employeeId = null) {
    const queryParams = new URLSearchParams();
    queryParams.append("startDate", startDate);
    queryParams.append("endDate", endDate);
    if (employeeId) queryParams.append("employeeId", employeeId);

    return await apiClient.get(`/classes/calendar?${queryParams.toString()}`);
  }

  /**
   * Asignar deportista a clase
   */
  async assignAthlete(classId, athleteId) {
    return await apiClient.post(`/classes/${classId}/athletes/${athleteId}`);
  }

  /**
   * Remover deportista de clase
   */
  async removeAthlete(classId, athleteId) {
    return await apiClient.delete(`/classes/${classId}/athletes/${athleteId}`);
  }

  /**
   * Confirmar asistencia
   */
  async confirmAttendance(classId, athleteId, notes = null) {
    return await apiClient.post(
      `/classes/${classId}/athletes/${athleteId}/confirm`,
      { notes }
    );
  }

  /**
   * Actualizar estado de asistencia
   */
  async updateAttendanceStatus(classId, athleteId, status, notes = null) {
    return await apiClient.put(
      `/classes/${classId}/athletes/${athleteId}/attendance`,
      {
        status,
        notes,
      }
    );
  }

  /**
   * Obtener clases de una deportista
   */
  async getAthleteClasses(athleteId, params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.status) queryParams.append("status", params.status);

    return await apiClient.get(
      `/classes/athlete/${athleteId}?${queryParams.toString()}`
    );
  }

  /**
   * Obtener estadísticas generales
   */
  async getStats(employeeId = null) {
    const queryParams = new URLSearchParams();
    if (employeeId) queryParams.append("employeeId", employeeId);

    return await apiClient.get(`/classes/stats?${queryParams.toString()}`);
  }

  /**
   * Obtener estadísticas de asistencia de una clase
   */
  async getClassAttendanceStats(classId) {
    return await apiClient.get(`/classes/${classId}/attendance/stats`);
  }
}

export default new ClassesService();
