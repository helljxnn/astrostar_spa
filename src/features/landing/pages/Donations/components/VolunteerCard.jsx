import { motion } from "framer-motion";

export default function VolunteerCard({ opportunity, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}
      transition={{ duration: 0.6, type: "spring" }}
      whileHover={{
        y: -10,
        boxShadow: "0 20px 40px rgba(181, 149, 255, 0.2)",
        transition: { duration: 0.3 },
      }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl bg-white shadow-xl border border-gray-100 hover:border-[#B595FF]/30 transition-all duration-500 cursor-pointer"
    >
      {/* Imagen */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={opportunity.image}
          alt={opportunity.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Icono */}
        <div className="absolute top-6 right-6">
          <div className="w-16 h-16 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-3xl shadow-lg">
            {opportunity.icon}
          </div>
        </div>

        {/* Título */}
        <div className="absolute bottom-6 left-6 right-6">
          <h3 className="text-2xl font-bold text-white font-montserrat drop-shadow-lg">
            {opportunity.title}
          </h3>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        <p className="text-gray-600 text-base leading-relaxed mb-4">
          {opportunity.summary}
        </p>
        <div className="flex items-center gap-2 text-[#B595FF] font-semibold">
          <span>Ver más detalles</span>
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Línea decorativa */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#B595FF] to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: false }}
        transition={{ delay: 0.3, duration: 0.8 }}
      />
    </motion.div>
  );
}
