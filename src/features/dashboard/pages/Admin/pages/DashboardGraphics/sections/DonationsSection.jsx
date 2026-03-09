import { useState, useEffect } from "react";
import KPICard from "../components/KPICard";
import DonationsGraphic from "../components/DonationsGraphic";
import TopDonorsGraphic from "../components/TopDonorsGraphic";
import { FaDollarSign, FaBox, FaHandsHelping, FaUsers } from "react-icons/fa";
import donationsService from "../../Donations/Donations/services/donationsService";
import donorsSponsorsService from "../../Donations/DonorsSponsors/services/donorsSponsorsService";

const DonationsSection = () => {
  const [stats, setStats] = useState({
    totalRecaudado: 0,
    donacionesMonetarias: 0,
    donacionesEspecie: 0,
    donantesActivos: 0,
    donacionPromedio: 0,
    nuevosDonantes: 0,
    tasaRetencion: 0,
    donacionesPorTipo: [],
    topDonantes: [],
    loading: true,
  });

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const [donationsResponse, donorsResponse] = await Promise.all([
          donationsService.getStatistics(),
          donorsSponsorsService.getAll({ limit: 1000 }),
        ]);

        // Extraer datos correctamente según la estructura de respuesta
        const donations = donationsResponse?.data?.data || donationsResponse?.data || [];
        const donors = donorsResponse?.data?.data || donorsResponse?.data || [];

        // Crear mapa de donantes
        const donorsMap = {};
        donors.forEach((donor) => {
          donorsMap[donor.id] = donor.nombre || donor.name || `Donante #${donor.id}`;
        });

        // Guardar todas las donaciones para los gráficos con nombres de donantes
        const allDonations = donations.map((d) => ({
          ...d,
          donorSponsor: d.donorSponsor || {
            nombre: donorsMap[d.donorSponsorId] || `Donante #${d.donorSponsorId}`,
          },
        }));

        // Calcular estadísticas
        const totalMonetarias = donations
          .filter((d) => (d.type === "ECONOMICA" || d.type === "ALIMENTOS") && d.status !== "Anulada")
          .reduce((sum, d) => {
            const details = d.details || [];
            const payment = details.find((det) => det.recordType === "payment");
            return sum + (payment?.amount || 0);
          }, 0);

        const totalEspecieItems = donations
          .filter((d) => d.type === "ESPECIE" && d.status !== "Anulada")
          .reduce((sum, d) => {
            const details = d.details || [];
            return (
              sum +
              details.reduce((detSum, det) => {
                if (det.recordType === "item") {
                  return detSum + Math.round(Number(det.quantity) || 0);
                }
                return detSum;
              }, 0)
            );
          }, 0);

        const totalRecaudado = totalMonetarias;

        // Donantes únicos activos
        const donantesUnicos = new Set(
          donations
            .filter((d) => d.status !== "Anulada" && d.donorSponsorId)
            .map((d) => d.donorSponsorId)
        );

        // Donación promedio
        const donacionesValidas = donations.filter(
          (d) => d.status !== "Anulada"
        );
        const donacionPromedio =
          donacionesValidas.length > 0
            ? totalRecaudado / donacionesValidas.length
            : 0;

        // Nuevos donantes (último mes)
        const unMesAtras = new Date();
        unMesAtras.setMonth(unMesAtras.getMonth() - 1);
        const nuevosDonantes = donations.filter((d) => {
          const fecha = new Date(d.donationAt || d.createdAt);
          return fecha >= unMesAtras && d.status !== "Anulada";
        }).length;

        // Tasa de retención (donantes con más de una donación)
        const donacionesPorDonante = {};
        donations
          .filter((d) => d.status !== "Anulada" && d.donorSponsorId)
          .forEach((d) => {
            donacionesPorDonante[d.donorSponsorId] =
              (donacionesPorDonante[d.donorSponsorId] || 0) + 1;
          });
        const donantesRecurrentes = Object.values(donacionesPorDonante).filter(
          (count) => count > 1
        ).length;
        const tasaRetencion =
          donantesUnicos.size > 0
            ? (donantesRecurrentes / donantesUnicos.size) * 100
            : 0;

        setStats({
          totalRecaudado,
          donacionesMonetarias: totalMonetarias,
          donacionesEspecie: totalEspecieItems,
          donantesActivos: donantesUnicos.size,
          donacionPromedio,
          nuevosDonantes,
          tasaRetencion,
          donacionesPorTipo: [
            { tipo: "Monetarias", valor: totalMonetarias },
            { tipo: "Materiales", valor: totalEspecieItems },
          ],
          allDonations,
          loading: false,
        });
      } catch (error) {
        console.error("Error cargando estadísticas de donaciones:", error);
        console.error("Error details:", error.response?.data || error.message);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStatistics();
  }, []);

  const formatCurrency = (value) => {
    const num = Number(value);
    
    // Si el número es 0 o inválido
    if (!num || isNaN(num)) return "$0";
    
    // Formatear con separadores de miles en formato colombiano
    return `$${num.toLocaleString("es-CO", { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    })}`;
  };

  const formatNumber = (value) => {
    const num = Math.round(Number(value) || 0);
    return num.toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs específicos de donaciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Recaudado"
          value={formatCurrency(stats.totalRecaudado)}
          icon={FaDollarSign}
          color="green"
        />
        <KPICard
          title="Donaciones Monetarias"
          value={formatCurrency(stats.donacionesMonetarias)}
          icon={FaDollarSign}
          color="blue"
        />
        <KPICard
          title="Donaciones en Especie"
          value={`${formatNumber(stats.donacionesEspecie)} items`}
          icon={FaBox}
          color="purple"
        />
        <KPICard
          title="Donantes Activos"
          value={formatNumber(stats.donantesActivos)}
          icon={FaUsers}
          color="yellow"
        />
      </div>

      {/* Gráficas principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonationsGraphic donations={stats.allDonations || []} />
        <TopDonorsGraphic donations={stats.allDonations || []} />
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
                  <span className="text-sm font-bold text-gray-800">
                    ${formatCurrency(stats.donacionesMonetarias)}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-green to-green-400"
                    style={{ 
                      width: stats.totalRecaudado > 0 
                        ? `${(stats.donacionesMonetarias / stats.totalRecaudado * 100).toFixed(0)}%` 
                        : "0%" 
                    }}
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
                    Materiales (items)
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {formatNumber(stats.donacionesEspecie)}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-blue to-blue-400"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationsSection;
