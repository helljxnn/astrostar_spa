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
    return await apiClient.get(this.endpoint, params);
  }

  /**
   * Obtener todos los empleados para reporte (sin paginación)
   * @param {Object} params - Parámetros de filtrado
   * @returns {Promise} Lista completa de empleados
   */
  async getAllForReport(params = {}) {
    return await apiClient.get(`${this.endpoint}/report`, params);
  }

  /**
   * Obtener empleado por ID
   * @param {number} id - ID del empleado
   * @returns {Promise} Datos del empleado
   */
  async getById(id) {
    return await apiClient.get(`${this.endpoint}/${id}`);
  }

  /**
   * Crear nuevo empleado
   * @param {Object} employeeData - Datos del empleado
   * @param {File} signatureFile - Archivo de firma (opcional)
   * @returns {Promise} Empleado creado
   */
  async create(employeeData, signatureFile = null) {
    if (signatureFile) {
      const formData = new FormData();
      formData.append("employeeData", JSON.stringify(employeeData));
      formData.append("signature", signatureFile);

      return await apiClient.post(this.endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    return await apiClient.post(this.endpoint, employeeData);
  }

  /**
   * Actualizar empleado existente
   * @param {number} id - ID del empleado
   * @param {Object} employeeData - Datos actualizados
   * @returns {Promise} Empleado actualizado
   */
  async update(id, employeeData) {
    return await apiClient.put(`${this.endpoint}/${id}`, employeeData);
  }

  /**
   * Eliminar empleado (soft delete)
   * @param {number} id - ID del empleado
   * @returns {Promise} Confirmación de eliminación
   */
  async delete(id) {
    return await apiClient.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Obtener estadísticas de empleados
   * @returns {Promise} Estadísticas
   */
  async getStats() {
    return await apiClient.get(`${this.endpoint}/stats`);
  }

  /**
   * Obtener datos de referencia para formularios
   * @returns {Promise} Tipos de empleado, roles, tipos de documento
   */
  async getReferenceData() {
    return await apiClient.get(`${this.endpoint}/reference-data`);
  }

  /**
   * Verificar disponibilidad de email
   * @param {string} email - Email a verificar
   * @param {number} excludeUserId - ID de usuario a excluir (para edición)
   * @returns {Promise} Disponibilidad del email
   */
  async checkEmailAvailability(email, excludeUserId = null) {
    const params = { email };
    if (excludeUserId) params.excludeUserId = excludeUserId;

    return await apiClient.get(`${this.endpoint}/check-email`, params);
  }

  /**
   * Verificar disponibilidad de identificación
   * @param {string} identification - Identificación a verificar
   * @param {number} excludeUserId - ID de usuario a excluir (para edición)
   * @returns {Promise} Disponibilidad de la identificación
   */
  async checkIdentificationAvailability(identification, excludeUserId = null) {
    const params = { identification };
    if (excludeUserId) params.excludeUserId = excludeUserId;

    return await apiClient.get(`${this.endpoint}/check-identification`, params);
  }

  /**
   * Upload signature for an employee
   * @param {number} id - Employee ID
   * @param {File} file - Signature image file
   * @returns {Promise} Upload result
   */
  async uploadSignature(id, file) {
    const formData = new FormData();
    formData.append("signature", file);

    return await apiClient.post(`${this.endpoint}/${id}/signature`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  /**
   * Delete signature for an employee
   * @param {number} id - Employee ID
   * @returns {Promise} Delete result
   */
  async deleteSignature(id) {
    return await apiClient.delete(`${this.endpoint}/${id}/signature`);
  }

  /**
   * Get administrators with signatures (for donation responsible selection)
   * @returns {Promise} List of administrators with signatures
   */
  async getAdministratorsWithSignature() {
    return await apiClient.get(`${this.endpoint}/administrators/with-signature`);
  }
}

export default new EmployeeService();
