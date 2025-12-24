// Base Calendar Components
export { default as BaseCalendar } from "./BaseCalendar/BaseCalendar";
export { default as CalendarHeader } from "./BaseCalendar/CalendarHeader";
export { default as CalendarControls } from "./BaseCalendar/CalendarControls";
export { default as CalendarReportGenerator } from "./BaseCalendar/CalendarReportGenerator";

// Hooks
export { useCalendarBase } from "./BaseCalendar/hooks/useCalendarBase";
export { useCalendarNavigation } from "./BaseCalendar/hooks/useCalendarNavigation";

// Variants
export { default as BigCalendarWrapper } from "./Variants/BigCalendarWrapper";
export { default as CustomCalendarGrid } from "./Variants/CustomCalendarGrid";
export { default as CalendarEvent } from "./Variants/CalendarEvent";

// Helpers
export * from "./BaseCalendar/helpers/calendarHelpers";

// Examples (for reference)
export { default as EventsCalendarExample } from "./examples/EventsCalendarExample";
export { default as EmployeeScheduleCalendarExample } from "./examples/EmployeeScheduleCalendarExample";
export { default as ClassesCalendarExample } from "./examples/ClassesCalendarExample";
