"use client";

import { useState } from "react";
import { Hero } from "../../components/Hero.jsx";
import { Calendar } from "./components/Calendar.jsx";
import { EventsList } from "./components/EventsList.jsx";
import { EventSelector } from "./components/EventsSelector.jsx";
import { EventsSection } from "./components/EventSection.jsx";
import { CountdownTimer } from "./components/CountDownTimer.jsx";
import { useEvents } from "./hooks/useEvents.jsx";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../../../../shared/utils/Alerts.js";
import {
  combineDateAndTime,
  isSameDay,
  sortEventsByDateTime,
} from "../../../../shared/utils/helpers/dateHelpers.js";

export const Events = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [highlightedEventId, setHighlightedEventId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const {
    eventTypes,
    selectedEventType,
    setSelectedEventType,
    upcomingEvents,
    pastEvents,
    nextEvent,
    allEvents,
  } = useEvents();

  // Encontrar el evento seleccionado
  const selectedEvent = selectedEventId
    ? allEvents.find((event) => event.id === selectedEventId)
    : null;

  const handleEventSelect = (eventId) => {
    setSelectedEventId(eventId);
    setHighlightedEventId(eventId);
    setTimeout(() => setHighlightedEventId(null), 3000);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const eventsOnDate = allEvents.filter((event) =>
      isSameDay(event.date, date)
    );
    if (eventsOnDate.length === 0) {
      setSelectedEventId(null);
    } else {
      // Si hay eventos, selecciona el primero
      setSelectedEventId(eventsOnDate[0].id);
    }
  };

  const orderedUpcoming = sortEventsByDateTime(upcomingEvents);
  const orderedPast = sortEventsByDateTime(pastEvents);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero */}
      <Hero
        variant="background"
        title="Eventos"
        subtitle=" Nuestros eventos son el corazón de la Fundación, 
        donde celebramos la pasión por el fútbol femenino. Organizamos 
        torneos emocionantes,  y encuentros inspiradores para nuestras jugadoras 
        y la comunidad. Estos espacios buscan desarrollar su talento, fomentar
         la unión y promover los valores del deporte. ¡Consulta nuestro calendario
          y únete a la celebración del fútbol femenino!"
        imageUrl="/assets/images/EventsHero.jpg" // ✅ corregido
      />

      <div className="max-w-7xl mx-auto px-8 py-24">
        {/* Calendario + Timer */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-montserrat font-bold bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] bg-clip-text text-transparent mb-6">
              Calendario de Eventos
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <Calendar
              events={allEvents}
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
              onEventSelect={handleEventSelect}
              nextEvent={nextEvent}
            />
            <div className="flex justify-center">
              <CountdownTimer
                selectedEvent={selectedDate ? selectedEvent : nextEvent}
                selectedDate={selectedDate}
              />
            </div>
          </div>
        </div>

        {/* Selector de tipos */}
        <EventSelector
          eventTypes={eventTypes}
          selectedType={selectedEventType}
          onTypeSelect={setSelectedEventType}
        />

        {/* Sección de eventos */}
        <EventsSection
          upcomingEvents={orderedUpcoming}
          pastEvents={orderedPast}
          highlightedEventId={highlightedEventId}
        />
      </div>

      {/* Botones de prueba */}
      {process.env.NODE_ENV === "development" && (
        <section className="py-12">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() =>
                showSuccessAlert("Éxito", "La operación fue exitosa 🥳")
              }
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Probar Éxito
            </button>

            <button
              onClick={() => showErrorAlert("Error", "Algo salió mal 😢")}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Probar Error
            </button>

            <button
              onClick={() =>
                showConfirmAlert(
                  "¿Estás seguro?",
                  "Esta acción no se puede deshacer 🤔"
                )
              }
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Probar Confirmación
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
