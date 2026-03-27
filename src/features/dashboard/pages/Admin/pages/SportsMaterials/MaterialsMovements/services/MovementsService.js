import apiClient from "../../../../../../../../shared/services/apiClient";

class MovementsService {
  constructor() {
    this.endpoint = "/materials/movements";
  }

  async getMovements(params = {}) {
    const {
      page = 1,
      limit = 10,
      search = "",
      materialId = "",
      tipo = "",
      dateFrom = "",
      dateTo = "",
      inventarioDestino = "",
      tipoSalida = "",
    } = params;

    const queryParams = {
      page,
      limit,
      search: search.toString().trim(),
    };

    if (materialId) queryParams.material_id = materialId;
    if (tipo) queryParams.tipo = tipo;
    if (dateFrom) queryParams.dateFrom = dateFrom;
    if (dateTo) queryParams.dateTo = dateTo;
    if (inventarioDestino) queryParams.inventarioDestino = inventarioDestino;
    if (tipoSalida) queryParams.tipoSalida = tipoSalida;

    const response = await apiClient.get(this.endpoint, queryParams);

    if (response.success && response.data) {
      response.data = response.data.map((movement) =>
        this.transformFromBackend(movement),
      );

      // Asegurar que la paginación esté presente
      if (!response.pagination && response.total) {
        response.pagination = {
          total: response.total,
          page: response.page || page,
          limit: response.limit || limit,
          pages: Math.ceil(response.total / (response.limit || limit)),
        };
      }
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
      fecha_ingreso: movementData.fechaIngreso,
      inventario_destino: movementData.inventarioDestino, // FUNDACION o EVENTOS
      proveedor_id: movementData.proveedor || null,
      origen: "Compra", // Siempre es compra en el módulo de ingresos
      observaciones: movementData.observaciones?.trim() || null,
      stock_anterior: movementData.stockAnterior,
      stock_nuevo: movementData.stockNuevo,
    };

    try {
      const response = await apiClient.post(this.endpoint, payload);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateMovement(id, movementData) {
    if (!id) {
      throw new Error("ID del movimiento es requerido");
    }

    // Solo se pueden editar ciertos campos
    const payload = {
      fechaIngreso: movementData.fechaIngreso,
      proveedor_id: movementData.proveedor || null,
      observaciones: movementData.observaciones?.trim() || null,
    };

    try {
      const response = await apiClient.put(`${this.endpoint}/${id}`, payload);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getMovementsByMaterial(materialId) {
    if (!materialId) {
      throw new Error("ID del material es requerido");
    }

    const response = await apiClient.get(
      `${this.endpoint}/material/${materialId}`,
    );

    if (response.success && response.data) {
      response.data = response.data.map((movement) =>
        this.transformFromBackend(movement),
      );
    }

    return response;
  }

  transformFromBackend(backendData) {
    if (!backendData) return null;

    // Intentar obtener información del proveedor de diferentes fuentes
    let proveedorNombre = null;
    let proveedorNit = null;
    let proveedorTipoEntidad = null;
    let proveedorTipoDocumento = null;

    if (backendData.proveedor) {
      // Si proveedor es un objeto
      if (typeof backendData.proveedor === "object") {
        proveedorNombre =
          backendData.proveedor.businessName ||
          backendData.proveedor.razonSocial ||
          backendData.proveedor.nombre ||
          backendData.proveedor.name;
        proveedorNit = backendData.proveedor.nit;
        proveedorTipoEntidad =
          backendData.proveedor.entityType ||
          backendData.proveedor.tipo_entidad;

        // Intentar obtener el tipo de documento de diferentes formas
        if (backendData.proveedor.documentType) {
          proveedorTipoDocumento = backendData.proveedor.documentType.name;
        } else if (backendData.proveedor.document_type) {
          proveedorTipoDocumento = backendData.proveedor.document_type.name;
        } else if (backendData.proveedor.tipoDocumentoNombre) {
          proveedorTipoDocumento = backendData.proveedor.tipoDocumentoNombre;
        } else if (backendData.proveedor.tipo_documento_nombre) {
          proveedorTipoDocumento = backendData.proveedor.tipo_documento_nombre;
        }
      } else {
        // Si proveedor es un string
        proveedorNombre = backendData.proveedor;
      }
    }

    // Intentar otras variantes
    if (!proveedorNombre) {
      proveedorNombre =
        backendData.proveedorNombre ||
        backendData.proveedor_nombre ||
        backendData.provider ||
        backendData.providerName ||
        backendData.provider_name;
    }

    return {
      id: backendData.id,
      materialId: backendData.materialId || backendData.material_id || "",
      materialNombre:
        backendData.materialNombre ||
        backendData.material_nombre ||
        backendData.materialName ||
        "",
      categoria: backendData.categoria || backendData.category || "",
      tipoMovimiento:
        backendData.tipoMovimiento ||
        backendData.tipo_movimiento ||
        backendData.movementType ||
        "",
      cantidad: backendData.cantidad || backendData.quantity || 0,
      origen:
        backendData.origen || backendData.origin || backendData.source || "",
      donacionId:
        backendData.donacionId || backendData.donacion_id || null,
      referenceId:
        backendData.referenceId || backendData.reference_id || null,
      referenceType:
        backendData.referenceType || backendData.reference_type || null,

      // Inventarios
      inventario_origen:
        backendData.inventario_origen ||
        backendData.inventarioOrigen ||
        backendData.inventory_origin ||
        backendData.origin_inventory ||
        backendData.origen || // Fallback al campo "origen"
        null,
      inventarioOrigen:
        backendData.inventario_origen ||
        backendData.inventarioOrigen ||
        backendData.inventory_origin ||
        backendData.origin_inventory ||
        backendData.origen || // Fallback al campo "origen"
        null,
      inventario_destino:
        backendData.inventario_destino ||
        backendData.inventarioDestino ||
        backendData.inventory_destination ||
        backendData.destination_inventory ||
        backendData.destino ||
        null,
      inventarioDestino:
        backendData.inventario_destino ||
        backendData.inventarioDestino ||
        backendData.inventory_destination ||
        backendData.destination_inventory ||
        backendData.destino ||
        null,

      // Proveedor
      proveedor: proveedorNombre,
      proveedorId:
        backendData.proveedorId ||
        backendData.proveedor_id ||
        (backendData.proveedor && typeof backendData.proveedor === "object"
          ? backendData.proveedor.id
          : null),
      proveedorNit: proveedorNit,
      proveedorTipoEntidad: proveedorTipoEntidad,
      proveedorTipoDocumento: proveedorTipoDocumento,

      // Observaciones y descripciones
      observaciones:
        backendData.observaciones ||
        backendData.notes ||
        backendData.observations ||
        "",
      descripcion: backendData.descripcion || backendData.description || "",

      // Bajas
      tipo_baja:
        backendData.tipo_baja ||
        backendData.tipoBaja ||
        backendData.dischargetype ||
        "",
      tipoBaja:
        backendData.tipo_baja ||
        backendData.tipoBaja ||
        backendData.dischargetype ||
        "",

      // Eventos
      eventoId: backendData.eventoId || backendData.evento_id || null,
      evento_id: backendData.eventoId || backendData.evento_id || null,
      eventoNombre:
        backendData.eventoNombre ||
        backendData.evento_nombre ||
        (backendData.evento && backendData.evento.nombre) ||
        (backendData.evento && backendData.evento.name) ||
        "",
      evento_nombre:
        backendData.eventoNombre ||
        backendData.evento_nombre ||
        (backendData.evento && backendData.evento.nombre) ||
        (backendData.evento && backendData.evento.name) ||
        "",

      // Stock
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
      stockReservado:
        backendData.stockReservado ||
        backendData.stock_reservado ||
        backendData.reservedStock ||
        0,
      puedeEditarCantidad:
        backendData.puedeEditarCantidad ||
        backendData.puede_editar_cantidad ||
        false,

      // Fechas
      fecha:
        backendData.fecha ||
        backendData.date ||
        backendData.created_at ||
        backendData.createdAt ||
        "",
      fechaIngreso:
        backendData.fechaIngreso ||
        backendData.fecha_ingreso ||
        backendData.fecha ||
        "",
      createdAt:
        backendData.createdAt ||
        backendData.created_at ||
        backendData.fecha ||
        "",
      updatedAt:
        backendData.updatedAt ||
        backendData.updated_at ||
        backendData.fecha ||
        "",

      // Usuario
      createdBy: backendData.createdBy || backendData.created_by || "",
      createdByName:
        backendData.createdByName || backendData.created_by_name || "",
    };
  }

  /**
   * Obtener todos los movimientos para reporte (sin paginación)
   * @param {Object} params - Parámetros de filtrado
   * @returns {Promise} Lista completa de movimientos
   */
  async getAllForReport(params = {}) {
    const queryParams = {
      search: params.search || "",
      tipo: params.tipo || "",
      dateFrom: params.dateFrom || "",
      dateTo: params.dateTo || "",
      materialId: params.materialId || "",
      inventarioDestino: params.inventarioDestino || "",
      tipoSalida: params.tipoSalida || "",
    };

    Object.keys(queryParams).forEach((key) => {
      if (!queryParams[key]) delete queryParams[key];
    });

    const response = await apiClient.get(`${this.endpoint}/report`, queryParams);

    if (response.success && response.data) {
      response.data = response.data.map((movement) =>
        this.transformFromBackend(movement),
      );
    }

    return response;
  }
}

export default new MovementsService();

