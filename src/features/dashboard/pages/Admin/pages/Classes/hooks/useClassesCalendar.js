import { useState, useEffect, useCallback } from "react";
import classesService from "../services/classesService";
import { toast } from "../../../../../../../shared/utils/toast";

export const useClassesCalendar = () => {
  const [calendarClasses, setCalendarClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState("month"); // month, week, day
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  /**
   * Obtener rango de fechas según el tipo de vista
   */
  const getDateRange = useCallback((date, type) => {
    const startDate = new Date(date);
    const endDate = new Date(date);

    switch (type) {
      case "day":
        // Mismo día
        break;
      case "week":
        // Inicio de semana (lunes)
        const dayOfWeek = startDate.getDay();
        const diff =
          startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startDate.setDate(diff);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case "month":
      default:
        // Inicio y fin del mes
        startDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
        break;
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  }, []);

  /**
   * Cargar clases para el calendario
   */
  const fetchCalendarClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { startDate, endDate } = getDateRange(selectedDate, viewType);
      const response = await classesService.getCalendarClasses(
        startDate,
        endDate,
        selectedEmployeeId
      );

      if (response.success) {
        // Transformar datos para el calendario
        const transformedClasses = response.data.map((classItem) => ({
          id: classItem.id,
          title: classItem.title,
          start: `${classItem.classDate.split("T")[0]}T${classItem.startTime}`,
          end: `${classItem.classDate.split("T")[0]}T${classItem.endTime}`,
          backgroundColor: getStatusColor(classItem.status),
          borderColor: getStatusColor(classItem.status),
          extendedProps: {
            ...classItem,
            professorName: `${classItem.employee.user.firstName} ${classItem.employee.user.lastName}`,
            totalAthletes: classItem._count.athletes,
          },
        }));

        setCalendarClasses(transformedClasses);
      } else {
        throw new Error(
          response.message || "Error al cargar clases del calendario"
        );
      }
    } catch (err) {
      console.error("Error fetching calendar classes:", err);
      setError(err.message);
      toast.error("Error al cargar el calendario de clases");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, viewType, selectedEmployeeId, getDateRange]);

  /**
   * Obtener color según el estado de la clase
   */
  const getStatusColor = (status) => {
    const colors = {
      Programada: "#3b82f6", // Azul
      En_curso: "#f59e0b", // Amarillo
      Finalizada: "#10b981", // Verde
      Cancelada: "#ef4444", // Rojo
    };
    return colors[status] || "#6b7280"; // Gris por defecto
  };

  /**
   * Cambiar fecha seleccionada
   */
  const changeSelectedDate = (date) => {
    setSelectedDate(new Date(date));
  };

  /**
   * Cambiar tipo de vista
   */
  const changeViewType = (type) => {
    setViewType(type);
  };

  /**
   * Cambiar profesor seleccionado
   */
  const changeSelectedEmployee = (employeeId) => {
    setSelectedEmployeeId(employeeId);
  };

  /**
   * Navegar a fecha anterior
   */
  const goToPrevious = () => {
    const newDate = new Date(selectedDate);

    switch (viewType) {
      case "day":
        newDate.setDate(newDate.getDate() - 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() - 7);
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }

    setSelectedDate(newDate);
  };

  /**
   * Navegar a fecha siguiente
   */
  const goToNext = () => {
    const newDate = new Date(selectedDate);

    switch (viewType) {
      case "day":
        newDate.setDate(newDate.getDate() + 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() + 7);
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }

    setSelectedDate(newDate);
  };

  /**
   * Ir a hoy
   */
  const goToToday = () => {
    setSelectedDate(new Date());
  };

  /**
   * Obtener título del calendario
   */
  const getCalendarTitle = () => {
    const options = {
      day: { year: "numeric", month: "long", day: "numeric" },
      week: { year: "numeric", month: "long", day: "numeric" },
      month: { year: "numeric", month: "long" },
    };

    return selectedDate.toLocaleDateString("es-ES", options[viewType]);
  };

  // Cargar clases cuando cambien los parámetros
  useEffect(() => {
    fetchCalendarClasses();
  }, [fetchCalendarClasses]);

  return {
    // Estado
    calendarClasses,
    loading,
    error,
    selectedDate,
    viewType,
    selectedEmployeeId,

    // Acciones
    fetchCalendarClasses,
    changeSelectedDate,
    changeViewType,
    changeSelectedEmployee,
    goToPrevious,
    goToNext,
    goToToday,

    // Utilidades
    getCalendarTitle,
    getStatusColor,
  };
};

export default useClassesCalendar;
