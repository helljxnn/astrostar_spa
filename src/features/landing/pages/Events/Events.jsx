// src/pages/Events/Events.jsx
import { Hero } from "../../components/Hero";
import { useState, useRef } from "react";
import { Calendar } from "./components/Calendar";
import { EventsSelect } from "./components/EventsSelect";
import { UpcomingEvents } from "./components/UpcomingEvents";
import { PastEvents } from "./components/PastEvents";
import { hookCountdown} from "./hooks/hookCountdown";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../../../../shared/utils/Alerts";

// Constants - Moved here to keep everything in Events folder
const EVENT_TYPES = [
  { id: "FESTIVAL", label: "Festivales", icon: "🎊" },
  { id: "TORNEOS", label: "Torneos", icon: "🏆" },
  { id: "TALLERES", label: "Talleres", icon: "📚" },
  { id: "CLAUSURAS", label: "Clausuras", icon: "🎭" }
];

const INITIAL_COUNTDOWN = { days: 55, hours: 20, minutes: 12, seconds: 33 };

// Mock data - This should come from an API or context in a real application
const EVENTS_DATA = {
  FESTIVAL: {
    upcoming: [
      {
        id: 1,
        title: "IV Festival Deportivo Femenino 2025",
        date: "16 y 17 de Agosto",
        time: "9:00 AM - 6:00 PM",
        location: "Unidad Deportiva Central Itagüí, Antioquia",
        description: "El festival más grande de fútbol femenino en Antioquia. Dos días de competencia, talleres y celebración del deporte femenino. Únete a nosotros para vivir la pasión del deporte.",
        image: "/assets/images/festival-2025.jpg",
        secondaryImage: "/assets/images/festival-2025-secondary.jpg",
        hashtag: "#FDF2025",
        contact: "310 5086438 - 3174097396",
        status: "upcoming"
      }
    ],
    past: [
      {
        id: 2,
        title: "III Festival Manuela Vanegas",
        date: "17-18 AGO 2024",
        time: "10:00 AM - 6:30 PM",
        location: "Centro Deportivo",
        description: "Un festival memorable que celebró el talento femenino en el fútbol con la participación de equipos de toda la región. Fue un evento histórico para nuestra fundación.",
        image: "/assets/images/festival-2024.jpg",
        secondaryImage: "/assets/images/festival-2024-secondary.jpg",
        status: "past"
      }
    ]
  },
  TORNEOS: {
    upcoming: [
      {
        id: 3,
        title: "Copa Femenina Regional 2025",
        date: "23 de Septiembre",
        time: "8:00 AM - 4:00 PM",
        location: "Estadio Municipal Medellín",
        description: "Torneo regional que reúne a los mejores equipos femeninos de Antioquia para una competencia de alto nivel. Ven a apoyar a nuestras futbolistas.",
        image: "/assets/images/copa-2025.jpg",
        secondaryImage: "/assets/images/copa-2025-trophy.jpg",
        hashtag: "#CopaFemenina2025",
        status: "upcoming"
      }
    ],
    past: [
      {
        id: 4,
        title: "Torneo Clausura 2024",
        date: "Diciembre 2024",
        time: "Todo el día",
        location: "Varios estadios",
        description: "El torneo de clausura que cerró con broche de oro la temporada 2024 con grandes emociones y jugadas espectaculares.",
        image: "/assets/images/torneo-2024.jpg",
        secondaryImage: "/assets/images/torneo-2024-celebration.jpg",
        status: "past"
      }
    ]
  },
  TALLERES: {
    upcoming: [
      {
        id: 5,
        title: "Taller de Técnicas Avanzadas",
        date: "5 de Octubre",
        time: "2:00 PM - 5:00 PM",
        location: "Centro de Entrenamiento",
        description: "Taller especializado en técnicas avanzadas de fútbol femenino dirigido por entrenadoras profesionales. Mejora tus habilidades técnicas.",
        image: "/assets/images/taller-tecnicas.jpg",
        secondaryImage: "/assets/images/taller-equipment.jpg",
        hashtag: "#TallerFutbol",
        status: "upcoming"
      },
      {
        id: 6,
        title: "Seminario de Liderazgo Deportivo",
        date: "12 de Noviembre",
        time: "9:00 AM - 12:00 PM",
        location: "Auditorio Fundación",
        description: "Desarrollo de habilidades de liderazgo para jugadoras y entrenadoras del fútbol femenino. Fortalece tu capacidad de liderazgo.",
        image: "/assets/images/seminario-liderazgo.jpg",
        secondaryImage: "/assets/images/leadership-group.jpg",
        status: "upcoming"
      }
    ],
    past: [
      {
        id: 7,
        title: "Taller de Nutrición Deportiva",
        date: "Marzo 2024",
        time: "10:00 AM - 1:00 PM",
        location: "Centro de Bienestar",
        description: "Taller sobre alimentación adecuada para deportistas con especialistas en nutrición. Conoce los secretos de una alimentación deportiva.",
        image: "/assets/images/taller-nutricion.jpg",
        secondaryImage: "/assets/images/healthy-food.jpg",
        status: "past"
      }
    ]
  },
  CLAUSURAS: {
    upcoming: [
      {
        id: 8,
        title: "Clausura Temporada 2025",
        date: "15 de Diciembre",
        time: "6:00 PM - 10:00 PM",
        location: "Salón de Eventos La Macarena",
        description: "Ceremonia de clausura de la temporada 2025 con premiación y reconocimientos especiales. Una noche de celebración y reconocimiento.",
        image: "/assets/images/clausura-2025.jpg",
        secondaryImage: "/assets/images/awards-ceremony.jpg",
        hashtag: "#Clausura2025",
        status: "upcoming"
      }
    ],
    past: [
      {
        id: 9,
        title: "Clausura Temporada 2024",
        date: "Diciembre 2024",
        time: "7:00 PM - 11:00 PM",
        location: "Hotel Intercontinental",
        description: "Una noche memorable de reconocimientos y celebración de los logros del año 2024. Recordamos los mejores momentos del año.",
        image: "/assets/images/clausura-2024.jpg",
        secondaryImage: "/assets/images/gala-night.jpg",
        status: "past"
      }
    ]
  }
};

