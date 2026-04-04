/**
 * Hook genérico para obtener datos completos para reportes
 * Resuelve el problema de paginación en reportes de forma global
 */

import { useCallback } from "react";
import { showErrorAlert } from "../utils/alerts.js";

/**
 * Función helper para obtener todos los datos paginados
 * @param {Function} apiCall - Función que hace la llamada a la API
 * @param {Object} params - Parámetros base para la llamada
 * @returns {Promise<Array>} Todos los datos obtenidos
 */
const getAllPaginatedData = async (apiCall, params = {}) => {
  let allData = [];
  let currentPage = 1;
  let hasMorePages = true;
  const limit = 100; // Límite máximo permitido por el backend
  
  while (hasMorePages) {
    const requestParams = {
      ...params,
      page: currentPage,
      limit: limit,
    };
    
    const response = await apiCall(requestParams);
    
    if (response && response.success) {
      const pageData = response.data || [];
      allData = [...allData, ...pageData];
      
      // Verificar si hay más páginas
      hasMorePages = response.pagination?.hasNext || false;
      currentPage++;
      
      // Seguridad: evitar bucle infinito
      if (currentPage > 100) {
        break;
      }
    } else {
      hasMorePages = false;
    }
  }
  
  return {
    success: true,
    data: allData,
    pagination: {
      total: allData.length,
      page: 1,
      limit: allData.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    }
  };
};

export const useReportData = (service, endpoint = "getAll") => {
  /**
   * Obtener todos los datos para reporte (sin paginación)
   * @param {Object} filters - Filtros aplicados (búsqueda, estado, etc.)
   * @param {Function} dataMapper - Función para mapear los datos al formato del reporte
   * @returns {Promise<Array>} Datos completos para el reporte
   */
  const getReportData = useCallback(
    async (filters = {}, dataMapper = null) => {
      try {
        // Crear parámetros sin paginación
        const params = {
          ...filters,
          // Remover paginación para obtener todos los datos
          page: undefined,
          limit: undefined,
        };

        let response;
        
        // Intentar usar endpoint específico para reportes si existe
        if (service.getAllForReport && typeof service.getAllForReport === 'function') {
          response = await service.getAllForReport(params);
        } else if (service[endpoint] && typeof service[endpoint] === 'function') {
          // Usar endpoint genérico con paginación múltiple
          response = await getAllPaginatedData(
            (requestParams) => service[endpoint](requestParams),
            params
          );
        } else {
          throw new Error(`Método ${endpoint} no encontrado en el servicio`);
        }

        if (response.success) {
          const data = response.data || [];
          
          // Aplicar mapper si se proporciona
          if (dataMapper && typeof dataMapper === 'function') {
            return dataMapper(data);
          }
          
          return data;
        } else {
          throw new Error(response.message || "Error obteniendo datos para reporte");
        }
      } catch (error) {
        showErrorAlert("Error", "No se pudieron obtener los datos para el reporte");
        return [];
      }
    },
    [service, endpoint]
  );

  return { getReportData };
};

/**
 * Hook específico para módulos que ya tienen un hook personalizado
 * @param {Function} serviceFunction - Función del servicio que obtiene los datos
 * @returns {Object} Funciones para obtener datos de reporte
 */
export const useReportDataWithService = (serviceFunction) => {
  const getReportData = useCallback(
    async (filters = {}, dataMapper = null) => {
      try {
        // Crear parámetros sin límite alto (el servicio manejará la paginación internamente)
        const params = {
          ...filters,
          // No incluir limit aquí, el servicio getAllForReport lo manejará
        };

        const response = await serviceFunction(params);

        if (response && response.success) {
          const data = response.data || [];
          
          // Aplicar mapper si se proporciona
          if (dataMapper && typeof dataMapper === 'function') {
            const mappedData = dataMapper(data);
            return mappedData;
          }
          
          return data;
        } else {
          const errorMsg = response?.message || "Error obteniendo datos para reporte";
          throw new Error(errorMsg);
        }
      } catch (error) {
        showErrorAlert("Error", "No se pudieron obtener los datos para el reporte");
        return [];
      }
    },
    [serviceFunction]
  );

  return { getReportData };
};

// Exportar la función helper para uso directo en servicios
export { getAllPaginatedData };
