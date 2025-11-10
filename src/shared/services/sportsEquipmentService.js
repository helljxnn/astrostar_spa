import apiClient from "./apiClient";

/**
 * Service object for interacting with the sports equipment API.
 */
const sportsEquipmentService = {
  /**
   * Fetches all sports equipment with pagination and search.
   * @param {object} params - Query parameters.
   * @param {number} params.page - The page number.
   * @param {number} params.limit - The number of items per page.
   * @param {string} params.search - The search term.
   * @returns {Promise<object>} The API response.
   */
  getAll(params) {
    return apiClient.get("/sportsEquipment", params);
  },

  /**
   * Fetches a single piece of equipment by its ID.
   * @param {number|string} id - The ID of the equipment.
   * @returns {Promise<object>} The API response.
   */
  getById(id) {
    return apiClient.get(`/sportsEquipment/${id}`);
  },

  /**
   * Creates a new piece of sports equipment.
   * @param {object} data - The data for the new equipment.
   * @returns {Promise<object>} The API response.
   */
  create(data) {
    return apiClient.post("/sportsEquipment", data);
  },

  /**
   * Updates an existing piece of equipment.
   * @param {number|string} id - The ID of the equipment to update.
   * @param {object} data - The data to update.
   * @returns {Promise<object>} The API response.
   */
  update(id, data) {
    return apiClient.put(`/sportsEquipment/${id}`, data);
  },

  /**
   * Deletes a piece of equipment.
   * @param {number|string} id - The ID of the equipment to delete.
   * @returns {Promise<object>} The API response.
   */
  delete(id) {
    return apiClient.delete(`/sportsEquipment/${id}`);
  },

  /**
   * Creates a disposal record for a piece of equipment.
   * @param {number|string} id - The ID of the equipment.
   * @param {object} disposalData - The data for the disposal.
   * @param {number} disposalData.quantity - The quantity to dispose of.
   * @param {string} disposalData.reason - The reason for disposal.
   * @param {string} [disposalData.observation] - Optional observation notes.
   * @returns {Promise<object>} The API response.
   */
  createDisposal(id, disposalData) {
    return apiClient.post(`/sportsEquipment/${id}/disposals`, disposalData);
  },
};

export default sportsEquipmentService;
