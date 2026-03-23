export const eventTypes = [
  { id: "todos", label: "Todos", icon: "\u2728" },
  { id: "torneo", label: "Torneos", icon: "\u{1F3C6}" },
  { id: "festival", label: "Festivales", icon: "\u{1F3AD}" },
  { id: "clausura", label: "Clausuras", icon: "\u{1F31F}" },
  { id: "taller", label: "Talleres", icon: "\u{1F4D8}" },
];

export const convertTo12Hour = (time24) => {
  if (!time24) return "";

  if (time24.includes("AM") || time24.includes("PM")) {
    return time24;
  }

  const [hours, minutes = "00"] = time24.split(":");
  let hour = parseInt(hours, 10);
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${hour}:${minutes} ${period}`;
};

export const convertTo24Hour = (time12) => {
  if (!time12) return "00:00";

  if (!time12.includes("AM") && !time12.includes("PM")) {
    return time12;
  }

  const [time, period] = time12.split(" ");
  const [hours, minutes] = time.split(":");
  let hour = parseInt(hours, 10);

  if (period === "PM" && hour !== 12) {
    hour += 12;
  } else if (period === "AM" && hour === 12) {
    hour = 0;
  }

  return `${hour.toString().padStart(2, "0")}:${minutes}`;
};

export const processEventsStatus = (events = []) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentTime = now.getHours() * 60 + now.getMinutes();

  return events.map((event) => {
    if (!event?.date) return event;

    if (event.status === "cancelado" || event.status === "Cancelado") {
      return event;
    }

    if (event.status === "finalizado" || event.status === "Finalizado") {
      return event;
    }

    const eventEndDate = event.endDate || event.date;
    const endDate = new Date(eventEndDate);

    if (Number.isNaN(endDate.getTime())) {
      return event;
    }

    const endDateOnly = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
    );

    if (endDateOnly < today) {
      return { ...event, status: "finalizado" };
    }

    if (endDateOnly.getTime() === today.getTime() && event.endTime) {
      const time24 = convertTo24Hour(event.endTime);
      const [eventHour = "0", eventMin = "0"] = time24.split(":");
      const eventTimeInMinutes = Number(eventHour) * 60 + Number(eventMin);

      if (eventTimeInMinutes <= currentTime) {
        return { ...event, status: "finalizado" };
      }
    }

    return event;
  });
};

export const filterEventsByType = (events = [], selectedType) => {
  if (selectedType === "todos") return events;
  return events.filter((event) => event.type === selectedType);
};

export const getUpcomingEvents = (events = []) => {
  const today = new Date();
  return events
    .filter((event) => {
      const startDate = new Date(event.date);
      return startDate >= today;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });
};

export const getPastEvents = (events = []) => {
  const today = new Date();
  return events
    .filter((event) => {
      const endDate = new Date(event.endDate || event.date);
      return endDate < today;
    })
    .sort((a, b) => {
      const dateA = new Date(a.endDate || a.date);
      const dateB = new Date(b.endDate || b.date);
      return dateB - dateA;
    });
};

export const getNextEvent = (upcomingEvents = []) => {
  return upcomingEvents
    .filter((event) => event.status === "programado")
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    })[0];
};

export const calculateTimeRemaining = (date, time) => {
  if (!date || !time) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  const now = new Date();
  const time24 = convertTo24Hour(time);
  const [hours, minutes] = time24.split(":");

  const targetDate = new Date(date);
  targetDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

  const difference = targetDate.getTime() - now.getTime();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hrs = Math.floor(
    (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const mins = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((difference % (1000 * 60)) / 1000);

  return {
    days,
    hours: hrs,
    minutes: mins,
    seconds: secs,
    isExpired: false,
  };
};

export const formatTimeUnit = (value) => {
  return value.toString().padStart(2, "0");
};

export const getCountdownEvent = (events = []) => {
  const now = new Date();

  const upcomingEvents = events
    .filter((event) => {
      if (!event.date || !event.time || event.status !== "programado") {
        return false;
      }

      const time24 = convertTo24Hour(event.time);
      const [hours, minutes] = time24.split(":");
      const eventDate = new Date(event.date);
      eventDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      return eventDate > now;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });

  return upcomingEvents[0] || null;
};

