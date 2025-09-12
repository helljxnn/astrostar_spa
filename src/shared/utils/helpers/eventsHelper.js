import { combineDateAndTime,} from './dateHelpers';

// 📊 DATOS DE EVENTOS - Actualizado con formato de 12 horas
export const eventsData = [
  {
    id: 1,
    title: "Torneo de Fútbol Comunitario",
    type: "torneo",
    date: "2025-09-10",
    time: "01:00 PM", // Formato 12 horas
    location: "Estadio Municipal",
    description: "Competencia deportiva para todas las edades.",
    image: "/public/assets/images/EventsHero.png",
    status: "programado",
    participants: 120,
    category: "Deportes",
  },
  {
    id: 2,
    title: "Festival Cultural de Primavera",
    type: "festival",
    date: "2025-09-18",
    time: "1:00 AM",
    location: "Plaza Central",
    description: "Celebración cultural con música y gastronomía.",
    image: "/public/assets/images/EventsHero.jpg",
    status: "programado",
    participants: 300,
    category: "Cultura",
    details: "Un festival lleno de color y alegría para toda la familia. Disfruta de música en vivo, espectáculos de danza, puestos de comida artesanal y actividades para niños. Ven a celebrar la llegada de la primavera con la comunidad.",
    telefono: "+57 310 123 4567",
    patrocinadores: ["Empresa A", "Empresa B", "Empresa C"],
  },
  {
    id: 3,
    title: "Taller de Derechos Humanos",
    type: "taller",
    date: "2025-10-02",
    time: "09:00 AM",
    location: "Centro Comunitario",
    description: "Capacitación sobre participación ciudadana.",
    image: "/public/assets/images/EventsHero.jpg",
    status: "en-pausa",
    participants: 50,
    category: "Educación",
  },
  {
    id: 4,
    title: "Clausura Temporada Deportiva",
    type: "clausura",
    date: "2025-11-05",
    time: "06:00 PM",
    location: "Coliseo Municipal",
    description: "Ceremonia de premiación a deportistas destacados.",
    image: "/public/assets/images/EventsHero.jpg",
    status: "programado",
    participants: 200,
    category: "Deportes",
  },
  {
    id: 5,
    title: "Maratón Recreativa Pasada",
    type: "torneo",
    date: "2025-08-15",
    time: "07:00 AM",
    location: "Parque Principal",
    description: "Carrera familiar por la salud.",
    image: "/public/assets/images/EventsHero.jpg",
    status: "programado",
    participants: 180,
    category: "Deportes",
  },
  {
    id: 6,
    title: "Festival de Verano Cancelado",
    type: "festival",
    date: "2025-07-20",
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
    image: "/public/assets/images/EventsHero.png",
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
    image: "/public/assets/images/EventsHero.png",
    status: "cancelado",
    participants: 0,
    category: "Música",
  },
  {
    id: 9,
    title: "Taller en Medellin",
    type: "taller",
    date: "2025-09-01",
    time: "08:00 PM",
    location: "Auditorio Central",
    description: "Taller informativo para las chicas",
    image: "/public/assets/images/EventsHero.jpg",
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
    image: "/public/assets/images/EventsHero.jpg",
    status: "cancelado",
    participants: 0,
  },
];

export const eventTypes = [
  { id: "todos", label: "Todos", icon: "✨" },
  { id: "torneo", label: "Torneos", icon: "🏆" },
  { id: "festival", label: "Festivales", icon: "🏅" },
  { id: "clausura", label: "Clausuras", icon: "🌟" },
  { id: "taller", label: "Talleres", icon: "📒" },
];

// 🕒 UTILIDADES PARA FORMATO DE HORA
export const convertTo12Hour = (time24) => {
  if (!time24) return "";
  
  // Si ya está en formato 12 horas, devolverlo tal como está
  if (time24.includes('AM') || time24.includes('PM')) {
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
  
  // Si ya está en formato 24 horas, devolverlo tal como está
  if (!time12.includes('AM') && !time12.includes('PM')) {
    return time12;
  }
  
  const [time, period] = time12.split(' ');
  const [hours, minutes] = time.split(':');
  let hour = parseInt(hours, 10);
  
  if (period === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }
  
  return `${hour.toString().padStart(2, '0')}:${minutes}`;
};

// 🔧 UTILIDADES PARA EVENTOS
export const processEventsStatus = (events) => {
  const today = new Date();
  
  return events.map((event) => {
    const eventDate = new Date(event.date);

    // Si está cancelado, mantener el estado
    if (event.status === "cancelado") {
      return { ...event, status: "cancelado" };
    }

    // Si la fecha ya pasó, marcar como finalizado
    if (eventDate < today) {
      return { ...event, status: "finalizado" };
    }

    // Mantener el estado original
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
    .filter((event) => new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const getPastEvents = (events) => {
  const today = new Date();
  return events
    .filter((event) => new Date(event.date) < today)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const getNextEvent = (upcomingEvents) => {
  return upcomingEvents.find((event) => event.status === "programado");
};

// 🔧 UTILIDADES PARA COUNTDOWN - Actualizado para manejar formato 12 horas
export const calculateTimeRemaining = (date, time) => {
  if (!date || !time) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true
    };
  }

  const now = new Date();
  // Convertir a formato 24 horas para los cálculos internos
  const time24 = convertTo24Hour(time);
  const target = combineDateAndTime(date, time24);
  
  if (!target || target.toString() === 'Invalid Date') {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true
    };
  }

  const difference = target.getTime() - now.getTime();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true
    };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false
  };
};

export const formatTimeUnit = (value) => {
  return value.toString().padStart(2, '0');
};

export const getCountdownEvent = (events) => {
  const now = new Date();
  
  // Buscar el próximo evento programado
  const upcomingEvents = events
    .filter(event => {
      if (!event.date || !event.time || event.status !== 'programado') return false;
      
      const time24 = convertTo24Hour(event.time);
      const eventDateTime = combineDateAndTime(event.date, time24);
      return eventDateTime && eventDateTime > now;
    })
    .sort((a, b) => {
      const timeA24 = convertTo24Hour(a.time);
      const timeB24 = convertTo24Hour(b.time);
      const dateA = combineDateAndTime(a.date, timeA24);
      const dateB = combineDateAndTime(b.date, timeB24);
      return dateA - dateB;
    });

  return upcomingEvents[0] || null;
};