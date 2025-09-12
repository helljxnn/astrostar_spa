import { motion } from "framer-motion";

export const EventSelector = ({ eventTypes, selectedType, onTypeSelect, nextEvent }) => {
  const handleTypeSelect = (typeId) => {
    console.log("🔍 EventSelector: Seleccionando tipo", typeId);
    onTypeSelect(typeId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: false, margin: "-300px 0px" }}
    >
      <div className="text-center mb-12">
        <h2 className="text-5xl font-montserrat font-bold bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] bg-clip-text text-transparent mb-4">
          Tipos de Eventos
        </h2>
        {process.env.NODE_ENV === 'development' && nextEvent && (
          <p className="text-sm text-gray-500">
            Próximo evento: {nextEvent.title} - {nextEvent.date}
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {eventTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleTypeSelect(type.id)}
            className={`group relative px-10 py-6 rounded-3xl font-montserrat font-bold text-lg transition-all duration-500 transform hover:scale-110 ${
              selectedType === type.id
                ? "bg-gradient-to-r from-[#b595ff] to-[#9be9ff] text-white shadow-2xl scale-110"
                : "bg-white text-gray-700 hover:bg-gradient-to-r hover:from-[#b595ff] hover:to-[#9be9ff] hover:text-white border-2 border-gray-200 hover:border-transparent shadow-lg hover:shadow-2xl"
            }`}
          >
            <div
              className={`absolute inset-0 rounded-3xl transition-opacity duration-500 ${
                selectedType === type.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              } bg-gradient-to-r from-[#b595ff]/20 to-[#9be9ff]/20`}
            ></div>

            <div className="relative z-10 flex items-center gap-4">
              <span className="text-3xl transform transition-transform duration-300 group-hover:scale-125">
                {type.icon}
              </span>
              <span className="tracking-wide">{type.label}</span>
            </div>

            {selectedType === type.id && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-[#9be9ff] rounded-full animate-pulse"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
};