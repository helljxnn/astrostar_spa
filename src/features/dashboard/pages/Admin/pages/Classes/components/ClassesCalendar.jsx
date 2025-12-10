import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Users,
  Clock,
  MapPin,
} from "lucide-react";
import useClassesCalendar from "../hooks/useClassesCalendar";
import ClassDetailModal from "./ClassDetailModal";
import LoadingSpinner from "../../../../../../../shared/components/LoadingSpinner";

const ClassesCalendar = () => {
  const {
    calendarClasses,
    loading,
    selectedDate,
    viewType,
    changeSelectedDate,
    changeViewType,
    goToPrevious,
    goToNext,
    goToToday,
    getCalendarTitle,
  } = useClassesCalendar();

  const [selectedClass, setSelectedClass] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  /**
   * Manejar clic en una clase
   */
  const handleClassClick = (classItem) => {
    setSelectedClass(classItem);
    setShowDetailModal(true);
  };

  /**
   * Generar vista de calendario simple
   */
  const renderCalendarView = () => {
    if (viewType === "month") {
      return renderMonthView();
    } else if (viewType === "week") {
      return renderWeekView();
    } else {
      return renderDayView();
    }
  };

  /**
   * Vista mensual
   */
  const renderMonthView = () => {
    const startOfMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0
    );
    const startOfCalendar = new Date(startOfMonth);
    startOfCalendar.setDate(
      startOfCalendar.getDate() - startOfCalendar.getDay()
    );

    const days = [];
    const current = new Date(startOfCalendar);

    // Generar 42 días (6 semanas)
    for (let i = 0; i < 42; i++) {
      const dayClasses = calendarClasses.filter((classItem) => {
        const classDate = new Date(classItem.start).toDateString();
        return classDate === current.toDateString();
      });

      days.push({
        date: new Date(current),
        classes: dayClasses,
        isCurrentMonth: current.getMonth() === selectedDate.getMonth(),
        isToday: current.toDateString() === new Date().toDateString(),
      });

      current.setDate(current.getDate() + 1);
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Encabezados de días */}
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50"
          >
            {day}
          </div>
        ))}

        {/* Días del mes */}
        {days.map((day, index) => (
          <div
            key={index}
            className={`min-h-[120px] p-2 border border-gray-200 ${
              day.isCurrentMonth ? "bg-white" : "bg-gray-50"
            } ${day.isToday ? "bg-blue-50 border-blue-200" : ""}`}
          >
            <div
              className={`text-sm font-medium mb-1 ${
                day.isCurrentMonth ? "text-gray-900" : "text-gray-400"
              } ${day.isToday ? "text-blue-600" : ""}`}
            >
              {day.date.getDate()}
            </div>

            <div className="space-y-1">
              {day.classes.slice(0, 3).map((classItem) => (
                <div
                  key={classItem.id}
                  onClick={() => handleClassClick(classItem)}
                  className="text-xs p-1 rounded cursor-pointer hover:opacity-80 truncate"
                  style={{ backgroundColor: classItem.backgroundColor }}
                  title={classItem.title}
                >
                  <div className="text-white font-medium">
                    {classItem.title}
                  </div>
                  <div className="text-white opacity-90">
                    {classItem.extendedProps.startTime} -{" "}
                    {classItem.extendedProps.endTime}
                  </div>
                </div>
              ))}
              {day.classes.length > 3 && (
                <div className="text-xs text-gray-500 font-medium">
                  +{day.classes.length - 3} más
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  /**
   * Vista semanal
   */
  const renderWeekView = () => {
    const startOfWeek = new Date(selectedDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const current = new Date(startOfWeek);
      current.setDate(current.getDate() + i);

      const dayClasses = calendarClasses.filter((classItem) => {
        const classDate = new Date(classItem.start).toDateString();
        return classDate === current.toDateString();
      });

      days.push({
        date: current,
        classes: dayClasses,
        isToday: current.toDateString() === new Date().toDateString(),
      });
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div key={index} className="border border-gray-200">
            <div
              className={`p-3 text-center border-b border-gray-200 ${
                day.isToday ? "bg-blue-50 text-blue-600" : "bg-gray-50"
              }`}
            >
              <div className="text-sm font-medium">
                {day.date.toLocaleDateString("es-ES", { weekday: "short" })}
              </div>
              <div className="text-lg font-bold">{day.date.getDate()}</div>
            </div>

            <div className="p-2 min-h-[300px] space-y-1">
              {day.classes.map((classItem) => (
                <div
                  key={classItem.id}
                  onClick={() => handleClassClick(classItem)}
                  className="text-xs p-2 rounded cursor-pointer hover:opacity-80"
                  style={{ backgroundColor: classItem.backgroundColor }}
                >
                  <div className="text-white font-medium">
                    {classItem.title}
                  </div>
                  <div className="text-white opacity-90">
                    {classItem.extendedProps.startTime} -{" "}
                    {classItem.extendedProps.endTime}
                  </div>
                  <div className="text-white opacity-75 flex items-center gap-1 mt-1">
                    <Users className="h-3 w-3" />
                    {classItem.extendedProps.totalAthletes}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  /**
   * Vista diaria
   */
  const renderDayView = () => {
    const dayClasses = calendarClasses.filter((classItem) => {
      const classDate = new Date(classItem.start).toDateString();
      return classDate === selectedDate.toDateString();
    });

    // Generar horas del día (6 AM a 10 PM)
    const hours = [];
    for (let i = 6; i <= 22; i++) {
      hours.push(i);
    }

    return (
      <div className="space-y-4">
        <div className="text-center py-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">
            {selectedDate.toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>
        </div>

        <div className="space-y-2">
          {hours.map((hour) => {
            const hourClasses = dayClasses.filter((classItem) => {
              const classHour = parseInt(
                classItem.extendedProps.startTime.split(":")[0]
              );
              return classHour === hour;
            });

            return (
              <div key={hour} className="flex border-b border-gray-100">
                <div className="w-20 py-2 text-sm text-gray-500 text-right pr-4">
                  {hour.toString().padStart(2, "0")}:00
                </div>
                <div className="flex-1 py-2 min-h-[60px]">
                  {hourClasses.map((classItem) => (
                    <div
                      key={classItem.id}
                      onClick={() => handleClassClick(classItem)}
                      className="p-3 rounded-lg cursor-pointer hover:opacity-80 mb-2"
                      style={{ backgroundColor: classItem.backgroundColor }}
                    >
                      <div className="text-white font-medium">
                        {classItem.title}
                      </div>
                      <div className="text-white opacity-90 text-sm">
                        {classItem.extendedProps.startTime} -{" "}
                        {classItem.extendedProps.endTime}
                      </div>
                      <div className="text-white opacity-75 text-sm flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {classItem.extendedProps.totalAthletes} deportistas
                        </span>
                        {classItem.extendedProps.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {classItem.extendedProps.location}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Controles del calendario */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Navegación */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevious}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goToNext}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <button
            onClick={goToToday}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Hoy
          </button>

          <h2 className="text-xl font-semibold text-gray-900">
            {getCalendarTitle()}
          </h2>
        </div>

        {/* Selector de vista */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          {[
            { id: "month", name: "Mes" },
            { id: "week", name: "Semana" },
            { id: "day", name: "Día" },
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => changeViewType(view.id)}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                viewType === view.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {view.name}
            </button>
          ))}
        </div>
      </div>

      {/* Calendario */}
      <div className="bg-white rounded-lg border border-gray-200">
        {renderCalendarView()}
      </div>

      {/* Modal de detalle de clase */}
      {showDetailModal && selectedClass && (
        <ClassDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedClass(null);
          }}
          classData={selectedClass.extendedProps}
        />
      )}
    </div>
  );
};

export default ClassesCalendar;
