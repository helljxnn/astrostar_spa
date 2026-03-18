import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import CircularGallery from "./bits/CircularGallery";

export const Team = () => {
  const [selectedMember, setSelectedMember] = useState(null);

  // Datos del equipo completo
  const teamMembers = [
    {
      id: 1,
      name: "Estrellita Betancur",
      role: "Área Administrativa",
      description:
        "Responsable del área administrativa de la Fundación, encargada de la gestión operativa, coordinación de actividades mensuales y donaciones, control de uniformes, elaboración de reportes y seguimiento de asistencia a entrenamientos y encuentros deportivos.",
      image: "/assets/images/Foundation/team/Estrellita_Betancur.jpg",
    },
    {
      id: 2,
      name: "Paula Vanegas",
      role: "Psicóloga",
      description:
        "Psicóloga y funcionaria pública de la alcaldía de Copacabana. Coordina el departamento de psicología en la fundación, impulsando el desarrollo psico deportivo y social de las deportistas.",
      image: "/assets/images/Foundation/team/Paula_Vanegas.jpg",
    },
    {
      id: 3,
      name: "Kelly López",
      role: "Nutricionista",
      description:
        "Nutricionista apasionada por el desarrollo sostenible en la infancia y adolescencia, enfocada en promover hábitos saludables y su relación con el entorno para un óptimo bienestar.",
      image: "/assets/images/Foundation/team/Kelly_López.jpg",
    },
    {
      id: 4,
      name: "Eliana Jiménez",
      role: "Entrenadora y Pedagoga",
      description:
        "Entrenadora de la Fundación y pedagoga de profesión, con una profunda vocación por el trabajo con la niñez. Lidera los procesos infantiles, acompañando el desarrollo deportivo y formativo de las niñas desde un enfoque pedagógico, humano y comprometido con su crecimiento integral.",
      image: "/assets/images/Foundation/team/Eliana_Jiménez.jpg",
    },
    {
      id: 5,
      name: "Carolina Bran",
      role: "Entrenadora",
      description:
        "Entrenadora de la Fundación, con vocación por la primera infancia. Lidera la categoría de 5 años, acompañando a las niñas en sus primeros pasos para aprender y amar el fútbol y el deporte.",
      image: "/assets/images/Foundation/team/Carolina_Bran.jpg",
    },
    {
      id: 6,
      name: "Isabella Quintero",
      role: "Fisioterapeuta",
      description:
        "Encargada de acompañar y cuidar la salud física de las deportistas. Lidera los procesos de prevención, atención y recuperación de lesiones, promoviendo el bienestar, el rendimiento deportivo y el desarrollo seguro de cada una de las niñas mediante la fisioterapia.",
      image: "/assets/images/Foundation/team/Isabella_Quintero.jpg",
    },
    {
      id: 7,
      name: "Héctor Vanegas",
      role: "Director Deportivo",
      description:
        "Director deportivo con experiencia en gestión deportiva regional, coordina y evalúa los planes y actividades del cuerpo técnico en la fundación, apoyando los entrenamientos.",
      image: "/assets/images/Foundation/team/HECTOR_VANEGAS.JPG",
    },
    {
      id: 8,
      name: "Luis Hernández",
      role: "Entrenador de Arqueras",
      description:
        "Apasionado pedagogo y entusiasta del fútbol. Gestiona el crecimiento integral y deportivo de las arqueras brindando apoyo constante en su desarrollo.",
      image: "/assets/images/Foundation/team/LUIS_HERNÁNDEZ.JPG",
    },
    {
      id: 9,
      name: "Franky Vanegas",
      role: "Pedagogo",
      description:
        "Pedagogo de vocación y amante del fútbol. Ejecuta con disciplina y pasión las actividades deportivas del club, enfocándose en el desarrollo integral y acompañamiento de las deportistas.",
      image: "/assets/images/Foundation/team/FRANKY_VANEGAS.JPG",
    },
    {
      id: 10,
      name: "Alejandro Valencia",
      role: "Proyectos Deportivos y Sociales",
      description:
        "Es el encargado de los proyectos deportivos y sociales de la Fundación, liderando iniciativas que impactan de manera positiva a las beneficiarias. Se destaca por su calidez humana, su vocación por el deporte y su profundo compromiso con el servicio social.",
      image: "/assets/images/Foundation/team/Alejandro_Valencia.jpg",
    },
    {
      id: 11,
      name: "Álvaro Cano 'Pilo'",
      role: "Metodólogo",
      description:
        "Es un metodólogo con amplia experiencia en procesos de formación y en el desarrollo de futbolistas con proyección en el municipio antioqueño. Ha sido mentor de varias jugadoras que hoy se destacan como profesionales, dejando una huella significativa en sus procesos deportivos y personales.",
      image: "/assets/images/Foundation/team/Alvaro_Cano.jpg",
    },
  ];

  // Preparar datos para CircularGallery con las URLs correctas
  const galleryItems = teamMembers.map((member) => ({
    image: member.image,
    text: member.name,
    role: member.role,
    id: member.id,
    memberData: member, // Pasar todos los datos del miembro
  }));

  // Manejar clic en imagen con useCallback para evitar re-renders
  const handleImageClick = useCallback(
    (itemData) => {
      const member = teamMembers.find((m) => m.id === itemData.id);
      if (member) {
        setSelectedMember(member);
      }
    },
    [teamMembers],
  );

  return (
    <section id="equipo" className="py-16 px-6 sm:px-10 lg:px-20 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Título de la sección */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 font-montserrat mb-6">
            Equipo
          </h2>
          <p className="text-gray-700 text-lg max-w-3xl mx-auto mb-4">
            Contamos con más de 10 profesionales en áreas como asesoría,
            administración, deporte, cultura, bienestar y comunicaciones. Todos
            ellos, con una vocación de servicio, están comprometidos en brindar
            grandes oportunidades y cumplir con los objetivos de la fundación,
            contribuyendo al desarrollo interno de la entidad.
          </p>
          <motion.p
            animate={{
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-sm text-[#B595FF] font-medium"
          >
            Desliza para ver más • Haz clic en cualquier imagen para ver más
            detalles
          </motion.p>
        </motion.div>

        {/* Mobile Cards */}
        <div className="md:hidden">
          <div className="-mx-2 px-2 overflow-x-auto pb-2">
            <div className="flex gap-4 snap-x snap-mandatory">
              {teamMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelectedMember(member)}
                  className="snap-start shrink-0 w-[78vw] max-w-[320px] rounded-2xl border border-gray-200 bg-white shadow-md overflow-hidden text-left"
                >
                  <div className="h-52 bg-gradient-to-b from-[#f4f7ff] to-white p-2">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-contain object-center"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 font-montserrat leading-tight">
                      {member.name}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-[#B595FF]">
                      {member.role}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Circular Gallery */}
        <motion.div
          className="hidden md:block"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div style={{ height: "600px", position: "relative" }}>
            <CircularGallery
              items={galleryItems}
              bend={3}
              textColor="#6B7280"
              borderRadius={0.05}
              scrollEase={0.02}
              scrollSpeed={2}
              onItemClick={handleImageClick}
            />
          </div>
        </motion.div>

        {/* Modal de detalles */}
        <AnimatePresence>
          {selectedMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl relative"
              >
                {/* Botón cerrar */}
                <button
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Contenido del modal */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-lg border-4 border-[#B595FF]/30 mb-5 sm:mb-6">
                    <img
                      src={selectedMember.image}
                      alt={selectedMember.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 font-montserrat mb-2 text-center">
                    {selectedMember.name}
                  </h3>
                  <p className="text-base sm:text-lg text-[#B595FF] font-semibold mb-4 sm:mb-6 text-center">
                    {selectedMember.role}
                  </p>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-center">
                    {selectedMember.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

