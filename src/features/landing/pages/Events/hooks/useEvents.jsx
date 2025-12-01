  "use client";

  import { useState, useMemo, useEffect, useCallback, useRef } from "react";
  import {
    eventsData,
    eventTypes,
    processEventsStatus,
    filterEventsByType,
    getUpcomingEvents,
    getPastEvents,
    getNextEvent,
  } from "../../../../../shared/utils/helpers/eventsHelper";

  export const useEvents = () => {
    const [selectedEventType, setSelectedEventType] = useState("todos");
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);

    const previousNextEventId = useRef(null);
    const previousEventTypeRef = useRef(selectedEventType);

    // 🔹 Procesar todos los eventos con su estado
    const processedEvents = useMemo(() => {
      return processEventsStatus(eventsData);
    }, []);

    // 🔹 Eventos filtrados por tipo
    const filteredEvents = useMemo(() => {
      return filterEventsByType(processedEvents, selectedEventType);
    }, [processedEvents, selectedEventType]);

    // 🔹 Próximos eventos
    const upcomingEvents = useMemo(() => {
      return getUpcomingEvents(filteredEvents);
    }, [filteredEvents]);

    // 🔹 Eventos pasados
    const pastEvents = useMemo(() => {
      return getPastEvents(filteredEvents);
    }, [filteredEvents]);

    // 🔹 Próximo evento
    const nextEvent = useMemo(() => {
      return getNextEvent(upcomingEvents);
    }, [upcomingEvents]);

    // 🔹 Cambiar tipo de evento
    const handleEventTypeChange = useCallback((newType) => {
      setSelectedEventType(newType);
      setSelectedDate(null);
    }, []);

    // 🔹 Selección de evento
    const handleEventSelect = useCallback((eventId) => {
      setSelectedEventId(eventId);
    }, []);

    // 🔹 Selección de fecha
    const handleDateSelect = useCallback((date) => {
      setSelectedDate(date);
    }, []);

    // 🔹 Mantener actualizado el evento seleccionado según nextEvent
    useEffect(() => {
      const nextEventId = nextEvent?.id || null;

      if (previousNextEventId.current !== nextEventId) {
        setSelectedEventId(nextEventId);
        previousNextEventId.current = nextEventId;

        if (nextEvent) {
          try {
            setSelectedDate(new Date(nextEvent.date));
          } catch (error) {
            // Error parseando fecha
          }
        }
      }
    }, [nextEvent]);

    // 🔹 Reset al cambiar tipo de evento
    useEffect(() => {
      if (previousEventTypeRef.current !== selectedEventType) {
        previousEventTypeRef.current = selectedEventType;

        const timeoutId = setTimeout(() => {
          if (nextEvent) {
            setSelectedEventId(nextEvent.id);
            try {
              setSelectedDate(new Date(nextEvent.date));
            } catch (error) {
              // Error parseando fecha
            }
          } else {
            setSelectedEventId(null);
            setSelectedDate(null);
          }
        }, 50);

        return () => clearTimeout(timeoutId);
      }
    }, [selectedEventType, nextEvent]);

    // 🔹 Evento seleccionado global
    const selectedEvent = useMemo(() => {
      if (!selectedEventId) return null;
      return processedEvents.find((event) => event.id === selectedEventId) || null;
    }, [selectedEventId, processedEvents]);

    return {
      eventTypes,
      selectedEventType,
      setSelectedEventType: handleEventTypeChange,
      upcomingEvents,
      pastEvents,
      nextEvent,
      allEvents: processedEvents, 
      filteredEvents,
      selectedEvent,
      selectedEventId,
      setSelectedEventId: handleEventSelect,
      selectedDate,
      setSelectedDate: handleDateSelect,
    };
  };
