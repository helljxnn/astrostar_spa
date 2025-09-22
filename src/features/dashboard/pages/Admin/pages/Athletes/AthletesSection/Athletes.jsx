import React, { useState, useMemo } from "react";
import { FaUserShield, FaUsers, FaPlus } from "react-icons/fa";
import AthleteModal from "./components/AthleteModal.jsx";
import AthleteViewModal from "./components/AthleteViewModal.jsx";
import GuardianModal from "../../Athletes/AthletesSection/components/GuardianModal.jsx";
import GuardianViewModal from "../AthletesSection/components/GuardianViewModal.jsx";
import GuardiansListModal from "./components/GuardiansListModal.jsx";
import Table from "../../../../../../../shared/components/Table/table.jsx";
import Pagination from "../../../../../../../shared/components/Table/Pagination.jsx";
import SearchInput from "../../../../../../../shared/components/SearchInput.jsx";
import ReportButton from "../../../../../../../shared/components/ReportButton.jsx";
import athletesData from "./AthleteData.jsx";
import guardiansData from "../AthletesSection/GuardiansData.js";
import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteAlert,
} from "../../../../../../../shared/utils/alerts.js";

const Athletes = () => {
  // -----------------------------
  // Estados de atletas
  // -----------------------------
  const [data, setData] = useState(athletesData || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [athleteToEdit, setAthleteToEdit] = useState(null);
  const [athleteToView, setAthleteToView] = useState(null);

  // -----------------------------
  // Estados de acudientes
  // -----------------------------
  const [guardians, setGuardians] = useState(guardiansData || []);
  const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);
  const [isGuardianViewOpen, setIsGuardianViewOpen] = useState(false);
  const [isGuardiansListOpen, setIsGuardiansListOpen] = useState(false);
  const [guardianToEdit, setGuardianToEdit] = useState(null);
  const [guardianToView, setGuardianToView] = useState(null);
  const [guardianModalMode, setGuardianModalMode] = useState("create");

  // -----------------------------
  // Estados comunes
  // -----------------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 5;

  // -----------------------------
  // Filtrado de atletas
  // -----------------------------
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    return data.filter((athlete) => {
      const guardian = guardians.find((g) => g.id === athlete.acudiente);
      return [
        athlete.nombres,
        athlete.apellidos,
        athlete.numeroDocumento,
        athlete.correo,
        athlete.categoria,
        guardian?.nombreCompleto,
        athlete.estadoInscripcion, // 👈 agregamos para búsqueda
      ]
        .filter(Boolean)
        .some((field) =>
          field.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });
  }, [data, searchTerm, guardians]);

  const totalRows = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handlePageChange = (page) => setCurrentPage(page);

  // -----------------------------
  // CRUD Atletas
  // -----------------------------
  const handleSave = async (newAthlete) => {
    try {
      const formatted = {
        ...newAthlete,
        id: Date.now(),
        estadoInscripcion: "", // 👈 nueva propiedad
      };
      setData([formatted, ...data]);
      showSuccessAlert(
        "Deportista creado",
        "El deportista se creó correctamente."
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al crear deportista:", error);
      showErrorAlert("Error", "Ocurrió un error al crear el deportista");
    }
  };

  const handleUpdate = async (updatedAthlete) => {
    try {
      setData(
        data.map((a) => (a.id === updatedAthlete.id ? updatedAthlete : a))
      );
      showSuccessAlert(
        "Deportista actualizado",
        "El deportista se actualizó correctamente."
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al actualizar deportista:", error);
      showErrorAlert("Error", "Ocurrió un error al actualizar el deportista");
    }
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

  // -----------------------------
  // CRUD Acudientes
  // -----------------------------
  const handleSaveGuardian = async (newGuardian) => {
    try {
      const formatted = { ...newGuardian, id: Date.now() };
      setGuardians([formatted, ...guardians]);
      showSuccessAlert("Acudiente creado", "El acudiente se creó correctamente.");
      setIsGuardianModalOpen(false);
      return formatted;
    } catch (error) {
      console.error("Error al crear acudiente:", error);
      showErrorAlert("Error", "Ocurrió un error al crear el acudiente");
    }
  };

  const handleUpdateGuardian = async (updatedGuardian) => {
    try {
      setGuardians(
        guardians.map((g) =>
          g.id === updatedGuardian.id ? updatedGuardian : g
        )
      );
      showSuccessAlert(
        "Acudiente actualizado",
        "El acudiente se actualizó correctamente."
      );
      setIsGuardianModalOpen(false);
    } catch (error) {
      console.error("Error al actualizar acudiente:", error);
      showErrorAlert("Error", "Ocurrió un error al actualizar el acudiente");
    }
  };

  const handleEditGuardian = (guardian) => {
    if (!guardian || guardian.target) return;
    setGuardianToEdit(guardian);
    setGuardianModalMode("edit");
    setIsGuardianModalOpen(true);
  };

  const handleViewGuardian = (guardian) => {
    if (!guardian || guardian.target) return;
    setGuardianToView(guardian);
    setIsGuardianViewOpen(true);
  };

  const handleDeleteGuardian = async (guardian) => {
    if (!guardian || !guardian.id)
      return showErrorAlert("Error", "Acudiente no válido");

    const associatedAthletes = data.filter((a) => a.acudiente === guardian.id);
    if (associatedAthletes.length > 0) {
      return showErrorAlert(
        "No se puede eliminar",
        `Este acudiente tiene ${associatedAthletes.length} deportista(s) asociado(s). Primero debes reasignar o eliminar los deportistas.`
      );
    }

    const confirmResult = await showDeleteAlert(
      "¿Estás seguro?",
      `Se eliminará al acudiente ${guardian.nombreCompleto}.`,
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" }
    );

    if (!confirmResult.isConfirmed) return;

    setGuardians(guardians.filter((g) => g.id !== guardian.id));
    showSuccessAlert(
      "Acudiente eliminado",
      `${guardian.nombreCompleto} fue eliminado correctamente.`
    );
  };

  // -----------------------------
  // Funciones para el AthleteModal
  // -----------------------------
  const handleCreateGuardianFromAthlete = () => {
    setGuardianToEdit(null);
    setGuardianModalMode("create");
    setIsGuardianModalOpen(true);
  };

  const handleViewGuardianFromAthlete = (guardian) => {
    if (guardian) {
      setGuardianToView(guardian);
      setIsGuardianViewOpen(true);
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="p-6 font-questrial w-full max-w-full">
      {/* Header */}
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

          <div className="flex flex-col sm:flex-row gap-3">
            <ReportButton
              data={filteredData.map((athlete) => ({
                ...athlete,
                acudienteNombre:
                  guardians.find((g) => g.id === athlete.acudiente)
                    ?.nombreCompleto || "Sin acudiente",
                estadoInscripcion: athlete.estadoInscripcion || "",
              }))}
              fileName="Deportistas"
              columns={[
                { header: "Nombres", accessor: "nombres" },
                { header: "Apellidos", accessor: "apellidos" },
                { header: "Documento", accessor: "numeroDocumento" },
                { header: "Correo", accessor: "correo" },
                { header: "Teléfono", accessor: "telefono" },
                { header: "Categoría", accessor: "categoria" },
                { header: "Estado", accessor: "estado" },
                {
                  header: "Estado de inscripción",
                  accessor: "estadoInscripcion",
                },
                { header: "Acudiente", accessor: "acudienteNombre" },
              ]}
            />

            <button
              onClick={() => setIsGuardiansListOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-purple text-white rounded-lg shadow hover:opacity-90 transition whitespace-nowrap"
            >
              <FaUsers /> Ver Acudientes
            </button>

            <button
              onClick={() => {
                setModalMode("create");
                setAthleteToEdit(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow hover:opacity-90 transition whitespace-nowrap"
            >
              <FaPlus /> Nuevo Deportista
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
                    "Categoría",
                    "Correo",
                    "Teléfono",
                    "Acudiente",
                    "Estado de inscripción", // 👈 reemplazo de deporte
                  ],
                  state: true,
                  actions: true,
                }}
                tbody={{
                  data: paginatedData.map((a) => ({
                    ...a,
                    nombreCompleto: `${a.nombres} ${a.apellidos}`,
                    acudienteNombre:
                      guardians.find((g) => g.id === a.acudiente)
                        ?.nombreCompleto || "Sin acudiente",
                    estadoInscripcion: a.estadoInscripcion || "",
                  })),
                  dataPropertys: [
                    "nombreCompleto",
                    "categoria",
                    "correo",
                    "telefono",
                    "acudienteNombre",
                    "estadoInscripcion", // 👈 en lugar de deportePrincipal
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

      {/* Modales */}
      <AthleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onUpdate={handleUpdate}
        athleteToEdit={athleteToEdit}
        guardians={guardians}
        mode={modalMode}
        onCreateGuardian={handleCreateGuardianFromAthlete}
        onViewGuardian={handleViewGuardianFromAthlete}
      />

      <AthleteViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        athlete={athleteToView}
        guardian={
          athleteToView
            ? guardians.find((g) => g.id === athleteToView.acudiente)
            : null
        }
      />

      <GuardiansListModal
        isOpen={isGuardiansListOpen}
        onClose={() => setIsGuardiansListOpen(false)}
        guardians={guardians}
        athletes={data}
        onCreateGuardian={() => {
          setGuardianToEdit(null);
          setGuardianModalMode("create");
          setIsGuardianModalOpen(true);
        }}
        onEditGuardian={handleEditGuardian}
        onViewGuardian={handleViewGuardian}
        onDeleteGuardian={handleDeleteGuardian}
      />

      <GuardianModal
        isOpen={isGuardianModalOpen}
        onClose={() => setIsGuardianModalOpen(false)}
        onSave={handleSaveGuardian}
        onUpdate={handleUpdateGuardian}
        guardianToEdit={guardianToEdit}
        mode={guardianModalMode}
      />

      <GuardianViewModal
        isOpen={isGuardianViewOpen}
        onClose={() => setIsGuardianViewOpen(false)}
        guardian={guardianToView}
        athletes={data.filter((a) => a.acudiente === guardianToView?.id)}
      />
    </div>
  );
};

export default Athletes;
