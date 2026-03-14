import { useState, useEffect, useCallback } from "react";
import { paymentsService } from "../services/PaymentsService.js";
import { showSuccessAlert, showErrorAlert } from "../../../../../../../../shared/utils/alerts.js";
import { PAGINATION_CONFIG } from "../../../../../../../../shared/constants/paginationConfig.js";

/**
 * Hook para gestionar pagos (Admin)
 * Puede obtener pagos pendientes o todos los pagos según el contexto
 */
export const usePayments = (mode = 'all') => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(PAGINATION_CONFIG.DEFAULT_PAGE);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    dateFrom: '',
    dateTo: ''
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
        console.log('🔍 Fetching pending payments...');
        response = await paymentsService.getPendingPayments(paginationParams);
        console.log('📊 Pending payments response:', response);
      } else if (mode === 'monthly') {
        // Gestión mensual
        console.log('🔍 Fetching monthly management with filters:', paginationParams);
        response = await paymentsService.getMonthlyPaymentsManagement(paginationParams);
        console.log('📊 Monthly management response:', response);
      } else {
        // Todos los pagos con filtros
        console.log('🔍 Fetching all payments with filters:', paginationParams);
        response = await paymentsService.getAllPayments(paginationParams);
        console.log('📊 All payments response:', response);
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
        console.log(`✅ ${mode} payments loaded:`, paymentsData.length, 'payments');
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

  // Resetear a página 1 cuando cambia la búsqueda - PATRÓN ESTÁNDAR
  useEffect(() => {
    if (currentPage !== PAGINATION_CONFIG.DEFAULT_PAGE && searchTerm) {
      setCurrentPage(PAGINATION_CONFIG.DEFAULT_PAGE);
    }
  }, [searchTerm]);

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