import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaArrowRight,
  FaBrain,
  FaChevronDown,
  FaFutbol,
  FaGraduationCap,
  FaHeartbeat,
  FaLeaf,
  FaTimes,
  FaUsers,
} from "react-icons/fa";
import { Hero } from "../../components/Hero";

const truncate = (text, max = 180) =>
  text.length > max ? `${text.slice(0, max).trimEnd()}...` : text;

const areaProjectImage = (filename) => `/assets/images/Areas_Projects/${filename}`;
const revealViewport = { once: false, amount: 0.22 };
const revealTransition = { duration: 0.45, ease: "easeOut" };

const areas = [
  {
    id: "formacion-deportiva",
    title: "Formación Deportiva",
    icon: FaFutbol,
    image: areaProjectImage("19.webp"),
    summary:
      "Promovemos el desarrollo de niñas y jóvenes a través del fútbol con enfoque técnico, táctico, físico y social.",
    description:
      "La Fundación Manuela Vanegas tiene como objetivo promover el desarrollo de las mujeres a través del deporte, impulsando la equidad de género y creando espacios inclusivos para la participación de niñas, jóvenes y adolescentes en el fútbol. Este área no solo fomenta el crecimiento físico, técnico y táctico en el ámbito deportivo, sino que también fortalece el tejido social mediante la enseñanza de habilidades blandas, con el acompañamiento y apoyo continuo de un equipo de trabajo comprometido.",
    schedule:
      "La actividad deportiva se realiza los días martes y viernes en la mañana, y miércoles y jueves en la tarde en la Unidad Deportiva Cristo Rey de Copacabana, Antioquia.",
  },
  {
    id: "acompanamiento-psicosocial",
    title: "Acompañamiento Psicosocial",
    icon: FaBrain,
    image: areaProjectImage("20.webp"),
    summary:
      "Fortalecemos identidad, resiliencia y confianza con espacios protectores, talleres y acompañamiento constante.",
    description:
      "El área fortalece el bienestar integral de niñas y adolescentes a través de talleres, acompañamiento y deporte como herramienta de crecimiento. Fomenta su identidad, resiliencia y confianza, brindando espacios protectores que facilitan su adaptación y desarrollo para un mejor futuro personal y deportivo.",
  },
  {
    id: "orientacion-nutricional",
    title: "Orientación Nutricional",
    icon: FaLeaf,
    image: areaProjectImage("21.webp"),
    imagePosition: "center",
    imageClass: "scale-[1.05] group-hover:scale-[1.1]",
    imageStyle: { 
      objectFit: "cover", 
      objectPosition: "center center"
    },
    summary:
      "Optimizamos energía, fuerza y recuperación con estrategias nutricionales aplicadas al deporte.",
    description:
      "El componente alimentario y nutricional busca optimizar el rendimiento y bienestar de las jugadoras mediante estrategias personalizadas, educación nutricional e hidratación adecuada. Se fomenta una alimentación equilibrada para mejorar energía, fuerza, recuperación y prevención de lesiones, involucrando a las familias en el proceso.",
  },
  {
    id: "bienestar-fisico",
    title: "Bienestar Físico",
    icon: FaHeartbeat,
    image: areaProjectImage("22.webp"),
    summary:
      "Prevenimos lesiones y potenciamos el rendimiento con fortalecimiento, activación y recuperación guiada.",
    description:
      "El área de fisioterapia previene lesiones, optimiza el rendimiento y facilita la recuperación de las jugadoras a través de calentamiento, activación y fortalecimiento físico. Mediante ejercicios de coordinación, propiocepción y pliometría, se mejora su desempeño y conciencia corporal, asegurando su continuidad en el deporte y su bienestar integral.",
  },
  {
    id: "la-academia",
    title: "La Academia",
    icon: FaGraduationCap,
    image: areaProjectImage("23.webp"),
    summary:
      "Impulsamos el desarrollo cognitivo con refuerzo académico, inglés, talleres y experiencias pedagógicas.",
    description:
      "La Fundación Manuela Vanegas promueve y estimula el desarrollo cognitivo de sus beneficiarias, quienes son estudiantes activas en escuelas, colegios y universidades, mediante diversos programas académicos a lo largo del año. Entre estos, destacan charlas formativas sobre entrenamiento mental, empoderamiento personal, profesional y social, además de talleres sobre proyectos de vida. También se imparten clases virtuales de inglés con profesores nativos, adaptadas a horarios flexibles, se organizan salidas pedagógicas y recreativas con intercambios culturales y experiencias educativas fuera del entorno habitual, y se brindan oportunidades adicionales de desarrollo cognitivo a través de actividades neuro deportivas integradas en los entrenamientos semanales.",
  },
  {
    id: "familias-fmv",
    title: "Familias FMV",
    icon: FaUsers,
    image: areaProjectImage("24.webp"),
    summary:
      "Conectamos a las familias con el proceso formativo para construir una red de apoyo social y comunitaria.",
    description:
      "La fundación fortalece el vínculo familiar al involucrar a las familias en el desarrollo integral de las niñas, promoviendo un entorno sano, educativo y formativo. A través de acompañamiento y espacios de participación, las familias también se benefician, creando una red de apoyo que potencia el bienestar social y comunitario.",
  },
];

