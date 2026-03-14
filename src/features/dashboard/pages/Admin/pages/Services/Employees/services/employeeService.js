/**
 * Servicio de Empleados - Integración con Backend API
 * Maneja todas las operaciones CRUD de empleados
 */

import apiClient from "../../../../../../../../shared/services/apiClient.js";

class EmployeeService {
  constructor() {
    this.endpoint = "/employees";
  }

  /**
   * Obtener todos los empleados con filtros opcionales
   * @param {Object} params - Parámetros de filtrado y paginación
   * @returns {Promise} Lista de empleados con paginación
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
   * Obtener todos los empleados para reporte (sin paginación)
   * @param {Object} params - Parámetros de filtrado
   * @returns {Promise} Lista completa de empleados
   */
  async getAllForReport(params = {}) {
    try {
      const response = await apiClient.get(`${this.endpoint}/report`, params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener empleado por ID
   * @param {number} id - ID del empleado
   * @returns {Promise} Datos del empleado
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
   * Crear nuevo empleado
   * @param {Object} employeeData - Datos del empleado
   * @param {File} signatureFile - Archivo de firma (opcional)
   * @returns {Promise} Empleado creado
   */
  async create(employeeData, signatureFile = null) {
    try {
      // If signature file is provided, use FormData
      if (signatureFile) {
        const formData = new FormData();

        // Append employee data as JSON string
        formData.append("employeeData", JSON.stringify(employeeData));

        // Append signature file
        formData.append("signature", signatureFile);

        const response = await apiClient.post(this.endpoint, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response;
      }

      // Otherwise, send as regular JSON
      const response = await apiClient.post(this.endpoint, employeeData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar empleado existente
   * @param {number} id - ID del empleado
   * @param {Object} employeeData - Datos actualizados
   * @returns {Promise} Empleado actualizado
   */
  async update(id, employeeData) {
    try {
      const response = await apiClient.put(
        `${this.endpoint}/${id}`,
        employeeData,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar empleado (soft delete)
   * @param {number} id - ID del empleado
   * @returns {Promise} Confirmación de eliminación
   */
  async delete(id) {
    try {
      const response = await apiClient.delete(`${this.endpoint}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de empleados
   * @returns {Promise} Estadísticas
   */
  async getStats() {
    try {
      const response = await apiClient.get(`${this.endpoint}/stats`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener datos de referencia para formularios
   * @returns {Promise} Tipos de empleado, roles, tipos de documento
   */
  async getReferenceData() {
    try {
      const response = await apiClient.get(`${this.endpoint}/reference-data`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar disponibilidad de email
   * @param {string} email - Email a verificar
   * @param {number} excludeUserId - ID de usuario a excluir (para edición)
   * @returns {Promise} Disponibilidad del email
   */
  async checkEmailAvailability(email, excludeUserId = null) {
    try {
      const params = { email };
      if (excludeUserId) params.excludeUserId = excludeUserId;

      const response = await apiClient.get(
        `${this.endpoint}/check-email`,
        params,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar disponibilidad de identificación
   * @param {string} identification - Identificación a verificar
   * @param {number} excludeUserId - ID de usuario a excluir (para edición)
   * @returns {Promise} Disponibilidad de la identificación
   */
  async checkIdentificationAvailability(identification, excludeUserId = null) {
    try {
      const params = { identification };
      if (excludeUserId) params.excludeUserId = excludeUserId;

      const response = await apiClient.get(
        `${this.endpoint}/check-identification`,
        params,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload signature for an employee
   * @param {number} id - Employee ID
   * @param {File} file - Signature image file
   * @returns {Promise} Upload result
   */
  async uploadSignature(id, file) {
    try {
      const formData = new FormData();
      formData.append("signature", file);

      const response = await apiClient.post(
        `${this.endpoint}/${id}/signature`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete signature for an employee
   * @param {number} id - Employee ID
   * @returns {Promise} Delete result
   */
  async deleteSignature(id) {
    try {
      const response = await apiClient.delete(
        `${this.endpoint}/${id}/signature`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get administrators with signatures (for donation responsible selection)
   * @returns {Promise} List of administrators with signatures
   */
  async getAdministratorsWithSignature() {
    try {
      const response = await apiClient.get(
        `${this.endpoint}/administrators/with-signature`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new EmployeeService();
