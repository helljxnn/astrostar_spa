"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, UserCheck, X, Check, Filter, Info } from "lucide-react"
import {
  loadTrainers,
  loadAthletes,
  groupBySource,
  searchInData,
} from "../../../../../../../../shared/models/Dataloaders"
import Pagination from "../../../../../../../../shared/components/Table/Pagination"

const SelectionModal = ({
  isOpen,
  onClose,
  mode = "trainer",
  onSelect,
  selectedItems = [],
  currentCategoria = null,
  existingTeamType = null,
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState("")
  const rowsPerPage = 5

  const isMultiSelect = mode === "athletes"
  const title = mode === "trainer" ? "Seleccionar Entrenador" : "Seleccionar Deportistas"
  const icon = mode === "trainer" ? <UserCheck className="w-6 h-6" /> : <Users className="w-6 h-6" />

  const currentTeamType = useMemo(() => {
    if (existingTeamType) return existingTeamType
    if (selectedItems.length > 0) return selectedItems[0]?.type
    return null
  }, [existingTeamType, selectedItems])

  const allData = useMemo(() => {
    try {
      return mode === "trainer" ? loadTrainers() : loadAthletes() 
    } catch (error) {
      console.error("Error cargando datos:", error)
      return []
    }
  }, [mode])

  const groupedData = useMemo(() => {
    if (!allData || allData.length === 0) return []
    return groupBySource(allData)
  }, [allData])

  const currentGroupData = useMemo(() => {
    if (!groupedData || groupedData.length === 0) return []
    return groupedData[activeTab]?.items || []
  }, [groupedData, activeTab])

  const categories = useMemo(() => {
    if (mode !== "athletes") return []
    if (!currentGroupData || currentGroupData.length === 0) return []
    
    const currentSource = groupedData[activeTab]?.source
    if (currentSource !== "fundacion") return []
    
    const foundationAthletes = currentGroupData.filter(item => item.type === "fundacion")
    const allCategories = [...new Set(foundationAthletes.map((item) => item.categoria).filter(Boolean))]
    return allCategories.sort()
  }, [mode, currentGroupData, groupedData, activeTab])

  const availableItems = useMemo(() => {
    let filtered = currentGroupData

    if (currentTeamType) {
      filtered = filtered.filter(item => item.type === currentTeamType)
    }

    if (currentTeamType === "fundacion" && currentCategoria) {
      filtered = filtered.filter(item => {
        if (item.type === "temporal") return false
        return item.categoria === currentCategoria
      })
    }

    return filtered
  }, [currentGroupData, currentTeamType, currentCategoria])

  const filteredItems = useMemo(() => {
    let filtered = searchInData(availableItems, searchTerm)

    if (mode === "athletes" && selectedCategory) {
      filtered = filtered.filter((item) => {
        if (item.type === "temporal") return true
        return item.categoria === selectedCategory
      })
    }

    return filtered
  }, [availableItems, searchTerm, selectedCategory, mode])

  const totalRows = filteredItems.length
  const totalPages = Math.ceil(totalRows / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedData = filteredItems.slice(startIndex, startIndex + rowsPerPage)

  const prepareItemData = (item) => {
    if (mode === "athletes" && item.type === "temporal") {
      return {
        ...item,
        categoria: undefined
      }
    }
    return item
  }

  const isItemAvailable = (item) => {
    if (selectedItems.length === 0 && !currentTeamType) return true
    if (selectedItems.some(s => s.id === item.id)) return true
    if (selectedItems.length > 0) {
      const firstSelectedType = selectedItems[0].type
      if (item.type !== firstSelectedType) return false
    }
    if (currentTeamType && item.type !== currentTeamType) return false
    if (mode === "athletes" && item.type === "fundacion" && currentCategoria && item.categoria) {
      return item.categoria === currentCategoria
    }
    return true
  }

  const handleSelect = (item) => {
    if (!isItemAvailable(item)) return

    const preparedItem = prepareItemData(item)

    if (isMultiSelect) {
      const isSelected = selectedItems.some((s) => s.id === preparedItem.id)
      let newSelection

      if (isSelected) {
        newSelection = selectedItems.filter((s) => s.id !== preparedItem.id)
      } else {
        newSelection = [...selectedItems, preparedItem]
      }

      onSelect(newSelection)
    } else {
      onSelect(preparedItem)
      onClose()
    }
  }

  const handleConfirm = () => {
    onClose()
  }

  const isSelected = (item) => selectedItems.some((s) => s.id === item.id)

  const handleTabChange = (index) => {
    setActiveTab(index)
    setSearchTerm("")
    setSelectedCategory("")
    setCurrentPage(1)
  }

  const getCurrentTeamInfo = () => {
    if (!currentTeamType) return { type: null, category: null }
    
    const type = currentTeamType === "fundacion" ? "Fundación" : "Temporales"
    const category = currentCategoria || null
    return { type, category }
  }

  const getAvailabilityStats = () => {
    const totalInCurrentTab = currentGroupData.length
    const availableCount = availableItems.length
    const unavailableCount = totalInCurrentTab - availableCount

    return { totalInCurrentTab, availableCount, unavailableCount }
  }

  if (!isOpen) return null

  const teamInfo = getCurrentTeamInfo()
  const availabilityStats = getAvailabilityStats()

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
          {/* Header - Simplificado */}
          <div className="bg-gradient-to-r from-primary-purple to-primary-blue p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {icon}
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">{title}</h2>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Informational Message */}
          {currentTeamType && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-gray-700 text-sm font-medium">
                    Solo puedes seleccionar {teamInfo.type}
                    {teamInfo.category && ` de categoría "${teamInfo.category}"`}
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    {availabilityStats.availableCount} de {availabilityStats.totalInCurrentTab} elementos disponibles
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tabs de fuentes */}
          {groupedData && groupedData.length > 1 && (
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex">
                {groupedData.map((group, index) => (
                  <button
                    key={group.source}
                    onClick={() => handleTabChange(index)}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
                      activeTab === index
                        ? "bg-white text-primary-purple border-b-2 border-primary-purple"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    {group.sourceLabel}
                    <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                      {group.items ? group.items.length : 0}
                    </span>
                    {currentTeamType && (
                      <span className="absolute top-1 right-1 text-xs bg-purple-100 text-purple-800 px-1 rounded">
                        {availableItems.length}
                      </span>
                    )}
                  </button>
                ))}
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
                    placeholder={`Buscar por nombre, identificación${mode === "athletes" && categories.length > 0 ? " o categoría" : ""}...`}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                  />
                </div>
              </div>
              {mode === "athletes" && categories && categories.length > 0 && (
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value)
                      setCurrentPage(1)
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
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Seleccionar</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Nombre</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Identificación</th>
                      {mode === "athletes" && (
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Categoría</th>
                      )}
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData && paginatedData.length > 0 ? (
                      paginatedData.map((item) => {
                        const selected = isSelected(item)
                        const isAvailable = isItemAvailable(item)
                        const displayCategory = item.type === "fundacion" 
                          ? (item.categoria || "Sin categoría")
                          : "No aplica"

                        return (
                          <tr
                            key={item.id}
                            className={`border-b border-gray-100 transition-colors ${
                              selected
                                ? "bg-purple-50 cursor-pointer"
                                : !isAvailable
                                  ? "bg-gray-50 cursor-not-allowed opacity-50"
                                  : "hover:bg-gray-50 cursor-pointer"
                            }`}
                            onClick={() => isAvailable && handleSelect(item)}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                {isMultiSelect ? (
                                  <input
                                    type="checkbox"
                                    className={`w-4 h-4 focus:ring-primary-purple border-gray-300 rounded ${
                                      selected ? "text-primary-purple" : "text-gray-300"
                                    }`}
                                    checked={selected}
                                    disabled={!isAvailable}
                                    onChange={(e) => {
                                      e.stopPropagation()
                                      if (isAvailable) handleSelect(item)
                                    }}
                                  />
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
                                    {selected && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${!isAvailable ? 'text-gray-400' : 'text-gray-900'}`}>
                                  {item.name}
                                </span>
                                {!isAvailable && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                    No disponible
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className={`py-3 px-4 text-sm ${!isAvailable ? 'text-gray-400' : 'text-gray-600'}`}>
                              {item.identification || "N/A"}
                            </td>
                            {mode === "athletes" && (
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  !isAvailable
                                    ? "bg-gray-50 text-gray-300"
                                    : item.type === "fundacion" && item.categoria
                                    ? "bg-gray-200 text-gray-700"
                                    : "bg-gray-100 text-gray-400"
                                }`}>
                                  {displayCategory}
                                </span>
                              </td>
                            )}
                            <td className="py-3 px-4">
                              <span className={`text-xs px-2 py-1 rounded bg-purple-100 text-purple-800 ${
                                !isAvailable ? 'opacity-50' : ''
                              }`}>
                                {item.type === "fundacion" ? "Fundación" : "Temporal"}
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={mode === "athletes" ? "5" : "4"} className="py-12 text-center text-gray-500">
                          <div className="text-4xl mb-4">🔍</div>
                          <p>
                            {currentTeamType 
                              ? `No hay elementos disponibles que cumplan con las restricciones`
                              : "No se encontraron resultados"
                            }
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {paginatedData.length === 0 && (searchTerm || selectedCategory) && (
                  <div className="text-center py-4">
                    <button
                      onClick={() => {
                        setSearchTerm("")
                        setSelectedCategory("")
                      }}
                      className="text-primary-purple hover:underline"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                )}
              </div>

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

          {/* Footer - Mantiene la información */}
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-gray-600">
                {selectedItems.length} {mode === "trainer" ? "entrenador" : "deportistas"} seleccionado
                {selectedItems.length !== 1 ? "s" : ""}
                {teamInfo.type && (
                  <span className="ml-2 text-gray-800 font-semibold">• Tipo: {teamInfo.type}</span>
                )}
                {teamInfo.category && (
                  <span className="ml-2 text-gray-800 font-semibold">• Categoría: {teamInfo.category}</span>
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
                    className="px-5 py-2 bg-primary-blue text-white rounded-lg hover:opacity-90 transition"
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
  )
}

export default SelectionModal