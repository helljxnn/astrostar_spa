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
  const [showTooltip, setShowTooltip] = useState(null);

  const getEventTypeInitial = useCallback((eventType) => {
    const initials = {
      torneo: "T",
      festival: "F",
      clausura: "C",
      taller: "TLL",
    };
    return initials[eventType] || "E";
  }, []);

  const getEventTypeFullName = useCallback((eventType) => {
    const names = {
      torneo: "Torneo",
      festival: "Festival",
      clausura: "Clausura",
      taller: "Taller",
    };
    return names[eventType] || "Evento";
  }, []);

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
        
        if (!time12.includes('AM') && !time12.includes('PM')) {
          return time12;
        }
        
        const [time, period] = time12.split(' ');
        const [hours, minutes] = time.split(':');
        let hour = parseInt(hours, 10);
        
        if (period === 'PM' && hour !== 12) {
          hour += 12;
        } else if (period === 'AM' && hour === 12) {
          hour = 0;
        }
        
        return `${hour.toString().padStart(2, '0')}:${minutes}`;
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
        return isSameDay(new Date(ev.date), date, ev.endDate ? new Date(ev.endDate) : null);
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
      if (!time12.includes('AM') && !time12.includes('PM')) {
        return time12;
      }
      
      const [time, period] = time12.split(' ');
      const [hours, minutes] = time.split(':');
      let hour = parseInt(hours, 10);
      
      if (period === 'PM' && hour !== 12) {
        hour += 12;
      } else if (period === 'AM' && hour === 12) {
        hour = 0;
      }
      
      return `${hour.toString().padStart(2, '0')}:${minutes}`;
    };

    // Verificar si TODOS los eventos del día han pasado su hora
    const isPastEventDay = hasEvent && dayEvents.every((ev) => {
      try {
        const time24 = convertTo24Hour(ev.time);
        const eventDateTime = combineDateAndTime(ev.date, time24);
        // Agregar 1 minuto para asegurar que el evento se marque como pasado después de su hora
        const eventEndTime = new Date(eventDateTime.getTime() + 60000); // +1 minuto
        return eventDateTime && eventEndTime <= today;
      } catch {
        return false;
      }
    });

    // Mejorar la lógica para categorizar eventos
    const eventsByStatus = {
      cancelado: dayEvents.filter((ev) => ev.status === "cancelado"),
      enPausa: dayEvents.filter((ev) => ev.status === "en-pausa"),
      finalizado: dayEvents.filter((ev) => {
        // Solo incluir eventos que han pasado su hora Y no están cancelados/pausados
        if (ev.status === "cancelado" || ev.status === "en-pausa") {
          return false;
        }
        try {
          const time24 = convertTo24Hour(ev.time);
          const eventDateTime = combineDateAndTime(ev.date, time24);
          // Agregar 1 minuto para asegurar que el evento se marque como finalizado después de su hora
          const eventEndTime = new Date(eventDateTime.getTime() + 60000); // +1 minuto
          return eventDateTime && eventEndTime <= today;
        } catch {
          return false;
        }
      }),
      programado: dayEvents.filter((ev) => {
        // Solo incluir eventos que no han pasado su hora Y no están cancelados/pausados
        if (ev.status === "cancelado" || ev.status === "en-pausa") {
          return false;
        }
        try {
          const time24 = convertTo24Hour(ev.time);
          const eventDateTime = combineDateAndTime(ev.date, time24);
          return eventDateTime && eventDateTime > today;
        } catch {
          return false;
        }
      }),
    };

    const sortedDayEvents = sortEventsByDateTime(dayEvents);

    // Mejorar la lógica de estilos de botones
    let dayButtonClass = "";
    if (isSelected) {
      dayButtonClass = "bg-gradient-to-br from-[#B595FF] to-[#9BE9FF] text-white shadow-xl scale-105";
    } else if (isNextEventDay) {
      dayButtonClass = "bg-[#B595FF] text-white shadow-lg ring-2 sm:ring-4 ring-[#9BE9FF]";
    } else if (isPastEventDay) {
      // Estilo gris para eventos pasados
      dayButtonClass = "bg-gray-300 text-gray-600 hover:bg-gray-400";
    } else if (hasEvent) {
      // Solo aplicar el gradiente si hay eventos activos/programados
      const hasActiveEvents = eventsByStatus.programado.length > 0;
      if (hasActiveEvents) {
        dayButtonClass = "bg-gradient-to-br from-[#B595FF] to-[#9BE9FF] text-white hover:shadow-lg";
      } else {
        // Si solo hay eventos cancelados/pausados, usar estilo neutral
        dayButtonClass = "bg-gray-200 text-gray-600 hover:bg-gray-300";
      }
    } else if (isToday) {
      dayButtonClass = "bg-white text-[#B595FF] border-2 border-[#B595FF] shadow-md hover:shadow-lg";
    } else {
      dayButtonClass = "hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 text-gray-700 hover:shadow-sm";
    }

    //Mejorar el tooltip para mostrar solo estados relevantes (sin contadores)
    const tooltipContent = hasEvent ? (
      <div className="text-xs sm:text-sm space-y-1">
        {Object.entries(eventsByStatus).map(
          ([status, events]) =>
            events.length > 0 && (
              <div key={status}>
                <span>
                  {status === "enPausa"
                    ? "En Pausa"
                    : status === "programado"
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
          className={`relative h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-lg sm:rounded-xl font-montserrat font-bold text-xs sm:text-sm md:text-base transition-all duration-300 transform hover:scale-105 ${dayButtonClass}`}
        >
          <span className="relative z-10">{day}</span>

          {hasEvent && sortedDayEvents.length > 0 && (
            <div className="absolute top-0 right-0 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-white rounded-full flex items-center justify-center shadow">
              <span className="text-[10px] sm:text-xs font-bold text-[#B595FF]">
                {getEventTypeInitial(sortedDayEvents[0].type)}
              </span>
            </div>
          )}

          {isNextEventDay && (
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 bg-[#9BE9FF] rounded-full animate-pulse"></div>
          )}

          {hasEvent && dayEvents.length > 1 && (
            <div className="absolute bottom-0 left-0 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full border border-[#B595FF]"></div>
          )}
        </button>

        {showTooltip === `${day}-${currentMonth.getMonth()}` &&
          tooltipContent && (
            <div className="absolute z-50 bottom-full mb-1 sm:mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg shadow-lg max-w-40 sm:max-w-48 pointer-events-none">
              {tooltipContent}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
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
    <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg h-fit w-full max-w-[20rem] sm:max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
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

        <h3 className="text-base sm:text-lg md:text-xl font-montserrat font-bold bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] bg-clip-text text-transparent text-center">
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

      <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3 mb-3 sm:mb-4 md:mb-6">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div
            key={day}
            className="h-6 sm:h-8 md:h-10 flex items-center justify-center"
          >
            <span className="text-xs sm:text-sm md:text-base font-montserrat font-bold text-gray-600">
              {day}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3">{days}</div>

      <div className="mt-3 sm:mt-4 md:mt-6">
        <div className="text-xs sm:text-sm text-gray-600 border-t pt-2 sm:pt-3">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
            <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-50 rounded-full">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-br from-[#B595FF] to-[#9BE9FF] rounded-full flex items-center justify-center">
                <span className="text-[8px] sm:text-xs font-bold text-white">
                  T
                </span>
              </div>
              <span className="text-gray-700 font-medium text-xs sm:text-sm">
                Torneo
              </span>
            </div>
            <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-50 rounded-full">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-br from-[#B595FF] to-[#9BE9FF] rounded-full flex items-center justify-center">
                <span className="text-[8px] sm:text-xs font-bold text-white">
                  F
                </span>
              </div>
              <span className="text-gray-700 font-medium text-xs sm:text-sm">
                Festival
              </span>
            </div>
            <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-50 rounded-full">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-br from-[#B595FF] to-[#9BE9FF] rounded-full flex items-center justify-center">
                <span className="text-[8px] sm:text-xs font-bold text-white">
                  C
                </span>
              </div>
              <span className="text-gray-700 font-medium text-xs sm:text-sm">
                Clausura
              </span>
            </div>
            <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-50 rounded-full">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-br from-[#B595FF] to-[#9BE9FF] rounded-full flex items-center justify-center">
                <span className="text-[7px] sm:text-[8px] font-bold text-white">
                  TLL
                </span>
              </div>
              <span className="text-gray-700 font-medium text-xs sm:text-sm">
                Taller
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};