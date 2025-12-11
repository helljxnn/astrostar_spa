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
  FaStickyNote,
  FaExclamationCircle,
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
  day: "Dia",
  today: "Hoy",
  previous: "Atras",
  next: "Siguiente",
  noEventsInRange: "No hay horarios en este rango.",
};


const ROLE_COLORS = {
  entrenador: { from: "#effbf2", to: "#d9f3d7", dot: "#4ade80", tagBg: "rgba(199, 249, 204, 0.25)" },
  fisioterapia: { from: "#f5f3ff", to: "#e3deff", dot: "#8b5cf6", tagBg: "rgba(224, 215, 255, 0.3)" },
  nutricion: { from: "#f0fbff", to: "#d6f0ff", dot: "#38bdf8", tagBg: "rgba(209, 242, 255, 0.35)" },
  psicologia: { from: "#fff5fb", to: "#ffe1f0", dot: "#fb7185", tagBg: "rgba(252, 225, 243, 0.3)" },
  default: { from: "#f5f6ff", to: "#e3e8ff", dot: "#6366f1", tagBg: "rgba(229, 237, 255, 0.45)" },
};

const ROLE_ALIASES = {
  psicologa: "psicologia",
  psicologo: "psicologia",
  psicologia: "psicologia",
  fisioterapeuta: "fisioterapia",
  fisioterapia: "fisioterapia",
  nutricionista: "nutricion",
  nutricion: "nutricion",
  entrenador: "entrenador",
  admin: "",
  administrador: "",
  administradora: "",
};

const normalizeRole = (cargo = "") =>
  cargo
    .toLowerCase()
    .replace(/[\u00e1]/g, "a")
    .replace(/[\u00e9]/g, "e")
    .replace(/[\u00ed]/g, "i")
    .replace(/[\u00f3]/g, "o")
    .replace(/[\u00fa]/g, "u")
    .replace(/[^a-z0-9]/g, "")
    .trim();

const resolveRoleId = (cargo = "") => {
  const key = normalizeRole(cargo);
  return ROLE_ALIASES[key] !== undefined ? ROLE_ALIASES[key] : key;
};

