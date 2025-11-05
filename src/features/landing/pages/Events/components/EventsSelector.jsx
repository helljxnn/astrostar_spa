import { motion, useScroll } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export const EventSelector = ({ eventTypes, selectedType, onTypeSelect, nextEvent }) => {
  const [hasScrolledDown, setHasScrolledDown] = useState(false);
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const prevScrollY = useRef(0);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      if (latest > prevScrollY.current) {
        setHasScrolledDown(true);
      }
      prevScrollY.current = latest;
    });
  }, [scrollY]);

  const handleTypeSelect = (typeId) => {

    onTypeSelect(typeId);
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 40 }}
      animate={hasScrolledDown ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="event-selector-container"
    >
      <div className="text-center mb-6 sm:mb-8 md:mb-10">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-montserrat font-bold bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4">
          Tipos de Eventos
        </h2>

        {process.env.NODE_ENV === "development" && nextEvent && (
          <p className="text-xs sm:text-sm text-gray-500">
            Próximo evento: {nextEvent.title} - {nextEvent.date}
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 md:gap-3">
          {eventTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleTypeSelect(type.id)}
              className={`group relative px-2 sm:px-3 md:px-4 py-1 sm:py-2 md:py-3 rounded sm:rounded-lg md:rounded-xl font-montserrat font-bold text-xs sm:text-sm md:text-base transition-all duration-500 transform hover:scale-105 whitespace-nowrap flex-shrink-0 ${
                selectedType === type.id
                  ? "bg-gradient-to-r from-[#b595ff] to-[#9be9ff] text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 hover:bg-gradient-to-r hover:from-[#b595ff] hover:to-[#9be9ff] hover:text-white border-2 border-gray-200 hover:border-transparent shadow-md hover:shadow-lg"
              }`}
            >
              <div
                className={`absolute inset-0 rounded sm:rounded-lg md:rounded-xl transition-opacity duration-500 ${
                  selectedType === type.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                } bg-gradient-to-r from-[#b595ff]/20 to-[#9be9ff]/20`}
              ></div>

              <div className="relative z-10 flex items-center gap-1 sm:gap-2">
                <span className="text-base sm:text-lg md:text-xl transform transition-transform duration-300 group-hover:scale-110">
                  {type.icon}
                </span>
                <span className="tracking-wide">{type.label}</span>
              </div>

              {selectedType === type.id && (
                <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-[#9be9ff] rounded-full animate-pulse"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};