import { useState, useEffect } from "react";
import KPICard from "../components/KPICard";
import EventsGraphic from "../components/EventsGraphic";
import {
  FaCalendarCheck,
  FaUsers,
  FaClock,
  FaUserFriends,
} from "react-icons/fa";
import eventsService from "../../Events/services/eventsService";

const EventsSection = () => {
  const [stats, setStats] = useState({
    total: 0,
    enrolledAthletes: 0,
    enrolledTeams: 0,
    upcoming: 0,
    byStatus: {
      completed: 0,
      inProgress: 0,
      scheduled: 0,
    },
    byType: [],
    trends: {
      total: 0,
      enrolledAthletes: 0,
      enrolledTeams: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventsStats();
  }, []);

  const fetchEventsStats = async () => {
    try {
      setLoading(true);
      const response = await eventsService.getStats();

      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (_error) {
      setStats({
        total: 0,
        enrolledAthletes: 0,
        enrolledTeams: 0,
        upcoming: 0,
        byStatus: {
          completed: 0,
          inProgress: 0,
          scheduled: 0,
        },
        byType: [],
        trends: {
          total: 0,
          enrolledAthletes: 0,
          enrolledTeams: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPIs específicos de eventos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Eventos Totales"
          value={loading ? "..." : stats.total}
          icon={FaCalendarCheck}
          color="blue"
          trend={stats.trends.total >= 0 ? "up" : "down"}
          trendValue={`${Math.abs(stats.trends.total)}%`}
        />
        <KPICard
          title="Deportistas Inscritas"
          value={loading ? "..." : stats.enrolledAthletes.toLocaleString()}
          icon={FaUsers}
          color="purple"
          trend={stats.trends.enrolledAthletes >= 0 ? "up" : "down"}
          trendValue={`${Math.abs(stats.trends.enrolledAthletes)}%`}
        />
        <KPICard
          title="Equipos Inscritos"
          value={loading ? "..." : stats.enrolledTeams}
          icon={FaUserFriends}
          color="pink"
          trend={stats.trends.enrolledTeams >= 0 ? "up" : "down"}
          trendValue={`${Math.abs(stats.trends.enrolledTeams)}%`}
        />
        <KPICard
          title="Eventos Próximos"
          value={loading ? "..." : stats.upcoming}
          icon={FaClock}
          color="green"
        />
      </div>

      {/* Gráfica principal */}
      <div className="grid grid-cols-1 gap-6">
        <EventsGraphic />
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-primary-blue to-primary-purple rounded-full"></div>
            Eventos por Estado
          </h3>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-purple"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-primary-green/10 rounded-xl hover:bg-primary-green/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary-green shadow-sm"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Completados
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-800 bg-white px-3 py-1 rounded-lg">
                  {stats.byStatus.completed}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary-blue/10 rounded-xl hover:bg-primary-blue/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary-blue shadow-sm"></div>
                  <span className="text-sm font-medium text-gray-700">
                    En Curso
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-800 bg-white px-3 py-1 rounded-lg">
                  {stats.byStatus.inProgress}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary-yellow/10 rounded-xl hover:bg-primary-yellow/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary-yellow shadow-sm"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Programados
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-800 bg-white px-3 py-1 rounded-lg">
                  {stats.byStatus.scheduled}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-primary-purple to-primary-pink rounded-full"></div>
            Tipos de Eventos
          </h3>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-purple"></div>
            </div>
          ) : stats.byType.length > 0 ? (
            <div className="space-y-4">
              {stats.byType.map((type, index) => {
                const colors = [
                  { from: "primary-blue", to: "primary-purple" },
                  { from: "primary-purple", to: "primary-pink" },
                  { from: "primary-pink", to: "primary-red" },
                  { from: "primary-yellow", to: "primary-green" },
                  { from: "primary-green", to: "primary-blue" },
                ];
                const color = colors[index % colors.length];
                const maxCount = Math.max(...stats.byType.map((t) => t.count));
                const percentage = (type.count / maxCount) * 100;

                return (
                  <div key={type.name} className="flex items-center gap-3">
                    <span
                      className="text-sm font-medium text-gray-700 w-24 truncate"
                      title={type.name}
                    >
                      {type.name}
                    </span>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r from-${color.from} to-${color.to} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-800 min-w-[1.5rem] text-right">
                        {type.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8 text-sm">
              No hay datos de tipos de eventos
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsSection;

