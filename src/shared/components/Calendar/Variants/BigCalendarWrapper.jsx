import React, { useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import LoadingSpinner from "../../LoadingSpinner";

// Configure moment for Spanish
moment.locale("es");
const localizer = momentLocalizer(moment);

const BigCalendarWrapper = ({
  events = [],
  view = "month",
  date = new Date(),
  onView,
  onNavigate,
  onSelectEvent,
  onSelectSlot,
  renderEvent,
  loading = false,
  colorScheme,
  eventPropGetter,
  ...props
}) => {
  // Spanish messages for react-big-calendar
  const messages = {
    allDay: "Todo el día",
    previous: "Anterior",
    next: "Siguiente",
    today: "Hoy",
    month: "Mes",
    week: "Semana",
    day: "Día",
    agenda: "Agenda",
    date: "Fecha",
    time: "Hora",
    event: "Evento",
    noEventsInRange: "No hay eventos en este rango.",
    showMore: (total) => `+ Ver más (${total})`,
  };

  // Transform events for react-big-calendar
  const calendarEvents = useMemo(() => {
    return events.map((event) => ({
      ...event,
      start: new Date(event.start || event.date),
      end: new Date(event.end || event.endDate || event.date),
      title: event.title || event.name || "Sin título",
    }));
  }, [events]);

  // Default event prop getter
  const defaultEventPropGetter = (event) => {
    const style = {
      backgroundColor: "#B595FF",
      borderRadius: "6px",
      color: "white",
      border: "0px",
      display: "block",
    };

    // Apply status-based colors
    if (event.status) {
      switch (event.status) {
        case "programado":
          style.backgroundColor = "#9be9ff";
          break;
        case "en-curso":
          style.backgroundColor = "#95FFA7";
          break;
        case "finalizado":
          style.backgroundColor = "#9ca3af";
          break;
        case "cancelado":
          style.backgroundColor = "#FC6D6D";
          break;
        default:
          style.backgroundColor = "#B595FF";
      }
    }

    return { style };
  };

  // Custom event component
  const EventComponent = ({ event }) => {
    if (renderEvent) {
      return renderEvent({ event, view });
    }

    return (
      <div className="p-1">
        <div className="font-medium text-xs truncate">{event.title}</div>
        {event.time && <div className="text-xs opacity-75">{event.time}</div>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-xl border border-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="h-96 lg:h-[500px]">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          view={view}
          date={date}
          onView={onView}
          onNavigate={onNavigate}
          onSelectEvent={onSelectEvent}
          onSelectSlot={onSelectSlot}
          selectable={!!onSelectSlot}
          messages={messages}
          eventPropGetter={eventPropGetter || defaultEventPropGetter}
          components={{
            event: EventComponent,
          }}
          formats={{
            dayFormat: "DD",
            dayHeaderFormat: "dddd DD/MM",
            monthHeaderFormat: "MMMM YYYY",
            dayRangeHeaderFormat: ({ start, end }) =>
              `${moment(start).format("DD MMM")} - ${moment(end).format(
                "DD MMM YYYY"
              )}`,
            timeGutterFormat: "HH:mm",
            eventTimeRangeFormat: ({ start, end }) =>
              `${moment(start).format("HH:mm")} - ${moment(end).format(
                "HH:mm"
              )}`,
          }}
          culture="es"
          {...props}
        />
      </div>
    </div>
  );
};

export default BigCalendarWrapper;
