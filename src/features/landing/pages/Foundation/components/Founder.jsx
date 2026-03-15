  import { motion } from "framer-motion";

  export const Founder = () => {
    return (
      <section className="py-16 px-6 sm:px-10 lg:px-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Título de la sección */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 font-montserrat mb-4">
              Fundadora
            </h2>
          </motion.div>

          {/* Contenido principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Imagen de la fundadora */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/assets/images/Foundation/founder.jpg"
                  alt="Manuela Vanegas"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            </motion.div>

            {/* Información de la fundadora */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-800 font-montserrat mb-2">
                  Manuela Vanegas
                </h3>
                <p className="text-xl text-[#B595FF] font-semibold">
                  Futbolista Profesional
                </p>
              </div>

              <p className="text-gray-700 leading-relaxed text-lg">
                Nacida el 9 de Noviembre del 2000 en Copacabana, Antioquia,
                Manuela Vanegas figura como una de las mayores exponentes del
                talento deportivo nacional. Caracterizada por su disciplina y
                liderazgo dentro y fuera del campo, vive el día a día por sus
                pasiones y quiere dejar en el mundo una huella imborrable para las
                futuras generaciones del fútbol femenino.
              </p>

              {/* Clubes actuales - Diseño mejorado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <motion.div
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#B595FF]/20 to-[#9BE9FF]/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <div className="relative flex flex-col items-center gap-4 bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#B595FF]/30">
                    <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md p-3">
                      <img
                        src="/assets/images/Foundation/club.png"
                        alt="Brighton & Hove Albion"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-gray-800 font-bold text-sm leading-tight">
                        Brighton & Hove Albion
                      </p>
                      <p className="text-gray-500 text-xs mt-1">Inglaterra</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-blue-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <div className="relative flex flex-col items-center gap-4 bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-yellow-400/30">
                    <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md p-3">
                      <img
                        src="/assets/images/Foundation/selection.png"
                        alt="Selección Colombia"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-gray-800 font-bold text-sm leading-tight">
                        Selección Colombia
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Mayores y juveniles
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Trayectoria - Diseño mejorado */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="mt-16"
          >
            <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-3xl shadow-2xl p-8 sm:p-12 border border-gray-100">
              {/* Título */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-2 h-16 bg-gradient-to-b from-[#B595FF] to-[#9BE9FF] rounded-full" />
                <div>
                  <h3 className="text-3xl sm:text-4xl font-bold text-gray-800 font-montserrat">
                    Trayectoria
                  </h3>
                  <p className="text-[#B595FF] font-semibold text-lg">
                    16 años de carrera profesional
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna de texto - Timeline */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Etapa 1 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6 }}
                    className="relative pl-8 border-l-4 border-[#B595FF]/30"
                  >
                    <div className="absolute -left-3 top-0 w-6 h-6 bg-gradient-to-br from-[#B595FF] to-[#9BE9FF] rounded-full shadow-lg" />
                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      Los Inicios
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      Inició su camino en las escuelas de Copacabana jugando con
                      niños. A los 10 años ingresó al Club Formas Íntimas, donde
                      comenzaron a potenciar todas sus habilidades y pronto la
                      reconocieron como una deportista integral, con talento y
                      objetivos claros.
                    </p>
                  </motion.div>

                  {/* Etapa 2 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="relative pl-8 border-l-4 border-[#B595FF]/30"
                  >
                    <div className="absolute -left-3 top-0 w-6 h-6 bg-gradient-to-br from-[#B595FF] to-[#9BE9FF] rounded-full shadow-lg" />
                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      Selecciones Nacionales
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      Durante su proceso en el club fue convocada para integrar
                      las selecciones Antioquia y Colombia, destacándose en cada
                      competición. Posteriormente, asumió el reto de convertirse
                      en jugadora profesional en la primera liga femenina
                      organizada en su país.
                    </p>
                  </motion.div>

                  {/* Etapa 3 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative pl-8 border-l-4 border-[#B595FF]/30"
                  >
                    <div className="absolute -left-3 top-0 w-6 h-6 bg-gradient-to-br from-[#B595FF] to-[#9BE9FF] rounded-full shadow-lg" />
                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      Liga Profesional
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      Tras una gran participación en la liga local, donde fue
                      subcampeona con el Independiente Medellín, dio el salto a la
                      competitiva Liga Profesional de España, escenario en el que
                      ha disputado la Champions League y alcanzado el
                      subcampeonato de la Supercopa de España.
                    </p>
                  </motion.div>

                  {/* Etapa 4 - Destacada */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="relative pl-8 border-l-4 border-[#B595FF]"
                  >
                    <div className="absolute -left-3 top-0 w-6 h-6 bg-gradient-to-br from-[#B595FF] to-[#9BE9FF] rounded-full shadow-lg animate-pulse" />
                    <h4 className="text-xl font-bold text-[#B595FF] mb-2">
                      Actualidad
                    </h4>
                    <p className="text-gray-800 leading-relaxed font-medium">
                      Hoy en día, es ampliamente reconocida por su destacada
                      participación en el Mundial de Australia y Nueva Zelanda
                      2023, en los Juegos Olímpicos de París 2024 y por su
                      reciente fichaje con el Brighton & Hove Albion, con el que
                      competirá en la Barclays Women's Super League, considerada
                      la mejor liga femenina del mundo.
                    </p>
                  </motion.div>
                </div>

                {/* Columna de imagen */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.8 }}
                  className="lg:col-span-1"
                >
                  <div className="sticky top-8 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                    <img
                      src="/assets/images/Foundation/career.jpg"
                      alt="Trayectoria de Manuela Vanegas"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  };
