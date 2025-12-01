"use client"

import { useState, useMemo, useEffect } from "react"
import { FaPlus } from "react-icons/fa"
import TemporaryTeamModal from "./components/TemporaryTeamModal.jsx"
import TemporaryTeamViewModal from "./components/TemporaryTeamViewModal.jsx"
import Table from "../../../../../../../shared/components/Table/table.jsx"
import Pagination from "../../../../../../../shared/components/Table/Pagination.jsx"
import SearchInput from "../../../../../../../shared/components/SearchInput.jsx"
import TeamsService from "./services/TeamsService.js"
import { showSuccessAlert, showErrorAlert, showDeleteAlert } from "../../../../../../../shared/utils/alerts.js"
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard"
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions"

const TemporaryTeams = () => {
  const { hasPermission } = usePermissions()
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
  const [eventAssignmentsCheck, setEventAssignmentsCheck] = useState({})

  const rowsPerPage = 5

  // Generar mensaje dinámico para el tooltip
  const generateTooltipMessage = (teamId) => {
    const assignment = eventAssignmentsCheck[teamId];
    if (!assignment || !assignment.isAssigned) {
      return "Eliminar equipo";
    }

    const events = assignment.events || [];
    const count = assignment.count || events.length;

    if (count === 0) {
      return "Eliminar equipo";
    }

    // Agrupar eventos por estado
    const statusGroups = {};
    events.forEach(event => {
      const status = event.status || 'Desconocido';
      if (!statusGroups[status]) {
        statusGroups[status] = 0;
      }
      statusGroups[status]++;
    });

    // Crear mensaje natural
    const statusList = Object.keys(statusGroups);
    
    if (count === 1) {
      // "Asignado a un evento con estado Programado"
      return `Asignado a un evento con estado ${statusList[0]}`;
    } else if (statusList.length === 1) {
      // "Asignado a 3 eventos con estado Programado"
      return `Asignado a ${count} eventos con estado ${statusList[0]}`;
    } else {
      // "Asignado a 3 eventos con estado Programado y En_pausa"
      const lastStatus = statusList.pop();
      return `Asignado a ${count} eventos con estado ${statusList.join(', ')} y ${lastStatus}`;
    }
  };

  // Verificar asignaciones a eventos para todos los equipos
  const checkEventAssignmentsForTeams = async (teams) => {
    const assignmentsCheck = {}

    const promises = teams.map(async (team) => {
      try {
        const response = await TeamsService.checkEventAssignments(team.id)
        return {
          id: team.id,
          isAssigned: response.isAssigned,
          count: response.count || 0,
          events: response.events || [],
          message: response.message
        }
      } catch (error) {
        return { id: team.id, isAssigned: false, count: 0, events: [], message: '' }
      }
    })

    const results = await Promise.all(promises)
    results.forEach((result) => {
      assignmentsCheck[result.id] = {
        isAssigned: result.isAssigned,
        count: result.count,
        events: result.events,
        message: result.message
      }
    })

    setEventAssignmentsCheck(assignmentsCheck)
  }

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
        checkEventAssignmentsForTeams(teamsData);
      } else {
        setData([]);
        if (result.error) {
          showErrorAlert("Error", result.error);
        }
      }
    } catch (error) {
      console.error('Error cargando equipos:', error);
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
      console.error('Error creando equipo:', error);
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
      console.error('Error actualizando equipo:', error);
      showErrorAlert("Error", error.message || "No se pudo actualizar el equipo");
    }
  }

  const handleEdit = (team) => {
    if (!hasPermission('temporaryTeams', 'Editar')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para editar equipos');
      return;
    }
    setTeamToEdit(team);
    setModalMode("edit");
    setIsModalOpen(true);
  }

  const handleView = (team) => {
    if (!hasPermission('temporaryTeams', 'Ver')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para ver equipos');
      return;
    }
    setTeamToView(team);
    setIsViewModalOpen(true);
  }

  const handleDelete = async (team) => {
    if (!hasPermission('temporaryTeams', 'Eliminar')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para eliminar equipos');
      return;
    }
    
    if (!team || !team.id) {
      return showErrorAlert("Error", "Equipo no válido");
    }
    
    if (eventAssignmentsCheck[team.id]?.isAssigned) {
      const assignment = eventAssignmentsCheck[team.id];
      const events = assignment.events || [];
      const count = assignment.count || events.length;
      
      let eventDetails = '';
      if (count === 1 && events.length > 0) {
        eventDetails = ` (${events[0].name} - ${events[0].status})`;
      } else if (count > 1) {
        eventDetails = ` a ${count} eventos activos`;
      }
      
      return showErrorAlert(
        "No se puede eliminar",
        `El equipo "${team.nombre}" está asignado${eventDetails}.`
      );
    }
    
    const confirmResult = await showDeleteAlert(
      "¿Estás seguro?",
      `Se eliminará el equipo ${team.nombre}. Esta acción no se puede deshacer.`,
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" }
    );
    
    if (!confirmResult.isConfirmed) return;
    
    try {
      const deleteResult = await TeamsService.deleteTeam(team.id);
      
      if (deleteResult.success) {
        showSuccessAlert(
          "Equipo eliminado",
          `${team.nombre} fue eliminado correctamente.`
        );
        // Forzar recarga completa para asegurar datos actualizados
        setCurrentPage(1);
        await loadTeams();
      } else {
        showErrorAlert(
          "Error",
          deleteResult.error || "No se pudo eliminar el equipo"
        );
      }
    } catch (error) {
      console.error('Error eliminando equipo:', error);
      showErrorAlert("Error", "Error al eliminar el equipo en el servidor");
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
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar equipo..."
            />
          </div>

          <PermissionGuard module="temporaryTeams" action="Crear">
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
          </PermissionGuard>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600">Cargando equipos...</div>
      ) : formattedData.length > 0 ? (
        <>
          <Table
            thead={{
              titles: ["Nombre", "Entrenador", "Deportistas", "Categoría", "Tipo"],
              state: true,
              actions: true,
            }}
            tbody={{
              data: formattedData,
              dataPropertys: ["nombre", "entrenador", "cantidadDeportistas", "categoria", "teamTypeForDisplay"],
              state: true,
              stateMap: {
                Activo: "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs",
                Inactivo: "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs",
              },
            }}
            rowsPerPage={1000}
            onEdit={hasPermission('temporaryTeams', 'Editar') ? handleEdit : null}
            onDelete={hasPermission('temporaryTeams', 'Eliminar') ? handleDelete : null}
            onView={hasPermission('temporaryTeams', 'Ver') ? handleView : null}
            buttonConfig={{
              edit: (item) => ({ 
                show: hasPermission('temporaryTeams', 'Editar'),
                disabled: false,
                title: "Editar equipo"
              }),
              delete: (item) => ({ 
                show: hasPermission('temporaryTeams', 'Eliminar'),
                disabled: eventAssignmentsCheck[item.id]?.isAssigned,
                title: generateTooltipMessage(item.id)
              }),
              view: (item) => ({ 
                show: hasPermission('temporaryTeams', 'Ver'),
                disabled: false,
                title: "Ver detalles"
              }),
            }}
          />

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
            <p>No se encontraron equipos que coincidan con "{searchTerm}"</p>
          ) : (
            <p>No hay equipos registrados. ¡Crea el primero!</p>
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