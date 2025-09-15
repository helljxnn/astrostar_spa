import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaTimes } from "react-icons/fa";

export const SponsorsSelector = ({ value = [], onChange, error, touched }) => {
  const [isOpen, setIsOpen] = useState(false);

  const sponsors = ["Natipan", "Ponymalta", "NovaSport", "Adidas"];

  const toggleSponsor = (sponsor) => {
    if (value.includes(sponsor)) {
      onChange(value.filter((item) => item !== sponsor));
    } else {
      onChange([...value, sponsor]);
    }
  };

  return (
    <div className="flex flex-col relative">
      <label className="mb-1 font-semibold text-gray-700 text-lg">
        Patrocinadores
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
            value.map((sponsor) => (
              <motion.span
                key={sponsor}
                layout
                className="flex items-center gap-1 px-3 py-1 bg-[#9BE9FF]/80 text-gray-900 text-sm font-medium rounded-full shadow-sm"
              >
                {sponsor}
                <FaTimes
                  className="cursor-pointer text-gray-700 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSponsor(sponsor);
                  }}
                />
              </motion.span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">Selecciona patrocinadores</span>
          )}
        </div>
        <FaChevronDown
          className={`text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
            {sponsors.map((sponsor) => (
              <div
                key={sponsor}
                onClick={() => toggleSponsor(sponsor)}
                className={`px-4 py-2 cursor-pointer text-sm hover:bg-[#e6faff] transition 
                  ${value.includes(sponsor) ? "bg-[#9BE9FF]/30 font-medium" : "text-gray-700"}`}
              >
                {sponsor}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {error && touched && (
        <span className="text-sm text-red-500 mt-1">{error}</span>
      )}
    </div>
  );
};
