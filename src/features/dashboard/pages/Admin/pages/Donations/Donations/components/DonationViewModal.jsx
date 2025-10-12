// DonationViewModal.jsx
import React from "react";

const DonationViewModal = ({ donation, onClose }) => {
  if (!donation) return null;

  console.log("📌 Datos recibidos en modal:", donation);

  // ⚡ Usar siempre items (normalizados en Donations.jsx)
  const donationTypes =
    donation.items && donation.items.length > 0
      ? donation.items
      : [
          {
            donationType: donation.donationType,
            amount: donation.amount || donation.cantidad || "0",
          },
        ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition text-xl"
        >
          ✕
        </button>

        {/* Encabezado */}
        <div className="text-center px-8 py-6 border-b">
          <h2 className="text-2xl font-bold text-gray-700">
            Detalles de la Donación
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Información completa de{" "}
            <span className="text-blue-600 font-semibold hover:underline cursor-pointer">
              {donation.donorName}
            </span>
          </p>
        </div>

        {/* Información general */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 py-6">
          {/* Columna 1 */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 border-b pb-1">
              Información Empresarial
            </h3>
            <p className="mb-2">
              <span className="font-medium">Donante:</span>{" "}
              {donation.donorName}
            </p>
            <p className="mb-2">
              <span className="font-medium">Descripción:</span>{" "}
              {donation.descripcion || "N/A"}
            </p>
            <p className="mb-2">
              <span className="font-medium">Estado:</span>{" "}
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-sm ${
                  donation.status === "Activo"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {donation.status}
              </span>
            </p>
          </div>

          {/* Columna 2 */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 border-b pb-1">
              Información de Registro
            </h3>
            <p className="mb-2">
              <span className="font-medium">Fecha de Donación:</span>{" "}
              {donation.donationDate}
            </p>
            <p className="mb-2">
              <span className="font-medium">Fecha de Registro:</span>{" "}
              {donation.registerDate}
            </p>
          </div>
        </div>

        {/* Tipos de Donación en tabla */}
        <div className="px-8 pb-6">
          <h3 className="font-semibold text-gray-700 mb-3 border-b pb-1">
            Tipos de Donación
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="border px-4 py-2 text-left">Tipo de Donación</th>
                  <th className="border px-4 py-2 text-left">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {donationTypes.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition border-t"
                  >
                    <td className="border px-4 py-2">
                      {item.donationType || item.tipoDonacion || "N/A"}
                    </td>
                    <td className="border px-4 py-2 font-semibold">
                      {item.amount || item.cantidad || "0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-8 py-4 flex justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-purple-400 to-blue-400 text-white rounded-lg shadow hover:opacity-90 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonationViewModal;
