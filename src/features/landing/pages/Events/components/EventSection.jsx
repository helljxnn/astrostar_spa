import { motion } from "framer-motion";
import { EventCard } from "./EventCard";
import { useEffect, useRef } from "react";

export const EventsSection = ({
  upcomingEvents,
  pastEvents,
  highlightedEventId,
  onViewMore,
}) => {
  const eventRefs = useRef({});

  useEffect(() => {

    if (highlightedEventId) {
      setTimeout(() => {
        const element = eventRefs.current[highlightedEventId];
        if (element) {

          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        } else {

        }
      }, 50);
    }
  }, [highlightedEventId]);

  return (
    <div className="space-y-12 sm:space-y-16 md:space-y-20">
      {upcomingEvents.length > 0 && (
        <div className="mt-12 sm:mt-16 md:mt-20">
          <motion.div
            className="text-center mb-6 sm:mb-8 md:mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: false, margin: "-200px 0px" }}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-montserrat font-bold bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4">
              Próximos Eventos
            </h2>
            <div className="w-16 sm:w-20 md:w-24 h-0.5 sm:h-0.5 md:h-1 bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid gap-6 sm:gap-8 md:gap-12">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                  delay: index * 0.1,
                }}
                viewport={{ once: false, margin: "-100px 0px" }}
                ref={(el) => (eventRefs.current[event.id] = el)}
              >
                <EventCard
                  event={event}
                  isHighlighted={highlightedEventId === event.id}
                  onViewMore={onViewMore}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {pastEvents.length > 0 && (
        <div className="pt-8 sm:pt-12 md:pt-16 border-t border-gray-200">
          <motion.div
            className="text-center mb-6 sm:mb-8 md:mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: false, margin: "-200px 0px" }}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-montserrat font-bold text-gray-600 mb-2 sm:mb-3 md:mb-4">
              Eventos Anteriores
            </h2>
            <div className="w-16 sm:w-20 md:w-24 h-0.5 sm:h-0.5 md:h-1 bg-gray-300 mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid gap-6 sm:gap-8 md:gap-12">
            {pastEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                  delay: index * 0.1,
                }}
                viewport={{ once: false, margin: "-100px 0px" }}
                ref={(el) => (eventRefs.current[event.id] = el)}
              >
                <EventCard
                  event={event}
                  isHighlighted={highlightedEventId === event.id}
                  onViewMore={onViewMore}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};