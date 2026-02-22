import { format } from "date-fns";
import es from "date-fns/locale/es";

const EventCard = ({ event }) => {
  const getColorClasses = (color) => {
    switch (color) {
      case "bg-primary-purple":
        return "bg-purple-100 border-purple-300 text-purple-800";
      case "bg-primary-blue":
        return "bg-blue-100 border-blue-300 text-blue-800";
      case "bg-green-500":
        return "bg-green-100 border-green-300 text-green-800";
      case "bg-orange-500":
        return "bg-orange-100 border-orange-300 text-orange-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  return (
    <div
      className={`relative p-2 mb-1 rounded-lg border-l-4 ${getColorClasses(
        event.color,
      )}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">
              {format(event.start, "HH:mm", { locale: es })}
            </span>
            <span className="text-sm font-medium truncate">{event.title}</span>
          </div>
          {event.ubicacion && (
            <div className="text-xs text-gray-500 truncate mt-1">
              📍 {event.ubicacion}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
