<<<<<<< HEAD
import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  // Función para manejar la navegación
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100">
      <div className="p-10 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Header principal */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Bienvenido a la Página Principal
            </h1>
            <p className="text-gray-600 text-lg">
              Sistema de Gestión Deportiva
            </p>
          </div>
          
          {/* Grid de navegación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* About */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">About</h3>
                <p className="text-blue-100 text-sm">Información del sistema</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Conoce más sobre nuestra plataforma deportiva y sus características.
                </p>
                <button 
                  onClick={() => handleNavigation('/about')}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Ir a About
                </button>
              </div>
            </div>

            {/* Admin */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Administrador</h3>
                <p className="text-emerald-100 text-sm">Panel de control administrativo</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Gestiona usuarios, configuraciones y supervisión general del sistema.
                </p>
                <button 
                  onClick={() => handleNavigation('/dashboard')}
                  className="w-full py-2 px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                >
                  Ir a Admin
                </button>
              </div>
            </div>

            {/* Profesional Deportivo */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Profesional Deportivo</h3>
                <p className="text-purple-100 text-sm">Herramientas para entrenadores</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Acceso a herramientas especializadas para profesionales del deporte.
                </p>
                <button 
                  onClick={() => handleNavigation('/dashboard/sportsprofessional')}
                  className="w-full py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                >
                  Ir a Profesional
                </button>
              </div>
            </div>

            {/* Deportistas/Acudientes */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Deportistas</h3>
                <p className="text-orange-100 text-sm">Portal para atletas y acudientes</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Seguimiento de progreso y comunicación con entrenadores.
                </p>
                <button 
                  onClick={() => handleNavigation('/dashboard/athletes')}
                  className="w-full py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Ir a Deportistas
                </button>
              </div>
            </div>
          </div>

          {/* Footer informativo */}
          <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <p className="text-gray-600 text-sm">
              Selecciona tu rol para acceder a las herramientas correspondientes de gestión deportiva.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
=======
import { Hero } from "../components/Hero";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { FaUserTie, FaFutbol, FaHandshake, FaGlobe } from "react-icons/fa";

function Home() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  // Lista de imágenes del carrusel
  const images = [
    "/assets/images/DSC03553.jpg",
    "/assets/images/DSC03567.jpg",
    "/assets/images/DSC03572.jpg",
    "/assets/images/DSC03576.jpg",
    "/assets/images/DSC03581.jpg",
    "/assets/images/DSC03587.jpg",
    "/assets/images/DSC03592.jpg",
  ];

  // Autoplay del carrusel
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 5000); // cambia cada 5s
    return () => clearInterval(interval);
  }, [images.length]);

  // 🔥 Datos de las estadísticas con iconos pro
  const stats = [
    { icon: <FaUserTie />, value: 10, text: "Profesionales en el equipo" },
    { icon: <FaFutbol />, value: 6, text: "Áreas de acción (Deporte, Psicología, Nutrición...)" },
    { icon: <FaHandshake />, value: 12, text: "Entregas mensuales y actividades comunitarias" },
    { icon: <FaGlobe />, value: 5, text: "Alianzas con empresas y patrocinadores" },
  ];

  // Estados para los contadores
  const [counters, setCounters] = useState(stats.map(() => 0));
  const sectionRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Función para animar los números
  const animateCounters = () => {
    stats.forEach((stat, i) => {
      let start = 0;
      const end = stat.value;
      const duration = 2000; // 2 segundos
      const stepTime = Math.max(Math.floor(duration / end), 20);

      const timer = setInterval(() => {
        start += 1;
        setCounters((prev) => {
          const newCounters = [...prev];
          newCounters[i] = start;
          return newCounters;
        });
        if (start >= end) clearInterval(timer);
      }, stepTime);
    });
  };

  // IntersectionObserver para detectar cuando la sección entra en vista
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          animateCounters();
          setHasAnimated(true);
        }
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, [hasAnimated]);

  return (
    <>
      {/* Hero con imagen */}
      <Hero imageUrl="/assets/images/InicioHero.png" />

      {/* Sección Fundadora */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 py-16 items-center font-montserrat">
        {/* Fotos lado izquierdo */}
        <div className="grid grid-cols-2 gap-4">
          <img
            src="public/assets/images/DSC03592.jpg"
            alt="Manuela Vanegas 1"
            className="rounded-2xl shadow-lg"
          />
          <img
            src="public/assets/images/DSC03581.jpg"
            alt="Manuela Vanegas 2"
            className="rounded-2xl shadow-lg"
          />
          <img
            src="public/assets/images/DSC03587.jpg"
            alt="Manuela Vanegas 3"
            className="rounded-2xl shadow-lg col-span-2"
          />
        </div>

        {/* Texto lado derecho */}
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-extrabold mb-4 leading-snug">
            Manuela Vanegas <br /> Futbolista Profesional
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Nacida el 9 de noviembre de 2000 en Copacabana, Antioquia. Figura
            como una de las mayores exponentes del talento deportivo nacional.
            Reconocida por su disciplina y liderazgo dentro y fuera del campo,
            busca dejar una huella imborrable para las futuras generaciones del
            fútbol femenino.
          </p>
          <h3 className="text-purple-500 font-bold uppercase mb-3">
            Fundadora
          </h3>
          <ul className="space-y-2 text-gray-700 font-medium">
            <li>⚽ Jugadora del Club Real Sociedad de Fútbol</li>
            <li> Selección Colombia de Mayores y procesos juveniles</li>
          </ul>
        </div>
      </section>

      {/* Sección Valores */}
      <div className="flex flex-col items-center justify-center mt-24 mb-24">
        {/* Título */}
        <h2 className="text-4xl font-bold font-montserrat mb-12">VALORES</h2>

        {/* Imagen */}
        <img
          src="public/assets/images/valores.jpg"
          alt="Valores de la fundación"
          className="w-[1100px] h-[500px] max-w-full object-contain"
        />
      </div>

      {/* 🔥 Sección de estadísticas con animación */}
      <section ref={sectionRef} className="bg-white text-black py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center font-montserrat">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl shadow-lg border border-gray-200 bg-white"
            >
               {/* Icono */}
        <div className="text-[#b595ff] text-6xl mb-3 flex justify-center">
          {stat.icon}
        </div>

              {/* Número animado */}
              <h3 className="text-4xl font-bold">{counters[i]}+</h3>

              {/* Descripción */}
              <p className="text-gray-700">{stat.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Carrusel de imágenes */}
      <div className="flex flex-col items-center justify-center mt-24 mb-24 px-4">
        <h2 className="text-3xl font-bold font-montserrat mb-8 text-gray-800">
          Galería Fotográfica
        </h2>

        <div className="relative w-full max-w-6xl mx-auto h-[550px] overflow-hidden rounded-2xl shadow-2xl">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Slide ${i + 1}`}
              className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                i === index ? "opacity-100 z-10" : "opacity-0"
              }`}
            />
          ))}

          {/* Indicadores */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-4 h-4 rounded-full border border-white transition-all ${
                  i === index
                    ? "bg-white scale-110 shadow-lg"
                    : "bg-gray-400 opacity-70"
                }`}
              />
            ))}
          </div>

        </div>

      </div>
      <section className="bg-white py-20 text-center font-montserrat">
  <div className="max-w-3xl mx-auto px-6">
    {/* Título */}
    <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
      ¡Haz la diferencia hoy!
    </h2>

    {/* Texto descriptivo */}
    <p className="text-lg text-gray-600 mb-8">
      Con tu donación apoyas la educación, nutrición y desarrollo integral de niños y jóvenes. 
      Cada aporte ayuda a brindarles un futuro lleno de oportunidades y esperanza. 💜
    </p>

    {/* Botón a WhatsApp */}
    <a
      href="https://wa.me/573245721322"
      target="_blank"
      rel="noopener noreferrer"
      className="bg-[#b595ff] hover:bg-[#9c78ff] text-white font-semibold py-3 px-8 rounded-full shadow-lg transition duration-300"
    >
      Contactanos por WhatsApp
    </a>
  </div>
</section>
    </>
  );
}

export default Home;
>>>>>>> 4cbd1a9142e14a672f15310c8802af1acf53352c
