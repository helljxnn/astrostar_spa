import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft, FaFilter } from "react-icons/fa";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import Pagination from "../../../../../../../shared/components/Table/Pagination";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../../../../../../../shared/utils/Alerts";

// Datos quemados para deportistas de inglés
const mockEnglishPlayers = [
  {
    id: 1,
    nombre: "Antonella Lascarro Sosa",
    categoria: "Sub 15",
    edad: 17,
  },
  {
    id: 2,
    nombre: "Jennifer Lascarro Sosa",
    categoria: "Sub 13",
    edad: 10,
  },
  {
    id: 3,
    nombre: "Juliana Ramirez Madrid",
    categoria: "Sub 17",
    edad: 16,
  },
  {
    id: 4,
    nombre: "Marta Henao Valencia",
    categoria: "Sub 17",
    edad: 18,
  },
  {
    id: 5,
    nombre: "Isabella Rojas Hernandez",
    categoria: "Sub 13",
    edad: 11,
  },
  {
    id: 6,
    nombre: "Juana Lopez Ramirez",
    categoria: "Sub 15",
    edad: 14,
  },
  {
    id: 7,
    nombre: "Sofia Martinez Perez",
    categoria: "Sub 17",
    edad: 17,
  },
  {
    id: 8,
    nombre: "Camila Rodriguez Torres",
    categoria: "Sub 15",
    edad: 15,
  },
  {
    id: 9,
    nombre: "Valentina Castro Morales",
    categoria: "Sub 13",
    edad: 12,
  },
  {
    id: 10,
    nombre: "Andrea Gonzalez Silva",
    categoria: "Sub 17",
    edad: 16,
  },
  {
    id: 11,
    nombre: "Daniela Vargas Lopez",
    categoria: "Sub 15",
    edad: 14,
  },
  {
    id: 12,
    nombre: "Natalia Herrera Cruz",
    categoria: "Sub 13",
    edad: 13,
  },
];

// Sistema global de inscripciones para inglés
const getGlobalEnglishInscriptions = () => {
  if (typeof window !== "undefined" && window.globalEnglishInscriptions) {
    return window.globalEnglishInscriptions;
  }
  // Inicializar si no existe
  const initial = {
    athletes: [
      {
        id: 1,
        name: "María González",
        category: "Sub 15",
        age: 14,
      },
      {
        id: 2,
        name: "Carlos Rodríguez",
        category: "Sub 17",
        age: 16,
      },
    ],
  };
  if (typeof window !== "undefined") {
    window.globalEnglishInscriptions = initial;
  }
  return initial;
};

