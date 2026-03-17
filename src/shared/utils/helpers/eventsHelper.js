// 📊 DATOS DE EVENTOS - Con soporte completo para eventos multi-día
export const eventsData = [
  {
    id: 1,
    title: "Torneo de Fútbol Comunitario",
    type: "torneo",
    date: "2025-09-10",
    endDate: "2025-09-12",
    time: "01:00 PM",
    location: "Estadio Municipal",
    description:
      "Competencia deportiva para todas las edades con partidos durante todo el fin de semana.",
    image: "/public/assets/images/EventsHero.png",
    status: "programado",
    participants: 120,
    category: "Deportes",
    details:
      "Torneo de 3 días con fase de grupos, semifinales y final. Inscripciones abiertas hasta el 5 de septiembre.",
  },
  {
    id: 2,
    title: "Festival Cultural de Primavera",
    type: "festival",
    date: "2025-09-18",
    time: "01:00 PM",
    location: "Plaza Central",
    description: "Celebración cultural con música y gastronomía.",
    image: "/public/assets/images/Juvenil.jpg",
    status: "programado",
    participants: 300,
    category: "Cultura",
    details:
      "Un festival lleno de color y alegría para toda la familia. Disfruta de música en vivo, espectáculos de danza, puestos de comida artesanal y actividades para niños.",
    telefono: "+57 310 123 4567",
    patrocinadores: ["Empresa A", "Empresa B", "Empresa C"],
  },
  {
    id: 3,
    title: "Taller de Derechos Humanos",
    type: "taller",
    date: "2025-10-02",
    endDate: "2025-10-03",
    time: "09:00 AM",
    location: "Centro Comunitario",
    description: "Capacitación intensiva sobre participación ciudadana.",
    image: "/public/assets/images/Infantil.jpg",
    status: "programado",
    participants: 50,
    category: "Educación",
    details:
      "Taller de 2 días con sesiones teóricas y prácticas sobre derechos humanos fundamentales.",
  },
  {
    id: 4,
    title: "Clausura Temporada Deportiva",
    type: "clausura",
    date: "2025-11-05",
    time: "06:00 PM",
    location: "Coliseo Municipal",
    description: "Ceremonia de premiación a deportistas destacados.",
    image: "/public/assets/images/CategoriaHero.jpg",
    status: "programado",
    participants: 200,
    category: "Deportes",
    details:
      "Gran ceremonia de clausura con entrega de trofeos, reconocimientos y show artístico.",
  },
  {
    id: 5,
    title: "Maratón Recreativa Pasada",
    type: "torneo",
    date: "2025-08-15",
    time: "07:00 AM",
    location: "Parque Principal",
    description: "Carrera familiar por la salud.",
    image: "/public/assets/images/NiñosFestivalMNV.jpg",
    status: "programado",
    participants: 180,
    category: "Deportes",
  },
  {
    id: 6,
    title: "Festival de Verano Cancelado",
    type: "festival",
    date: "2025-07-20",
    endDate: "2025-07-22",
    time: "04:00 PM",
    location: "Parque Central",
    description: "Festival cancelado por condiciones climáticas.",
    image: "/public/assets/images/EventsHero.png",
    status: "cancelado",
    participants: 0,
    category: "Cultura",
  },
  {
    id: 7,
    title: "Taller de Innovación Cancelado",
    type: "taller",
    date: "2025-09-20",
    time: "03:00 PM",
    location: "Centro de Emprendimiento",
    description: "Taller cancelado por baja inscripción.",
    image: "/public/assets/images/DSC03576.jpg",
    status: "cancelado",
    participants: 0,
    category: "Educación",
  },
  {
    id: 8,
    title: "Concierto Cancelado de Rock",
    type: "festival",
    date: "2025-09-01",
    time: "08:00 PM",
    location: "Auditorio Central",
    description: "Concierto cancelado por problemas técnicos.",
    image: "/public/assets/images/CategoriasHero.jpg",
    status: "cancelado",
    participants: 0,
    category: "Música",
  },
  {
    id: 9,
    title: "Taller en Medellín",
    type: "taller",
    date: "2025-09-01",
    time: "08:00 PM",
    location: "Auditorio Central",
    description: "Taller informativo para las chicas.",
    image: "/public/assets/images/Infantil.jpg",
    status: "cancelado",
    participants: 0,
    category: "Música",
  },
  {
    id: 10,
    title: "Clausura en Confama",
    type: "clausura",
    date: "2025-09-01",
    time: "08:00 PM",
    location: "Auditorio Central",
    description: "Clausura Recreativa",
    image: "/public/assets/images/Juvenil.jpg",
    status: "cancelado",
    participants: 0,
  },
  {
    id: 101,
    title: "Festival de Música Andina",
    type: "festival",
    date: "2025-10-31",
    endDate: "2025-11-02",
    time: "06:00 PM",
    location: "Parque Principal",
    description:
      "Festival de música tradicional con artistas nacionales e internacionales.",
    image: "/public/assets/images/EventsHero.png",
    status: "programado",
    participants: 500,
    category: "Cultura",
    details:
      "Tres días de música andina, gastronomía típica y artesanías. Viernes apertura 6 PM, sábado y domingo desde mediodía hasta las 10 PM.",
    telefono: "+57 310 987 6543",
    patrocinadores: ["MinCultura", "Alcaldía Municipal", "Café Andino"],
  },
  {
    id: 102,
    title: "Torneo Nacional Sub-17",
    type: "torneo",
    date: "2025-11-10",
    endDate: "2025-11-14",
    time: "08:00 AM",
    location: "Complejo Deportivo Municipal",
    description: "Torneo nacional con 16 equipos de todo el país.",
    image: "/public/assets/images/CategoriaHero.jpg",
    status: "programado",
    participants: 400,
    category: "Deportes",
    details:
      "Torneo de 5 días. Fase de grupos lunes a miércoles, semifinales jueves y gran final el viernes a las 4 PM.",
  },
  {
    id: 103,
    title: "Semana Cultural Infantil",
    type: "festival",
    date: "2025-10-28",
    endDate: "2025-11-01",
    time: "09:00 AM",
    location: "Casa de la Cultura",
    description: "Semana completa de actividades culturales para niños.",
    image: "/public/assets/images/Infantil.jpg",
    status: "programado",
    participants: 150,
    category: "Cultura",
    details:
      "Teatro, danza, pintura y música para niños de 5 a 12 años. Actividades diarias de 9 AM a 5 PM.",
  },
  {
    id: 104,
    title: "Campamento Deportivo de Verano",
    type: "taller",
    date: "2025-12-15",
    endDate: "2025-12-19",
    time: "07:00 AM",
    location: "Club Deportivo Municipal",
    description:
      "Campamento intensivo de fútbol femenino para todas las edades.",
    image: "/public/assets/images/DSC03576.jpg",
    status: "programado",
    participants: 80,
    category: "Deportes",
    details:
      "5 días de entrenamiento intensivo con entrenadoras profesionales. Incluye almuerzo y refrigerios.",
  },
];

