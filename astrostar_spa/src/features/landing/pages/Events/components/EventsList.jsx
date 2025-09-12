import { isSameDay, sortEventsByDateTime } from "../../../../../shared/utils/helpers/dateHelpers";

export const EventsList = ({ events, selectedDate }) => {
  // Filtrar eventos usando helper
  const filteredEvents = selectedDate
    ? events.filter((event) => isSameDay(event.date, selectedDate))
    : events.slice(0, 3);

  // Ordenar siempre por fecha y hora
  const orderedEvents = sortEventsByDateTime(filteredEvents);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-xl font-montserrat font-semibold text-gray-800 mb-4">
        {selectedDate
          ? `Eventos del ${formatDate(selectedDate)}`
          : "Próximos Eventos"}
      </h3>

      {orderedEvents.length > 0 ? (
        <div className="space-y-4">
          {orderedEvents.map((event) => (
            <div
              key={event.id}
              id={`event-${event.id}`}
              className="border-l-4 border-[#B595FF] pl-4 py-2"
            >
              <h4 className="font-montserrat font-semibold text-gray-800">
                {event.title}
              </h4>
              <p className="text-sm text-gray-600 font-montserrat">
                {formatDate(event.date)} – {event.time}
              </p>
              <p className="text-sm text-gray-500 font-montserrat mt-1">
                {event.description}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 font-montserrat text-center py-8">
          No hay eventos programados para esta fecha
        </p>
      )}
    </div>
  );
};