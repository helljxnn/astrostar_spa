// src/pages/Events/components/PastEvents.jsx
import { EventCard } from "./EventCard";

const EventsGrid = ({ events, isPast, onEventClick, emptyMessage }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-2xl font-semibold text-gray-600 mb-2">No hay eventos programados</h3>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {events.map(event => (
        <EventCard 
          key={event.id}
          event={event}
          isPast={isPast}
          onEventClick={onEventClick}
        />
      ))}
    </div>
  );
};

export const PastEvents = ({ events, eventTypeLabel, onEventClick }) => {
  if (!events || events.length === 0) return null;

  return (
    <div className="mt-16">
      <h3 className="text-3xl font-semibold mb-12 text-gray-700 font-questrial">
        📜 {eventTypeLabel} Anteriores
      </h3>
      <div className="max-w-[85rem] mx-auto">
        <EventsGrid 
          events={events}
          isPast={true}
          onEventClick={onEventClick}
          emptyMessage={`No hay ${eventTypeLabel?.toLowerCase()} anteriores registrados`}
        />
      </div>
    </div>
  );
};