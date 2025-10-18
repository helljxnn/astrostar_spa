import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";

const EmployeeScheduleSearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Búsqueda en tiempo real
  useEffect(() => {
    if (onSearch) onSearch(searchTerm);
  }, [searchTerm, onSearch]);

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder="Buscar horario o empleado..."
        className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 
                   focus:border-transparent text-gray-700"
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FaSearch className="text-gray-400" />
      </div>
    </div>
  );
};

export default EmployeeScheduleSearchBar;
