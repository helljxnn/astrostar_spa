import React from "react";
import {
  FaTimes,
  FaUser,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaGift,
  FaBoxOpen,
  FaDollarSign,
  FaInfoCircle,
} from "react-icons/fa";

const DonationViewModal = ({ donation, onClose }) => {
  if (!donation) return null;

  const donationTypes =
    donation.items && donation.items.length > 0
      ? donation.items
      : [
          {
            donationType: donation.donationType,
            amount: donation.amount || donation.cantidad || "0",
          },
        ];

  // Mapeo de estados con colores y iconos
  const statusConfig = {
    Recibida: {
      color: "bg-blue-100 text-blue-700 border-blue-200",
      icon: FaCheckCircle,
      label: "Recibida",
    },
    "En proceso": {
      color: "bg-purple-100 text-purple-700 border-purple-200",
      icon: FaInfoCircle,
      label: "En Proceso",
    },
    EnProceso: {
      color: "bg-purple-100 text-purple-700 border-purple-200",
      icon: FaInfoCircle,
      label: "En Proceso",
    },
    Verificada: {
      color: "bg-green-100 text-green-700 border-green-200",
      icon: FaCheckCircle,
      label: "Verificada",
    },
    Ejecutada: {
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      icon: FaCheckCircle,
      label: "Ejecutada",
    },
    Anulada: {
      color: "bg-red-100 text-red-700 border-red-200",
      icon: FaTimesCircle,
      label: "Anulada",
    },
    Activo: {
      color: "bg-green-100 text-green-700 border-green-200",
      icon: FaCheckCircle,
      label: "Activo",
    },
  };

  const currentStatus =
    statusConfig[donation.status] || statusConfig["Recibida"];
  const StatusIcon = currentStatus.icon;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative max-h-[90vh] overflow-y-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Boton cerrar mejorado */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-all duration-200 transform hover:scale-110"
          aria-label="Cerrar"
        >
          <FaTimes className="text-lg" />
        </button>

        {/* Encabezado mejorado con gradiente */}
        <div className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-8 py-6 rounded-t-2xl">
          <div className="flex items-center gap-3 mb-2">
            <FaGift className="text-3xl" />
            <h2 className="text-2xl font-bold">Detalles de la Donación</h2>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <FaUser className="text-sm" />
            <p className="text-sm">
              Donante:{" "}
              <span className="font-semibold">{donation.donorName}</span>
            </p>
          </div>
        </div>

        {/* Badge de estado destacado */}
        <div className="px-8 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 font-medium">
              Estado actual:
            </span>
            <span
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${currentStatus.color}`}
            >
              <StatusIcon className="text-base" />
              {currentStatus.label}
            </span>
          </div>
        </div>

        {/* Informacion general con cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-8 py-6">
          {/* Card 1: Información del Donante */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaUser className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">
                Información del Donante
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Donante
                </span>
                <span className="text-gray-800 font-medium">
                  {donation.donorName}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Programa/Destino
                </span>
                <span className="text-gray-800 font-medium">
                  {donation.descripcion || donation.programLabel || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Información de Fechas */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaCalendarAlt className="text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800">
                Información de Fechas
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Fecha de Donación
                </span>
                <span className="text-gray-800 font-medium">
                  {donation.donationDate || "N/A"}
                </span>
              </div>
              {donation.registerDate && (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                    Fecha de Registro
                  </span>
                  <span className="text-gray-800 font-medium">
                    {donation.registerDate}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tipos de Donacion con diseño mejorado */}
        <div className="px-8 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-primary-purple to-primary-blue rounded-lg">
              <FaBoxOpen className="text-white" />
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">
              Detalle de la Donación
            </h3>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-primary-purple/10 to-primary-blue/10">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tipo de Donación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Cantidad
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donationTypes.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-gray-800">
                      <div className="flex items-center gap-2">
                        <FaDollarSign className="text-primary-purple text-sm" />
                        <span className="font-medium">
                          {item.donationType || item.tipoDonacion || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-primary-blue/10 text-primary-blue">
                        {item.amount || item.cantidad || "0"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {donationTypes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FaInfoCircle className="mx-auto text-3xl mb-2 text-gray-400" />
              <p>No hay detalles de donación disponibles</p>
            </div>
          )}
        </div>

        {/* Footer mejorado */}
        <div className="border-t px-8 py-4 bg-gray-50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DonationViewModal;
