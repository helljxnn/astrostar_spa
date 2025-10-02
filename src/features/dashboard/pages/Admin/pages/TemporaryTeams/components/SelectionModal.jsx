import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, UserCheck, X, Check } from "lucide-react";
import { loadTrainers, loadPlayers, groupBySource, searchInData } from "../../../../../../../shared/models/Dataloaders";

/**
 * Modal reutilizable para seleccionar entrenadores o jugadoras desde múltiples fuentes
 * 
 * @param {boolean} isOpen - Controla si el modal está visible
 * @param {function} onClose - Callback para cerrar el modal
 * @param {string} mode - "trainer" (selección única) o "players" (selección múltiple)
 * @param {function} onSelect - Callback que recibe la selección (item único o array)
 * @param {array} selectedItems - Items ya seleccionados (para modo "players")
 */
const SelectionModal = ({ 
  isOpen, 
  onClose, 
  mode = "trainer", // "trainer" | "players"
  onSelect, 
  selectedItems = [] 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const isMultiSelect = mode === "players";
  const title = mode === "trainer" ? "Seleccionar Entrenador" : "Seleccionar Jugadoras";
  const icon = mode === "trainer" ? <UserCheck className="w-6 h-6" /> : <Users className="w-6 h-6" />;

  // Cargar datos según el modo
  const allData = mode === "trainer" ? loadTrainers() : loadPlayers();
  
  // Agrupar por fuente
  const groupedData = useMemo(() => groupBySource(allData), [allData]);

  // Datos del tab activo
  const currentGroupData = groupedData[activeTab]?.items || [];

  // Filtrar por búsqueda
  const filteredItems = useMemo(
    () => searchInData(currentGroupData, searchTerm),
    [currentGroupData, searchTerm]
  );

  // Manejar selección
  const handleSelect = (item) => {
    if (isMultiSelect) {
      const isSelected = selectedItems.some(s => s.id === item.id);
      const newSelection = isSelected
        ? selectedItems.filter(s => s.id !== item.id)
        : [...selectedItems, item];
      onSelect(newSelection);
    } else {
      onSelect(item);
      onClose();
    }
  };

  // Confirmar selección múltiple
  const handleConfirm = () => {
    onClose();
  };

  // Verificar si un item está seleccionado
  const isSelected = (item) => selectedItems.some(s => s.id === item.id);

  // Limpiar búsqueda al cambiar tab
  const handleTabChange = (index) => {
    setActiveTab(index);
    setSearchTerm("");
  };

  if (!isOpen) return null;

  const isViewMode = false; // Nunca es modo solo vista

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-purple to-primary-blue p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {icon}
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">{title}</h2>
                  {isMultiSelect && (
                    <p className="text-blue-100 mt-1 text-sm sm:text-base">
                      {selectedItems.length} seleccionada{selectedItems.length !== 1 ? "s" : ""}
                    </p>
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

          {/* Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre, identificación o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 max-h-[50vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredItems.map((item) => {
                const selected = isSelected(item);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border-2 rounded-xl transition-all cursor-pointer ${
                      selected
                        ? "border-primary-purple bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleSelect(item)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-gradient-to-r from-primary-purple to-primary-blue text-white">
                        {mode === "trainer" ? <UserCheck className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                          {item.identification && (
                            <span className="text-xs">{item.identification}</span>
                          )}
                        </div>
                        {item.categoria && (
                          <div className="text-xs text-gray-600 mt-1">{item.categoria}</div>
                        )}
                        {item.additionalInfo && (
                          <div className="text-xs text-gray-500 mt-1">{item.additionalInfo}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {selected && (
                          <div className="w-6 h-6 bg-primary-purple text-white rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🔍</div>
                <p>No se encontraron resultados</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-gray-600">
                {selectedItems.length} {mode === "trainer" ? "entrenador" : "jugadoras"} seleccionado{selectedItems.length !== 1 ? "s" : ""}
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
                    disabled={selectedItems.length === 0}
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