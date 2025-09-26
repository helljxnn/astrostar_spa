import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft, FaFilter } from "react-icons/fa";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import Pagination from "../../../../../../../shared/components/Table/Pagination";
import {
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../shared/utils/Alerts";

// Datos quemados para jugadoras
const mockPlayers = [
  {
    id: 1,
    nombre: "Antonella Lascarro Sosa",
    categoria: "Sub 15",
    edad: 17,
    acompanantes: 0,
  },
  {
    id: 2,
    nombre: "Jennifer Lascarro Sosa",
    categoria: "Sub 13",
    edad: 10,
    acompanantes: 0,
  },
  {
    id: 3,
    nombre: "Juliana Ramirez Madrid",
    categoria: "Sub 17",
    edad: 16,
    acompanantes: 0,
  },
  {
    id: 4,
    nombre: "Marta Henao Valencia",
    categoria: "Sub 17",
    edad: 18,
    acompanantes: 0,
  },
  {
    id: 5,
    nombre: "Isabella Rojas Hernandez",
    categoria: "Sub 13",
    edad: 11,
    acompanantes: 0,
  },
  {
    id: 6,
    nombre: "Juana Lopez Ramirez",
    categoria: "Sub 15",
    edad: 14,
    acompanantes: 0,
  },
  {
    id: 7,
    nombre: "Sofia Martinez Perez",
    categoria: "Sub 17",
    edad: 17,
    acompanantes: 0,
  },
  {
    id: 8,
    nombre: "Camila Rodriguez Torres",
    categoria: "Sub 15",
    edad: 15,
    acompanantes: 0,
  },
  {
    id: 9,
    nombre: "Valentina Castro Morales",
    categoria: "Sub 13",
    edad: 12,
    acompanantes: 0,
  },
  {
    id: 10,
    nombre: "Andrea Gonzalez Silva",
    categoria: "Sub 17",
    edad: 16,
    acompanantes: 0,
  },
  {
    id: 11,
    nombre: "Daniela Vargas Lopez",
    categoria: "Sub 15",
    edad: 14,
    acompanantes: 0,
  },
  {
    id: 12,
    nombre: "Natalia Herrera Cruz",
    categoria: "Sub 13",
    edad: 13,
    acompanantes: 0,
  },
];

// Datos quemados para equipos
const mockTeams = [
  {
    id: 1,
    nombre: "Águilas Doradas",
    categoria: "Sub 15",
    edad: "-",
    acompanantes: 0,
  },
  {
    id: 2,
    nombre: "Leones FC",
    categoria: "Sub 17",
    edad: "-",
    acompanantes: 0,
  },
  {
    id: 3,
    nombre: "Tigres Unidos",
    categoria: "Sub 13",
    edad: "-",
    acompanantes: 0,
  },
  {
    id: 4,
    nombre: "Panteras Negras",
    categoria: "Sub 15",
    edad: "-",
    acompanantes: 0,
  },
  {
    id: 5,
    nombre: "Halcones Rojos",
    categoria: "Sub 17",
    edad: "-",
    acompanantes: 0,
  },
  {
    id: 6,
    nombre: "Lobos Grises",
    categoria: "Sub 13",
    edad: "-",
    acompanantes: 0,
  },
];

// Acceso al sistema global de inscripciones (debe coincidir con EventInscriptionModal)
const getGlobalInscriptions = () => {
  if (typeof window !== "undefined" && window.globalInscriptions) {
    return window.globalInscriptions;
  }
  // Inicializar si no existe
  const initial = {
    teams: [
      { id: 1, name: "Águilas Doradas", category: "Sub 15", members: 12 },
      { id: 2, name: "Leones FC", category: "Sub 17", members: 15 },
    ],
    athletes: [
      {
        id: 1,
        name: "María González",
        category: "Sub 15",
        age: 14,
        sport: "Fútbol",
      },
      {
        id: 2,
        name: "Carlos Rodríguez",
        category: "Sub 17",
        age: 16,
        sport: "Baloncesto",
      },
    ],
  };
  if (typeof window !== "undefined") {
    window.globalInscriptions = initial;
  }
  return initial;
};

const EventRegistrationFormModal = ({
  isOpen,
  onClose,
  eventName,
  participantType,
  eventType,
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  if (!isOpen) return null;

  const isPlayerType =
    participantType === "Deportistas" || participantType === "Jugadoras";
  const mockData = isPlayerType ? mockPlayers : mockTeams;

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
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // Categorías únicas para el filtro
  const categories = [...new Set(mockData.map((item) => item.categoria))];

  const handleItemToggle = (item) => {
    setSelectedItems((prev) => {
      const exists = prev.find((selected) => selected.id === item.id);
      if (exists) {
        return prev.filter((selected) => selected.id !== item.id);
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
      console.log("Inscribir participantes:", selectedItems);
      // Aquí iría la lógica para guardar las inscripciones

      // Simular éxito (puedes cambiar esto para simular error)
      const success = Math.random() > 0.1; // 90% de éxito

      if (success) {
        // Actualizar el sistema global de inscripciones
        const globalInscriptions = getGlobalInscriptions();

        // Convertir formato para compatibilidad con EventInscriptionModal
        const convertedItems = selectedItems.map((item) => ({
          id: item.id,
          name: item.nombre,
          category: item.categoria,
          age: item.edad,
          sport: isPlayerType ? "Deporte" : undefined,
          members: !isPlayerType ? 12 : undefined,
        }));

        if (isPlayerType) {
          globalInscriptions.athletes = convertedItems;
        } else {
          globalInscriptions.teams = convertedItems;
        }

        showSuccessAlert(
          `${isPlayerType ? "Jugadoras" : "Equipos"} inscritos`,
          `Se han inscrito ${selectedItems.length} ${
            isPlayerType ? "jugadoras" : "equipos"
          } exitosamente.`
        );
        onClose();
      } else {
        throw new Error("Error simulado en la inscripción");
      }
    } catch (error) {
      console.error("Error al inscribir:", error);
      showErrorAlert(
        "Error al inscribir",
        "No se pudieron inscribir los participantes. Intenta de nuevo."
      );
    }
  };

  const getTitle = () => {
    if (eventType === "Festival" || eventType === "Torneo") {
      return "Inscribir Equipos";
    } else {
      return "Inscribir Jugadoras";
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
              <h2 className="text-2xl font-bold text-center">
                {getTitle()} a {eventType?.toLowerCase()}s
              </h2>
              <p className="text-blue-100 mt-1">Evento: {eventName}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
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
            <div className="flex items-center gap-2">
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

        {/* Table */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 sm:p-6 flex-1 overflow-auto">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
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
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Nombre
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Categoría
                    </th>
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
                          />
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {item.nombre}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-gray-100 px-2 py-1 rounded-full text-sm">
                            {item.categoria}
                          </span>
                        </td>
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
                            disabled={!isSelected}
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
                {selectedItems.length} {isPlayerType ? "jugadoras" : "equipos"}{" "}
                seleccionados
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
                Cerrar
              </button>
              <button
                onClick={handleSave}
                disabled={selectedItems.length === 0}
                className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Inscribir
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventRegistrationFormModal;
