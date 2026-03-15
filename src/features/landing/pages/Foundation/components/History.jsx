import { motion } from "framer-motion";
import { useState } from "react";

export const History = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section id="historia" className="py-16 px-6 sm:px-10 lg:px-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Título de la sección */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 font-montserrat mb-4">
            Historia
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Video de YouTube con portada personalizada */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video bg-black">
              {!isPlaying ? (
                // Portada personalizada
                <div
                  className="relative w-full h-full cursor-pointer group"
                  onClick={() => setIsPlaying(true)}
                >
                  <img
                    src="/assets/images/Foundation/fmv_clip.png"
                    alt="Historia de la Fundación"
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay oscuro sutil */}
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors" />

                  {/* Botón de play minimalista */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                      <svg
                        className="w-6 h-6 text-gray-800 ml-0.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                // Video de YouTube
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/KDFqUDaX9HU?autoplay=1"
                  title="Historia de la Fundación Manuela Vanegas"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </motion.div>

          {/* Contenido de la historia */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-3xl sm:text-4xl font-bold text-gray-800 font-montserrat mb-6">
                Nuestra Historia
              </h3>
            </div>

            <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
              <p>
                Creemos firmemente que invertir tiempo, conocimiento, dedicación
                y recursos en el deporte y el desarrollo de niñas, jóvenes y
                adolescentes es apostar por una sociedad más justa, equitativa e
                inclusiva.
              </p>
              <p>
                La Fundación Manuela Vanegas nace en Copacabana con el propósito
                de formar y acompañar a niñas y adolescentes, brindándoles
                oportunidades de esparcimiento, desarrollo personal y un uso
                positivo del tiempo libre.
              </p>
              <p>
                A través del Club, acogemos a participantes principalmente de
                barrios y veredas de bajos recursos del municipio y zonas
                cercanas, ofreciendo un espacio de formación socio deportiva con
                enfoque en la equidad de género.
              </p>
            </div>

            {/* Decoración */}
            <div className="flex gap-4 pt-6">
              <div className="w-2 h-20 bg-gradient-to-b from-[#B595FF] to-[#9BE9FF] rounded-full" />
              <div className="w-2 h-16 bg-gradient-to-b from-[#9BE9FF] to-[#B595FF] rounded-full" />
              <div className="w-2 h-12 bg-gradient-to-b from-[#B595FF] to-[#9BE9FF] rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
