import React from "react";
import { motion } from "framer-motion";
import { FaCalendarDay } from "react-icons/fa";

const CalendarControls = ({
  currentView,
  selectedDate,
  onPrevious,
  onNext,
  onToday,
  title,
  colorScheme,
  className = "",
  viewTypes = ["month", "week", "day"],
  onViewChange,
  showViewToggle = true,
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100 gap-4 ${className}`}
    >
      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        {/* Botón Hoy */}
        <motion.button
          onClick={onToday}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Hoy
        </motion.button>

        {/* Botón Atrás */}
        <motion.button
          onClick={onPrevious}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Atrás
        </motion.button>

        {/* Botón Siguiente */}
        <motion.button
          onClick={onNext}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Siguiente →
        </motion.button>
      </div>

      {/* Title - Hidden on mobile to save space */}
      <div className="hidden sm:block text-center">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>

      {/* View Toggle */}
      {showViewToggle && viewTypes.length > 1 && (
        <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
          {viewTypes.map((view) => (
            <button
              key={view}
              onClick={() => onViewChange && onViewChange(view)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                currentView === view
                  ? "bg-[#B595FF] text-white shadow-sm"
                  : "text-gray-600 hover:text-[#B595FF] hover:bg-white"
              }`}
            >
              {view === "month" && "Mes"}
              {view === "week" && "Semana"}
              {view === "day" && "Día"}
              {view === "list" && "Lista"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarControls;

