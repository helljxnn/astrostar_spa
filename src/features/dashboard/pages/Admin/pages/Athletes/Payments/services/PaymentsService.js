import apiClient from "../../../../../../../../shared/services/apiClient";

/**
 * Servicio para gestión de pagos - Implementación completa
 * Conecta con todos los endpoints del backend de pagos y renovación de matrículas
 */
class PaymentsService {
  constructor() {
    this.endpoint = "/payments";
    this.settingsEndpoint = "/payment-settings";
    this.enrollmentsEndpoint = "/enrollments";
  }

  // ============================================================================
  // ATLETAS - Estado financiero y comprobantes
  // ============================================================================

  /**
   * Obtener estado financiero completo del atleta
   * GET /api/payments/athletes/:athleteId/financial-status
   */
  async getAthleteFinancialStatus(athleteId) {
    try {
      const response = await apiClient.get(`${this.endpoint}/athletes/${athleteId}/financial-status`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching athlete financial status:', error);
      throw new Error('No se pudo obtener el estado financiero del atleta');
    }
  }

  /**
   * Obtener historial de pagos del atleta (aprobados y rechazados)
   * GET /api/payments/athletes/:athleteId/history
   */
  async getAthletePaymentHistory(athleteId) {
    try {
      // Intentar endpoint específico primero
      const response = await apiClient.get(`${this.endpoint}/athletes/${athleteId}/history`);
      const payments = response.data?.data || response.data?.payments || response.data || [];
      const filtered = Array.isArray(payments)
        ? payments.filter((payment) =>
            payment?.status === 'APPROVED' || payment?.status === 'REJECTED' ||
            payment?.status === 'approved' || payment?.status === 'rejected'
          )
        : [];
      return { data: filtered };
    } catch (error) {
      
      // Fallback: obtener todos los pagos y filtrar aprobados/rechazados
      try {
        const allPaymentsResponse = await apiClient.get(`${this.endpoint}/athletes/${athleteId}/payments`);
        const allPayments = allPaymentsResponse.data?.payments || allPaymentsResponse.data || [];
        
        // Filtrar pagos aprobados y rechazados (incluir TODOS los tipos)
        const visiblePayments = allPayments.filter((payment) =>
          payment.status === 'APPROVED' || payment.status === 'REJECTED' ||
          payment.status === 'approved' || payment.status === 'rejected'
        );
        
        return { data: visiblePayments };
      } catch (fallbackError) {
        console.error('❌ Error en fallback de historial:', fallbackError);
        throw new Error('No se pudo obtener el historial de pagos del atleta');
      }
    }
  }

  /**
   * Obtener historial completo de mensualidades (admin o atleta propietario)
   * GET /api/payments/athletes/:athleteId/monthly-history
   */
  async getAthleteMonthlyHistory(athleteId) {
    try {
      const response = await apiClient.get(`${this.endpoint}/athletes/${athleteId}/monthly-history`);
      return response.data?.data || response.data || { history: [] };
    } catch (error) {
      console.error('❌ Error fetching athlete monthly history:', error);
      throw new Error('No se pudo obtener el historial de mensualidades');
    }
  }

  /**
   * Verificar restricciones de acceso del atleta
   * GET /api/payments/athletes/:athleteId/access-check
   */
  async checkAthleteAccess(athleteId) {
    try {
      const response = await apiClient.get(`${this.endpoint}/athletes/${athleteId}/access-check`);
      return response.data;
    } catch (error) {
      console.error('❌ Error checking athlete access:', error);
      throw new Error('No se pudo verificar el acceso del atleta');
    }
  }

  /**
   * Subir comprobante de pago para una obligación
   * POST /api/payments/obligations/:obligationId/receipt
   */
  async uploadReceipt(obligationId, file) {
    const formData = new FormData();
    formData.append('receipt', file);  // CRÍTICO: Usar 'receipt', no 'file'
    
    const response = await apiClient.post(`${this.endpoint}/obligations/${obligationId}/receipt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  /**
   * Descargar comprobante de pago
   * GET /api/payments/:paymentId/receipt
   */
  async downloadReceipt(paymentId) {
    try {
      const response = await apiClient.get(`${this.endpoint}/${paymentId}/receipt`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Error downloading receipt:', error);
      throw new Error('Error al descargar el comprobante');
    }
  }

  /**
   * Descargar comprobante de pago (método legacy)
   * Obtiene el archivo desde Cloudinary y lo descarga con nombre descriptivo
   */
  async downloadReceiptLegacy(payment) {
    try {
      if (!payment.receiptUrl) {
        throw new Error('No hay comprobante disponible para descargar');
      }

      // Determinar la extensión del archivo desde la URL
      const urlParts = payment.receiptUrl.split('.');
      const urlExtension = urlParts[urlParts.length - 1].split('?')[0].toLowerCase();

      // Validar extensión
      const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
      const extension = validExtensions.includes(urlExtension) ? urlExtension : 'pdf';

      // Generar nombre descriptivo del archivo
      const athleteName = payment.athlete?.name || 'Deportista';
      const periodText = this.getPeriodText(payment.obligation);
      const fileName = `Comprobante_${athleteName}_${periodText}.${extension}`;

      // Descargar usando fetch para controlar el nombre del archivo
      const response = await fetch(payment.receiptUrl);
      if (!response.ok) {
        throw new Error('Error al obtener el archivo del servidor');
      }

      const blob = await response.blob();

      // Crear blob con tipo MIME correcto
      const mimeType = extension === 'pdf' ? 'application/pdf' : `image/${extension}`;
      const blobWithType = new Blob([blob], { type: mimeType });

      // Crear URL temporal del blob
      const blobUrl = window.URL.createObjectURL(blobWithType);

      // Crear link temporal para descarga
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      // Limpiar recursos después de un pequeño delay
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);

      return { success: true, fileName };
    } catch (error) {
      console.error('Error al descargar comprobante:', error);
      throw error;
    }
  }

  /**
   * Generar texto descriptivo del período para nombres de archivo
   */
  getPeriodText(obligation) {
    if (!obligation) return 'Pago';

    if (obligation.period) {
      return obligation.period.replace(/[^a-zA-Z0-9]/g, '_');
    }

    switch (obligation.type) {
      case "ENROLLMENT_INITIAL":
        return "Matricula_Inicial";
      case "ENROLLMENT_RENEWAL":
        return "Renovacion_Matricula";
      case "MONTHLY":
        if (obligation.dueStart) {
          const fecha = new Date(obligation.dueStart);
          const mes = fecha.toLocaleDateString("es-ES", { month: 'long' });
          const año = fecha.getFullYear();
          return `${mes}_${año}`;
        }
        return "Mensualidad";
      default:
        return obligation.type || "Pago";
    }
  }

  /**
   * Verificar acceso del atleta (middleware check)
   * GET /api/payments/athletes/:athleteId/access-check
   */
  async checkAthleteAccess(athleteId) {
    const response = await apiClient.get(`${this.endpoint}/athletes/${athleteId}/access-check`);
    return response.data;
  }

  // ============================================================================
  // ADMIN - Gestión de pagos
  // ============================================================================

  /**
   * Obtener pagos pendientes de aprobación con paginación
   * GET /api/payments/pending
   */
  async getPendingPayments(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.type) queryParams.append('type', params.type);
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.append('dateTo', params.dateTo);

      const queryString = queryParams.toString();
      const url = queryString ? `${this.endpoint}/pending?${queryString}` : `${this.endpoint}/pending`;
      
      const response = await apiClient.get(url);
      
      // Normalizar respuesta
      return this.normalizeResponse(response);
    } catch (error) {
      console.error('❌ Error fetching pending payments:', error);
      return this.handleError(error);
    }
  }

  /**
   * Obtener pagos mensuales para gestión administrativa con paginación
   * GET /api/payments/monthly-management
   */
  async getMonthlyPaymentsManagement(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.append('dateTo', params.dateTo);

      // TEMPORAL: Usar endpoint de todos los pagos con filtro de tipo MONTHLY
      // hasta que el backend implemente /monthly-management
      queryParams.append('type', 'MONTHLY');
      const url = `${this.endpoint}/all?${queryParams.toString()}`;
      
      const response = await apiClient.get(url);
      
      // Normalizar respuesta
      return this.normalizeResponse(response);
    } catch (error) {
      console.error('❌ Error fetching monthly management:', error);
      return this.handleError(error);
    }
  }

  /**
   * Obtener todos los pagos con filtros y paginación
   * GET /api/payments/all
   */
  async getAllPayments(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.type) queryParams.append('type', params.type);
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.append('dateTo', params.dateTo);
      
      // IMPORTANTE: Excluir pagos PENDING del historial
      // El historial solo debe mostrar pagos procesados (APPROVED/REJECTED)
      queryParams.append('excludeStatus', 'PENDING');

      const queryString = queryParams.toString();
      const url = queryString ? `${this.endpoint}/all?${queryString}` : `${this.endpoint}/all`;
      
      const response = await apiClient.get(url);
      
      // Normalizar respuesta
      return this.normalizeResponse(response);
    } catch (error) {
      console.error('❌ Error fetching all payments:', error);
      return this.handleError(error);
    }
  }

  /**
   * Obtener todos los pagos para reporte (sin paginación)
   * Usa el endpoint /history/report del backend
   * @param {Object} params - Filtros (search, status, type, etc.)
   * @returns {Promise<Object>} Todos los pagos
   */
  async getAllForReport(params = {}) {
    try {
      const queryParams = {
        search: params.search || '',
        status: params.status || '',
        type: params.type || '',
        startDate: params.dateFrom || '',
        endDate: params.dateTo || '',
      };
      
      // Limpiar parámetros vacíos
      Object.keys(queryParams).forEach(key => {
        if (!queryParams[key]) delete queryParams[key];
      });
      
      // Usar el endpoint correcto del backend: /history/report
      const response = await apiClient.get(`${this.endpoint}/history/report`, { params: queryParams });
      
      return {
        success: true,
        data: response.data || response || [],
      };
    } catch (error) {
      console.error('Error fetching payments report:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Aprobar pago
   * PATCH /api/payments/:paymentId/approve
   */
  async approvePayment(paymentId) {
    try {
      const response = await apiClient.patch(`${this.endpoint}/${paymentId}/approve`);
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error approving payment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Rechazar pago
   * PATCH /api/payments/:paymentId/reject
   */
  async rejectPayment(paymentId, reason) {
    try {
      const response = await apiClient.patch(`${this.endpoint}/${paymentId}/reject`, {
        rejectionReason: reason || 'Comprobante no válido'
      });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error rejecting payment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generar mensualidades manualmente (admin)
   * POST /api/payments/generate-monthly
   */
  async generateMonthlyPayments() {
    const response = await apiClient.post(`${this.endpoint}/generate-monthly`);
    return response.data;
  }

  /**
   * Crear obligación de renovación de matrícula
   * POST /api/payments/athletes/:athleteId/enrollment-renewal
   */
  async createEnrollmentRenewal(athleteId) {
    const response = await apiClient.post(`${this.endpoint}/athletes/${athleteId}/enrollment-renewal`);
    return response.data;
  }

  /**
   * Generar obligación de pago inicial de matrícula (fallback manual para admin)
   * POST /api/payments/athletes/:athleteId/enrollment-initial
   */
  async createEnrollmentInitial(athleteId, enrollmentId = null) {
    const body = enrollmentId ? { enrollmentId } : {};
    const response = await apiClient.post(`${this.endpoint}/athletes/${athleteId}/enrollment-initial`, body);
    return response.data;
  }

  // ============================================================================
  // MATRÍCULAS - Integración con sistema de renovación
  // ============================================================================

  /**
   * Procesar matrículas vencidas manualmente (admin)
   * POST /api/enrollments/process-expired
   */
  async processExpiredEnrollments() {
    const response = await apiClient.post(`${this.enrollmentsEndpoint}/process-expired`);
    return response.data;
  }

  /**
   * Obtener matrículas próximas a vencer (admin)
   * GET /api/enrollments?estado=Vigente&daysToExpire=30
   */
  async getExpiringEnrollments(daysToExpire = 30) {
    const response = await apiClient.get(`${this.enrollmentsEndpoint}`, {
      params: {
        estado: 'Vigente',
        daysToExpire
      }
    });
    return response.data;
  }

  // ============================================================================
  // CONFIGURACIÓN - Solo admin
  // ============================================================================

  /**
   * Obtener configuración de pagos
   * GET /api/payment-settings
   */
  async getPaymentSettings() {
    const response = await apiClient.get(this.settingsEndpoint);
    return response.data;
  }

  /**
   * Actualizar configuración de pagos
   * PATCH /api/payment-settings
   */
  async updatePaymentSettings(settings) {
    const response = await apiClient.patch(this.settingsEndpoint, settings);
    return response.data;
  }

  // ============================================================================
  // UTILIDADES Y HELPERS
  // ============================================================================

  /**
   * Exportar reportes de pagos
   */
  async exportPayments(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await apiClient.get(`${this.endpoint}/export?${params}`, {
      responseType: 'blob'
    });
    
    // Crear y descargar archivo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pagos_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return response.data;
  }

  /**
   * Validar archivo antes de subir
   */
  validateFile(file) {
    const errors = [];
    
    if (!file) {
      errors.push('Debe seleccionar un archivo');
      return errors;
    }

    // Tamaño máximo 5MB
    if (file.size > 5 * 1024 * 1024) {
      errors.push('El archivo no debe superar los 5MB');
    }

    // Tipos permitidos
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Solo se permiten imágenes (JPG, PNG, WEBP) o PDF');
    }

    return errors;
  }

  /**
   * Obtener texto del estado de pago
   */
  getPaymentStatusText(status) {
    const statusMap = {
      'PENDING': 'Pendiente',
      'APPROVED': 'Aprobado',
      'REJECTED': 'Rechazado',
      null: 'Sin comprobante'
    };
    return statusMap[status] || 'Sin estado';
  }

  /**
   * Obtener icono del estado de pago
   */
  getPaymentStatusIcon(status) {
    const iconMap = {
      'PENDING': '',
      'APPROVED': '',
      'REJECTED': '',
      null: ''
    };
    return iconMap[status] || '❓';
  }

  /**
   * Obtener texto del tipo de pago
   */
  getPaymentTypeText(type) {
    const typeMap = {
      'MONTHLY': 'Mensualidad',
      'ENROLLMENT_RENEWAL': 'Renovación Matrícula',
      'UNIFORM': 'Uniforme',
      'EVENT': 'Evento'
    };
    return typeMap[type] || 'Otro';
  }

  /**
   * Obtener icono del tipo de pago
   */
  getPaymentTypeIcon(type) {
    const iconMap = {
      'MONTHLY': '',
      'ENROLLMENT_RENEWAL': '',
      'UNIFORM': '',
      'EVENT': ''
    };
    return iconMap[type] || '';
  }

  /**
   * Calcular color del badge según días de mora
   */
  getLateFeeColor(daysLate) {
    if (daysLate === 0) return 'green';
    if (daysLate <= 5) return 'yellow';
    if (daysLate <= 15) return 'orange'; // ✅ Actualizado: 15 días según backend
    return 'red';
  }

  /**
   * Obtener estado financiero resumido
   */
  getFinancialStatusSummary(financialStatus) {
    if (!financialStatus) return { status: 'unknown', text: 'Sin información', color: 'gray' };

    const { totalDebt, enrollment } = financialStatus;

    // Verificar renovación de matrícula
    if (enrollment?.needsRenewal) {
      return { status: 'renewal', text: 'Renovación Pendiente', color: 'purple' };
    }

    // Verificar mora excesiva
    if (totalDebt?.maxDaysLate >= 15) {
      return { status: 'blocked', text: 'Bloqueado por Mora', color: 'red' };
    }

    // Verificar deudas pendientes
    if (totalDebt?.totalAmount > 0) {
      return { status: 'debt', text: 'Con Deuda', color: 'orange' };
    }

    // Al día
    return { status: 'current', text: 'Al Día', color: 'green' };
  }

  // ============================================================================
  // UTILIDADES DE NORMALIZACIÓN
  // ============================================================================

  /**
   * Normalizar respuesta del backend para consistencia
   */
  normalizeResponse(response) {
    let data = [];
    let pagination = {};
    
    if (response && response.data) {
      data = Array.isArray(response.data) ? response.data : [];
      pagination = response.pagination || {};
    } else if (Array.isArray(response)) {
      data = response;
    }
    
    // Normalizar estructura de paginación
    const normalizedPagination = {
      page: pagination.page || pagination.currentPage || 1,
      currentPage: pagination.currentPage || pagination.page || 1,
      limit: pagination.limit || pagination.rowsPerPage || 7,
      total: pagination.total || data.length,
      totalPages: pagination.totalPages || pagination.pages || Math.ceil((pagination.total || data.length) / (pagination.limit || 7)),
      hasNext: pagination.hasNext || false,
      hasPrev: pagination.hasPrev || false
    };
    
    
    return {
      success: true,
      data: data,
      pagination: normalizedPagination
    };
  }

  /**
   * Manejar errores de manera consistente
   */
  handleError(error) {
    console.error('❌ Service error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    return {
      success: false,
      data: [],
      pagination: {
        page: 1,
        currentPage: 1,
        limit: 7,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      },
      error: error.message
    };
  }
}

// Exportar la clase para permitir múltiples instancias y mejor testabilidad
export default PaymentsService;

// También exportar una instancia singleton para compatibilidad
export const paymentsService = new PaymentsService();
