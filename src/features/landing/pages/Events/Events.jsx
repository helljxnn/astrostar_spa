"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Hero } from "../../components/Hero.jsx";
import { Calendar } from "./components/Calendar.jsx";
import { EventSelector } from "./components/EventsSelector.jsx";
import { EventsSection } from "./components/EventSection.jsx";
import { CountdownTimer } from "./components/CountdownTimer.jsx";
import { useEvents } from "./hooks/useEvents.jsx";
import {
  isSameDay,
  sortEventsByDateTime,
} from "../../../../shared/utils/helpers/dateHelpers.js";
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
    loading,
    error,
  } = useEvents();

  const selectedEvent = selectedEventId
    ? allEvents.find((event) => event.id === selectedEventId)
    : null;

  const handleEventSelect = (eventId) => {
    setSelectedEventId(eventId);
    setHighlightedEventId(eventId);

    setTimeout(() => {
      setHighlightedEventId(null);
    }, 5000);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);

    const eventsOnDate = allEvents.filter((event) => {
      return isSameDay(
        new Date(event.date),
        date,
        event.endDate ? new Date(event.endDate) : null,
      );
    });

    if (eventsOnDate.length > 0) {
      const sortedEvents = sortEventsByDateTime(eventsOnDate);
      const targetEvent = sortedEvents[0];
      const targetEventId = targetEvent.id;

      setHighlightedEventId(null);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setHighlightedEventId(targetEventId);
          setSelectedEventId(targetEventId);
          setSelectedEventType(targetEvent.type);
        });
      });
    } else {
      setSelectedEventId(null);
      setHighlightedEventId(null);
    }
  };

  const orderedUpcoming = sortEventsByDateTime(upcomingEvents);
  const orderedPast = sortEventsByDateTime(pastEvents);

  const handleViewMore = (event) => {
    setModalEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalEvent(null);
  };

  const handleHighlightComplete = () => {
    setHighlightedEventId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Hero variant="image-only" imageUrl="/assets/images/EventsHero.webp" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
        <motion.div
          className="text-center mb-6 sm:mb-8 md:mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, margin: "-300px 0px" }}
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-montserrat font-bold bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] bg-clip-text text-transparent mb-3 sm:mb-4">
            Calendario de Eventos
          </h2>

          {loading && (
            <p className="text-sm text-gray-500">Cargando eventos...</p>
          )}

          {!loading && error && (
            <p className="text-sm text-red-500">No se pudieron cargar los eventos.</p>
          )}
        </motion.div>

        <motion.div
          className="mb-8 sm:mb-10 md:mb-12"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-300px 0px" }}
        >
          <div className="flex flex-col md:grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center">
            <Calendar
              events={allEvents}
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
              onEventSelect={handleEventSelect}
              nextEvent={nextEvent}
            />
            <div className="flex justify-center w-full">
              <CountdownTimer
                selectedEvent={selectedDate ? selectedEvent : nextEvent}
                selectedDate={selectedDate}
              />
            </div>
          </div>
        </motion.div>

        <div className="my-8 sm:my-10 md:my-12"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-300px 0px" }}
          className="mb-8 sm:mb-10 md:mb-12"
        >
          <EventSelector
            eventTypes={eventTypes}
            selectedType={selectedEventType}
            onTypeSelect={setSelectedEventType}
            nextEvent={nextEvent}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true, margin: "-300px 0px" }}
        >
          <EventsSection
            upcomingEvents={orderedUpcoming}
            pastEvents={orderedPast}
            highlightedEventId={highlightedEventId}
            onViewMore={handleViewMore}
            onHighlightComplete={handleHighlightComplete}
          />
        </motion.div>
      </div>

      {isModalOpen && modalEvent && (
        <EventModal event={modalEvent} onClose={closeModal} />
      )}
    </div>
  );
};
