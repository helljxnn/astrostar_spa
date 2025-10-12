import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaTimes } from "react-icons/fa";

export const ScheduleSelector = ({ value = [], onChange, error, touched }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Horarios disponibles
  const schedules = [
    "6:00 AM - 8:00 AM",
    "8:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM",
    "2:00 PM - 4:00 PM",
    "4:00 PM - 6:00 PM",
    "6:00 PM - 8:00 PM",
  ];

  // Alternar selección de horario
  const toggleSchedule = (schedule) => {
    if (value.includes(schedule)) {
      onChange(value.filter((item) => item !== schedule));
    } else {
      onChange([...value, schedule]);
    }
  };

  return (
    <div className="flex flex-col relative">
      <label className="mb-1 font-semibold text-gray-700 text-lg">
        Seleccionar horarios
      </label>

      {/* Caja principal */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="border border-gray-300 rounded-xl p-3 bg-white shadow-md cursor-pointer 
                   flex justify-between items-center flex-wrap gap-2 
                   focus-within:ring-2 focus-within:ring-[#9BE9FF] focus-within:border-[#9BE9FF]"
      >
        <div className="flex flex-wrap gap-2">
          {value.length > 0 ? (
            value.map((schedule) => (
              <motion.span
                key={schedule}
                layout
                className="flex items-center gap-1 px-3 py-1 bg-[#9BE9FF]/80 text-gray-900 text-sm font-medium rounded-full shadow-sm"
              >
                {schedule}
                <FaTimes
                  className="cursor-pointer text-gray-700 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSchedule(schedule);
                  }}
                />
              </motion.span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">
              Selecciona horarios disponibles
            </span>
          )}
        </div>
        <FaChevronDown
          className={`text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown animado */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden"
          >
            {schedules.map((schedule) => (
              <div
                key={schedule}
                onClick={() => toggleSchedule(schedule)}
                className={`px-4 py-2 cursor-pointer text-sm hover:bg-[#e6faff] transition 
                  ${
                    value.includes(schedule)
                      ? "bg-[#9BE9FF]/30 font-medium"
                      : "text-gray-700"
                  }`}
              >
                {schedule}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error de validación */}
      {error && touched && (
        <span className="text-sm text-red-500 mt-1">{error}</span>
      )}
    </div>
  );
};
