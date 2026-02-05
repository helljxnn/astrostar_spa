import { useCallback, useMemo } from "react";
import {
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";

export const useCalendarNavigation = ({
  selectedDate,
  currentView,
  onDateChange,
}) => {
  // Navigate to previous period
  const goToPrevious = useCallback(() => {
    let newDate;

    switch (currentView) {
      case "month":
        newDate = subMonths(selectedDate, 1);
        break;
      case "week":
        newDate = subWeeks(selectedDate, 1);
        break;
      case "day":
        newDate = subDays(selectedDate, 1);
        break;
      default:
        newDate = subMonths(selectedDate, 1);
    }

    onDateChange(newDate);
  }, [selectedDate, currentView, onDateChange]);

  // Navigate to next period
  const goToNext = useCallback(() => {
    let newDate;

    switch (currentView) {
      case "month":
        newDate = addMonths(selectedDate, 1);
        break;
      case "week":
        newDate = addWeeks(selectedDate, 1);
        break;
      case "day":
        newDate = addDays(selectedDate, 1);
        break;
      default:
        newDate = addMonths(selectedDate, 1);
    }

    onDateChange(newDate);
  }, [selectedDate, currentView, onDateChange]);

  // Navigate to today
  const goToToday = useCallback(() => {
    onDateChange(new Date());
  }, [onDateChange]);

  // Navigate to specific date
  const navigateDate = useCallback(
    (date) => {
      onDateChange(date);
    },
    [onDateChange]
  );

  // Get calendar title based on current view and date
  const getCalendarTitle = useCallback(() => {
    switch (currentView) {
      case "month":
        return format(selectedDate, "MMMM yyyy", { locale: es });
      case "week":
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
        return `${format(weekStart, "d MMM", { locale: es })} - ${format(
          weekEnd,
          "d MMM yyyy",
          { locale: es }
        )}`;
      case "day":
        return format(selectedDate, "EEEE, d MMMM yyyy", { locale: es });
      default:
        return format(selectedDate, "MMMM yyyy", { locale: es });
    }
  }, [selectedDate, currentView]);

  // Get date range for current view
  const getDateRange = useMemo(() => {
    switch (currentView) {
      case "month":
        return {
          start: startOfMonth(selectedDate),
          end: endOfMonth(selectedDate),
        };
      case "week":
        return {
          start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
          end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
        };
      case "day":
        return {
          start: selectedDate,
          end: selectedDate,
        };
      default:
        return {
          start: startOfMonth(selectedDate),
          end: endOfMonth(selectedDate),
        };
    }
  }, [selectedDate, currentView]);

  return {
    goToPrevious,
    goToNext,
    goToToday,
    navigateDate,
    getCalendarTitle,
    getDateRange,
  };
};
