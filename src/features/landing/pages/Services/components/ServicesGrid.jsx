// src/features/services/components/ServicesGrid.jsx
import { motion } from "framer-motion";
import { ServiceCard } from "./ServiceCard";
import depoimage from "../images/cards/dep_image.jpg"
import psicoimage from "../images/cards/psico_image.png"
import nutriimage from "../images/cards/nutri_image.png"
import fisioimage from "../images/cards/fisio_image.png"
import acadimage from "../images/cards/acad_image.jpg"
import famimage from "../images/cards/fam_image.jpg"


export const ServicesGrid = () => {
  const services = [
    {
      title: "Deportiva",
      description:
        "Impulsamos la equidad de género y el desarrollo deportivo a través del fútbol, fortaleciendo habilidades técnicas y sociales.",
      image: depoimage,
    },
    {
      title: "Psicológica",
      description:
        "Promovemos resiliencia, identidad y confianza mediante talleres y acompañamiento integral.",
      image: psicoimage,
    },
    {
      title: "Nutricional",
      description:
        "Educación y hábitos alimenticios que potencian el rendimiento y bienestar físico de las jugadoras.",
      image: nutriimage,
    },
    {
      title: "Fisioterapia",
      description:
        "Prevención y recuperación de lesiones con entrenamientos funcionales y personalizados.",
      image: fisioimage,
    },
    {
      title: "Academia",
      description:
        "Formación cognitiva y académica con programas de inglés, talleres, salidas pedagógicas y neurodeporte.",
      image: acadimage,
    },
    {
      title: "Familiar",
      description:
        "Fortalecemos el vínculo familiar y comunitario con espacios de integración y apoyo.",
      image: famimage,
    },
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-20">
        {services.map((service, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: false }}
          >
            <ServiceCard
              title={service.title}
              description={service.description}
              image={service.image}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};