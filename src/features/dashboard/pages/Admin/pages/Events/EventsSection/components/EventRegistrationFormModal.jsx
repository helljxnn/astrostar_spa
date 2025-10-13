import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft, FaFilter, FaUsers, FaUserTie } from "react-icons/fa";
import SearchInput from "../../../../../../../../shared/components/SearchInput";
import Pagination from "../../../../../../../../shared/components/Table/Pagination";
import athletesData from "../../../../../../../../shared/models/AthleteData";
import temporaryWorkersData from "../../../../../../../../shared/models/TemporaryWorkersData";
import {
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../../shared/utils/alerts";


// Datos quemados para equipos
const mockTeams = [
  {
    id: 1,
    nombre: "Águilas Doradas",
    categoria: "Sub 15",
    entrenador: "Carlos Rodríguez",
    cantidadDeportistas: 18,
    acompanantes: 0,
  },
  {
    id: 2,
    nombre: "Leones FC",
    categoria: "Sub 17",
    entrenador: "Ana María López",
    cantidadDeportistas: 22,
    acompanantes: 0,
  },
  {
    id: 3,
    nombre: "Tigres Unidos",
    categoria: "Sub 13",
    entrenador: "Miguel Hernández",
    cantidadDeportistas: 16,
    acompanantes: 0,
  },
  {
    id: 4,
    nombre: "Panteras Negras",
    categoria: "Sub 15",
    entrenador: "Laura Martínez",
    cantidadDeportistas: 20,
    acompanantes: 0,
  },
  {
    id: 5,
    nombre: "Halcones Rojos",
    categoria: "Sub 17",
    entrenador: "Roberto Silva",
    cantidadDeportistas: 19,
    acompanantes: 0,
  },
  {
    id: 6,
    nombre: "Lobos Grises",
    categoria: "Sub 13",
    entrenador: "Patricia González",
    cantidadDeportistas: 15,
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
  const [selectedSection, setSelectedSection] = useState("deportistas"); // "deportistas" o "temporales"
  const [selectedTemporalType, setSelectedTemporalType] = useState(""); // Para filtrar personas temporales
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  if (!isOpen) return null;

  const isPlayerType =
    participantType === "Deportistas" || participantType === "Jugadoras";
  const isTeamType = participantType === "Equipos";

  // Preparar datos de deportistas
  const formattedAthletes = athletesData.map((athlete) => ({
    id: athlete.id,
    nombre: `${athlete.nombres} ${athlete.apellidos}`,
    categoria: athlete.categoria,
    edad:
      new Date().getFullYear() -
      new Date(athlete.fechaNacimiento).getFullYear(),
    tipo: "Deportista",
    acompanantes: 0,
  }));

  // Preparar datos de personas temporales
  const formattedTemporaryWorkers = temporaryWorkersData.map((worker) => ({
    id: `temp_${worker.id}`,
    nombre: worker.nombre,
    categoria: worker.categoria,
    edad: worker.edad,
    tipo: worker.tipoPersona,
    tipoPersona: worker.tipoPersona, // Mantener ambos para compatibilidad
    acompanantes: 0,
  }));

  // Debug: verificar datos de personas temporales
  console.log("Datos de personas temporales:", formattedTemporaryWorkers);

  // Determinar qué datos usar según el tipo de participante y sección seleccionada
  const getCurrentData = () => {
    if (isTeamType) {
      // Si es tipo Equipos, usar solo los datos de equipos
      return mockTeams;
    } else if (selectedSection === "deportistas") {
      return formattedAthletes;
    } else {
      return formattedTemporaryWorkers;
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
          item.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.tipo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoría (para deportistas y equipos)
    if (selectedCategory && (selectedSection === "deportistas" || isTeamType)) {
      filtered = filtered.filter((item) => item.categoria === selectedCategory);
    }

    // Filtro por tipo de persona temporal
    if (selectedTemporalType && selectedSection === "temporales") {
      filtered = filtered.filter((item) => item.tipo === selectedTemporalType);
    }

    return filtered;
  }, [
    mockData,
    searchTerm,
    selectedCategory,
    selectedTemporalType,
    selectedSection,
  ]);

  // Paginación
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // Categorías únicas para el filtro
  const categories = isTeamType
    ? [...new Set(mockTeams.map((item) => item.categoria))]
    : [...new Set(formattedAthletes.map((item) => item.categoria))];

  // Tipos de personas temporales
  const temporalTypes = [
    ...new Set(formattedTemporaryWorkers.map((item) => item.tipo)),
  ];

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
      console.log("Inscribir Equipos:", selectedItems);
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
          `${
            getSectionTitle().charAt(0).toUpperCase() +
            getSectionTitle().slice(1)
          } inscritos`,
          `Se han inscrito ${
            selectedItems.length
          } ${getSectionTitle()} exitosamente.`
        );
        onClose();
      } else {
        throw new Error("Error simulado en la inscripción");
      }
    } catch (error) {
      console.error("Error al inscribir:", error);
      showErrorAlert(
        "Error al inscribir",
        "No se pudieron inscribir los Equipos. Intenta de nuevo."
      );
    }
  };

  const getTitle = () => {
    if (eventType === "Festival" || eventType === "Torneo") {
      return "Inscribir Equipos";
    } else {
      return "Inscribir Deportistas";
    }
  };

  const getSectionTitle = () => {
    if (isTeamType) return "equipos";
    return selectedSection === "deportistas"
      ? "deportistas"
      : "personas temporales";
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
              <h2 className="text-2xl font-bold text-center">{getTitle()}</h2>
              <p className="text-blue-100 mt-1">Evento: {eventName}</p>
            </div>
          </div>
        </div>

        {/* Section Tabs - Solo mostrar si no es tipo Equipos */}
        {!isTeamType && (
          <div className="border-b border-gray-200 bg-white">
            <div className="flex">
              <button
                onClick={() => {
                  setSelectedSection("deportistas");
                  setCurrentPage(1);
                  setSearchTerm("");
                  setSelectedCategory("");
                  setSelectedTemporalType("");
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
                  setSelectedTemporalType("");
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

            {/* Filters based on section */}
            <div className="flex items-center gap-4">
              <FaFilter className="text-gray-500" />

              {isTeamType ? (
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
              ) : selectedSection === "deportistas" ? (
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
              ) : (
                <select
                  value={selectedTemporalType}
                  onChange={(e) => {
                    setSelectedTemporalType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                >
                  <option value="">Todos los tipos</option>
                  {temporalTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              )}
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
                    {isTeamType ? (
                      <>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Entrenador
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Cantidad Deportistas
                        </th>
                      </>
                    ) : selectedSection === "deportistas" ? (
                      <>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Categoría
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Edad
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Tipo
                        </th>
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
                        ) : selectedSection === "deportistas" ? (
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
                        ) : (
                          <>
                            {/* Columna Tipo */}
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-sm w-fit ${
                                  (item.tipoPersona || item.tipo) === "Deportista"
                                    ? "bg-green-100 text-green-800"
                                    : (item.tipoPersona || item.tipo) === "Entrenador"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-orange-100 text-orange-800"
                                }`}
                              >
                                {item.tipoPersona || item.tipo}
                              </span>
                            </td>
                            {/* Columna Categoría */}
                            <td className="py-3 px-4">
                              {item.categoria && item.categoria !== "No aplica" ? (
                                <span className="px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800 w-fit">
                                  {item.categoria}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-sm">No aplica</span>
                              )}
                            </td>
                            {/* Columna Edad */}
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
                {selectedItems.length} {getSectionTitle()} seleccionados
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
