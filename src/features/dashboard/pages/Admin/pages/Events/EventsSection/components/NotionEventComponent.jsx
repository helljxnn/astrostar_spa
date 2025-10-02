import React from "react";
import { format } from "date-fns";
import es from "date-fns/locale/es";
import { FaCog, FaUserPlus } from "react-icons/fa";

const NotionEventComponent = ({ event, onActionClick }) => {
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

  const handleActionClick = (e, actionType) => {
    e.stopPropagation();
    onActionClick(e, actionType, event);
  };

  return (
    <div
      className={`group relative p-2 mb-1 rounded-lg border-l-4 cursor-pointer hover:shadow-sm transition-all duration-200 ${getColorClasses(
        event.color
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

        {/* Botones de acción - solo visibles en hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => handleActionClick(e, "crud")}
            className="p-1 hover:bg-white/50 rounded transition-colors"
            title="Gestionar evento"
          >
            <FaCog className="w-3 h-3 text-gray-600" />
          </button>
          <button
            onClick={(e) => handleActionClick(e, "registration")}
            className="p-1 hover:bg-white/50 rounded transition-colors"
            title="Inscripciones"
          >
            <FaUserPlus className="w-3 h-3 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotionEventComponent;
