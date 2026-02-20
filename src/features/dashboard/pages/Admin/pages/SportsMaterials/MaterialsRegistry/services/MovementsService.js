import apiClient from "../../../../../../../../shared/services/apiClient";

class MovementsService {
  constructor() {
    this.endpoint = "/material-movements";
  }

  async getMovements(params = {}) {
    const { page = 1, limit = 10, search = "", materialId = "", tipo = "", dateFrom = "", dateTo = "" } = params;

    const queryParams = {
      page,
      limit,
      search: search.toString().trim(),
    };

    if (materialId) queryParams.material_id = materialId;
    if (tipo) queryParams.tipo = tipo;
    if (dateFrom) queryParams.date_from = dateFrom;
    if (dateTo) queryParams.date_to = dateTo;

    const response = await apiClient.get(this.endpoint, queryParams);

    if (response.success && response.data) {
      response.data = response.data.map(movement => this.transformFromBackend(movement));
    }

    return response;
  }

  async getMovementById(id) {
    if (!id) {
      throw new Error("ID del movimiento es requerido");
    }
    const response = await apiClient.get(`${this.endpoint}/${id}`);
    
    if (response.success && response.data) {
      response.data = this.transformFromBackend(response.data);
    }
    
    return response;
  }

  async createMovement(movementData) {
    const payload = {
      material_id: movementData.materialId,
      material_nombre: movementData.materialNombre.trim(),
      categoria: movementData.categoria.trim(),
      tipo_movimiento: movementData.tipoMovimiento,
      cantidad: parseInt(movementData.cantidad),
      origen: movementData.origen,
      observaciones: movementData.observaciones?.trim() || '',
      stock_anterior: movementData.stockAnterior,
      stock_nuevo: movementData.stockNuevo
    };

    try {
      const response = await apiClient.post(this.endpoint, payload);
      return response;
    } catch (error) {
      console.error('Error al crear movimiento:', error);
      throw error;
    }
  }

  async getMovementsByMaterial(materialId) {
    if (!materialId) {
      throw new Error("ID del material es requerido");
    }
    
    const response = await apiClient.get(`${this.endpoint}/material/${materialId}`);
    
    if (response.success && response.data) {
      response.data = response.data.map(movement => this.transformFromBackend(movement));
    }
    
    return response;
  }

  transformFromBackend(backendData) {
    if (!backendData) return null;

    return {
      id: backendData.id,
      materialId: backendData.materialId || backendData.material_id || '',
      materialNombre: backendData.materialNombre || backendData.material_nombre || backendData.materialName || '',
      categoria: backendData.categoria || backendData.category || '',
      tipoMovimiento: backendData.tipoMovimiento || backendData.tipo_movimiento || backendData.movementType || '',
      cantidad: backendData.cantidad || backendData.quantity || 0,
      origen: backendData.origen || backendData.origin || backendData.source || '',
      observaciones: backendData.observaciones || backendData.notes || backendData.observations || '',
      stockAnterior: backendData.stockAnterior || backendData.stock_anterior || backendData.previousStock || 0,
      stockNuevo: backendData.stockNuevo || backendData.stock_nuevo || backendData.newStock || 0,
      fecha: backendData.fecha || backendData.date || backendData.created_at || '',
      createdBy: backendData.createdBy || backendData.created_by || '',
      createdByName: backendData.createdByName || backendData.created_by_name || '',
    };
  }
}

export default new MovementsService();
