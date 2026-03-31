import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { storiesData } from "../data/storiesData";
import { StoryFlipCard } from "./StoryFlipCard";

export const StoriesSection = () => {
  const [selectedStory, setSelectedStory] = useState(null);
  const featuredStory = storiesData.find((story) => story.layout === "featured");
  const secondaryStories = storiesData.filter((story) => story.layout !== "featured");

  return (
    <>
      <section className="bg-gradient-to-b from-white to-gray-50 px-6 py-16 font-montserrat sm:px-10 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="mb-12 text-center"
          >
            <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">
              Historias y testimonios
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Historias
            </h2>
          </motion.div>

          <div className="space-y-8">
            {featuredStory && (
              <StoryFlipCard
                story={featuredStory}
                index={0}
                featured
                onOpen={setSelectedStory}
              />
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {secondaryStories.map((story, index) => (
                <StoryFlipCard
                  key={story.id}
                  story={story}
                  index={index + 1}
                  onOpen={setSelectedStory}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStory(null)}
            className="fixed inset-0 z-[70] overflow-y-auto bg-black/55 p-4 backdrop-blur-sm sm:p-8"
          >
            <div className="grid min-h-full place-items-center">
              <motion.div
                initial={{ opacity: 0, y: 28, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl"
              >
                <div className="grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr]">
                  <div className="relative min-h-[320px] lg:min-h-full">
                    <img
                      src={selectedStory.image}
                      alt={selectedStory.title}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
                    <button
                      type="button"
                      onClick={() => setSelectedStory(null)}
                      className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md"
                      aria-label="Cerrar historia"
                    >
                      ×
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-white to-slate-50 p-7 font-montserrat sm:p-8 lg:p-10">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="h-14 w-2 rounded-full bg-gradient-to-b from-[#B595FF] to-[#9BE9FF]" />
                      <div>
                        <h3 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
                          {selectedStory.title}
                        </h3>
                        {selectedStory.meta && (
                          <p className="mt-2 text-sm text-gray-500">
                            {selectedStory.meta}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-base italic leading-relaxed text-gray-700">
                      {selectedStory.quote}
                    </p>
                    <p className="mt-6 text-base leading-relaxed text-gray-700">
                      {selectedStory.story}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
