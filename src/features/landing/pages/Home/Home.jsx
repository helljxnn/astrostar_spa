import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaUserTie,
  FaFutbol,
  FaHandshake,
  FaGlobe,
  FaWhatsapp,
} from "react-icons/fa";
import {
  heroTextAnim,
  statAnim,
  founderTextAnim,
  founderImgAnim,
  donationImgAnim,
  donationTextAnim,
  donationBtnAnim,
} from "./hooks/homeAnimations";

import manuelaImg from "./images/Manuela.jpg";
import donacionImg from "./images/donacion.png";

// Logos de Marcas Aliadas
import adidas from "./images/provedores/adidas.png";
import ara from "./images/provedores/ara.jpg";
import homecenter from "./images/provedores/homecenter.png";
import novasport from "./images/provedores/NovaSport.jpg";
import natipan from "./images/provedores/Natipan.png";
import ponymalta from "./images/provedores/ponymalta.png";

// Importa carrusel
import HeroCarousel from "./components/HeroCarousel";

//
import "./styles/home.css";

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

  const logos = [adidas, ara, homecenter, novasport, natipan, ponymalta];

  return (
    <>
      {/* HERO con Accordion Carousel */}
      <section className="hero-section">
        <HeroCarousel />
      </section>

      {/* Fundadora */}
      <section className="bg-white py-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
          {/* Imagen con animación */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            whileHover={{ scale: 1.03, rotate: 1 }}
            className="flex justify-center"
          >
            <img
              src={manuelaImg}
              alt="Manuela Vanegas"
              className="rounded-3xl shadow-2xl w-[400px] h-[500px] object-cover border-4 border-white"
            />
          </motion.div>

          {/* Texto con animaciones en cascada */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.2, duration: 0.6 },
              },
            }}
          >
            <motion.h2
              className="text-4xl font-extrabold text-gray-900 mb-2 relative inline-block"
              variants={{
                hidden: { opacity: 0, x: -30 },
                visible: { opacity: 1, x: 0 },
              }}
            >
              Nuestra Fundadora
            </motion.h2>

            <motion.h3
              className="text-2xl font-semibold text-[#b595ff] mb-8"
              variants={{
                hidden: { opacity: 0, x: -30 },
                visible: { opacity: 1, x: 0 },
              }}
            >
              Manuela Vanegas
            </motion.h3>

            <div className="space-y-5 text-lg text-gray-700 leading-relaxed">
              <motion.div
                className="flex items-start gap-3"
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <FaFutbol className="text-[#b595ff] text-xl mt-1" />
                <p>
                  Nacida en <strong>Copacabana, Antioquia</strong>, futbolista
                  profesional en la
                  <strong> Real Sociedad</strong> e integrante de la{" "}
                  <strong>Selección Colombia</strong>.
                </p>
              </motion.div>

              <motion.div
                className="flex items-start gap-3"
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <FaGlobe className="text-[#b595ff] text-xl mt-1" />
                <p>
                  Ha jugado en clubes de <strong>España</strong>, disputando
                  Champions y Supercopa.
                </p>
              </motion.div>

              <motion.div
                className="flex items-start gap-3"
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <FaHandshake className="text-[#b595ff] text-xl mt-1" />
                <p>
                  Inició en <strong>Formas Íntimas</strong> y en selecciones
                  Antioquia y Colombia.
                </p>
              </motion.div>

              <motion.div
                className="flex items-start gap-3"
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <FaUserTie className="text-[#b595ff] text-xl mt-1" />
                <p>
                  Fundadora de la <strong>Fundación Manuela Vanegas</strong>{" "}
                  para impulsar el fútbol femenino. 💜⚽
                </p>
              </motion.div>
            </div>
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
        <section className="bg-white py-16 text-center overflow-hidden relative mt-20">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-10">
            Marcas Aliadas
          </h2>

          <div className="relative w-full overflow-hidden">
            <motion.div
              className="flex gap-16 min-w-max"
              initial={{ x: 0 }}
              animate={{ x: "-50%" }}
              transition={{
                repeat: Infinity,
                repeatType: "loop",
                duration: 20,
                ease: "linear",
              }}
            >
              {/* Duplicamos el track */}
              {[...Array(2)].map((_, idx) => (
                <div key={idx} className="flex gap-16">
                  {logos.map((logo, i) => (
                    <img
                      key={`${idx}-${i}`}
                      src={logo}
                      alt={`Logo-${i}`}
                      className="h-20 w-auto object-contain flex-shrink-0"
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
