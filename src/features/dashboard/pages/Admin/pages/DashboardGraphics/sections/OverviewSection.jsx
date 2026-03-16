import KPICard from "../components/KPICard";
import {
  FaCalendarAlt,
  FaRunning,
  FaHeartbeat,
  FaHandHoldingHeart,
} from "react-icons/fa";
import EventsGraphic from "../components/EventsGraphic";
import AthletesTrackingGraphic from "../components/AthletesTrackingGraphic";

const OverviewSection = () => {
  return (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Eventos Realizados"
          value="48"
          icon={FaCalendarAlt}
          color="blue"
          trend="up"
          trendValue="12%"
        />
        <KPICard
          title="Deportistas Activos"
          value="324"
          icon={FaRunning}
          color="pink"
          trend="up"
          trendValue="8%"
        />
        <KPICard
          title="Citas de Salud"
          value="156"
          icon={FaHeartbeat}
          color="green"
          trend="up"
          trendValue="15%"
        />
        <KPICard
          title="Donaciones Recibidas"
          value="$2.5M"
          icon={FaHandHoldingHeart}
          color="yellow"
          trend="up"
          trendValue="20%"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EventsGraphic />
        <AthletesTrackingGraphic />
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-primary-purple/10 via-primary-blue/10 to-primary-purple/10 border-2 border-primary-purple/20 rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent mb-2">
          📊 Vista General del Sistema
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Este dashboard te permite visualizar las métricas más importantes de
          tu organización. Navega por las diferentes secciones usando los tabs
          superiores para ver análisis detallados de cada módulo.
        </p>
      </div>
    </div>
  );
};

export default OverviewSection;

