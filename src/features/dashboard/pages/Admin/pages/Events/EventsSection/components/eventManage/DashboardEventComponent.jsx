import { FaCog, FaUsers, FaMapMarkerAlt } from "react-icons/fa";

/**
 * Componente de evento personalizado para el dashboard administrativo
 * Compatible con el calendario genérico BaseCalendar variante custom
 */
export const DashboardEventComponent = ({
  event,
  view = "month",
  onActionClick,
}) => {
  // Validación defensiva
  if (!event) {
    return <div>Error: Evento no válido</div>;
  }

  const isMonthView = view === "month";
  const isDayView = view === "day";
  const dashboardEvent = event.extendedProps?.dashboardEvent || event;

  // Obtener color según estado
  const getEstadoColor = () => {
    const estado = event.extendedProps?.estado || event.status;
    if (!estado) return "#B595FF";

    const colores = {
      programado: "#9be9ff",
      "en-curso": "#95FFA7",
      finalizado: "#9ca3af",
      cancelado: "#FC6D6D",
      "en-pausa": "#EDEB85",
      pausado: "#EDEB85",
    };

    return colores[estado.toLowerCase()] || "#B595FF";
  };

  // Obtener color de texto según el fondo
  const getTextColor = () => {
    const estado = event.extendedProps?.estado || event.status;
    if (estado === "en-pausa" || estado === "pausado") {
      return "#374151"; // Texto oscuro para fondo amarillo
    }
    return "#000000"; // Texto negro para otros colores
  };

  const handleActionClick = (e, actionType) => {
    e.stopPropagation();
    e.preventDefault();

    if (!onActionClick) return;

    const target = e.currentTarget;
    if (!target) return;

    // Crear evento sintético con el target guardado
    const syntheticEvent = {
      ...e,
      currentTarget: target,
    };

    onActionClick(syntheticEvent, actionType, dashboardEvent);
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

          {/* Botones de acción para vista de día */}
          <div className="flex gap-1 flex-wrap pt-2 border-t border-gray-100 mt-2">
            <button
              onClick={(e) => handleActionClick(e, "crud")}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors text-[#B595FF] hover:bg-[#9BE9FF] hover:text-white"
            >
              <FaCog className="h-3 w-3" />
              Gestionar
            </button>
            <button
              onClick={(e) => handleActionClick(e, "registration")}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors text-[#B595FF] hover:bg-[#9BE9FF] hover:text-white"
            >
              <FaUsers className="h-3 w-3" />
              Inscripciones
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado para vista de grid (mes/semana) - estilo similar a clases
  return (
    <div
      className="p-1 rounded text-black text-xs cursor-pointer hover:opacity-80 relative group"
      style={{
        backgroundColor: getEstadoColor(),
        color: getTextColor(),
      }}
    >
      <div className="font-medium truncate text-xs leading-tight">
        {event.title}
      </div>
      {event.extendedProps?.ubicacion && !isMonthView && (
        <div className="opacity-90 text-xs leading-tight flex items-center gap-1 mt-0.5">
          <FaMapMarkerAlt size={8} />
          {event.extendedProps.ubicacion}
        </div>
      )}

      {/* Botones de acción - aparecen al hacer hover */}
      <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-0.5">
        <button
          onClick={(e) => handleActionClick(e, "crud")}
          className="w-4 h-4 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          title="Gestionar evento"
        >
          <FaCog size={8} />
        </button>
        <button
          onClick={(e) => handleActionClick(e, "registration")}
          className="w-4 h-4 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          title="Inscripciones"
        >
          <FaUsers size={8} />
        </button>
      </div>
    </div>
  );
};
