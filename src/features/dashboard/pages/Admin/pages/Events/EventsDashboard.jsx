import { useState } from "react";
import { EventModal } from "./components/EventModal";
import { FaPlus } from "react-icons/fa";
import EventsCalendar from "./components/EventsCalendar";

const Event = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = (newEvent) => {
    setData([...data, newEvent]);
  };

  return (
    <div className="font-monserrat">
      {/* Header con botón Crear */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Eventos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow hover:opacity-90 transition"
        >
          <FaPlus /> Crear
        </button>
      </div>

      {/* Modal para crear evento */}
      {isModalOpen && (
        <EventModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          isNew={true} //Indicar que es nuevo
          event={null} // No hay evento al crear
        />
      )}

      {/* Aquí se renderiza el calendario */}
      <div className="mt-2">
        <EventsCalendar />
      </div>
    </div>
  );
};

export default Event;
