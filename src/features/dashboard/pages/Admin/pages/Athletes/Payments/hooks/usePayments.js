import { useState, useEffect, useCallback } from "react";
import { paymentsService } from "../services/PaymentsService.js";
import { showSuccessAlert, showErrorAlert } from "../../../../../../../../shared/utils/alerts.js";
import { PAGINATION_CONFIG } from "../../../../../../../../shared/constants/paginationConfig.js";

/**
 * Hook para gestionar pagos (Admin)
 * Puede obtener pagos pendientes o todos los pagos según el contexto
 */
export const usePayments = (mode = 'all', initialParams = {}) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(PAGINATION_CONFIG.DEFAULT_PAGE);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState(initialParams.search || '');
  const [filters, setFilters] = useState({
    status: initialParams.status || '',
    type: initialParams.type || '',
    dateFrom: initialParams.dateFrom || '',
    dateTo: initialParams.dateTo || ''
  });

  const fetchPayments = async () => {
    setLoading(true);
    try {
      let response;
      
      // Preparar parámetros de paginación - SIGUIENDO EL PATRÓN DE MÓDULOS EXITOSOS
      const paginationParams = {
        page: currentPage,
        limit: PAGINATION_CONFIG.ROWS_PER_PAGE,
        search: searchTerm,
        status: filters.status,
        type: filters.type,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
      };
      
      if (mode === 'pending') {
        // Solo pagos pendientes
        response = await paymentsService.getPendingPayments(paginationParams);
      } else if (mode === 'monthly') {
        // Gestión mensual
        response = await paymentsService.getMonthlyPaymentsManagement(paginationParams);
      } else {
        // Todos los pagos con filtros
        response = await paymentsService.getAllPayments(paginationParams);
      }
      
      // Validación defensiva de la respuesta
      if (!response) {
        throw new Error('Respuesta vacía del servidor');
      }
      
      // Procesar respuesta siguiendo el patrón de módulos exitosos
      if (response.success) {
        const paymentsData = Array.isArray(response.data) ? response.data : [];
        setPayments(paymentsData);
        setTotalRows(response.pagination?.total || paymentsData.length);
      } else {
        throw new Error(response.message || 'Error en la respuesta del servidor');
      }
      
    } catch (error) {
      console.error('Error fetching payments:', error);
      showErrorAlert('Error', 'No se pudieron cargar los pagos');
      setPayments([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  // Cargar pagos cuando cambian la página o los filtros - PATRÓN SIMPLE COMO MÓDULOS EXITOSOS
  useEffect(() => {
    fetchPayments();
  }, [currentPage, searchTerm, filters.status, filters.type, filters.dateFrom, filters.dateTo, mode]);

  // Actualizar searchTerm cuando cambian los parámetros iniciales
  useEffect(() => {
    if (initialParams.search !== undefined && initialParams.search !== searchTerm) {
      setSearchTerm(initialParams.search);
    }
  }, [initialParams.search]);

  useEffect(() => {
    const nextFilters = {
      status: initialParams.status || '',
      type: initialParams.type || '',
      dateFrom: initialParams.dateFrom || '',
      dateTo: initialParams.dateTo || ''
    };

    setFilters((prev) => {
      if (
        prev.status === nextFilters.status &&
        prev.type === nextFilters.type &&
        prev.dateFrom === nextFilters.dateFrom &&
        prev.dateTo === nextFilters.dateTo
      ) {
        return prev;
      }
      return nextFilters;
    });
  }, [initialParams.status, initialParams.type, initialParams.dateFrom, initialParams.dateTo]);

  // Resetear a página 1 cuando cambia la búsqueda - PATRÓN ESTÁNDAR
  useEffect(() => {
    if (currentPage !== PAGINATION_CONFIG.DEFAULT_PAGE && searchTerm) {
      setCurrentPage(PAGINATION_CONFIG.DEFAULT_PAGE);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage !== PAGINATION_CONFIG.DEFAULT_PAGE) {
      setCurrentPage(PAGINATION_CONFIG.DEFAULT_PAGE);
    }
  }, [filters.status, filters.type, filters.dateFrom, filters.dateTo]);

  // Función para cambiar página - SIMPLE Y DIRECTA
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Función para actualizar filtros - SIN COMPLEJIDAD INNECESARIA
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Función para actualizar búsqueda
  const updateSearch = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    // Si cambia la búsqueda, resetear a página 1
    if (newSearchTerm !== searchTerm) {
      setCurrentPage(PAGINATION_CONFIG.DEFAULT_PAGE);
    }
  };

  // Aprobar pago
  const approvePayment = async (paymentId) => {
    setActionLoading(true);
    try {
      const response = await paymentsService.approvePayment(paymentId);
      
      if (response.success) {
        showSuccessAlert('Pago Aprobado', 'El pago ha sido aprobado exitosamente');
        await fetchPayments(); // Recargar lista
        return { success: true };
      } else {
        throw new Error(response.error || 'Error al aprobar el pago');
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      showErrorAlert('Error', error.message || 'No se pudo aprobar el pago');
      return { success: false, error: error.message };
    } finally {
      setActionLoading(false);
    }
  };

  // Rechazar pago
  const rejectPayment = async (paymentId, reason) => {
    setActionLoading(true);
    try {
      const response = await paymentsService.rejectPayment(paymentId, reason);
      
      if (response.success) {
        showSuccessAlert('Pago Rechazado', 'El pago ha sido rechazado');
        await fetchPayments(); // Recargar lista
        return { success: true };
      } else {
        throw new Error(response.error || 'Error al rechazar el pago');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      showErrorAlert('Error', error.message || 'No se pudo rechazar el pago');
      return { success: false, error: error.message };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    payments,
    loading,
    actionLoading,
    currentPage,
    totalRows,
    searchTerm,
    filters,
    setFilters: updateFilters,
    setSearchTerm: updateSearch,
    handlePageChange,
    refetch: fetchPayments,
    approvePayment,
    rejectPayment,
  };
};
