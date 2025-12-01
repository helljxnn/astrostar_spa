import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft, FaFilter, FaUsers, FaUserTie } from "react-icons/fa";
import SearchInput from "../../../../../../../../shared/components/SearchInput";
import Pagination from "../../../../../../../../shared/components/Table/Pagination";
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from "../../../../../../../../shared/utils/alerts";

// Datos quemados para equipos
const mockTeams = [
  { id: 1, name: "Águilas Doradas", category: "Sub 15", members: 12 },
  { id: 2, name: "Leones FC", category: "Sub 17", members: 15 },
  { id: 3, name: "Tigres Unidos", category: "Sub 13", members: 10 },
  { id: 4, name: "Panteras Negras", category: "Sub 15", members: 14 },
  { id: 5, name: "Halcones Rojos", category: "Sub 17", members: 13 },
];

// Datos quemados para deportistas
const mockAthletes = [
  { id: 1, name: "María González", category: "Sub 15", age: 14, sport: "Fútbol" },
  { id: 2, name: "Carlos Rodríguez", category: "Sub 17", age: 16, sport: "Baloncesto" },
  { id: 3, name: "Ana Martínez", category: "Sub 13", age: 12, sport: "Voleibol" },
  { id: 4, name: "Luis Pérez", category: "Sub 15", age: 15, sport: "Fútbol" },
  { id: 5, name: "Sofia López", category: "Sub 17", age: 17, sport: "Atletismo" },
  { id: 6, name: "Diego Hernández", category: "Sub 13", age: 13, sport: "Natación" },
  { id: 7, name: "Valentina Castro", category: "Sub 15", age: 14, sport: "Gimnasia" },
  { id: 8, name: "Andrés Morales", category: "Sub 17", age: 16, sport: "Tenis" },
];

// Sistema global para simular inscripciones persistentes
const getGlobalInscriptions = () => {
  if (typeof window !== 'undefined' && window.globalInscriptions) {
    return window.globalInscriptions;
  }
  // Inicializar si no existe
  const initial = {
    teams: [mockTeams[0], mockTeams[1]], // Primeros 2 equipos inscritos por defecto
    athletes: [mockAthletes[0], mockAthletes[1]], // Primeros 2 deportistas inscritos por defecto
  };
  if (typeof window !== 'undefined') {
    window.globalInscriptions = initial;
  }
  return initial;
};

