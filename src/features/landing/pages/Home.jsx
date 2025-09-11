import { Hero } from "../components/Hero";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaUserTie, FaFutbol, FaHandshake, FaGlobe, FaWhatsapp } from "react-icons/fa";

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
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Datos de estadísticas
  const stats = [
    { icon: <FaUserTie />, value: 10, text: "Profesionales en el equipo" },
    { icon: <FaFutbol />, value: 6, text: "Áreas de acción (Deporte, Psicología, Nutrición...)" },
    { icon: <FaHandshake />, value: 12, text: "Entregas mensuales y actividades comunitarias" },
    { icon: <FaGlobe />, value: 5, text: "Alianzas con empresas y patrocinadores" },
  ];

  const [counters, setCounters] = useState(stats.map(() => 0));
  const sectionRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Animar números
  const animateCounters = () => {
    stats.forEach((stat, i) => {
      let start = 0;
      const end = stat.value;
      const duration = 2000;
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

  // IntersectionObserver
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
      {/* Hero */}
      <Hero imageUrl="/assets/images/InicioHero.png" />

      {/* Sección Fundadora */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 py-16 items-center font-montserrat">
        {/* Imágenes con animación */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.3 } },
          }}
          className="grid grid-cols-2 gap-4"
        >
          {[
            "/assets/images/DSC03592.jpg",
            "/assets/images/DSC03581.jpg",
            "/assets/images/DSC03587.jpg",
          ].map((img, i) => (
            <motion.img
              key={i}
              src={img}
              alt={`Manuela Vanegas ${i + 1}`}
              className={`rounded-2xl ${i === 2 ? "col-span-2" : ""}`}
              variants={{
                hidden: { opacity: 0, y: 100, scale: 0.8 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            />
          ))}
        </motion.div>

        {/* Texto */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center md:text-left"
        >
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
          <h3 className="text-[#b595ff] font-bold uppercase mb-3">Fundadora</h3>
          <ul className="space-y-2 text-gray-700 font-medium">
            <li>⚽ Jugadora del Club Real Sociedad de Fútbol</li>
            <li>Selección Colombia de Mayores y procesos juveniles</li>
          </ul>
        </motion.div>
      </section>


      {/* Estadísticas */}
      <section ref={sectionRef} className="bg-white text-black py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center font-montserrat">
          {stats.map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl shadow-lg border border-gray-200 bg-white">
              <div className="text-[#b595ff] text-6xl mb-3 flex justify-center">
                {stat.icon}
              </div>
              <h3 className="text-4xl font-bold">{counters[i]}+</h3>
              <p className="text-gray-700">{stat.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Carrusel */}
      <div className="flex flex-col items-center justify-center mt-24 mb-24 px-4">
        <h2 className="text-3xl font-bold font-montserrat mb-8 text-gray-800">Galería Fotográfica</h2>
        <div className="relative w-full max-w-6xl mx-auto h-[550px] overflow-hidden rounded-2xl shadow-2xl">
          {images.map((img, i) => (
            <motion.img
              key={i}
              src={img}
              alt={`Slide ${i + 1}`}
              className="absolute top-0 left-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: i === index ? 1 : 0, scale: i === index ? 1 : 1.05 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          ))}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-4 h-4 rounded-full border border-white transition-all ${
                  i === index ? "bg-white scale-110 shadow-lg" : "bg-gray-400 opacity-70"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Donaciones */}
      <motion.section
        className="bg-white py-20 text-center font-montserrat"
        initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 90, damping: 12 }}
        viewport={{ once: true }}
      >
        <div className="max-w-3xl mx-auto px-6">
          <motion.h2
            initial={{ y: -50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            viewport={{ once: true }}
            className="text-4xl font-extrabold text-gray-900 mb-4"
          >
            ¡Haz la diferencia hoy!
          </motion.h2>

          <motion.p
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 90, damping: 15, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-gray-600 mb-8"
          >
            Con tu donación apoyas la educación, nutrición y desarrollo integral
            de niños y jóvenes. Cada aporte ayuda a brindarles un futuro lleno
            de oportunidades y esperanza. 💜
          </motion.p>

          <motion.a
            href="https://wa.me/573245721322"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 120, damping: 10, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold py-3 px-8 rounded-full shadow-lg transition duration-300 inline-block"
          >
            <FaWhatsapp className="text-2xl" />
            Contactanos por WhatsApp
          </motion.a>
        </div>
      </motion.section>
    </>
  );
}

export default Home;
