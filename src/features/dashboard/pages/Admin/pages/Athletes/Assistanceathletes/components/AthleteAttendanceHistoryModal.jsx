import { useMemo } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

const Stat = ({ label, value, tone }) => (
  <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
    <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
    <p className={`text-xl font-semibold ${tone}`}>{value}</p>
  </div>
);

const AthleteAttendanceHistoryModal = ({
  isOpen,
  onClose,
  athleteName,
  history,
  loading,
  rangeLabel,
}) => {
  const toComparableDate = (value) => {
    if (!value) return 0;

    if (typeof value === "string") {
      const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        return new Date(
          Number(match[1]),
          Number(match[2]) - 1,
          Number(match[3]),
          12,
          0,
          0,
          0,
        ).getTime();
      }
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  };

  const summary = useMemo(() => {
    const total = history.length;
    const present = history.filter((item) => item.asistencia).length;
    const absent = total - present;
    const percent = total ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, percent };
  }, [history]);

  const sortedHistory = useMemo(
    () =>
      [...history].sort(
        (a, b) => toComparableDate(b.date || b.fecha) - toComparableDate(a.date || a.fecha)
      ),
    [history]
  );

  const formatDate = (value) => {
    if (!value) return "-";
    if (typeof value === "string") {
      const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        return `${match[3]}/${match[2]}/${match[1]}`;
      }
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between px-6 py-5 bg-white text-gray-800 border-b border-gray-200">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.12em] text-gray-500">
              Historial de asistencia
            </p>
            <h3 className="text-2xl font-semibold leading-tight">
              {athleteName || "Deportista"}
            </h3>
            {rangeLabel && (
              <p className="text-sm text-gray-500">Rango: {rangeLabel}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Cerrar historial"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {loading ? (
            <div className="py-10 text-center text-gray-500">
              Cargando historial...
            </div>
          ) : sortedHistory.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-8 text-center text-gray-500">
              No hay registros de asistencia.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Stat label="Registros" value={summary.total} tone="text-gray-900" />
                <Stat label="Presentes" value={summary.present} tone="text-emerald-600" />
                <Stat label="Ausentes" value={summary.absent} tone="text-rose-600" />
                <Stat label="% Asistencia" value={`${summary.percent}%`} tone="text-indigo-600" />
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-green-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Presente
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-rose-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Ausente
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="max-h-[55vh] overflow-auto">
                  <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className="sticky top-0 z-10 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3 text-center">Asistencia</th>
                        <th className="px-4 py-3">Observación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {sortedHistory.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-indigo-50/40 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {formatDate(item.date || item.fecha)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                                item.asistencia
                                  ? "bg-green-100 text-green-700"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  item.asistencia ? "bg-green-500" : "bg-rose-500"
                                }`}
                              />
                              {item.asistencia ? "Presente" : "Ausente"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {item.observacion ? (
                              item.observacion
                            ) : (
                              <span className="italic text-gray-400">Sin observación</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AthleteAttendanceHistoryModal;

