import { EventCard } from "./EventCard"

export const EventsSection = ({ upcomingEvents, pastEvents, highlightedEventId }) => {
  return (
    <div className="space-y-32" data-section="events">
      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="mt-40">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-montserrat font-bold bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] bg-clip-text text-transparent mb-4">
              Próximos Eventos
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] mx-auto rounded-full"></div>
          </div>
          <div className="grid gap-16 md:gap-20">
            {upcomingEvents.map((event) => (
              <div key={event.id} id={`event-${event.id}`}>
                <EventCard event={event} isHighlighted={highlightedEventId === event.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div className="pt-16 border-t-2 border-gray-100">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-montserrat font-bold text-gray-600 mb-4">Eventos Anteriores</h2>
            <div className="w-32 h-1 bg-gray-300 mx-auto rounded-full"></div>
          </div>
          <div className="grid gap-16 md:gap-20">
            {pastEvents.map((event) => (
              <div key={event.id} id={`event-${event.id}`}>
                <EventCard event={event} isHighlighted={false} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
