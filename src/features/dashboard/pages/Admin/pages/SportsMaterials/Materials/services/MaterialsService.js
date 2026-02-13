import apiClient from "../../../../../../../../shared/services/apiClient";

class MaterialsService {
  constructor() {
    this.endpoint = "/materials";
  }

  async getMaterials(params = {}) {
    const { page = 1, limit = 10, search = "" } = params;

    const response = await apiClient.get(this.endpoint, {
      page,
      limit,
      search: search.toString().trim(),
    });

    if (response.success && response.data) {
      response.data = response.data.map(material => this.transformFromBackend(material));
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
      categoria: materialData.categoria.trim(),
      descripcion: materialData.descripcion?.trim() || '',
      unidad: materialData.unidad,
      stock_minimo: materialData.stockMinimo,
      estado: materialData.estado || 'Activo'
    };

    console.log('Creando material:', payload);

    try {
      const response = await apiClient.post(this.endpoint, payload);
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
      categoria: materialData.categoria.trim(),
      descripcion: materialData.descripcion?.trim() || '',
      unidad: materialData.unidad,
      stock_minimo: materialData.stockMinimo,
      estado: materialData.estado
    };

    console.log('Actualizando material:', { id, ...payload });

    return apiClient.put(`${this.endpoint}/${id}`, payload);
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
        categoria_id: categoriaId,
      };
      
      if (excludeId) {
        params.exclude_id = excludeId;
      }

      const response = await apiClient.get(`${this.endpoint}/check-name`, params);
      return response;
    } catch (error) {
      console.error('Error al verificar nombre de material:', error);
      throw error;
    }
  }

  transformFromBackend(backendData) {
    if (!backendData) return null;

    return {
      id: backendData.id,
      nombre: backendData.nombre || backendData.name || '',
      categoria: backendData.categoria || backendData.category || '',
      categoriaId: backendData.categoriaId || backendData.categoria_id || backendData.categoryId || '',
      descripcion: backendData.descripcion || backendData.description || '',
      unidad: backendData.unidad || backendData.unit || 'Unidad',
      stockActual: backendData.stockActual || backendData.stock_actual || backendData.currentStock || 0,
      stockMinimo: backendData.stockMinimo || backendData.stock_minimo || backendData.minStock || 0,
      estado: backendData.estado || backendData.status || 'Activo',
      createdAt: backendData.createdAt || backendData.created_at || '',
      updatedAt: backendData.updatedAt || backendData.updated_at || '',
      createdBy: backendData.createdBy || backendData.created_by || '',
      updatedBy: backendData.updatedBy || backendData.updated_by || '',
    };
  }
}

export default new MaterialsService();
