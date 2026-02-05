import apiClient from "../../../../../../../../shared/services/apiClient";

class PurchasesService {
  constructor() {
    this.endpoint = "/purchases";
  }

  async getPurchases(params = {}) {
    const { page = 1, limit = 10, search = "" } = params;

    const response = await apiClient.get(this.endpoint, {
      page,
      limit,
      search: search.toString().trim(),
    });

    // Transformar los datos del backend al formato del frontend
    if (response.success && response.data) {
      response.data = response.data.map(purchase => this.transformFromBackend(purchase));
    }

    return response;
  }

  async getPurchaseById(id) {
    if (!id) {
      throw new Error("ID de la compra es requerido");
    }
    const response = await apiClient.get(`${this.endpoint}/${id}`);
    
    // Transformar los datos del backend al formato del frontend
    if (response.success && response.data) {
      response.data = this.transformFromBackend(response.data);
    }
    
    return response;
  }

  async createPurchase(purchaseData, facturaFile) {
    // Validar que se proporcione el archivo de factura
    if (!facturaFile) {
      throw new Error("El archivo de factura es requerido");
    }

    // Crear FormData para enviar archivo + datos
    const formData = new FormData();
    
    // Agregar datos de la compra
    formData.append('proveedor', purchaseData.proveedor.trim());
    formData.append('concepto', purchaseData.concepto.trim());
    formData.append('fechaCompra', purchaseData.fechaCompra);
    formData.append('montoTotal', purchaseData.montoTotal.toString());
    formData.append('metodoPago', purchaseData.metodoPago);
    
    // Solo agregar observaciones si tiene contenido
    if (purchaseData.observaciones && purchaseData.observaciones.trim()) {
      formData.append('observaciones', purchaseData.observaciones.trim());
    }
    
    // Agregar archivo de factura
    formData.append('factura', facturaFile);

    console.log('=== DATOS DE COMPRA ===');
    console.log('Proveedor:', purchaseData.proveedor);
    console.log('Concepto:', purchaseData.concepto);
    console.log('Fecha Compra:', purchaseData.fechaCompra);
    console.log('Monto Total:', purchaseData.montoTotal, 'Tipo:', typeof purchaseData.montoTotal);
    console.log('Método Pago:', purchaseData.metodoPago);
    console.log('Observaciones:', purchaseData.observaciones);
    console.log('Archivo:', facturaFile.name, 'Tamaño:', facturaFile.size, 'Tipo:', facturaFile.type);
    console.log('=== FORMDATA ENTRIES ===');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ':', pair[1]);
    }

    try {
      const response = await apiClient.post(this.endpoint, formData);
      return response;
    } catch (error) {
      console.error('=== ERROR AL CREAR COMPRA ===');
      console.error('Error completo:', error);
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
      
      // Intentar extraer más información del error
      if (error.message) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  async updatePurchase(id, purchaseData, facturaFile = null) {
    if (!id) {
      throw new Error("ID de la compra es requerido");
    }

    // Crear FormData para enviar archivo + datos
    const formData = new FormData();
    
    // Agregar datos de la compra
    formData.append('proveedor', purchaseData.proveedor.trim());
    formData.append('concepto', purchaseData.concepto.trim());
    formData.append('fechaCompra', purchaseData.fechaCompra);
    formData.append('montoTotal', purchaseData.montoTotal.toString());
    formData.append('metodoPago', purchaseData.metodoPago);
    
    // Solo agregar observaciones si tiene contenido
    if (purchaseData.observaciones && purchaseData.observaciones.trim()) {
      formData.append('observaciones', purchaseData.observaciones.trim());
    }
    
    // Solo agregar factura si se proporciona una nueva
    if (facturaFile) {
      formData.append('factura', facturaFile);
    }

    console.log('Actualizando compra:', {
      id,
      proveedor: purchaseData.proveedor,
      concepto: purchaseData.concepto,
      fechaCompra: purchaseData.fechaCompra,
      montoTotal: purchaseData.montoTotal,
      metodoPago: purchaseData.metodoPago,
      observaciones: purchaseData.observaciones,
      facturaFile: facturaFile?.name || 'sin cambios'
    });

    return apiClient.put(`${this.endpoint}/${id}`, formData);
  }

  async downloadInvoice(id) {
    if (!id) {
      throw new Error("ID de la compra es requerido");
    }
    
    const response = await fetch(
      `${apiClient.baseURL}${this.endpoint}/${id}/download`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${apiClient.getAccessToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Error al descargar la factura');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factura-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // Transformar datos del backend (snake_case) al frontend (camelCase)
  transformFromBackend(backendData) {
    if (!backendData) return null;

    return {
      id: backendData.id,
      proveedor: backendData.proveedor || backendData.provider_name || '',
      concepto: backendData.concepto || '',
      fechaCompra: backendData.fechaCompra || backendData.fecha_compra || backendData.purchaseDate || '',
      montoTotal: backendData.montoTotal || backendData.monto_total || backendData.totalAmount || 0,
      metodoPago: backendData.metodoPago || backendData.metodo_pago || backendData.paymentMethod || '',
      facturaUrl: backendData.facturaUrl || backendData.factura_url || backendData.invoiceUrl || '',
      observaciones: backendData.observaciones || backendData.notes || '',
      createdAt: backendData.createdAt || backendData.created_at || backendData.createdDate || '',
      createdByName: backendData.createdByName || backendData.created_by_name || '',
    };
  }
}

export default new PurchasesService();
