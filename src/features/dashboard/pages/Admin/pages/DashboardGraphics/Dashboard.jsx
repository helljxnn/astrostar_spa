import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import EventsGraphic from "./components/EventsGraphic";
import AthletesTrackingGraphic from "./components/AthletesTrackingGraphic";
import HealthServicesGraphic from "./components/HealthServicesGraphic";
import HealthServicesYearGraphic from "./components/HealthServicesYearGraphic";
import RegisteredPlayers from "./components/RegisteredPlayers";
import { usePermissions } from "../../../../../../shared/hooks/usePermissions";

function Dashboard() {
  const { hasModuleAccess, isAdmin } = usePermissions();
  const navigate = useNavigate();

  // Verificar acceso al dashboard
  useEffect(() => {
    if (!isAdmin && !hasModuleAccess('dashboard')) {
      // Redirigir a la primera página a la que tenga acceso
      navigate('/dashboard/users', { replace: true });
    }
  }, [isAdmin, hasModuleAccess, navigate]);

  // Si no tiene acceso, no renderizar nada (mientras redirige)
  if (!isAdmin && !hasModuleAccess('dashboard')) {
    return null;
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-full overflow-x-hidden">
      {/* Header responsive */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Resumen de estadísticas y métricas principales
        </p>
      </div>

      {/* Grid completamente responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Eventos */}
        <div className="w-full">
          <EventsGraphic />
        </div>

        {/* Seguimiento Deportistas */}
        <div className="w-full">
          <AthletesTrackingGraphic />
        </div>

        {/* Servicios de Salud */}
        <div className="w-full">
          <HealthServicesGraphic />
        </div>

        {/* Servicios de Salud por Año */}
        <div className="w-full">
          <HealthServicesYearGraphic />
        </div>

        {/* Jugadoras Registradas - Ocupa todo el ancho */}
        <RegisteredPlayers />
      </div>

      {/* Footer informativo para pantallas pequeñas */}
      <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-50 rounded-lg block sm:hidden">
        <p className="text-xs text-gray-600 text-center">
          💡 Rota tu dispositivo para una mejor visualización de las gráficas
        </p>
      </div>
    </div>
  );
}

export default Dashboard;