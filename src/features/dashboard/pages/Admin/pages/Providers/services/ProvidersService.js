import apiClient from "../../../../../../../shared/services/apiClient";

const DOCUMENT_TYPE_CODE_MAP = {
  CC: "Cédula de Ciudadanía",
  TI: "Tarjeta de Identidad",
  CE: "Cédula de Extranjería",
  PAS: "Pasaporte",
  NIT: "NIT",
};

const normalizeDocumentTypeLabel = (value) => {
  if (!value) return "";
  return DOCUMENT_TYPE_CODE_MAP[value] || value;
};

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

    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const response = await apiClient.get(this.endpoint, {
      page: validatedPage,
      limit: validatedLimit,
      search: search.toString().trim(),
      status,
      entityType,
    });

    if (response.success && Array.isArray(response.data)) {
      response.data = response.data.map((provider) =>
        this.transformFromBackend(provider),
      );
    }

    return response;
  }

  async getProviderById(id) {
    if (!id) {
      throw new Error("ID del proveedor es requerido");
    }

    const response = await apiClient.get(`${this.endpoint}/${id}`);

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

    return apiClient.get(`${this.endpoint}/check-nit`, params);
  }

  async checkBusinessNameAvailability(
    businessName,
    excludeId = null,
    tipoEntidad = "juridica",
  ) {
    const params = { businessName, tipoEntidad };
    if (excludeId) {
      params.excludeId = excludeId;
    }

    return apiClient.get(`${this.endpoint}/check-business-name`, params);
  }

  async checkEmailAvailability(email, excludeId = null) {
    const params = { email };
    if (excludeId) {
      params.excludeId = excludeId;
    }

    return apiClient.get(`${this.endpoint}/check-email`, params);
  }

  async checkContactAvailability(contact, excludeId = null) {
    const params = { contact };
    if (excludeId) {
      params.excludeId = excludeId;
    }

    return apiClient.get(`${this.endpoint}/check-contact`, params);
  }

  async checkActivePurchases(providerId) {
    const response = await apiClient.get(
      `${this.endpoint}/${providerId}/check-ingresos`,
    );

    if (response.success && response.hasIngresos !== undefined) {
      return {
        ...response,
        hasActivePurchases: response.hasIngresos,
      };
    }

    return response;
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

  resolveProviderDocumentType(provider, documentTypes = []) {
    if (provider.tipoEntidad === "juridica") {
      return {
        tipoDocumentoNombre: "NIT",
        documentType: { name: "NIT", label: "NIT" },
      };
    }

    const providerDocumentTypeId =
      provider.documentTypeId ??
      provider.documentType?.id ??
      provider.documentType?.value ??
      null;

    const providerDocumentCode =
      provider.tipoDocumento ?? provider.documentType?.name ?? null;

    const resolvedDocumentType = documentTypes.find((dt) => {
      const dtId = dt.id?.toString();
      const dtValue = dt.value?.toString();
      const providerId = providerDocumentTypeId?.toString();

      return (
        (providerId && (dtId === providerId || dtValue === providerId)) ||
        (providerDocumentCode &&
          (dt.value === providerDocumentCode ||
            dt.name === providerDocumentCode ||
            dt.label === providerDocumentCode ||
            dt.name === DOCUMENT_TYPE_CODE_MAP[providerDocumentCode]))
      );
    });

    const fallbackDocumentType = providerDocumentTypeId
      ? documentTypes.find(
          (dt) =>
            dt.id?.toString() === providerDocumentTypeId?.toString() ||
            dt.value?.toString() === providerDocumentTypeId?.toString(),
        )
      : null;

    return {
      tipoDocumentoNombre:
        normalizeDocumentTypeLabel(resolvedDocumentType?.name) ||
        normalizeDocumentTypeLabel(resolvedDocumentType?.label) ||
        normalizeDocumentTypeLabel(fallbackDocumentType?.name) ||
        normalizeDocumentTypeLabel(fallbackDocumentType?.label) ||
        normalizeDocumentTypeLabel(provider.tipoDocumentoNombre) ||
        normalizeDocumentTypeLabel(provider.documentType?.name) ||
        normalizeDocumentTypeLabel(DOCUMENT_TYPE_CODE_MAP[provider.tipoDocumento]) ||
        "No especificado",
      documentType:
        resolvedDocumentType || fallbackDocumentType || provider.documentType || null,
    };
  }

  async enrichProvidersWithDocumentTypes(providers = []) {
    try {
      const docTypesResponse = await this.getDocumentTypes();
      const documentTypes =
        docTypesResponse.success && Array.isArray(docTypesResponse.data)
          ? docTypesResponse.data
          : [];

      return providers.map((provider) => ({
        ...provider,
        ...this.resolveProviderDocumentType(provider, documentTypes),
      }));
    } catch (error) {
      return providers.map((provider) => ({
        ...provider,
        ...this.resolveProviderDocumentType(provider),
      }));
    }
  }

  async getActiveProviders() {
    const response = await this.getProviders({ status: "Activo" });

    if (response.success && Array.isArray(response.data)) {
      response.data = await this.enrichProvidersWithDocumentTypes(response.data);
    }

    return response;
  }

  async getProvidersByEntityType(entityType) {
    return this.getProviders({ entityType });
  }

  async getEmployeeReferenceData() {
    return apiClient.get("/employees/reference-data");
  }

  transformToBackend(providerData) {
    let cleanedNit = providerData.nit;

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
      ...backendData,
      id: backendData.id,
      tipoEntidad:
        backendData.tipoEntidad ||
        (backendData.entityType === "legal" ? "juridica" : "natural"),
      razonSocial: backendData.razonSocial || backendData.businessName || "",
      nit: backendData.nit || "",
      tipoDocumento:
        backendData.tipoDocumento || backendData.documentTypeId || "",
      tipoDocumentoNombre:
        normalizeDocumentTypeLabel(backendData.tipoDocumentoNombre) ||
        normalizeDocumentTypeLabel(backendData.documentType?.name) ||
        normalizeDocumentTypeLabel(backendData.document_type?.name) ||
        (backendData.entityType === "legal" ||
        backendData.tipoEntidad === "juridica"
          ? "NIT"
          : ""),
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
    };
  }

  async getAllForReport(params = {}) {
    try {
      const response = await apiClient.get(`${this.endpoint}/report`, params);

      if (!response?.success) {
        return {
          success: false,
          error: response?.message || "No se pudieron obtener los proveedores",
          data: [],
        };
      }

      const providers = Array.isArray(response.data)
        ? response.data.map((provider) => this.transformFromBackend(provider))
        : [];

      const enrichedProviders =
        await this.enrichProvidersWithDocumentTypes(providers);

      return {
        ...response,
        data: enrichedProviders,
      };
    } catch (error) {
      return { success: false, error: error.message, data: [] };
    }
  }
}

export default new ProvidersService();
