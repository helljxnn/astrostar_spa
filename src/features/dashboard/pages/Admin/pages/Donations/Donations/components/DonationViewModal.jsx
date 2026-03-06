import React from "react";
import { createPortal } from "react-dom";
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
  FaFileAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

const DonationViewModal = ({ donation, onClose }) => {
  if (!donation) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const donationTypes =
    donation.items && donation.items.length > 0
      ? donation.items
      : donation.details && donation.details.length > 0
        ? donation.details
        : [];

  // Mapeo de estados con colores y iconos
  const statusConfig = {
    Recibida: {
      color: "bg-purple-100 text-purple-700",
      icon: FaCheckCircle,
      label: "Recibida",
    },
    "En proceso": {
      color: "bg-purple-100 text-purple-700",
      icon: FaInfoCircle,
      label: "En Proceso",
    },
    EnProceso: {
      color: "bg-purple-100 text-purple-700",
      icon: FaInfoCircle,
      label: "En Proceso",
    },
    Verificada: {
      color: "bg-purple-100 text-purple-700",
      icon: FaCheckCircle,
      label: "Verificada",
    },
    Ejecutada: {
      color: "bg-gray-200 text-gray-700",
      icon: FaCheckCircle,
      label: "Ejecutada",
    },
    Anulada: {
      color: "bg-red-100 text-red-700",
      icon: FaTimesCircle,
      label: "Anulada",
    },
    Activo: {
      color: "bg-purple-100 text-purple-700",
      icon: FaCheckCircle,
      label: "Activo",
    },
  };

  const currentStatus =
    statusConfig[donation.status] || statusConfig["Recibida"];
  const StatusIcon = currentStatus.icon;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar mejorado */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 transition-all duration-200"
          aria-label="Cerrar"
        >
          <FaTimes className="text-lg" />
        </button>

        {/* Encabezado con morado sólido */}
        <div className="bg-primary-purple text-white px-8 py-6 rounded-t-2xl">
          <div className="flex items-center gap-3 mb-2">
            <FaGift className="text-3xl" />
            <h2 className="text-2xl font-bold">Detalles de la Donación</h2>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <FaUser className="text-sm" />
            <p className="text-sm">
              Donante:{" "}
              <span className="font-semibold">
                {donation.donorName || "N/A"}
              </span>
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
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${currentStatus.color}`}
            >
              <StatusIcon className="text-base" />
              {currentStatus.label}
            </span>
          </div>
        </div>

        {/* Información general con cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 py-6">
          {/* Card 1: Información del Donante */}
          <div className="bg-purple-50 rounded-xl p-5 border border-purple-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaUser className="text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Donante</h3>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Nombre
                </span>
                <span className="text-gray-800 font-medium">
                  {donation.donorName || "N/A"}
                </span>
              </div>
              {donation.program && (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                    Programa
                  </span>
                  <span className="text-gray-800 font-medium">
                    {donation.program}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Información de Fechas */}
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaCalendarAlt className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Fechas</h3>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Fecha de Donación
                </span>
                <span className="text-gray-800 font-medium text-sm">
                  {formatDate(donation.donationAt || donation.donationDate)}
                </span>
              </div>
              {donation.createdAt && (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                    Fecha de Registro
                  </span>
                  <span className="text-gray-800 font-medium text-sm">
                    {formatDate(donation.createdAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Tipo y Estado */}
          <div className="bg-green-50 rounded-xl p-5 border border-green-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaInfoCircle className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Información</h3>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Tipo
                </span>
                <span className="text-gray-800 font-medium">
                  {donation.type || "N/A"}
                </span>
              </div>
              {donation.specificDestination && (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                    Destino Específico
                  </span>
                  <span className="text-gray-800 font-medium text-sm">
                    {donation.specificDestination}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detalles de la Donación */}
        <div className="px-8 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary-purple rounded-lg">
              <FaBoxOpen className="text-white" />
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">
              Detalle de la Donación
            </h3>
          </div>

          {donationTypes.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary-purple/10">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Clasificación
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
                          {item.recordType === "payment" ? (
                            <FaDollarSign className="text-green-600 text-sm" />
                          ) : (
                            <FaBoxOpen className="text-primary-purple text-sm" />
                          )}
                          <span className="font-medium">
                            {item.description ||
                              item.donationType ||
                              item.tipoDonacion ||
                              (item.recordType === "payment"
                                ? "Pago"
                                : "Item") ||
                              "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-primary-purple/10 text-primary-purple">
                          {item.recordType === "payment"
                            ? formatCurrency(item.amount)
                            : item.quantity ||
                              item.amount ||
                              item.cantidad ||
                              "0"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {item.classification || item.channel || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
              <FaInfoCircle className="mx-auto text-3xl mb-2 text-gray-400" />
              <p>No hay detalles de donación disponibles</p>
            </div>
          )}

          {/* Notas adicionales */}
          {donation.notes && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <FaFileAlt className="text-yellow-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Notas</h4>
                  <p className="text-gray-700 text-sm">{donation.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer mejorado */}
        <div className="border-t px-8 py-4 bg-gray-50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-primary-purple hover:bg-primary-blue text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DonationViewModal;
