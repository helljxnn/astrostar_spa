import { useState } from "react";
import { motion } from "framer-motion";
import { Hero } from "../../components/Hero";
import DonorSection from "../Home/components/DonorSection";
import VolunteerCard from "./components/VolunteerCard";
import VolunteerModal from "./components/VolunteerModal";
import { volunteerOpportunities } from "./data/volunteerOpportunities";

// Importar imágenes
import heroImage from "./images/hero, donacion.jpeg";
import voluntariadoImage from "./images/vountariado.jpeg";

export default function Donations() {
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsModalOpen(true);
  };

  return (
    <div>
      {/* Hero */}
      <Hero
        variant="image-only"
        imageUrl={heroImage}
      />

      {/* Sección de Voluntariado */}
      <section className="py-20 px-6 sm:px-10 lg:px-20 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 font-montserrat mb-6">
              Voluntariado
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg max-w-4xl mx-auto mb-8">
              Nuestro programa de voluntariado nace del deseo de construir comunidad, inspirar sueños y ofrecer un servicio integral que impacte de manera positiva la vida de cada participante. Ser voluntario de la fundación es convertirse en un referente positivo y acompañar procesos que promueven disciplina, respeto, liderazgo y confianza.
            </p>
          </motion.div>

          {/* Imagen destacada */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="mb-16 rounded-3xl overflow-hidden shadow-2xl"
          >
            <img
              src={voluntariadoImage}
              alt="Voluntariado"
              className="w-full h-[400px] object-cover"
            />
          </motion.div>

          {/* ¿A quién está dirigido? */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <div className="bg-gradient-to-br from-[#B595FF]/10 to-[#9BE9FF]/10 rounded-3xl p-8 md:p-12">
              <h3 className="text-3xl font-bold text-gray-900 font-montserrat mb-6">
                ¿A quién está dirigido?
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                A personas que quieran aportar su tiempo, conocimientos y energía para impactar a niñas, jóvenes y comunidades a través de procesos de formación integral. No importa si eres estudiante, profesional, deportista, artista o simplemente alguien con ganas de ayudar: todos pueden sumar.
              </p>
            </div>
          </motion.div>

          {/* Grid de características */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Qué buscamos */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-montserrat">
                  ¿Qué buscamos?
                </h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Compromiso y responsabilidad",
                  "Respeto por la niñez y el trabajo comunitario",
                  "Actitud positiva y espíritu de servicio",
                  "Ganas de aprender y trabajar en equipo"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#B595FF] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Qué ofrecemos */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-[#9BE9FF] to-[#B595FF] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-montserrat">
                  ¿Qué ofrecemos?
                </h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Experiencia en proyectos sociales y deportivos",
                  "Certificado de voluntariado",
                  "Espacios de aprendizaje y crecimiento personal",
                  "La oportunidad de inspirar y transformar vidas"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#9BE9FF] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Oportunidades de voluntariado */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h3 className="text-3xl font-bold text-gray-900 font-montserrat text-center mb-12">
              Oportunidades de Voluntariado
            </h3>
          </motion.div>

          {/* Grid de oportunidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {volunteerOpportunities.map((opportunity, index) => (
              <motion.div
                key={opportunity.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <VolunteerCard
                  opportunity={opportunity}
                  onClick={() => handleCardClick(opportunity)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Donaciones */}
      <DonorSection />

      {/* Modal */}
      <VolunteerModal
        opportunity={selectedOpportunity}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

