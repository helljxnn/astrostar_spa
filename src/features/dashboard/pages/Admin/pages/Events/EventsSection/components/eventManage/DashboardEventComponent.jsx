import { FaMapMarkerAlt } from "react-icons/fa";
import { format } from "date-fns";
import { getEventsModuleColor } from "../../adapters/eventsColorAdapter";

/**
 * Componente de evento personalizado para el dashboard administrativo de EVENTOS
 * Compatible con el calendario genérico BaseCalendar variante custom
 * ESPECÍFICO DEL MÓDULO DE EVENTOS
 */
export const DashboardEventComponent = ({ event, view = "month" }) => {
  // Validación defensiva
  if (!event) {
    return <div>Error: Evento no válido</div>;
  }

  const isMonthView = view === "month";
  const isDayView = view === "day";

  // Obtener color usando el adaptador específico del módulo de eventos
  const getEstadoColor = () => {
    const tipo = event.extendedProps?.tipo || event.type;
    const estado = event.extendedProps?.estado || event.status;

    return getEventsModuleColor(estado, tipo);
  };

  // Obtener color de texto según el fondo
  const getTextColor = () => {
    return "#000000"; // Texto negro para todos los colores
  };

  // Renderizado para vista de día (más detallado)
  if (isDayView) {
    return (
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getEstadoColor() }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="text-sm font-medium text-gray-900 mb-2">
            {event.title}
          </h5>
          <div className="space-y-1">
            {event.extendedProps?.ubicacion && (
              <div className="flex items-center text-xs text-gray-600">
                <FaMapMarkerAlt className="w-3 h-3 mr-2" />
                {event.extendedProps.ubicacion}
              </div>
            )}
            {event.extendedProps?.tipo && (
              <div className="text-xs text-gray-600">
                <span className="font-medium">Tipo:</span>{" "}
                {event.extendedProps.tipo}
              </div>
            )}
            {event.extendedProps?.categoria && (
              <div className="text-xs text-gray-600">
                <span className="font-medium">Categoría:</span>{" "}
                {event.extendedProps.categoria}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Renderizado para vista de grid (mes/semana) - estilo similar a clases
  return (
    <div
      className={`p-1 rounded text-black text-xs relative group ${
        event.isMultiDay ? "border-l-4" : ""
      }`}
      style={{
        backgroundColor: getEstadoColor(),
        color: getTextColor(),
        borderLeftColor: event.isMultiDay ? getEstadoColor() : undefined,
        pointerEvents: "auto",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div className="font-medium truncate text-xs leading-tight">
        {event.title}
      </div>

      {/* Show location only if not multi-day or if it's the first day */}
      {event.extendedProps?.ubicacion &&
        !isMonthView &&
        (!event.isMultiDay || event.isFirstDay) && (
          <div className="opacity-90 text-xs leading-tight flex items-center gap-1 mt-0.5">
            <FaMapMarkerAlt size={8} />
            {event.extendedProps.ubicacion}
          </div>
        )}

      {/* Multi-day duration info - only show on first day */}
      {event.isMultiDay && event.isFirstDay && (
        <div className="opacity-75 text-xs leading-tight mt-0.5">
          {format(event.multiDayStart, "dd/MM")} -{" "}
          {format(event.multiDayEnd, "dd/MM")}
        </div>
      )}
    </div>
  );
};
