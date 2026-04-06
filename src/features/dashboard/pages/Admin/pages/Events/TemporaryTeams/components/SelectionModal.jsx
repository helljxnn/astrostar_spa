"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserCheck, X, Check } from "lucide-react";
import TeamsService from "../services/TeamsService";
import Pagination from "../../../../../../../../shared/components/Table/Pagination";
import { PAGINATION_CONFIG } from "../../../../../../../../shared/constants/paginationConfig";

const SelectionModal = ({
  isOpen,
  onClose,
  mode = "trainer",
  onSelect,
  selectedItems = [],
  teamType = null,
  forceFoundationType = false,
  excludeTrainerId = null, // ID del entrenador a excluir (para segundo entrenador)
  initialTabType = null, // Tipo inicial para abrir el tab correcto (fundacion o temporal)
  unavailableAthleteIds = [], // IDs de deportistas que ya están en otros equipos
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(
    PAGINATION_CONFIG.DEFAULT_PAGE,
  );
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const rowsPerPage = PAGINATION_CONFIG.ROWS_PER_PAGE;

  const isMultiSelect = mode === "athletes";
  const title =
    mode === "trainer" ? "Seleccionar Entrenador" : "Seleccionar Deportistas";
  const icon =
    mode === "trainer" ? (
      <UserCheck className="w-6 h-6" />
    ) : (
      <Users className="w-6 h-6" />
    );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (mode === "trainer") {
        response = await TeamsService.getTrainers();
      } else {
        response = await TeamsService.getAthletes();
      }
      // FIX CRÍTICO: Asegurar que siempre tengamos un array
      if (response && response.success && Array.isArray(response.data)) {
        setData(response.data);
      } else {
        setData([]);
      }
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  // ✅ CORRECCIÓN: Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadData();
    } else {
      // Limpiar datos cuando se cierra
      setData([]);
      setSearchTerm("");
      setCurrentPage(1);
      setActiveTab(0);
    }
  }, [isOpen, loadData]);

  const currentTeamType = useMemo(() => {
    if (forceFoundationType) return "fundacion";
    if (teamType) return teamType;
    if (selectedItems.length > 0) return selectedItems[0]?.type;
    return null;
  }, [teamType, selectedItems, forceFoundationType]);

  const groupedData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    // Si forceFoundationType está activo, solo mostrar fundación
    if (forceFoundationType) {
      const fundacion = data.filter((item) => item.type === "fundacion");
      return fundacion.length > 0
        ? [
            {
              source: "fundacion",
              sourceLabel:
                mode === "trainer"
                  ? "Entrenadores de la Fundación"
                  : "Deportistas de la Fundación",
              items: fundacion,
            },
          ]
        : [];
    }

    const fundacion = data.filter((item) => item.type === "fundacion");
    const temporal = data.filter((item) => item.type === "temporal");

    const groups = [];

    if (fundacion.length > 0) {
      groups.push({
        source: "fundacion",
        sourceLabel:
          mode === "trainer"
            ? "Entrenadores de la Fundación"
            : "Deportistas de la Fundación",
        items: fundacion,
      });
    }

    if (temporal.length > 0) {
      groups.push({
        source: "temporal",
        sourceLabel:
          mode === "trainer"
            ? "Entrenadores Temporales"
            : "Deportistas Temporales",
        items: temporal,
      });
    }
    return groups;
  }, [data, mode, forceFoundationType]);

  // Establecer el tab inicial basado en el tipo de equipo
  useEffect(() => {
    if (isOpen && initialTabType && groupedData.length > 0) {
      const tabIndex = groupedData.findIndex(
        (g) => g.source === initialTabType,
      );
      if (tabIndex !== -1) {
        setActiveTab(tabIndex);
      }
    }
  }, [isOpen, groupedData, initialTabType, activeTab]);

  // ✅ CORRECTO: Usar solo los datos del tab actual
  const currentGroupData = useMemo(() => {
    const groupData = groupedData[activeTab]?.items || [];
    return groupData;
  }, [groupedData, activeTab]);

  const availableItems = useMemo(() => {
    return currentGroupData;
  }, [currentGroupData]);

  const filteredItems = useMemo(() => {
    let filtered = availableItems;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.identification?.toLowerCase().includes(search) ||
          (mode === "athletes" &&
            item.categoria?.toLowerCase().includes(search)),
      );
    }
    return filtered;
  }, [availableItems, searchTerm, mode]);

  const totalRows = filteredItems.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredItems.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

  const prepareItemData = (item) => {
    if (mode === "athletes" && item.type === "temporal") {
      return {
        ...item,
        categoria: undefined,
      };
    }
    return item;
  };

  const isItemAvailable = (item) => {
    // Si es el entrenador a excluir, no está disponible
    if (excludeTrainerId && item.id === excludeTrainerId) return false;

    // Si ya está seleccionado, está disponible
    if (selectedItems.some((s) => s.id === item.id)) return true;

    // Si hay un tipo de equipo definido desde props, solo permitir ese tipo
    if (currentTeamType && item.type !== currentTeamType) return false;

    // Si no hay selecciones, todo está disponible
    if (selectedItems.length === 0) {
      return true;
    }

    // Si hay elementos seleccionados, solo permitir del mismo tipo
    const firstSelectedType = selectedItems[0].type;
    if (item.type !== firstSelectedType) return false;

    return true;
  };

  const handleSelect = (item) => {
    if (!isItemAvailable(item)) return;

    const preparedItem = prepareItemData(item);

    if (isMultiSelect) {
      const isCurrentlySelected = selectedItems.some(
        (s) => s.id === preparedItem.id,
      );
      let newSelection;

      if (isCurrentlySelected) {
        newSelection = selectedItems.filter(
          (selected) => selected.id !== item.id,
        );
      } else {
        newSelection = [...selectedItems, preparedItem];
      }

      onSelect(newSelection);
    } else {
      // Para selección única (entrenadores)
      const isAlreadySelected = selectedItems.some(
        (s) => s.id === preparedItem.id,
      );

      if (isAlreadySelected) {
        // Si ya está seleccionado, deseleccionar (enviar null)
        onSelect(null);
      } else {
        // Si no está seleccionado, seleccionar
        onSelect(preparedItem);
      }
      onClose();
    }
  };

  const handleConfirm = () => {
    onClose();
  };

  const isSelected = (item) => {
    // Solo mostrar como seleccionado si el item está en selectedItems Y es del mismo tipo
    return selectedItems.some((s) => s.id === item.id && s.type === item.type);
  };

  const handleTabChange = (index) => {
    setActiveTab(index);
    setSearchTerm("");
    setCurrentPage(1);
  };

  if (!isOpen) return null;

  const selectableFilteredItems = filteredItems.filter((item) => {
    const isTemporalUnavailable =
      mode === "athletes" &&
      item.type === "temporal" &&
      unavailableAthleteIds.includes(item.id);
    return isItemAvailable(item) && !isTemporalUnavailable;
  });

  const allFilteredSelected =
    isMultiSelect &&
    selectableFilteredItems.length > 0 &&
    selectableFilteredItems.every((item) =>
      selectedItems.some((selected) => selected.id === item.id),
    );

  const handleToggleSelectAll = () => {
    if (!isMultiSelect || selectableFilteredItems.length === 0) return;

    if (allFilteredSelected) {
      const selectableIds = new Set(selectableFilteredItems.map((item) => item.id));
      onSelect(selectedItems.filter((item) => !selectableIds.has(item.id)));
      return;
    }

    const selectedIds = new Set(selectedItems.map((item) => item.id));
    const itemsToAdd = selectableFilteredItems
      .filter((item) => !selectedIds.has(item.id))
      .map((item) => prepareItemData(item));
    onSelect([...selectedItems, ...itemsToAdd]);
  };

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-primary-purple p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {icon}
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {title}
                  </h2>
                  <p className="text-sm opacity-80">
                    {data.length} elementos cargados • {filteredItems.length}{" "}
                    filtrados
                  </p>
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
          {groupedData && groupedData.length > 1 && (
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex">
                {groupedData.map((group, index) => {
                  // Verificar si este tab debe estar deshabilitado
                  const isTabDisabled =
                    currentTeamType && group.source !== currentTeamType;

                  return (
                    <button
                      key={group.source}
                      onClick={() => !isTabDisabled && handleTabChange(index)}
                      disabled={isTabDisabled}
                      className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                        activeTab === index
                          ? "bg-white text-primary-purple border-b-2 border-primary-purple"
                          : isTabDisabled
                            ? "text-gray-400 cursor-not-allowed bg-gray-100"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      {group.sourceLabel}
                      <span
                        className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                          isTabDisabled
                            ? "bg-gray-300 text-gray-500"
                            : "bg-gray-200"
                        }`}
                      >
                        {group.items ? group.items.length : 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={`Buscar por nombre, identificación${mode === "athletes" ? " o categoría" : ""}...`}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                  />
                </div>
              </div>
              {isMultiSelect && (
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  disabled={selectableFilteredItems.length === 0}
                  className={`w-full md:w-auto px-4 py-3 rounded-lg text-sm font-semibold border transition-colors ${
                    selectableFilteredItems.length === 0
                      ? "border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed"
                      : allFilteredSelected
                        ? "border-primary-purple text-primary-purple bg-purple-50 hover:bg-purple-100"
                        : "border-primary-purple bg-primary-purple text-white hover:opacity-90"
                  }`}
                >
                  {allFilteredSelected
                    ? `Quitar selección (${selectableFilteredItems.length})`
                    : `Seleccionar todas (${selectableFilteredItems.length})`}
                </button>
              )}
            </div>
          </div>

          {/* Contenido - Tabla */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 flex-1 overflow-auto">
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full">
                  <thead className="bg-gray-50">
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
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Teléfono
                      </th>
                      {mode === "athletes" && (
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Categoría
                        </th>
                      )}
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Tipo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData && paginatedData.length > 0 ? (
                      paginatedData.map((item) => {
                        const selected = isSelected(item);
                        const isAvailable = isItemAvailable(item);

                        // Verificar si es deportista temporal no disponible
                        const isTemporalUnavailable =
                          mode === "athletes" &&
                          item.type === "temporal" &&
                          unavailableAthleteIds.includes(item.id);

                        const displayCategory =
                          item.type === "fundacion"
                            ? item.categoria || "Sin categoría"
                            : "No aplica";

                        const getUnavailableReason = () => {
                          if (isTemporalUnavailable) {
                            return "Esta deportista ya está registrada en otro equipo activo";
                          }
                          if (isAvailable) return null;
                          if (
                            currentTeamType &&
                            item.type !== currentTeamType
                          ) {
                            return `No se pueden seleccionar ${mode === "trainer" ? "entrenadores" : "deportistas"} de este tipo`;
                          }
                          return "No disponible";
                        };

                        return (
                          <tr
                            key={item.id}
                            className={`border-b border-gray-100 transition-colors relative group ${
                              selected && isTemporalUnavailable
                                ? "bg-rose-50 cursor-pointer"
                              : selected
                                  ? "bg-purple-50/70 cursor-pointer"
                                  : isTemporalUnavailable
                                    ? "bg-rose-50/50 cursor-not-allowed opacity-80 hover:bg-rose-50"
                                    : !isAvailable
                                      ? "bg-gray-100 cursor-not-allowed opacity-60 hover:bg-gray-200"
                                      : "hover:bg-gray-50 cursor-pointer"
                            }`}
                            onClick={(e) => {
                              // Si está seleccionada y es temporal no disponible, permitir deseleccionar
                              if (isTemporalUnavailable && selected) {
                                handleSelect(item);
                                return;
                              }

                              // Si no está disponible y no está seleccionada, bloquear
                              if (!isAvailable || isTemporalUnavailable) {
                                e.preventDefault();
                                e.stopPropagation();
                                return false;
                              }

                              handleSelect(item);
                            }}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                {isMultiSelect ? (
                                  <button
                                    type="button"
                                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                                      selected
                                        ? "bg-primary-purple border-primary-purple"
                                        : !isAvailable &&
                                            !(isTemporalUnavailable && selected)
                                          ? "border-gray-300 bg-gray-100"
                                          : "border-gray-300 bg-white hover:border-primary-purple"
                                    }`}
                                    disabled={!isAvailable && !(isTemporalUnavailable && selected)}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Permitir deseleccionar si está seleccionada y es temporal no disponible
                                      if (isTemporalUnavailable && selected) {
                                        handleSelect(item);
                                      } else if (
                                        isAvailable &&
                                        !isTemporalUnavailable
                                      ) {
                                        handleSelect(item);
                                      }
                                    }}
                                  >
                                    {selected && <Check className="w-3.5 h-3.5 text-white" />}
                                  </button>
                                ) : (
                                  <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                      selected
                                        ? "bg-primary-purple border-primary-purple"
                                        : !isAvailable
                                          ? "border-gray-300 bg-gray-100"
                                          : "border-gray-300 hover:border-primary-purple"
                                    }`}
                                  >
                                    {selected && (
                                      <Check className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 relative">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-medium ${!isAvailable ? "text-gray-400" : "text-gray-900"}`}
                                  title={
                                    !isAvailable || isTemporalUnavailable
                                      ? getUnavailableReason()
                                      : ""
                                  }
                                >
                                  {item.name}
                                </span>
                                {isTemporalUnavailable && (
                                  <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded">
                                    Ya asignada
                                  </span>
                                )}
                              </div>
                            </td>
                            <td
                              className={`py-3 px-4 text-sm ${!isAvailable ? "text-gray-400" : "text-gray-600"}`}
                            >
                              {item.identification || "N/A"}
                            </td>
                            <td
                              className={`py-3 px-4 text-sm ${!isAvailable ? "text-gray-400" : "text-gray-600"}`}
                            >
                              {item.phoneNumber || "N/A"}
                            </td>
                            {mode === "athletes" && (
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    !isAvailable
                                      ? "bg-gray-50 text-gray-300"
                                      : item.type === "fundacion" &&
                                          item.categoria
                                        ? "bg-gray-200 text-gray-700"
                                        : "bg-gray-100 text-gray-400"
                                  }`}
                                >
                                  {displayCategory}
                                </span>
                              </td>
                            )}
                            <td className="py-3 px-4">
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  item.type === "fundacion"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                                } ${!isAvailable ? "opacity-50" : ""}`}
                              >
                                {item.type === "fundacion"
                                  ? "Fundación"
                                  : "Temporal"}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={mode === "athletes" ? "6" : "5"}
                          className="py-12 text-center text-gray-500"
                        >
                          <div className="text-4xl mb-4">🔍</div>
                          <p>
                            {searchTerm
                              ? "No se encontraron resultados con los filtros aplicados"
                              : "No hay elementos disponibles"}
                          </p>
                          {searchTerm && (
                            <button
                              onClick={() => {
                                setSearchTerm("");
                              }}
                              className="mt-2 text-primary-purple hover:underline"
                            >
                              Limpiar filtros
                            </button>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {!loading && totalRows > rowsPerPage && (
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
                {selectedItems.length}{" "}
                {mode === "trainer" ? "entrenador" : "deportistas"} seleccionado
                {selectedItems.length !== 1 ? "s" : ""}
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
                    className="px-5 py-2 bg-primary-blue text-white rounded-lg hover:opacity-90 transition"
                  >
                    Confirmar Selección
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default SelectionModal;
