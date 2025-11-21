// ===============================
// HOOK PRINCIPAL DE CATEGORÍAS
// ===============================

import { useState, useCallback } from "react";
import apiClient from "../../../../../../../../shared/services/apiClient";
import {
  showErrorAlert,
  showSuccessAlert,
  showDeleteAlert,
} from "../../../../../../../../shared/utils/Alerts";

const API_URL = "/sports-categories";

const useSportsCategories = () => {
  const [sportsCategories, setSportsCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUploadedFile, setLastUploadedFile] = useState(null);

  // ===========================
  // LISTAR
  // ===========================
  const fetchSportsCategories = useCallback(
    async ({ page = 1, limit = 10, search = "", status = "" } = {}) => {
      try {
        setLoading(true);
        setError(null);

        const params = { page, limit, search, status };
        Object.keys(params).forEach(
          (k) => (params[k] === "" || params[k] == null) && delete params[k]
        );

        const { data } = await apiClient.get(API_URL, { params });

        const raw = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];

        const categories = raw.map((item) => ({
          id: item.id,
          nombre: item.nombre || item.name,
          descripcion: item.descripcion || item.description,
          edadMinima: item.edadMinima ?? item.minAge,
          edadMaxima: item.edadMaxima ?? item.maxAge,
          estado: item.estado || item.status,
          publicar: item.publicar ?? item.publish,
          archivo: item.archivo || item.file || null,
        }));

        const pag = data.pagination || {
          page: data.page || page,
          limit: data.limit || limit,
          total: data.total || categories.length,
          pages: data.pages || 1,
        };

        setSportsCategories(categories);
        setPagination(pag);
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Error al cargar categorías";

        setError(msg);
        showErrorAlert("Error", msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ===========================
  // VALIDAR NOMBRE (BACKEND)
  // ===========================
  const checkCategoryNameAvailability = async (name, id = null) => {
    try {
      const { data } = await apiClient.get(`${API_URL}/validate-name`, {
        params: { name, id },
      });

      return {
        available: data?.available ?? false,
        message: data?.message || "",
      };
    } catch (err) {
      console.warn("Error en validación backend");
      throw err;
    }
  };

  // ===========================
  // CREAR
  // ===========================
  const createSportsCategory = async (formData, params) => {
    try {
      setLoading(true);

      const file = formData.get("file");
      setLastUploadedFile(file || null);

      await apiClient.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showSuccessAlert("Categoría creada", "Se creó correctamente.");
      await fetchSportsCategories(params);
    } catch (err) {
      const msg =
        err.response?.data?.message || "No se pudo crear la categoría";
      showErrorAlert("Error", msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // ACTUALIZAR
  // ===========================
  const updateSportsCategory = async (id, formData, params) => {
    try {
      setLoading(true);

      const file = formData.get("file");
      if (file) setLastUploadedFile(file);

      await apiClient.put(`${API_URL}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showSuccessAlert("Actualizada", "Se actualizó correctamente.");
      await fetchSportsCategories(params);
    } catch (err) {
      const msg =
        err.response?.data?.message || "No se pudo actualizar la categoría";
      showErrorAlert("Error", msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // ELIMINAR
  // ===========================
  const deleteSportsCategory = async (id, params) => {
    const found = sportsCategories.find((c) => c.id === id);
    if (!found) return false;

    const result = await showDeleteAlert(
      "¿Eliminar categoría?",
      `La categoría "${found.nombre}" será eliminada.`
    );

    if (!result.isConfirmed) return false;

    try {
      setLoading(true);

      await apiClient.delete(`${API_URL}/${id}`);

      showSuccessAlert("Eliminada", "Se eliminó correctamente.");
      await fetchSportsCategories(params);
      return true;
    } catch (err) {
      const msg =
        err.response?.data?.message || "No se pudo eliminar la categoría";
      showErrorAlert("Error", msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    sportsCategories,
    pagination,
    loading,
    error,
    lastUploadedFile,
    fetchSportsCategories,
    createSportsCategory,
    updateSportsCategory,
    deleteSportsCategory,
    checkCategoryNameAvailability,
  };
};

export default useSportsCategories;
