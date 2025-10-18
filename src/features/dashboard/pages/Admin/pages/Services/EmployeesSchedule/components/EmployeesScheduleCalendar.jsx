import React, { useState, useMemo, useRef, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  isBefore,
  parseISO,
} from "date-fns";
import es from "date-fns/locale/es";
import { motion } from "framer-motion";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCog,
  FaEdit,
  FaTrash,
  FaEye,
  FaBan,
} from "react-icons/fa";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../Styles/calendarCustomSchedule.css";

/* ============================================================
   🔹 CONFIGURACIÓN LOCALIZADOR Y TEXTOS
============================================================ */
const locales = { es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const messages = {
  month: "Mes",
  week: "Semana",
  day: "Día",
  today: "Hoy",
  previous: "Atrás",
  next: "Siguiente",
  noEventsInRange: "No hay horarios en este rango.",
};

/* ============================================================
   🔹 FUNCIÓN PARA GENERAR EVENTOS RECURRENTES
============================================================ */
function generateRecurringEvents(event) {
  const events = [];
  const startDate = parseISO(event.fecha);

  const endDate = event.customRecurrence?.endDate
    ? parseISO(event.customRecurrence.endDate)
    : addMonths(startDate, 2);

  let addFn;
  switch (event.repeticion) {
    case "dia":
      addFn = (d) => addDays(d, 1);
      break;
    case "semana":
      addFn = (d) => addWeeks(d, 1);
      break;
    case "mes":
      addFn = (d) => addMonths(d, 1);
      break;
    case "anio":
      addFn = (d) => addMonths(d, 12);
      break;
    case "laboral":
      addFn = (d) => addDays(d, 1);
      break;
    case "personalizado":
      break;
    default:
      return [event];
  }

  // 🔸 Si es personalizado
  if (event.repeticion === "personalizado" && event.customRecurrence) {
    const { interval, frequency, dias, endType, endDate: endCustom } =
      event.customRecurrence;
    const freqMap = {
      dia: addDays,
      semana: addWeeks,
      mes: addMonths,
      año: (d, i) => addMonths(d, 12 * i),
    };
    const addStep = freqMap[frequency] || addWeeks;
    let current = startDate;
    const limit =
      endType === "el" && endCustom
        ? parseISO(endCustom)
        : addMonths(startDate, 6);
    while (isBefore(current, limit)) {
      if (dias && dias.length > 0) {
        dias.forEach((d) => {
          const next = addDays(current, d - current.getDay());
          if (isBefore(next, limit)) {
            const eventCopy = { ...event };
            eventCopy.fecha = next.toISOString().split("T")[0];
            eventCopy.start = next;
            eventCopy.end = next;
            events.push(eventCopy);
          }
        });
      } else {
        const eventCopy = { ...event };
        eventCopy.fecha = current.toISOString().split("T")[0];
        eventCopy.start = current;
        eventCopy.end = current;
        events.push(eventCopy);
      }
      current = addStep(current, interval);
    }
    return events;
  }

  // 🔸 Si es diaria/semanal/mensual/etc
  let current = startDate;
  while (isBefore(current, endDate)) {
    const eventCopy = { ...event };
    eventCopy.start = current;
    eventCopy.end = current;
    eventCopy.fecha = current.toISOString().split("T")[0];
    events.push(eventCopy);
    current = addFn(current);
  }

  return events;
}

/* ============================================================
   🔹 COMPONENTE PRINCIPAL
============================================================ */
export default function EmployeesScheduleCalendar({
  schedules = [],
  onOpenModalForSlot,
  onOpenModalForEvent,
  onEditEvent,
  onViewEvent,
  onDeleteEvent,
  onCancelEvent,
  onSaveNewEvent,
}) {
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const calendarRef = useRef(null);
  const [popover, setPopover] = useState({ open: false, style: {}, event: null });

  /* ---------- Normalizar eventos ---------- */
  const events = useMemo(
    () =>
      (schedules || []).map((ev) => ({
        ...ev,
        start: ev.start instanceof Date ? ev.start : new Date(ev.start),
        end: ev.end instanceof Date ? ev.end : new Date(ev.end),
      })),
    [schedules]
  );

  /* ---------- Abrir popover al presionar engranaje ---------- */
  const openPopoverAt = (event, element) => {
    if (!calendarRef.current || !element) {
      setPopover({ open: true, style: {}, event });
      return;
    }
    const eventRect = element.getBoundingClientRect();
    const containerRect = calendarRef.current.getBoundingClientRect();
    const top = eventRect.top - containerRect.top + eventRect.height / 2;
    let left = eventRect.left - containerRect.left + eventRect.width + 8;
    const rightEdge = left + 260;
    if (rightEdge > containerRect.width)
      left = eventRect.left - containerRect.left - 260 - 8;
    setPopover({
      open: true,
      event,
      style: { position: "absolute", top: `${top}px`, left: `${left}px`, zIndex: 120 },
    });
  };

  const closePopover = () => setPopover({ open: false, style: {}, event: null });

  /* ---------- Renderizado de evento ---------- */
  const EventRenderer = ({ event }) => {
    const ref = useRef(null);
    const handleCogClick = (e) => {
      e.stopPropagation();
      openPopoverAt(event, ref.current);
    };
    return (
      <div
        ref={ref}
        className="flex items-center justify-between gap-2 text-xs font-medium truncate"
      >
        <div className="flex items-center gap-2 truncate">
          <span
            className={`w-2 h-2 rounded-full ${
              event.estado === "Cancelado"
                ? "bg-gray-400"
                : event.color || "bg-primary-purple"
            }`}
          />
          <span className="truncate">{event.title}</span>
        </div>
        <button
          onClick={handleCogClick}
          className="text-gray-500 hover:text-gray-700 p-1 rounded transition"
        >
          <FaCog className="w-4 h-4" />
        </button>
      </div>
    );
  };

  /* ---------- Navegación ---------- */
  const handleNavigate = (dir) => {
    if (view === "month") setDate(dir === "next" ? addMonths(date, 1) : subMonths(date, 1));
    else if (view === "week") setDate(dir === "next" ? addWeeks(date, 1) : subWeeks(date, 1));
    else setDate(dir === "next" ? addDays(date, 1) : subDays(date, 1));
    closePopover();
  };

  /* ---------- Cerrar popover al hacer clic fuera ---------- */
  useEffect(() => {
    const handler = (e) => {
      if (!calendarRef.current) return;
      if (popover.open) {
        const popEl = document.getElementById("employee-popover");
        if (popEl && popEl.contains(e.target)) return;
        closePopover();
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [popover.open]);

  /* ============================================================
     🔹 RENDER PRINCIPAL
  ============================================================ */
  return (
    <div ref={calendarRef} className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavigate("prev")}
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <FaChevronLeft className="text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold capitalize">
            {format(date, "MMMM yyyy", { locale: es })}
          </h2>
          <button
            onClick={() => handleNavigate("next")}
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <FaChevronRight className="text-gray-600" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {["month", "week", "day"].map((v) => (
            <button
              key={v}
              onClick={() => {
                setView(v);
                closePopover();
              }}
              className={`px-3 py-1 rounded-xl text-sm font-semibold ${
                view === v
                  ? "bg-primary-purple text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {v === "month" ? "Mes" : v === "week" ? "Semana" : "Día"}
            </button>
          ))}
        </div>
      </div>

      {/* Calendario */}
      <div className="rounded-2xl border border-gray-200 shadow-lg overflow-hidden bg-white">
        <Calendar
          selectable
          culture="es"
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={(v) => {
            setView(v);
            closePopover();
          }}
          date={date}
          onNavigate={(d) => {
            setDate(d);
            closePopover();
          }}
          components={{ event: EventRenderer }}
          views={["month", "week", "day"]}
          messages={messages}
          popup
          style={{ height: "70vh" }}
          onSelectSlot={(slot) => onOpenModalForSlot?.({ start: slot.start, end: slot.end })}
          onSelectEvent={(ev) => onOpenModalForEvent?.(ev)}
        />
      </div>

      {/* Popover */}
      {popover.open && popover.event && (
        <div id="employee-popover" style={popover.style} className="w-[260px]">
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.12 }}
            className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="px-3 py-2">
              <div className="text-sm font-medium text-gray-800 mb-1">
                {popover.event.title}
              </div>
              <div className="text-xs text-gray-500 mb-2">
                {format(popover.event.start, "yyyy-MM-dd HH:mm", { locale: es })} -{" "}
                {format(popover.event.end, "HH:mm", { locale: es })}
              </div>

              <div className="grid gap-2">
                <button
                  onClick={() => {
                    closePopover();
                    onEditEvent?.(popover.event);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-50"
                >
                  <FaEdit className="w-4 h-4 text-green-600" /> Editar horario
                </button>

                <button
                  onClick={() => {
                    closePopover();
                    onViewEvent?.(popover.event);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-50"
                >
                  <FaEye className="w-4 h-4 text-blue-600" /> Ver detalle
                </button>

                <button
                  onClick={() => {
                    closePopover();
                    onCancelEvent?.(popover.event.id);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-50"
                >
                  <FaBan className="w-4 h-4 text-orange-600" /> Cancelar horario
                </button>

                <button
                  onClick={() => {
                    closePopover();
                    onDeleteEvent?.(popover.event.id);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-50 text-red-600"
                >
                  <FaTrash className="w-4 h-4" /> Eliminar horario
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