export const eventTypes = [
  { id: "todos", label: "Todos", icon: "✨" },
  { id: "torneo", label: "Torneos", icon: "🏆" },
  { id: "festival", label: "Festivales", icon: "🏅" },
  { id: "clausura", label: "Clausuras", icon: "🌟" },
  { id: "taller", label: "Talleres", icon: "📒" },
];

export const convertTo12Hour = (time24) => {
  if (!time24) return "";

  if (time24.includes("AM") || time24.includes("PM")) {
    return time24;
  }

  const [hours, minutes] = time24.split(":");
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

export const processEventsStatus = (events) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutos desde medianoche

  return events.map((event) => {
    // No modificar eventos cancelados o en pausa
    if (event.status === "cancelado" || event.status === "Cancelado") {
      return event;
    }

    // No modificar eventos ya finalizados
    if (event.status === "finalizado" || event.status === "Finalizado") {
      return event;
    }

    const eventEndDate = event.endDate || event.date;
    const endDate = new Date(eventEndDate);
    const endDateOnly = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    );

    // Si la fecha de fin ya pasó, marcar como finalizado
    if (endDateOnly < today) {
      return { ...event, status: "finalizado" };
    }

    // Si la fecha de fin es hoy, verificar la hora
    if (endDateOnly.getTime() === today.getTime() && event.endTime) {
      const [eventHour, eventMin] = event.endTime.split(":").map(Number);
      const eventTimeInMinutes = eventHour * 60 + eventMin;

      // Si la hora de fin ya pasó, marcar como finalizado
      if (eventTimeInMinutes <= currentTime) {
        return { ...event, status: "finalizado" };
      }
    }

    return event;
  });
};

export const filterEventsByType = (events, selectedType) => {
  if (selectedType === "todos") return events;
  return events.filter((event) => event.type === selectedType);
};

export const getUpcomingEvents = (events) => {
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

export const getPastEvents = (events) => {
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

export const getNextEvent = (upcomingEvents) => {
  return upcomingEvents
    .filter((event) => event.status === "programado")
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    })[0];
};

export const calculateTimeRemaining = (date, time, endDate) => {
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
    (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
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

export const getCountdownEvent = (events) => {
  const now = new Date();

  const upcomingEvents = events
    .filter((event) => {
      if (!event.date || !event.time || event.status !== "programado")
        return false;

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

