import { motion } from "framer-motion";
import { useState } from "react";

export const StoryCard = ({ story, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.2,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative w-full h-80 sm:h-88 md:h-96 mx-auto max-w-sm"
      style={{ perspective: '1000px' }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div 
        className="group relative w-full h-full transition-transform duration-500 cursor-pointer"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front - Imagen con información básica */}
        <div
          className="absolute inset-0 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <motion.img
            src={story.image}
            alt={story.name}
            className="w-full h-full object-cover"
            transition={{ duration: 0.6 }}
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold font-montserrat mb-1 sm:mb-2">
                {story.name}
              </h3>
              <p className="text-xs sm:text-sm opacity-90 mb-2 sm:mb-3">
                {story.origin ? `${story.age} • ${story.origin}` : story.age}
              </p>
              <p 
                className="text-sm sm:text-base md:text-lg italic leading-relaxed"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                "{story.quote}"
              </p>
            </motion.div>
          </div>

          {/* Decorative corner accent */}
          <div 
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full opacity-80"
            style={{ 
              background: `linear-gradient(135deg, ${story.accent}, ${story.accent}80)`,
              boxShadow: `0 0 20px ${story.accent}40`
            }}
          />
        </div>

        {/* Back - Historia completa */}
        <div
          className="absolute inset-0 p-4 sm:p-6 md:p-8 flex flex-col justify-center text-center
          bg-gradient-to-br from-white to-gray-50 text-gray-800 
          rounded-2xl sm:rounded-3xl shadow-2xl border-2"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderColor: `${story.accent}30`
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="h-full flex flex-col justify-center"
          >
            {/* Decorative quote */}
            <div
              className="text-4xl sm:text-5xl md:text-6xl opacity-20 mb-2 sm:mb-4"
              style={{ 
                fontFamily: "'Georgia', serif",
                color: story.accent
              }}
            >
              "
            </div>

            <h3 className="text-lg sm:text-xl md:text-2xl font-bold font-montserrat mb-3 sm:mb-4" style={{ color: story.accent }}>
              {story.name}
            </h3>
            
            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-gray-700 flex-1 flex items-center">
              {story.fullStory}
            </p>

            {/* Decorative line */}
            <div 
              className="w-12 sm:w-14 md:w-16 h-1 mx-auto mt-4 sm:mt-6 rounded-full"
              style={{ background: `linear-gradient(90deg, ${story.accent}, ${story.accent}60)` }}
            />
          </motion.div>
        </div>
      </div>

      {/* Floating accent elements - responsive */}
      <motion.div
        className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full opacity-60"
        style={{ backgroundColor: story.accent }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.6, 0.8, 0.6]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          delay: index * 0.5
        }}
      />
      
      <motion.div
        className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-3 h-3 sm:w-4 sm:h-4 rounded-full opacity-40"
        style={{ backgroundColor: story.accent }}
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          delay: index * 0.7
        }}
      />
    </motion.div>
  );
};