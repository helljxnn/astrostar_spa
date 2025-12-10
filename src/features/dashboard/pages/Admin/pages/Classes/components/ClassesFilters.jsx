import React, { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { useClasses } from "../hooks/useClasses";
import employeeService from "../../Services/Employees/services/employeeService";

const ClassesFilters = () => {
  const { filters, updateFilters, resetFilters } = useClasses();
  const [employees, setEmployees] = useState([]);
  const [localFilters, setLocalFilters] = useState(filters);

  // Cargar empleados para el filtro
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await employeeService.getAll({ limit: 1000 });
        if (response.success) {
          setEmployees(response.data || []);
        }
      } catch (error) {
        console.error("Error loading employees:", error);
      }
    };

    loadEmployees();
  }, []);

  // Sincronizar filtros locales con los del hook
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  /**
   * Manejar cambios en filtros locales
   */
  const handleLocalChange = (name, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Aplicar filtros
   */
  const applyFilters = () => {
    updateFilters({ ...localFilters, page: 1 });
  };

  /**
   * Limpiar filtros
   */
  const clearFilters = () => {
    const clearedFilters = {
      page: 1,
      limit: 10,
      search: "",
      status: "",
      employeeId: "",
      startDate: "",
      endDate: "",
    };
    setLocalFilters(clearedFilters);
    resetFilters();
  };

  /**
   * Verificar si hay filtros activos
   */
  const hasActiveFilters = () => {
    return (
      localFilters.search ||
      localFilters.status ||
      localFilters.employeeId ||
      localFilters.startDate ||
      localFilters.endDate
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros
        </h3>

        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Búsqueda */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={localFilters.search}
              onChange={(e) => handleLocalChange("search", e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && applyFilters()}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Buscar por título, ubicación..."
            />
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={localFilters.status}
            onChange={(e) => handleLocalChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="Programada">Programada</option>
            <option value="En_curso">En curso</option>
            <option value="Finalizada">Finalizada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>

        {/* Profesor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profesor
          </label>
          <select
            value={localFilters.employeeId}
            onChange={(e) => handleLocalChange("employeeId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los profesores</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.user.firstName} {employee.user.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Rango de fechas */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha desde
          </label>
          <input
            type="date"
            value={localFilters.startDate}
            onChange={(e) => handleLocalChange("startDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha hasta
          </label>
          <input
            type="date"
            value={localFilters.endDate}
            onChange={(e) => handleLocalChange("endDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Botones */}
        <div className="lg:col-span-4 flex items-end gap-3">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Aplicar Filtros
          </button>

          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Indicadores de filtros activos */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
          <span className="text-sm text-gray-600">Filtros activos:</span>

          {localFilters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Búsqueda: "{localFilters.search}"
              <button
                onClick={() => {
                  handleLocalChange("search", "");
                  updateFilters({ ...localFilters, search: "", page: 1 });
                }}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {localFilters.status && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Estado: {localFilters.status.replace("_", " ")}
              <button
                onClick={() => {
                  handleLocalChange("status", "");
                  updateFilters({ ...localFilters, status: "", page: 1 });
                }}
                className="hover:bg-green-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {localFilters.employeeId && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              Profesor:{" "}
              {employees.find((e) => e.id === parseInt(localFilters.employeeId))
                ?.user?.firstName || "Seleccionado"}
              <button
                onClick={() => {
                  handleLocalChange("employeeId", "");
                  updateFilters({ ...localFilters, employeeId: "", page: 1 });
                }}
                className="hover:bg-purple-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {(localFilters.startDate || localFilters.endDate) && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
              Fechas: {localFilters.startDate || "..."} -{" "}
              {localFilters.endDate || "..."}
              <button
                onClick={() => {
                  handleLocalChange("startDate", "");
                  handleLocalChange("endDate", "");
                  updateFilters({
                    ...localFilters,
                    startDate: "",
                    endDate: "",
                    page: 1,
                  });
                }}
                className="hover:bg-orange-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassesFilters;
