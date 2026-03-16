import { useState, useEffect } from "react";
import KPICard from "../components/KPICard";
import HealthServicesGraphic from "../components/HealthServicesGraphic";
import HealthServicesYearGraphic from "../components/HealthServicesYearGraphic";
import DashboardService from "../services/DashboardService";
import {
  FaHeartbeat,
  FaAppleAlt,
  FaBriefcaseMedical,
  FaBrain,
} from "react-icons/fa";

const HealthSection = () => {
  const [healthData, setHealthData] = useState({
    stats: {
      total: 0,
      nutricion: 0,
      fisioterapia: 0,
      psicologia: 0,
      completadas: 0,
      programadas: 0,
      pendientes: 0,
      canceladas: 0
    },
    monthly: [],
    yearly: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const response = await DashboardService.getHealthServicesData();

      if (response.success && response.data) {
        setHealthData(response.data);
      } else {
        // Usar datos por defecto si no hay datos reales
        setHealthData(response.data);
      }
    } catch (error) {
      console.error("Error al cargar datos de servicios de salud:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular porcentajes para las barras de servicios más solicitados
  const totalServices = healthData.stats.nutricion + healthData.stats.fisioterapia + healthData.stats.psicologia;
  const nutricionPercentage = totalServices > 0 ? (healthData.stats.nutricion / totalServices) * 100 : 0;
  const fisioterapiaPercentage = totalServices > 0 ? (healthData.stats.fisioterapia / totalServices) * 100 : 0;
  const psicologiaPercentage = totalServices > 0 ? (healthData.stats.psicologia / totalServices) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* KPIs específicos de servicios de salud */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Citas"
          value={loading ? "..." : healthData.stats.total.toString()}
          icon={FaHeartbeat}
          color="green"
          trend="up"
          trendValue="15%"
        />
        <KPICard
          title="Nutrición"
          value={loading ? "..." : healthData.stats.nutricion.toString()}
          icon={FaAppleAlt}
          color="blue"
          trend="up"
          trendValue="12%"
        />
        <KPICard
          title="Fisioterapia"
          value={loading ? "..." : healthData.stats.fisioterapia.toString()}
          icon={FaBriefcaseMedical}
          color="purple"
          trend="up"
          trendValue="8%"
        />
        <KPICard
          title="Psicología"
          value={loading ? "..." : healthData.stats.psicologia.toString()}
          icon={FaBrain}
          color="pink"
          trend="up"
          trendValue="10%"
        />
      </div>

      {/* Gráficas principales */}
      <div className="grid grid-cols-1 gap-6">
        <HealthServicesGraphic healthData={healthData} loading={loading} />
        <HealthServicesYearGraphic healthData={healthData} loading={loading} />
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-primary-green to-primary-blue rounded-full"></div>
            Servicios Más Solicitados
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : totalServices === 0 ? (
            <div className="text-center text-gray-500 py-8 text-sm">
              No hay datos de servicios disponibles
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-blue to-blue-400 flex items-center justify-center shadow-md">
                  <FaAppleAlt className="text-white text-xl" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      Nutrición
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {healthData.stats.nutricion} citas
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-blue to-blue-400 transition-all duration-1000"
                      style={{ width: `${nutricionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-purple to-purple-400 flex items-center justify-center shadow-md">
                  <FaBriefcaseMedical className="text-white text-xl" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      Fisioterapia
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {healthData.stats.fisioterapia} citas
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-purple to-purple-400 transition-all duration-1000"
                      style={{ width: `${fisioterapiaPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-pink to-pink-400 flex items-center justify-center shadow-md">
                  <FaBrain className="text-white text-xl" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      Psicología
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {healthData.stats.psicologia} citas
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-pink to-pink-400 transition-all duration-1000"
                      style={{ width: `${psicologiaPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-primary-purple to-primary-pink rounded-full"></div>
            Estado de Citas
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-primary-green/10 rounded-xl hover:bg-primary-green/20 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary-green shadow-sm"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Completadas
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-800 bg-white px-3 py-1 rounded-lg">
                  {healthData.stats.completadas}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-primary-blue/10 rounded-xl hover:bg-primary-blue/20 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary-blue shadow-sm"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Programadas
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-800 bg-white px-3 py-1 rounded-lg">
                  {healthData.stats.programadas}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-primary-yellow/10 rounded-xl hover:bg-primary-yellow/20 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary-yellow shadow-sm"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Pendientes
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-800 bg-white px-3 py-1 rounded-lg">
                  {healthData.stats.pendientes}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-primary-red/10 rounded-xl hover:bg-primary-red/20 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary-red shadow-sm"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Canceladas
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-800 bg-white px-3 py-1 rounded-lg">
                  {healthData.stats.canceladas}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary-green/10 to-primary-green/5 rounded-2xl shadow-lg p-6 border-2 border-primary-green/20 hover:border-primary-green/40 transition-all">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Tasa de Asistencia
          </h4>
          <p className="text-4xl font-bold bg-gradient-to-r from-primary-green to-green-600 bg-clip-text text-transparent">
            {loading ? "..." : healthData.stats.total > 0 ? 
              `${Math.round((healthData.stats.completadas / healthData.stats.total) * 100)}%` : "0%"}
          </p>
          <p className="text-xs text-gray-600 mt-1">Citas completadas</p>
        </div>

        <div className="bg-gradient-to-br from-primary-blue/10 to-primary-blue/5 rounded-2xl shadow-lg p-6 border-2 border-primary-blue/20 hover:border-primary-blue/40 transition-all">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Tiempo Promedio
          </h4>
          <p className="text-4xl font-bold bg-gradient-to-r from-primary-blue to-blue-600 bg-clip-text text-transparent">
            45min
          </p>
          <p className="text-xs text-gray-600 mt-1">Por consulta</p>
        </div>

        <div className="bg-gradient-to-br from-primary-purple/10 to-primary-purple/5 rounded-2xl shadow-lg p-6 border-2 border-primary-purple/20 hover:border-primary-purple/40 transition-all">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Satisfacción
          </h4>
          <p className="text-4xl font-bold bg-gradient-to-r from-primary-purple to-purple-600 bg-clip-text text-transparent">
            4.8/5
          </p>
          <p className="text-xs text-gray-600 mt-1">Calificación promedio</p>
        </div>
      </div>
    </div>
  );
};

export default HealthSection;
