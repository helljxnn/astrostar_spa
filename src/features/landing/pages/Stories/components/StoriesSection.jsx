import { motion } from "framer-motion";
import { StoryCard } from "./StoryCard";
import { storiesData } from "../data/storiesData";

export const StoriesSection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Título de la sección */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 font-montserrat mb-4 sm:mb-6 px-2">
            Historias que <span className="text-[#B595FF]">inspiran</span>
          </h1>
          <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] mx-auto mb-4 sm:mb-6 rounded-full"></div>
          <p className="text-gray-600 text-base sm:text-lg md:text-xl max-w-4xl mx-auto leading-relaxed px-4">
            Conoce las historias de nuestras niñas futbolistas, sus sueños, logros y cómo 
            la Fundación Manuela Vanegas ha transformado sus vidas dentro y fuera del campo.
          </p>
        </motion.div>

        {/* Grid de historias con diseño exótico responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12 lg:gap-16">
          {storiesData.map((story, index) => (
            <StoryCard key={story.id} story={story} index={index} />
          ))}
        </div>

        {/* Frase inspiracional con diseño exótico responsive */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center mt-16 sm:mt-20 md:mt-24 px-4"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#B595FF]/10 to-[#9BE9FF]/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-[#B595FF]/20 shadow-2xl">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="text-4xl sm:text-5xl md:text-6xl text-[#B595FF]/20 mb-2 sm:mb-4"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                "
              </motion.div>
              <p 
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-700 italic font-light max-w-3xl mx-auto leading-relaxed"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Cada niña es una historia que vale la pena contar, 
                cada sueño es una meta que vale la pena alcanzar.
              </p>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "80px" }}
                transition={{ duration: 1, delay: 1.2 }}
                className="h-1 bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] mx-auto mt-6 sm:mt-8 rounded-full"
              ></motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};