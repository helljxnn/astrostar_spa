import KPICard from "../components/KPICard";
import AthletesTrackingGraphic from "../components/AthletesTrackingGraphic";
import RegisteredPlayers from "../components/RegisteredPlayers";
import {
  FaRunning,
  FaUserCheck,
  FaUserClock,
  FaUserTimes,
} from "react-icons/fa";

const AthletesSection = () => {
  return (
    <div className="space-y-6">
      {/* KPIs específicos de deportistas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Deportistas"
          value="324"
          icon={FaRunning}
          color="pink"
          trend="up"
          trendValue="8%"
        />
        <KPICard
          title="Matrículas Vigentes"
          value="65"
          icon={FaUserCheck}
          color="green"
          trend="up"
          trendValue="5%"
        />
        <KPICard
          title="Suspendidas"
          value="175"
          icon={FaUserClock}
          color="purple"
        />
        <KPICard
          title="Vencidas"
          value="84"
          icon={FaUserTimes}
          color="yellow"
          trend="down"
          trendValue="3%"
        />
      </div>

      {/* Gráficas principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AthletesTrackingGraphic />

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-primary-pink to-primary-purple rounded-full"></div>
            Deportistas por Categoría
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Categoría Infantil
                </span>
                <span className="text-sm font-bold text-gray-800">85</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-purple to-primary-purple-light rounded-full shadow-sm"
                  style={{ width: "40%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Categoría Pre-Juvenil
                </span>
                <span className="text-sm font-bold text-gray-800">81</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-pink to-pink-400 rounded-full shadow-sm"
                  style={{ width: "38%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Categoría Juvenil
                </span>
                <span className="text-sm font-bold text-gray-800">47</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-blue to-blue-400 rounded-full shadow-sm"
                  style={{ width: "22%" }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total</span>
              <span className="text-lg font-bold bg-gradient-to-r from-primary-purple to-primary-pink bg-clip-text text-transparent">
                213
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfica de jugadoras activas */}
      <RegisteredPlayers />

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary-blue/10 to-primary-blue/5 rounded-2xl shadow-lg p-6 border-2 border-primary-blue/20 hover:border-primary-blue/40 transition-all">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Asistencia Promedio
          </h4>
          <p className="text-4xl font-bold bg-gradient-to-r from-primary-blue to-blue-600 bg-clip-text text-transparent">
            87%
          </p>
          <p className="text-xs text-gray-600 mt-1">Últimos 30 días</p>
        </div>

        <div className="bg-gradient-to-br from-primary-pink/10 to-primary-pink/5 rounded-2xl shadow-lg p-6 border-2 border-primary-pink/20 hover:border-primary-pink/40 transition-all">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Nuevos Ingresos
          </h4>
          <p className="text-4xl font-bold bg-gradient-to-r from-primary-pink to-pink-600 bg-clip-text text-transparent">
            24
          </p>
          <p className="text-xs text-gray-600 mt-1">Este mes</p>
        </div>

        <div className="bg-gradient-to-br from-primary-green/10 to-primary-green/5 rounded-2xl shadow-lg p-6 border-2 border-primary-green/20 hover:border-primary-green/40 transition-all">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Tasa de Retención
          </h4>
          <p className="text-4xl font-bold bg-gradient-to-r from-primary-green to-green-600 bg-clip-text text-transparent">
            92%
          </p>
          <p className="text-xs text-gray-600 mt-1">Anual</p>
        </div>
      </div>
    </div>
  );
};

export default AthletesSection;
