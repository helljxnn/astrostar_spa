import { motion } from "framer-motion";

export const Allies = () => {
  // Aliados
  const allies = [
    {
      name: "Tiendas ARA",
      logo: "/assets/images/Foundation/allies/LOGO_ARA.png",
    },
    {
      name: "Homecenter",
      logo: "/assets/images/Foundation/allies/LOGO_HOMECENTER.png",
    },
    {
      name: "Adidas Colombia",
      logo: "/assets/images/Foundation/allies/LOGO_ADIDAS.png",
    },
    {
      name: "Da Alegría",
      logo: "/assets/images/Foundation/allies/LOGO_DA_ALEGRIA.png",
    },
    {
      name: "Novo Sports",
      logo: "/assets/images/Foundation/allies/LOGO_NOVO.png",
    },
    {
      name: "Inder Copacabana",
      logo: "/assets/images/Foundation/allies/LOGO_INDER_COPACABANA.png",
    },
  ];

  // Duplicar solo 2 veces para un loop perfecto sin cortes
  const duplicatedAllies = [...allies, ...allies];

  return (
    <section className="py-20 px-6 sm:px-10 lg:px-20 bg-gradient-to-b from-white via-purple-50/30 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Título de la sección */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 font-montserrat mb-4">
            Nuestros Aliados
          </h2>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto">
            Gracias a nuestros aliados estratégicos que hacen posible nuestra
            misión y nos acompañan en cada paso del camino
          </p>
        </motion.div>

        {/* Carousel horizontal infinito - Desktop */}
        <div className="relative hidden md:block">
          {/* Gradientes suaves en los bordes */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

          {/* Contenedor del carousel */}
          <div className="overflow-hidden py-8">
            <motion.div
              className="flex gap-16 items-center"
              animate={{
                x: [0, -(allies.length * (192 + 64))],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 15,
                  ease: "linear",
                },
              }}
            >
              {duplicatedAllies.map((ally, index) => (
                <motion.div
                  key={`${ally.name}-${index}`}
                  className="flex-shrink-0 w-48 h-32 flex items-center justify-center bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-[#B595FF]/30 group"
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <img
                    src={ally.logo}
                    alt={ally.name}
                    className="max-w-full max-h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Grid para móviles y tablets */}
        <div className="md:hidden grid grid-cols-2 sm:grid-cols-3 gap-6">
          {allies.map((ally, index) => (
            <motion.div
              key={ally.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex items-center justify-center bg-white rounded-2xl shadow-lg p-6 h-32 border border-gray-100"
            >
              <img
                src={ally.logo}
                alt={ally.name}
                className="max-w-full max-h-full object-contain"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