const getRoleColors = (cargo = "") => {
  const key = resolveRoleId(cargo);
  if (!key) return ROLE_COLORS.default;
  return ROLE_COLORS[key] || ROLE_COLORS.default;
};

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
=========================================================== */
export default function EmployeesScheduleCalendar({
  schedules = [],
  onOpenModalForSlot,
  onOpenModalForEvent,
  onEditEvent,
  onViewEvent,
  onDeleteEvent,
  onCancelEvent,
  noveltyKeys = new Set(),
}) {
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const calendarRef = useRef(null);
  const [popover, setPopover] = useState({ open: false, style: {}, horario: null });

  /* ---------- Normalizar eventos ---------- */
  const events = useMemo(() => {
    return (schedules || []).map((ev) => ({
      ...ev,
      start: ev.start instanceof Date ? ev.start : new Date(ev.start),
      end: ev.end instanceof Date ? ev.end : new Date(ev.end),
    }));
  }, [schedules]);

  /* ---------- Abrir popover al presionar engranaje ---------- */
  const openPopoverAt = (horario, element) => {
    if (!calendarRef.current || !element) {
      setPopover({ open: true, style: {}, horario });
      return;
    }
    const eventRect = element.getBoundingClientRect();
    const containerRect = calendarRef.current.getBoundingClientRect();
    const top = eventRect.top - containerRect.top + eventRect.height / 2;
    let left = eventRect.left - containerRect.left + eventRect.width + 8;
    const rightEdge = left + 260;
    if (rightEdge > containerRect.width) left = eventRect.left - containerRect.left - 260 - 8;
    setPopover({
      open: true,
      horario,
      style: { position: "absolute", top: `${top}px`, left: `${left}px`, zIndex: 120 },
    });
  };

  const closePopover = () => setPopover({ open: false, style: {}, horario: null });

  /* ---------- Renderizado de evento ---------- */
  const EventRenderer = ({ event: horario }) => {
    const ref = useRef(null);
    const handleCogClick = (e) => {
      e.stopPropagation();
      openPopoverAt(horario, ref.current);
    };
    const roleColors = getRoleColors(
      horario.cargo || horario.area || horario.role || horario.rol || horario.title
    );
    const { from, to, dot } = roleColors;

    const employeeName =
      horario.empleado ||
      (horario.title || "").replace(/^Turno\s*-\s*/i, "") ||
      horario.title ||
      "";
    const employeeFirstName = employeeName
      ? employeeName.trim().split(/\s+/)[0]
      : "";
    const displayRole =
      horario.cargo ||
      horario.role ||
      horario.rol ||
      horario.area ||
      (horario.title && !/programado/i.test(horario.title) ? horario.title : "") ||
      "Cargo asignado";
    const eventDateKey = horario.start
      ? format(horario.start, "yyyy-MM-dd")
      : horario.fecha || "";
    const eventKey =
      eventDateKey && (horario.scheduleId || horario.id)
        ? `${horario.scheduleId || horario.id}::${eventDateKey}`
        : "";
    const hasApiNovedad =
      horario.novedad || (Array.isArray(horario.novedades) && horario.novedades.some(Boolean));
    const showNovedadBadge = hasApiNovedad && eventKey && noveltyKeys.has(eventKey);
    const statusClass =
      horario.estado === "Cancelado"
        ? "bg-red-100 text-red-700"
        : horario.estado === "Completado"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-blue-100 text-blue-700";

    return (
      <div
        ref={ref}
        className="schedule-event-pill"
        style={{
          background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        }}
        title={employeeName || displayRole}
      >
        <div className="schedule-event-pill__left">
          <span className="dot" style={{ backgroundColor: dot }} />
          <div className="schedule-event-pill__content">
            <span className="schedule-event-pill__title">
              {employeeFirstName || displayRole}
            </span>
          </div>
          {showNovedadBadge && (
            <span className="schedule-event-pill__badge" title="Horario con novedad">
              <FaExclamationCircle className="w-3 h-3" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {horario.estado && horario.estado !== "Programado" && (
            <span
              className={`hidden md:inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${statusClass}`}
            >
              {horario.estado}
            </span>
          )}
          <button onClick={handleCogClick} className="schedule-event-pill__action" aria-label="Acciones">
            <FaCog className="w-4 h-4" />
          </button>
        </div>
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


  const popoverRoleColors = popover.horario
    ? getRoleColors(
        popover.horario.cargo ||
          popover.horario.area ||
          popover.horario.role ||
          popover.horario.rol ||
          popover.horario.title
      )
    : ROLE_COLORS.default;

  const popoverStatusClass =
    popover.horario?.estado === "Cancelado"
      ? "bg-red-100 text-red-700"
      : popover.horario?.estado === "Completado"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-blue-100 text-blue-700";
  const popoverNovedades = popover.horario
    ? (Array.isArray(popover.horario.novedades)
        ? popover.horario.novedades
        : [popover.horario.novedad]).filter(Boolean)
    : [];
  /* ============================================================
     🔹 RENDER PRINCIPAL
  ============================================================ */
  return (
    <div ref={calendarRef} className="relative employees-schedule-calendar">
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
      <div className="rounded-2xl border border-gray-200 shadow-lg overflow-hidden bg-white h-[36vh] max-h-[420px] min-h-[320px] calendar-shell">
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
          style={{
            height: "100%",
          }}
          eventPropGetter={() => ({
            style: { border: "none", background: "transparent", padding: "2px 0" },
          })}
          onSelectSlot={(slot) => {
            closePopover();
            onOpenModalForSlot?.({ start: slot.start, end: slot.end });
          }}
          onSelectEvent={(ev) => {
            closePopover();
            onViewEvent?.(ev);
          }}
        />
      </div>

      {/* Popover */}
      {popover.open && popover.horario && (
        <div id="employee-popover" style={popover.style} className="w-[260px]">
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.12 }}
            className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="px-3 py-2">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="text-sm font-medium text-gray-800 flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: popoverRoleColors.dot }}
                  />
                  {popover.horario.empleado || popover.horario.title}
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${popoverStatusClass}`}>
                  {popover.horario.estado || "Programado"}
                </span>
              </div>
              {popoverNovedades.length > 0 && (
                <p className="text-xs text-gray-500 flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-primary-purple" />
                  <span className="font-semibold text-primary-purple">
                    Novedad:
                  </span>
                  <span className="text-gray-600">
                    {popoverNovedades[0]}
                  </span>
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 mb-2 text-[11px] text-gray-600">
                {popover.horario.cargo && (
                  <span
                    className="px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: popoverRoleColors.tagBg,
                      borderColor: popoverRoleColors.dot,
                    }}
                  >
                    {popover.horario.cargo}
                  </span>
                )}
                {popover.horario.area && (
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {popover.horario.area}
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-500 mb-3">
                {format(popover.horario.start, "yyyy-MM-dd HH:mm", { locale: es })} -{" "}
                {format(popover.horario.end, "HH:mm", { locale: es })}
              </div>

              <div className="grid gap-2">
              <button
                onClick={() => {
                  closePopover();
                  onEditEvent?.(popover.horario);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-50"
              >
                <FaEdit className="w-4 h-4 text-green-600" /> Editar horario
              </button>

                <button
                  onClick={() => {
                    closePopover();
                    onViewEvent?.(popover.horario);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-50"
                >
                  <FaEye className="w-4 h-4 text-blue-600" /> Ver detalle
                </button>

                <button
                  onClick={() => {
                    closePopover();
                    onCancelEvent?.(popover.horario);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-50"
                >
                  <FaStickyNote className="w-4 h-4 text-primary-purple" /> Crear novedad
                </button>

                <button
                  onClick={() => {
                    closePopover();
                    onDeleteEvent?.(
                      popover.horario.scheduleId || popover.horario.id
                    );
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
