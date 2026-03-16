import { Swiper, SwiperSlide } from "swiper/react";
import {
  EffectFade,
  Autoplay,
  Pagination,
  Navigation,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import "../styles/home.css";

// ✅ Importa imágenes
import img1 from "../images/Carrusel/DSC03153.jpg";
import img2 from "../images/Carrusel/DSC03002.jpg";
import img3 from "../images/Carrusel/DSC03324.jpg";
import img4 from "../images/Carrusel/DSC03362.jpg";
import img5 from "../images/Carrusel/DSC03435.jpg";
import img6 from "../images/Carrusel/DSC03296.jpg";
import img7 from "../images/Carrusel/DSC03464.jpg";

export default function HeroCarousel() {
  const slides = [
    {
      img: img1,
      title: "Fundación Manuela Vanegas",
      subtitle: "Apoyamos el desarrollo integral de niñas y jóvenes",
      accent: "💜",
    },
    {
      img: img2,
      title: "Deporte",
      subtitle: "El fútbol como motor de sueños y disciplina",
      accent: "⚽",
    },
    {
      img: img3,
      title: "Educación",
      subtitle: "Formación académica y personal con valores",
      accent: "📚",
    },
    {
      img: img4,
      title: "Inclusión Social",
      subtitle: "Espacios de igualdad y oportunidades",
      accent: "🤝",
    },
    {
      img: img5,
      title: "Trabajo en Equipo",
      subtitle: "Unión y respeto dentro y fuera de la cancha",
      accent: "👥",
    },
    {
      img: img6,
      title: "Superación",
      subtitle: "Cada reto es una oportunidad para crecer",
      accent: "🌟",
    },
    {
      img: img7,
      title: "Pasión",
      subtitle: "El amor por el fútbol que nos inspira",
      accent: "💪",
    },
  ];

  return (
    <div className="hero-carousel-container">
      <Swiper
        modules={[EffectFade, Autoplay, Pagination, Navigation]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        grabCursor={false}
        allowTouchMove={true}
        loop={true}
        speed={800}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
          waitForTransition: false,
        }}
        pagination={{ 
          clickable: true,
          dynamicBullets: false,
        }}
        navigation={true}
        className="hero-swiper"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i} className="hero-slide">
            {/* Imagen sin animaciones */}
            <img
              src={slide.img}
              alt={slide.title}
              className="w-full h-full object-cover"
            />

            {/* Overlay simple solo abajo */}
            <div className="slide-overlay"></div>

            {/* Contenido minimalista */}
            <div className="absolute inset-0 flex flex-col justify-end items-center px-6 sm:px-10 lg:px-16 pb-20 sm:pb-24 lg:pb-32">
              
              {/* Emoji flotante */}
              <div className="floating-emoji">
                {slide.accent}
              </div>

              {/* Caja de contenido glassmorphism */}
              <div className="hero-glass-card">
                <h1 className="hero-title">
                  {slide.title}
                </h1>
                
                <div className="title-divider"></div>
                
                <p className="hero-subtitle">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

