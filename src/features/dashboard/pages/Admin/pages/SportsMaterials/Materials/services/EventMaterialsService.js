import apiClient from "../../../../../../../../shared/services/apiClient";

class EventMaterialsService {
  constructor() {
    this.endpoint = "/materials/events";
  }

  // ==================== SUMMARY (OPTIMIZED) ====================

  /**
   * Get aggregated materials summary for event (optimized payload)
   */
  async getSummary(eventoId) {
    if (!eventoId) {
      throw new Error("ID del evento es requerido");
    }

    try {
      const response = await apiClient.get(
        `${this.endpoint}/${eventoId}/materials-summary`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // ==================== CONSUMIBLES ====================

  /**
   * Get consumable materials assigned to an event
   */
  async getConsumables(eventoId) {
    if (!eventoId) {
      throw new Error("ID del evento es requerido");
    }

    try {
      const response = await apiClient.get(
        `${this.endpoint}/${eventoId}/consumables`,
      );

      if (response.success && response.data) {
        response.data = response.data.map((item) =>
          this.transformConsumableFromBackend(item),
        );
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Load donation materials for event
   */
  async loadDonations(eventoId) {
    if (!eventoId) {
      throw new Error("ID del evento es requerido");
    }

    try {
      const response = await apiClient.post(
        `${this.endpoint}/${eventoId}/consumables/load-donations`,
      );

      if (response.success && response.data) {
        response.data = response.data.map((item) =>
          this.transformConsumableFromBackend(item),
        );
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Assign consumable material to event
   */
  async assignConsumable(eventoId, data) {
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
      observaciones: data.observaciones?.trim() || "",
    };

    try {
      const response = await apiClient.post(
        `${this.endpoint}/${eventoId}/consumables`,
        payload,
      );

      if (response.success && response.data) {
        response.data = this.transformConsumableFromBackend(response.data);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove consumable material assignment
   */
  async removeConsumable(assignmentId) {
    if (!assignmentId) {
      throw new Error("ID de la asignación es requerido");
    }

    try {
      const response = await apiClient.delete(
        `${this.endpoint}/consumables/${assignmentId}`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Finalize event - Execute real stock deduction for consumables
   */
  async finalizeConsumables(eventoId) {
    if (!eventoId) {
      throw new Error("ID del evento es requerido");
    }

    try {
      const response = await apiClient.post(
        `${this.endpoint}/${eventoId}/finalize-consumables`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // ==================== REUTILIZABLES ====================

  /**
   * Get reusable materials assigned to an event
   */
  async getReusables(eventoId) {
    if (!eventoId) {
      throw new Error("ID del evento es requerido");
    }

    try {
      const response = await apiClient.get(
        `${this.endpoint}/${eventoId}/reusables`,
      );

      if (response.success && response.data) {
        response.data = response.data.map((item) =>
          this.transformReusableFromBackend(item),
        );
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Assign reusable material to event
   */
  async assignReusable(eventoId, data) {
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
      observaciones: data.observaciones?.trim() || "",
    };

    try {
      const response = await apiClient.post(
        `${this.endpoint}/${eventoId}/reusables`,
        payload,
      );

      if (response.success && response.data) {
        response.data = this.transformReusableFromBackend(response.data);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove reusable material assignment
   */
  async removeReusable(assignmentId) {
    if (!assignmentId) {
      throw new Error("ID de la asignación es requerido");
    }

    try {
      const response = await apiClient.delete(
        `${this.endpoint}/reusables/${assignmentId}`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check material availability for date range
   */
  async checkAvailability(materialId, startDate, endDate, excludeEventoId) {
    if (!materialId) {
      throw new Error("ID del material es requerido");
    }

    if (!startDate || !endDate) {
      throw new Error("Fechas de inicio y fin son requeridas");
    }

    try {
      const params = new URLSearchParams({
        startDate: startDate,
        endDate: endDate,
      });

      if (excludeEventoId) {
        params.append("excludeEventoId", excludeEventoId);
      }

      const response = await apiClient.get(
        `${this.endpoint}/reusables/${materialId}/availability?${params.toString()}`,
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check availability for multiple materials at once (optimized)
   */
  async checkBulkAvailability(
    materialIds,
    startDate,
    endDate,
    excludeEventoId,
  ) {
    if (
      !materialIds ||
      !Array.isArray(materialIds) ||
      materialIds.length === 0
    ) {
      throw new Error("IDs de materiales son requeridos");
    }

    if (!startDate || !endDate) {
      throw new Error("Fechas de inicio y fin son requeridas");
    }

    try {
      const payload = {
        materialIds,
        startDate,
        endDate,
      };

      if (excludeEventoId) {
        payload.excludeEventoId = excludeEventoId;
      }

      const response = await apiClient.post(
        `${this.endpoint}/reusables/bulk-availability`,
        payload,
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all event assignments for a specific consumable material (stock eventos)
   */
  async getMaterialAssignments(materialId, options = {}) {
    if (!materialId) {
      throw new Error("ID del material es requerido");
    }

    try {
      const params = new URLSearchParams();

      if (options.includeCompleted !== undefined) {
        params.append("includeCompleted", options.includeCompleted);
      }

      if (options.startDate) {
        params.append("startDate", options.startDate);
      }

      if (options.endDate) {
        params.append("endDate", options.endDate);
      }

      const queryString = params.toString();
      const url = queryString
        ? `${this.endpoint}/consumables/${materialId}/assignments?${queryString}`
        : `${this.endpoint}/consumables/${materialId}/assignments`;

      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all event assignments for a specific reusable material (stock fundación)
   */
  async getReusableMaterialAssignments(materialId, options = {}) {
    if (!materialId) {
      throw new Error("ID del material es requerido");
    }

    try {
      const params = new URLSearchParams();

      if (options.includeCompleted !== undefined) {
        params.append("includeCompleted", options.includeCompleted);
      }

      if (options.startDate) {
        params.append("startDate", options.startDate);
      }

      if (options.endDate) {
        params.append("endDate", options.endDate);
      }

      const queryString = params.toString();
      const url = queryString
        ? `${this.endpoint}/reusables/${materialId}/assignments?${queryString}`
        : `${this.endpoint}/reusables/${materialId}/assignments`;

      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // ==================== TRANSFORMERS ====================

  transformConsumableFromBackend(backendData) {
    if (!backendData) return null;

    return {
      id: backendData.id,
      materialId: backendData.materialId || backendData.material_id,
      eventoId: backendData.eventoId || backendData.evento_id,
      cantidad: backendData.cantidad || 0,
      tipo: backendData.tipo || "CONSUMIBLE",
      bloqueado: backendData.bloqueado || false,
      donacionId: backendData.donacionId || backendData.donacion_id,
      fechaAsignacion:
        backendData.fechaAsignacion ||
        backendData.fecha_asignacion ||
        backendData.createdAt ||
        "",
      observaciones:
        backendData.observaciones || backendData.observations || "",
      createdBy: backendData.createdBy || backendData.created_by,
      createdByName:
        backendData.createdByName || backendData.created_by_name || "Sistema",
      material: backendData.material
        ? {
            id: backendData.material.id,
            nombre: backendData.material.nombre || backendData.material.name,
            categoria:
              backendData.material.categoria || backendData.material.category,
            stockEventos:
              backendData.material.stockEventos ||
              backendData.material.stock_eventos ||
              0,
            estado: backendData.material.estado || backendData.material.status,
            unidadMedida:
              backendData.material.unidadMedida ||
              backendData.material.unidad_medida ||
              "unidad",
          }
        : null,
      donacion: backendData.donacion
        ? {
            id: backendData.donacion.id,
            code: backendData.donacion.code,
            donorSponsor: backendData.donacion.donorSponsor
              ? {
                  id: backendData.donacion.donorSponsor.id,
                  name: backendData.donacion.donorSponsor.name,
                }
              : null,
          }
        : null,
    };
  }

  transformReusableFromBackend(backendData) {
    if (!backendData) return null;

    return {
      id: backendData.id,
      materialId: backendData.materialId || backendData.material_id,
      eventoId: backendData.eventoId || backendData.evento_id,
      cantidad: backendData.cantidad || 0,
      fechaAsignacion:
        backendData.fechaAsignacion ||
        backendData.fecha_asignacion ||
        backendData.createdAt ||
        "",
      observaciones:
        backendData.observaciones || backendData.observations || "",
      createdBy: backendData.createdBy || backendData.created_by,
      createdByName:
        backendData.createdByName || backendData.created_by_name || "Sistema",
      material: backendData.material
        ? {
            id: backendData.material.id,
            nombre: backendData.material.nombre || backendData.material.name,
            categoria:
              backendData.material.categoria || backendData.material.category,
            stockFundacion:
              backendData.material.stockFundacion ||
              backendData.material.stock_fundacion ||
              0,
            estado: backendData.material.estado || backendData.material.status,
            unidadMedida:
              backendData.material.unidadMedida ||
              backendData.material.unidad_medida ||
              "unidad",
            esReutilizable:
              backendData.material.esReutilizable ||
              backendData.material.es_reutilizable ||
              false,
          }
        : null,
    };
  }

  // ==================== LEGACY (mantener compatibilidad) ====================

  /**
   * Get materials assigned to an event (legacy - usa consumibles)
   */
  async getEventMaterials(eventoId) {
    return this.getConsumables(eventoId);
  }

  /**
   * Assign material to event (legacy - usa consumibles)
   */
  async assignMaterial(eventoId, data) {
    return this.assignConsumable(eventoId, data);
  }

  /**
   * Remove material assignment (legacy - usa consumibles)
   */
  async removeAssignment(eventoId, assignmentId) {
    return this.removeConsumable(assignmentId);
  }

  /**
   * Finalize event (legacy - usa consumibles)
   */
  async finalizeEvent(eventoId) {
    return this.finalizeConsumables(eventoId);
  }

  transformFromBackend(backendData) {
    return this.transformConsumableFromBackend(backendData);
  }
}

export default new EventMaterialsService();
