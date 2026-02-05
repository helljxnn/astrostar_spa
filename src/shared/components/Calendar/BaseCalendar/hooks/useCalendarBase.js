import { useMemo } from "react";

export const useCalendarBase = ({
  events = [],
  searchTerm = "",
  searchFields = ["title", "description"],
  selectedFilters = {},
  filters = [],
}) => {
  // Search functionality
  const searchEvents = useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) return events;

    const term = searchTerm.toLowerCase().trim();

    return events.filter((event) => {
      if (!event) return false;

      return searchFields.some((field) => {
        const value = event[field] || event.extendedProps?.[field];
        if (typeof value === "string") {
          return value.toLowerCase().includes(term);
        }
        return false;
      });
    });
  }, [events, searchTerm, searchFields]);

  // Filter functionality
  const filteredEvents = useMemo(() => {
    let filtered = searchEvents;

    if (!selectedFilters || !filters) return filtered;

    // Apply each filter
    Object.entries(selectedFilters).forEach(([filterId, filterValue]) => {
      if (!filterValue || filterValue === "") return;

      const filter = filters.find((f) => f.id === filterId);
      if (!filter) return;

      filtered = filtered.filter((event) => {
        if (!event) return false;

        // Get the field value to filter by
        const fieldValue =
          event[filter.field || filterId] ||
          event.extendedProps?.[filter.field || filterId];

        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(filterValue);
        }

        return fieldValue === filterValue;
      });
    });

    return filtered;
  }, [searchEvents, selectedFilters, filters]);

  // Group events by date for easier rendering
  const groupedEvents = useMemo(() => {
    const groups = {};

    if (!filteredEvents || !Array.isArray(filteredEvents)) return groups;

    filteredEvents.forEach((event) => {
      if (!event) return;

      const dateKey =
        event.date ||
        event.start ||
        (event.extendedProps && event.extendedProps.classDate
          ? event.extendedProps.classDate.split("T")[0]
          : null) ||
        new Date().toISOString().split("T")[0];

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(event);
    });

    return groups;
  }, [filteredEvents]);

  return {
    filteredEvents,
    groupedEvents,
    searchEvents,
  };
};
