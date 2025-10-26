"use client"

import { useState, useMemo, useEffect } from "react"
import { FaPlus } from "react-icons/fa"
import TemporaryTeamModal from "./components/TemporaryTeamModal.jsx"
import TemporaryTeamViewModal from "./components/TemporaryTeamViewModal.jsx"
import Table from "../../../../../../../shared/components/Table/table.jsx"
import Pagination from "../../../../../../../shared/components/Table/Pagination.jsx"
import SearchInput from "../../../../../../../shared/components/SearchInput.jsx"
import ReportButton from "../../../../../../../shared/components/ReportButton.jsx"
import temporaryTeamsData from "../TemporaryTeams/TemporaryTeamsData.jsx"
import { showSuccessAlert, showErrorAlert } from "../../../../../../../shared/utils/alerts.js"

// Clave para localStorage
const LOCAL_STORAGE_KEY = "temporaryTeams"

const TemporaryTeams = () => {
  // Cargar datos desde localStorage o usar datos iniciales
  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      return stored ? JSON.parse(stored) : temporaryTeamsData
    } catch (e) {
      console.warn("Error leyendo localStorage, usando datos por defecto")
      return temporaryTeamsData
    }
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState("create")
  const [teamToEdit, setTeamToEdit] = useState(null)
  const [teamToView, setTeamToView] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 5

  // Guardar en localStorage con manejo de errores
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error("No se pudo guardar en localStorage", e)
    }
  }, [data])

  // Filtrado
  const filteredData = useMemo(() => {
    if (!searchTerm) return data
    const term = searchTerm.toLowerCase()
    return data.filter(item =>
      item.nombre?.toLowerCase().includes(term) ||
      item.entrenador?.toLowerCase().includes(term) ||
      item.telefono?.includes(term)
    )
  }, [data, searchTerm])

  const totalRows = filteredData.length
  const totalPages = Math.ceil(totalRows / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage)

  // CORRECCIÓN: Crear datos formateados SOLO para la tabla, sin modificar el original
  const formattedPaginatedData = useMemo(() => {
    return paginatedData.map(team => ({
      ...team,
      // Crear una propiedad NUEVA para display, NO sobrescribir teamType
      teamTypeForDisplay: team.teamType === "fundacion" ? "Fundación" : "Temporales"
    }))
  }, [paginatedData])

  const handlePageChange = (page) => setCurrentPage(page)

  // Formatear teléfono
  const formatPhoneNumber = (phone) => {
    if (!phone) return phone
    return phone.replace(/[\s\-\(\)]/g, "")
  }

  // Guardar nuevo equipo
  const handleSave = (newTeam) => {
    try {
      const newEntry = {
        ...newTeam,
        id: Date.now(),
        telefono: formatPhoneNumber(newTeam.telefono),
        cantidadDeportistas: (newTeam.deportistas || []).length,
      }
      setData(prev => [...prev, newEntry])
      showSuccessAlert("¡Éxito!", "Equipo creado correctamente")
      setIsModalOpen(false)
    } catch (e) {
      showErrorAlert("Error", "No se pudo crear el equipo")
    }
  }

  // Actualizar equipo
  const handleUpdate = (updatedTeam) => {
    try {
      const updatedEntry = {
        ...updatedTeam,
        telefono: formatPhoneNumber(updatedTeam.telefono),
        cantidadDeportistas: (updatedTeam.deportistas || []).length,
      }
      setData(prev => prev.map(d => d.id === updatedEntry.id ? updatedEntry : d))
      showSuccessAlert("¡Éxito!", "Equipo actualizado")
      setIsModalOpen(false)
    } catch (e) {
      showErrorAlert("Error", "No se pudo actualizar")
    }
  }

  const handleEdit = (team) => {
    // Buscar el equipo original en data para asegurar que tiene todos los datos
    const originalTeam = data.find(t => t.id === team.id)
    console.log("Original team para editar:", originalTeam)
    setTeamToEdit(originalTeam || team)
    setModalMode("edit")
    setIsModalOpen(true)
  }

  const handleView = (team) => {
    // CRÍTICO: Buscar el equipo ORIGINAL en data, no el formateado
    const originalTeam = data.find(t => t.id === team.id)
    console.log("=== DEBUG VIEW ===")
    console.log("Team desde tabla (puede estar formateado):", team)
    console.log("Team ORIGINAL desde data:", originalTeam)
    console.log("teamType del original:", originalTeam?.teamType)
    setTeamToView(originalTeam || team)
    setIsViewModalOpen(true)
  }

  const handleDelete = async (team) => {
    const result = await import("sweetalert2").then(Swal => 
      Swal.default.fire({
        title: "¿Eliminar?",
        text: `Se eliminará ${team.nombre}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      })
    )

    if (result.isConfirmed) {
      setData(prev => prev.filter(d => d.id !== team.id))
      showSuccessAlert("Eliminado", `${team.nombre} fue eliminado`)
    }
  }

  return (
    <div className="p-6 font-questrial w-full max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Equipos</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Buscar equipo..."
            />
          </div>

          <button
            onClick={() => {
              setModalMode("create")
              setTeamToEdit(null)
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
          >
            <FaPlus /> Crear Equipo
          </button>
        </div>
      </div>

      {totalRows > 0 ? (
        <>
          <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
            <Table
              thead={{
                titles: ["Nombre", "Entrenador", "Teléfono", "Deportistas", "Categoría", "Tipo"],
                state: true,
                actions: true,
              }}
              tbody={{
                data: formattedPaginatedData,
                // USAR teamTypeForDisplay en lugar de teamType
                dataPropertys: ["nombre", "entrenador", "telefono", "cantidadDeportistas", "categoria", "teamTypeForDisplay"],
                state: true,
                stateMap: {
                  Activo: "bg-green-100 text-green-800",
                  Inactivo: "bg-red-100 text-red-800",
                },
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          </div>

          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalRows={totalRows}
              rowsPerPage={rowsPerPage}
              startIndex={startIndex}
            />
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 mt-10 py-8 bg-white rounded-2xl shadow border border-gray-200">
          No hay equipos registrados. ¡Crea el primero!
        </div>
      )}

      <TemporaryTeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onUpdate={handleUpdate}
        teamToEdit={teamToEdit}
        mode={modalMode}
      />

      <TemporaryTeamViewModal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        team={teamToView} 
      />
    </div>
  )
}

export default TemporaryTeams