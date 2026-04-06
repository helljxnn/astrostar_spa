import { useNavigate } from "react-router-dom";
import Pagination from "../../../../../../../shared/components/Table/Pagination";


import AttendanceHeader from "./components/AttendanceHeader";
import AttendanceTable from "./components/AttendanceTable";
import { useAssistanceAthletes } from "./hooks/useAssistanceAthletes";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions.js";

const GRADIENT = "linear-gradient(90deg, #b595ff 0%, #9be9ff 100%)";


export default function AssistanceAthletes() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canEditAttendance = hasPermission("athletesAssistance", "Editar");

  const {
    selectedDate,
    searchTerm,
    categoryFilter,
    currentPage,
    rowsPerPage,
    categories,
    paginatedData,
    totalRows,
    totalPages,
    startIndex,
    totalCount,
    setCurrentPage,
    updateSelectedDate,
    updateSearchTerm,
    updateCategoryFilter,
    resetFilters,
    handleAttendanceChange,
    handleObservationChange,
    handleSave,
  } = useAssistanceAthletes();

  const goToHistory = () => {
    navigate("/dashboard/athletes-assistance/history");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-montserrat">
      <AttendanceHeader
        selectedDate={selectedDate}
        onDateChange={updateSelectedDate}
        searchTerm={searchTerm}
        onSearchChange={updateSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={updateCategoryFilter}
        categories={categories}
        onSave={handleSave}
        onHistory={goToHistory}
        canSave={canEditAttendance}
      />

      {totalRows === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200 mb-6">
          <p className="text-gray-600">
            No se encontraron deportistas con los filtros actuales.
          </p>
          <button
            onClick={resetFilters}
            className="text-indigo-500 hover:text-indigo-700 mt-2 font-medium"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
            <AttendanceTable
              paginatedData={paginatedData}
              startIndex={startIndex}
              gradient={GRADIENT}
              onAttendanceChange={handleAttendanceChange}
              onObservationChange={handleObservationChange}
              canEdit={canEditAttendance}
            />
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
              totalRows={totalCount}
              rowsPerPage={rowsPerPage}
              startIndex={startIndex}
            />
          </div>
        </>
      )}
    </div>
  );
}
