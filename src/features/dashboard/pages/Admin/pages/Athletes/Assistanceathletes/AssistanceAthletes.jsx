import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../../../../../shared/components/Table/Pagination";


import AttendanceHeader from "./components/AttendanceHeader";
import AttendanceTable from "./components/AttendanceTable";
import AthleteAttendanceHistoryModal from "./components/AthleteAttendanceHistoryModal";
import { useAssistanceAthletes } from "./hooks/useAssistanceAthletes";
import assistanceathletesService from "./services/AssistanceathletesService";

const GRADIENT = "linear-gradient(90deg, #b595ff 0%, #9be9ff 100%)";


export default function AssistanceAthletes() {
  const navigate = useNavigate();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyAthlete, setHistoryAthlete] = useState(null);

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

  const handleViewHistory = async (athlete) => {
    const athleteId = athlete?.athleteId ?? athlete?.id;
    if (!athleteId) return;

    setHistoryAthlete(athlete);
    setHistoryOpen(true);
    setHistoryLoading(true);

    try {
      const response = await assistanceathletesService.getAthleteHistory(
        athleteId
      );
      if (response && response.success) {
        setHistoryData(response.data || []);
      } else {
        setHistoryData([]);
      }
    } catch (error) {
      console.error("Error loading athlete history:", error);
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-questrial">
      <AttendanceHeader
        totalRows={totalRows}
        totalCount={totalCount}
        selectedDate={selectedDate}
        onDateChange={updateSelectedDate}
        searchTerm={searchTerm}
        onSearchChange={updateSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={updateCategoryFilter}
        categories={categories}
        onSave={handleSave}
        onHistory={goToHistory}
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
            onViewHistory={handleViewHistory}
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

      <AthleteAttendanceHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        athleteName={historyAthlete?.nombre || ""}
        history={historyData}
        loading={historyLoading}
      />
    </div>
  );
}







