import React from "react";
import { FaCog, FaUsers, FaMapMarkerAlt } from "react-icons/fa";

/**
 * Componente de evento personalizado para el dashboard administrativo
 * Compatible con el calendario genérico BaseCalendar
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
  const dashboardEvent = event.extendedProps?.dashboardEvent || event;

  // Obtener la inicial del estado
  const getEstadoInicial = () => {
    const estado = event.extendedProps?.estado || event.status;
    if (!estado) return "?";

    const estados = {
      programado: "P",
      "en-curso": "C",
      finalizado: "F",
      cancelado: "X",
      "en-pausa": "E",
      pausado: "E",
    };

    return estados[estado.toLowerCase()] || estado.charAt(0).toUpperCase();
  };

  // Obtener color según estado
  const getEstadoColor = () => {
    const estado = event.extendedProps?.estado || event.status;
    if (!estado) return "#8b5cf6";

    const colores = {
      programado: "#3b82f6",
      "en-curso": "#10b981",
      finalizado: "#9ca3af",
      cancelado: "#ef4444",
      "en-pausa": "#f59e0b",
      pausado: "#f59e0b",
    };

    return colores[estado.toLowerCase()] || "#8b5cf6";
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

  return (
    <div
      className="event-content"
      style={{
        fontSize: isMonthView ? "10px" : "11px",
        lineHeight: "1.2",
        padding: "2px",
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div className="event-info">
        <div className="event-title pl-1">
          <span
            style={{
              display: "inline-block",
              width: "16px",
              height: "16px",
              lineHeight: "16px",
              textAlign: "center",
              borderRadius: "50%",
              backgroundColor: getEstadoColor(),
              color: "white",
              fontSize: "9px",
              fontWeight: "bold",
              marginRight: "4px",
              verticalAlign: "middle",
            }}
          >
            {getEstadoInicial()}
          </span>
          {event?.title || "Sin título"}
        </div>

        {event?.location && !isMonthView && (
          <div
            className="event-location"
            style={{
              fontSize: "9px",
              display: "flex",
              alignItems: "center",
              gap: "2px",
              marginTop: "2px",
            }}
          >
            <FaMapMarkerAlt size={8} /> {event?.location}
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div
        className="event-actions"
        style={{
          position: "absolute",
          top: "2px",
          right: "2px",
          display: "flex",
          gap: "2px",
          opacity: 0,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "0";
        }}
      >
        <button
          onClick={(e) => handleActionClick(e, "crud")}
          className={`event-btn event-btn--manage ${
            isMonthView ? "event-btn--month" : "event-btn--week-day"
          }`}
          title="Gestionar evento"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.9)";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.7)";
            e.currentTarget.style.transform = "scale(1)";
          }}
          style={{
            width: isMonthView ? "16px" : "20px",
            height: isMonthView ? "16px" : "20px",
            borderRadius: "50%",
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: isMonthView ? "8px" : "10px",
            transition: "all 0.2s ease",
          }}
        >
          <FaCog size={isMonthView ? 8 : 10} />
        </button>

        <button
          onClick={(e) => handleActionClick(e, "registration")}
          className={`event-btn event-btn--registration ${
            isMonthView ? "event-btn--month" : "event-btn--week-day"
          }`}
          title="Inscripciones"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.9)";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.7)";
            e.currentTarget.style.transform = "scale(1)";
          }}
          style={{
            width: isMonthView ? "16px" : "20px",
            height: isMonthView ? "16px" : "20px",
            borderRadius: "50%",
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: isMonthView ? "8px" : "10px",
            transition: "all 0.2s ease",
          }}
        >
          <FaUsers size={isMonthView ? 8 : 10} />
        </button>
      </div>
    </div>
  );
};
