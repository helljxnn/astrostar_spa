import { useState, useEffect, useCallback } from "react";
import PaymentsService from "../services/PaymentsService";
import { showSuccessAlert, showErrorAlert } from "../../../../../../../../shared/utils/alerts";

/**
 * Hook para gestionar pagos pendientes (Admin)
 * Conecta con el endpoint real: GET /api/payments/pending
 */
export const usePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    page: 1,
    limit: 20
  });

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await PaymentsService.getPendingPayments(filters);
      // Backend responde: { success, data: [...], pagination: { total, pages, currentPage, hasNext, hasPrev } }
      setPayments(response.data || []);
      if (response.pagination) {
        setPagination({
          currentPage: response.pagination.currentPage || 1,
          totalPages: response.pagination.pages || 1,
          total: response.pagination.total || 0,
          hasNext: response.pagination.hasNext || false,
          hasPrev: response.pagination.hasPrev || false,
        });
      }
    } catch (error) {
      showErrorAlert("Error al cargar los pagos");
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const refetch = useCallback(() => {
    fetchPayments();
  }, [fetchPayments]);

  /**
   * Aprobar un pago y refrescar la lista
   */
  const approvePayment = useCallback(async (paymentId) => {
    setActionLoading(true);
    try {
      await PaymentsService.approvePayment(paymentId);
      showSuccessAlert("Pago aprobado", "El comprobante fue aprobado exitosamente");
      await fetchPayments();
      return { success: true };
    } catch (error) {
      const msg = error?.response?.data?.message || "Error al aprobar el pago";
      showErrorAlert("Error", msg);
      return { success: false };
    } finally {
      setActionLoading(false);
    }
  }, [fetchPayments]);

  /**
   * Rechazar un pago con motivo y refrescar la lista
   */
  const rejectPayment = useCallback(async (paymentId, rejectionReason) => {
    setActionLoading(true);
    try {
      await PaymentsService.rejectPayment(paymentId, rejectionReason);
      showSuccessAlert("Pago rechazado", "El comprobante fue rechazado. La deportista podrá subir uno nuevo.");
      await fetchPayments();
      return { success: true };
    } catch (error) {
      const msg = error?.response?.data?.message || "Error al rechazar el pago";
      showErrorAlert("Error", msg);
      return { success: false };
    } finally {
      setActionLoading(false);
    }
  }, [fetchPayments]);

  // Actualizar filtros y resetear página
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1
    }));
  }, []);

  return {
    payments,
    loading,
    actionLoading,
    pagination,
    filters,
    setFilters: updateFilters,
    refetch,
    approvePayment,
    rejectPayment,
  };
};