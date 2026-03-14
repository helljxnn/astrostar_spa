// useSportsCategories.js
import { useState, useCallback } from "react";
import apiClient from "../../../../../../../../shared/services/apiClient";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../../../../../../../shared/utils/alerts.js";

const API_URL = "/sports-categories";

const parseCount = (value) => {
  if (Array.isArray(value)) return value.length;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const normalizeCategory = (raw = {}) => {
  const id = raw.id ?? raw.Id ?? raw.ID ?? raw.categoryId ?? raw.categoryID;
  const name = raw.name ?? raw.nombre ?? "";
  const description = raw.description ?? raw.descripcion ?? "";
  const minAge = raw.minAge ?? raw.edadMinima ?? null;
  const maxAge = raw.maxAge ?? raw.edadMaxima ?? null;
  const status = raw.status ?? raw.estado ?? "";
  const publish = raw.publish ?? raw.publicar ?? false;
  const archivo =
    raw.archivo ?? raw.imageUrl ?? raw.file ?? raw.fileUrl ?? raw.image ?? "";
  const rawCounts =
    raw.associations ?? raw.asociaciones ?? raw._count ?? raw.counts ?? {};
  const inscriptionsCount = parseCount(
    raw.inscriptionsCount ??
      raw.inscripcionesCount ??
      rawCounts.inscriptions ??
      rawCounts.inscripciones ??
      raw.inscriptions ??
      raw.inscripciones
  );
  const participantsCount = parseCount(
    raw.participantsCount ??
      raw.participantesCount ??
      rawCounts.participants ??
      rawCounts.participantes ??
      raw.participants ??
      raw.participantes
  );
  const servicesCount = parseCount(
    raw.servicesCount ??
      raw.serviciosCount ??
      raw.serviceSportsCategoriesCount ??
      rawCounts.serviceSportsCategories ??
      rawCounts.services ??
      raw.serviceSportsCategories
  );
  const associationsCount =
    inscriptionsCount + participantsCount + servicesCount;
  const isAssociated =
    raw.isAssociated ??
    raw.asociada ??
    raw.asociado ??
    raw.tieneAsociaciones ??
    associationsCount > 0;

  return {
    ...raw,
    id,
    nombre: name,
    name,
    descripcion: description,
    description,
    edadMinima: minAge,
    minAge,
    edadMaxima: maxAge,
    maxAge,
    estado: status,
    status,
    publicar: publish,
    publish,
    archivo,
    imageUrl: raw.imageUrl ?? archivo,
    associations: {
      inscriptions: inscriptionsCount,
      participants: participantsCount,
      services: servicesCount,
    },
    associationsCount,
    isAssociated: Boolean(isAssociated),
  };
};

export function useSportsCategories() {
  const [sportsCategories, setSportsCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSportsCategories = useCallback(
    async ({ page = 1, limit = 10, search = "", status = "" } = {}) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get(API_URL, {
          params: { page, limit, search, status },
        });
        const items = response?.data?.data || response?.data || response || [];
        const normalized = Array.isArray(items)
          ? items.map(normalizeCategory)
          : [];

        const respPagination = response?.data?.pagination ||
          response?.pagination || {
            page,
            limit,
            total: Array.isArray(items) ? items.length : 0,
            pages: Math.ceil((Array.isArray(items) ? items.length : 0) / limit),
          };

        setSportsCategories(normalized);
        setCategories(normalized);
        setPagination({
          page: respPagination.page || page,
          limit: respPagination.limit || limit,
          total:
            respPagination.total ?? (Array.isArray(items) ? items.length : 0),
          pages:
            respPagination.pages ??
            Math.ceil(
              (respPagination.total ??
                (Array.isArray(items) ? items.length : 0)) / limit
            ),
        });

        return { success: true, data: normalized, pagination: respPagination };
      } catch (err) {
        console.error("fetchSportsCategories error:", err);
        setError(err?.message || "No se pudieron cargar las categorías.");
        // No mostrar alerta automáticamente, dejar que el componente decida
        // showErrorAlert("Error", "No se pudieron cargar las categorías.");
        return { success: false, error: err?.message || "No se pudieron cargar las categorías." };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createSportsCategory = async (data, params = {}) => {
    try {
      setLoading(true);
      const response = await apiClient.post(API_URL, data);
      showSuccessAlert("Categoría creada");
      await fetchSportsCategories(params);
      return { success: true, data: response };
    } catch (err) {
      console.error("createSportsCategory error:", err);
      showErrorAlert(
        "Error",
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo crear la categoría."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSportsCategory = async (id, data, params = {}) => {
    try {
      setLoading(true);
      const response = await apiClient.put(`${API_URL}/${id}`, data);
      showSuccessAlert("Categoría actualizada");
      await fetchSportsCategories(params);
      return { success: true, data: response };
    } catch (err) {
      console.error("updateSportsCategory error:", err);
      showErrorAlert(
        "Error",
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo actualizar la categoría."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSportsCategory = async (id, params = {}) => {
    try {
      setLoading(true);
      await apiClient.delete(`${API_URL}/${id}`);
      showSuccessAlert("Categoría eliminada");
      await fetchSportsCategories(params);
    } catch (err) {
      console.error("deleteSportsCategory error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo eliminar la categoría.";
      showErrorAlert("Error al eliminar", errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSportsCategoryById = async (id) => {
    const response = await apiClient.get(`${API_URL}/${id}`);
    const raw = response?.data?.data || response?.data || response || {};
    return normalizeCategory(raw);
  };

  const getAthletesByCategory = async (id) => {
    const response = await apiClient.get(`${API_URL}/${id}/athletes`);
    const data = response?.data?.data || response?.data || [];
    return Array.isArray(data) ? data : [];
  };

  // check name availability -> devuelve { available: boolean, message? }
  const checkCategoryNameAvailability = async (name, excludeId = null) => {
    const trimmed = (name ?? "").trim();
    if (!trimmed)
      return { available: false, message: "El nombre es obligatorio" };
    if (trimmed.length < 3)
      return { available: false, message: "Debe tener al menos 3 caracteres." };

    try {
      const params = { name: trimmed };
      if (excludeId) params.excludeId = excludeId;
      const response = await apiClient.get(`${API_URL}/validate-name`, params);
      return response?.data || response || { available: true };
    } catch (err) {
      console.warn(
        "checkCategoryNameAvailability fallback (backend error):",
        err
      );
      return { available: true };
    }
  };

  return {
    sportsCategories,
    categories,
    pagination,
    loading,
    error,
    fetchSportsCategories,
    createSportsCategory,
    updateSportsCategory,
    deleteSportsCategory,
    getSportsCategoryById,
    getAthletesByCategory,
    checkCategoryNameAvailability,
  };
}

export default useSportsCategories;
