import { useState, useEffect, useCallback } from "react";
import PaymentsService from "../services/PaymentsService";
import { showSuccessAlert, showErrorAlert } from "../../../../../../../../shared/utils/alerts";

/**
 * Hook para gestionar pagos pendientes (Admin)
 */
export const usePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
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
      setPayments(response.payments || []);
      setPagination(response.pagination || pagination);
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

  // Actualizar filtros y resetear página
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1
    }));
  }, []);

  return {
    payments,
    loading,
    pagination,
    filters,
    setFilters: updateFilters,
    refetch
  };
};