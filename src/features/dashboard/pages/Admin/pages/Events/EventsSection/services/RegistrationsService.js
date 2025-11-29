import apiClient from '../../../../../../../../shared/services/apiClient';

class RegistrationsService {
  constructor() {
    this.endpoint = '/registrations';
  }

  /**
   * Inscribir múltiples equipos a un evento
   */
  async registerMultipleTeams(serviceId, teamIds, notes = '') {
    try {
      const response = await apiClient.post(`${this.endpoint}/bulk`, {
        serviceId,
        teamIds,
        notes,
      });

      return {
        success: response.success || false,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      console.error('Error registering multiple teams:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Obtener inscripciones de un evento
   */
  async getEventRegistrations(serviceId, status = '') {
    try {
      const params = {};
      if (status) {
        params.status = status;
      }
      
      const response = await apiClient.get(`${this.endpoint}/event/${serviceId}`, params);

      return {
        success: response.success || false,
        data: response.data?.registrations || [],
        event: response.data?.event,
        total: response.data?.total || 0,
      };
    } catch (error) {
      console.error('Error getting event registrations:', error);
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }
  }

  /**
   * Cancelar inscripción
   */
  async cancelRegistration(registrationId) {
    try {
      const response = await apiClient.delete(`${this.endpoint}/${registrationId}`);

      return {
        success: response.success || false,
        message: response.message,
      };
    } catch (error) {
      console.error('Error canceling registration:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new RegistrationsService();
