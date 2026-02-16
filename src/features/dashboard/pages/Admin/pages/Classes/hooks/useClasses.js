import { useState, useEffect, useCallback } from "react";
import classesService from "../services/classesService";
import { toast } from "../../../../../../../shared/utils/toast";

export const useClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Filtros
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    employeeId: "",
    startDate: "",
    endDate: "",
  });

  /**
   * Cargar clases
   */
  const fetchClasses = useCallback(
    async (customFilters = {}) => {
      try {
        setLoading(true);
        setError(null);

        const finalFilters = { ...filters, ...customFilters };
        const response = await classesService.getAll(finalFilters);

        if (response.success) {
          setClasses(response.data || []);
          setPagination(response.pagination || pagination);
        } else {
          throw new Error(response.message || "Error al cargar clases");
        }
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError(err.message);
        toast.error("Error al cargar las clases");
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  /**
   * Crear clase
   */
  const createClass = async (data) => {
    try {
      const response = await classesService.create(data);

      if (response.success) {
        toast.success("Clase creada exitosamente");
        await fetchClasses(); // Recargar lista
        return response.data;
      } else {
        throw new Error(response.message || "Error al crear clase");
      }
    } catch (err) {
      console.error("Error creating class:", err);
      toast.error(err.message);
      throw err;
    }
  };

  /**
   * Actualizar clase
   */
  const updateClass = async (id, data) => {
    try {
      const response = await classesService.update(id, data);

      if (response.success) {
        toast.success("Clase actualizada exitosamente");
        await fetchClasses(); // Recargar lista
        return response.data;
      } else {
        throw new Error(response.message || "Error al actualizar clase");
      }
    } catch (err) {
      console.error("Error updating class:", err);
      toast.error(err.message);
      throw err;
    }
  };

  /**
   * Eliminar clase
   */
  const deleteClass = async (id) => {
    try {
      const response = await classesService.delete(id);

      if (response.success) {
        toast.success("Clase eliminada exitosamente");
        await fetchClasses(); // Recargar lista
        return true;
      } else {
        throw new Error(response.message || "Error al eliminar clase");
      }
    } catch (err) {
      console.error("Error deleting class:", err);
      toast.error(err.message);
      throw err;
    }
  };

  /**
   * Asignar deportista a clase
   */
  const assignAthlete = async (classId, athleteId) => {
    try {
      const response = await classesService.assignAthlete(classId, athleteId);

      if (response.success) {
        toast.success("Deportista asignada exitosamente");
        return response.data;
      } else {
        throw new Error(response.message || "Error al asignar deportista");
      }
    } catch (err) {
      console.error("Error assigning athlete:", err);
      toast.error(err.message);
      throw err;
    }
  };

  /**
   * Remover deportista de clase
   */
  const removeAthlete = async (classId, athleteId) => {
    try {
      const response = await classesService.removeAthlete(classId, athleteId);

      if (response.success) {
        toast.success("Deportista removida exitosamente");
        return true;
      } else {
        throw new Error(response.message || "Error al remover deportista");
      }
    } catch (err) {
      console.error("Error removing athlete:", err);
      toast.error(err.message);
      throw err;
    }
  };

  /**
   * Confirmar asistencia
   */
  const confirmAttendance = async (classId, athleteId, notes = null) => {
    try {
      const response = await classesService.confirmAttendance(
        classId,
        athleteId,
        notes,
      );

      if (response.success) {
        toast.success("Asistencia confirmada");
        return response.data;
      } else {
        throw new Error(response.message || "Error al confirmar asistencia");
      }
    } catch (err) {
      console.error("Error confirming attendance:", err);
      toast.error(err.message);
      throw err;
    }
  };

  /**
   * Actualizar estado de asistencia
   */
  const updateAttendanceStatus = async (
    classId,
    athleteId,
    status,
    notes = null,
  ) => {
    try {
      const response = await classesService.updateAttendanceStatus(
        classId,
        athleteId,
        status,
        notes,
      );

      if (response.success) {
        toast.success("Estado de asistencia actualizado");
        return response.data;
      } else {
        throw new Error(response.message || "Error al actualizar estado");
      }
    } catch (err) {
      console.error("Error updating attendance status:", err);
      toast.error(err.message);
      throw err;
    }
  };

  /**
   * Actualizar filtros
   */
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  /**
   * Resetear filtros
   */
  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: "",
      status: "",
      employeeId: "",
      startDate: "",
      endDate: "",
    });
  };

  /**
   * Cambiar página
   */
  const changePage = (newPage) => {
    updateFilters({ page: newPage });
  };

  // Cargar clases cuando cambien los filtros
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return {
    // Estado
    classes,
    loading,
    error,
    pagination,
    filters,

    // Acciones
    fetchClasses,
    createClass,
    updateClass,
    deleteClass,
    assignAthlete,
    removeAthlete,
    confirmAttendance,
    updateAttendanceStatus,

    // Filtros
    updateFilters,
    resetFilters,
    changePage,
  };
};

export default useClasses;
