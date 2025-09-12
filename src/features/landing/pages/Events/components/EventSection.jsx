import { motion } from "framer-motion";
import { EventCard } from "./EventCard";

export const EventsSection = ({
  upcomingEvents,
  pastEvents,
  highlightedEventId,
  onViewMore,
}) => {
  return (
    <div className="space-y-32" data-section="events">
      {/* -------------------- Próximos Eventos -------------------- */}
      {upcomingEvents.length > 0 && (
        <div className="mt-64">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: false, margin: "-200px 0px" }}
          >
            <h2 className="text-5xl font-montserrat font-bold bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] bg-clip-text text-transparent mb-4">
              Próximos Eventos
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid gap-16 md:gap-20">
            {upcomingEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                viewport={{ once: false, margin: "-100px 0px" }}
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

      {/* -------------------- Eventos Anteriores -------------------- */}
      {pastEvents.length > 0 && (
        <div className="pt-16 border-t-2 border-gray-100">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: false, margin: "-200px 0px" }}
          >
            <h2 className="text-5xl font-montserrat font-bold text-gray-600 mb-4">
              Eventos Anteriores
            </h2>
            <div className="w-32 h-1 bg-gray-300 mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid gap-16 md:gap-20">
            {pastEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                viewport={{ once: false, margin: "-100px 0px" }}
              >
                <EventCard
                  event={event}
                  isHighlighted={false}
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
