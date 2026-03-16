import { useState } from "react";
import { motion } from "framer-motion";
import { FaUserPlus } from "react-icons/fa";
import PreRegistrationModal from "./PreRegistrationModal";

export const Hero = ({
  title,
  imageUrl,
  subtitle,
  showInscriptionButton = false,
  variant = "default",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Variante solo imagen (sin texto ni cuadro blanco)
  if (variant === "image-only") {
    return (
      <section
        className="relative min-h-screen flex justify-center items-center"
        style={{
          marginLeft: "calc(-50vw + 50%)",
          marginRight: "calc(-50vw + 50%)",
          width: "100vw",
          backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay muy sutil solo para mejorar contraste si es necesario */}
        <div className="absolute inset-0 bg-black/10" />
      </section>
    );
  }

  if (!title && !subtitle) return null;

  return (
    <section
      className="relative min-h-screen flex justify-center items-end px-6 sm:px-10 lg:px-16 pb-16 sm:pb-20 lg:pb-28"
      style={{
        marginLeft: "calc(-50vw + 50%)",
        marginRight: "calc(-50vw + 50%)",
        width: "100vw",
        backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay sutil */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent" />

      {/* Contenido */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative bg-white/80 backdrop-blur-md p-5 sm:p-8 lg:p-10 rounded-2xl shadow-2xl max-w-3xl text-center"
      >
        {title && (
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] font-montserrat mb-3 sm:mb-4"
          >
            {title}
          </motion.h1>
        )}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-sm sm:text-base lg:text-lg text-gray-800 font-montserrat mb-6"
          >
            {subtitle}
          </motion.p>
        )}

        {showInscriptionButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 mx-auto px-8 py-4 bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] text-white rounded-full shadow-lg hover:shadow-xl transition-all font-semibold text-lg"
          >
            <FaUserPlus size={24} />
            ¡Inscríbete Aquí!
          </motion.button>
        )}
      </motion.div>

      {/* Modal de Pre-inscripción */}
      <PreRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};

