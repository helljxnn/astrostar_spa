import { motion } from "framer-motion";
import { FaHeart, FaBullseye, FaHandshake } from "react-icons/fa";

export const MissionVisionObjective = () => {
  const values = [
    {
      icon: "/assets/images/Foundation/AMOR.PNG",
      title: "AMOR",
      alt: "Amor",
    },
    {
      icon: "/assets/images/Foundation/DISCIPLINA.PNG",
      title: "DISCIPLINA",
      alt: "Disciplina",
    },
    {
      icon: "/assets/images/Foundation/RESPETO.PNG",
      title: "RESPETO",
      alt: "Respeto",
    },
  ];

  return (
    <section id="mision-vision" className="py-16 px-6 sm:px-10 lg:px-20 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Título de la sección */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 font-montserrat">
            Misión, Visión y Objetivo
          </h2>
        </motion.div>

        {/* Grid de Misión, Visión y Objetivo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Misión */}
          <motion.div
            initial={{ opacity: 0, y: 50, rotateY: -15 }}
            whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
            viewport={{ once: false }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              type: "spring",
              stiffness: 100,
            }}
            whileHover={{
              y: -10,
              scale: 1.03,
              boxShadow: "0 20px 40px rgba(181, 149, 255, 0.3)",
              transition: { duration: 0.3 },
            }}
            className="bg-gradient-to-br from-[#B595FF]/10 to-[#9BE9FF]/10 rounded-2xl p-8 shadow-lg relative overflow-hidden group cursor-pointer"
          >
            {/* Efecto de brillo animado */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />

            <div className="flex justify-center mb-6 relative z-10">
              <motion.div
                whileHover={{
                  scale: 1.2,
                  rotate: [0, -10, 10, -10, 0],
                  boxShadow: "0 10px 30px rgba(181, 149, 255, 0.5)",
                }}
                transition={{
                  scale: { duration: 0.3 },
                  rotate: { duration: 0.5 },
                  boxShadow: { duration: 0.3 },
                }}
                className="w-16 h-16 bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] rounded-full flex items-center justify-center shadow-lg"
              >
                <FaHeart className="text-white text-3xl" />
              </motion.div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 font-montserrat mb-4 text-center relative z-10">
              MISIÓN
            </h3>
            <p className="text-gray-700 leading-relaxed text-center relative z-10">
              Mejorar la calidad de vida y potenciar las habilidades deportivas
              y sociales de niñas, adolescentes y jóvenes a través de la
              formación integral ofrecida por la Fundación; así como aportar a
              su desarrollo integral mediante la promoción de valores
              fundamentales como el trabajo en equipo, la colaboración y la
              ética del trabajo.
            </p>
          </motion.div>

          {/* Visión */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              type: "spring",
              stiffness: 100,
            }}
            whileHover={{
              y: -10,
              scale: 1.03,
              boxShadow: "0 20px 40px rgba(155, 233, 255, 0.3)",
              transition: { duration: 0.3 },
            }}
            className="bg-gradient-to-br from-[#9BE9FF]/10 to-[#B595FF]/10 rounded-2xl p-8 shadow-lg relative overflow-hidden group cursor-pointer"
          >
            {/* Efecto de brillo animado */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />

            <div className="flex justify-center mb-6 relative z-10">
              <motion.div
                whileHover={{
                  scale: 1.2,
                  rotate: [0, 10, -10, 10, 0],
                  boxShadow: "0 10px 30px rgba(155, 233, 255, 0.5)",
                }}
                transition={{
                  scale: { duration: 0.3 },
                  rotate: { duration: 0.5 },
                  boxShadow: { duration: 0.3 },
                }}
                className="w-16 h-16 bg-gradient-to-r from-[#9BE9FF] to-[#B595FF] rounded-full flex items-center justify-center shadow-lg"
              >
                <FaBullseye className="text-white text-3xl" />
              </motion.div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 font-montserrat mb-4 text-center relative z-10">
              VISIÓN
            </h3>
            <p className="text-gray-700 leading-relaxed text-center relative z-10">
              Las mujeres tienen derecho al deporte recreativo, formativo y
              competitivo. Para el año 2030, la Fundación Manuela Vanegas será
              un referente en la promoción de la cultura del deporte en las
              mujeres desde su temprana edad como una herramienta de desarrollo
              personal y social; así como una organización en capacidad de
              diseñar y ejecutar estrategias de formación y competencia para
              distintas instituciones públicas y privadas.
            </p>
          </motion.div>

          {/* Objetivo */}
          <motion.div
            initial={{ opacity: 0, y: 50, rotateY: 15 }}
            whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
            viewport={{ once: false }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              type: "spring",
              stiffness: 100,
            }}
            whileHover={{
              y: -10,
              scale: 1.03,
              boxShadow: "0 20px 40px rgba(181, 149, 255, 0.3)",
              transition: { duration: 0.3 },
            }}
            className="bg-gradient-to-br from-[#B595FF]/10 to-[#9BE9FF]/10 rounded-2xl p-8 shadow-lg relative overflow-hidden group cursor-pointer"
          >
            {/* Efecto de brillo animado */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />

            <div className="flex justify-center mb-6 relative z-10">
              <motion.div
                whileHover={{
                  scale: 1.2,
                  rotate: [0, -10, 10, -10, 0],
                  boxShadow: "0 10px 30px rgba(181, 149, 255, 0.5)",
                }}
                transition={{
                  scale: { duration: 0.3 },
                  rotate: { duration: 0.5 },
                  boxShadow: { duration: 0.3 },
                }}
                className="w-16 h-16 bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] rounded-full flex items-center justify-center shadow-lg"
              >
                <FaHandshake className="text-white text-3xl" />
              </motion.div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 font-montserrat mb-4 text-center relative z-10">
              OBJETIVO
            </h3>
            <p className="text-gray-700 leading-relaxed text-center relative z-10">
              Impulsar el desarrollo deportivo de niñas, adolescentes y jóvenes,
              promoviendo la equidad de género a través del fútbol como
              herramienta de formación personal y transformación social.
            </p>
          </motion.div>
        </div>

        {/* Valores: Amor, Disciplina, Respeto */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-[#B595FF]/5 to-[#9BE9FF]/5 rounded-2xl p-12"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 200,
                }}
                className="flex flex-col items-center"
              >
                <motion.div
                  whileHover={{
                    scale: 1.15,
                    rotate: [0, -10, 10, -10, 0],
                    transition: { duration: 0.5 },
                  }}
                  className="w-24 h-24 mb-4 rounded-full bg-white shadow-lg flex items-center justify-center p-4 cursor-pointer"
                >
                  <img
                    src={value.icon}
                    alt={value.alt}
                    className="w-full h-full object-contain"
                  />
                </motion.div>
                <h4 className="text-xl font-bold text-gray-800 font-montserrat">
                  {value.title}
                </h4>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

