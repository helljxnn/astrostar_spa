import apiClient from "./apiClient";

/**
 * Service object for interacting with the purchases API.
 */
const purchaseService = {
  /**
   * Fetches all purchases with pagination and search.
   * @param {object} params - Query parameters.
   * @returns {Promise<object>} The API response.
   */
  getAll(params) {
    return apiClient.get("/purchases", params);
  },

  /**
   * Fetches a single purchase by its ID.
   * @param {number|string} id - The ID of the purchase.
   * @returns {Promise<object>} The API response.
   */
  getById(id) {
    return apiClient.get(`/purchases/${id}`);
  },

  /**
   * Creates a new purchase.
   * @param {object} data - The data for the new purchase.
   * @returns {Promise<object>} The API response.
   */
  create(data) {
    return apiClient.post("/purchases", data);
  },
};

// We also need services to fetch providers and equipment for the form
const providerService = {
    getAll(params) {
        return apiClient.get("/providers", params);
    }
}

const sportsEquipmentService = {
    getAll(params) {
        return apiClient.get("/sportsEquipment", params);
    }
}


export { purchaseService, providerService, sportsEquipmentService };
