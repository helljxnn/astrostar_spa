import { Swiper, SwiperSlide } from 'swiper/react';
import {
  EffectCoverflow,
  Autoplay,
  Pagination,
  Navigation,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
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
    },
    {
      img: img2,
      title: "Deporte",
      subtitle: "El fútbol como motor de sueños y disciplina ⚽",
    },
    {
      img: img3,
      title: "Educación",
      subtitle: "Formación académica y personal con valores 📚",
    },
    {
      img: img4,
      title: "Inclusión Social",
      subtitle: "Espacios de igualdad y oportunidades 💜",
    },
    {
      img: img5,
      title: "Trabajo en Equipo",
      subtitle: "Unión y respeto dentro y fuera de la cancha 🤝",
    },
    {
      img: img6,
      title: "Superación",
      subtitle: "Cada reto es una oportunidad para crecer 🌟",
    },
    {
      img: img7,
      title: "Pasión",
      subtitle: "El amor por el fútbol que nos inspira 💪⚽",
    },
  ];

  return (
    <div className="hero-carousel-container">
      <Swiper
        effect="coverflow"
        grabCursor
        centeredSlides
        slidesPerView="auto"
        loop={true} // 🔥 Hace el carrusel circular
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 200,
          modifier: 2.5,
          slideShadows: false,
        }}
        pagination={{ clickable: true }}
        navigation
        modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
        className="hero-swiper"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i} className="hero-slide">
            <img src={slide.img} alt={slide.title} />
            <div className="overlay">
              <h2>{slide.title}</h2>
              <p>{slide.subtitle}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
