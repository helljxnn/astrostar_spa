import { useEffect } from "react";
import { motion } from "framer-motion";

export const EventModal = ({ event, onClose }) => {
  if (!event) return null;

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        // Aquí establecemos un tamaño máximo fijo para el modal
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full h-[600px] relative overflow-hidden flex flex-col md:flex-row"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 text-gray-500 hover:text-gray-900 transition-colors text-3xl font-light"
        >
          &times;
        </button>

        {/* Columna de Imagen */}
        <div className="w-full h-1/2 md:w-1/2 md:h-full overflow-hidden">
          <img
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            // `object-cover` asegura que la imagen llene el contenedor sin distorsionarse
            className="w-full h-full object-cover rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none"
          />
        </div>

        {/* Columna de Contenido */}
        <div className="w-full h-1/2 md:w-1/2 md:h-full p-8 md:p-12 overflow-y-auto">
          <div className="flex flex-col h-full">
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] mb-4">
              {event.title}
            </h2>
            <p className="text-gray-600 text-lg mb-6">{event.description}</p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 text-lg text-gray-700">
                <span className="text-2xl">📅</span>
                <span className="font-semibold">{event.date}</span>
              </div>
              <div className="flex items-center gap-4 text-lg text-gray-700">
                <span className="text-2xl">🕐</span>
                <span className="font-medium">{event.time}</span>
              </div>
              <div className="flex items-center gap-4 text-lg text-gray-700">
                <span className="text-2xl">📍</span>
                <span className="font-medium">{event.location}</span>
              </div>
            </div>
            {event.type === "festival" && (
              <div className="mt-auto pt-6 border-t border-gray-200">
                <h3 className="text-2xl font-semibold mb-4">
                  Detalles del Festival
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {event.details}
                </p>
                {event.patrocinadores && event.patrocinadores.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-800">
                      Patrocinadores
                    </h4>
                    <ul className="list-disc list-inside text-gray-600">
                      {event.patrocinadores.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {event.type === "torneo" && (
              <div className="mt-auto pt-6 border-t border-gray-200">
                <h3 className="text-2xl font-semibold mb-4">
                  Detalles del Torneo
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {event.details}
                </p>
                <div className="flex items-center gap-4 text-lg text-gray-700">
                  <span className="text-2xl">🏅</span>
                  <span className="font-medium">{event.premios}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
