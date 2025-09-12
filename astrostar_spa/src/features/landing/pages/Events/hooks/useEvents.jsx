"use client";

import { useState, useMemo } from "react";
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
  const [selectedEventId, setSelectedEventId] = useState(null); // Nuevo estado

  // 🔹 Procesar estados dinámicamente
  const processedEvents = useMemo(() => {
    return processEventsStatus(eventsData);
  }, []);

  // 🔹 Filtrar por tipo
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

  // 🔹 Próximo evento programado
  const nextEvent = useMemo(() => {
    return getNextEvent(upcomingEvents);
  }, [upcomingEvents]);

  // 🔹 Evento seleccionado
  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return processedEvents.find((event) => event.id === selectedEventId) || null;
  }, [selectedEventId, processedEvents]);

  return {
    eventTypes,
    selectedEventType,
    setSelectedEventType,
    upcomingEvents,
    pastEvents,
    nextEvent,
    allEvents: processedEvents,
    selectedEvent, // Nuevo
    setSelectedEventId, // Nuevo
  };
};