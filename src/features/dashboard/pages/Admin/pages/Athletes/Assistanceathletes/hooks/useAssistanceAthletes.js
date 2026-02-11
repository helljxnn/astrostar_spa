import { useEffect, useMemo, useState } from "react";
import assistanceathletesService from "../services/AssistanceathletesService";
import { showSuccessAlert } from "../../../../../../../../shared/utils/alerts";

export const useAssistanceAthletes = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendance, setAttendance] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [categories, setCategories] = useState(["Todas"]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await assistanceathletesService.getSportsCategories({
          page: 1,
          limit: 100,
        });
        if (response && response.success) {
          const names = (response.data || [])
            .map((cat) => cat.name || cat.nombre)
            .filter(Boolean);
          const unique = Array.from(new Set(names)).sort((a, b) =>
            a.localeCompare(b)
          );
          setCategories(["Todas", ...unique]);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadAttendance = async () => {
      if (!selectedDate) return;
      setLoading(true);
      try {
        const response = await assistanceathletesService.getAttendanceByDate({
          date: selectedDate,
          page: currentPage,
          limit: rowsPerPage,
          search: searchTerm.trim(),
          categoria: categoryFilter === "Todas" ? "" : categoryFilter,
        });

        if (response && response.success) {
          setAttendance(response.data || []);
          setTotalCount(response.pagination?.total ?? response.data?.length ?? 0);
        } else {
          setAttendance([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error("Error loading attendance:", error);
        setAttendance([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    loadAttendance();
  }, [selectedDate, currentPage, searchTerm, categoryFilter]);

  useEffect(() => {
    if (categoryFilter !== "Todas" && !categories.includes(categoryFilter)) {
      setCategoryFilter("Todas");
    }
  }, [categories, categoryFilter]);

  const updateSearchTerm = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const updateCategoryFilter = (value) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const updateSelectedDate = (value) => {
    setSelectedDate(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("Todas");
    setCurrentPage(1);
  };

  const handleAttendanceChange = (id) => {
    setAttendance((prev) =>
      prev.map((a) => (a.id === id ? { ...a, asistencia: !a.asistencia } : a))
    );
  };

  const handleObservationChange = (id, value) => {
    setAttendance((prev) =>
      prev.map((a) => (a.id === id ? { ...a, observacion: value } : a))
    );
  };

  const handleSave = async () => {
    if (!selectedDate) {
      showSuccessAlert("⚠️ Debes seleccionar una fecha antes de guardar.");
      return;
    }
    const items = attendance.map((item) => ({
      athleteId: item.athleteId || item.id,
      asistencia: item.asistencia,
      observacion: item.observacion || "",
    }));
    await assistanceathletesService.saveAttendanceBulk(selectedDate, items);
    showSuccessAlert(` Asistencia guardada para el ${selectedDate}.`);
  };

  const filteredData = attendance;

  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData;

  const attendanceSummary = useMemo(() => {
    const total = filteredData.length;
    const present = filteredData.filter((a) => a.asistencia).length;
    const absent = total - present;
    const percent = total ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, percent };
  }, [filteredData]);

  return {
    selectedDate,
    searchTerm,
    categoryFilter,
    currentPage,
    rowsPerPage,
    loading,
    attendance,
    categories,
    filteredData,
    paginatedData,
    totalRows,
    totalPages,
    startIndex,
    totalCount,
    attendanceSummary,
    setCurrentPage,
    updateSelectedDate,
    updateSearchTerm,
    updateCategoryFilter,
    resetFilters,
    handleAttendanceChange,
    handleObservationChange,
    handleSave,
  };
};
