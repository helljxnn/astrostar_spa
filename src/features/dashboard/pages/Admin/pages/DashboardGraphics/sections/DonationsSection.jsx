import { useState, useEffect, useMemo } from "react";
import KPICard from "../components/KPICard";
import DonationsSummaryGraphic from "../components/DonationsSummaryGraphic";
import TopDonorsGraphic from "../components/TopDonorsGraphic";
import { FaDollarSign, FaBox, FaHandHoldingHeart, FaUsers } from "react-icons/fa";
import donationsService from "../../Donations/Donations/services/donationsService";
import donorsSponsorsService from "../../Donations/DonorsSponsors/services/donorsSponsorsService";

const DonationsSection = () => {
  const [allDonations, setAllDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [donationsRes, donorsRes] = await Promise.all([
          donationsService.getStatistics(),
          donorsSponsorsService.getAll({ limit: 100 }),
        ]);

        const donations = donationsRes?.data?.data || donationsRes?.data || [];
        const donors = donorsRes?.data?.data || donorsRes?.data || [];

        // Mapa id -> nombre de donante
        const donorsMap = {};
        donors.forEach((d) => {
          donorsMap[d.id] = d.nombre || d.name || `Donante #${d.id}`;
        });

        // Enriquecer donaciones con nombre del donante
        const enriched = donations.map((d) => ({
          ...d,
          donorSponsor: d.donorSponsor || {
            nombre: donorsMap[d.donorSponsorId] || `Donante #${d.donorSponsorId}`,
          },
        }));

        setAllDonations(enriched);
      } catch (e) {
        console.error("Error cargando donaciones:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // KPIs calculados
  const stats = useMemo(() => {
    const validas = allDonations.filter((d) => d.status !== "Anulada");

    const totalMonetario = validas
      .filter((d) => d.type === "ECONOMICA" || d.type === "ALIMENTOS")
      .reduce((sum, d) => {
        const payment = (d.details || []).find((det) => det.recordType === "payment");
        return sum + (payment?.amount || 0);
      }, 0);

    const totalEspecie = validas
      .filter((d) => d.type === "ESPECIE")
      .reduce((sum, d) => {
        return sum + (d.details || []).reduce((s, det) => {
          return det.recordType === "item" ? s + Math.round(Number(det.quantity) || 0) : s;
        }, 0);
      }, 0);

    const totalDonaciones = validas.length;

    const donantesUnicos = new Set(
      validas.filter((d) => d.donorSponsorId).map((d) => d.donorSponsorId)
    ).size;

    return { totalMonetario, totalEspecie, totalDonaciones, donantesUnicos };
  }, [allDonations]);

  const fmt = (n) => Number(n || 0).toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Donaciones"
          value={stats.totalDonaciones}
          icon={FaHandHoldingHeart}
          color="yellow"
        />
        <KPICard
          title="Total en Dinero"
          value={`$${fmt(stats.totalMonetario)}`}
          icon={FaDollarSign}
          color="green"
        />
        <KPICard
          title="Total en Especie"
          value={fmt(stats.totalEspecie)}
          icon={FaBox}
          color="purple"
        />
        <KPICard
          title="Donantes Únicos"
          value={stats.donantesUnicos}
          icon={FaUsers}
          color="blue"
        />
      </div>

      {/* Gráfica resumen + Top donantes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonationsSummaryGraphic donations={allDonations} />
        <TopDonorsGraphic donations={allDonations} />
      </div>
    </div>
  );
};

export default DonationsSection;

