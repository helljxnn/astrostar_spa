import { motion } from "framer-motion";
import { InfiniteTestimonials } from "./InfiniteTestimonials";

export const TestimonialsSection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Título de testimonios */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-14 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 font-montserrat mb-4 sm:mb-6 px-2">
            <span className="text-[#9BE9FF]">Testimonios</span> de nuestra comunidad
          </h2>
          <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-[#9BE9FF] to-[#B595FF] mx-auto mb-4 sm:mb-6 rounded-full"></div>
          <p className="text-gray-600 text-base sm:text-lg md:text-xl max-w-4xl mx-auto leading-relaxed px-4">
            Escucha las voces de madres, deportistas y miembros de nuestra comunidad 
            que han vivido de cerca el impacto transformador de la Fundación Manuela Vanegas.
          </p>
        </motion.div>

        {/* Carousel infinito de testimonios */}
        <InfiniteTestimonials />

        {/* Frase final inspiracional responsive */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mt-12 sm:mt-16 md:mt-20 px-4"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#9BE9FF]/10 to-[#B595FF]/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-[#9BE9FF]/20 shadow-xl">
              <p 
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-700 italic font-light max-w-3xl mx-auto leading-relaxed"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                "Juntas construimos un futuro donde cada niña puede brillar con su propia luz."
              </p>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "60px" }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-1 bg-gradient-to-r from-[#9BE9FF] to-[#B595FF] mx-auto mt-4 sm:mt-6 rounded-full"
              ></motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};