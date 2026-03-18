import { useState, useEffect } from "react";
import KPICard from "../components/KPICard";
import {
  FaCalendarAlt,
  FaRunning,
  FaHeartbeat,
  FaHandHoldingHeart,
} from "react-icons/fa";
import EventsGraphic from "../components/EventsGraphic";
import AthletesTrackingGraphic from "../components/AthletesTrackingGraphic";
import DashboardService from "../services/DashboardService";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";

const OverviewSection = () => {
  const [kpis, setKpis] = useState({
    totalEvents: 0,
    totalAthletes: 0,
    healthAppointments: 0,
    donations: 0,
  });
  const [loading, setLoading] = useState(true);

  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const canViewEvents = hasPermission("eventsManagement", "Ver");
  const canViewEnrollments = hasPermission("enrollments", "Ver");

  useEffect(() => {
    if (permissionsLoading) return;
    fetchOverviewData();
  }, [permissionsLoading, canViewEvents, canViewEnrollments]);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const response = await DashboardService.getKPIs({
        includeEvents: canViewEvents,
        includeEnrollments: canViewEnrollments,
      });

      if (response.success && response.data) {
        setKpis({
          totalEvents: response.data.totalEvents || 0,
          totalAthletes: response.data.totalAthletes || 0,
          healthAppointments: response.data.healthAppointments || 0,
          donations: response.data.donations || 0,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    `$${Number(amount || 0).toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Eventos Realizados"
          value={loading ? "..." : kpis.totalEvents.toString()}
          icon={FaCalendarAlt}
          color="blue"
          trend="up"
          trendValue="12%"
        />
        <KPICard
          title="Deportistas Activos"
          value={loading ? "..." : kpis.totalAthletes.toString()}
          icon={FaRunning}
          color="pink"
          trend="up"
          trendValue="8%"
        />
        <KPICard
          title="Citas de Salud"
          value={loading ? "..." : kpis.healthAppointments.toString()}
          icon={FaHeartbeat}
          color="green"
          trend="up"
          trendValue="15%"
        />
        <KPICard
          title="Monto de Donaciones"
          value={loading ? "..." : formatCurrency(kpis.donations)}
          icon={FaHandHoldingHeart}
          color="yellow"
          trend="up"
          trendValue="20%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {canViewEvents ? (
          <EventsGraphic />
        ) : (
          <div className="bg-white shadow-md rounded-xl p-6 w-full h-[300px] sm:h-[350px] lg:h-[400px] flex items-center justify-center text-gray-500 text-sm">
            Sin permisos para visualizar métricas de eventos
          </div>
        )}

        {canViewEnrollments ? (
          <AthletesTrackingGraphic />
        ) : (
          <div className="bg-white shadow-md rounded-xl p-6 w-full h-[300px] sm:h-[350px] lg:h-[400px] flex items-center justify-center text-gray-500 text-sm">
            Sin permisos para visualizar métricas de matrículas
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-primary-purple/10 via-primary-blue/10 to-primary-purple/10 border-2 border-primary-purple/20 rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent mb-2">
          Vista General del Sistema
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Este dashboard te permite visualizar las métricas más importantes de
          la organización. Usa los tabs superiores para revisar cada módulo.
        </p>
      </div>
    </div>
  );
};

export default OverviewSection;
