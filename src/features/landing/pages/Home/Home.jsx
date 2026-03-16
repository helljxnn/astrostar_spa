import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaUserTie,
  FaFutbol,
  FaHandshake,
  FaGlobe,
  FaArrowRight
} from "react-icons/fa";


// Importa hero principal
import HeroMain from "./components/HeroMain";
import InscriptionSection from "./components/InscriptionSection";
import AreaModal from "./components/AreaModal";

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
  const [selectedArea, setSelectedArea] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const areas = [
    {
      id: 1,
      title: "FORMACIN DEPORTIVA",
      description: "Desarrollo tcnico, disciplina y trabajo en equipo dentro y fuera de la cancha.",
      image: "/src/features/landing/pages/Home/images/6.jpg",
      link: "/areas-proyectos#formacion-deportiva"
    },
    {
      id: 2,
      title: "ACOMPAAMIENTO PSICOSOCIAL",
      description: "Apoyo profesional que fortalece el bienestar emocional y social.",
      image: "/src/features/landing/pages/Home/images/7.jpg",
      link: "/areas-proyectos#acompanamiento-psicosocial"
    },
    {
      id: 3,
      title: "ORIENTACIN NUTRICIONAL",
      description: "Hbitos alimenticios saludables para el rendimiento y bienestar.",
      image: "/src/features/landing/pages/Home/images/8.jpg",
      link: "/areas-proyectos#orientacion-nutricional"
    },
    {
      id: 4,
      title: "BIENESTAR FSICO",
      description: "Prevencin y cuidado fsico mediante fisioterapia para una prctica deportiva segura.",
      image: "/src/features/landing/pages/Home/images/9.jpg",
      link: "/areas-proyectos#bienestar-fisico"
    }
  ];

  const handleAreaClick = (area) => {
    setSelectedArea(area);
    setIsModalOpen(true);
  };

  const stats = [
    { icon: <FaUserTie />, value: 10, text: "Profesionales en el equipo" },
    {
      icon: <FaFutbol />,
      value: 6,
      text: "Areas de accin (Deporte, Psicologa, Nutricin...)",
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

  return (
    <>
      {/* HERO Principal */}
      <HeroMain />

      {/* Sección de Inscripción */}
      <InscriptionSection />

      {/* Seccin de Donacin con Video */}
      <section className="relative bg-white py-16 px-6 sm:px-10 lg:px-20 overflow-hidden">
        {/* Decoracin de fondo sutil */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#B595FF]/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#9BE9FF]/5 to-transparent rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Video con diseo limpio */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
              className="relative group"
            >
              {/* Crculos decorativos */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-[#B595FF] to-[#9BE9FF] rounded-full opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-[#9BE9FF] to-[#B595FF] rounded-full opacity-50 group-hover:opacity-70 transition-opacity" />
              
              {/* Video container */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video bg-gray-900 ring-1 ring-gray-200">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/src/features/landing/pages/Home/images/5.mov" type="video/quicktime" />
                  <source src="/src/features/landing/pages/Home/images/5.mov" type="video/mp4" />
                </video>
              </div>

              {/* Elemento decorativo flotante */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-[#B595FF] to-[#9BE9FF] rounded-2xl opacity-20 blur-2xl group-hover:opacity-30 transition-opacity" />
            </motion.div>

            {/* Contenido de donacin */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              {/* Ttulo */}
              <div>
                <h3 className="text-4xl sm:text-5xl font-bold text-gray-900 font-montserrat leading-tight">
                  Apoya Nuestro Sueo
                </h3>
              </div>

              {/* Descripcin */}
              <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
                <p>
                  Tu donacin nos permite seguir brindando oportunidades deportivas, educativas y de desarrollo personal a nias y jvenes de nuestra fundacin.
                </p>
                <p>
                  Cada aporte contribuye directamente a la formacin de futuras lderes, fortaleciendo sus habilidades y construyendo un futuro lleno de posibilidades.
                </p>
              </div>

              {/* Botn de donacin */}
              <div className="pt-4">
                <a
                  href="/donacion"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] text-white text-lg font-semibold rounded-xl hover:shadow-lg hover:shadow-[#B595FF]/25 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span>Donar Ahora</span>
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              {/* Stats mejorados - sin cifras especficas */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#B595FF]/30 transition-colors">
                  <div className="text-2xl font-bold text-[#B595FF] mb-1">+</div>
                  <div className="text-xs text-gray-600">Impacto social</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#9BE9FF]/30 transition-colors">
                  <div className="text-2xl font-bold text-[#9BE9FF] mb-1">+</div>
                  <div className="text-xs text-gray-600">Desarrollo deportivo</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#B595FF]/30 transition-colors">
                  <div className="text-2xl font-bold text-[#B595FF] mb-1">+</div>
                  <div className="text-xs text-gray-600">Formacin integral</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      

      {/* Impacto en Cifras */}
      <section id="impacto" className="py-16 px-6 sm:px-10 lg:px-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Ttulo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-montserrat">
              Nuestro impacto en cifras:
            </h2>
          </motion.div>

          {/* Grid de impactos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Mercados Familiares */}
            <motion.div
              initial={{ opacity: 0, y: 50, rotateY: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: false }}
              transition={{
                duration: 0.8,
                delay: 0.1,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{
                y: -10,
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(181, 149, 255, 0.3)",
                transition: { duration: 0.3 },
              }}
              className="bg-white rounded-2xl p-8 shadow-lg relative overflow-hidden group cursor-pointer"
            >
              {/* Efecto de brillo animado */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B595FF]/10 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />

              {/* Icono */}
              <div className="mb-6 flex justify-center relative z-10">
                <motion.div
                  whileHover={{
                    scale: 1.2,
                    rotate: [0, -10, 10, -10, 0],
                  }}
                  transition={{
                    scale: { duration: 0.3 },
                    rotate: { duration: 0.5 },
                  }}
                >
                  <svg className="w-20 h-20 text-[#B595FF]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </motion.div>
              </div>
              
              {/* Nmero */}
              <div className="text-5xl font-bold text-[#B595FF] mb-3 text-center relative z-10">
                + DE 800
              </div>
              
              {/* Descripcin */}
              <p className="text-gray-800 font-semibold text-lg text-center relative z-10">
                Mercados Familiares
              </p>
              <p className="text-gray-600 text-base mt-1 text-center relative z-10">
                entregados anualmente
              </p>
            </motion.div>

            {/* Deportistas Impactadas */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{
                y: -10,
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(181, 149, 255, 0.3)",
                transition: { duration: 0.3 },
              }}
              className="bg-white rounded-2xl p-8 shadow-lg relative overflow-hidden group cursor-pointer"
            >
              {/* Efecto de brillo animado */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#9BE9FF]/10 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />

              {/* Icono */}
              <div className="mb-6 flex justify-center relative z-10">
                <motion.div
                  whileHover={{
                    scale: 1.2,
                    rotate: [0, 10, -10, 10, 0],
                  }}
                  transition={{
                    scale: { duration: 0.3 },
                    rotate: { duration: 0.5 },
                  }}
                >
                  <FaFutbol className="text-7xl text-[#B595FF]" />
                </motion.div>
              </div>
              
              {/* Nmero */}
              <div className="text-5xl font-bold text-[#B595FF] mb-3 text-center relative z-10">
                + DE 1000
              </div>
              
              {/* Descripcin */}
              <p className="text-gray-800 font-semibold text-lg text-center relative z-10">
                Deportistas
              </p>
              <p className="text-gray-600 text-base mt-1 text-center relative z-10">
                impactadas
              </p>
            </motion.div>

            {/* Familias Impactadas */}
            <motion.div
              initial={{ opacity: 0, y: 50, rotateY: 15 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: false }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{
                y: -10,
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(181, 149, 255, 0.3)",
                transition: { duration: 0.3 },
              }}
              className="bg-white rounded-2xl p-8 shadow-lg relative overflow-hidden group cursor-pointer"
            >
              {/* Efecto de brillo animado */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B595FF]/10 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />

              {/* Icono */}
              <div className="mb-6 flex justify-center relative z-10">
                <motion.div
                  whileHover={{
                    scale: 1.2,
                    rotate: [0, -10, 10, -10, 0],
                  }}
                  transition={{
                    scale: { duration: 0.3 },
                    rotate: { duration: 0.5 },
                  }}
                >
                  <svg className="w-20 h-20 text-[#B595FF]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                  </svg>
                </motion.div>
              </div>
              
              {/* Nmero */}
              <div className="text-5xl font-bold text-[#B595FF] mb-3 text-center relative z-10">
                + DE 60
              </div>
              
              {/* Descripcin */}
              <p className="text-gray-800 font-semibold text-lg text-center relative z-10">
                Familias impactadas
              </p>
              <p className="text-gray-600 text-base mt-1 text-center relative z-10">
                Mensualmente
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* reas y Proyectos */}
      <section className="py-16 px-6 sm:px-10 lg:px-20 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 font-montserrat mb-4">
              reas Y Proyectos
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg max-w-3xl mx-auto">
              Desarrollamos programas que integran deporte, bienestar y acompaamiento profesional para potenciar el crecimiento personal y deportivo de nias y jvenes.
            </p>
          </motion.div>

          {/* Grid de 4 reas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {areas.map((area, index) => (
              <motion.div
                key={area.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => handleAreaClick(area)}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <div className="relative h-[400px]">
                  <img
                    src={area.image}
                    alt={area.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-xl md:text-2xl font-bold font-montserrat">
                      {area.title}
                    </h3>
                  </div>

                  {/* Hover indicator */}
                  <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <FaArrowRight className="text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal de reas */}
      <AreaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        area={selectedArea}
      />

      {/* Seccin de Historias */}
      <section className="py-24 px-6 sm:px-10 lg:px-20 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
        {/* Efectos de fondo sutiles */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-[600px] h-[600px] bg-gradient-to-br from-[#B595FF]/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-gradient-to-tl from-[#9BE9FF]/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#B595FF]/5 via-[#9BE9FF]/5 to-[#B595FF]/5 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header mejorado */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-4"
            >
              <span className="px-4 py-2 bg-gradient-to-r from-[#B595FF]/10 to-[#9BE9FF]/10 backdrop-blur-sm border border-[#B595FF]/20 rounded-full text-[#B595FF] text-sm font-semibold">
                ( Nuestras Estrellas
              </span>
            </motion.div>
            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 font-montserrat mb-6 leading-tight">
              Historias que Inspiran
            </h2>
            <p className="text-gray-600 leading-relaxed text-xl max-w-3xl mx-auto">
              Ellas son el corazn de nuestro impacto. Sus historias reflejan el poder del acompaamiento, el deporte y las oportunidades.
            </p>
          </motion.div>

          {/* Grid de historias con diseo moderno y claro */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* Historia 1 - Mara Antonia */}
            <motion.div
              initial={{ opacity: 0, y: 50, rotateY: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8, delay: 0.1, type: "spring" }}
              className="group relative"
            >
              {/* Glow effect sutil */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
              
              <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl border border-gray-100 group-hover:border-[#B595FF]/30 transition-all duration-500">
                {/* Imagen con overlay mejorado */}
                <div className="relative h-96 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#B595FF]/10 to-[#9BE9FF]/10 mix-blend-overlay z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <img
                    src="/src/features/landing/pages/Home/images/Maria Antonia.jpeg"
                    alt="Mara Antonia Tascn"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-20" />
                  
                  {/* Badge flotante con animacin */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="absolute top-6 right-6 z-30"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] rounded-full blur-md opacity-50" />
                      <div className="relative bg-white backdrop-blur-md px-5 py-2.5 rounded-full border border-[#B595FF]/20 shadow-lg">
                        <span className="text-sm font-bold text-[#B595FF]">11 aos</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Nombre sobre la imagen */}
                  <div className="absolute bottom-6 left-6 right-6 z-30">
                    <h3 className="text-3xl font-bold text-white mb-2 font-montserrat drop-shadow-lg">
                      Mara Antonia Tascn
                    </h3>
                  </div>
                </div>

                {/* Contenido limpio */}
                <div className="relative p-8 bg-white">
                  {/* Descripcin */}
                  <p className="text-gray-600 text-base leading-relaxed">
                    Una historia de superacin y dedicacin que inspira a toda nuestra comunidad.
                  </p>
                </div>

                {/* Lnea decorativa animada */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#B595FF] to-transparent"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </div>
            </motion.div>

            {/* Historia 2 - Gaby Rodrguez */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
              className="group relative"
            >
              {/* Glow effect sutil */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#9BE9FF] to-[#B595FF] rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
              
              <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl border border-gray-100 group-hover:border-[#9BE9FF]/30 transition-all duration-500">
                {/* Imagen con overlay mejorado */}
                <div className="relative h-96 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#9BE9FF]/10 to-[#B595FF]/10 mix-blend-overlay z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <img
                    src="/src/features/landing/pages/Home/images/Gabi rodriguez.jpg"
                    alt="Gaby Rodrguez"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-20" />
                  
                  {/* Badge flotante con animacin */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                    className="absolute top-6 right-6 z-30"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#9BE9FF] to-[#B595FF] rounded-full blur-md opacity-50" />
                      <div className="relative bg-white backdrop-blur-md px-5 py-2.5 rounded-full border border-[#9BE9FF]/20 shadow-lg">
                        <span className="text-sm font-bold text-[#9BE9FF]">8 aos</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Nombre sobre la imagen */}
                  <div className="absolute bottom-6 left-6 right-6 z-30">
                    <h3 className="text-3xl font-bold text-white mb-2 font-montserrat drop-shadow-lg">
                      Gaby Rodrguez
                    </h3>
                  </div>
                </div>

                {/* Contenido limpio */}
                <div className="relative p-8 bg-white">
                  {/* Descripcin */}
                  <p className="text-gray-600 text-base leading-relaxed">
                    El deporte como herramienta de transformacin y crecimiento personal.
                  </p>
                </div>

                {/* Lnea decorativa animada */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#9BE9FF] to-transparent"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                />
              </div>
            </motion.div>

            {/* Historia 3 - Sofa Alejandra */}
            <motion.div
              initial={{ opacity: 0, y: 50, rotateY: 15 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
              className="group relative"
            >
              {/* Glow effect sutil */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
              
              <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl border border-gray-100 group-hover:border-[#B595FF]/30 transition-all duration-500">
                {/* Imagen con overlay mejorado */}
                <div className="relative h-96 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#B595FF]/10 to-[#9BE9FF]/10 mix-blend-overlay z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <img
                    src="/src/features/landing/pages/Home/images/Sofia alejandra.jpg"
                    alt="Sofa Alejandra Castro"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-20" />
                  
                  {/* Badge flotante con animacin */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    className="absolute top-6 right-6 z-30"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] rounded-full blur-md opacity-50" />
                      <div className="relative bg-white backdrop-blur-md px-5 py-2.5 rounded-full border border-[#B595FF]/20 shadow-lg">
                        <span className="text-sm font-bold text-[#B595FF]">11 aos</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Nombre sobre la imagen */}
                  <div className="absolute bottom-6 left-6 right-6 z-30">
                    <h3 className="text-3xl font-bold text-white mb-2 font-montserrat drop-shadow-lg">
                      Sofa Alejandra Castro
                    </h3>
                  </div>
                </div>

                {/* Contenido limpio */}
                <div className="relative p-8 bg-white">
                  {/* Descripcin */}
                  <p className="text-gray-600 text-base leading-relaxed">
                    Construyendo sueos a travs del compromiso y la pasin por el ftbol.
                  </p>
                </div>

                {/* Lnea decorativa animada */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#B595FF] to-transparent"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
          

