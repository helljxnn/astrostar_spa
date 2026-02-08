import React from "react";
import ReportButton from "../../../../../../../../shared/components/ReportButton";
import SearchInput from "../../../../../../../../shared/components/SearchInput";

const AttendanceHeader = ({
  totalRows,
  totalCount,
  selectedDate,
  onDateChange,
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categories,
  onSave,
  onHistory,
  gradient,
  reportColumns,
  reportData,
}) => (
  <div className="flex flex-col gap-4 mb-6">
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Asistencia de Deportistas{" "}
          {totalRows !== totalCount && (
            <span className="text-sm text-gray-600 ml-1">
              ({totalRows} de {totalCount})
            </span>
          )}
        </h1>
      </div>

    </div>

    <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr_140px_auto_auto_auto] gap-3 items-center">
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 bg-white"
      />

      <SearchInput
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar por nombre, documento o categoria..."
        className="w-full"
      />

      <select
        value={categoryFilter}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 bg-white"
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <button
        onClick={onSave}
        className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors whitespace-nowrap"
      >
        Guardar Asistencia
      </button>

      <button
        onClick={onHistory}
        className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors whitespace-nowrap"
      >
        Ver Historial
      </button>

    </div>
  </div>
);

export default AttendanceHeader;
