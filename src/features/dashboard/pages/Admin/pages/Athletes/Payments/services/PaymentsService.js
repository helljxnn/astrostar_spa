import apiClient from "../../../../../../../../shared/services/apiClient";
import { formatCurrency } from "../utils/currencyUtils";

/**
 * Servicio para gestión de pagos - Implementación completa
 * Conecta con todos los endpoints del backend de pagos
 */
class PaymentsService {
  constructor() {
    this.endpoint = "/api/payments";
    this.settingsEndpoint = "/api/payment-settings";
  }

  // ============================================================================
  // ATLETAS - Estado financiero y comprobantes
  // ============================================================================

  /**
   * Obtener estado financiero completo del atleta
   * GET /api/payments/athletes/:athleteId/financial-status
   */
  async getAthleteFinancialStatus(athleteId) {
    const response = await apiClient.get(`${this.endpoint}/athletes/${athleteId}/financial-status`);
    return response.data;
  }

  /**
   * Subir comprobante de pago para una obligación
   * POST /api/payments/obligations/:obligationId/receipt
   */
  async uploadReceipt(obligationId, file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`${this.endpoint}/obligations/${obligationId}/receipt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
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
   * Obtener pagos pendientes con filtros y paginación
   * GET /api/payments/pending?page=1&limit=20&type=MONTHLY
   */
  async getPendingPayments(filters = {}) {
    const params = new URLSearchParams();
    
    // Agregar filtros
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit || 20);
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    
    const response = await apiClient.get(`${this.endpoint}/pending?${params}`);
    return response.data;
  }

  /**
   * Aprobar pago
   * PATCH /api/payments/:paymentId/approve
   */
  async approvePayment(paymentId) {
    const response = await apiClient.patch(`${this.endpoint}/${paymentId}/approve`);
    return response.data;
  }

  /**
   * Rechazar pago con motivo
   * PATCH /api/payments/:paymentId/reject
   */
  async rejectPayment(paymentId, rejectionReason) {
    const response = await apiClient.patch(`${this.endpoint}/${paymentId}/reject`, {
      rejectionReason
    });
    return response.data;
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
      'PENDING': '⏳',
      'APPROVED': '✅',
      'REJECTED': '❌',
      null: '📤'
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
      'MONTHLY': '📅',
      'ENROLLMENT_RENEWAL': '🎓',
      'UNIFORM': '👕',
      'EVENT': '🏆'
    };
    return iconMap[type] || '💰';
  }

  /**
   * Calcular color del badge según días de mora
   */
  getLateFeeColor(daysLate) {
    if (daysLate === 0) return 'green';
    if (daysLate <= 5) return 'yellow';
    if (daysLate <= 10) return 'orange';
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
}

export default new PaymentsService();