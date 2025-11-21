import apiClient from "../../../../../../../../shared/services/apiClient";

class ProvidersService {
  constructor() {
    this.endpoint = "/providers";
  }

  async getProviders(params = {}) {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      entityType = "",
    } = params;

    // Validar parámetros de entrada
    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const response = await apiClient.get(this.endpoint, {
      page: validatedPage,
      limit: validatedLimit,
      search: search.toString().trim(),
      status,
      entityType,
    });

    // Transformar la respuesta del backend al formato del frontend
    if (response.success && response.data && Array.isArray(response.data)) {
      response.data = response.data.map((provider) =>
        this.transformFromBackend(provider)
      );
    }

    return response;
  }

  async getProviderById(id) {
    if (!id) {
      throw new Error("ID del proveedor es requerido");
    }
    const response = await apiClient.get(`${this.endpoint}/${id}`);

    // Transformar la respuesta del backend al formato del frontend
    if (response.success && response.data) {
      response.data = this.transformFromBackend(response.data);
    }

    return response;
  }

  async createProvider(providerData) {
    const transformedData = this.transformToBackend(providerData);
    return apiClient.post(this.endpoint, transformedData);
  }

  async updateProvider(id, providerData) {
    if (!id) {
      throw new Error("ID del proveedor es requerido");
    }
    const transformedData = this.transformToBackend(providerData);
    return apiClient.put(`${this.endpoint}/${id}`, transformedData);
  }

  async deleteProvider(id) {
    if (!id) {
      throw new Error("ID del proveedor es requerido");
    }
    return apiClient.delete(`${this.endpoint}/${id}`);
  }

  async changeProviderStatus(id, status) {
    return apiClient.patch(`${this.endpoint}/${id}/status`, { status });
  }

  async getDocumentTypes() {
    return apiClient.get(`${this.endpoint}/document-types`);
  }

  async checkNitAvailability(nit, excludeId = null, tipoEntidad = "juridica") {
    const params = { nit, tipoEntidad };
    if (excludeId) {
      params.excludeId = excludeId;
    }

    const response = await apiClient.get(`${this.endpoint}/check-nit`, params);
    return response;
  }

  async checkBusinessNameAvailability(
    businessName,
    excludeId = null,
    tipoEntidad = "juridica"
  ) {
    const params = { businessName, tipoEntidad };
    if (excludeId) {
      params.excludeId = excludeId;
    }

    const response = await apiClient.get(
      `${this.endpoint}/check-business-name`,
      params
    );
    return response;
  }

  async checkEmailAvailability(email, excludeId = null) {
    const params = { email };
    if (excludeId) {
      params.excludeId = excludeId;
    }
    const response = await apiClient.get(
      `${this.endpoint}/check-email`,
      params
    );
    return response;
  }

  async checkContactAvailability(contact, excludeId = null) {
    const params = { contact };
    if (excludeId) {
      params.excludeId = excludeId;
    }
    const response = await apiClient.get(
      `${this.endpoint}/check-contact`,
      params
    );
    return response;
  }

  async checkActivePurchases(providerId) {
    return apiClient.get(`${this.endpoint}/${providerId}/active-purchases`);
  }

  async getProviderStats() {
    return apiClient.get(`${this.endpoint}/stats`);
  }

  async searchProviders(searchTerm, limit = 20) {
    return this.getProviders({
      search: searchTerm,
      limit,
      page: 1,
    });
  }

  async getActiveProviders() {
    return this.getProviders({ status: "Activo" });
  }

  async getProvidersByEntityType(entityType) {
    return this.getProviders({ entityType });
  }

  async getEmployeeReferenceData() {
    return apiClient.get("/employees/reference-data");
  }

  transformToBackend(providerData) {
    let cleanedNit = providerData.nit;

    // Para ambos tipos de entidad, simplemente limpiar el NIT/documento
    if (cleanedNit && typeof cleanedNit === "string") {
      cleanedNit = cleanedNit.replace(/[.\-\s]/g, "");
    }

    const transformed = {
      tipoEntidad: providerData.tipoEntidad,
      entityType: providerData.tipoEntidad === "juridica" ? "legal" : "natural",
      businessName: providerData.razonSocial,
      razonSocial: providerData.razonSocial,
      nit: cleanedNit,
      mainContact: providerData.contactoPrincipal,
      email: providerData.correo,
      phone: providerData.telefono,
      address: providerData.direccion,
      city: providerData.ciudad,
      description: providerData.descripcion || "",
      status: providerData.estado === "Activo" ? "Active" : "Inactive",
    };

    if (providerData.tipoEntidad === "natural" && providerData.tipoDocumento) {
      transformed.documentTypeId = providerData.tipoDocumento;
    }

    return transformed;
  }

  transformFromBackend(backendData) {
    if (!backendData) return null;

    return {
      id: backendData.id,
      tipoEntidad:
        backendData.tipoEntidad ||
        (backendData.entityType === "legal" ? "juridica" : "natural"),
      razonSocial: backendData.razonSocial || backendData.businessName || "",
      nit: backendData.nit || "",
      tipoDocumento:
        backendData.tipoDocumento || backendData.documentTypeId || "",
      contactoPrincipal:
        backendData.contactoPrincipal || backendData.mainContact || "",
      correo: backendData.correo || backendData.email || "",
      telefono: backendData.telefono || backendData.phone || "",
      direccion: backendData.direccion || backendData.address || "",
      ciudad: backendData.ciudad || backendData.city || "",
      descripcion: backendData.descripcion || backendData.description || "",
      estado:
        backendData.estado ||
        (backendData.status === "Active" ? "Activo" : "Inactivo"),
      // Mantener campos adicionales que puedan venir del backend
      ...backendData,
    };
  }
}

export default new ProvidersService();
