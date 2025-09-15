// src/features/dashboard/pages/Admin/pages/Athletes/Athletes.jsx
import React, { useState, useMemo } from "react";
import { FaPlus } from "react-icons/fa";
import AthleteModal from "./components/AthleteModal.jsx";
import AthleteViewModal from "./components/AthleteViewModal.jsx";
import Table from "../../../../../../../shared/components/Table/table.jsx";
import Pagination from "../../../../../../../shared/components/Table/Pagination.jsx";
import SearchInput from "../../../../../../../shared/components/SearchInput.jsx";
import ReportButton from "../../../../../../../shared/components/ReportButton.jsx";
import athletesData from "./AthleteData.jsx";
import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteAlert,
} from "../../../../../../../shared/utils/alerts.js";

const Athletes = () => {
  const [data, setData] = useState(athletesData || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [athleteToEdit, setAthleteToEdit] = useState(null);
  const [athleteToView, setAthleteToView] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 5;

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    return data.filter((athlete) =>
      [
        athlete.nombres,
        athlete.apellidos,
        athlete.numeroDocumento,
        athlete.correo,
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [data, searchTerm]);

  const totalRows = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handlePageChange = (page) => setCurrentPage(page);

  const handleSave = (newAthlete) => {
    const formatted = {
      ...newAthlete,
      id: Date.now(),
    };
    setData([formatted, ...data]);
    showSuccessAlert(
      "Deportista creado",
      "El deportista se creó correctamente."
    );
    setIsModalOpen(false);
  };

  const handleUpdate = (updatedAthlete) => {
    setData(data.map((a) => (a.id === updatedAthlete.id ? updatedAthlete : a)));
    showSuccessAlert(
      "Deportista actualizado",
      "El deportista se actualizó correctamente."
    );
    setIsModalOpen(false);
  };

  const handleEdit = (athlete) => {
    if (!athlete || athlete.target) return;
    setAthleteToEdit(athlete);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleView = (athlete) => {
    if (!athlete || athlete.target) return;
    setAthleteToView(athlete);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (athlete) => {
    if (!athlete || !athlete.id)
      return showErrorAlert("Error", "Deportista no válido");

    const confirmResult = await showDeleteAlert(
      "¿Estás seguro?",
      `Se eliminará al deportista ${athlete.nombres} ${athlete.apellidos}.`,
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" }
    );

    if (!confirmResult.isConfirmed) return;

    setData(data.filter((a) => a.id !== athlete.id));
    showSuccessAlert(
      "Deportista eliminado",
      `${athlete.nombres} ${athlete.apellidos} fue eliminado correctamente.`
    );
  };

  return (
    <div className="p-6 font-questrial w-full max-w-full">
      {/* Header con buscador y botones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Deportistas</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar deportista..."
            />
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3">
            <ReportButton
              data={filteredData}
              fileName="Deportistas"
              columns={[
                { header: "Nombres", accessor: "nombres" },
                { header: "Apellidos", accessor: "apellidos" },
                { header: "Documento", accessor: "numeroDocumento" },
                { header: "Correo", accessor: "correo" },
                { header: "Teléfono", accessor: "telefono" },
                { header: "Deporte", accessor: "deportePrincipal" },
                { header: "Categoría", accessor: "categoria" },
                { header: "Estado", accessor: "estado" },
              ]}
            />

            <button
              onClick={() => {
                setModalMode("create");
                setAthleteToEdit(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow hover:opacity-90 transition whitespace-nowrap"
            >
              <FaPlus /> Crear Deportista
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      {totalRows > 0 ? (
        <>
          <div className="w-full overflow-x-auto bg-white rounded-lg">
            <div className="min-w-full">
              <Table
                thead={{
                  titles: [
                    "Nombre Completo",
                    "Deporte",
                    "Categoría",
                    "Correo",
                    "Teléfono",
                  ],
                  state: true,
                  actions: true,
                }}
                tbody={{
                  data: paginatedData.map((a) => ({
                    ...a,
                    nombreCompleto: `${a.nombres} ${a.apellidos}`,
                  })),
                  dataPropertys: [
                    "nombreCompleto",
                    "deportePrincipal",
                    "categoria",
                    "correo",
                    "telefono",
                  ],
                  state: true,
                  stateMap: {
                    Activo: "bg-green-100 text-green-800",
                    Inactivo: "bg-red-100 text-red-800",
                    Lesionado: "bg-yellow-100 text-yellow-800",
                    Suspendido: "bg-orange-100 text-orange-800",
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
          No hay deportistas registrados todavía.
        </div>
      )}

      {/* Modal Crear/Editar */}
      <AthleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onUpdate={handleUpdate}
        athleteToEdit={athleteToEdit}
        mode={modalMode}
      />

      {/* Modal Ver */}
      <AthleteViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        athlete={athleteToView}
      />
    </div>
  );
};

export default Athletes;
