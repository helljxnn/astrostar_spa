import { useState, useEffect } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

const EventSearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Efecto para búsqueda en tiempo real (sin onSearch en dependencias para evitar loop)
  useEffect(() => {
    onSearch({ searchTerm, status: selectedStatus });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedStatus]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
  };

  const hasActiveFilters = searchTerm || selectedStatus;

  return (
    <div className="flex items-center gap-2 w-full max-w-2xl">
      {/* Buscador por nombre */}
      <div className="relative flex-1">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Buscar por nombre..."
          className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent text-sm"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" size={14} />
        </div>
      </div>

      {/* Filtro por estado */}
      <select
        value={selectedStatus}
        onChange={handleStatusChange}
        className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent text-sm bg-white min-w-[140px]"
      >
        <option value="">Todos los estados</option>
        <option value="Programado">Programado</option>
        <option value="Cancelado">Cancelado</option>
        <option value="Pausado">Pausado</option>
        <option value="Finalizado">Finalizado</option>
      </select>

      {/* Botón para limpiar filtros */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition text-gray-700"
          title="Limpiar filtros"
        >
          <FaTimes size={14} />
        </button>
      )}
    </div>
  );
};

export default EventSearchBar;