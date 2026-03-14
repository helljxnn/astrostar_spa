import { motion } from "framer-motion";

export default function VolunteerModal({ opportunity, isOpen, onClose }) {
  if (!isOpen || !opportunity) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header con imagen */}
        <div className="relative h-64">
          <img
            src={opportunity.image}
            alt={opportunity.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-lg">
                {opportunity.icon}
              </div>
              <h2 className="text-3xl font-bold text-white font-montserrat drop-shadow-lg">
                {opportunity.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-8 space-y-8">
          {/* Resumen */}
          <div>
            <p className="text-gray-700 text-lg leading-relaxed">
              {opportunity.summary}
            </p>
          </div>

          {/* Actividades */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 font-montserrat mb-4">
              Actividades del voluntario
            </h3>
            <ul className="space-y-3">
              {opportunity.activities.map((activity, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{activity}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Requisitos */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 font-montserrat mb-4">
              Requisitos
            </h3>
            <ul className="space-y-3">
              {opportunity.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#9BE9FF] to-[#B595FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{requirement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ubicación */}
          <div className="bg-gradient-to-r from-[#B595FF]/10 to-[#9BE9FF]/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6 text-[#B595FF]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <h4 className="text-lg font-bold text-gray-900">Ubicación</h4>
            </div>
            <p className="text-gray-700">Copacabana, Antioquia</p>
            <p className="text-gray-600 text-sm mt-1">Las fechas y horarios se coordinan según disponibilidad del voluntario</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
