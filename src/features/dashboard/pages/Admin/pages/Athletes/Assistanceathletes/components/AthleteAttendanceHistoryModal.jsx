import React from "react";
import { X } from "lucide-react";

const AthleteAttendanceHistoryModal = ({
  isOpen,
  onClose,
  athleteName,
  history,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Historial de Asistencia
            </h3>
            <p className="text-sm text-gray-500">{athleteName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="text-center text-gray-500 py-8">
              Cargando historial...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No hay registros de asistencia.
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full text-sm text-left text-gray-600">
                <thead className="text-gray-700 text-xs uppercase tracking-wider bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3 text-center">Asistencia</th>
                    <th className="px-4 py-3">Observación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {history.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        {new Date(item.date).toLocaleDateString("es-ES")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            item.asistencia
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.asistencia ? "Presente" : "Ausente"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.observacion || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AthleteAttendanceHistoryModal;