const projects = [
  {
    id: "cantera-con-proposito",
    area: "Formación Deportiva",
    title: "Cantera Con Propósito",
    focus: "Desarrollo técnico + formación en valores.",
    objective:
      "Potenciar el rendimiento deportivo mientras se fortalece la disciplina, el liderazgo y el trabajo en equipo.",
    actions: [
      "Plan de microciclos trimestrales con metas individuales.",
      "Evaluaciones semestrales de progreso.",
      "Charlas con deportistas profesionales invitadas.",
      "Seguimiento de rendimiento y actitud.",
    ],
    image: areaProjectImage("25.webp"),
  },
  {
    id: "mente-fuerte-corazon-valiente",
    area: "Psicosocial",
    title: "Mente Fuerte, Corazón Valiente",
    focus: "Salud emocional y resiliencia.",
    objective:
      "Brindar herramientas psicológicas para afrontar presión, frustración y retos personales.",
    actions: [
      "Talleres mensuales de manejo emocional.",
      "Espacios de escucha individual.",
      "Escuela de autoestima y liderazgo femenino.",
      "Ruta de acompañamiento en casos especiales.",
    ],
    image: areaProjectImage("26.webp"),
  },
  {
    id: "alimenta-tu-juego",
    area: "Nutricional",
    title: "Alimenta Tu Juego",
    focus: "Educación nutricional aplicada al deporte.",
    objective:
      "Enseñar a las deportistas a alimentarse estratégicamente para mejorar energía, recuperación y rendimiento.",
    actions: [
      "Taller práctico para familias sobre alimentación económica y saludable.",
      "Guías descargables según etapa de entrenamiento.",
      "Evaluaciones básicas de hábitos alimenticios.",
      "Recetarios adaptados al contexto local.",
    ],
    image: areaProjectImage("27.webp"),
  },
  {
    id: "cuerpo-en-equilibrio",
    area: "Fisioterapia",
    title: "Cuerpo En Equilibrio",
    focus: "Prevención de lesiones y fortalecimiento físico.",
    objective:
      "Reducir riesgos de lesión y mejorar capacidades físicas complementarias.",
    actions: [
      "Sesiones de fortalecimiento y movilidad.",
      "Jornadas de prevención de lesiones.",
      "Valoraciones físicas iniciales y seguimiento.",
      "Rutinas de recuperación post partido.",
    ],
    image: areaProjectImage("28.webp"),
  },
  {
    id: "educacion-que-impulsa-suenos",
    area: "Academia",
    title: "Educación que Impulsa Sueños",
    focus: "Permanencia escolar y excelencia académica.",
    objective:
      "Garantizar que el rendimiento deportivo no afecte el proceso académico, sino que lo potencie.",
    actions: [
      "Espacios de refuerzo escolar.",
      "Clases de Inglés en línea.",
      "Reconocimiento a la excelencia académica.",
      "Talleres de orientación vocacional.",
    ],
    image: areaProjectImage("29.webp"),
  },
  {
    id: "familias-fmv-proyecto",
    area: "Familia",
    title: "Familias FMV",
    focus: "Vinculación activa de padres y cuidadores.",
    objective:
      "Convertir a las familias en aliadas conscientes del proceso formativo.",
    actions: [
      "Escuela de padres trimestral.",
      "Talleres sobre acompañamiento emocional.",
      "Charlas sobre disciplina positiva.",
      "Encuentros familiares deportivos.",
    ],
    image: areaProjectImage("30.webp"),
  },
];

