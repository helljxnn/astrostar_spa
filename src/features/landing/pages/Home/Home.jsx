import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserTie,
  FaFutbol,
  FaHandshake,
  FaGlobe,
  FaWhatsapp,
} from "react-icons/fa";
import {
  heroTextAnim,
  heroDateAnim,
  statAnim,
  founderTextAnim,
  founderImgAnim,
  donationImgAnim,
  donationTextAnim,
  donationBtnAnim,
} from "./hooks/homeAnimations";

import img1 from "./images/Carrusel/DSC03553.jpg";
import img2 from "./images/Carrusel/DSC03567.jpg";
import img3 from "./images/Carrusel/DSC03572.jpg";
import img4 from "./images/Carrusel/DSC03576.jpg";
import img5 from "./images/Carrusel/DSC03581.jpg";
import img6 from "./images/Carrusel/DSC03587.jpg";
import img7 from "./images/Carrusel/DSC03592.jpg";

import manuelaImg from "./images/Manuela.jpg";
import donacionImg from "./images/donacion.png";

// 👇 Logos de Marcas Aliadas
import adidas from "./images/provedores/adidas.png";
import ara from "./images/provedores/ara.jpg";
import homecenter from "./images/provedores/homecenter.png";
import novasport from "./images/provedores/NovaSport.jpg";
import natipan from "./images/provedores/Natipan.png";
import ponymalta from "./images/provedores/ponymalta.png";

/* ==== Contador ==== */
function AnimatedCounter({ target }) {
  const [count, setCount] = useState(0);

  return (
    <motion.span
      className="text-4xl font-bold block"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1, transition: { duration: 0.4 } }}
      onViewportEnter={() => {
        setCount(0);
        const step = Math.ceil(target / 40);
        const interval = setInterval(() => {
          setCount((c) => {
            if (c + step >= target) {
              clearInterval(interval);
              return target;
            }
            return c + step;
          });
        }, 30);
      }}
    >
      {count}+
    </motion.span>
  );
}

export default function Home() {
  const [index, setIndex] = useState(0);
  const images = [img1, img2, img3, img4, img5, img6, img7];
  const dates = [
    "5 de Septiembre de 2025",
    "12 de Septiembre de 2025",
    "20 de Septiembre de 2025",
    "28 de Septiembre de 2025",
    "3 de Octubre de 2025",
    "10 de Octubre de 2025",
    "18 de Octubre de 2025",
  ];

  // Cambio automático del carrusel
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

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
    {
      icon: <FaGlobe />,
      value: 5,
      text: "Alianzas con empresas y patrocinadores",
    },
  ];

  // 👇 Logos para el carrusel
  const logos = [adidas, ara, homecenter, novasport, natipan, ponymalta];

  return (
    <>
      {/* HERO con carrusel */}
      <section className="relative h-[80vh] grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Texto */}
        <motion.div
          {...heroTextAnim}
          className="flex flex-col justify-center items-start px-10 md:px-20 bg-white text-gray-800 z-10"
        >
          <h1 className="text-5xl font-extrabold text-[#b595ff] mb-6 mt-10 md:mt-20">
            Fundación Manuela Vanegas
          </h1>
          <p className="text-lg leading-relaxed max-w-lg">
            Apoyamos el desarrollo integral de niñas y jóvenes a través del
            deporte, la educación y la inclusión social. 💜⚽
          </p>
        </motion.div>

        {/* Carrusel */}
        <div className="relative w-full h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.6, scale: 1.01 }}
              transition={{ duration: 1.2, ease: [0.45, 0.05, 0.55, 0.95] }}
            >
              <img
                src={images[index]}
                alt={`Slide ${index + 1}`}
                className="absolute top-0 left-0 w-full h-full object-cover max-h-[80vh]"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20" />
            </motion.div>
          </AnimatePresence>

          {/* Fecha */}
          <motion.div
            key={`date-${index}`}
            {...heroDateAnim}
            className="absolute top-6 left-6 bg-white/80 backdrop-blur-md text-gray-900 px-4 py-2 rounded-lg shadow-md text-sm font-semibold"
          >
            {dates[index]}
          </motion.div>

          {/* Bolitas del carrusel */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
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

      {/* Fundadora */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
          <motion.div {...founderTextAnim}>
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
              Manuela inició en escuelas locales y en Formas Íntimas, luego
              jugó en selecciones Antioquia y Colombia. Fue subcampeona con
              Independiente Medellín, continuó en la liga española disputando
              Champions y Supercopa, y fundó la Fundación Manuela Vanegas para
              apoyar el fútbol femenino. 💜⚽
            </p>
          </motion.div>

          <motion.div {...founderImgAnim} className="flex justify-center">
            <img
              src={manuelaImg}
              alt="Manuela Vanegas"
              className="rounded-2xl shadow-xl w-[400px] h-[500px] object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="bg-white text-black py-16">
        <motion.h2
          {...statAnim.header}
          className="text-4xl font-bold text-center mb-12"
        >
          Nuestras Estadísticas
        </motion.h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center font-montserrat">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              {...statAnim.item(i)}
              className="p-6 rounded-2xl shadow-lg border border-gray-200 bg-white"
            >
              <div className="text-[#b595ff] text-6xl mb-3 flex justify-center">
                {stat.icon}
              </div>
              <AnimatedCounter target={stat.value} />
              <p className="text-gray-700">{stat.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Donaciones + Marcas Aliadas */}
      <motion.section
        id="donaciones"
        className="bg-white py-20 font-montserrat"
        {...donationImgAnim.section}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
          <motion.div {...donationImgAnim.img} className="flex justify-center">
            <img
              src={donacionImg}
              alt="Donación fútbol"
              className="rounded-2xl shadow-xl w-[500px] h-[400px] object-cover"
            />
          </motion.div>

          <motion.div {...donationTextAnim} className="text-center">
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
              {...donationBtnAnim}
              className="inline-flex items-center justify-center gap-2 bg-[#b595ff] hover:bg-[#9b70ff] text-white font-semibold py-2 px-5 rounded-full shadow-md text-sm"
            >
              <FaWhatsapp className="text-lg" />
              WhatsApp
            </motion.a>
          </motion.div>
        </div>

        {/* Marcas aliadas */}
        <section className="bg-gray-50 py-16 text-center overflow-hidden relative mt-20">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-10">
            Marcas Aliadas
          </h2>

          <div className="relative w-full overflow-hidden">
            <motion.div
              className="flex gap-16"
              initial={{ x: 0 }}
              animate={{ x: "-50%" }}
              transition={{
                repeat: Infinity,
                repeatType: "loop",
                duration: 20,
                ease: "linear",
              }}
            >
              {[...Array(2)].map((_, idx) => (
                <div key={idx} className="flex gap-16">
                  {logos.map((logo, i) => (
                    <img
                      key={i}
                      src={logo}
                      alt={`Logo-${i}`}
                      className="h-20 w-auto object-contain"
                    />
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      </motion.section>
    </>
  );
}
