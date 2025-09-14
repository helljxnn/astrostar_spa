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
        if (onEventDeselect) {
          onEventDeselect(null);
        }
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
    <div
      ref={cardRef}
      id={`event-${event.id}`}
      className={`group relative rounded-lg sm:rounded-xl md:rounded-2xl bg-white transition-all duration-700 shadow-md hover:shadow-lg max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto ${
        isHighlighted ? "transform scale-[1.02] z-10" : "hover:transform hover:scale-[1.01] hover:-translate-y-1"
      }`}
      style={{
        zIndex: isHighlighted ? 10 : "auto",
      }}
    >
      {isHighlighted && (
        <div 
          className="absolute inset-0 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden pointer-events-none after:content-[''] after:absolute after:-inset-1 after:rounded-lg sm:after:rounded-xl md:after:rounded-2xl after:blur-md after:animate-pulse" 
          style={{
            background: 'linear-gradient(to right, #b595ff, #9be9ff)',
            zIndex: -1,
            opacity: isHighlighted ? 1 : 0,
            transition: 'opacity 0.7s',
          }}
        />
      )}

      <div className="relative rounded-lg sm:rounded-xl md:rounded-2xl bg-white overflow-hidden">
        <div className="relative h-32 sm:h-40 md:h-48 lg:h-56 rounded-t-lg sm:rounded-t-xl md:rounded-t-2xl overflow-hidden">
          <img
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div
            className={`absolute top-1 right-1 sm:top-2 sm:right-2 md:top-3 md:right-3 px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1.5 rounded sm:rounded-md md:rounded-lg text-xs sm:text-sm font-bold ${statusConfig.bg} ${statusConfig.text} shadow-md backdrop-blur-sm`}
          >
            {statusConfig.label}
          </div>
        </div>

        <div className="relative p-3 sm:p-4 md:p-6">
          <h3
            className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 md:mb-3 transition-colors leading-tight ${
              isHighlighted
                ? "text-[#b595ff]"
                : "text-gray-900 group-hover:text-[#b595ff]"
            }`}
          >
            {event.title}
          </h3>

          <div className="space-y-1 sm:space-y-1.5 md:space-y-2 mb-2 sm:mb-3 md:mb-4">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base text-gray-700">
              <span className="text-sm sm:text-base md:text-lg">📅</span>
              <span className="font-semibold">{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base text-gray-700">
              <span className="text-sm sm:text-base md:text-lg">🕐</span>
              <span className="font-medium">{event.time}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base text-gray-700">
              <span className="text-sm sm:text-base md:text-lg">📍</span>
              <span className="font-medium">{event.location}</span>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed text-xs sm:text-sm md:text-base mb-3 sm:mb-4 md:mb-5 line-clamp-2">
            {event.description}
          </p>
          
          <button
            onClick={() => onViewMore(event)}
            className="w-full bg-gradient-to-r from-[#b595ff] to-[#9be9ff] text-white py-1.5 sm:py-2 md:py-2.5 rounded sm:rounded-lg md:rounded-xl font-bold text-xs sm:text-sm md:text-base hover:shadow-lg transition-all duration-500 transform hover:scale-[1.01] hover:from-[#a085ef] hover:to-[#8bd9ef]"
          >
            Ver más información del Evento
          </button>
        </div>
      </div>
    </div>
  );
};