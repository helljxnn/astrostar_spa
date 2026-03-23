/**
 * Servicio de Categorías Deportivas - Integración con Backend API
 */

import apiClient from "../../../../../../../../shared/services/apiClient.js";

class SportsCategoryService {
  constructor() {
    this.endpoint = "/sports-categories";
  }

  REPORT_LIMIT = 100;
  REPORT_MAX_PAGES = 100;

  /**
   * Obtener todas las categorías deportivas con filtros opcionales
   * @param {Object} params - Parámetros de filtrado y paginación
   * @returns {Promise} Lista de categorías deportivas con paginación
   */
  async getAll(params = {}) {
    try {
      const response = await apiClient.get(this.endpoint, params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todas las categorías deportivas para reporte (sin paginación)
   * @param {Object} params - Parámetros de filtrado
   * @returns {Promise} Lista completa de categorías deportivas
   */
  async getAllForReport(params = {}) {
    try {
      const filters = { ...params };
      delete filters.page;
      delete filters.limit;

      let allData = [];
      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const response = await apiClient.get(this.endpoint, {
          ...filters,
          page: currentPage,
          limit: this.REPORT_LIMIT,
        });

        if (!response?.success) {
          return response;
        }

        const pageData = Array.isArray(response.data) ? response.data : [];
        allData = allData.concat(pageData);

        const hasNextPage = response.pagination?.hasNext;
        hasMorePages =
          typeof hasNextPage === "boolean"
            ? hasNextPage
            : pageData.length === this.REPORT_LIMIT;

        currentPage += 1;
        if (currentPage > this.REPORT_MAX_PAGES) {
          hasMorePages = false;
        }
      }

      return {
        success: true,
        data: allData,
        pagination: {
          total: allData.length,
          page: 1,
          limit: allData.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener categoría deportiva por ID
   * @param {number} id - ID de la categoría deportiva
   * @returns {Promise} Datos de la categoría deportiva
   */
  async getById(id) {
    try {
      const response = await apiClient.get(`${this.endpoint}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear nueva categoría deportiva
   * @param {Object} categoryData - Datos de la categoría deportiva
   * @returns {Promise} Categoría deportiva creada
   */
  async create(categoryData) {
    try {
      const response = await apiClient.post(this.endpoint, categoryData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar categoría deportiva
   * @param {number} id - ID de la categoría deportiva
   * @param {Object} categoryData - Datos actualizados
   * @returns {Promise} Categoría deportiva actualizada
   */
  async update(id, categoryData) {
    try {
      const response = await apiClient.put(`${this.endpoint}/${id}`, categoryData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar categoría deportiva
   * @param {number} id - ID de la categoría deportiva
   * @returns {Promise} Resultado de la eliminación
   */
  async delete(id) {
    try {
      const response = await apiClient.delete(`${this.endpoint}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new SportsCategoryService();
