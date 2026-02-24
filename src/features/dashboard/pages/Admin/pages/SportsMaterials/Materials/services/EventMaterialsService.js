import apiClient from "../../../../../../../shared/services/apiClient";

class EventMaterialsService {
  constructor() {
    this.endpoint = "/materials/events";
  }

  /**
   * Get materials assigned to an event
   */
  async getEventMaterials(eventoId) {
    if (!eventoId) {
      throw new Error("ID del evento es requerido");
    }

    try {
      const response = await apiClient.get(`${this.endpoint}/${eventoId}/materials`);
      
      if (response.success && response.data) {
        response.data = response.data.map(item => this.transformFromBackend(item));
      }
      
      return response;
    } catch (error) {
      console.error('Error al obtener materiales del evento:', error);
      throw error;
    }
  }

  /**
   * Assign material to event
   */
  async assignMaterial(eventoId, data) {
    if (!eventoId) {
      throw new Error("ID del evento es requerido");
    }

    if (!data.materialId) {
      throw new Error("ID del material es requerido");
    }

    if (!data.cantidad || data.cantidad <= 0) {
      throw new Error("La cantidad debe ser mayor a 0");
    }

    const payload = {
      material_id: data.materialId,
      cantidad: parseInt(data.cantidad),
      observaciones: data.observaciones?.trim() || '',
    };

    try {
      const response = await apiClient.post(`${this.endpoint}/${eventoId}/materials`, payload);
      
      if (response.success && response.data) {
        response.data = this.transformFromBackend(response.data);
      }
      
      return response;
    } catch (error) {
      console.error('Error al asignar material al evento:', error);
      throw error;
    }
  }

  /**
   * Remove material assignment
   */
  async removeAssignment(eventoId, assignmentId) {
    if (!eventoId) {
      throw new Error("ID del evento es requerido");
    }

    if (!assignmentId) {
      throw new Error("ID de la asignación es requerido");
    }

    try {
      const response = await apiClient.delete(`${this.endpoint}/${eventoId}/materials/${assignmentId}`);
      return response;
    } catch (error) {
      console.error('Error al eliminar asignación:', error);
      throw error;
    }
  }

  /**
   * Finalize event - Execute real stock deduction
   */
  async finalizeEvent(eventoId) {
    if (!eventoId) {
      throw new Error("ID del evento es requerido");
    }

    try {
      const response = await apiClient.post(`${this.endpoint}/${eventoId}/finalize`);
      return response;
    } catch (error) {
      console.error('Error al finalizar evento:', error);
      throw error;
    }
  }

  transformFromBackend(backendData) {
    if (!backendData) return null;

    return {
      id: backendData.id,
      materialId: backendData.materialId || backendData.material_id,
      eventoId: backendData.eventoId || backendData.evento_id,
      cantidad: backendData.cantidad || 0,
      fechaAsignacion: backendData.fechaAsignacion || backendData.fecha_asignacion || backendData.createdAt || '',
      observaciones: backendData.observaciones || backendData.observations || '',
      createdBy: backendData.createdBy || backendData.created_by,
      createdByName: backendData.createdByName || backendData.created_by_name || 'Sistema',
      material: backendData.material ? {
        id: backendData.material.id,
        nombre: backendData.material.nombre || backendData.material.name,
        categoria: backendData.material.categoria || backendData.material.category,
        stockFundacion: backendData.material.stockFundacion || backendData.material.stock_fundacion || 0,
        stockEventos: backendData.material.stockEventos || backendData.material.stock_eventos || 0,
        stockTotal: backendData.material.stockTotal || backendData.material.stock_total || 0,
      } : null,
    };
  }
}

export default new EventMaterialsService();
