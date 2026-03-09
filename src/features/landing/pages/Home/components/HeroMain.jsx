import { motion, useScroll, useTransform } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import { useRef } from "react";
import heroImage from "../images/1.jpg";

export default function HeroMain() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* Image Section - Solo la imagen sin texto */}
      <motion.div
        style={{ y }}
        className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh]"
      >
        <img
          src={heroImage}
          alt="Fundación Manuela Vanegas"
          className="w-full h-full object-cover object-center"
        />
        {/* Overlay sutil */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20" />
      </motion.div>

      {/* Content Section - Todo el texto debajo de la imagen */}
      <div className="relative bg-white py-16 md:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-5xl mx-auto text-center">
            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight">
                <span className="block mb-2 text-gray-900">
                  Formamos personas,
                </span>
                <span className="block mb-2 text-[#B595FF]">
                  Inspiramos sueños
                </span>
                <span className="block text-gray-900">
                  y Transformamos realidades
                </span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-10 max-w-3xl mx-auto"
            >
              <p className="text-lg md:text-xl lg:text-2xl text-gray-700 leading-relaxed">
                La Fundación Manuela Vanegas nace del compromiso social de la
                futbolista Manuela Vanegas con el{" "}
                <span className="font-bold text-[#B595FF]">
                  desarrollo integral de niñas y jóvenes mujeres
                </span>
                . A través del deporte, la educación en valores y el
                acompañamiento humano, generamos espacios seguros donde pueden
                descubrir su potencial.
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex justify-center"
            >
              <motion.a
                href="/fundacion"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] text-white font-black text-lg rounded-full shadow-2xl overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#9BE9FF] to-[#B595FF] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                <span className="relative z-10">Ver más</span>
                <FaArrowRight className="relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
              </motion.a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
