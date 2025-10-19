// TemporaryTeams.jsx
import React, { useState, useMemo, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import TemporaryTeamModal from "./components/TemporaryTeamModal.jsx";
import TemporaryTeamViewModal from "./components/TemporaryTeamViewModal.jsx";
import Table from "../../../../../../../shared/components/Table/table.jsx";
import Pagination from "../../../../../../../shared/components/Table/Pagination.jsx";
import SearchInput from "../../../../../../../shared/components/SearchInput.jsx";
import ReportButton from "../../../../../../../shared/components/ReportButton.jsx";
import temporaryTeamsData from "../TemporaryTeams/TemporaryTeamsData.jsx";
import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteAlert,
} from "../../../../../../../shared/utils/alerts.js";

// LocalStorage key
const LOCAL_STORAGE_KEY = "temporaryTeams";

const TemporaryTeams = () => {
  // Cargar datos desde localStorage o data inicial
  const [data, setData] = useState(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : temporaryTeamsData;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [teamToEdit, setTeamToEdit] = useState(null);
  const [teamToView, setTeamToView] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Filtrado por nombre, entrenador, teléfono
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((item) =>
      Object.entries(item).some(([key, value]) => {
        const stringValue = String(value).trim();

        // Búsqueda exacta para estado
        if (key.toLowerCase() === "estado") {
          return stringValue.toLowerCase() === searchTerm.toLowerCase();
        }

        // Búsqueda parcial para otros campos
        return stringValue.toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm]);

  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // Formatear datos para la tabla
  const formattedPaginatedData = useMemo(() => {
    return paginatedData;
  }, [paginatedData]);

  const handlePageChange = (page) => setCurrentPage(page);

  // form handlers
  const formatPhoneNumber = (phone) => {
    if (!phone) return phone;
    return phone.replace(/[\s\-\(\)\+57]/g, "");
  };

  const handleSave = (newTeam) => {
    const newEntry = {
      ...newTeam,
      id: Date.now(),
      telefono: formatPhoneNumber(newTeam.telefono),
      cantidadJugadoras: (newTeam.jugadoras || []).length,
    };
    setData([...data, newEntry]);
    showSuccessAlert("Equipo creado", "El equipo se creó correctamente.");
    setIsModalOpen(false);
  };

  const handleUpdate = (updatedTeam) => {
    const updatedEntry = {
      ...updatedTeam,
      telefono: formatPhoneNumber(updatedTeam.telefono),
      cantidadJugadoras: (updatedTeam.jugadoras || []).length,
    };
    setData(data.map((d) => (d.id === updatedEntry.id ? updatedEntry : d)));
    showSuccessAlert(
      "Equipo actualizado",
      "El equipo se actualizó correctamente."
    );
    setIsModalOpen(false);
  };

  const handleEdit = (team) => {
    if (!team || team.target) return;
    setTeamToEdit(team);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleView = (team) => {
    if (!team || team.target) return;
    setTeamToView(team);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (team) => {
    if (!team || !team.id) return showErrorAlert("Error", "Equipo no válido");

    const confirmResult = await showDeleteAlert(
      "¿Estás seguro?",
      `Se eliminará el equipo ${team.nombre}. Esta acción no se puede deshacer.`,
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" }
    );

    if (!confirmResult.isConfirmed) return;

    setData(data.filter((d) => d.id !== team.id));
    showSuccessAlert(
      "Equipo eliminado",
      `${team.nombre} fue eliminado correctamente.`
    );
  };

  return (
    <div className="p-6 font-questrial w-full max-w-full">
      <style>{`
        .temporary-teams-table td:nth-child(3),
        .temporary-teams-table td:nth-child(4) {
          text-align: center !important;
        }
        .temporary-teams-table th:nth-child(3),
        .temporary-teams-table th:nth-child(4) {
          text-align: center !important;
        }
      `}</style>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Equipos Temporales
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar equipo, entrenador o teléfono..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <ReportButton
              data={filteredData}
              fileName="Equipos_Temporales"
              columns={[
                { header: "Nombre", accessor: "nombre" },
                { header: "Entrenador", accessor: "entrenador" },
                { header: "Número de contacto", accessor: "telefono" },
                { header: "Cantidad Jugadoras", accessor: "cantidadJugadoras" },
                { header: "Estado", accessor: "estado" },
              ]}
            />

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
      </div>

      {totalRows > 0 ? (
        <>
          <div className="w-full overflow-x-auto bg-white rounded-lg">
            <div className="min-w-full temporary-teams-table">
              <Table
                thead={{
                  titles: [
                    "Nombre",
                    "Entrenador",
                    "Número de contacto",
                    "Cantidad de Jugadoras",
                  ],
                  state: true,
                  actions: true,
                }}
                tbody={{
                  data: formattedPaginatedData,
                  dataPropertys: [
                    "nombre",
                    "entrenador",
                    "telefono",
                    "cantidadJugadoras",
                  ],
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
          </div>

          <div className="w-full border-none shadow-none">
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
          No hay equipos temporales registrados todavía.
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
  );
};

export default TemporaryTeams;