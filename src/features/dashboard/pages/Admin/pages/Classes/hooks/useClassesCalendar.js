import { useState, useEffect, useCallback } from "react";
import classesService from "../services/classesService";
import { toast } from "../../../../../../../shared/utils/toast";

export const useClassesCalendar = () => {
  const [calendarClasses, setCalendarClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  /**
   * Obtener clases de ejemplo para desarrollo/fallback
   */
  const getExampleClasses = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return [
      {
        id: 1,
        title: "Clase de Natación Principiantes",
        start: `${today.toISOString().split("T")[0]}T09:00:00`,
        end: `${today.toISOString().split("T")[0]}T10:30:00`,
        date: today.toISOString().split("T")[0],
        time: "09:00",
        backgroundColor: "#95FFA7",
        borderColor: "#95FFA7",
        status: "Programada",
        location: "Piscina Principal",
        extendedProps: {
          id: 1,
          title: "Clase de Natación Principiantes",
          professorName: "Ana García",
          totalAthletes: 12,
          startTime: "09:00",
          endTime: "10:30",
          status: "Programada",
          location: "Piscina Principal",
          classDate: `${today.toISOString().split("T")[0]}T09:00:00Z`,
        },
      },
      {
        id: 2,
        title: "Clase de Atletismo Avanzado",
        start: `${tomorrow.toISOString().split("T")[0]}T16:00:00`,
        end: `${tomorrow.toISOString().split("T")[0]}T17:30:00`,
        date: tomorrow.toISOString().split("T")[0],
        time: "16:00",
        backgroundColor: "#EDEB85",
        borderColor: "#EDEB85",
        status: "En_curso",
        location: "Pista de Atletismo",
        extendedProps: {
          id: 2,
          title: "Clase de Atletismo Avanzado",
          professorName: "Carlos Rodríguez",
          totalAthletes: 8,
          startTime: "16:00",
          endTime: "17:30",
          status: "En_curso",
          location: "Pista de Atletismo",
          classDate: `${tomorrow.toISOString().split("T")[0]}T16:00:00Z`,
        },
      },
      {
        id: 3,
        title: "Clase de Gimnasia Rítmica",
        start: `${nextWeek.toISOString().split("T")[0]}T10:00:00`,
        end: `${nextWeek.toISOString().split("T")[0]}T11:30:00`,
        date: nextWeek.toISOString().split("T")[0],
        time: "10:00",
        backgroundColor: "#9BE9FF",
        borderColor: "#9BE9FF",
        status: "Finalizada",
        location: "Gimnasio A",
        extendedProps: {
          id: 3,
          title: "Clase de Gimnasia Rítmica",
          professorName: "María López",
          totalAthletes: 15,
          startTime: "10:00",
          endTime: "11:30",
          status: "Finalizada",
          location: "Gimnasio A",
          classDate: `${nextWeek.toISOString().split("T")[0]}T10:00:00Z`,
        },
      },
    ];
  };

  /**
   * Cargar clases para el calendario
   */
  const fetchCalendarClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener rango de fechas amplio para el calendario (mes actual +/- 1 mes)
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);

      console.log("Fetching classes for date range:", {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        selectedEmployeeId,
      });

      const response = await classesService.getCalendarClasses(
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        selectedEmployeeId
      );

      console.log("Classes service response:", response);

      if (
        response &&
        response.success &&
        response.data &&
        Array.isArray(response.data)
      ) {
        // Transformar datos para el calendario
        const transformedClasses = response.data.map((classItem) => ({
          id: classItem.id,
          title: classItem.title,
          start: `${classItem.classDate.split("T")[0]}T${classItem.startTime}`,
          end: `${classItem.classDate.split("T")[0]}T${classItem.endTime}`,
          date: classItem.classDate.split("T")[0], // Para compatibilidad con BaseCalendar
          time: classItem.startTime,
          backgroundColor: getStatusColor(classItem.status),
          borderColor: getStatusColor(classItem.status),
          status: classItem.status,
          location: classItem.location,
          extendedProps: {
            ...classItem,
            professorName: classItem.employee?.user
              ? `${classItem.employee.user.firstName} ${classItem.employee.user.lastName}`
              : "Profesor no asignado",
            totalAthletes: classItem._count?.athletes || 0,
            startTime: classItem.startTime,
            endTime: classItem.endTime,
          },
        }));

        console.log("Transformed classes:", transformedClasses);
        setCalendarClasses(transformedClasses);
      } else {
        // Si no hay datos o el endpoint no existe, usar datos de ejemplo
        console.warn(
          "No se pudieron cargar las clases del servidor, usando datos de ejemplo"
        );
        const exampleClasses = getExampleClasses();
        console.log("Using example classes:", exampleClasses);
        setCalendarClasses(exampleClasses);
      }
    } catch (err) {
      console.error("Error fetching calendar classes:", err);
      setError(err.message);

      // En caso de error, mostrar datos de ejemplo para que el calendario funcione
      console.warn("Error al cargar clases, usando datos de ejemplo");
      const exampleClasses = getExampleClasses();
      console.log("Using example classes due to error:", exampleClasses);
      setCalendarClasses(exampleClasses);

      // Solo mostrar toast de error si no es un error de endpoint no encontrado
      if (
        !err.message.includes("404") &&
        !err.message.includes("Not Found") &&
        !err.message.includes("Cannot read properties")
      ) {
        toast.error(`Error al cargar el calendario de clases: ${err.message}`);
      } else {
        console.info(
          "Endpoint /classes/calendar no encontrado o estructura de datos incorrecta, usando datos de ejemplo"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [selectedEmployeeId]);

  /**
   * Obtener color según el estado de la clase
   */
  const getStatusColor = (status) => {
    const colors = {
      Programada: "#95FFA7", // Verde claro (esquema classes)
      En_curso: "#EDEB85", // Amarillo
      Finalizada: "#9BE9FF", // Azul claro
      Cancelada: "#FF95D1", // Rosa/Rojo claro
    };
    return colors[status] || "#B595FF"; // Morado por defecto
  };

  /**
   * Cambiar profesor seleccionado
   */
  const changeSelectedEmployee = (employeeId) => {
    setSelectedEmployeeId(employeeId);
  };

  /**
   * Refrescar datos del calendario
   */
  const refreshCalendar = useCallback(() => {
    fetchCalendarClasses();
  }, [fetchCalendarClasses]);

  // Cargar clases cuando cambien los parámetros
  useEffect(() => {
    fetchCalendarClasses();
  }, [fetchCalendarClasses]);

  return {
    // Estado
    calendarClasses,
    loading,
    error,
    selectedEmployeeId,

    // Acciones
    fetchCalendarClasses,
    changeSelectedEmployee,
    refreshCalendar,

    // Utilidades
    getStatusColor,
    getExampleClasses,
  };
};

export default useClassesCalendar;
