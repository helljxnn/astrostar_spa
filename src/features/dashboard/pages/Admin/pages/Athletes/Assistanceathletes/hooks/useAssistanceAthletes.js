import { useEffect, useMemo, useState } from "react";
import assistanceathletesService from "../services/AssistanceathletesService";
import {
  showErrorAlert,
  showSuccessAlert,
  showWarningAlert,
} from "../../../../../../../../shared/utils/alerts.js";

const ALL_CATEGORIES = "Todas";
const DEFAULT_ROWS_PER_PAGE = 10;

const todayISO = () => new Date().toISOString().split("T")[0];

export const useAssistanceAthletes = () => {
  const [selectedDate, setSelectedDate] = useState(() => todayISO());
  const [attendance, setAttendance] = useState([]);
  const [attendanceCache, setAttendanceCache] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES);
  const [categories, setCategories] = useState([ALL_CATEGORIES]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = DEFAULT_ROWS_PER_PAGE;

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
          setCategories([ALL_CATEGORIES, ...unique]);
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
          categoria: categoryFilter === ALL_CATEGORIES ? "" : categoryFilter,
        });

        if (response && response.success) {
          const merged = (response.data || []).map((item) => {
            const cached = attendanceCache[item.id];
            return cached ? { ...item, ...cached } : item;
          });

          setAttendance(merged);
          setAttendanceCache((prev) => {
            const updated = { ...prev };
            merged.forEach((item) => {
              updated[item.id] = item;
            });
            return updated;
          });
          setTotalCount(
            response.pagination?.total ?? response.data?.length ?? 0
          );
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
  }, [selectedDate, currentPage, searchTerm, categoryFilter, rowsPerPage]);

  useEffect(() => {
    if (categoryFilter !== ALL_CATEGORIES && !categories.includes(categoryFilter)) {
      setCategoryFilter(ALL_CATEGORIES);
    }
  }, [categories, categoryFilter]);

  const updateSearchTerm = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    setAttendanceCache({});
    setAttendance([]);
  };

  const updateCategoryFilter = (value) => {
    setCategoryFilter(value);
    setCurrentPage(1);
    setAttendanceCache({});
    setAttendance([]);
  };

  const updateSelectedDate = (value) => {
    setSelectedDate(value);
    setCurrentPage(1);
    setAttendanceCache({});
    setAttendance([]);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter(ALL_CATEGORIES);
    setCurrentPage(1);
    setAttendanceCache({});
    setAttendance([]);
  };

  const handleAttendanceChange = (id) => {
    setAttendance((prev) => {
      const updated = prev.map((a) =>
        a.id === id ? { ...a, asistencia: !a.asistencia } : a
      );
      return updated;
    });

    setAttendanceCache((prev) => {
      const base = prev[id] || attendance.find((a) => a.id === id) || {};
      const updated = { ...base, asistencia: !base.asistencia };
      return { ...prev, [id]: updated };
    });
  };

  const handleObservationChange = (id, value) => {
    setAttendance((prev) =>
      prev.map((a) => (a.id === id ? { ...a, observacion: value } : a))
    );
    setAttendanceCache((prev) => {
      const base = prev[id] || attendance.find((a) => a.id === id) || {};
      const updated = { ...base, observacion: value };
      return { ...prev, [id]: updated };
    });
  };

  const handleSave = async () => {
    if (!selectedDate) {
      showWarningAlert("Debes seleccionar una fecha antes de guardar.");
      return;
    }

    if (!attendance.length) {
      showWarningAlert("No hay registros de asistencia para guardar.");
      return;
    }

    const cacheValues = Object.values(attendanceCache);
    const sourceItems = cacheValues.length ? cacheValues : attendance;

    const items = sourceItems.map((item) => ({
      athleteId: item.athleteId || item.id,
      asistencia: item.asistencia,
      observacion: item.observacion || "",
    }));

    const formattedDate = new Date(selectedDate).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    try {
      await assistanceathletesService.saveAttendanceBulk(selectedDate, items);
      showSuccessAlert(
        "¡Asistencia guardada!",
        `El pase del ${formattedDate} quedó almacenado.`
      );
    } catch (error) {
      console.error("Error saving attendance:", error);
      showErrorAlert("No se pudo guardar la asistencia.");
    }
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
