import { useState, useMemo, useEffect } from "react";
import {
  FaPlus,
  FaClipboardList,
  FaHistory,
  FaUserPlus,
} from "react-icons/fa";
import AthleteModal from "../AthletesSection/components/AthleteModal.jsx";
import GuardianModal from "../AthletesSection/components/GuardianModal.jsx";
import GuardianViewModal from "../AthletesSection/components/GuardianViewModal.jsx";
import EnrollmentManagementModal from "./components/EnrollmentManagementModal.jsx";
import EnrollmentHistoryModal from "./components/EnrollmentHistoryModal.jsx";

import Table from "../../../../../../../shared/components/Table/table.jsx";
import Pagination from "../../../../../../../shared/components/Table/Pagination.jsx";
import SearchInput from "../../../../../../../shared/components/SearchInput.jsx";
import ReportButton from "../../../../../../../shared/components/ReportButton.jsx";
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard.jsx";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions.js";

import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteAlert,
  showConfirmAlert,
} from "../../../../../../../shared/utils/alerts.js";

import { useEnrollments } from "./hooks/useEnrollments.js";

const Enrollments = () => {
  const { hasPermission } = usePermissions();

  const {
    athletes,
    inscriptions,
    guardians,
    loading,
    pagination,
    referenceData,
    createEnrollment,
    updateEnrollment,
    deleteAthlete,
    rejectInscription,
    changePage,
    refresh,
    searchGuardians,
  } = useEnrollments();

  // Estados de modales
  const [isAthleteModalOpen, setIsAthleteModalOpen] = useState(false);
  const [selectedInscription, setSelectedInscription] = useState(null);

  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  // Estados para modales de acudiente
  const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);
  const [isGuardianViewOpen, setIsGuardianViewOpen] = useState(false);
  const [guardianToView, setGuardianToView] = useState(null);
  const [newlyCreatedGuardianId, setNewlyCreatedGuardianId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("matriculas"); // "matriculas" o "inscripciones"
  const rowsPerPage = 10;

  // Auto-refresh cada 3 segundos cuando estamos en la pestaña de inscripciones
  useEffect(() => {
    if (activeTab !== "inscripciones") return;

    const interval = setInterval(() => {
      console.log("🔄 Auto-refresh silencioso de inscripciones...");
      refresh(true); // true = silent mode
    }, 3000); // 3 segundos para actualizaciones prácticamente instantáneas

    return () => clearInterval(interval);
  }, [activeTab, refresh]);

  // Filtrar matrículas
  const filteredAthletes = useMemo(() => {
    if (!searchTerm) return athletes;

    const searchLower = searchTerm.toLowerCase().trim();

    return athletes.filter((athlete) => {
      const textFields = [
        athlete.firstName,
        athlete.lastName,
        athlete.nombres,
        athlete.apellidos,
        athlete.email,
        athlete.correo,
        athlete.identification,
        athlete.numeroDocumento,
        athlete.categoria,
      ];

      return textFields.some(
        (field) => field && String(field).toLowerCase().includes(searchLower)
      );
    });
  }, [athletes, searchTerm]);

  // Filtrar inscripciones
  const filteredInscriptions = useMemo(() => {
    if (!searchTerm) return inscriptions;

    const searchLower = searchTerm.toLowerCase().trim();

    return inscriptions.filter((inscription) => {
      const textFields = [
        inscription.nombres,
        inscription.apellidos,
        inscription.correo,
        inscription.numeroDocumento,
        inscription.telefono,
      ];

      return textFields.some(
        (field) => field && String(field).toLowerCase().includes(searchLower)
      );
    });
  }, [inscriptions, searchTerm]);

  // Datos según el tab activo
  const currentData = activeTab === "matriculas" ? filteredAthletes : filteredInscriptions;
  const totalRows = currentData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (pagination.page - 1) * rowsPerPage;
  const paginatedData = currentData.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (page) => changePage(page);

  const getGuardianById = (guardianId) => {
    return guardians.find((g) => String(g.id) === String(guardianId));
  };

  // Crear matrícula desde cero (sin inscripción previa)
  const handleCreateFromScratch = () => {
    setSelectedInscription(null);
    setIsAthleteModalOpen(true);
  };

  // Seleccionar inscripción y abrir formulario
  const handleSelectInscription = (inscription) => {
    setSelectedInscription(inscription);
    setIsAthleteModalOpen(true);
  };

  // Guardar matrícula (crear deportista + matrícula)
  const handleSaveEnrollment = async (athleteData) => {
    const result = await createEnrollment(
      athleteData,
      selectedInscription?.id
    );

    if (result) {
      setIsAthleteModalOpen(false);
      setSelectedInscription(null);
    }
  };

  // Gestionar matrícula
  const handleOpenManagement = (athlete) => {
    if (!athlete || athlete.target) return;
    const currentAthlete = athletes.find((a) => a.id === athlete.id) || athlete;
    setSelectedAthlete(currentAthlete);
    setIsManagementModalOpen(true);
  };

  // Ver historial
  const handleOpenHistory = (athlete) => {
    if (!athlete || athlete.target) return;
    const currentAthlete = athletes.find((a) => a.id === athlete.id) || athlete;
    setSelectedAthlete(currentAthlete);
    setIsHistoryModalOpen(true);
  };

  // Actualizar desde gestión
  const handleUpdateFromManagement = async (updatedAthlete) => {
    await refresh();

    if (selectedAthlete && selectedAthlete.id === updatedAthlete.id) {
      const updated = athletes.find((a) => a.id === updatedAthlete.id);
      if (updated) {
        setSelectedAthlete(updated);
      }
    }
  };

  // Eliminar deportista
  const handleDelete = async (athlete) => {
    if (!hasPermission("enrollments", "Eliminar")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para eliminar matrículas"
      );
      return;
    }

    if (!athlete || !athlete.id) {
      return showErrorAlert("Error", "Deportista no válida");
    }

    const confirmResult = await showDeleteAlert(
      "¿Estás seguro?",
      `Se eliminará la matrícula de ${athlete.firstName || athlete.nombres} ${
        athlete.lastName || athlete.apellidos
      }.`,
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" }
    );

    if (!confirmResult.isConfirmed) return;

    await deleteAthlete(athlete.id);
  };

  return (
    <div className="p-6 font-questrial w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Matrículas</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === "matriculas"
                  ? "Buscar deportista..."
                  : "Buscar inscripción..."
              }
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <PermissionGuard module="enrollments" action="Ver">
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
                    categoria: athlete.categoria || "",
                    estado: athlete.estado || "",
                    estadoMatricula: athlete.estadoInscripcion || "",
                    acudienteNombre: guardian?.nombreCompleto || "Sin acudiente",
                    acudienteTelefono: guardian?.telefono || "",
                  };
                })}
                fileName="Matriculas"
                columns={[
                  { header: "Nombres", accessor: "nombres" },
                  { header: "Apellidos", accessor: "apellidos" },
                  { header: "Tipo Documento", accessor: "tipoDocumento" },
                  { header: "Número Documento", accessor: "numeroDocumento" },
                  { header: "Categoría", accessor: "categoria" },
                  { header: "Estado Matrícula", accessor: "estadoMatricula" },
                  { header: "Acudiente", accessor: "acudienteNombre" },
                ]}
              />
            </PermissionGuard>

            <PermissionGuard module="enrollments" action="Crear">
              <button
                onClick={handleCreateFromScratch}
                className="flex items-center gap-2 px-4 py-2 bg-primary-purple text-white rounded-lg shadow hover:bg-primary-blue transition-colors"
                title="Crear matrícula desde cero"
              >
                <FaPlus /> Nueva Matrícula
              </button>
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="inline-flex gap-2">
          <button
            onClick={() => {
              setActiveTab("matriculas");
              setSearchTerm("");
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === "matriculas"
                ? "bg-primary-purple/10 text-primary-purple"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Matrículas</span>
            <span className={`px-1.5 py-0.5 rounded-md text-xs font-medium ${
              activeTab === "matriculas"
                ? "bg-primary-purple text-white"
                : "bg-gray-200 text-gray-600"
            }`}>
              {athletes.length}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab("inscripciones");
              setSearchTerm("");
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 relative ${
              activeTab === "inscripciones"
                ? "bg-primary-blue/10 text-primary-blue"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Inscripciones</span>
            {inscriptions.length > 0 && activeTab !== "inscripciones" ? (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {inscriptions.length}
              </span>
            ) : (
              <span className={`px-1.5 py-0.5 rounded-md text-xs font-medium ${
                activeTab === "inscripciones"
                  ? "bg-primary-blue text-white"
                  : "bg-gray-200 text-gray-600"
              }`}>
                {inscriptions.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Contenido según tab activo */}
      {loading ? (
        <div className="text-center text-gray-500 mt-10 py-8 bg-white rounded-2xl shadow border border-gray-200">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple"></div>
            <p>Cargando matrículas...</p>
          </div>
        </div>
      ) : totalRows > 0 ? (
        <>
          <div className="w-full bg-white rounded-lg">
            {activeTab === "matriculas" ? (
              <Table
                thead={{
                  titles: [
                    "Nombre Completo",
                    "Categoría",
                    "Teléfono",
                    "Acudiente",
                    "Estado Matrícula",
                  ],
                  state: true,
                  actions: true,
                }}
                tbody={{
                  data: paginatedData.map((a) => {
                    const guardian = getGuardianById(a.acudiente);

                    const firstName = a.firstName || a.nombres || "";
                    const lastName = a.lastName || a.apellidos || "";

                    return {
                      ...a,
                      nombreCompleto:
                        `${firstName} ${lastName}`.trim() || "Sin nombre",
                      telefono: a.phoneNumber || a.telefono || "Sin teléfono",
                      acudienteNombre:
                        guardian?.nombreCompleto || "Sin acudiente",
                      estadoMatricula: a.estadoInscripcion || "",
                    };
                  }),
                  dataPropertys: [
                    "nombreCompleto",
                    "categoria",
                    "telefono",
                    "acudienteNombre",
                    "estadoMatricula",
                  ],
                  state: true,
                  stateMap: {
                    Vigente: "bg-green-100 text-green-800",
                    Suspendida: "bg-orange-100 text-orange-800",
                    Vencida: "bg-yellow-100 text-yellow-800",
                  },
                  customRenderers: {
                    estadoMatricula: (value) => {
                      return (
                        <div className="text-center">
                          <span className="text-gray-700">
                            {value || "Sin estado"}
                          </span>
                        </div>
                      );
                    },
                  },
                }}
                onDelete={
                  hasPermission("enrollments", "Eliminar") ? handleDelete : null
                }
                buttonConfig={{
                  delete: (item) => ({
                    show: hasPermission("enrollments", "Eliminar"),
                  }),
                }}
              customActions={[
                {
                  onClick: (athlete) => handleOpenManagement(athlete),
                  label: <FaClipboardList className="w-4 h-4" />,
                  className:
                    "p-2 text-[#FF9BF8] hover:text-[#E08CE0] rounded transition-colors",
                  title: "Gestionar Matrícula",
                },
                {
                  onClick: (athlete) => handleOpenHistory(athlete),
                  label: <FaHistory className="w-4 h-4" />,
                  className:
                    "p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded transition-colors",
                  title: "Historial de Matrículas",
                },
              ]}
              />
            ) : (
              <Table
                thead={{
                  titles: [
                    "Nombre Completo",
                    "Documento",
                    "Fecha Nacimiento",
                    "Teléfono",
                    "Correo",
                    "Fecha Inscripción",
                  ],
                  state: false,
                  actions: true,
                }}
                tbody={{
                  data: paginatedData.map((inscription) => {
                    // Formatear fecha de nacimiento de forma segura (sin problemas de zona horaria)
                    let fechaNacimientoDisplay = "Fecha inválida";
                    if (inscription.fechaNacimiento) {
                      try {
                        // Si viene en formato YYYY-MM-DD, formatear directamente
                        if (typeof inscription.fechaNacimiento === 'string' && /^\d{4}-\d{2}-\d{2}/.test(inscription.fechaNacimiento)) {
                          const [year, month, day] = inscription.fechaNacimiento.split('T')[0].split('-');
                          fechaNacimientoDisplay = `${day}/${month}/${year}`;
                        } else {
                          const date = new Date(inscription.fechaNacimiento);
                          if (!isNaN(date.getTime())) {
                            fechaNacimientoDisplay = date.toLocaleDateString("es-ES");
                          }
                        }
                      } catch (e) {
                        fechaNacimientoDisplay = "Fecha inválida";
                      }
                    }

                    // Formatear fecha de inscripción de forma segura
                    let fechaInscripcionDisplay = "Fecha inválida";
                    const inscriptionDate = inscription.fechaPreRegistro || inscription.createdAt;
                    if (inscriptionDate) {
                      const date = new Date(inscriptionDate);
                      if (!isNaN(date.getTime())) {
                        fechaInscripcionDisplay = date.toLocaleDateString("es-ES");
                      }
                    }

                    return {
                      ...inscription,
                      nombreCompleto: `${inscription.nombres} ${inscription.apellidos}`,
                      documento: inscription.numeroDocumento || "Sin documento",
                      fechaNacimientoDisplay,
                      fechaInscripcionDisplay,
                    };
                  }),
                  dataPropertys: [
                    "nombreCompleto",
                    "documento",
                    "fechaNacimientoDisplay",
                    "telefono",
                    "correo",
                    "fechaInscripcionDisplay",
                  ],
                  state: false,
                }}
                customActions={[
                  {
                    onClick: (inscription) => handleSelectInscription(inscription),
                    label: <FaUserPlus className="w-4 h-4" />,
                    className:
                      "p-2 text-primary-blue hover:text-primary-purple rounded transition-colors",
                    title: "Matricular",
                  },
                  {
                    onClick: async (inscription) => {
                      const result = await showConfirmAlert(
                        "¿Rechazar inscripción?",
                        `¿Estás seguro de rechazar la inscripción de ${inscription.nombres} ${inscription.apellidos}?`,
                        { confirmButtonText: "Sí, rechazar", cancelButtonText: "Cancelar" }
                      );
                      if (result.isConfirmed) {
                        await rejectInscription(inscription.id);
                      }
                    },
                    label: "✕",
                    className:
                      "p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors font-bold",
                    title: "Rechazar",
                  },
                ]}
              />
            )}
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
          {activeTab === "matriculas" 
            ? "No hay matrículas registradas todavía."
            : "No hay inscripciones pendientes del landing."}
        </div>
      )}

      {/* Modales */}
      <AthleteModal
        isOpen={isAthleteModalOpen}
        onClose={() => {
          setIsAthleteModalOpen(false);
          setSelectedInscription(null);
          setNewlyCreatedGuardianId(null);
        }}
        onSave={handleSaveEnrollment}
        athleteToEdit={selectedInscription}
        guardians={guardians}
        mode="create"
        referenceData={referenceData}
        isEnrollmentMode={true}
        newlyCreatedGuardianId={newlyCreatedGuardianId}
        onCreateGuardian={() => {
          setIsGuardianModalOpen(true);
        }}
        onViewGuardian={(guardian) => {
          if (guardian) {
            setGuardianToView(guardian);
            setIsGuardianViewOpen(true);
          }
        }}
      />

      <GuardianModal
        isOpen={isGuardianModalOpen}
        onClose={() => {
          setIsGuardianModalOpen(false);
        }}
        onSave={async (guardianData) => {
          const GuardiansService = (await import("../AthletesSection/services/GuardiansService.js")).default;
          const result = await GuardiansService.create(guardianData);
          if (result.success) {
            setNewlyCreatedGuardianId(result.data.id);
            await searchGuardians(""); // Recargar lista de acudientes
            setIsGuardianModalOpen(false);
            showSuccessAlert("Acudiente creado", "El acudiente ha sido creado exitosamente");
          } else {
            showErrorAlert("Error", result.error || "No se pudo crear el acudiente");
          }
        }}
        mode="create"
        referenceData={{ documentTypes: referenceData.guardianDocumentTypes || [] }}
      />

      <GuardianViewModal
        isOpen={isGuardianViewOpen}
        onClose={() => setIsGuardianViewOpen(false)}
        guardian={guardianToView}
        athletes={athletes.filter((a) => String(a.acudiente) === String(guardianToView?.id))}
        referenceData={{ documentTypes: referenceData.guardianDocumentTypes || [] }}
      />

      <EnrollmentManagementModal
        isOpen={isManagementModalOpen}
        onClose={() => setIsManagementModalOpen(false)}
        athlete={selectedAthlete}
        guardians={guardians}
        onUpdateAthlete={handleUpdateFromManagement}
      />

      {isHistoryModalOpen && selectedAthlete && (
        <EnrollmentHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          athlete={selectedAthlete}
          guardians={guardians}
        />
      )}
    </div>
  );
};

export default Enrollments;
