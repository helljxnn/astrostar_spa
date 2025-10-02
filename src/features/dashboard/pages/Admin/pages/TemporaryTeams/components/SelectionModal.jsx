import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, UserCheck, X, Check, Filter, AlertCircle } from "lucide-react";
import { loadTrainers, loadPlayers, groupBySource, searchInData } from "../../../../../../../shared/models/Dataloaders";
import Pagination from "../../../../../../../shared/components/Table/Pagination";

/**
 * Modal reutilizable para seleccionar entrenadores o jugadoras con diseño de tabla
 */
const SelectionModal = ({ 
  isOpen, 
  onClose, 
  mode = "trainer",
  onSelect, 
  selectedItems = [] 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [validationError, setValidationError] = useState("");
  const rowsPerPage = 5;

  const isMultiSelect = mode === "players";
  const title = mode === "trainer" ? "Seleccionar Entrenador" : "Seleccionar Jugadoras";
  const icon = mode === "trainer" ? <UserCheck className="w-6 h-6" /> : <Users className="w-6 h-6" />;

  // Cargar datos según el modo
  const allData = mode === "trainer" ? loadTrainers() : loadPlayers();
  
  // Agrupar por fuente
  const groupedData = useMemo(() => groupBySource(allData), [allData]);

  // Datos del tab activo
  const currentGroupData = groupedData[activeTab]?.items || [];

  // Filtrar por búsqueda y categoría
  const filteredItems = useMemo(() => {
    let filtered = searchInData(currentGroupData, searchTerm);
    
    // Filtro adicional por categoría para jugadoras
    if (mode === "players" && selectedCategory) {
      filtered = filtered.filter(item => 
        item.categoria?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }
    
    return filtered;
  }, [currentGroupData, searchTerm, selectedCategory, mode]);

  // Paginación
  const totalRows = filteredItems.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredItems.slice(startIndex, startIndex + rowsPerPage);

  // Categorías únicas para jugadoras (de los datos reales)
  const categories = useMemo(() => {
    if (mode !== "players") return [];
    const allCategories = [...new Set(allData.map(item => item.categoria).filter(Boolean))];
    return allCategories.sort();
  }, [mode, allData]);

  // Validar tipos mixtos
  const validateMixedTypes = (newSelection, item) => {
    if (newSelection.length === 0) return true;
    
    const firstItemType = newSelection[0].type;
    const newItemType = item.type;
    
    if (firstItemType !== newItemType) {
      const type1 = firstItemType === "fundacion" ? "Fundación" : "Temporales";
      const type2 = newItemType === "fundacion" ? "Fundación" : "Temporales";
      setValidationError(`No puedes mezclar ${type1} con ${type2}. El equipo debe ser conformado únicamente por ${type1} o ${type2}.`);
      return false;
    }
    
    setValidationError("");
    return true;
  };

  // Manejar selección
  const handleSelect = (item) => {
    if (isMultiSelect) {
      const isSelected = selectedItems.some(s => s.id === item.id);
      let newSelection;
      
      if (isSelected) {
        newSelection = selectedItems.filter(s => s.id !== item.id);
      } else {
        newSelection = [...selectedItems, item];
        
        // Validar tipos mixtos
        if (!validateMixedTypes(newSelection, item)) {
          return;
        }
      }
      
      onSelect(newSelection);
    } else {
      // Para entrenadores, validar que no se mezclen tipos
      if (selectedItems.length > 0 && selectedItems[0].type !== item.type) {
        const currentType = selectedItems[0].type === "fundacion" ? "Fundación" : "Temporal";
        const newType = item.type === "fundacion" ? "Fundación" : "Temporal";
        setValidationError(`No puedes cambiar de ${currentType} a ${newType}. El entrenador debe ser del mismo tipo que las jugadoras.`);
        return;
      }
      
      onSelect(item);
      onClose();
    }
  };

  // Confirmar selección múltiple
  const handleConfirm = () => {
    if (validationError) return;
    onClose();
  };

  // Verificar si un item está seleccionado
  const isSelected = (item) => selectedItems.some(s => s.id === item.id);

  // Limpiar filtros al cambiar tab
  const handleTabChange = (index) => {
    setActiveTab(index);
    setSearchTerm("");
    setSelectedCategory("");
    setCurrentPage(1);
    setValidationError("");
  };

  // Obtener el tipo actual del equipo (si hay selección)
  const getCurrentTeamType = () => {
    if (selectedItems.length === 0) return null;
    return selectedItems[0].type === "fundacion" ? "Fundación" : "Temporales";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-purple to-primary-blue p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {icon}
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">{title}</h2>
                  {isMultiSelect && (
                    <div className="text-blue-100 mt-1 text-sm sm:text-base">
                      <p>{selectedItems.length} seleccionada{selectedItems.length !== 1 ? "s" : ""}</p>
                      {getCurrentTeamType() && (
                        <p className="text-blue-200">Tipo: {getCurrentTeamType()}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Alerta de validación */}
          {validationError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{validationError}</p>
            </motion.div>
          )}

          {/* Tabs de fuentes */}
          {groupedData.length > 1 && (
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex">
                {groupedData.map((group, index) => (
                  <button
                    key={group.source}
                    onClick={() => handleTabChange(index)}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                      activeTab === index
                        ? "bg-white text-primary-purple border-b-2 border-primary-purple"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    {group.sourceLabel}
                    <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                      {group.items.length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Búsqueda */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={`Buscar por nombre, identificación${mode === 'players' ? ' o categoría' : ''}...`}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filtro de categoría (solo para jugadoras) */}
              {mode === "players" && categories.length > 0 && (
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Contenido - Tabla */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 flex-1 overflow-auto">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Seleccionar
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Nombre
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Identificación
                      </th>
                      {mode === "players" && (
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Categoría
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item) => {
                      const selected = isSelected(item);
                      const isDisabled = selectedItems.length > 0 && 
                                        selectedItems[0].type !== item.type && 
                                        !selected;
                      
                      return (
                        <tr
                          key={item.id}
                          className={`border-b border-gray-100 transition-colors ${
                            selected 
                              ? "bg-purple-50 cursor-pointer" 
                              : isDisabled
                                ? "bg-gray-50 cursor-not-allowed opacity-50"
                                : "hover:bg-gray-50 cursor-pointer"
                          }`}
                          onClick={() => !isDisabled && handleSelect(item)}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              {isMultiSelect ? (
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-primary-purple focus:ring-primary-purple border-gray-300 rounded"
                                  checked={selected}
                                  disabled={isDisabled}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    if (!isDisabled) handleSelect(item);
                                  }}
                                />
                              ) : (
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  selected 
                                    ? "bg-primary-purple border-primary-purple" 
                                    : isDisabled
                                      ? "border-gray-300 bg-gray-100"
                                      : "border-gray-300"
                                }`}>
                                  {selected && <Check className="w-3 h-3 text-white" />}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-gray-900">{item.name}</span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {item.identification || "N/A"}
                          </td>
                          {mode === "players" && (
                            <td className="py-3 px-4">
                              <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                                {item.categoria || "Sin categoría"}
                              </span>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {paginatedData.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">🔍</div>
                    <p>No se encontraron resultados</p>
                    {(searchTerm || selectedCategory) && (
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCategory("");
                        }}
                        className="mt-2 text-primary-purple hover:underline"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Paginación */}
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
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-gray-600">
                {selectedItems.length} {mode === "trainer" ? "entrenador" : "jugadoras"} seleccionado{selectedItems.length !== 1 ? "s" : ""}
                {getCurrentTeamType() && (
                  <span className="ml-2 text-primary-purple font-semibold">
                    • Tipo: {getCurrentTeamType()}
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                {isMultiSelect && (
                  <button
                    onClick={handleConfirm}
                    disabled={selectedItems.length === 0 || !!validationError}
                    className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirmar Selección
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SelectionModal;