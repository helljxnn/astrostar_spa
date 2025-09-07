"use client";

import { useState, useMemo } from "react";
import {
  isSameDay,
  combineDateAndTime,
  sortEventsByDateTime,
} from "../../../../../shared/utils/helpers/dateHelpers";

// Función para convertir de 24h a 12h con AM/PM (solo para compatibilidad, no se usa aquí)
const convertTo12Hour = (time24) => {
  if (!time24) return "Sin hora";
  const [hours, minutes] = time24.split(":");
  let hour = parseInt(hours, 10);
  if (isNaN(hour)) return "Hora inválida";
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; // Convierte 0 a 12 y ajusta 13-23
  return `${hour}:${minutes} ${period}`;
};

export const Calendar = ({
  events,
  onDateSelect,
  selectedDate,
  onEventSelect,
  nextEvent,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Iniciales personalizadas
  const getEventTypeInitial = (eventType) => {
    const initials = {
      torneo: "T",
      festival: "F",
      clausura: "C",
      taller: "TLL",
    };
    return initials[eventType] || "E";
  };

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
    return combineDateAndTime(nextEvent.date, nextEvent.time);
  }, [nextEvent]);

  const days = [];

  // Espacios vacíos al inicio
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-16"></div>);
  }

  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    // Eventos de ese día (comparación segura sin problemas de zona horaria)
    const dayEvents = events ? events.filter((ev) =>
      isSameDay(combineDateAndTime(ev.date, "00:00"), date)
    ) : [];

    const hasEvent = dayEvents.length > 0;
    const isSelected = selectedDate && isSameDay(selectedDate, date);
    const isToday = isSameDay(today, date);
    const isNextEventDay = nextEventDate && isSameDay(nextEventDate, date);

    // ¿Todos los eventos de ese día ya pasaron (por hora)?
    const isPastEventDay =
      hasEvent &&
      dayEvents.every((ev) => combineDateAndTime(ev.date, ev.time) < today);

    // Ordena eventos del día por hora para elegir el primero
    const sortedDayEvents = sortEventsByDateTime(dayEvents);

    days.push(
      <button
        key={day}
        onClick={() => {
          onDateSelect(date); // Siempre se actualiza la fecha seleccionada

          if (hasEvent) {
            const targetEvent = sortedDayEvents[0]; // el más cercano/temprano del día
            if (targetEvent?.id) {
              onEventSelect?.(targetEvent.id);
              setTimeout(() => {
                const el = document.getElementById(`event-${targetEvent.id}`);
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 100);
            } else {
              console.log("targetEvent no tiene id:", targetEvent);
            }
          } else {
            // Si no hay eventos, deselecciona cualquier evento anterior.
            onEventSelect?.(null);
          }
        }}
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

        {/* Indicador de evento sin hora */}
        {hasEvent && (
          <div className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow">
            <span className="text-xs font-bold text-[#B595FF]">
              {getEventTypeInitial(sortedDayEvents[0].type)}
            </span>
          </div>
        )}
      </button>
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
    <div className="bg-white rounded-3xl p-8 shadow-xl h-fit">
      <div className="flex items-center justify-between mb-12">
        <button
          onClick={prevMonth}
          className="p-4 hover:bg-gradient-to-r hover:from-[#B595FF] hover:to-[#9BE9FF] hover:text-white transition-all duration-300 rounded-2xl group"
        >
          <svg
            className="w-8 h-8 text-gray-600 group-hover:text-white transition-colors"
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

        <h3 className="text-4xl font-montserrat font-bold bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] bg-clip-text text-transparent">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>

        <button
          onClick={nextMonth}
          className="p-4 hover:bg-gradient-to-r hover:from-[#B595FF] hover:to-[#9BE9FF] hover:text-white transition-all duration-300 rounded-2xl group"
        >
          <svg
            className="w-8 h-8 text-gray-600 group-hover:text-white transition-colors"
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

      <div className="grid grid-cols-7 gap-4 mb-8">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div key={day} className="h-12 flex items-center justify-center">
            <span className="text-lg font-montserrat font-bold text-gray-600">
              {day}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-4">{days}</div>
    </div>
  );
};