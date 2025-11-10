import { useState, useCallback } from "react";
import apiClient from "../../../../../../../../shared/services/apiClient";
import { showErrorAlert, showSuccessAlert } from "../../../../../../../../shared/utils/Alerts";

const API_URL = "/sports-categories";

export const useSportsCategories = () => {
  const [sportsCategories, setSportsCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Archivo temporal para mostrar antes de que el backend devuelva la URL
  const [lastUploadedFile, setLastUploadedFile] = useState(null);

  /* ==================== Listar categorías ==================== */
  const fetchSportsCategories = useCallback(
    async ({ page = 1, limit = 10, search = "", status = "" } = {}) => {
      try {
        setLoading(true);
        setError(null);

        const params = { page, limit, search, status };
        Object.keys(params).forEach(
          (key) => (params[key] === "" || params[key] === null || params[key] === undefined) && delete params[key]
        );

        const { data } = await apiClient.get(API_URL, { params });

        let raw = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [data];

        const categories = raw.map((item) => ({
          id: item.id,
          nombre: item.name || item.nombre,
          descripcion: item.description || item.descripcion,
          edadMinima: item.minAge ?? item.edadMinima,
          edadMaxima: item.maxAge ?? item.edadMaxima,
          estado: item.status || item.estado,
          publicar: item.publish ?? item.publicar,
          archivo: item.file || item.archivo || item.imageUrl || item.image,
          ...item,
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
        const msg = err.response?.data?.message || err.message || "Error al cargar categorías";
        setError(msg);
        showErrorAlert("Error", msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* ==================== Crear categoría ==================== */
  const createSportsCategory = async (formData, params) => {
    try {
      setLoading(true);

      // Guardar temporalmente el archivo subido
      const file = formData.get("file");
      setLastUploadedFile(file || null);

      await apiClient.post(API_URL, formData, { headers: { "Content-Type": "multipart/form-data" } });
      showSuccessAlert("✅ Categoría creada con éxito");
      await fetchSportsCategories(params);
    } catch (err) {
      const msg = err.response?.data?.message || "No se pudo crear la categoría";
      showErrorAlert("Error al crear", msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* ==================== Actualizar categoría ==================== */
  const updateSportsCategory = async (id, formData, params) => {
    try {
      setLoading(true);

      const file = formData.get("file");
      if (file) setLastUploadedFile(file);

      await apiClient.put(`${API_URL}/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      showSuccessAlert("✅ Categoría actualizada con éxito");
      await fetchSportsCategories(params);
    } catch (err) {
      const msg = err.response?.data?.message || "No se pudo actualizar la categoría";
      showErrorAlert("Error al actualizar", msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* ==================== Eliminar categoría ==================== */
  const deleteSportsCategory = async (item, params) => {
    if (!confirm(`¿Eliminar "${item.nombre}"?`)) return;
    try {
      setLoading(true);
      await apiClient.delete(`${API_URL}/${item.id}`);
      showSuccessAlert("✅ Categoría eliminada con éxito");
      await fetchSportsCategories(params);
    } catch (err) {
      const msg = err.response?.data?.message || "No se pudo eliminar la categoría";
      showErrorAlert("Error al eliminar", msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* ==================== Obtener categoría por ID (para modal) ==================== */
  const getSportsCategoryById = async (id) => {
    try {
      const { data } = await apiClient.get(`${API_URL}/${id}`);
      const normalized = {
        id: data.id,
        Nombre: data.name || data.nombre,
        Descripcion: data.description || data.descripcion || "No hay descripción disponible",
        EdadMinima: data.minAge ?? data.edadMinima ?? "No especificado",
        EdadMaxima: data.maxAge ?? data.edadMaxima ?? "No especificado",
        Estado: data.status ?? data.estado ?? "Inactive",
        Publicar: data.publish ?? data.publicar ?? false,
        Archivo: data.file || data.archivo || data.imageUrl || data.image || data.filePath || lastUploadedFile || null,
        ...data,
      };
      console.log("✅ Categoría normalizada:", normalized);
      return normalized;
    } catch (err) {
      console.error("❌ Error al obtener categoría:", err);
      showErrorAlert("Error", "No se pudo obtener la categoría");
      throw err;
    }
  };

  const getAthletesByCategory = async (id) => {
    try {
      const { data } = await apiClient.get(`${API_URL}/${id}/athletes`);
      return data || [];
    } catch (err) {
      showErrorAlert("Error", "No se pudieron obtener los atletas");
      throw err;
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
    getSportsCategoryById,
    getAthletesByCategory,
  };
};

export default useSportsCategories;
