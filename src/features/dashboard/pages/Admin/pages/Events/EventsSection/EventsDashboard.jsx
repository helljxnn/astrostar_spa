import { useState, useMemo } from "react";
import { EventModal } from "./components/EventModal";
import { FaPlus } from "react-icons/fa";
import EventsCalendar from "./components/EventsCalendar";
import EventReportGenerator from "./components/EventReportGenerator";
import EventSearchBar from "./components/EventSearchBar";
import EventSearchList from "./components/EventSearchList";
import { sampleEvents } from "./components/sampleEvents";

const Event = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState(() => {
    const transformedEvents = sampleEvents.map(event => ({
      ...event,
      start: new Date(event.fechaInicio),
      end: new Date(event.fechaFin),
      title: event.nombre
    }));
    console.log("EventsDashboard - Eventos transformados:", transformedEvents);
    return transformedEvents;
  }); // Usando los datos de ejemplo con formato para el calendario
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleSave = (newEvent) => {
    setData((prev) => [...prev, newEvent]);
  };

  // Filtrado general por búsqueda
  const filteredData = useMemo(() => {
    const result = !searchTerm ? data : data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    console.log("EventsDashboard - Datos filtrados:", result);
    console.log("EventsDashboard - SearchTerm:", searchTerm);
    return result;
  }, [data, searchTerm]);

  // Manejar la búsqueda
  const handleSearch = (term) => {
    setSearchTerm(term);
    setIsSearchActive(!!term);
  };

  // Manejar edición de evento
  const handleEdit = (event) => {
    // Aquí iría la lógica para editar un evento
    console.log("Editar evento:", event);
  };

  // Manejar eliminación de evento
  const handleDelete = (event) => {
    // Aquí iría la lógica para eliminar un evento
    console.log("Eliminar evento:", event);
  };

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

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Buscador personalizado */}
          <EventSearchBar onSearch={handleSearch} />
          
          {/* Botones */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-purple text-white rounded-lg shadow hover:opacity-90 transition text-sm whitespace-nowrap"
          >
            <FaPlus size={12} /> Crear
          </button>
          
          {/* Componente de reporte */}
          <EventReportGenerator 
            data={filteredData} 
            fileName="eventos" 
            columns={reportColumns}
          />
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

      {/* Contenido condicional: Calendario o Lista de búsqueda */}
      <div className="mt-16">
        {isSearchActive ? (
          <EventSearchList 
            events={filteredData} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        ) : (
          <EventsCalendar events={filteredData} />
        )}
      </div>
    </div>
  );
};

export default Event;
