import React from "react";
import { createPortal } from "react-dom";
import {
  FaUser,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
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
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[9999] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl relative max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            aria-label="Cerrar"
          >
            ✕
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            Detalles de la Donación
          </h2>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto flex-1">
          {/* Información compacta en grid */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Código */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <FaFileAlt className="text-blue-600 text-sm" />
                  <span className="text-xs text-gray-600 font-medium uppercase">
                    Código
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {donation.code || "N/A"}
                </p>
              </div>

              {/* Donante */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <FaUser className="text-purple-600 text-sm" />
                  <span className="text-xs text-gray-600 font-medium uppercase">
                    Donante
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {donation.donorName || "N/A"}
                </p>
              </div>

              {/* Estado */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <StatusIcon className="text-purple-600 text-sm" />
                  <span className="text-xs text-gray-600 font-medium uppercase">
                    Estado
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${currentStatus.color}`}
                >
                  <StatusIcon className="text-xs" />
                  {currentStatus.label}
                </span>
              </div>

              {/* Tipo */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <FaInfoCircle className="text-green-600 text-sm" />
                  <span className="text-xs text-gray-600 font-medium uppercase">
                    Tipo
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {donation.type || "N/A"}
                </p>
              </div>

              {/* Fecha Donación */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <FaCalendarAlt className="text-blue-600 text-sm" />
                  <span className="text-xs text-gray-600 font-medium uppercase">
                    Fecha Donación
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(donation.donationAt || donation.donationDate)}
                </p>
              </div>

              {/* Fecha Registro */}
              {donation.createdAt && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <FaCalendarAlt className="text-blue-500 text-sm" />
                    <span className="text-xs text-gray-600 font-medium uppercase">
                      Fecha Registro
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(donation.createdAt)}
                  </p>
                </div>
              )}

              {/* Programa */}
              {donation.program && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <FaInfoCircle className="text-purple-600 text-sm" />
                    <span className="text-xs text-gray-600 font-medium uppercase">
                      Programa
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {donation.program}
                  </p>
                </div>
              )}

              {/* Destino Específico */}
              {donation.specificDestination && (
                <div className="col-span-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FaMapMarkerAlt className="text-red-600 text-sm" />
                    <span className="text-xs text-gray-600 font-medium uppercase">
                      Destino Específico
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {donation.specificDestination}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tabla de Items */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 mb-3">
              <FaBoxOpen className="text-primary-purple text-lg" />
              <h3 className="font-bold text-gray-800">
                Items Donados
                {donationTypes.length > 0 && (
                  <span className="ml-2 text-sm text-gray-600 font-normal">
                    ({donationTypes.length}{" "}
                    {donationTypes.length === 1 ? "item" : "items"})
                  </span>
                )}
              </h3>
            </div>

            {donationTypes.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-gray-300">
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-purple-100 text-purple-800">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                          Descripción
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                          Cantidad / Monto
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                          Clasificación
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {donationTypes.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-purple-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {item.recordType === "payment" ? (
                                <FaDollarSign className="text-green-600 flex-shrink-0" />
                              ) : (
                                <FaBoxOpen className="text-primary-purple flex-shrink-0" />
                              )}
                              <span className="font-medium text-gray-900">
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
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md font-semibold bg-primary-purple/10 text-primary-purple">
                              {item.recordType === "payment"
                                ? formatCurrency(item.amount)
                                : `${item.quantity || item.amount || item.cantidad || "0"} unidades`}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-800 font-medium">
                            {item.classification || item.channel || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {donationTypes.length > 5 && (
                  <div className="bg-gray-100 px-4 py-2 text-center text-xs text-gray-600 border-t">
                    Desplázate para ver todos los items
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-300">
                <FaInfoCircle className="mx-auto text-3xl mb-2 text-gray-400" />
                <p className="text-sm">
                  No hay detalles de donación disponibles
                </p>
              </div>
            )}

            {/* Notas */}
            {donation.notes && (
              <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <FaFileAlt className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                      Notas
                    </h4>
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {donation.notes}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer compacto */}
        <div className="border-t px-6 py-3 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary-purple hover:bg-primary-blue text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium text-sm"
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

