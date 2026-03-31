import apiClient from "../../../../../../../../shared/services/apiClient";

class MaterialsService {
  constructor() {
    this.endpoint = "/materials";
  }

  REPORT_LIMIT = 100;
  REPORT_MAX_PAGES = 100;

  async getMaterials(params = {}) {
    const {
      page = 1,
      limit = 10,
      search = "",
      categoriaId = "",
      estado = "",
      stockType = null,
    } = params;

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

    if (stockType) {
      queryParams.stockType = stockType;
    }

    const response = await apiClient.get(this.endpoint, queryParams);

    // El backend puede devolver los materiales en response.materials o response.data
    const materialsArray = response.materials || response.data || [];

    if (response.success && materialsArray.length > 0) {
      response.data = materialsArray.map((material) =>
        this.transformFromBackend(material),
      );

      // IMPORTANTE: El backend ya envía response.pagination como objeto
      // Solo crear si no existe (compatibilidad con respuestas antiguas)
      if (
        !response.pagination ||
        Object.keys(response.pagination).length === 0
      ) {
        response.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          pages: response.pages || response.totalPages,
        };
      }
    }

    return response;
  }

  async getAllMaterials(filters = {}) {
    // Método helper para obtener todos los materiales sin paginación
    return this.getMaterials({ ...filters, limit: 1000 });
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
      unidad_medida:
        materialData.unidadMedida?.trim().toLowerCase() || "unidad",
      descripcion: materialData.descripcion?.trim() || "",
    };

    try {
      const response = await apiClient.post(this.endpoint, payload);

      if (response.success && response.data) {
        response.data = this.transformFromBackend(response.data);
      }

      return response;
    } catch (error) {
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
      unidad_medida:
        materialData.unidadMedida?.trim().toLowerCase() || "unidad",
      descripcion: materialData.descripcion?.trim() || "",
      estado: materialData.estado,
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

      const response = await apiClient.get(
        `${this.endpoint}/check-name`,
        params,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async checkMaterialExists(nombre, excludeId = null) {
    try {
      const params = {
        nombre: nombre.trim(),
      };

      if (excludeId) {
        params.excludeId = excludeId;
      }

      const response = await apiClient.get(
        `${this.endpoint}/check-name`,
        params,
      );
      return response;
    } catch (error) {
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
    if (
      !dischargeData.inventarioOrigen ||
      !["FUNDACION", "EVENTOS"].includes(dischargeData.inventarioOrigen)
    ) {
      throw new Error(
        "El origen del inventario es obligatorio y debe ser FUNDACION o EVENTOS",
      );
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
      const response = await apiClient.post(
        `${this.endpoint}/${id}/discharge`,
        payload,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async checkFutureAssignments(id) {
    if (!id) {
      throw new Error("ID del material es requerido");
    }

    try {
      const response = await apiClient.get(
        `${this.endpoint}/${id}/future-assignments`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async transferStock(id, transferData) {
    if (!id) {
      throw new Error("ID del material es requerido");
    }

    if (
      !transferData.from ||
      !["FUNDACION", "EVENTOS"].includes(transferData.from)
    ) {
      throw new Error(
        "El inventario origen es obligatorio y debe ser FUNDACION o EVENTOS",
      );
    }

    if (
      !transferData.to ||
      !["FUNDACION", "EVENTOS"].includes(transferData.to)
    ) {
      throw new Error(
        "El inventario destino es obligatorio y debe ser FUNDACION o EVENTOS",
      );
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
      observaciones: transferData.observaciones?.trim() || "",
    };

    try {
      const response = await apiClient.post(
        `${this.endpoint}/${id}/transfer`,
        payload,
      );

      if (response.success && response.data) {
        response.data = this.transformFromBackend(response.data);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async getMaterialHistory(id) {
    if (!id) {
      throw new Error("ID del material es requerido");
    }

    const response = await apiClient.get(`${this.endpoint}/${id}/history`);

    if (response.success && response.data) {
      response.data = response.data.map((movement) =>
        this.transformMovementFromBackend(movement),
      );
    }

    return response;
  }

  transformMovementFromBackend(backendData) {
    if (!backendData) return null;

    return {
      id: backendData.id,
      tipoMovimiento:
        backendData.tipoMovimiento ||
        backendData.tipo_movimiento ||
        backendData.movementType ||
        "",
      cantidad: backendData.cantidad || backendData.quantity || 0,
      origen:
        backendData.origen || backendData.origin || backendData.source || "",
      observaciones:
        backendData.observaciones ||
        backendData.notes ||
        backendData.observations ||
        "",
      stockAnterior:
        backendData.stockAnterior ||
        backendData.stock_anterior ||
        backendData.previousStock ||
        0,
      stockNuevo:
        backendData.stockNuevo ||
        backendData.stock_nuevo ||
        backendData.newStock ||
        0,
      fecha:
        backendData.fecha ||
        backendData.date ||
        backendData.createdAt ||
        backendData.created_at ||
        "",
      createdBy: backendData.createdBy || backendData.created_by || "",
      createdByName:
        backendData.createdByName || backendData.created_by_name || "Sistema",
    };
  }

  transformFromBackend(backendData) {
    if (!backendData) return null;

    const stockFundacion =
      backendData.stockFundacion || backendData.stock_fundacion || 0;
    const stockEventos =
      backendData.stockEventos || backendData.stock_eventos || 0;
    const stockEventosReservado =
      backendData.stockEventosReservado ||
      backendData.stock_eventos_reservado ||
      0;
    const stockEventosDisponible = stockEventos - stockEventosReservado;

    return {
      id: backendData.id,
      nombre: backendData.nombre || backendData.name || "",
      categoria: backendData.categoria || backendData.category || "",
      categoriaId:
        backendData.categoriaId ||
        backendData.categoria_id ||
        backendData.categoryId ||
        null,
      descripcion: backendData.descripcion || backendData.description || "",
      unidadMedida:
        backendData.unidadMedida ||
        backendData.unidad_medida ||
        backendData.unit ||
        "unidad",
      stockFundacion: stockFundacion,
      stockEventos: stockEventos,
      stockEventosReservado: stockEventosReservado,
      stockEventosDisponible: stockEventosDisponible,
      stockTotal:
        backendData.stockTotal ||
        backendData.stock_total ||
        stockFundacion + stockEventos,
      estado: backendData.estado || backendData.status || "Activo",
      hasMovements:
        backendData.hasMovements || backendData.has_movements || false,
      movementsCount:
        backendData.movementsCount || backendData.movements_count || 0,
      hasActiveAssignments:
        backendData.hasActiveAssignments ||
        backendData.has_active_assignments ||
        false,
      activeAssignmentsCount:
        backendData.activeAssignmentsCount ||
        backendData.active_assignments_count ||
        0,
      createdAt: backendData.createdAt || backendData.created_at || "",
      updatedAt: backendData.updatedAt || backendData.updated_at || "",
      createdBy: backendData.createdBy || backendData.created_by || null,
      updatedBy: backendData.updatedBy || backendData.updated_by || null,
      category: backendData.category || null,
    };
  }

  /**
   * Obtener todos los materiales para reporte (sin paginación)
   * @param {Object} params - Parámetros de filtrado
   * @returns {Promise} Lista completa de materiales
   */
  async getAllForReport(params = {}) {
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

      const materialsArray = response.materials || response.data || [];
      const normalizedPage = Array.isArray(materialsArray)
        ? materialsArray.map((material) => this.transformFromBackend(material))
        : [];

      allData = allData.concat(normalizedPage);

      const hasNextPage = response.pagination?.hasNext;
      hasMorePages =
        typeof hasNextPage === "boolean"
          ? hasNextPage
          : normalizedPage.length === this.REPORT_LIMIT;

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
  }
}

export default new MaterialsService();

