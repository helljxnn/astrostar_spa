import React, { useMemo } from "react";
import { X } from "lucide-react";

const AthleteAttendanceHistoryModal = ({
  isOpen,
  onClose,
  athleteName,
  history,
  loading,
  rangeLabel,
}) => {
  if (!isOpen) return null;

  const summary = useMemo(() => {
    const total = history.length;
    const present = history.filter((item) => item.asistencia).length;
    const absent = total - present;
    const percent = total ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, percent };
  }, [history]);

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Historial de Asistencia
            </h3>
            <p className="text-sm text-gray-500">{athleteName}</p>
            {rangeLabel && (
              <p className="text-xs text-gray-400 mt-1">
                Rango: {rangeLabel}
              </p>
            )}
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
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {summary.total}
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Presentes</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {summary.present}
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Ausentes</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {summary.absent}
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500">% Asistencia</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {summary.percent}%
                  </p>
                </div>
              </div>

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
                        <td className="px-4 py-3">{formatDate(item.date)}</td>
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
                          {item.observacion || "Sin observación"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AthleteAttendanceHistoryModal;
