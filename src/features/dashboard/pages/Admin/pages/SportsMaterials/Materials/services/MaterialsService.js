import apiClient from "../../../../../../../../shared/services/apiClient";

class MaterialsService {
  constructor() {
    this.endpoint = "/materials";
  }

  async getMaterials(params = {}) {
    const { page = 1, limit = 10, search = "", categoriaId = "", estado = "" } = params;

    const queryParams = {
      page,
      limit,
      search: search.toString().trim(),
    };

    if (categoriaId) {
      queryParams.categoriaId = categoriaId;
    }

    if (estado) {
      queryParams.estado = estado;
    }

    const response = await apiClient.get(this.endpoint, queryParams);

    // El backend puede devolver los materiales en response.materials o response.data
    const materialsArray = response.materials || response.data || [];
    
    if (response.success && materialsArray.length > 0) {
      response.data = materialsArray.map(material => this.transformFromBackend(material));
      response.pagination = {
        total: response.total,
        page: response.page,
        limit: response.limit,
        pages: response.pages
      };
    }

    return response;
  }

  async getMaterialById(id) {
    if (!id) {
      throw new Error("ID del material es requerido");
    }
    const response = await apiClient.get(`${this.endpoint}/${id}`);
    
    if (response.success && response.data) {
      response.data = this.transformFromBackend(response.data);
    }
    
    return response;
  }

  async createMaterial(materialData) {
    const payload = {
      nombre: materialData.nombre.trim(),
      categoria_id: materialData.categoriaId,
      unidad_medida: materialData.unidadMedida?.trim().toLowerCase() || 'unidad',
      descripcion: materialData.descripcion?.trim() || ''
    };

    try {
      const response = await apiClient.post(this.endpoint, payload);
      
      if (response.success && response.data) {
        response.data = this.transformFromBackend(response.data);
      }
      
      return response;
    } catch (error) {
      console.error('Error al crear material:', error);
      throw error;
    }
  }

  async updateMaterial(id, materialData) {
    if (!id) {
      throw new Error("ID del material es requerido");
    }

    const payload = {
      nombre: materialData.nombre.trim(),
      categoria_id: materialData.categoriaId,
      unidad_medida: materialData.unidadMedida?.trim().toLowerCase() || 'unidad',
      descripcion: materialData.descripcion?.trim() || '',
      estado: materialData.estado
    };

    const response = await apiClient.put(`${this.endpoint}/${id}`, payload);
    
    if (response.success && response.data) {
      response.data = this.transformFromBackend(response.data);
    }
    
    return response;
  }

  async toggleStatus(id) {
    if (!id) {
      throw new Error("ID del material es requerido");
    }
    
    return apiClient.patch(`${this.endpoint}/${id}/status`);
  }

  async checkNameAvailability(nombre, categoriaId, excludeId = null) {
    try {
      const params = {
        nombre: nombre.trim(),
        categoriaId: categoriaId,
      };
      
      if (excludeId) {
        params.excludeId = excludeId;
      }

      const response = await apiClient.get(`${this.endpoint}/check-name`, params);
      return response;
    } catch (error) {
      console.error('Error al verificar nombre de material:', error);
      throw error;
    }
  }

  async checkMaterialExists(nombre, excludeId = null) {
    try {
      const params = {
        nombre: nombre.trim()
      };

      if (excludeId) {
        params.excludeId = excludeId;
      }

      const response = await apiClient.get(`${this.endpoint}/check-name`, params);
      return response;
    } catch (error) {
      console.error('Error al verificar material:', error);
      throw error;
    }
  }

  async deleteMaterial(id) {
    if (!id) {
      throw new Error("ID del material es requerido");
    }
    
    return apiClient.delete(`${this.endpoint}/${id}`);
  }

  async registerDischarge(id, dischargeData) {
    if (!id) {
      throw new Error("ID del material es requerido");
    }

    // Validar datos antes de enviar
    if (!dischargeData.origenStock || !['USO_INTERNO', 'EVENTOS'].includes(dischargeData.origenStock)) {
      throw new Error("El origen del stock es obligatorio y debe ser USO_INTERNO o EVENTOS");
    }

    if (!dischargeData.cantidad || dischargeData.cantidad <= 0) {
      throw new Error("La cantidad debe ser mayor a 0");
    }

    const payload = {
      cantidad: parseInt(dischargeData.cantidad),
      origenStock: dischargeData.origenStock, // 'USO_INTERNO' | 'EVENTOS'
      tipo_baja: dischargeData.tipo_baja,
      descripcion: dischargeData.descripcion.trim(),
    };

    try {
      const response = await apiClient.post(`${this.endpoint}/${id}/discharge`, payload);
      return response;
    } catch (error) {
      console.error('❌ Error al registrar baja:', error);
      throw error;
    }
  }

  async getMaterialHistory(id) {
    if (!id) {
      throw new Error("ID del material es requerido");
    }
    
    const response = await apiClient.get(`${this.endpoint}/${id}/history`);
    
    if (response.success && response.data) {
      response.data = response.data.map(movement => this.transformMovementFromBackend(movement));
    }
    
    return response;
  }

  transformMovementFromBackend(backendData) {
    if (!backendData) return null;

    return {
      id: backendData.id,
      tipoMovimiento: backendData.tipoMovimiento || backendData.tipo_movimiento || backendData.movementType || '',
      cantidad: backendData.cantidad || backendData.quantity || 0,
      origen: backendData.origen || backendData.origin || backendData.source || '',
      observaciones: backendData.observaciones || backendData.notes || backendData.observations || '',
      stockAnterior: backendData.stockAnterior || backendData.stock_anterior || backendData.previousStock || 0,
      stockNuevo: backendData.stockNuevo || backendData.stock_nuevo || backendData.newStock || 0,
      fecha: backendData.fecha || backendData.date || backendData.createdAt || backendData.created_at || '',
      createdBy: backendData.createdBy || backendData.created_by || '',
      createdByName: backendData.createdByName || backendData.created_by_name || 'Sistema',
    };
  }

  transformFromBackend(backendData) {
    if (!backendData) return null;

    return {
      id: backendData.id,
      nombre: backendData.nombre || backendData.name || '',
      categoria: backendData.categoria || backendData.category || '',
      categoriaId: backendData.categoriaId || backendData.categoria_id || backendData.categoryId || null,
      descripcion: backendData.descripcion || backendData.description || '',
      unidadMedida: backendData.unidadMedida || backendData.unidad_medida || backendData.unit || 'unidad',
      stockTotal: backendData.stockTotal || backendData.stock_total || backendData.totalStock || 0,
      stockDisponible: backendData.stockDisponible || backendData.stock_disponible || backendData.availableStock || 0,
      stockReservado: backendData.stockEventos || backendData.stock_eventos || backendData.stockReservado || backendData.stock_reservado || backendData.reservedStock || 0,
      estado: backendData.estado || backendData.status || 'Activo',
      createdAt: backendData.createdAt || backendData.created_at || '',
      updatedAt: backendData.updatedAt || backendData.updated_at || '',
      createdBy: backendData.createdBy || backendData.created_by || null,
      updatedBy: backendData.updatedBy || backendData.updated_by || null,
      category: backendData.category || null,
    };
  }
}

export default new MaterialsService();
