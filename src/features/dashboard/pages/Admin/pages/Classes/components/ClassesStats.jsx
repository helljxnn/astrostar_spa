import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import classesService from "../services/classesService";
import LoadingSpinner from "../../../../../../../shared/components/LoadingSpinner";

const ClassesStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("month"); // month, week, year

  // Cargar estadísticas
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const response = await classesService.getStats();

        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        No se pudieron cargar las estadísticas
      </div>
    );
  }

  const totalClasses = stats.total || 0;
  const activeClasses = (stats.programadas || 0) + (stats.enCurso || 0);
  const completedClasses = stats.finalizadas || 0;
  const cancelledClasses = stats.canceladas || 0;

  const completionRate =
    totalClasses > 0 ? ((completedClasses / totalClasses) * 100).toFixed(1) : 0;
  const cancellationRate =
    totalClasses > 0 ? ((cancelledClasses / totalClasses) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Selector de período */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Estadísticas de Clases
        </h3>

        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          {[
            { id: "week", name: "Semana" },
            { id: "month", name: "Mes" },
            { id: "year", name: "Año" },
          ].map((period) => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                selectedPeriod === period.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {period.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de clases */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">
                Total de Clases
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {totalClasses}
              </div>
            </div>
          </div>
        </div>

        {/* Clases activas */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">
                Clases Activas
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {activeClasses}
              </div>
              <div className="text-xs text-gray-500">
                {stats.programadas} programadas, {stats.enCurso} en curso
              </div>
            </div>
          </div>
        </div>

        {/* Clases completadas */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">
                Completadas
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {completedClasses}
              </div>
              <div className="text-xs text-green-600">
                {completionRate}% del total
              </div>
            </div>
          </div>
        </div>

        {/* Clases canceladas */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">
                Canceladas
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {cancelledClasses}
              </div>
              <div className="text-xs text-red-600">
                {cancellationRate}% del total
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de distribución por estado */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Distribución por Estado
        </h4>

        <div className="space-y-4">
          {[
            {
              label: "Programadas",
              value: stats.programadas,
              color: "bg-blue-500",
              textColor: "text-blue-600",
            },
            {
              label: "En Curso",
              value: stats.enCurso,
              color: "bg-yellow-500",
              textColor: "text-yellow-600",
            },
            {
              label: "Finalizadas",
              value: stats.finalizadas,
              color: "bg-green-500",
              textColor: "text-green-600",
            },
            {
              label: "Canceladas",
              value: stats.canceladas,
              color: "bg-red-500",
              textColor: "text-red-600",
            },
          ].map((item) => {
            const percentage =
              totalClasses > 0
                ? ((item.value / totalClasses) * 100).toFixed(1)
                : 0;

            return (
              <div key={item.label} className="flex items-center">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {item.label}
                    </span>
                    <span className={`text-sm font-medium ${item.textColor}`}>
                      {item.value} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tendencias */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendencias
          </h4>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Tasa de finalización
              </span>
              <span className="text-sm font-medium text-green-600">
                {completionRate}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tasa de cancelación</span>
              <span className="text-sm font-medium text-red-600">
                {cancellationRate}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Clases activas</span>
              <span className="text-sm font-medium text-blue-600">
                {totalClasses > 0
                  ? ((activeClasses / totalClasses) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>

        {/* Resumen rápido */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Resumen Rápido
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Estado más común</span>
              <span className="text-sm font-medium">
                {stats.programadas >=
                Math.max(stats.enCurso, stats.finalizadas, stats.canceladas)
                  ? "Programadas"
                  : stats.finalizadas >=
                    Math.max(stats.enCurso, stats.canceladas)
                  ? "Finalizadas"
                  : stats.enCurso >= stats.canceladas
                  ? "En Curso"
                  : "Canceladas"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Promedio por día</span>
              <span className="text-sm font-medium">
                {selectedPeriod === "week"
                  ? (totalClasses / 7).toFixed(1)
                  : selectedPeriod === "month"
                  ? (totalClasses / 30).toFixed(1)
                  : (totalClasses / 365).toFixed(1)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Eficiencia</span>
              <span
                className={`text-sm font-medium ${
                  completionRate >= 80
                    ? "text-green-600"
                    : completionRate >= 60
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {completionRate >= 80
                  ? "Excelente"
                  : completionRate >= 60
                  ? "Buena"
                  : "Necesita mejora"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassesStats;
