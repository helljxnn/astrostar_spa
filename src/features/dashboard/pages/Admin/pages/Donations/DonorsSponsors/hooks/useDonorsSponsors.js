import { useCallback, useEffect, useRef, useState } from "react";
import donorsSponsorsService from "../services/donorsSponsorsService.js";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../../../../../../../shared/utils/alerts.js";
import { useAuth } from "../../../../../../../../shared/contexts/authContext.jsx";

export const useDonorsSponsors = () => {
  const { isAuthenticated } = useAuth();
  const [donorsSponsors, setDonorsSponsors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [referenceData, setReferenceData] = useState({
    documentTypes: [],
    tipos: [],
    tiposPersona: [],
    estados: [],
  });

  const filtersRef = useRef({});
  const paginationRef = useRef(pagination);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  const loadDonorsSponsors = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);

      const { page, limit, ...filters } = params;
      filtersRef.current = { ...filtersRef.current, ...filters };

      const pageToUse = page ?? paginationRef.current.page;
      const limitToUse = limit ?? paginationRef.current.limit;

      try {
        const response = await donorsSponsorsService.getAll({
          page: pageToUse,
          limit: limitToUse,
          ...filtersRef.current,
        });

        if (response.success) {
          const rawData = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data?.data)
            ? response.data.data
            : [];
          const normalized = rawData.map((record) => ({
            ...record,
            id: record.id || record._id || record.identificacion || "",
          }));
          setDonorsSponsors(normalized);
          const nextPagination = response.pagination
            ? { ...paginationRef.current, ...response.pagination }
            : {
                ...paginationRef.current,
                page: pageToUse,
                limit: limitToUse,
                total: rawData.length || paginationRef.current.total,
              };

          setPagination((prev) =>
            JSON.stringify(prev) === JSON.stringify(nextPagination)
              ? prev
              : nextPagination
          );
        } else {
          throw new Error(response.message || "Error cargando registros");
        }
      } catch (err) {
        setError(err.message);
        showErrorAlert(
          "Error",
          err.message || "No se pudieron cargar los registros."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadReferenceData = useCallback(async () => {
    try {
      const response = await donorsSponsorsService.getReferenceData();
      if (response.success) {
        setReferenceData(response.data || {});
      }
    } catch (err) {
    }
  }, []);

  const createDonorSponsor = useCallback(
    async (data) => {
      setLoading(true);
      try {
        const response = await donorsSponsorsService.create(data);
        if (response.success) {
          showSuccessAlert(
            "Registro creado",
            response.message || "El registro se creó correctamente."
          );
          await loadDonorsSponsors({ page: 1 });
          return response.data;
        }
        throw new Error(response.message || "No se pudo crear el registro.");
      } catch (err) {
        showErrorAlert(
          "Error",
          err.message || "No se pudo crear el registro."
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadDonorsSponsors]
  );

  const updateDonorSponsor = useCallback(
    async (id, data) => {
      setLoading(true);
      try {
        const response = await donorsSponsorsService.update(id, data);
        if (response.success) {
          showSuccessAlert(
            "Registro actualizado",
            response.message || "El registro se actualizó correctamente."
          );
          await loadDonorsSponsors();
          return response.data;
        }
        throw new Error(response.message || "No se pudo actualizar el registro.");
      } catch (err) {
        showErrorAlert(
          "Error",
          err.message || "No se pudo actualizar el registro."
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadDonorsSponsors]
  );

  const deleteDonorSponsor = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const response = await donorsSponsorsService.delete(id);
        if (response.success) {
          showSuccessAlert("Registro eliminado", response.message);
          await loadDonorsSponsors();
          return true;
        }
        throw new Error(response.message || "No se pudo eliminar el registro.");
      } catch (err) {
        showErrorAlert(
          "Error",
          err.message || "No se pudo eliminar el registro."
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadDonorsSponsors]
  );

  const changeStatus = useCallback(
    async (id, status) => {
      try {
        const response = await donorsSponsorsService.changeStatus(id, status);
        if (response.success) {
          showSuccessAlert(
            "Estado actualizado",
            response.message || "Estado actualizado correctamente."
          );
          await loadDonorsSponsors();
          return response.data;
        }
        throw new Error(response.message || "No se pudo actualizar el estado.");
      } catch (err) {
        showErrorAlert("Error", err.message || "No se pudo actualizar el estado");
        throw err;
      }
    },
    [loadDonorsSponsors]
  );

  const checkIdentificationAvailability = useCallback(async (identification, excludeId = null) => {
    try {
      return await donorsSponsorsService.checkIdentificationAvailability(
        identification,
        excludeId
      );
    } catch (err) {
      return { available: false, message: "Error verificando identificaci\u00f3n" };
    }
  }, []);

  const checkEmailAvailability = useCallback(async (email, excludeId = null) => {
    try {
      return await donorsSponsorsService.checkEmailAvailability(email, excludeId);
    } catch (err) {
      return { available: false, message: "Error verificando correo" };
    }
  }, []);

  const changePage = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  const changeLimit = useCallback((newLimit) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadReferenceData();
    }
  }, [isAuthenticated, loadReferenceData]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDonorsSponsors();
    }
  }, [
    isAuthenticated,
    loadDonorsSponsors,
    pagination.page,
    pagination.limit,
  ]);

  return {
    donorsSponsors,
    loading,
    error,
    pagination,
    referenceData,
    loadDonorsSponsors,
    createDonorSponsor,
    updateDonorSponsor,
    deleteDonorSponsor,
    changeStatus,
    checkIdentificationAvailability,
    checkEmailAvailability,
    changePage,
    changeLimit,
  };
};

export default useDonorsSponsors;