const CallToAction = () => (
  <section className="py-16 px-6 bg-gradient-to-r from-[#B595FF] to-[#9BE9FF]">
    <div className="max-w-4xl mx-auto text-center text-white">
      <h2 className="text-3xl font-bold mb-4 font-questrial">
        ¿Quieres participar en nuestros eventos?
      </h2>
      <p className="text-lg mb-8 opacity-90 font-questrial">
        Únete a nuestra comunidad y sé parte de la revolución del fútbol femenino en Colombia
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="bg-white text-[#B595FF] px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300">
          Contactar Ahora
        </button>
        <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-[#B595FF] transition-all duration-300">
          Ver Más Información
        </button>
      </div>
    </div>
  </section>
);

function Events() {
  const timeLeft = hookCountdown(INITIAL_COUNTDOWN);
  const [selectedEventType, setSelectedEventType] = useState("FESTIVAL");
  const eventsRef = useRef(null);

  const handleEventTypeChange = (eventType) => {
    setSelectedEventType(eventType);
  };

  const handleEventClick = (event) => {
    console.log("Event clicked:", event);
    showSuccessAlert("Evento", `Mostrando detalles de: ${event.title}`);
  };

  const scrollToEvents = () => {
    eventsRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const currentEventsData = EVENTS_DATA[selectedEventType] || { upcoming: [], past: [] };
  const selectedEventTypeData = EVENT_TYPES.find(type => type.id === selectedEventType);

  return (
    <div>
      <Hero
        variant="background"
        title="Eventos"
        subtitle="Promover el desarrollo integral de las personas y su relación con el entorno, fomentando el deporte, la recreación, la actividad física y el uso saludable del tiempo libre. También buscamos incentivar la participación ciudadana y el respeto por los derechos humanos, en línea con la Constitución colombiana y las leyes actuales."
        imageUrl="/assets/images/EventsHero.png"
      />

      {/* Description Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-gray-700 leading-relaxed font-questrial">
            Nuestros eventos son el corazón de la Fundación, donde celebramos la 
            pasión por el fútbol femenino. Organizamos torneos emocionantes, y 
            encuentros inspiradores para nuestras jugadoras y la comunidad. Estos 
            espacios buscan desarrollar su talento, fomentar la unión y promover los 
            valores del deporte. ¡Consulta nuestro calendario y únete a la celebración 
            del fútbol femenino!
          </p>
        </div>
      </section>

      {/* Next Events Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-12 font-questrial text-transparent bg-clip-text bg-gradient-to-r from-[#B595FF] to-[#9BE9FF]">
            Próximos Eventos
          </h2>

          <div className="bg-gradient-to-br from-[#B595FF] to-[#9BE9FF] rounded-3xl p-8 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <Calendar onEventClick={scrollToEvents} />
              
              {/* Countdown */}
              <div className="text-center text-white">
                <h3 className="text-4xl font-bold mb-8 font-questrial">Festival 2025</h3>
                
                <div className="flex justify-center gap-4 mb-6">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 min-w-[80px]">
                    <div className="text-3xl font-bold font-questrial">{timeLeft.days.toString().padStart(2, '0')}</div>
                    <div className="text-sm uppercase tracking-wide font-questrial">DAYS</div>
                  </div>
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 min-w-[80px]">
                    <div className="text-3xl font-bold font-questrial">{timeLeft.hours.toString().padStart(2, '0')}</div>
                    <div className="text-sm uppercase tracking-wide font-questrial">HOURS</div>
                  </div>
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 min-w-[80px]">
                    <div className="text-3xl font-bold font-questrial">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                    <div className="text-sm uppercase tracking-wide font-questrial">MINUTES</div>
                  </div>
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 min-w-[80px]">
                    <div className="text-3xl font-bold font-questrial">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                    <div className="text-sm uppercase tracking-wide font-questrial">SECONDS</div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <div className="w-full h-2 bg-white bg-opacity-20 rounded-full">
                    <div className="h-full bg-white rounded-full w-3/4 transition-all duration-1000" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Types Selector and Events List */}
      <section ref={eventsRef} className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          
          <EventsSelect
            eventTypes={EVENT_TYPES}
            selectedType={selectedEventType}
            onTypeChange={handleEventTypeChange}
          />

          {/* Dynamic Title */}
          <h2 className="text-4xl font-bold text-center mb-12 font-questrial text-gray-800">
            {selectedEventTypeData?.label || 'Eventos'}
          </h2>

          <UpcomingEvents
            events={currentEventsData.upcoming}
            eventTypeLabel={selectedEventTypeData?.label}
            onEventClick={handleEventClick}
          />

          <PastEvents
            events={currentEventsData.past}
            eventTypeLabel={selectedEventTypeData?.label}
            onEventClick={handleEventClick}
          />

          {/* Empty state for both */}
          {(!currentEventsData.upcoming || currentEventsData.upcoming.length === 0) && 
          (!currentEventsData.past || currentEventsData.past.length === 0) && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No hay eventos programados</h3>
              <p className="text-gray-500">
                Pronto tendremos novedades sobre {selectedEventTypeData?.label.toLowerCase()}
              </p>
            </div>
          )}
        </div>
      </section>

      <CallToAction />

      {/* Test Buttons - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <section className="py-12">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => showSuccessAlert("Éxito", "La operación fue exitosa 🎉")}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Probar Éxito
            </button>

            <button
              onClick={() => showErrorAlert("Error", "Algo salió mal 😢")}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Probar Error
            </button>

            <button
              onClick={() => showConfirmAlert("¿Estás seguro?", "Esta acción no se puede deshacer 🤔")}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Probar Confirmación
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default Events;