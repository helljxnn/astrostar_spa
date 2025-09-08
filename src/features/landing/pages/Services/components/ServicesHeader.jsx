// src/features/services/components/ServicesHeader.jsx
import { motion } from "framer-motion";

export const ServicesHeader = () => {
  return (
    <header className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8 text-center">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 
                     bg-clip-text text-transparent bg-gradient-to-r from-primary-purple to-primary-blue"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.35 }}
        >
          Áreas de Acción y Programas
        </motion.h2>

        <motion.p
          className="text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          viewport={{ once: false, amount: 0.35 }}
        >
          Descubre cómo apoyamos el desarrollo integral de nuestras beneficiarias
          en distintos ámbitos.
        </motion.p>
      </div>
    </header>
  );
};
