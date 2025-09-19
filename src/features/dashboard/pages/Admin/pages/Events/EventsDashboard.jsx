import { useState, useMemo } from "react";
import { EventModal } from "./components/EventModal";
import { FaPlus } from "react-icons/fa";
import EventsCalendar from "./components/EventsCalendar";
import ReportButton from "../../../../../../shared/components/ReportButton"; 
import SearchInput from "../../../../../../shared/components/SearchInput";

const Event = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState([]); // lista de eventos
  const [searchTerm, setSearchTerm] = useState("");

  const handleSave = (newEvent) => {
    setData((prev) => [...prev, newEvent]);
  };

  // Filtrado general por búsqueda (como en empleados)
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Columnas para el reporte 
  const reportColumns = [
    { key: "tipo", label: "Tipo de Evento" },
    { key: "nombre", label: "Nombre" },
    { key: "descripcion", label: "Descripción" },
    { key: "fechaInicio", label: "Fecha Inicio" },
    { key: "fechaFin", label: "Fecha Fin" },
    { key: "ubicacion", label: "Ubicación" },
    { key: "telefono", label: "Teléfono" },
    { key: "imagen", label: "Imagen" },
    { key: "cronograma", label: "Cronograma" },
    { key: "patrocinador", label: "Patrocinadores" },
    { key: "categoria", label: "Categoría" },
    { key: "estado", label: "Estado" },
    { key: "publicar", label: "Publicado" },
  ];

  return (
    <div className="font-monserrat">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Eventos</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          {/* Buscador */}
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar evento..."
          />

          {/* Botones */}
          <div className="flex items-center gap-3">
            {/* Botón de reporte */}
            <ReportButton
              data={filteredData}
              fileName="Reporte_Eventos"
              columns={reportColumns}
            />

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow hover:opacity-90 transition"
            >
              <FaPlus /> Crear
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <EventModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          isNew={true}
          event={null}
        />
      )}

      {/* Calendario */}
      <div className="mt-2">
        <EventsCalendar events={filteredData} />
      </div>
    </div>
  );
};

export default Event;
