"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Hero } from "../../components/Hero.jsx";
import { Calendar } from "./components/Calendar.jsx";
import { EventSelector } from "./components/EventsSelector.jsx";
import { EventsSection } from "./components/EventSection.jsx";
import { CountdownTimer } from "./components/CountDownTimer.jsx";
import { useEvents } from "./hooks/useEvents.jsx";
import {
  isSameDay,
  sortEventsByDateTime,
} from "../../../../shared/utils/helpers/dateHelpers.js";

import { EventCard } from "./components/EventCard.jsx";
import { EventModal } from "./components/EventModal.jsx";

export const Events = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [highlightedEventId, setHighlightedEventId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEvent, setModalEvent] = useState(null);

  const {
    eventTypes,
    selectedEventType,
    setSelectedEventType,
    upcomingEvents,
    pastEvents,
    nextEvent,
    allEvents,
  } = useEvents();

  const selectedEvent = selectedEventId
    ? allEvents.find((event) => event.id === selectedEventId)
    : null;

  const handleEventSelect = (eventId) => {
    console.log("handleEventSelect - eventId:", eventId);
    setSelectedEventId(eventId);
    setHighlightedEventId(eventId);
    setTimeout(() => {
      console.log("Reseteando highlightedEventId");
      setHighlightedEventId(null);
    }, 5000); // Duración de resaltado: 5 segundos
  };

  const handleDateSelect = (date) => {
    console.log("handleDateSelect - date:", date);
    setSelectedDate(date);

    // 🔹 Buscar todos los eventos para la fecha, sin importar el tipo
    const eventsOnDate = allEvents.filter((event) =>
      isSameDay(event.date, date)
    );

    console.log("Eventos en la fecha:", eventsOnDate);
    if (eventsOnDate.length > 0) {
      const sortedEvents = sortEventsByDateTime(eventsOnDate);
      const targetEvent = sortedEvents[0];

      // 🔹 Cambiar el tipo de evento seleccionado en el selector
      //    para asegurar que el evento de destino sea visible
      setSelectedEventType(targetEvent.type);

      const targetEventId = targetEvent.id;
      setSelectedEventId(targetEventId);
      setHighlightedEventId(targetEventId);
      console.log("Evento seleccionado en la fecha:", targetEventId);

      // El scroll se activa desde Calendar.jsx
      setTimeout(() => {
        console.log("Reseteando highlightedEventId");
        setHighlightedEventId(null);
      }, 5000); // Duración de resaltado: 5 segundos
    } else {
      setSelectedEventId(null);
      setHighlightedEventId(null);
      console.log("No hay eventos en la fecha, limpiando selección");
    }
  };

  const orderedUpcoming = sortEventsByDateTime(upcomingEvents);
  const orderedPast = sortEventsByDateTime(pastEvents);

  //  función para abrir el modal
  const handleViewMore = (event) => {
    setModalEvent(event);
    setIsModalOpen(true);
  };

  // función para cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalEvent(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Hero
        variant="background"
        title="Eventos"
        subtitle="Nuestros eventos son el corazón de la Fundación, donde celebramos la pasión por el fútbol femenino. Organizamos torneos emocionantes y encuentros inspiradores para nuestras jugadoras y la comunidad. ¡Consulta nuestro calendario y únete a la celebración del fútbol femenino!"
        imageUrl="/assets/images/EventsHero.jpg"
      />

      <div className="max-w-7xl mx-auto px-8 py-24">
        {/* Título principal */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, margin: "-300px 0px" }}
        >
          <h2 className="text-5xl font-montserrat font-bold bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] bg-clip-text text-transparent mb-6">
            Calendario de Eventos
          </h2>
        </motion.div>

        {/* Calendario + Countdown */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-300px 0px" }}
        >
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
        </motion.div>

        <div className="my-40"></div>

        {/* Selector de tipos */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-300px 0px" }}
          className="mb-16"
        >
          <EventSelector
            eventTypes={eventTypes}
            selectedType={selectedEventType}
            onTypeSelect={setSelectedEventType}
          />
        </motion.div>

        {/* Sección de eventos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true, margin: "-300px 0px" }}
        >
          {/* Pasa la nueva prop 'onViewMore' al componente EventsSection */}
          <EventsSection
            upcomingEvents={orderedUpcoming}
            pastEvents={orderedPast}
            highlightedEventId={highlightedEventId}
            onViewMore={handleViewMore}
          />
        </motion.div>
      </div>

      
      {/* Código del modal */}
      {isModalOpen && modalEvent && (
        <EventModal event={modalEvent} onClose={closeModal} />
      )}
    </div>
  );
};
