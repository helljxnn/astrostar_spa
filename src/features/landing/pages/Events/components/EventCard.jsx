"use client"

import { useRef, useEffect } from "react"

export const EventCard = ({ event, isHighlighted }) => {
  const cardRef = useRef(null)

  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }, [isHighlighted])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // ✅ Corregido: respetamos "cancelado"
  const getEffectiveStatus = () => {
    const today = new Date()
    const eventDate = new Date(event.date)

    if (event.status === "cancelado") {
      return "cancelado"
    }

    if (eventDate < today) {
      return "finalizado"
    }

    return event.status
  }

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
        bg: "bg-gradient-to-r from-red-400 to-white-400", 
        text: "text-white",
        ring: "ring-red-200",
      },
      "en-pausa": {
        label: "En Pausa",
        bg: "bg-gradient-to-r from-[#9be9ff] to-white-200", 
        text: "text-white", // letras blancas[#9be9ff]
        ring: "ring-blue-200",
      },
    }
    return configs[status] || configs.programado
  }

  const effectiveStatus = getEffectiveStatus()
  const statusConfig = getStatusConfig(effectiveStatus)

  return (
    <div
      ref={cardRef}
      id={`event-${event.id}`}
      className={`group relative overflow-hidden rounded-3xl bg-white transition-all duration-700 shadow-lg hover:shadow-2xl ${
        isHighlighted
          ? `ring-8 ${statusConfig.ring} shadow-3xl transform scale-[1.03]`
          : "hover:transform hover:scale-[1.02]"
      }`}
    >
      <div className="relative h-96 overflow-hidden">
        <img
          src={event.image || "/placeholder.svg"}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div
          className={`absolute top-6 right-6 px-6 py-3 rounded-2xl text-base font-bold ${statusConfig.bg} ${statusConfig.text} shadow-lg backdrop-blur-sm`}
        >
          {statusConfig.label}
        </div>
      </div>

      <div className="p-10">
        <h3 className="text-3xl font-bold text-gray-900 mb-6 group-hover:text-[#b595ff] transition-colors leading-tight">
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

        <p className="text-gray-700 leading-relaxed text-lg mb-8 line-height-loose">
          {event.description}
        </p>

        {(effectiveStatus === "programado" || effectiveStatus === "en-pausa") && (
          <button className="w-full bg-gradient-to-r from-[#b595ff] to-[#9be9ff] text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] hover:from-[#a085ef] hover:to-[#8bd9ef]">
            {effectiveStatus === "en-pausa" ? "Evento en Pausa" : "Más Información"}
          </button>
        )}
      </div>
    </div>
  )
}
