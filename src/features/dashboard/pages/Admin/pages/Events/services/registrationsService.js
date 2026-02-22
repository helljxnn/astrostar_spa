import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Servicio para gestionar inscripciones de equipos a eventos
 */
export const registrationsService = {
  /**
   * Inscribir equipo a un evento
   */
  registerTeamToEvent: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/registrations`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al inscribir equipo" };
    }
  },

  /**
   * Obtener inscripciones de un evento
   */
  getEventRegistrations: async (serviceId, status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await axios.get(
        `${API_URL}/registrations/event/${serviceId}`,
        {
          params,
        },
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Error al obtener inscripciones del evento",
        }
      );
    }
  },

  /**
   * Obtener inscripciones de un equipo
   */
  getTeamRegistrations: async (teamId, status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await axios.get(
        `${API_URL}/registrations/team/${teamId}`,
        {
          params,
        },
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Error al obtener inscripciones del equipo",
        }
      );
    }
  },

  /**
   * Obtener equipos disponibles filtrados por categorías del evento (optimizado)
   */
  getTeamsByEventCategories: async (serviceId) => {
    try {
      const response = await axios.get(
        `${API_URL}/registrations/event/${serviceId}/teams`,
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Error al obtener equipos disponibles",
        }
      );
    }
  },

  /**
   * Obtener inscripción por ID
   */
  getRegistrationById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/registrations/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener inscripción" };
    }
  },

  /**
   * Actualizar estado de inscripción
   */
  updateRegistrationStatus: async (id, status, notes = null) => {
    try {
      const response = await axios.patch(
        `${API_URL}/registrations/${id}/status`,
        {
          status,
          notes,
        },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al actualizar estado" };
    }
  },

  /**
   * Cancelar inscripción
   */
  cancelRegistration: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/registrations/${id}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Error al cancelar inscripción" }
      );
    }
  },

  /**
   * Obtener estadísticas de inscripciones
   */
  getRegistrationStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/registrations/stats`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Error al obtener estadísticas" }
      );
    }
  },

  // ========== MÉTODOS PARA DEPORTISTAS INDIVIDUALES ==========

  /**
   * Obtener deportistas disponibles para inscripción
   */
  getAvailableAthletes: async (sportsCategoryId = null) => {
    try {
      const params = sportsCategoryId ? { sportsCategoryId } : {};
      const response = await axios.get(
        `${API_URL}/registrations/athletes/available`,
        {
          params,
        },
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Error al obtener deportistas disponibles",
        }
      );
    }
  },

  /**
   * Inscribir deportista individual a un evento
   */
  registerAthlete: async (data) => {
    try {
      const response = await axios.post(
        `${API_URL}/registrations/athlete`,
        data,
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Error al inscribir deportista" }
      );
    }
  },

  /**
   * Inscribir múltiples deportistas a un evento
   */
  registerAthletesBulk: async (data) => {
    try {
      const response = await axios.post(
        `${API_URL}/registrations/athletes/bulk`,
        data,
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Error al inscribir deportistas" }
      );
    }
  },

  /**
   * Obtener inscripciones individuales de un evento
   */
  getEventAthleteRegistrations: async (serviceId, status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await axios.get(
        `${API_URL}/registrations/event/${serviceId}/athletes`,
        {
          params,
        },
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Error al obtener inscripciones de deportistas",
        }
      );
    }
  },

  /**
   * Obtener inscripciones de un deportista específico
   */
  getAthleteRegistrations: async (athleteId, status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await axios.get(
        `${API_URL}/registrations/athlete/${athleteId}`,
        {
          params,
        },
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Error al obtener inscripciones del deportista",
        }
      );
    }
  },
};

export default registrationsService;
