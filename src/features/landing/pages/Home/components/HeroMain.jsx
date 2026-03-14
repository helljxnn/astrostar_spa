import { motion, useScroll, useTransform } from "framer-motion";
import { FaArrowRight, FaHeart } from "react-icons/fa";
import { useRef, useState } from "react";
import heroImage from "../images/1.jpg";
import misionVisionImage from "../images/2.jpg";
import historiaImage from "../images/3.jpg";
import equipoImage from "../images/4.jpg";
import donationVideo from "../images/5.mov";
import PreRegistrationModal from "../../../components/PreRegistrationModal";

export default function HeroMain() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section ref={ref} className="relative overflow-hidden bg-white">
      {/* Hero Section - Text over Image */}
      <div className="relative min-h-screen flex items-center justify-start group cursor-pointer">
        {/* Background Image */}
        <motion.div
          style={{ y }}
          className="absolute inset-0"
        >
          <img
            src={heroImage}
            alt="Fundación Manuela Vanegas"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-all duration-500" />
        </motion.div>

        {/* Text Content Over Image - Appears on Hover */}
        <div className="relative z-10 w-full max-w-2xl ml-8 md:ml-16 lg:ml-24 px-6 lg:px-8 text-left text-white space-y-6 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out transform translate-x-[-20px] group-hover:translate-x-0">
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
            Formamos personas, inspiramos sueños y transformamos realidades.
          </h1>
          
          <p className="text-lg md:text-xl leading-relaxed">
            La Fundación Manuela Vanegas nace del compromiso social de la
            futbolista Manuela Vanegas con el desarrollo integral de niñas y jóvenes mujeres. 
            A través del deporte, la educación en valores y el acompañamiento humano, 
            generamos espacios seguros donde pueden descubrir su potencial.
          </p>

          <a
            href="/fundacion"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#B595FF] text-base font-bold rounded-lg hover:bg-gray-100 transition-all hover:gap-4 shadow-2xl"
          >
            Ver más
            <FaArrowRight className="text-sm" />
          </a>
        </div>
      </div>

      {/* Quienes Somos Section */}
      <div className="bg-white py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          {/* Header Section - Title and Description Side by Side */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16 md:mb-20">
            {/* Left - Title */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-[#B595FF]">Quiénes </span>
                <span className="text-gray-900">somos</span>
              </h2>
            </motion.div>

            {/* Right - Description */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <p className="text-2xl md:text-3xl text-gray-800 font-medium">
                Aquí el talento y los valores crecen juntos.
              </p>
              <p className="text-xl text-gray-600">
                Conoce el impacto que estamos construyendo con niñas y jóvenes.
              </p>
            </motion.div>
          </div>

          {/* Three Cards Section */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {/* Card 1 - Nuestra Misión/Visión */}
            <motion.a
              href="/fundacion#mision-vision"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group relative cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-3xl shadow-xl h-[350px] md:h-[400px]">
                <img
                  src={misionVisionImage}
                  alt="Nuestra Misión/Visión"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:translate-y-[-8px] transition-transform duration-300">
                    Nuestra Misión/Visión
                  </h3>
                  <div className="flex items-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium">Descubre más</span>
                    <FaArrowRight className="text-xs" />
                  </div>
                </div>

                {/* Decorative element */}
                <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-[#B595FF]/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <FaArrowRight className="text-white text-lg" />
                </div>
              </div>
            </motion.a>

            {/* Card 2 - Nuestra Historia */}
            <motion.a
              href="/fundacion#historia"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-3xl shadow-xl h-[350px] md:h-[400px]">
                <img
                  src={historiaImage}
                  alt="Nuestra Historia"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:translate-y-[-8px] transition-transform duration-300">
                    Nuestra Historia
                  </h3>
                  <div className="flex items-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium">Descubre más</span>
                    <FaArrowRight className="text-xs" />
                  </div>
                </div>

                {/* Decorative element */}
                <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-[#B595FF]/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <FaArrowRight className="text-white text-lg" />
                </div>
              </div>
            </motion.a>

            {/* Card 3 - Nuestro Equipo */}
            <motion.a
              href="/fundacion#equipo"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="group relative cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-3xl shadow-xl h-[350px] md:h-[400px]">
                <img
                  src={equipoImage}
                  alt="Nuestro Equipo"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:translate-y-[-8px] transition-transform duration-300">
                    Nuestro Equipo
                  </h3>
                  <div className="flex items-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium">Descubre más</span>
                    <FaArrowRight className="text-xs" />
                  </div>
                </div>

                {/* Decorative element */}
                <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-[#B595FF]/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <FaArrowRight className="text-white text-lg" />
                </div>
              </div>
            </motion.a>
          </div>
        </div>
      </div>

      {/* Modal de inscripción */}
      <PreRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