function AreasProjects() {
  const [selectedArea, setSelectedArea] = useState(null);
  const [openProject, setOpenProject] = useState(null);

  return (
    <>
      <Hero
        variant="image-only"
        imageUrl={areaProjectImage("18.webp")}
      />

      <section className="bg-white py-14 px-6 sm:px-10 lg:px-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={revealViewport}
            transition={revealTransition}
            className="text-4xl sm:text-5xl font-bold text-gray-900 font-montserrat"
          >
            Áreas y Proyectos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={revealViewport}
            transition={{ ...revealTransition, delay: 0.08 }}
            className="mt-4 max-w-4xl mx-auto text-lg text-gray-700 leading-relaxed"
          >
            En la Fundación Manuela Vanegas creemos que formar grandes
            deportistas va mucho más allá del entrenamiento en la cancha.
            Nuestro compromiso es acompañar a cada beneficiaria de manera
            integral, entendiendo que su crecimiento deportivo debe ir de la
            mano con su bienestar emocional, académico, físico y familiar.
          </motion.p>
        </div>
      </section>

      <section className="py-16 px-6 sm:px-10 lg:px-20 bg-gradient-to-b from-slate-50 via-white to-indigo-50/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 font-montserrat mb-4">
              Nuestras Áreas
            </h2>
            <motion.p 
              className="text-gray-600 mt-3 text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Haz clic en cada área para conocer su enfoque completo.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {areas.map((area, index) => {
              const Icon = area.icon;

              return (
                <motion.button
                  key={area.id}
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.05
                  }}
                  whileHover={{
                    y: -4,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedArea(area)}
                  className="text-left bg-white rounded-3xl shadow-lg border border-gray-100/60 group p-0 m-0 appearance-none overflow-hidden relative hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Efecto simplificado */}
                  <div className="relative overflow-hidden aspect-[16/10] bg-slate-100">
                    <img
                      src={area.image}
                      alt={area.title}
                      loading="lazy"
                      decoding="async"
                      style={{
                        objectPosition: area.imagePosition || "center",
                        ...(area.imageStyle || {}),
                      }}
                      className={`absolute left-0 top-0 block w-full h-full object-cover transition-transform duration-500 ${
                        area.imageClass || "group-hover:scale-105"
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div 
                      className="absolute left-5 bottom-4 flex items-center gap-3 text-white"
                    >
                      <span 
                        className="w-10 h-10 rounded-full bg-white/25 backdrop-blur-sm grid place-items-center shadow-lg group-hover:bg-white/35 transition-colors duration-200"
                      >
                        <Icon className="text-lg" />
                      </span>
                      <span className="font-semibold text-lg">{area.title}</span>
                    </div>
                  </div>

                  <div className="p-7 relative z-10">
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base min-h-[4.5rem]">
                      {truncate(area.summary, 138)}
                    </p>
                    <div 
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#B595FF] group-hover:text-[#9b78eb] transition-colors duration-300 group-hover:translate-x-1"
                    >
                      Ver detalle 
                      <FaArrowRight />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 sm:px-10 lg:px-20 bg-gradient-to-b from-white via-slate-50/30 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 font-montserrat mb-6">
              Nuestros Proyectos
            </h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-5xl mx-auto bg-gradient-to-r from-[#B595FF]/5 to-[#9BE9FF]/5 rounded-2xl p-8 shadow-lg relative overflow-hidden"
            >
              {/* Efecto de brillo sutil */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
              />
              <p className="text-lg text-gray-700 leading-relaxed relative z-10">
                No solo soñamos con formar deportistas integrales, sino que
                diseñamos proyectos concretos que hacen realidad ese propósito.
                Cada área de la fundación cuenta con una iniciativa estratégica
                que responde a las necesidades reales de nuestras beneficiarias y
                sus familias, garantizando un acompañamiento estructurado, medible
                y sostenible en el tiempo.
              </p>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            {projects.map((project, index) => {
              const isOpen = openProject === project.id;

              return (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.05
                  }}
                  whileHover={{
                    y: -2,
                    transition: { duration: 0.2 }
                  }}
                  className="self-start rounded-2xl border border-slate-200/60 bg-white shadow-lg overflow-hidden relative group min-h-[280px] flex flex-col hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Efecto de brillo simplificado */}
                  <div className="p-6 sm:p-7 relative z-10 flex-1 flex flex-col">
                    <div className="flex items-start gap-5 mb-5">
                      <div 
                        className="relative h-24 w-32 sm:h-28 sm:w-40 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 shadow-md"
                      >
                        <img
                          src={project.image}
                          alt={project.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p 
                          className="inline-flex items-center rounded-full bg-gradient-to-r from-[#B595FF]/15 to-[#9BE9FF]/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#8a63e7] shadow-sm"
                        >
                          {project.area}
                        </p>
                        <h3 className="mt-3 text-xl sm:text-2xl font-bold text-gray-900 font-montserrat leading-tight">
                          {project.title}
                        </h3>
                        <p className="mt-3 text-sm text-gray-700 min-h-[2.5rem]">
                          <span className="font-semibold text-gray-800">Enfoque:</span>{" "}
                          {truncate(project.focus, 96)}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <p className="text-sm text-gray-700 leading-relaxed min-h-[3rem]">
                        <span className="font-semibold text-gray-800">Objetivo:</span>{" "}
                        {truncate(project.objective, 130)}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setOpenProject(isOpen ? null : project.id)
                        }
                        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#B595FF]/35 bg-gradient-to-r from-[#B595FF]/10 to-[#9BE9FF]/10 px-4 py-2.5 text-sm font-semibold text-[#8a63e7] transition-all duration-200 shadow-sm hover:shadow-md hover:bg-[#B595FF]/15 self-start"
                      >
                        {isOpen ? "Ocultar acciones" : "Acciones del proyecto"}
                        <div
                          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        >
                          <FaChevronDown />
                        </div>
                      </button>
                    </div>

                    <motion.div
                      initial={false}
                      animate={{
                        height: isOpen ? "auto" : 0,
                        opacity: isOpen ? 1 : 0
                      }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 pt-1">
                        <motion.ul 
                          className="space-y-3 rounded-xl bg-gradient-to-r from-slate-50/80 to-slate-100/60 border border-slate-200/80 p-5 text-sm text-gray-700 shadow-inner"
                          initial={{ y: -10 }}
                          animate={{ y: isOpen ? 0 : -10 }}
                          transition={{ duration: 0.3, delay: isOpen ? 0.1 : 0 }}
                        >
                          {project.actions.map((action, actionIndex) => (
                            <motion.li
                              key={action}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -10 }}
                              transition={{ duration: 0.3, delay: isOpen ? actionIndex * 0.05 : 0 }}
                              className="flex gap-3 items-start leading-relaxed"
                            >
                              <motion.span 
                                className="mt-2 h-2 w-2 rounded-full bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] shrink-0 shadow-sm"
                                whileHover={{ scale: 1.3 }}
                                transition={{ duration: 0.2 }}
                              />
                              <span>{action}</span>
                            </motion.li>
                          ))}
                        </motion.ul>
                      </div>
                    </motion.div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>


      <AnimatePresence>
        {selectedArea && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedArea(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] p-4 sm:p-8 overflow-y-auto"
          >
            <div className="min-h-full grid place-items-center">
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.97 }}
                transition={{ duration: 0.25 }}
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="relative h-56 sm:h-64 md:h-72">
                  <button
                    type="button"
                    onClick={() => setSelectedArea(null)}
                    className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 text-gray-700 grid place-items-center hover:bg-white transition-colors"
                    aria-label="Cerrar detalle del área"
                  >
                    <FaTimes />
                  </button>

                  <img
                    src={selectedArea.image}
                    alt={selectedArea.title}
                    loading="lazy"
                    decoding="async"
                    style={{ objectPosition: selectedArea.imagePosition || "center" }}
                    className="h-full w-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <h3 className="absolute left-6 bottom-5 pr-16 text-2xl sm:text-3xl font-bold text-white font-montserrat">
                    {selectedArea.title}
                  </h3>
                </div>

                <div className="p-6 sm:p-8">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedArea.description}
                  </p>
                  {selectedArea.schedule && (
                    <div className="mt-5 rounded-2xl border border-[#B595FF]/25 bg-[#B595FF]/10 p-4 text-sm text-gray-700 leading-relaxed">
                      <span className="font-semibold text-gray-900">
                        Horarios y lugar:
                      </span>{" "}
                      {selectedArea.schedule}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AreasProjects;






