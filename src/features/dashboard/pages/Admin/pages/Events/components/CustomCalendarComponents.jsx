import React from "react";
import { format } from "date-fns";
import es from "date-fns/locale/es";
import NotionEventComponent from "./NotionEventComponent";

// Componente personalizado para el mes
export const CustomMonthEvent = ({ event, onActionClick }) => {
  return (
    <NotionEventComponent event={event} onActionClick={onActionClick} />
  );
};

// Componente personalizado para las celdas de fecha
export const CustomDateCellWrapper = ({ children, value, onShowMore }) => {
  return (
    <div className="rbc-date-cell">
      {children}
    </div>
  );
};

// Componente personalizado para mostrar eventos en una celda
export const CustomEventWrapper = ({ event, onActionClick }) => {
  return (
    <div className="rbc-event-wrapper">
      <NotionEventComponent event={event} onActionClick={onActionClick} />
    </div>
  );
};

// Componente para mostrar "Ver más" cuando hay muchos eventos
export const ShowMoreComponent = ({ count, onShowMore }) => {
  return (
    <button
      onClick={onShowMore}
      className="w-full text-left px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
    >
      + {count} más evento{count !== 1 ? "s" : ""}
    </button>
  );
};