const EnglishRegistrationFormModal = ({
  isOpen,
  onClose,
  action,
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectAllPages, setSelectAllPages] = useState(false);
  const rowsPerPage = 5;

  if (!isOpen) return null;

  // Cargar deportistas ya inscritas cuando se abre en modo editar
  React.useEffect(() => {
    if (isOpen && action === "edit") {
      const globalInscriptions = getGlobalEnglishInscriptions();
      if (globalInscriptions.athletes && globalInscriptions.athletes.length > 0) {
        // Convertir de formato global a formato local
        const convertedItems = globalInscriptions.athletes.map((athlete) => ({
          id: athlete.id,
          nombre: athlete.name,
          categoria: athlete.category,
          edad: athlete.age,
        }));
        setSelectedItems(convertedItems);
      }
    } else if (isOpen && action === "register") {
      // Limpiar selección para inscribir
      setSelectedItems([]);
    }
  }, [isOpen, action]);

  // Filtrar datos
  const filteredData = useMemo(() => {
    let filtered = mockEnglishPlayers;

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
  }, [searchTerm, selectedCategory]);

  // Paginación
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // Categorías únicas para el filtro
  const categories = [...new Set(mockEnglishPlayers.map((item) => item.categoria))];

  const handleItemToggle = (item) => {
    setSelectedItems((prev) => {
      const exists = prev.find((selected) => selected.id === item.id);
      if (exists) {
        const newSelected = prev.filter((selected) => selected.id !== item.id);
        // Si deseleccionamos un item, desactivar selectAllPages
        setSelectAllPages(false);
        return newSelected;
      } else {
        return [...prev, item];
      }
    });
  };

  const handleSelectAllToggle = (checked) => {
    if (checked) {
      // Seleccionar todos los elementos filtrados (todas las páginas)
      setSelectedItems([...filteredData]);
      setSelectAllPages(true);
    } else {
      // Deseleccionar todos
      setSelectedItems([]);
      setSelectAllPages(false);
    }
  };

  // Verificar si todos los elementos están seleccionados
  const isAllSelected = filteredData.length > 0 && selectedItems.length === filteredData.length;
  const isPartiallySelected = selectedItems.length > 0 && selectedItems.length < filteredData.length;

  const handleSave = async () => {
    try {
      // Confirmación para editar
      if (action === "edit") {
        const result = await showConfirmAlert(
          "¿Estás seguro de actualizar las deportistas inscritas?",
          "Los cambios se guardarán y no se podrán deshacer fácilmente."
        );
        if (!result.isConfirmed) return;
      }

      console.log(`${action === "edit" ? "Editar" : "Inscribir"} deportistas en inglés:`, selectedItems);

      // Simular éxito
      const success = Math.random() > 0.1; // 90% de éxito

      if (success) {
        // Actualizar el sistema global de inscripciones
        const globalInscriptions = getGlobalEnglishInscriptions();

        // Convertir formato para compatibilidad
        const convertedItems = selectedItems.map((item) => ({
          id: item.id,
          name: item.nombre,
          category: item.categoria,
          age: item.edad,
        }));

        globalInscriptions.athletes = convertedItems;

        const actionText = action === "edit" ? "actualizadas" : "inscritas";
        const actionVerb = action === "edit" ? "actualizado" : "inscrito";

        showSuccessAlert(
          `Deportistas ${actionText} en inglés`,
          `Se han ${actionVerb} ${selectedItems.length} deportistas exitosamente.`
        );
        onClose();
      } else {
        throw new Error("Error simulado en la operación");
      }
    } catch (error) {
      console.error(`Error al ${action === "edit" ? "editar" : "inscribir"}:`, error);
      const actionText = action === "edit" ? "actualizar" : "inscribir";
      showErrorAlert(
        `Error al ${actionText}`,
        `No se pudieron ${actionText} las deportistas. Intenta de nuevo.`
      );
    }
  };

  const getTitle = () => {
    switch (action) {
      case "register":
        return "Inscribir Deportistas";
      case "edit":
        return "Editar Inscritas";
      case "view":
        return "Ver Inscritas";
      default:
        return "Gestión de Inglés";
    }
  };

  const getDescription = () => {
    switch (action) {
      case "register":
        return "Selecciona las deportistas para inscribir en inglés";
      case "edit":
        return "Edita las deportistas inscritas en inglés";
      case "view":
        return "Visualiza las deportistas inscritas en inglés";
      default:
        return "Gestión de deportistas en inglés";
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
        <div className="bg-primary-green p-6 text-black">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold">{getTitle()}</h2>
              <p className="text-gray-700 mt-1">{getDescription()}</p>
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
                placeholder="Buscar deportista..."
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
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
                    {(action === "register" || action === "edit") && (
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary-green focus:ring-primary-green border-gray-300 rounded"
                          onChange={(e) => handleSelectAllToggle(e.target.checked)}
                          checked={isAllSelected}
                          ref={(input) => {
                            if (input) input.indeterminate = isPartiallySelected;
                          }}
                        />
                      </th>
                    )}
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Nombre
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Categoría
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Edad
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
                          isSelected ? "bg-green-50" : ""
                        }`}
                      >
                        {(action === "register" || action === "edit") && (
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-primary-green focus:ring-primary-green border-gray-300 rounded"
                              checked={!!isSelected}
                              onChange={() => handleItemToggle(item)}
                            />
                          </td>
                        )}
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {item.nombre}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-gray-100 px-2 py-1 rounded-full text-sm">
                            {item.categoria}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{item.edad}</td>
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
              {(action === "register" || action === "edit") && (
                <span>
                  {selectedItems.length} deportistas seleccionadas
                </span>
              )}
              {action === "view" && (
                <span>
                  Mostrando {paginatedData.length} de {totalRows} deportistas
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
              {(action === "register" || action === "edit") && (
                <button
                  onClick={handleSave}
                  disabled={selectedItems.length === 0}
                  className="w-full sm:w-auto px-6 py-2 bg-primary-green text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {action === "edit" ? "Actualizar" : "Inscribir"}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EnglishRegistrationFormModal;