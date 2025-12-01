import { useState, useMemo } from "react";
import { FaUsers, FaPlus, FaClipboardList, FaHistory } from "react-icons/fa";
import AthleteModal from "./components/AthleteModal.jsx";
import AthleteViewModal from "./components/AthleteViewModal.jsx";
import GuardianModal from "../../Athletes/AthletesSection/components/GuardianModal.jsx";
import GuardianViewModal from "../AthletesSection/components/GuardianViewModal.jsx";
import GuardiansListModal from "./components/GuardiansListModal.jsx";
import InscriptionManagementModal from "./components/InscriptionManagementModal.jsx";
import InscriptionHistoryModal from "../AthletesSection/components/AthleteInscriptionHistoryModal.jsx";

import Table from "../../../../../../../shared/components/Table/table.jsx";
import Pagination from "../../../../../../../shared/components/Table/Pagination.jsx";
import SearchInput from "../../../../../../../shared/components/SearchInput.jsx";
import ReportButton from "../../../../../../../shared/components/ReportButton.jsx";

import AthletesService from "./services/AthletesService.js";

import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteAlert,
} from "../../../../../../../shared/utils/alerts.js";

// Hook personalizado para deportistas
import { useAthletes } from "./hooks/useAthletes.js";

const Athletes = () => {
  // Usar el hook personalizado
  const {
    athletes,
    guardians,
    loading,
    pagination,
    referenceData,
    createAthlete,
    updateAthlete,
    deleteAthlete,
    createGuardian,
    updateGuardian,
    deleteGuardian,
    changePage,
    refresh
  } = useAthletes();

  // Estados de modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [athleteToEdit, setAthleteToEdit] = useState(null);
  const [athleteToView, setAthleteToView] = useState(null);

  // Estados de acudientes
  const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);
  const [isGuardianViewOpen, setIsGuardianViewOpen] = useState(false);
  const [isGuardiansListOpen, setIsGuardiansListOpen] = useState(false);
  const [guardianToEdit, setGuardianToEdit] = useState(null);
  const [guardianToView, setGuardianToView] = useState(null);
  const [guardianModalMode, setGuardianModalMode] = useState("create");
  const [newlyCreatedGuardianId, setNewlyCreatedGuardianId] = useState(null);

  // Estados de inscripciones
  const [isInscriptionHistoryModalOpen, setIsInscriptionHistoryModalOpen] = useState(false);
  const [athleteForInscription, setAthleteForInscription] = useState(null);
  const [isInscriptionManagementOpen, setIsInscriptionManagementOpen] = useState(false);

  // Estados comunes
  const [searchTerm, setSearchTerm] = useState("");
  const rowsPerPage = 10;

  // Filtrar datos localmente si hay término de búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm) return athletes;

    const searchLower = searchTerm.toLowerCase().trim();

    return athletes.filter((athlete) => {
      const textFields = [
        athlete.firstName,
        athlete.lastName,
        athlete.email,
        athlete.identification,
        athlete.categoria,
      ];

      return textFields.some(
        (field) =>
          field &&
          String(field).toLowerCase().includes(searchLower)
      );
    });
  }, [athletes, searchTerm]);

  // Usar paginación del servidor cuando no hay búsqueda local
  const displayData = searchTerm ? filteredData : athletes;
  const totalRows = searchTerm ? filteredData.length : pagination.total;
  const totalPages = searchTerm ? Math.ceil(filteredData.length / rowsPerPage) : pagination.totalPages;
  const startIndex = (pagination.page - 1) * rowsPerPage;
  const paginatedData = searchTerm ? filteredData.slice(startIndex, startIndex + rowsPerPage) : athletes;

  const handlePageChange = (page) => changePage(page);

  // Función auxiliar para obtener el acudiente
  const getGuardianById = (guardianId) => {
    return guardians.find((g) => String(g.id) === String(guardianId));
  };

  const handleSave = async (newAthlete) => {
    const success = await createAthlete(newAthlete);
    if (success) {
      setIsModalOpen(false);
      setNewlyCreatedGuardianId(null);
    }
  };

  const handleUpdate = async (updatedAthlete) => {
    const { id, shouldUpdateInscription, ...athleteData } = updatedAthlete;
    const success = await updateAthlete(id, athleteData);
    
    if (success) {
      setIsModalOpen(false);
      
      // Actualizar la vista si estaba abierta
      if (athleteToView && athleteToView.id === id) {
        const updatedAthleteData = await AthletesService.getAthleteById(id);
        if (updatedAthleteData.success) {
          setAthleteToView(updatedAthleteData.data);
        }
      }
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
    // Obtener los datos más recientes del atleta
    const currentAthlete = athletes.find(a => a.id === athlete.id) || athlete;
    setAthleteToView(currentAthlete);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (athlete) => {
    if (!athlete || !athlete.id)
      return showErrorAlert("Error", "Deportista no válido");

    const confirmResult = await showDeleteAlert(
      "¿Estás seguro?",
      `Se eliminará al deportista ${athlete.firstName} ${athlete.lastName}.`,
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" }
    );

    if (!confirmResult.isConfirmed) return;

    await deleteAthlete(athlete.id);
  };

  const handleSaveGuardian = async (newGuardian) => {
    const guardianData = await createGuardian(newGuardian);
    
    if (guardianData) {
      setIsGuardianModalOpen(false);
      
      // Establecer el ID del acudiente recién creado para selección automática
      if (guardianData.id) {
        setNewlyCreatedGuardianId(guardianData.id);
      }
    }
    
    return guardianData;
  };

  const handleUpdateGuardian = async (updatedGuardian) => {
    const { id, ...guardianData } = updatedGuardian;
    const success = await updateGuardian(id, guardianData);
    
    if (success) {
      setIsGuardianModalOpen(false);
      
      // Actualizar la vista del acudiente si estaba abierta
      if (guardianToView && guardianToView.id === id) {
        const updatedGuardianData = await GuardiansService.getGuardianById(id);
        if (updatedGuardianData.success) {
          setGuardianToView(updatedGuardianData.data);
        }
      }
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
    // Obtener los datos más recientes del acudiente
    const currentGuardian = guardians.find(g => g.id === guardian.id) || guardian;
    setGuardianToView(currentGuardian);
    setIsGuardianViewOpen(true);
  };

  const handleDeleteGuardian = async (guardian) => {
    if (!guardian || !guardian.id)
      return showErrorAlert("Error", "Acudiente no válido");

    const confirmResult = await showDeleteAlert(
      "¿Estás seguro?",
      `Se eliminará al acudiente ${guardian.nombreCompleto}.`,
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" }
    );

    if (!confirmResult.isConfirmed) return;

    await deleteGuardian(guardian.id);
  };

  const handleViewInscriptionHistory = (athlete) => {
    if (!athlete || athlete.target) return;
    const currentAthlete = athletes.find(a => a.id === athlete.id) || athlete;
    setAthleteForInscription(currentAthlete);
    setIsInscriptionHistoryModalOpen(true);
  };

  const handleOpenInscriptionManagement = (athlete) => {
    if (!athlete || athlete.target) return;
    const currentAthlete = athletes.find(a => a.id === athlete.id) || athlete;
    setAthleteForInscription(currentAthlete);
    setIsInscriptionManagementOpen(true);
  };

  const handleUpdateAthleteFromManagement = async (updatedAthlete) => {
    try {
      await refresh();
      
      // Actualizar la vista si estaba abierta
      if (athleteForInscription && athleteForInscription.id === updatedAthlete.id) {
        const updatedAthleteData = await AthletesService.getAthleteById(updatedAthlete.id);
        if (updatedAthleteData.success) {
          setAthleteForInscription(updatedAthleteData.data);
        }
      }
      
      // Actualizar GuardianViewModal si estaba abierto
      if (guardianToView && guardianToView.id) {
        setGuardianToView({ ...guardianToView });
      }
    } catch (error) {
      console.error("Error actualizando deportista:", error);
    }
  };

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
              }}
              placeholder="Buscar deportista..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <ReportButton
              data={athletes.map((athlete) => {
                const guardian = getGuardianById(athlete.acudiente);
                return {
                  nombres: athlete.nombres || "",
                  apellidos: athlete.apellidos || "",
                  nombreCompleto: `${athlete.nombres} ${athlete.apellidos}`,
                  tipoDocumento: athlete.tipoDocumento || "",
                  numeroDocumento: athlete.numeroDocumento || "",
                  correo: athlete.correo || "",
                  telefono: athlete.telefono || "",
                  direccion: athlete.direccion || "",
                  ciudad: athlete.ciudad || "",
                  fechaNacimiento: athlete.fechaNacimiento || "",
                  genero: athlete.genero || "",
                  categoria: athlete.categoria || "",
                  estado: athlete.estado || "",
                  estadoInscripcion: athlete.estadoInscripcion || "",
                  acudienteNombre: guardian?.nombreCompleto || "Sin acudiente",
                  acudienteTipoDoc: guardian?.tipoDocumento || "",
                  acudienteDocumento: guardian?.identificacion || "",
                  acudienteTelefono: guardian?.telefono || "",
                  acudienteCorreo: guardian?.correo || "",
                  acudienteDireccion: guardian?.direccion || "",
                  acudienteParentesco: athlete.parentesco || "",
                  fechaInscripcion:
                    athlete.inscripciones?.[0]?.fechaInscripcion || "",
                  categoriaInscripcion:
                    athlete.inscripciones?.[0]?.categoria || "",
                  conceptoInscripcion:
                    athlete.inscripciones?.[0]?.concepto || "",
                };
              })}
              fileName="Deportistas"
              columns={[
                { header: "Nombres", accessor: "nombres" },
                { header: "Apellidos", accessor: "apellidos" },
                { header: "Tipo Documento", accessor: "tipoDocumento" },
                { header: "Número Documento", accessor: "numeroDocumento" },
                { header: "Correo", accessor: "correo" },
                { header: "Teléfono", accessor: "telefono" },
                { header: "Fecha Nacimiento", accessor: "fechaNacimiento" },
                { header: "Categoría", accessor: "categoria" },
                { header: "Estado", accessor: "estado" },
                { header: "Estado Inscripción", accessor: "estadoInscripcion" },
                { header: "Acudiente", accessor: "acudienteNombre" },
                { header: "Tel. Acudiente", accessor: "acudienteTelefono" },
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
                setNewlyCreatedGuardianId(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
            >
              <FaPlus /> Crear Deportista
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="text-center text-gray-500 mt-10 py-8 bg-white rounded-2xl shadow border border-gray-200">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple"></div>
            <p>Cargando deportistas...</p>
          </div>
        </div>
      ) : totalRows > 0 ? (
        <>
          <div className="w-full bg-white rounded-lg">
            <Table
              thead={{
                titles: [
                  "Nombre Completo",
                  "Categoría",
                  "Teléfono",
                  "Acudiente",
                  "Estado Inscripción",
                ],
                state: true,
                actions: true,
              }}
              tbody={{
                data: paginatedData.map((a) => {
                  const guardian = getGuardianById(a.acudiente);

                  return {
                    ...a,
                    nombreCompleto: `${a.nombres} ${a.apellidos}`,
                    acudienteNombre: guardian?.nombreCompleto || "Sin acudiente",
                    estadoInscripcion: a.estadoInscripcion || "",
                  };
                }),
                dataPropertys: [
                  "nombreCompleto",
                  "categoria",
                  "telefono",
                  "acudienteNombre",
                  "estadoInscripcion",
                ],
                state: true,
                stateMap: {
                  Vigente: "bg-green-100 text-green-800",
                  Suspendida: "bg-orange-100 text-orange-800",
                  Vencida: "bg-yellow-100 text-yellow-800",
                },
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              customActions={[
                {
                  onClick: (athlete) => handleOpenInscriptionManagement(athlete),
                  label: <FaClipboardList className="w-4 h-4" />,
                  className:
                    "p-2 text-[#FF9BF8] hover:text-[#E08CE0] rounded transition-colors",
                },
                {
                  onClick: (athlete) => handleViewInscriptionHistory(athlete),
                  label: <FaHistory className="w-4 h-4" />,
                  className:
                    "p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded transition-colors",
                },
              ]}
            />
          </div>
          <div className="mt-4">
            <Pagination
              currentPage={pagination.page}
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
          No hay deportistas registradas todavía.
        </div>
      )}

      {/* Modales */}
      <AthleteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNewlyCreatedGuardianId(null);
        }}
        onSave={handleSave}
        onUpdate={handleUpdate}
        athleteToEdit={athleteToEdit}
        guardians={guardians}
        mode={modalMode}
        newlyCreatedGuardianId={newlyCreatedGuardianId}
        referenceData={referenceData}
        onCreateGuardian={() => {
          setGuardianToEdit(null);
          setGuardianModalMode("create");
          setIsGuardianModalOpen(true);
        }}
        onViewGuardian={(guardian) => {
          if (guardian) {
            setGuardianToView(guardian);
            setIsGuardianViewOpen(true);
          }
        }}
      />

      <AthleteViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        athlete={athleteToView}
        guardian={
          athleteToView
            ? getGuardianById(athleteToView.acudiente)
            : null
        }
      />

      <GuardiansListModal
        isOpen={isGuardiansListOpen}
        onClose={() => setIsGuardiansListOpen(false)}
        guardians={guardians}
        athletes={athletes}
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
        onClose={() => {
          setIsGuardianModalOpen(false);
        }}
        onSave={handleSaveGuardian}
        onUpdate={handleUpdateGuardian}
        guardianToEdit={guardianToEdit}
        mode={guardianModalMode}
        referenceData={{ documentTypes: referenceData.guardianDocumentTypes || [] }}
      />

      <GuardianViewModal
        isOpen={isGuardianViewOpen}
        onClose={() => setIsGuardianViewOpen(false)}
        guardian={guardianToView}
        athletes={athletes.filter((a) => String(a.acudiente) === String(guardianToView?.id))}
      />

      <InscriptionManagementModal
        isOpen={isInscriptionManagementOpen}
        onClose={() => setIsInscriptionManagementOpen(false)}
        athlete={athleteForInscription}
        guardians={guardians}
        onUpdateAthlete={handleUpdateAthleteFromManagement}
      />

      {isInscriptionHistoryModalOpen && athleteForInscription && (
        <InscriptionHistoryModal
          isOpen={isInscriptionHistoryModalOpen}
          onClose={() => setIsInscriptionHistoryModalOpen(false)}
          athlete={athleteForInscription}
          guardians={guardians}
          onUpdateInscription={async (athleteId, updatedArray) => {
            await refresh();
          }}
        />
      )}
    </div>
  );
};

export default Athletes;