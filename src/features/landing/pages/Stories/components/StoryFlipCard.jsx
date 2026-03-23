import { motion } from "framer-motion";

export const StoryFlipCard = ({
  story,
  index,
  featured = false,
}) => {
  if (featured) {
    return (
      <motion.article
        initial={{ opacity: 0, x: 45 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.75, delay: index * 0.08 }}
        whileHover={{
          y: -8,
          boxShadow: "0 24px 50px rgba(181, 149, 255, 0.18)",
        }}
        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white font-montserrat shadow-xl"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.9 }}
        />

        <div className="grid grid-cols-1 items-stretch lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative min-h-[360px] overflow-hidden lg:min-h-[100%]">
            <img
              src={story.image}
              alt={story.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-sm font-medium text-white/90">{story.meta}</p>
              <p className="mt-3 text-lg italic leading-relaxed text-white sm:text-lg">
                {story.quote}
              </p>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-white to-slate-50 p-8 sm:p-10">
            <div className="mb-6 flex items-center gap-4">
              <div className="h-14 w-2 rounded-full bg-gradient-to-b from-[#B595FF] to-[#9BE9FF]" />
              <div>
                <h3 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
                  {story.title}
                </h3>
              </div>
            </div>

            <p className="text-base leading-relaxed text-gray-700">
              {story.story}
            </p>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 35, rotateY: index % 2 === 0 ? -10 : 10 }}
      whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.7,
        delay: index * 0.08,
        type: "spring",
        stiffness: 95,
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(15, 23, 42, 0.12)",
      }}
      className="group relative overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white font-montserrat shadow-lg"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.8 }}
      />

      <div className="relative h-[240px] overflow-hidden">
        <img
          src={story.image}
          alt={story.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <h3 className="text-xl font-bold leading-tight sm:text-2xl">
            {story.title}
          </h3>
          {story.meta && (
            <p className="mt-2 text-sm text-white/85">{story.meta}</p>
          )}
        </div>
      </div>

      <div className="relative p-6">
        <p className="text-base italic leading-relaxed text-gray-700">
          {story.quote}
        </p>
        <p className="mt-4 text-base leading-relaxed text-gray-600">
          {story.story}
        </p>
      </div>
    </motion.article>
  );
};
