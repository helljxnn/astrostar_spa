"use client"

import { useState, useMemo, useEffect } from "react"
import { FaPlus } from "react-icons/fa"
import TemporaryTeamModal from "./components/TemporaryTeamModal.jsx"
import TemporaryTeamViewModal from "./components/TemporaryTeamViewModal.jsx"
import Table from "../../../../../../../shared/components/Table/table.jsx"
import Pagination from "../../../../../../../shared/components/Table/Pagination.jsx"
import SearchInput from "../../../../../../../shared/components/SearchInput.jsx"
import TeamsService from "./services/TeamsService.js"
import { showSuccessAlert, showErrorAlert } from "../../../../../../../shared/utils/alerts.js"

const TemporaryTeams = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState("create")
  const [teamToEdit, setTeamToEdit] = useState(null)
  const [teamToView, setTeamToView] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const rowsPerPage = 5

  // Cargar equipos TEMPORALES
  const loadTeams = async () => {
    setLoading(true)
    try {
      const result = await TeamsService.getTeams({
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm,
        teamType: "Temporal"
      })
      
      if (result.success) {
        const teamsData = result.data || [];
        setData(teamsData);
        setPagination(result.pagination || {
          page: currentPage, 
          limit: rowsPerPage, 
          total: 0, 
          totalPages: 0, 
          hasNext: false, 
          hasPrev: false
        });
      } else {
        setData([]);
        if (result.error) {
          showErrorAlert("Error", result.error);
        }
      }
    } catch (error) {
      console.error('❌ Error cargando equipos:', error);
      showErrorAlert("Error", "No se pudieron cargar los equipos");
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeams();
  }, [currentPage, searchTerm])

  // Formatear datos para la tabla - CORREGIDO para contar solo deportistas
  const formattedData = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    const formatted = data.map(team => {
      // ✅ CORRECCIÓN: Contar SOLO deportistas, NO entrenadores
      const deportistasCount = Array.isArray(team.members) ? 
        team.members.filter(member => {
          // Solo contar miembros que NO sean entrenadores
          const isEntrenador = member.position === 'Entrenador' || 
                              member.memberType === 'Employee' || 
                              member.employeeId;
          return !isEntrenador;
        }).length : 0;
      
      return {
        ...team,
        id: team.id,
        nombre: team.nombre || team.name || "Sin nombre",
        entrenador: team.entrenador || team.coach || "Sin entrenador",
        telefono: team.telefono || team.phone || "N/A",
        cantidadDeportistas: deportistasCount, // ✅ Solo deportistas
        categoria: team.categoria || team.category || "N/A",
        estado: team.estado || (team.status === 'Active' ? 'Activo' : 'Inactivo'),
        teamTypeForDisplay: team.teamType === "Temporal" ? "Temporales" : "Fundación",
      };
    });

    return formatted;
  }, [data])

  const handlePageChange = (page) => {
    setCurrentPage(page);
  }

  // Guardar nuevo equipo
  const handleSave = async (newTeam) => {
    try {
      const result = await TeamsService.createTeam(newTeam);
      
      if (result.success) {
        showSuccessAlert("¡Éxito!", result.message || "Equipo creado correctamente");
        setIsModalOpen(false);
        setCurrentPage(1);
        await loadTeams();
      } else {
        showErrorAlert("Error", result.error || "No se pudo crear el equipo");
      }
    } catch (error) {
      console.error('❌ Error creando equipo:', error);
      showErrorAlert("Error", error.message || "No se pudo crear el equipo");
    }
  }

  // Actualizar equipo
  const handleUpdate = async (updatedTeam) => {
    try {
      const result = await TeamsService.updateTeam(updatedTeam.id, updatedTeam);
      
      if (result.success) {
        showSuccessAlert("¡Éxito!", result.message || "Equipo actualizado");
        setIsModalOpen(false);
        await loadTeams();
      } else {
        showErrorAlert("Error", result.error || "No se pudo actualizar el equipo");
      }
    } catch (error) {
      console.error('❌ Error actualizando equipo:', error);
      showErrorAlert("Error", error.message || "No se pudo actualizar el equipo");
    }
  }

  const handleEdit = (team) => {
    setTeamToEdit(team);
    setModalMode("edit");
    setIsModalOpen(true);
  }

  const handleView = (team) => {
    setTeamToView(team);
    setIsViewModalOpen(true);
  }

  const handleDelete = async (team) => {
    const { default: Swal } = await import("sweetalert2");
    const result = await Swal.fire({
      title: "¿Eliminar equipo?",
      text: `¿Estás seguro de que quieres eliminar el equipo "${team.nombre}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    })

    if (result.isConfirmed) {
      try {
        const deleteResult = await TeamsService.deleteTeam(team.id);
        if (deleteResult.success) {
          showSuccessAlert("Eliminado", deleteResult.message || `${team.nombre} fue eliminado`);
          await loadTeams();
        } else {
          showErrorAlert("Error", deleteResult.error || "No se pudo eliminar el equipo");
        }
      } catch (error) {
        console.error('❌ Error eliminando equipo:', error);
        showErrorAlert("Error", error.message || "No se pudo eliminar el equipo");
      }
    }
  }

  return (
    <div className="p-6 font-questrial w-full max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Equipos Temporales</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar equipo..."
            />
          </div>

          <button
            onClick={() => {
              setModalMode("create");
              setTeamToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors whitespace-nowrap"
          >
            <FaPlus /> Crear Equipo
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600">Cargando equipos...</div>
      ) : formattedData.length > 0 ? (
        <>
          <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
            <Table
              thead={{
                // ✅ CORRECCIÓN: Quitamos "Estado" duplicado - el componente Table ya lo muestra
                titles: ["Nombre", "Entrenador", "Teléfono", "Deportistas", "Categoría", "Tipo"],
                state: true, // Esto muestra la columna de estado automáticamente
                actions: true,
              }}
              tbody={{
                data: formattedData,
                // ✅ CORRECCIÓN: Solo estas propiedades, el estado se maneja automáticamente
                dataPropertys: ["nombre", "entrenador", "telefono", "cantidadDeportistas", "categoria", "teamTypeForDisplay"],
                state: true,
                stateMap: {
                  Activo: "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs",
                  Inactivo: "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs",
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
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              totalRows={pagination.total}
              rowsPerPage={rowsPerPage}
              startIndex={(currentPage - 1) * rowsPerPage}
            />
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 mt-10 py-8 bg-white rounded-2xl shadow border border-gray-200">
          {searchTerm ? (
            <p>No se encontraron equipos temporales que coincidan con "{searchTerm}"</p>
          ) : (
            <p>No hay equipos temporales registrados. ¡Crea el primero!</p>
          )}
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