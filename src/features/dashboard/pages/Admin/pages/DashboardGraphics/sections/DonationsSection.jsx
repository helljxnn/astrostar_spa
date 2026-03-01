import KPICard from "../components/KPICard";
import DonationsGraphic from "../components/DonationsGraphic";
import TopDonorsGraphic from "../components/TopDonorsGraphic";
import { FaDollarSign, FaBox, FaHandsHelping, FaUsers } from "react-icons/fa";

const DonationsSection = () => {
  return (
    <div className="space-y-6">
      {/* KPIs específicos de donaciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Recaudado"
          value="$2.5M"
          icon={FaDollarSign}
          color="green"
          trend="up"
          trendValue="20%"
        />
        <KPICard
          title="Donaciones Monetarias"
          value="$1.8M"
          icon={FaDollarSign}
          color="blue"
          trend="up"
          trendValue="18%"
        />
        <KPICard
          title="Donaciones en Especie"
          value="$520K"
          icon={FaBox}
          color="purple"
          trend="up"
          trendValue="15%"
        />
        <KPICard
          title="Donantes Activos"
          value="142"
          icon={FaUsers}
          color="yellow"
          trend="up"
          trendValue="12%"
        />
      </div>

      {/* Gráficas principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonationsGraphic />
        <TopDonorsGraphic />
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-primary-green to-primary-yellow rounded-full"></div>
            Donaciones por Categoría
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-green to-green-400 flex items-center justify-center shadow-md">
                <FaDollarSign className="text-white text-xl" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Monetarias
                  </span>
                  <span className="text-sm font-bold text-gray-800">$1.8M</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-green to-green-400"
                    style={{ width: "72%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-blue to-blue-400 flex items-center justify-center shadow-md">
                <FaBox className="text-white text-xl" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Materiales
                  </span>
                  <span className="text-sm font-bold text-gray-800">$520K</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-blue to-blue-400"
                    style={{ width: "21%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-yellow to-yellow-400 flex items-center justify-center shadow-md">
                <FaHandsHelping className="text-white text-xl" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Servicios
                  </span>
                  <span className="text-sm font-bold text-gray-800">$180K</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-yellow to-yellow-400"
                    style={{ width: "7%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-primary-purple to-primary-pink rounded-full"></div>
            Frecuencia de Donaciones
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-primary-green/10 rounded-xl hover:bg-primary-green/20 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-green shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">
                  Mensuales
                </span>
              </div>
              <span className="text-sm font-bold text-gray-800 bg-white px-3 py-1 rounded-lg">
                45
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-primary-blue/10 rounded-xl hover:bg-primary-blue/20 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-blue shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">
                  Trimestrales
                </span>
              </div>
              <span className="text-sm font-bold text-gray-800 bg-white px-3 py-1 rounded-lg">
                32
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-primary-purple/10 rounded-xl hover:bg-primary-purple/20 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-purple shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">
                  Anuales
                </span>
              </div>
              <span className="text-sm font-bold text-gray-800 bg-white px-3 py-1 rounded-lg">
                28
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-primary-yellow/10 rounded-xl hover:bg-primary-yellow/20 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-yellow shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">
                  Únicas
                </span>
              </div>
              <span className="text-sm font-bold text-gray-800 bg-white px-3 py-1 rounded-lg">
                37
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary-green/10 to-primary-green/5 rounded-2xl shadow-lg p-6 border-2 border-primary-green/20 hover:border-primary-green/40 transition-all">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Donación Promedio
          </h4>
          <p className="text-4xl font-bold bg-gradient-to-r from-primary-green to-green-600 bg-clip-text text-transparent">
            $17.6K
          </p>
          <p className="text-xs text-gray-600 mt-1">Por donante</p>
        </div>

        <div className="bg-gradient-to-br from-primary-blue/10 to-primary-blue/5 rounded-2xl shadow-lg p-6 border-2 border-primary-blue/20 hover:border-primary-blue/40 transition-all">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Nuevos Donantes
          </h4>
          <p className="text-4xl font-bold bg-gradient-to-r from-primary-blue to-blue-600 bg-clip-text text-transparent">
            18
          </p>
          <p className="text-xs text-gray-600 mt-1">Este mes</p>
        </div>

        <div className="bg-gradient-to-br from-primary-purple/10 to-primary-purple/5 rounded-2xl shadow-lg p-6 border-2 border-primary-purple/20 hover:border-primary-purple/40 transition-all">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Tasa de Retención
          </h4>
          <p className="text-4xl font-bold bg-gradient-to-r from-primary-purple to-purple-600 bg-clip-text text-transparent">
            88%
          </p>
          <p className="text-xs text-gray-600 mt-1">Donantes recurrentes</p>
        </div>
      </div>

      {/* Info adicional */}
      <div className="bg-gradient-to-r from-primary-green/10 via-primary-yellow/10 to-primary-green/10 border-2 border-primary-green/20 rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-primary-green to-primary-yellow bg-clip-text text-transparent mb-2">
          💚 Impacto de las Donaciones
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Gracias a las donaciones recibidas, hemos podido apoyar a más de 300
          deportistas, realizar 48 eventos deportivos y brindar 156 servicios de
          salud especializados. Cada contribución hace la diferencia en la vida
          de nuestros atletas.
        </p>
      </div>
    </div>
  );
};

export default DonationsSection;
