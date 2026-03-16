import { useState, useEffect } from "react";
import donationsService from "../../Donations/Donations/services/donationsService";

const DonationsSectionDebug = () => {
  const [debug, setDebug] = useState({
    loading: true,
    error: null,
    response: null,
    donations: [],
  });

  useEffect(() => {
    const testAPI = async () => {
      try {
        const response = await donationsService.getStatistics();
        const donations = response?.data?.data || response?.data || [];
        
        setDebug({
          loading: false,
          error: null,
          response: response,
          donations: donations,
        });
      } catch (error) {
        console.error("❌ Error al cargar donaciones:", error);
        console.error("❌ Error response:", error.response);
        console.error("❌ Error message:", error.message);
        
        setDebug({
          loading: false,
          error: error.message,
          response: null,
          donations: [],
        });
      }
    };

    testAPI();
  }, []);

  if (debug.loading) {
    return (
      <div className="p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">🔍 Modo Debug - Cargando...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-lg shadow space-y-6">
      <h2 className="text-2xl font-bold mb-4">🔍 Modo Debug - Donaciones</h2>
      
      {debug.error && (
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
          <h3 className="text-lg font-bold text-red-700 mb-2">❌ Error</h3>
          <p className="text-red-600">{debug.error}</p>
          <p className="text-sm text-gray-600 mt-2">
            Revisa la consola del navegador para más detalles
          </p>
        </div>
      )}

      <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
        <h3 className="text-lg font-bold text-blue-700 mb-2">📊 Estadísticas</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <strong>Total de donaciones:</strong> {debug.donations.length}
          </li>
          <li>
            <strong>Respuesta del API:</strong>{" "}
            {debug.response ? "✅ Recibida" : "❌ No recibida"}
          </li>
        </ul>
      </div>

      {debug.donations.length > 0 ? (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
          <h3 className="text-lg font-bold text-green-700 mb-4">
            ✅ Donaciones Encontradas
          </h3>
          <div className="space-y-4">
            {debug.donations.slice(0, 5).map((donation, index) => (
              <div
                key={donation.id}
                className="bg-white p-4 rounded-lg border border-gray-200"
              >
                <h4 className="font-bold text-gray-800 mb-2">
                  Donación #{index + 1} - {donation.code}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <strong>ID:</strong> {donation.id}
                  </div>
                  <div>
                    <strong>Tipo:</strong> {donation.type}
                  </div>
                  <div>
                    <strong>Estado:</strong> {donation.status}
                  </div>
                  <div>
                    <strong>Fecha:</strong>{" "}
                    {new Date(donation.donationAt).toLocaleDateString("es-CO")}
                  </div>
                  <div className="col-span-2">
                    <strong>Detalles:</strong> {donation.details?.length || 0}{" "}
                    items
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4">
          <h3 className="text-lg font-bold text-yellow-700 mb-2">
            ⚠️ No hay donaciones
          </h3>
          <p className="text-yellow-600">
            No se encontraron donaciones en la base de datos.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Crea algunas donaciones desde el módulo de Donaciones primero.
          </p>
        </div>
      )}

      <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
        <h3 className="text-lg font-bold text-gray-700 mb-2">
          🔧 Datos Técnicos
        </h3>
        <pre className="text-xs bg-white p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(
            {
              response: debug.response,
              donations: debug.donations,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
};

export default DonationsSectionDebug;

