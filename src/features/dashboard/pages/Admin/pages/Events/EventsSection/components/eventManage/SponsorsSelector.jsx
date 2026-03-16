import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaTimes } from "react-icons/fa";

export const SponsorsSelector = ({
  value = [],
  onChange,
  error,
  touched,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);

  const sponsors = ["Natipan", "Ponymalta", "NovaSport", "Adidas"];

  // Filtrar patrocinadores según búsqueda - mostrar todos si no hay término de búsqueda
  const filteredSponsors = searchTerm.trim()
    ? sponsors.filter((sponsor) =>
        sponsor.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : sponsors;

  const toggleSponsor = (sponsor) => {
    if (value.includes(sponsor)) {
      onChange(value.filter((item) => item !== sponsor));
    } else {
      onChange([...value, sponsor]);
    }
  };

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Renderizado para modo "view"
  if (disabled) {
    return (
      <div className="flex flex-col">
        <label className="mb-2 font-medium text-gray-700">Patrocinadores</label>
        <div className="p-3 bg-gray-100 rounded-lg">
          {value.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {value.map((sponsor) => (
                <span
                  key={sponsor}
                  className="px-3 py-1 bg-primary-purple/20 text-primary-purple text-sm font-medium rounded-full"
                >
                  {sponsor}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-500">No hay patrocinadores</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col relative" ref={containerRef}>
      <label className="mb-0 font-semibold text-gray-700 text-lg">
        Patrocinadores
      </label>

      {/* Caja principal */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="border border-gray-300 rounded-xl p-3 shadow-md flex justify-between items-center flex-wrap gap-2 bg-white cursor-pointer focus-within:ring-2 focus-within:ring-primary-purple focus-within:border-primary-purple"
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
            <span className="text-gray-400 text-sm">
              Selecciona patrocinadores
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
            {/* Barra de búsqueda */}
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar patrocinadores..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {filteredSponsors.map((sponsor) => (
              <div
                key={sponsor}
                onClick={() => toggleSponsor(sponsor)}
                className={`px-4 py-2 cursor-pointer text-sm hover:bg-[#e6faff] transition 
                  ${
                    value.includes(sponsor)
                      ? "bg-[#9BE9FF]/30 font-medium"
                      : "text-gray-700"
                  }`}
              >
                {sponsor}
              </div>
            ))}

            {filteredSponsors.length === 0 && searchTerm.trim() && (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                <div className="text-2xl mb-2">🔍</div>
                No se encontraron patrocinadores
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && touched && (
        <span className="text-sm text-red-500 mt-1">{error}</span>
      )}
    </div>
  );
};

