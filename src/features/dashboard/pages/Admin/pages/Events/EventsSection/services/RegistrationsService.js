import apiClient from "../../../../../../../../shared/services/apiClient";

class RegistrationsService {
  constructor() {
    this.endpoint = "/registrations";
  }

  /**
   * Inscribir múltiples equipos a un evento
   */
  async registerMultipleTeams(serviceId, teamIds, notes = "") {
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
      console.error("Error registering multiple teams:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Obtener inscripciones de un evento
   */
  async getEventRegistrations(serviceId, status = "") {
    try {
      const params = {};
      if (status) {
        params.status = status;
      }

      const response = await apiClient.get(
        `${this.endpoint}/event/${serviceId}`,
        params,
      );

      return {
        success: response.success || false,
        data: response.data?.registrations || [],
        event: response.data?.event,
        total: response.data?.total || 0,
      };
    } catch (error) {
      console.error("Error getting event registrations:", error);
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
      const response = await apiClient.delete(
        `${this.endpoint}/${registrationId}`,
      );

      return {
        success: response.success || false,
        message: response.message,
      };
    } catch (error) {
      console.error("Error canceling registration:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Obtener equipos disponibles filtrados por categorías del evento (optimizado)
   */
  async getTeamsByEventCategories(serviceId) {
    try {
      const response = await apiClient.get(
        `${this.endpoint}/event/${serviceId}/teams`,
      );

      return {
        success: response.success || false,
        data: response.data || { foundation: [], temporary: [], total: 0 },
        message: response.message,
      };
    } catch (error) {
      console.error("Error getting teams by event categories:", error);
      return {
        success: false,
        data: { foundation: [], temporary: [], total: 0 },
        error: error.message,
      };
    }
  }

  // ========== MÉTODOS PARA DEPORTISTAS INDIVIDUALES ==========

  /**
   * Obtener deportistas disponibles para inscripción
   */
  async getAvailableAthletes(sportsCategoryId = null) {
    try {
      const params = {};
      if (sportsCategoryId) {
        params.sportsCategoryId = sportsCategoryId;
      }

      const response = await apiClient.get(
        `${this.endpoint}/athletes/available`,
        params,
      );

      return {
        success: response.success || false,
        data: response.data || { athletes: [], total: 0 },
      };
    } catch (error) {
      console.error("Error getting available athletes:", error);
      return {
        success: false,
        data: { athletes: [], total: 0 },
        error: error.message,
      };
    }
  }

  /**
   * Obtener deportistas disponibles filtrados por categorías del evento
   */
  async getAthletesByEventCategories(serviceId) {
    try {
      const response = await apiClient.get(
        `${this.endpoint}/event/${serviceId}/athletes/available`,
      );

      return {
        success: response.success || false,
        data: response.data || { athletes: [], total: 0 },
        message: response.message,
      };
    } catch (error) {
      console.error("Error getting athletes by event categories:", error);
      return {
        success: false,
        data: { athletes: [], total: 0 },
        error: error.message,
      };
    }
  }

  /**
   * Inscribir deportista individual a un evento
   */
  async registerAthlete(data) {
    try {
      const response = await apiClient.post(`${this.endpoint}/athlete`, data);

      return {
        success: response.success || false,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      console.error("Error registering athlete:", error);
      return {
        success: false,
        error: error.message,
        message: error.message,
      };
    }
  }

  /**
   * Inscribir múltiples deportistas a un evento
   */
  async registerAthletesBulk(data) {
    try {
      const response = await apiClient.post(
        `${this.endpoint}/athletes/bulk`,
        data,
      );

      return {
        success: response.success || false,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      console.error("Error registering athletes bulk:", error);
      return {
        success: false,
        error: error.message,
        message: error.message,
      };
    }
  }

  /**
   * Obtener inscripciones individuales de un evento
   */
  async getEventAthleteRegistrations(serviceId, status = "") {
    try {
      const params = {};
      if (status) {
        params.status = status;
      }

      const response = await apiClient.get(
        `${this.endpoint}/event/${serviceId}/athletes`,
        params,
      );

      return {
        success: response.success || false,
        data: response.data?.registrations || [],
        event: response.data?.event,
        total: response.data?.total || 0,
      };
    } catch (error) {
      console.error("Error getting event athlete registrations:", error);
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }
  }

  /**
   * Obtener inscripciones de un deportista específico
   */
  async getAthleteRegistrations(athleteId, status = "") {
    try {
      const params = {};
      if (status) {
        params.status = status;
      }

      const response = await apiClient.get(
        `${this.endpoint}/athlete/${athleteId}`,
        params,
      );

      return {
        success: response.success || false,
        data: response.data?.registrations || [],
        athlete: response.data?.athlete,
        total: response.data?.total || 0,
      };
    } catch (error) {
      console.error("Error getting athlete registrations:", error);
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }
  }
}

export default new RegistrationsService();
