import { motion } from "framer-motion";

export const Hero = ({ title, imageUrl, subtitle }) => {
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
            className="text-sm sm:text-base lg:text-lg text-gray-800 font-montserrat"
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>
    </section>
  );
};
