import { useState, useCallback } from "react";
import movementsService from "../services/MovementsService";
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts";

export const useMovements = () => {
  const [movements, setMovements] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 7,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMovements = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response = await movementsService.getMovements({
          page: pagination.page,
          limit: pagination.limit,
          ...params,
        });

        if (response.success) {
          setMovements(response.data);
          
          // Normalizar la paginación
          if (response.pagination) {
            setPagination(response.pagination);
          } else if (response.total !== undefined) {
            setPagination({
              page: response.page || pagination.page,
              limit: response.limit || pagination.limit,
              total: response.total,
              pages: Math.ceil(response.total / (response.limit || pagination.limit)),
            });
          }
        } else {
          throw new Error(response.message || "Error cargando movimientos");
        }
      } catch (err) {
        setError(err.message);
        showErrorAlert("Error", "No se pudieron cargar los movimientos");
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit]
  );

  const changePage = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  return {
    movements,
    pagination,
    loading,
    error,
    loadMovements,
    changePage,
  };
};
