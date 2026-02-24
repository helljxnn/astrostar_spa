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
    if (!dischargeData.inventarioOrigen || !['FUNDACION', 'EVENTOS'].includes(dischargeData.inventarioOrigen)) {
      throw new Error("El origen del inventario es obligatorio y debe ser FUNDACION o EVENTOS");
    }

    if (!dischargeData.cantidad || dischargeData.cantidad <= 0) {
      throw new Error("La cantidad debe ser mayor a 0");
    }

    const payload = {
      cantidad: parseInt(dischargeData.cantidad),
      inventario_origen: dischargeData.inventarioOrigen, // 'FUNDACION' | 'EVENTOS'
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

  async transferStock(id, transferData) {
    if (!id) {
      throw new Error("ID del material es requerido");
    }

    if (!transferData.from || !['FUNDACION', 'EVENTOS'].includes(transferData.from)) {
      throw new Error("El inventario origen es obligatorio y debe ser FUNDACION o EVENTOS");
    }

    if (!transferData.to || !['FUNDACION', 'EVENTOS'].includes(transferData.to)) {
      throw new Error("El inventario destino es obligatorio y debe ser FUNDACION o EVENTOS");
    }

    if (transferData.from === transferData.to) {
      throw new Error("Los inventarios origen y destino deben ser diferentes");
    }

    if (!transferData.cantidad || transferData.cantidad <= 0) {
      throw new Error("La cantidad debe ser mayor a 0");
    }

    const payload = {
      from: transferData.from,
      to: transferData.to,
      cantidad: parseInt(transferData.cantidad),
      observaciones: transferData.observaciones?.trim() || '',
    };

    try {
      const response = await apiClient.post(`${this.endpoint}/${id}/transfer`, payload);
      
      if (response.success && response.data) {
        response.data = this.transformFromBackend(response.data);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error al transferir stock:', error);
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

    const stockFundacion = backendData.stockFundacion || backendData.stock_fundacion || 0;
    const stockEventos = backendData.stockEventos || backendData.stock_eventos || 0;
    const stockEventosReservado = backendData.stockEventosReservado || backendData.stock_eventos_reservado || 0;
    const stockEventosDisponible = stockEventos - stockEventosReservado;

    return {
      id: backendData.id,
      nombre: backendData.nombre || backendData.name || '',
      categoria: backendData.categoria || backendData.category || '',
      categoriaId: backendData.categoriaId || backendData.categoria_id || backendData.categoryId || null,
      descripcion: backendData.descripcion || backendData.description || '',
      unidadMedida: backendData.unidadMedida || backendData.unidad_medida || backendData.unit || 'unidad',
      stockFundacion: stockFundacion,
      stockEventos: stockEventos,
      stockEventosReservado: stockEventosReservado,
      stockEventosDisponible: stockEventosDisponible,
      stockTotal: backendData.stockTotal || backendData.stock_total || (stockFundacion + stockEventos),
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
