import { useState, useMemo, useCallback } from "react";
import {
  isSameDay,
  combineDateAndTime,
  sortEventsByDateTime,
} from "../../../../../shared/utils/helpers/dateHelpers";

export const Calendar = ({
  events,
  onDateSelect,
  selectedDate,
  onEventSelect,
  nextEvent,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getEventTypeInitial = useCallback((eventType) => {
    const initials = {
      torneo: "T",
      festival: "F",
      clausura: "C",
      taller: "TLL",
    };
    return initials[eventType] || "E";
  }, []);

  const today = new Date();
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const nextEventDate = useMemo(() => {
    if (!nextEvent) return null;
    try {
      return combineDateAndTime(nextEvent.date, nextEvent.time);
    } catch {
      return null;
    }
  }, [nextEvent]);

  // 🔹 Click en día
  const handleDayClick = useCallback((date, dayEvents, sortedDayEvents) => {
    onDateSelect(date);

    if (dayEvents.length > 0) {
      const targetEvent = sortedDayEvents[0];

      if (targetEvent?.id) {
        onEventSelect?.(targetEvent.id);

        // 🔹 Scroll siempre al evento correcto
        setTimeout(() => {
          const element = document.getElementById(`event-${targetEvent.id}`);
          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          }
        }, 200);
      }
    } else {
      onEventSelect?.(null);
    }
  }, [onDateSelect, onEventSelect]);

  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-16"></div>);
  }

  // días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

    const dayEvents = events ? events.filter((ev) => {
      try {
        const eventDate = combineDateAndTime(ev.date, "00:00");
        return isSameDay(eventDate, date);
      } catch {
        return false;
      }
    }) : [];

    const hasEvent = dayEvents.length > 0;
    const isSelected = selectedDate && isSameDay(selectedDate, date);
    const isToday = isSameDay(today, date);
    const isNextEventDay = nextEventDate && isSameDay(nextEventDate, date);
    const isPastEventDay = hasEvent && dayEvents.every((ev) => {
      try {
        return combineDateAndTime(ev.date, ev.time) < today;
      } catch {
        return false;
      }
    });

    const sortedDayEvents = sortEventsByDateTime(dayEvents);

    days.push(
      <button
        key={day}
        onClick={() => handleDayClick(date, dayEvents, sortedDayEvents)}
        className={`relative h-16 w-16 rounded-2xl font-montserrat font-bold text-lg transition-all duration-300 transform hover:scale-110
          ${
            isSelected
              ? "bg-gradient-to-br from-[#B595FF] to-[#9BE9FF] text-white shadow-2xl scale-110"
              : isNextEventDay
              ? "bg-[#B595FF] text-white shadow-xl ring-4 ring-[#9BE9FF]"
              : isPastEventDay
              ? "bg-gray-300 text-gray-600 hover:bg-gray-400"
              : hasEvent
              ? "bg-gradient-to-br from-[#B595FF] to-[#9BE9FF] text-white hover:shadow-xl"
              : isToday
              ? "bg-white text-[#B595FF] border-2 border-[#B595FF] shadow-lg hover:shadow-xl"
              : "hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 text-gray-700 hover:shadow-md"
          }`}
      >
        <span className="relative z-10">{day}</span>

        {hasEvent && sortedDayEvents.length > 0 && (
          <div className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow">
            <span className="text-xs font-bold text-[#B595FF]">
              {getEventTypeInitial(sortedDayEvents[0].type)}
            </span>
          </div>
        )}

        {isNextEventDay && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#9BE9FF] rounded-full animate-pulse"></div>
        )}
      </button>
    );
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl h-fit">
      <div className="flex items-center justify-between mb-12">
        <button onClick={prevMonth} className="p-4 hover:bg-gradient-to-r hover:from-[#B595FF] hover:to-[#9BE9FF] hover:text-white transition-all duration-300 rounded-2xl group">
          <svg className="w-8 h-8 text-gray-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h3 className="text-4xl font-montserrat font-bold bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] bg-clip-text text-transparent">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>

        <button onClick={nextMonth} className="p-4 hover:bg-gradient-to-r hover:from-[#B595FF] hover:to-[#9BE9FF] hover:text-white transition-all duration-300 rounded-2xl group">
          <svg className="w-8 h-8 text-gray-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-4 mb-8">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div key={day} className="h-12 flex items-center justify-center">
            <span className="text-lg font-montserrat font-bold text-gray-600">{day}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-4">{days}</div>
    </div>
  );
};