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
    
    // Enviar datos en el formato que espera el backend (probablemente en inglés o snake_case)
    formData.append('provider_name', purchaseData.proveedor.trim());
    formData.append('concept', purchaseData.concepto.trim());
    formData.append('purchase_date', purchaseData.fechaCompra);
    formData.append('total_amount', purchaseData.montoTotal.toString());
    formData.append('payment_method', purchaseData.metodoPago);
    
    // Solo agregar observaciones si tiene contenido
    if (purchaseData.observaciones && purchaseData.observaciones.trim()) {
      formData.append('notes', purchaseData.observaciones.trim());
    }
    
    // Agregar archivo de factura
    formData.append('invoice', facturaFile);

    console.log('=== DATOS DE COMPRA (FORMATO BACKEND) ===');
    console.log('provider_name:', purchaseData.proveedor);
    console.log('concept:', purchaseData.concepto);
    console.log('purchase_date:', purchaseData.fechaCompra);
    console.log('total_amount:', purchaseData.montoTotal);
    console.log('payment_method:', purchaseData.metodoPago);
    console.log('notes:', purchaseData.observaciones);
    console.log('invoice:', facturaFile.name);

    try {
      const response = await apiClient.post(this.endpoint, formData);
      return response;
    } catch (error) {
      console.error('=== ERROR AL CREAR COMPRA ===');
      console.error('Error completo:', error);
      console.error('Mensaje:', error.message);
      
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
    
    try {
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
        const errorText = await response.text();
        console.error('Error al descargar factura:', errorText);
        throw new Error('Error al descargar la factura');
      }

      // Obtener el nombre del archivo del header si está disponible
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `factura-${id}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar después de un pequeño delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Error en downloadInvoice:', error);
      throw error;
    }
  }

  async getNotes(purchaseId) {
    if (!purchaseId) {
      throw new Error("ID de la compra es requerido");
    }
    return apiClient.get(`${this.endpoint}/${purchaseId}/notes`);
  }

  async addNote(purchaseId, noteText) {
    if (!purchaseId) {
      throw new Error("ID de la compra es requerido");
    }
    if (!noteText || !noteText.trim()) {
      throw new Error("El texto de la nota es requerido");
    }
    return apiClient.post(`${this.endpoint}/${purchaseId}/notes`, { note: noteText });
  }

  // Transformar datos del backend (snake_case) al frontend (camelCase)
  transformFromBackend(backendData) {
    if (!backendData) return null;

    return {
      id: backendData.id,
      proveedor: backendData.proveedor || backendData.provider_name || backendData.providerName || '',
      proveedorNit: backendData.proveedorNit || backendData.provider_nit || backendData.providerNit || '',
      proveedorTipoDocumento: backendData.proveedorTipoDocumento || backendData.provider_document_type || backendData.providerDocumentType || '',
      concepto: backendData.concepto || backendData.concept || '',
      fechaCompra: backendData.fechaCompra || backendData.fecha_compra || backendData.purchaseDate || backendData.purchase_date || '',
      montoTotal: backendData.montoTotal || backendData.monto_total || backendData.totalAmount || backendData.total_amount || 0,
      metodoPago: backendData.metodoPago || backendData.metodo_pago || backendData.paymentMethod || backendData.payment_method || 'N/A',
      facturaUrl: backendData.factura || backendData.invoiceUrl || backendData.facturaUrl || backendData.factura_url || backendData.invoice_url || '',
      facturaNombre: backendData.facturaNombre || backendData.invoiceName || backendData.invoice_name || '',
      observaciones: backendData.observaciones || backendData.notes || '',
      createdAt: backendData.createdAt || backendData.created_at || backendData.createdDate || '',
      createdByName: backendData.createdByName || backendData.created_by_name || '',
    };
  }
}

export default new PurchasesService();
