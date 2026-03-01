import KPICard from "../components/KPICard";
import HealthServicesGraphic from "../components/HealthServicesGraphic";
import HealthServicesYearGraphic from "../components/HealthServicesYearGraphic";
import {
  FaHeartbeat,
  FaAppleAlt,
  FaBriefcaseMedical,
  FaBrain,
} from "react-icons/fa";

const HealthSection = () => {
  return (
    <div className="space-y-6">
      {/* KPIs específicos de servicios de salud */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Citas"
          value="156"
          icon={FaHeartbeat}
          color="green"
          trend="up"
          trendValue="15%"
        />
        <KPICard
          title="Nutrición"
          value="68"
          icon={FaAppleAlt}
          color="blue"
          trend="up"
          trendValue="12%"
        />
        <KPICard
          title="Fisioterapia"
          value="52"
          icon={FaBriefcaseMedical}
          color="purple"
          trend="up"
          trendValue="8%"
        />
        <KPICard
          title="Psicología"
          value="36"
          icon={FaBrain}
          color="pink"
          trend="up"
          trendValue="10%"
        />
      </div>

      {/* Gráficas principales */}
      <div className="grid grid-cols-1 gap-6">
        <HealthServicesGraphic />
        <HealthServicesYearGraphic />
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-primary-green to-primary-blue rounded-full"></div>
            Servicios Más Solicitados
          </h3>
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
                    68 citas
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-blue to-blue-400"
                    style={{ width: "68%" }}
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
                    52 citas
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-purple to-purple-400"
                    style={{ width: "52%" }}
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
                    36 citas
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-pink to-pink-400"
                    style={{ width: "36%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-primary-purple to-primary-pink rounded-full"></div>
            Estado de Citas
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-primary-green/10 rounded-xl hover:bg-primary-green/20 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-green shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">
                  Completadas
                </span>
              </div>
              <span className="text-sm font-bold text-gray-800 bg-white px-3 py-1 rounded-lg">
                124
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
                18
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
                8
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
                6
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary-green/10 to-primary-green/5 rounded-2xl shadow-lg p-6 border-2 border-primary-green/20 hover:border-primary-green/40 transition-all">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Tasa de Asistencia
          </h4>
          <p className="text-4xl font-bold bg-gradient-to-r from-primary-green to-green-600 bg-clip-text text-transparent">
            94%
          </p>
          <p className="text-xs text-gray-600 mt-1">Últimos 30 días</p>
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
