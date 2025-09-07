import { motion } from "framer-motion";
import estrellaImage from "../images/team/estrella_image.png";
import hectorImage from "../images/team/hector_image.png";
import luchoImage from "../images/team/lucho_image.png";
import paulaImage from "../images/team/paula_image.png";

const team = [
  { name: "Estrella", role: "Asesora", img: estrellaImage },
  { name: "Héctor", role: "Administrador", img: hectorImage },
  { name: "Lucho", role: "Deporte", img: luchoImage },
  { name: "Paula", role: "Comunicaciones", img: paulaImage },
];

export default function TeamCollage() {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h3
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }} // 👈 animación cada vez
          className="text-3xl font-bold text-gray-800 mb-6"
        >
          ¡UNIDOS!
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: false, amount: 0.3 }} // 👈
          className="text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          Contamos con más de 10 profesionales en áreas como asesoría,
          administración, deporte, cultura, bienestar y comunicaciones. Todos
          ellos, con una vocación de servicio, están comprometidos en brindar
          grandes oportunidades y cumplir con los objetivos de la fundación,
          contribuyendo al desarrollo interno de la entidad.
        </motion.p>

        {/* Collage */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {team.map((member, i) => (
            <motion.div
              key={i}
              className="relative group overflow-hidden rounded-xl shadow-lg"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.1 }}
              viewport={{ once: false, amount: 0.2 }} // 👈
            >
              <motion.img
                src={member.img}
                alt={member.name}
                className="w-full h-64 object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.4 }}
              />
              <motion.div
                className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center
                  opacity-0 group-hover:opacity-100"
                initial={{ y: 40, opacity: 0 }}
                whileHover={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <h4 className="text-white text-lg font-bold">{member.name}</h4>
                <p className="text-gray-200 text-sm">{member.role}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
