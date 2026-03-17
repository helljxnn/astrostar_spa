import React from "react";
import { createPortal } from "react-dom";
import { useState } from "react";
import { FaTimes, FaCalendarAlt } from "react-icons/fa";
import SearchInput from "../../../../../../../../shared/components/SearchInput.jsx";
import Pagination from "../../../../../../../../shared/components/Pagination.jsx";
import { PAGINATION_CONFIG } from "../../../../../../../../shared/constants/paginationConfig.js";

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getLateColor = (daysLate) => {
  if (!daysLate || daysLate <= 0) return "bg-green-100 text-green-800";
  if (daysLate <= 5) return "bg-yellow-100 text-yellow-800";
  if (daysLate <= 15) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
};

const getStatusBadge = (status) => {
  const map = {
    APPROVED: "bg-green-100 text-green-800",
    PENDING: "bg-blue-100 text-blue-800",
    REJECTED: "bg-red-100 text-red-800",
  };
  return map[status] || "bg-gray-100 text-gray-700";
};

const getStatusLabel = (status) => {
  const map = {
    APPROVED: "Aprobado",
    PENDING: "En revisión",
    REJECTED: "Rechazado",
  };
  return map[status] || "Sin comprobante";
};

const formatPeriodLabel = (period) => {
  if (!period) return "Sin período";
  const date = new Date(`${period}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) return period;
  return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
};

const MonthlyHistoryModal = ({
  isOpen,
  onClose,
  athleteName,
  summary,
  history,
  loading,
}) => {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(PAGINATION_CONFIG.DEFAULT_PAGE);

  const hasSummary = summary && summary.obligationsCount > 0;
  const summaryDaysLate = hasSummary && (summary.lateFeeAmount || 0) > 0
    ? summary.maxDaysLate || 0
    : 0;

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredHistory = !normalizedSearch
    ? (history || [])
    : (history || []).filter((item) => {
        const statusLabel = getStatusLabel(item.paymentStatus);
        const pieces = [
          formatPeriodLabel(item.period),
          item.baseAmount,
          item.lateFee,
          item.totalAmount,
          statusLabel,
          item.dueStart,
          item.dueEnd,
        ];
        const haystack = pieces
          .filter((v) => v !== undefined && v !== null)
          .join(" ")
          .toString()
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      });

  const rowsPerPage = PAGINATION_CONFIG.ROWS_PER_PAGE;
  const totalRows = filteredHistory.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedHistory = filteredHistory.slice(startIndex, startIndex + rowsPerPage);

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Mensualidades de {athleteName || "Deportista"}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Historial y estado actual de mensualidades
            </p>
          </div>
          <button
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-auto">
          {hasSummary ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500">Base pendiente (mensualidades sin pagar)</p>
                <p className="text-sm font-semibold text-gray-800">
                  {formatCurrency(summary.baseAmount)}
                </p>
              </div>
              <div className="p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500">Mora acumulada (días de atraso)</p>
                <p className="text-sm font-semibold text-gray-800">
                  {formatCurrency(summary.lateFeeAmount)} ({summaryDaysLate} días)
                </p>
              </div>
              <div className="p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500">Total pendiente (Base + Mora)</p>
                <p className="text-sm font-semibold text-gray-800">
                  {formatCurrency(summary.totalAmount)}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-gray-200 text-sm text-gray-600">
              No hay mensualidades pendientes.
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="text-sm text-gray-600">
              Historial y estado actual de mensualidades
            </div>
            <div className="w-full sm:w-64">
              <SearchInput
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(PAGINATION_CONFIG.DEFAULT_PAGE);
                }}
                placeholder="Buscar por mes, estado o monto..."
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left px-4 py-3">Período</th>
                  <th className="text-left px-4 py-3">Base</th>
                  <th className="text-left px-4 py-3">Mora</th>
                  <th className="text-left px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      Cargando historial...
                    </td>
                  </tr>
                ) : paginatedHistory?.length ? (
                  paginatedHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" />
                          <span>{formatPeriodLabel(item.period)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{formatCurrency(item.baseAmount)}</td>
                      <td className="px-4 py-3">
                        {(() => {
                          const effectiveDays = (item.lateFee || 0) > 0 ? (item.daysLate || 0) : 0;
                          return (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLateColor(effectiveDays)}`}>
                          {formatCurrency(item.lateFee)} ({effectiveDays} días)
                        </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 text-gray-800 font-semibold">
                        {formatCurrency(item.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.paymentStatus)}`}>
                          {getStatusLabel(item.paymentStatus)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      No hay historial de mensualidades.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              showInfo={true}
              totalItems={totalRows}
              itemsPerPage={rowsPerPage}
            />
          </div>

        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default MonthlyHistoryModal;
