import { motion } from "framer-motion";
import { FaInstagram, FaPlay } from "react-icons/fa";
import { Hero } from "../../components/Hero";
import MagicBento from "./bits/MagicBento";

const galleryImage = (filename) => `/assets/images/Gallery/${filename}`;

const firstGalleryBlock = [
  {
    title:
      "CICLO PASEO DEL CUARTO FESTIVAL MANUELA VANEGAS, EN COPACABANA, ANTIOQUIA.",
    image: galleryImage("37.JPG"),
  },
  {
    title:
      "CAMPAMENTO PARA LAS NIÑAS, CON EL EQUIPO DE BALONCESTO LOS KNICKS DE NUEVA YORK.",
    image: galleryImage("38.jpg"),
  },
  {
    title:
      "PANTALLA GIGANTE EN LA MISERICORDIA, PARA LA FINAL ENTRE COLOMBIA Y BRASIL DE LA COPA AMÉRICA FEMENINA DEL 2025.",
    image: galleryImage("39.JPG"),
  },
  {
    title:
      "CANCHA INFINITA, ACTIVIDAD EN EL CENTRO PENITENCIARIO FEMENINO EL PEDREGAL, MEDELLÍN.",
    image: galleryImage("40.jpg"),
  },
];

const secondGalleryBlock = [
  {
    title: "CAMPAMENTOS BANCOLOMBIA, JUNTO EL EX FUTBOLISTA ABEL AGUILAR.",
    image: galleryImage("41.jpg"),
  },
  {
    title: "OLIMPIADAS CON LA PRIMERA INFANCIA, IV FESTIVAL MANUELA VANEGAS.",
    image: galleryImage("42.jpg"),
  },
  {
    title:
      "CHARLA CON LOS ESTUDIANTES DE LA INSTITUCIÓN SAN LUIS GONZAGA, EN COPACABANA.",
    image: galleryImage("43.JPG"),
  },
  {
    title:
      "PRIMERA PARTICIPACIÓN DE LA FUNDACIÓN EN LA BABY FÚTBOL REGIONAL DE ANTIOQUIA.",
    image: galleryImage("44.jpg"),
  },
];

const reels = [
  {
    title: "Reel 1 - Fundación MV",
    reelId: "DQNGTD4jLuk",
    url: "https://www.instagram.com/reel/DQNGTD4jLuk/?igsh=aDYxdjRibGtvNjdp",
  },
  {
    title: "Reel 2 - Fundación MV",
    reelId: "DOUeGGRjDJu",
    url: "https://www.instagram.com/reel/DOUeGGRjDJu/?igsh=OTVhM2R5aDB6NjBi",
  },
  {
    title: "Reel 3 - Fundación MV",
    reelId: "DS_ILFnjFlO",
    url: "https://www.instagram.com/reel/DS_ILFnjFlO/?igsh=MWxqaDRoMzZ2bzlxcQ==",
  },
];

function Gallery() {
  return (
    <>
      <Hero variant="image-only" imageUrl={galleryImage("QUINTO_FESTIVAL.jpg")} />

      <section className="bg-white py-14 px-6 sm:px-10 lg:px-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl font-bold text-gray-900 font-montserrat"
          >
            Galería
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 max-w-4xl mx-auto text-lg text-gray-700 leading-relaxed"
          >
            Un espacio que recoge algunos de los momentos más significativos de
            nuestros procesos deportivos y sociales. Aquí celebramos el
            esfuerzo, la alegría, el aprendizaje y cada paso que nuestras
            beneficiarias dan dentro y fuera de la cancha.
          </motion.p>
        </div>
      </section>

      <section className="pb-14 px-6 sm:px-10 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <MagicBento items={firstGalleryBlock} />
        </div>
      </section>

      <section className="pt-16 pb-12 px-6 sm:px-10 lg:px-20 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <FaInstagram className="text-[#E1306C] text-2xl" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-montserrat text-center">
              Reels de Instagram - @fundacionmv.co
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {reels.map((reel, index) => (
              <motion.article
                key={reel.reelId}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="mx-auto w-full max-w-[290px] sm:max-w-[310px] rounded-[1.75rem] bg-white border border-gray-200 shadow-lg overflow-hidden"
              >
                <div className="relative w-full aspect-[9/14] overflow-hidden bg-white">
                  <iframe
                    src={`https://www.instagram.com/reel/${reel.reelId}/embed?locale=es_ES`}
                    title={reel.title}
                    className="absolute -left-px -top-[56px] w-[calc(100%+2px)] h-[calc(100%+190px)] border-0"
                    loading="lazy"
                    scrolling="no"
                    allowTransparency
                    allowFullScreen
                  />
                  <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-white" />
                  <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[12px] bg-white" />
                </div>

                <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-white">
                  <div className="inline-flex items-center gap-2 min-w-0">
                    <span className="grid h-10 w-10 place-items-center rounded-xl text-white bg-primary-purple shadow-sm">
                      <FaPlay className="text-xs" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] text-gray-500 leading-none">Instagram Reel</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{reel.title}</p>
                    </div>
                  </div>

                  <a
                    href={reel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-primary-purple text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-primary-purple-light transition-colors"
                  >
                    <FaPlay className="text-[10px]" />
                    Reel
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-6 sm:px-10 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <MagicBento items={secondGalleryBlock} />
        </div>
      </section>

      <section className="pt-2 pb-16 px-6 sm:px-10 lg:px-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl font-bold text-gray-900 font-montserrat mb-6"
          >
            Video de YouTube
          </motion.h2>

          <div className="mx-auto w-full max-w-5xl rounded-3xl overflow-hidden border border-gray-200 shadow-xl bg-black aspect-video">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/x1oFn7dXxvs"
              title="Video destacado - Fundación Manuela Vanegas"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </>
  );
}

export default Gallery;
