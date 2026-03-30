import { useState, useEffect, useMemo } from "react";
import { FaHeartbeat, FaAppleAlt, FaBriefcaseMedical, FaBrain } from "react-icons/fa";
import KPICard from "../components/KPICard";
import HealthServicesGraphic from "../components/HealthServicesGraphic";
import appointmentService from "../../Services/AppointmentManagement/services/appointmentService";

const SPECIALTY_ICONS = {
  nutricion: FaAppleAlt,
  fisioterapia: FaBriefcaseMedical,
  psicologia: FaBrain,
};

const SPECIALTY_COLORS = {
  nutricion: "blue",
  fisioterapia: "purple",
  psicologia: "pink",
};

const normalizeKey = (val = "") =>
  String(val)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const HealthSection = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllAppointments = async () => {
      const firstRes = await appointmentService.getAll({ page: 1, limit: 100 });
      const firstData = firstRes?.data || [];
      const pagination = firstRes?.pagination || {};
      const totalPages = pagination.pages || 1;

      if (totalPages <= 1) return firstData;

      const rest = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) =>
          appointmentService.getAll({ page: i + 2, limit: 100 })
        )
      );

      return [...firstData, ...rest.flatMap((r) => r?.data || [])];
    };

    const fetchAll = async () => {
      setLoading(true);
      try {
        const allAppts = await fetchAllAppointments();
        setAppointments(Array.isArray(allAppts) ? allAppts : []);
      } catch (e) {
        console.error("Error cargando datos de salud:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const stats = useMemo(() => {
    const total = appointments.length;
    const bySpecialty = {};
    const byStatus = { Completado: 0, Programado: 0, Cancelado: 0 };

    appointments.forEach((a) => {
      const sp = normalizeKey(a.specialty || "otro");
      bySpecialty[sp] = (bySpecialty[sp] || 0) + 1;
      const st = a.status || "";
      if (st in byStatus) byStatus[st]++;
    });

    const completadas = byStatus["Completado"] || 0;
    const tasaAsistencia = total > 0 ? Math.round((completadas / total) * 100) : 0;

    return { total, bySpecialty, byStatus, tasaAsistencia };
  }, [appointments]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Citas"
          value={loading ? "..." : stats.total}
          icon={FaHeartbeat}
          color="green"
        />
        {["nutricion", "fisioterapia", "psicologia"].map((sp) => (
          <KPICard
            key={sp}
            title={sp.charAt(0).toUpperCase() + sp.slice(1)}
            value={loading ? "..." : (stats.bySpecialty[sp] || 0)}
            icon={SPECIALTY_ICONS[sp]}
            color={SPECIALTY_COLORS[sp]}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <HealthServicesGraphic appointments={appointments} loading={loading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-primary-green to-primary-blue rounded-full"></div>
            Servicios Mas Solicitados
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <ServiceRanking bySpecialty={stats.bySpecialty} total={stats.total} />
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-primary-purple to-primary-pink rounded-full"></div>
            Estado de Citas
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <StatusBreakdown byStatus={stats.byStatus} />
          )}
        </div>
      </div>
    </div>
  );
};

const ServiceRanking = ({ bySpecialty, total }) => {
  const entries = Object.entries(bySpecialty).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return <p className="text-sm text-gray-400">Sin datos</p>;

  const colorMap = {
    nutricion: "from-primary-blue to-blue-400",
    fisioterapia: "from-primary-purple to-purple-400",
    psicologia: "from-primary-pink to-pink-400",
  };

  return (
    <div className="space-y-4">
      {entries.map(([sp, count]) => {
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const gradient = colorMap[sp] || "from-gray-400 to-gray-300";
        const Icon = SPECIALTY_ICONS[sp] || FaHeartbeat;
        return (
          <div key={sp} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
              <Icon className="text-white text-base" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 capitalize">{sp}</span>
                <span className="text-sm font-bold text-gray-800">{count} citas</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${gradient} transition-all duration-500`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const StatusBreakdown = ({ byStatus }) => {
  const items = [
    { key: "Completado", label: "Completadas", color: "primary-green" },
    { key: "Programado", label: "Programadas", color: "primary-blue" },
    { key: "Cancelado", label: "Canceladas", color: "primary-red" },
  ];

  return (
    <div className="space-y-3">
      {items.map(({ key, label, color }) => (
        <div key={key} className={`flex items-center justify-between p-3 bg-${color}/10 rounded-xl`}>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full bg-${color}`} />
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </div>
          <span className="text-sm font-bold text-gray-800 bg-white px-3 py-1 rounded-lg">
            {byStatus[key] || 0}
          </span>
        </div>
      ))}
    </div>
  );
};

export default HealthSection;
