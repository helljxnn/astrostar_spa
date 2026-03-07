import { motion } from "framer-motion";
import { FaInstagram, FaPlayCircle, FaYoutube } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

const placeholderImages = [
  "/assets/images/services_image.jpg",
  "/assets/images/Foundation/founder.jpg",
  "/assets/images/Foundation/career.jpg",
  "/assets/images/Foundation/fmv_clip.png",
  "/assets/images/CategoriasHero.jpg",
  "/assets/images/EventsHero.png",
  "/assets/images/AboutHero.png",
  "/assets/images/EventsHero.png",
];

const firstMoments = [
  "Ciclo paseo del IV Festival Manuela Vanegas, en Copacabana, Antioquia.",
  "Campamento para las niñas, con el equipo de baloncesto Los Knicks de Nueva York.",
  "Pantalla gigante en La Misericordia para la final Colombia vs Brasil de la Copa América Femenina 2025.",
  '"Cancha Infinita", actividad en el Centro Penitenciario Femenino El Pedregal, Medellín.',
].map((title, index) => ({
  title,
  image: placeholderImages[index],
}));

const secondMoments = [
  "Campamentos Bancolombia, junto al exfutbolista Abel Aguilar.",
  "Olimpiadas con la primera infancia, IV Festival Manuela Vanegas.",
  "Charla con estudiantes de la Institución San Luis Gonzaga, en Copacabana.",
  "Primera participación de la fundación en la Baby Fútbol Regional de Antioquia.",
].map((title, index) => ({
  title,
  image: placeholderImages[index + 4],
}));

const featuredMoments = [...firstMoments, ...secondMoments];

const reels = [
  "Reel Instagram 01",
  "Reel Instagram 02",
  "Reel Instagram 03",
];

export const GallerySection = () => {
  return (
    <section className="bg-gradient-to-b from-[#faf7ff] via-white to-[#f8fcff] py-20">
      <div className="px-6 sm:px-10 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          <div className="relative overflow-hidden rounded-[2rem] shadow-2xl min-h-[320px] sm:min-h-[380px]">
            <img
              src="/assets/images/EventsHero.png"
              alt="Banner galería"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#120a2a]/80 via-[#120a2a]/45 to-[#120a2a]/20" />
            <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-3xl text-white">
              <p className="uppercase tracking-[0.18em] text-xs sm:text-sm text-white/80 font-semibold">
                Sección
              </p>
              <h2 className="mt-3 text-4xl sm:text-5xl font-bold font-montserrat">
                Galería
              </h2>
              <p className="mt-5 text-base sm:text-lg text-white/90 leading-relaxed">
                Un espacio que recoge algunos de los momentos más significativos
                de nuestros procesos deportivos y sociales. Aquí celebramos el
                esfuerzo, la alegría, el aprendizaje y cada paso que nuestras
                beneficiarias dan dentro y fuera de la cancha.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-14 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto rounded-[2rem] bg-white border border-[#b595ff]/20 shadow-[0_20px_70px_rgba(181,149,255,0.16)] overflow-hidden py-10 px-4 sm:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 font-montserrat">
              Carrusel Destacado
            </h3>
            <p className="mt-3 text-gray-600 max-w-3xl mx-auto">
              Una experiencia visual fluida e interactiva para recorrer nuestros
              momentos más representativos.
            </p>
          </div>

          <Swiper
            modules={[Autoplay, Pagination, EffectCoverflow]}
            effect="coverflow"
            centeredSlides
            slidesPerView={1.15}
            loop
            speed={700}
            autoplay={{ delay: 2800, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 130,
              modifier: 1.2,
              slideShadows: false,
            }}
            breakpoints={{
              768: { slidesPerView: 1.8 },
              1024: { slidesPerView: 2.5 },
              1280: { slidesPerView: 3 },
            }}
            className="!pb-12"
          >
            {featuredMoments.map((moment) => (
              <SwiperSlide key={`featured-${moment.title}`}>
                <article className="group rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all">
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={moment.image}
                      alt={moment.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-gray-700">
                      Imagen referencial
                    </span>
                    <p className="absolute left-4 right-4 bottom-4 text-sm text-white leading-relaxed">
                      {moment.title}
                    </p>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <div className="mt-16 px-6 sm:px-10 lg:px-20">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {firstMoments.map((moment, index) => (
              <motion.article
                key={moment.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
                className="group rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={moment.image}
                    alt={moment.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                  <span className="absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-gray-700">
                    Imagen referencial
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-700 leading-relaxed">{moment.title}</p>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reels.map((reel, index) => (
              <motion.article
                key={reel}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="rounded-3xl border border-[#b595ff]/20 bg-gradient-to-br from-[#b595ff]/10 via-white to-[#9be9ff]/15 p-6 shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-[#B595FF] text-white grid place-items-center">
                  <FaInstagram />
                </div>
                <h4 className="mt-4 text-lg font-bold text-gray-900">{reel}</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Espacio listo para incrustar tu reel de Instagram
                  <span className="font-semibold"> @fundacionmv.co</span>.
                </p>
                <button
                  type="button"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#B595FF] border border-[#B595FF]/25 hover:bg-[#B595FF]/10 transition-colors"
                >
                  <FaPlayCircle />
                  Ver reel
                </button>
              </motion.article>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {secondMoments.map((moment, index) => (
              <motion.article
                key={moment.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
                className="group rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={moment.image}
                    alt={moment.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                  <span className="absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-gray-700">
                    Imagen referencial
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-700 leading-relaxed">{moment.title}</p>
                </div>
              </motion.article>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="rounded-3xl border border-gray-100 bg-white shadow-xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 text-[#B595FF]">
              <FaYoutube className="text-2xl" />
              <h4 className="text-xl sm:text-2xl font-bold text-gray-900 font-montserrat">
                Video Destacado
              </h4>
            </div>
            <p className="mt-2 text-gray-600 text-sm sm:text-base">
              Área lista para mostrar el video principal de la sección de
              galería.
            </p>

            <div className="mt-5 rounded-2xl overflow-hidden border border-gray-100 shadow-md aspect-video bg-gray-100">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/x1oFn7dXxvs"
                title="Galería Fundación Manuela Vanegas"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

