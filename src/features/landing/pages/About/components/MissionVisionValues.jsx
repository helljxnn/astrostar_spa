import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Star, Flame, ShieldCheck, Users } from "lucide-react";
import TeamCollage from "./TeamCollage";

export const MissionVisionValues = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const cards = [
    {
      id: "mision",
      title: "Misión",
      content:
        "Mejorar la calidad de vida y potenciar las habilidades deportivas y sociales de niñas, adolescentes y jóvenes a través de la formación integral ofrecida por la Fundación; así como aportar a su desarrollo integral mediante la promoción de valores fundamentales como el trabajo en equipo, la colaboración y la ética del trabajo.",
      gradient: "from-primary-purple/60 to-primary-blue/60",
    },
    {
      id: "vision",
      title: "Visión",
      content:
        "Las mujeres tienen derecho al deporte recreativo, formativo y competitivo. Para el año 2030, la Fundación Manuela Vanegas será un referente en la promoción de la cultura del deporte en las mujeres desde su temprana edad como una herramienta de desarrollo personal y social; así como una organización en capacidad de diseñar y ejecutar estrategias de formación y competencia para distintas instituciones públicas y privadas.",
      gradient: "from-primary-blue/60 to-primary-purple/60",
    },
  ];

  const values = [
    { text: "Disciplina", icon: <Star className="w-6 h-6" /> },
    { text: "Responsabilidad", icon: <ShieldCheck className="w-6 h-6" /> },
    { text: "Pasión", icon: <Flame className="w-6 h-6" /> },
    { text: "Respeto", icon: <Users className="w-6 h-6" /> },
    { text: "Amor", icon: <Heart className="w-6 h-6" /> },
  ];

  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }} // 👈 animación cada vez que entras
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-3xl font-bold text-gray-800 mb-4">
            Conoce los pilares que nos definen como organización
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: index * 0.2,
              }}
              viewport={{ once: false, amount: 0.3 }} // 👈
              animate={{
                scale: hoveredCard === card.id ? 1.05 : 1,
              }}
              className={`relative rounded-3xl overflow-hidden cursor-pointer
                transition-all duration-700 ease-out flex items-center justify-center
                bg-gradient-to-br ${card.gradient} backdrop-blur-xl`}
            >
              <div className="text-center text-black px-6 py-8">
                <motion.h3
                  animate={{
                    fontSize: hoveredCard === card.id ? "1.75rem" : "1.25rem",
                  }}
                  transition={{ duration: 0.3 }}
                  className="font-bold mb-4"
                >
                  {card.title}
                </motion.h3>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: hoveredCard === card.id ? 1 : 0,
                    height: hoveredCard === card.id ? "auto" : 0,
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <p className="text-base md:text-lg leading-relaxed px-2">
                    {card.content}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Valores */}
        <div className="text-center">
          <motion.h3
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 12 }}
            viewport={{ once: false, amount: 0.3 }} // 👈
            className="text-2xl font-bold text-primary-purple mb-12"
          >
            Valores
          </motion.h3>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-5 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }} // 👈
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2 },
              },
            }}
          >
            {values.map((val, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.15 }}
                transition={{ type: "spring", stiffness: 300, damping: 12 }}
                className="flex flex-col items-center justify-center p-6 rounded-2xl 
                bg-white/70 backdrop-blur-lg shadow-md border border-white/40"
              >
                <div className="text-primary-purple mb-3">{val.icon}</div>
                <span className="font-semibold text-gray-700">{val.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Equipo de trabajo */}
      <TeamCollage />
    </section>
  );
};
