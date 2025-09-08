
// import { useState } from "react";
// import { EventModal } from "./components/EventModal"; 

import { useState } from "react";
import Table from "../../../../../../shared/components/Table/table";
import { EventModal } from "./components/EventModal";
import { FaPlus } from "react-icons/fa";

// Datos de ejemplo (puedes moverlos a models si quieres)
const initialEvents = [
  {
    nombre: "Festival de Verano",
    descripcion: "Un evento cultural con artistas locales",
    fechaInicio: "2025-08-01",
    fechaFin: "2025-08-05",
    ubicacion: "Parque Central",
    estado: "Programado",
    tipo: "Festival",
    patrocinador: "Adidas",
    categoria: "Todas",
    publicar: true,
  },
];

const Event = () => {
  const [data, setData] = useState(initialEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = (newEvent) => {
    setData([...data, newEvent]);
  };

  return (
    <div className="p-6 font-questrial">
      {/* Header con botón Crear */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Eventos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
        >
          <FaPlus /> Crear
        </button>
      </div>

      {/* Tabla de eventos */}
      <Table
        thead={{
          titles: [
            "Nombre",
            "Descripción",
            "Fecha inicio",
            "Fecha fin",
            "Ubicación",
            "Tipo",
            "Estado",
            "Patrocinador",
            "Categoría",
            "Publicado",
          ],
          state: true,
        }}
        tbody={{
          data,
          dataPropertys: [
            "nombre",
            "descripcion",
            "fechaInicio",
            "fechaFin",
            "ubicacion",
            "tipo",
            "estado",
            "patrocinador",
            "categoria",
            "publicar",
          ],
          state: true,
        }}
      />

      {/* Modal para crear evento */}
      {isModalOpen && (
        <EventModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Event;
