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

import depImage from "../Services/images/cards/dep_image.jpg";
import psicoImage from "../Services/images/cards/psico_image.png";
import nutriImage from "../Services/images/cards/nutri_image.png";
import fisioImage from "../Services/images/cards/fisio_image.png";
import acadImage from "../Services/images/cards/acad_image.jpg";
import famImage from "../Services/images/cards/fam_image.jpg";

const truncate = (text, max = 180) =>
  text.length > max ? `${text.slice(0, max).trimEnd()}...` : text;

const areas = [
  {
    id: "formacion-deportiva",
    title: "Formación Deportiva",
    icon: FaFutbol,
    image: depImage,
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
    image: psicoImage,
    summary:
      "Fortalecemos identidad, resiliencia y confianza con espacios protectores, talleres y acompañamiento constante.",
    description:
      "El área fortalece el bienestar integral de niñas y adolescentes a través de talleres, acompañamiento y deporte como herramienta de crecimiento. Fomenta su identidad, resiliencia y confianza, brindando espacios protectores que facilitan su adaptación y desarrollo para un mejor futuro personal y deportivo.",
  },
  {
    id: "orientacion-nutricional",
    title: "Orientación Nutricional",
    icon: FaLeaf,
    image: nutriImage,
    summary:
      "Optimizamos energía, fuerza y recuperación con estrategias nutricionales aplicadas al deporte.",
    description:
      "El componente alimentario y nutricional busca optimizar el rendimiento y bienestar de las jugadoras mediante estrategias personalizadas, educación nutricional e hidratación adecuada. Se fomenta una alimentación equilibrada para mejorar energía, fuerza, recuperación y prevención de lesiones, involucrando a las familias en el proceso.",
  },
  {
    id: "bienestar-fisico",
    title: "Bienestar Físico",
    icon: FaHeartbeat,
    image: fisioImage,
    summary:
      "Prevenimos lesiones y potenciamos el rendimiento con fortalecimiento, activación y recuperación guiada.",
    description:
      "El área de fisioterapia previene lesiones, optimiza el rendimiento y facilita la recuperación de las jugadoras a través de calentamiento, activación y fortalecimiento físico. Mediante ejercicios de coordinación, propiocepción y pliometría, se mejora su desempeño y conciencia corporal, asegurando su continuidad en el deporte y su bienestar integral.",
  },
  {
    id: "la-academia",
    title: "La Academia",
    icon: FaGraduationCap,
    image: acadImage,
    summary:
      "Impulsamos el desarrollo cognitivo con refuerzo académico, inglés, talleres y experiencias pedagógicas.",
    description:
      "La Fundación Manuela Vanegas promueve y estimula el desarrollo cognitivo de sus beneficiarias, quienes son estudiantes activas en escuelas, colegios y universidades, mediante diversos programas académicos a lo largo del año. Entre estos, destacan charlas formativas sobre entrenamiento mental, empoderamiento personal, profesional y social, además de talleres sobre proyectos de vida. También se imparten clases virtuales de inglés con profesores nativos, adaptadas a horarios flexibles, se organizan salidas pedagógicas y recreativas con intercambios culturales y experiencias educativas fuera del entorno habitual, y se brindan oportunidades adicionales de desarrollo cognitivo a través de actividades neuro deportivas integradas en los entrenamientos semanales.",
  },
  {
    id: "familias-fmv",
    title: "Familias FMV",
    icon: FaUsers,
    image: famImage,
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
    image: depImage,
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
    image: psicoImage,
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
    image: nutriImage,
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
    image: fisioImage,
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
    image: acadImage,
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
    image: famImage,
  },
];

function AreasProjects() {
  const [selectedArea, setSelectedArea] = useState(null);
  const [openProject, setOpenProject] = useState(projects[0].id);

  return (
    <>
      <Hero
        variant="image-only"
        imageUrl="/assets/images/services_image.jpg"
      />

      <section className="bg-white py-14 px-6 sm:px-10 lg:px-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl font-bold text-gray-900 font-montserrat"
          >
            Áreas y Proyectos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.12 }}
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

      <section className="py-10 px-6 sm:px-10 lg:px-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-montserrat">
              Nuestras Áreas
            </h2>
            <p className="text-gray-600 mt-3">
              Haz clic en cada área para conocer su enfoque completo.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
            {areas.map((area, index) => {
              const Icon = area.icon;

              return (
                <motion.button
                  key={area.id}
                  type="button"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: index * 0.06 }}
                  whileHover={{ y: -6 }}
                  onClick={() => setSelectedArea(area)}
                  className="text-left bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={area.image}
                      alt={area.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    <div className="absolute left-5 bottom-4 flex items-center gap-2 text-white">
                      <span className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm grid place-items-center">
                        <Icon className="text-base" />
                      </span>
                      <span className="font-semibold">{area.title}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      {truncate(area.summary, 138)}
                    </p>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#B595FF]">
                      Ver detalle <FaArrowRight />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 sm:px-10 lg:px-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-montserrat">
              Nuestros Proyectos
            </h2>
            <p className="mt-4 max-w-4xl mx-auto text-gray-700 leading-relaxed">
              No solo soñamos con formar deportistas integrales, también
              diseñamos iniciativas concretas y medibles para responder a las
              necesidades reales de nuestras beneficiarias y sus familias.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {projects.map((project, index) => {
              const isOpen = openProject === project.id;

              return (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  className="rounded-3xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 shadow-lg overflow-hidden"
                >
                  <div className="grid sm:grid-cols-[170px,1fr] gap-0">
                    <div className="h-40 sm:h-full">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-6">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#B595FF]">
                        {project.area}
                      </p>
                      <h3 className="mt-1 text-2xl font-bold text-gray-900 font-montserrat">
                        {project.title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-700">
                        <span className="font-semibold">Enfoque:</span>{" "}
                        {project.focus}
                      </p>
                      <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                        <span className="font-semibold">Objetivo:</span>{" "}
                        {truncate(project.objective, 180)}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setOpenProject(isOpen ? null : project.id)
                        }
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#B595FF] hover:text-[#9f7bf0] transition-colors"
                      >
                        Acciones del proyecto
                        <FaChevronDown
                          className={`transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.ul
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="mt-4 space-y-2 text-sm text-gray-700 overflow-hidden"
                          >
                            {project.actions.map((action) => (
                              <li
                                key={action}
                                className="flex gap-2 items-start leading-relaxed"
                              >
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#B595FF] shrink-0" />
                                <span>{action}</span>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
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
                <div className="relative h-56 sm:h-64">
                  <img
                    src={selectedArea.image}
                    alt={selectedArea.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                  <button
                    type="button"
                    onClick={() => setSelectedArea(null)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 text-gray-700 grid place-items-center hover:bg-white transition-colors"
                    aria-label="Cerrar detalle del área"
                  >
                    <FaTimes />
                  </button>
                  <h3 className="absolute left-6 bottom-5 text-2xl sm:text-3xl font-bold text-white font-montserrat">
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




