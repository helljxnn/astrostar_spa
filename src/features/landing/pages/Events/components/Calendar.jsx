import { useState, useMemo, useCallback } from "react";
import {
  isSameDay,
  combineDateAndTime,
  parseDateValue,
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
  const [showTooltip, setShowTooltip] = useState(null);

  const normalizeEventType = useCallback((value) => {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }, []);

  const getEventTypeInitial = useCallback((eventType) => {
    const normalized = normalizeEventType(eventType);
    const initials = {
      torneo: "T",
      festival: "F",
      clausura: "C",
      taller: "TL",
    };
    return initials[normalized] || "";
  }, [normalizeEventType]);

  const getEventTypeFullName = useCallback((eventType) => {
    const normalized = normalizeEventType(eventType);
    const names = {
      torneo: "Torneo",
      festival: "Festival",
      clausura: "Clausura",
      taller: "Taller",
    };
    return names[normalized] || "Evento";
  }, [normalizeEventType]);

  const today = new Date();

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
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
      const convertTo24Hour = (time12) => {
        if (!time12) return "00:00";

        if (!time12.includes("AM") && !time12.includes("PM")) {
          return time12;
        }

        const [time, period] = time12.split(" ");
        const [hours, minutes] = time.split(":");
        let hour = parseInt(hours, 10);

        if (period === "PM" && hour !== 12) {
          hour += 12;
        } else if (period === "AM" && hour === 12) {
          hour = 0;
        }

        return `${hour.toString().padStart(2, "0")}:${minutes}`;
      };

      const time24 = convertTo24Hour(nextEvent.time);
      return combineDateAndTime(nextEvent.date, time24);
    } catch {
      return null;
    }
  }, [nextEvent]);

  const handleDayClick = useCallback(
    (date) => {
      onDateSelect(date);
    },
    [onDateSelect]
  );

  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-8 sm:h-10 md:h-12"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    const dayEvents = events
      ? events.filter((ev) => {
          try {
            // Ahora verifica si el día está dentro del rango del evento
            return isSameDay(
              parseDateValue(ev.date),
              date,
              ev.endDate ? parseDateValue(ev.endDate) : null
            );
          } catch {
            return false;
          }
        })
      : [];

    const hasEvent = dayEvents.length > 0;
    const isSelected = selectedDate && isSameDay(selectedDate, date);
    const isToday = isSameDay(today, date);
    const isNextEventDay = nextEventDate && isSameDay(nextEventDate, date);

    // Helper function to convert 12-hour to 24-hour format
    const convertTo24Hour = (time12) => {
      if (!time12) return "00:00";

      // Si ya está en formato 24 horas, devolverlo tal como está
      if (!time12.includes("AM") && !time12.includes("PM")) {
        return time12;
      }

      const [time, period] = time12.split(" ");
      const [hours, minutes] = time.split(":");
      let hour = parseInt(hours, 10);

      if (period === "PM" && hour !== 12) {
        hour += 12;
      } else if (period === "AM" && hour === 12) {
        hour = 0;
      }

      return `${hour.toString().padStart(2, "0")}:${minutes}`;
    };

    const normalizedDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const eventsByStatus = {
      cancelado: dayEvents.filter((ev) => ev.status === "cancelado"),
      finalizado: dayEvents.filter((ev) => {
        if (ev.status === "cancelado") return false;
        const endDate = ev.endDate ? parseDateValue(ev.endDate) : parseDateValue(ev.date);
        if (!endDate) return false;
        const normalizedEndDate = new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate()
        );
        return normalizedEndDate < normalizedToday || ev.status === "finalizado";
      }),
      programado: dayEvents.filter((ev) => {
        if (ev.status === "cancelado") return false;
        const endDate = ev.endDate ? parseDateValue(ev.endDate) : parseDateValue(ev.date);
        if (!endDate) return false;
        const normalizedEndDate = new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate()
        );
        return normalizedEndDate >= normalizedToday && ev.status !== "finalizado";
      }),
    };

    const sortedDayEvents = sortEventsByDateTime(dayEvents);

    let dayButtonClass = "";
    if (isSelected) {
      dayButtonClass =
        "border-[#b595ff] bg-[linear-gradient(135deg,#b595ff_0%,#9be9ff_100%)] text-white shadow-[0_12px_24px_rgba(181,149,255,0.28)]";
    } else if (isToday && hasEvent) {
      dayButtonClass =
        "border-[#b595ff] bg-[#faf7ff] text-[#7c5fd4] shadow-sm ring-2 ring-[#d9cbff]";
    } else if (isNextEventDay) {
      dayButtonClass =
        "border-[#d9cbff] bg-[#faf7ff] text-[#7c5fd4] shadow-sm";
    } else if (hasEvent) {
      dayButtonClass =
        "border-slate-200 bg-white text-slate-700 hover:border-[#d9cbff] hover:bg-[#faf7ff]";
    } else if (isToday) {
      dayButtonClass =
        "border-[#b595ff] bg-white text-[#b595ff] shadow-sm";
    } else {
      dayButtonClass =
        "border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50";
    }

    const tooltipContent = hasEvent ? (
      <div className="space-y-1 text-xs text-slate-700">
        <p className="font-semibold text-slate-900">
          {date.toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "long",
          })}
        </p>
        {Object.entries(eventsByStatus).map(
          ([status, statusEvents]) =>
            statusEvents.length > 0 && (
              <div key={status}>
                <span className="capitalize">
                  {status === "programado"
                    ? "Programado"
                    : status === "finalizado"
                    ? "Finalizado"
                    : "Cancelado"}
                </span>
              </div>
            )
        )}
      </div>
    ) : null;

    days.push(
      <div key={day} className="relative">
        <button
          onClick={() => handleDayClick(date, dayEvents, sortedDayEvents)}
          onMouseEnter={() =>
            hasEvent && setShowTooltip(`${day}-${currentMonth.getMonth()}`)
          }
          onMouseLeave={() => setShowTooltip(null)}
          className={`relative h-8 w-8 rounded-xl border font-montserrat text-xs font-semibold transition-all duration-200 sm:h-10 sm:w-10 sm:text-sm md:h-11 md:w-11 ${dayButtonClass}`}
        >
          <span className="relative z-10">{day}</span>

          {hasEvent && (
            <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#b595ff] shadow-sm sm:h-3.5 sm:w-3.5" />
          )}

          {isNextEventDay && (
            <div className="absolute -bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#9be9ff]"></div>
          )}

          {hasEvent && dayEvents.length > 1 && (
            <div className="absolute bottom-0 left-0 h-1.5 w-1.5 rounded-full border border-white bg-[#7c5fd4]"></div>
          )}
        </button>

        {showTooltip === `${day}-${currentMonth.getMonth()}` &&
          tooltipContent && (
            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 max-w-44 -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-[0_16px_32px_rgba(15,23,42,0.12)]">
              {tooltipContent}
              <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-slate-200 bg-white"></div>
            </div>
          )}
      </div>
    );
  }

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  return (
    <div translate="no" className="mx-auto h-fit w-full max-w-[22rem] rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.10)] sm:max-w-md sm:rounded-[28px] sm:p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <button
          onClick={prevMonth}
          className="p-1 sm:p-2 md:p-3 hover:bg-gradient-to-r hover:from-[#B595FF] hover:to-[#9BE9FF] hover:text-white transition-all duration-300 rounded-lg sm:rounded-xl group"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-white transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h3 translate="no" className="text-base sm:text-lg md:text-xl font-montserrat font-bold bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] bg-clip-text text-transparent text-center">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>

        <button
          onClick={nextMonth}
          className="p-1 sm:p-2 md:p-3 hover:bg-gradient-to-r hover:from-[#B595FF] hover:to-[#9BE9FF] hover:text-white transition-all duration-300 rounded-lg sm:rounded-xl group"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-white transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="mb-3 grid grid-cols-7 gap-0.5 sm:mb-4 sm:gap-1.5 md:mb-6 md:gap-2">
        {["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"].map((day) => (
          <div
            key={day}
            className="flex h-6 items-center justify-center sm:h-8 md:h-10"
          >
            <span translate="no" className="whitespace-nowrap text-[10px] font-montserrat font-bold text-gray-600 sm:text-sm md:text-[15px]">
              {day}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 md:gap-2">{days}</div>

    </div>
  );
};

