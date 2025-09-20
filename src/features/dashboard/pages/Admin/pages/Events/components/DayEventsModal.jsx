import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import es from "date-fns/locale/es";
import { FaTimes } from "react-icons/fa";
import NotionEventComponent from "./NotionEventComponent";

const DayEventsModal = ({ isOpen, onClose, date, events, onActionClick }) => {
  if (!isOpen || !date || !events.length) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Eventos del día
              </h3>
              <p className="text-sm text-gray-600">
                {format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <FaTimes className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Events List */}
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              {events.map((event) => (
                <NotionEventComponent
                  key={event.id}
                  event={event}
                  onActionClick={onActionClick}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-center">
              <span className="text-sm text-gray-600">
                {events.length} evento{events.length !== 1 ? "s" : ""} en total
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DayEventsModal;