const EventInscriptionModal = ({ 
  isOpen, 
  onClose, 
  eventName, 
  participantType, 
  action = "register" 
}) => {
  // Obtener elementos inscritos desde el estado global
  const getInitialSelectedItems = () => {
    if (action === "editRegistrations" || action === "viewRegistrations") {
      const globalInscriptions = getGlobalInscriptions();
      const isTeamType = participantType === "Equipos";
      
      if (isTeamType) {
        // Transformar datos de equipos para consistencia
        return globalInscriptions.teams.map(team => ({
          id: team.id,
          nombre: team.name,
          categoria: team.category,
          entrenador: "Entrenador Asignado",
          cantidadDeportistas: team.members,
          acompanantes: 0,
        }));
      } else {
        // Transformar datos de deportistas para consistencia
        return globalInscriptions.athletes.map(athlete => ({
          id: athlete.id,
          nombre: athlete.name,
          categoria: athlete.category,
          edad: athlete.age,
          tipo: "Deportista",
          acompanantes: 0,
        }));
      }
    }
    return [];
  };

  const [selectedItems, setSelectedItems] = useState(getInitialSelectedItems());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSection, setSelectedSection] = useState("deportistas");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 3;

  // Reiniciar estado cuando cambie la acción o se abra el modal
  useEffect(() => {
    if (isOpen) {
      const initialItems = getInitialSelectedItems();
      setSelectedItems(initialItems);
      setSearchTerm("");
      setSelectedCategory("");
      setCurrentPage(1);
    }
  }, [isOpen, action, participantType]);

  if (!isOpen) return null;

  const isTeamType = participantType === "Equipos";
  const isViewMode = action === "viewRegistrations";

  // Preparar datos según el tipo
  const getCurrentData = () => {
    if (isTeamType) {
      return mockTeams.map(team => ({
        id: team.id,
        nombre: team.name,
        categoria: team.category,
        entrenador: "Entrenador Asignado",
        cantidadDeportistas: team.members,
        acompanantes: 0,
      }));
    } else if (selectedSection === "deportistas") {
      return mockAthletes.map(athlete => ({
        id: athlete.id,
        nombre: athlete.name,
        categoria: athlete.category,
        edad: athlete.age,
        tipo: "Deportista",
        acompanantes: 0,
      }));
    } else {
      // Personas temporales (vacío por ahora, se puede agregar después)
      return [];
    }
  };

  const mockData = getCurrentData();

  // Filtrar datos
  const filteredData = useMemo(() => {
    let filtered = mockData;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoría
    if (selectedCategory) {
      filtered = filtered.filter((item) => item.categoria === selectedCategory);
    }

    return filtered;
  }, [mockData, searchTerm, selectedCategory]);

  // Paginación
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  // Categorías únicas para el filtro
  const categories = [...new Set(mockData.map((item) => item.categoria))];

  const handleItemToggle = (item) => {
    setSelectedItems(prev => {
      const exists = prev.find(selected => selected.id === item.id);
      if (exists) {
        return prev.filter(selected => selected.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleAcompanantesChange = (itemId, value) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, acompanantes: parseInt(value) || 0 }
          : item
      )
    );
  };

  const handleSave = async () => {
    try {
      if (action === "editRegistrations") {
        const result = await showConfirmAlert(
          "¿Guardar cambios?",
          "Se actualizarán las inscripciones seleccionadas."
        );
        if (!result.isConfirmed) return;
      }

      // Simular éxito/error
      const success = Math.random() > 0.1; // 90% de éxito
      
      if (!success) {
        throw new Error("Error simulado al guardar");
      }

      // Actualizar el estado global
      if (action === "editRegistrations") {
        const globalInscriptions = getGlobalInscriptions();
        const isTeamType = participantType === "Equipos";
        if (isTeamType) {
          globalInscriptions.teams = [...selectedItems];
        } else {
          globalInscriptions.athletes = [...selectedItems];
        }
      }
      
      if (action === "editRegistrations") {
        showSuccessAlert(
          "Inscripciones actualizadas",
          "Los cambios se han guardado correctamente."
        );
      }
      
      onClose();
    } catch (error) {
      console.error("Error al guardar inscripciones:", error);
      showErrorAlert(
        "Error al guardar",
        "No se pudieron guardar los cambios. Intenta de nuevo."
      );
    }
  };



  const getTitle = () => {
    switch (action) {
      case "register":
        return `Inscribir ${participantType}`;
      case "editRegistrations":
        return `Editar ${participantType} Inscritos`;
      case "viewRegistrations":
        return `Ver ${participantType} Inscritos`;
      default:
        return `Gestionar ${participantType}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-purple to-primary-blue p-6 text-white">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold">{getTitle()}</h2>
              <p className="text-blue-100 mt-1">Evento: {eventName}</p>
            </div>
          </div>
        </div>

        {/* Section Tabs - Solo mostrar si no es tipo Equipos y no es modo vista */}
        {!isTeamType && !isViewMode && (
          <div className="border-b border-gray-200 bg-white">
            <div className="flex">
              <button
                onClick={() => {
                  setSelectedSection("deportistas");
                  setCurrentPage(1);
                  setSearchTerm("");
                  setSelectedCategory("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  selectedSection === "deportistas"
                    ? "border-primary-purple text-primary-purple bg-purple-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaUsers className="w-4 h-4" />
                Deportistas Fundación
              </button>
              <button
                onClick={() => {
                  setSelectedSection("temporales");
                  setCurrentPage(1);
                  setSearchTerm("");
                  setSelectedCategory("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  selectedSection === "temporales"
                    ? "border-primary-purple text-primary-purple bg-purple-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaUserTie className="w-4 h-4" />
                Personas Temporales
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        {!isViewMode && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="flex-1">
                <SearchInput
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Buscar..."
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-4">
                <FaFilter className="text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="p-6">
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary-purple focus:ring-primary-purple border-gray-300 rounded"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...paginatedData]);
                          } else {
                            setSelectedItems([]);
                          }
                        }}
                        checked={
                          paginatedData.length > 0 &&
                          selectedItems.length === paginatedData.length
                        }
                        disabled={isViewMode}
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Nombre
                    </th>
                    {isTeamType ? (
                      <>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Entrenador
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Cantidad Deportistas
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Categoría
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Edad
                        </th>
                      </>
                    )}
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Acompañantes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item) => {
                    const isSelected = selectedItems.find(
                      (selected) => selected.id === item.id
                    );
                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          isSelected ? "bg-purple-50" : ""
                        }`}
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-primary-purple focus:ring-primary-purple border-gray-300 rounded"
                            checked={!!isSelected}
                            onChange={() => handleItemToggle(item)}
                            disabled={isViewMode}
                          />
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {item.nombre}
                        </td>
                        {isTeamType ? (
                          <>
                            <td className="py-3 px-4 text-gray-600">
                              {item.entrenador}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm font-medium">
                                {item.cantidadDeportistas}
                              </span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800 w-fit">
                                {item.categoria}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {item.edad} años
                            </td>
                          </>
                        )}
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={
                              isSelected ? isSelected.acompanantes || 0 : 0
                            }
                            onChange={(e) =>
                              handleAcompanantesChange(item.id, e.target.value)
                            }
                            disabled={!isSelected || isViewMode}
                            className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-purple focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {paginatedData.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">🔍</div>
                  <p>No se encontraron resultados</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalRows > rowsPerPage && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalRows={totalRows}
                  rowsPerPage={rowsPerPage}
                  startIndex={startIndex}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-600">
              <span>
                {selectedItems.length} {participantType.toLowerCase()} seleccionados
              </span>
              {selectedItems.length > 0 && (
                <span className="font-medium text-primary-purple">
                  Total acompañantes:{" "}
                  {selectedItems.reduce(
                    (total, item) => total + (item.acompanantes || 0),
                    0
                  )}
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {isViewMode ? "Cerrar" : "Cancelar"}
              </button>
              {!isViewMode && (
                <button
                  onClick={handleSave}
                  disabled={selectedItems.length === 0}
                  className="w-full sm:w-auto px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {action === "register" ? "Inscribir" : "Guardar Cambios"}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventInscriptionModal;