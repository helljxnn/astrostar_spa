"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  eventTypes,
  processEventsStatus,
  filterEventsByType,
  getUpcomingEvents,
  getPastEvents,
  getNextEvent,
} from "../../../../../shared/utils/helpers/eventsHelper";
import eventsService from "../services/eventsService.js";

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedEventType, setSelectedEventType] = useState("todos");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const previousNextEventId = useRef(null);
  const previousEventTypeRef = useRef(selectedEventType);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const publishedEvents = await eventsService.getPublishedEvents();
      setEvents(publishedEvents);
    } catch (err) {
      setEvents([]);
      setError(err?.message || "No se pudieron cargar los eventos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const processedEvents = useMemo(() => {
    return processEventsStatus(events);
  }, [events]);

  const filteredEvents = useMemo(() => {
    return filterEventsByType(processedEvents, selectedEventType);
  }, [processedEvents, selectedEventType]);

  const upcomingEvents = useMemo(() => {
    return getUpcomingEvents(filteredEvents);
  }, [filteredEvents]);

  const pastEvents = useMemo(() => {
    return getPastEvents(filteredEvents);
  }, [filteredEvents]);

  const nextEvent = useMemo(() => {
    return getNextEvent(upcomingEvents);
  }, [upcomingEvents]);

  const handleEventTypeChange = useCallback((newType) => {
    setSelectedEventType(newType);
    setSelectedDate(null);
  }, []);

  const handleEventSelect = useCallback((eventId) => {
    setSelectedEventId(eventId);
  }, []);

  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  useEffect(() => {
    const nextEventId = nextEvent?.id || null;

    if (previousNextEventId.current !== nextEventId) {
      setSelectedEventId(nextEventId);
      previousNextEventId.current = nextEventId;
    }
  }, [nextEvent]);

  useEffect(() => {
    if (previousEventTypeRef.current !== selectedEventType) {
      previousEventTypeRef.current = selectedEventType;

      const timeoutId = setTimeout(() => {
        if (nextEvent) {
          setSelectedEventId(nextEvent.id);
        } else {
          setSelectedEventId(null);
          setSelectedDate(null);
        }
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedEventType, nextEvent]);

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
    loading,
    error,
    refresh: loadEvents,
  };
};
