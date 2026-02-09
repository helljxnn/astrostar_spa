import { FaCog, FaUsers, FaMapMarkerAlt } from "react-icons/fa";
import { format } from "date-fns";
import { getEventsModuleColor } from "../../adapters/eventsColorAdapter";

/**
 * Componente de evento personalizado para el dashboard administrativo de EVENTOS
 * Compatible con el calendario genérico BaseCalendar variante custom
 * ESPECÍFICO DEL MÓDULO DE EVENTOS
 */
export const DashboardEventComponent = ({
  event,
  view = "month",
  onActionClick,
  setActionModal,
  setRegistrationModal,
}) => {
  // Validación defensiva
  if (!event) {
    return <div>Error: Evento no válido</div>;
  }

  const isMonthView = view === "month";
  const isDayView = view === "day";
  const dashboardEvent = event.extendedProps?.dashboardEvent || event;

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

  const handleActionClick = (e, actionType) => {
    // Calcular posición del botón
    let position = { top: 100, left: 100 }; // Posición por defecto

    try {
      const target = e.currentTarget || e.target;
      if (target && target.getBoundingClientRect) {
        const rect = target.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const modalWidth = 220;
        const modalHeight = 150;

        // Posición predeterminada (abajo del botón)
        let top = rect.bottom + 5;
        let left = rect.left;

        // Ajustar posición para evitar que se corte
        if (left + modalWidth > viewportWidth) {
          left = rect.right - modalWidth;
        }

        if (top + modalHeight > viewportHeight) {
          top = rect.top - modalHeight - 5;
        }

        if (left < 10) left = 10;
        if (top < 10) top = rect.bottom + 5;

        position = { top, left };
      }
    } catch (error) {
      console.error("Error calculating position:", error);
    }

    // Usar los setters directos
    if (setActionModal && setRegistrationModal) {
      if (actionType === "crud") {
        setActionModal({
          isOpen: true,
          position,
          event: dashboardEvent,
        });
      } else if (actionType === "registration") {
        setRegistrationModal({
          isOpen: true,
          position,
          event: dashboardEvent,
        });
      }
      return;
    }

    // Fallback a onActionClick
    if (onActionClick) {
      onActionClick(e, actionType, dashboardEvent);
    }
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
          <div
            className="flex gap-1 flex-wrap pt-2 border-t border-gray-100 mt-2"
            style={{
              pointerEvents: "auto",
              zIndex: 999,
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                handleActionClick(e, "crud");
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors text-[#B595FF] hover:bg-[#9BE9FF] hover:text-white"
              style={{
                pointerEvents: "auto",
                zIndex: 1000,
                position: "relative",
                cursor: "pointer",
              }}
            >
              <FaCog className="h-3 w-3" />
              Gestionar
            </button>
            <button
              type="button"
              onClick={(e) => {
                handleActionClick(e, "registration");
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors text-[#B595FF] hover:bg-[#9BE9FF] hover:text-white"
              style={{
                pointerEvents: "auto",
                zIndex: 1000,
                position: "relative",
                cursor: "pointer",
              }}
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

      {/* Botones de acción - mostrar en todos los días del evento */}
      <div
        className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-0.5"
        style={{
          pointerEvents: "auto",
          zIndex: 100,
          position: "absolute",
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleActionClick(e, "crud");
          }}
          className="w-4 h-4 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          title="Gestionar evento"
          style={{
            pointerEvents: "auto",
            zIndex: 101,
            position: "relative",
            cursor: "pointer",
          }}
        >
          <FaCog size={8} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleActionClick(e, "registration");
          }}
          className="w-4 h-4 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          title="Inscripciones"
          style={{
            pointerEvents: "auto",
            zIndex: 101,
            position: "relative",
            cursor: "pointer",
          }}
        >
          <FaUsers size={8} />
        </button>
      </div>
    </div>
  );
};
