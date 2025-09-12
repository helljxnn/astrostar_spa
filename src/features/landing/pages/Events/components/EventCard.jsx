import { useRef, useEffect } from "react";

export const EventCard = ({ event, isHighlighted, onViewMore, onEventDeselect }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      cardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });

      const highlightTimeoutId = setTimeout(() => {
        onEventDeselect(null);
      }, 2500);

      return () => clearTimeout(highlightTimeoutId);
    }
  }, [isHighlighted, event.id, onEventDeselect]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("❌ Error formateando fecha:", dateString, error);
      return dateString;
    }
  };

  const getEffectiveStatus = () => {
    const today = new Date();
    let eventDate;
    try {
      eventDate = new Date(event.date);
    } catch (error) {
      console.error("❌ Error parseando fecha del evento:", event.date, error);
      return event.status || "programado";
    }
    if (event.status === "cancelado") {
      return "cancelado";
    }
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    if (eventDateOnly < todayDate) {
      return "finalizado";
    }
    return event.status || "programado";
  };

  const getStatusConfig = (status) => {
    const configs = {
      programado: {
        label: "Programado",
        bg: "bg-gradient-to-r from-[#9be9ff] to-[#b595ff]",
        text: "text-white",
        ring: "ring-[#9be9ff]",
      },
      finalizado: {
        label: "Finalizado",
        bg: "bg-gradient-to-r from-gray-400 to-gray-300",
        text: "text-white",
        ring: "ring-gray-300",
      },
      cancelado: {
        label: "Cancelado",
        bg: "bg-gradient-to-r from-red-400 to-red-300",
        text: "text-white",
        ring: "ring-red-200",
      },
      "en-pausa": {
        label: "En Pausa",
        bg: "bg-gradient-to-r from-[#9be9ff] to-blue-200",
        text: "text-white",
        ring: "ring-blue-200",
      },
    };
    return configs[status] || configs.programado;
  };

  const effectiveStatus = getEffectiveStatus();
  const statusConfig = getStatusConfig(effectiveStatus);

  if (process.env.NODE_ENV === "development" && isHighlighted) {
    console.log("🎯 EventCard renderizado con highlight:", {
      eventId: event.id,
      title: event.title,
      isHighlighted,
    });
  }

  return (
    // ✅ CAMBIO 1: El contenedor principal maneja el 'relative' y el 'group'.
    <div
      ref={cardRef}
      id={`event-${event.id}`}
      className={`group relative rounded-3xl bg-white transition-all duration-700 shadow-lg hover:shadow-2xl ${
        isHighlighted ? "transform scale-[1.03] z-10" : "hover:transform hover:scale-[1.02] hover:-translate-y-1"
      }`}
      style={{
        zIndex: isHighlighted ? 10 : "auto",
      }}
    >
      {/* ✅ CAMBIO 2: Pseudo-elemento para el pulso y el borde. */}
      {/* Este div crea el efecto de pulso y borde.
        Tiene una opacidad inicial de 0.
        Cuando isHighlighted es true, la opacidad cambia a 1.
        Las clases de 'after' crean el pseudo-elemento que es el borde brillante.
        El borde pulsante se consigue con 'animate-pulse' en el after.
      */}
      {isHighlighted && (
        <div 
          className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none after:content-[''] after:absolute after:-inset-2 after:rounded-3xl after:blur-lg after:animate-pulse" 
          style={{
            background: 'linear-gradient(to right, #b595ff, #9be9ff)',
            zIndex: -1,
            opacity: isHighlighted ? 1 : 0,
            transition: 'opacity 0.7s',
          }}
        />
      )}

      {/* ✅ CAMBIO 3: Contenedor para el contenido de la tarjeta */}
      <div className="relative rounded-3xl bg-white overflow-hidden">
        <div className="relative h-96 rounded-t-3xl overflow-hidden">
          <img
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div
            className={`absolute top-6 right-6 px-6 py-3 rounded-2xl text-base font-bold ${statusConfig.bg} ${statusConfig.text} shadow-lg backdrop-blur-sm`}
          >
            {statusConfig.label}
          </div>
        </div>

        <div className="relative p-10">
          <h3
            className={`text-3xl font-bold mb-6 transition-colors leading-tight ${
              isHighlighted
                ? "text-[#b595ff]"
                : "text-gray-900 group-hover:text-[#b595ff]"
            }`}
          >
            {event.title}
          </h3>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4 text-lg text-gray-700">
              <span className="text-2xl">📅</span>
              <span className="font-semibold">{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-4 text-lg text-gray-700">
              <span className="text-2xl">🕐</span>
              <span className="font-medium">{event.time}</span>
            </div>
            <div className="flex items-center gap-4 text-lg text-gray-700">
              <span className="text-2xl">📍</span>
              <span className="font-medium">{event.location}</span>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed text-lg mb-8">
            {event.description}
          </p>
          <button
            onClick={() => onViewMore(event)}
            className="w-full bg-gradient-to-r from-[#b595ff] to-[#9be9ff] text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] hover:from-[#a085ef] hover:to-[#8bd9ef]"
          >
            Ver más información del Evento
          </button>
        </div>
      </div>
    </div>
  );
};