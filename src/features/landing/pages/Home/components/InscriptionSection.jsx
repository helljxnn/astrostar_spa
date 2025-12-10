import { useState } from "react";
import { FaUserPlus, FaStar, FaTrophy } from "react-icons/fa";
import { motion } from "framer-motion";
import PreRegistrationModal from "../../../components/PreRegistrationModal";

export default function InscriptionSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="relative py-24 md:py-32 overflow-hidden bg-white">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B595FF] rounded-full opacity-[0.08] blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#9BE9FF] rounded-full opacity-[0.08] blur-3xl"></div>
        
        {/* Iconos flotantes decorativos */}
        <motion.div
          className="absolute top-20 left-10 text-[#B595FF] opacity-20"
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <FaStar size={40} />
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-10 text-[#9BE9FF] opacity-20"
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <FaTrophy size={50} />
        </motion.div>
        <motion.div
          className="absolute top-1/2 right-1/4 text-[#B595FF] opacity-15"
          animate={{ y: [0, 15, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <FaStar size={30} />
        </motion.div>
        <motion.div
          className="absolute bottom-1/3 left-1/4 text-[#9BE9FF] opacity-15"
          animate={{ y: [0, -15, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 5.5, repeat: Infinity }}
        >
          <FaTrophy size={35} />
        </motion.div>

        {/* Contenido principal */}
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="text-center space-y-10">
            {/* Título principal */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
                ¡Únete a Nosotros!
              </h2>
              <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#B595FF]">
                Fundación Manuela Vanegas
              </div>
            </motion.div>

            {/* Subtítulo */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto font-medium"
            >
              Desarrolla tu talento deportivo y alcanza tus sueños con nosotros
            </motion.p>

            {/* Botón principal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-4"
            >
              <motion.button
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center gap-3 px-12 sm:px-16 py-5 sm:py-6 bg-[#B595FF] text-white rounded-full shadow-2xl hover:shadow-[#B595FF]/50 hover:bg-[#9b70ff] transition-all duration-300 font-bold text-lg sm:text-xl overflow-hidden"
              >
                {/* Efecto de brillo */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                
                <FaUserPlus className="text-2xl relative z-10" />
                <span className="relative z-10">Inscríbete Ahora</span>
                
                {/* Círculo decorativo */}
                <motion.div
                  className="absolute -right-2 -top-2 w-20 h-20 bg-white/20 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                ></motion.div>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      <PreRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
