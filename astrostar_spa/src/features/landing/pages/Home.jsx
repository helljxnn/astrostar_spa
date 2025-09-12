
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserTie,
  FaFutbol,
  FaHandshake,
  FaGlobe,
  FaWhatsapp,
} from "react-icons/fa";

function Home() {
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

  // Fechas correspondientes (ejemplo)
  const dates = [
    "5 de Septiembre de 2025",
    "12 de Septiembre de 2025",
    "20 de Septiembre de 2025",
    "28 de Septiembre de 2025",
    "3 de Octubre de 2025",
    "10 de Octubre de 2025",
    "18 de Octubre de 2025",
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
    {
      icon: <FaFutbol />,
      value: 6,
      text: "Áreas de acción (Deporte, Psicología, Nutrición...)",
    },
    {
      icon: <FaHandshake />,
      value: 12,
      text: "Entregas mensuales y actividades comunitarias",
    },
    { icon: <FaGlobe />, value: 5, text: "Alianzas con empresas y patrocinadores" },
  ];

  return (
    <>
      {/* HERO tipo portada con carrusel y texto */}
      <section className="relative h-[92vh] grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Columna izquierda con fondo blanco */}
        <div className="flex flex-col justify-center items-start px-10 md:px-20 bg-white text-gray-800 z-10">
          <h1 className="text-5xl font-extrabold text-[#b595ff] mb-6">
            Fundación Manuela Vanegas
          </h1>
          <p className="text-lg leading-relaxed max-w-lg">
            Apoyamos el desarrollo integral de niñas y jóvenes a través del
            deporte, la educación y la inclusión social. 💜⚽
          </p>
        </div>

        {/* Columna derecha con carrusel */}
        <div className="relative w-full h-full">
          <AnimatePresence mode="wait">
            <motion.img
              key={index}
              src={images[index]}
              alt={`Slide ${index + 1}`}
              className="absolute top-0 left-0 w-full h-full object-cover rounded-l-3xl"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{
                duration: 1.5,
                ease: [0.25, 0.1, 0.25, 1], // cubic-bezier suave
              }}
            />
          </AnimatePresence>

          {/* Fecha sobre la imagen */}
          <motion.div
            key={`date-${index}`}
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-6 left-6 bg-white/80 backdrop-blur-md text-gray-900 px-4 py-2 rounded-lg shadow-md text-sm font-semibold"
          >
            {dates[index]}
          </motion.div>

          {/* Indicadores en forma de círculo */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  index === i
                    ? "bg-[#b595ff] scale-125"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Nuestra Fundadora */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
          {/* Texto */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Nuestra Fundadora
            </h2>
            <h3 className="text-2xl font-semibold text-[#b595ff] mb-6">
              Manuela Vanegas
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Nacida el 9 de noviembre de 2000 en Copacabana, Antioquia,
              Manuela es futbolista profesional y una de las mayores exponentes
              del talento deportivo nacional. Actualmente juega en la Real
              Sociedad de Fútbol y es integrante de la Selección Colombia de
              Mayores.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Manuela Vanegas inició en escuelas locales y en Formas Íntimas,
              luego jugó en selecciones Antioquia y Colombia. Fue subcampeona
              con Independiente Medellín, continuó en la liga española
              disputando Champions y Supercopa, y fundó la Fundación Manuela
              Vanegas para apoyar el fútbol femenino. 💜⚽
            </p>
          </motion.div>

          {/* Foto */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <img
              src="/assets/images/Manuela.jpg"
              alt="Manuela Vanegas"
              className="rounded-2xl shadow-xl w-[400px] h-[500px] object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="bg-white text-black py-16">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.5 }}
          className="text-4xl font-bold text-center mb-12"
        >
          Nuestras Estadísticas
        </motion.h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center font-montserrat">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              viewport={{ once: false, amount: 0.5 }}
              className="p-6 rounded-2xl shadow-lg border border-gray-200 bg-white"
            >
              <div className="text-[#b595ff] text-6xl mb-3 flex justify-center">
                {stat.icon}
              </div>
              <span className="text-4xl font-bold block">{stat.value}+</span>
              <p className="text-gray-700">{stat.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Donaciones */}
      <motion.section
        id="donaciones"
        className="bg-white py-20 font-montserrat"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 90, damping: 12 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
          {/* Imagen izquierda */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <img
              src="/assets/images/donacion.png"
              alt="Donación fútbol"
              className="rounded-2xl shadow-xl w-[500px] h-[400px] object-cover"
            />
          </motion.div>

          {/* Texto derecha */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              ¡Haz la diferencia hoy!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Con tu donación apoyas la educación, nutrición y desarrollo
              integral de niñas futbolistas. Cada aporte les brinda un futuro
              lleno de oportunidades y esperanza. 💜⚽
            </p>

            <motion.a
              href="https://wa.me/573245721322"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              whileHover={{
                scale: 1.1,
                boxShadow: "0px 0px 20px rgba(181,149,255,0.7)",
              }}
              transition={{ type: "spring", stiffness: 120, damping: 10 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center gap-2 bg-[#b595ff] hover:bg-[#9b70ff] text-white font-semibold py-2 px-5 rounded-full shadow-md text-sm"
            >
              <FaWhatsapp className="text-lg" />
              WhatsApp
            </motion.a>
          </motion.div>
        </div>
      </motion.section>
    </>
  );
}

export default Home;
