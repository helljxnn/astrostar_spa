import { useState, useMemo, useEffect, useRef } from "react";
import { FaPlus, FaHistory, FaUserPlus, FaFilter, FaUpload } from "react-icons/fa";
import AthleteModal from "../AthletesSection/components/AthleteModal.jsx";
import GuardianModal from "../AthletesSection/components/GuardianModal.jsx";
import GuardianViewModal from "../AthletesSection/components/GuardianViewModal.jsx";
import EnrollmentHistoryModal from "./components/EnrollmentHistoryModal.jsx";
import EnrollmentStatusBadge from "./components/EnrollmentStatusBadge.jsx";
import ExpirationIndicator from "./components/ExpirationIndicator.jsx";
import LegacyImportModal from "./components/LegacyImportModal.jsx";

import Table from "../../../../../../../shared/components/Table/table.jsx";
import SearchInput from "../../../../../../../shared/components/SearchInput.jsx";
import ReportButton from "../../../../../../../shared/components/ReportButton.jsx";
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard.jsx";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions.js";
import { useEnrollmentsContext } from "../../../../../../../shared/contexts/EnrollmentsContext.jsx";
import { useReportDataWithService } from "../../../../../../../shared/hooks/useReportData";

import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteAlert,
  showConfirmAlert,
} from "../../../../../../../shared/utils/alerts.js";

import { useEnrollments } from "./hooks/useEnrollments.js";
import EnrollmentsService from "./services/EnrollmentsService.js";
import { PAGINATION_CONFIG } from "../../../../../../../shared/constants/paginationConfig.js";
import {
  extractFullName,
  extractIdentification,
  extractCreationDate,
  extractActivationDate,
  extractExpirationDate,
  mapEnrollmentStatus,
  isEnrollmentExpired
} from "./utils/enrollmentDataExtractor.js";
 
import { 
  ENROLLMENT_TABLE_COLUMNS, 
  ENROLLMENT_DATA_PROPERTIES,
  SEARCH_CONFIG,
  EXPIRATION_FILTERS
} from "./constants/enrollmentConstants.js";

const Enrollments = () => {
  const { hasPermission } = usePermissions();
  const { registerListener } = useEnrollmentsContext();

  // Hook para obtener datos completos para reportes
  const { getReportData } = useReportDataWithService(
    (params) => EnrollmentsService.getAllForReport(params)
  );

  const {
    athletes,
    inscriptions,
    guardians,
    loading,
    pagination,
    referenceData,
    searchFilters,
    createEnrollment,
    updateEnrollment,
    deleteAthlete,
    rejectInscription,
    changePage,
    refresh,
    applyFilters,
    searchGuardians,
    addInscriptionToState,
    updateInscriptionEmailInState,
  } = useEnrollments();

  // Estados de modales
  const [isAthleteModalOpen, setIsAthleteModalOpen] = useState(false);
  const [selectedInscription, setSelectedInscription] = useState(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [isLegacyImportModalOpen, setIsLegacyImportModalOpen] = useState(false);

  // Estados para modales de acudiente
  const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);
  const [isGuardianViewOpen, setIsGuardianViewOpen] = useState(false);
  const [guardianToView, setGuardianToView] = useState(null);
  const [newlyCreatedGuardianId, setNewlyCreatedGuardianId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("matriculas"); // "matriculas", "inscripciones"
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
    vencimiento: EXPIRATION_FILTERS.ALL,
  });
  const rowsPerPage = 10;
  const searchDebounceRef = useRef(null);
  const canAcceptEnrollments = hasPermission("enrollments", "Aceptar");
  const canRejectEnrollments = hasPermission("enrollments", "Rechazar");

  // Búsqueda en backend (nombre/documento) con debounce 400ms
  useEffect(() => {
    if (activeTab !== "matriculas") return;
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      applyFilters(searchTerm, filters.estado, filters.fechaDesde, filters.fechaHasta, filters.vencimiento);
      searchDebounceRef.current = null;
    }, SEARCH_CONFIG.DEBOUNCE_DELAY);
    return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current); };
  }, [activeTab, searchTerm, filters.estado, filters.fechaDesde, filters.fechaHasta, filters.vencimiento, applyFilters]);


  // Auto-refresh optimizado - cada 60 segundos cuando estamos en inscripciones
  useEffect(() => {
    if (activeTab !== "inscripciones") return;

    const interval = setInterval(() => {
      refresh(true, { includeInscriptions: true }); // silent + mantener inscripciones actualizadas
    }, 60000); // 60 segundos - mejor balance entre actualización y rendimiento

    return () => clearInterval(interval);
  }, [activeTab, refresh]);

  // Escuchar notificaciones de nuevas inscripciones y actualizaciones de email
  useEffect(() => {
    const unregister = registerListener({
      onNewInscription: (inscription) => {
        addInscriptionToState(inscription);
      },
      onEmailUpdate: (identification, newEmail) => {
        // Email actualizado en inscripción
        updateInscriptionEmailInState(identification, newEmail);
      },
    });

    return unregister;
  }, [registerListener, addInscriptionToState, updateInscriptionEmailInState]);
  // Matrículas: búsqueda y filtros se hacen en backend (GET /api/enrollments?search=&estado=)
  // Solo filtro local por fecha cuando aplique (opcional)
  const filteredAthletes = useMemo(() => {
    if (activeTab !== "matriculas") return athletes;

    const withDates = athletes.map((item) => {
      // Soportar distintos shapes: item puede ser atleta o matrícula con atleta anidado
      const athlete = item.athlete || item;
      const enrollment =
        item.enrollment ||
        item.latestEnrollment ||
        athlete.matriculas?.[0] ||
        athlete.enrollments?.[0] ||
        athlete.inscripciones?.[0] ||
        null;

      const rawFechaMatricula =
        enrollment?.fechaMatricula ||
        enrollment?.enrollmentDate ||
        enrollment?.fechaInscripcion ||
        enrollment?.createdAt ||
        item.fechaMatricula ||
        item.createdAt ||
        null;

      return {
        ...item,
        _athleteForFilters: athlete,
        _enrollmentForFilters: enrollment,
        _fechaMatriculaRaw: rawFechaMatricula,
      };
    });

    let result = withDates;

    return result;
  }, [athletes, activeTab, filters.fechaDesde, filters.fechaHasta, filters.vencimiento]);

  // Filtrar inscripciones
  const filteredInscriptions = useMemo(() => {
    if (!searchTerm) return inscriptions;

    const searchLower = searchTerm.toLowerCase().trim();

    return inscriptions.filter((inscription) => {
      const formatDateVariants = (value) => {
        if (!value) return [];
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return [];
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const dd = String(day).padStart(2, "0");
        const mm = String(month).padStart(2, "0");
        return [
          `${day}/${month}/${year}`,
          `${dd}/${mm}/${year}`,
          date.toLocaleDateString("es-CO"),
        ];
      };

      const createdAtVariants = formatDateVariants(
        inscription.fechaInscripcion || inscription.fechaPreRegistro || inscription.createdAt
      );
      const birthDateVariants = formatDateVariants(
        inscription.birthDate || inscription.fechaNacimiento
      );

      const textFields = [
        inscription.firstName,
        inscription.middleName,
        inscription.lastName,
        inscription.secondLastName,
        inscription.email,
        inscription.identification,
        inscription.phoneNumber,
        inscription.status,
        inscription.estado,
        inscription.createdAt,
        ...createdAtVariants,
        ...birthDateVariants,
      ];

      return textFields.some(
        (field) => field && String(field).toLowerCase().includes(searchLower),
      );
    });
  }, [inscriptions, searchTerm]);

  // Matrículas: backend pagina; inscripciones: filtrado local
  const currentData = activeTab === "matriculas" ? filteredAthletes : filteredInscriptions;
  const totalRows = activeTab === "matriculas" ? pagination.total : currentData.length;
  const startIndex = (pagination.page - 1) * PAGINATION_CONFIG.ROWS_PER_PAGE;
  const paginatedData = activeTab === "matriculas"
    ? currentData
    : currentData.slice(startIndex, startIndex + PAGINATION_CONFIG.ROWS_PER_PAGE);

  const getGuardianById = (guardianId) => {
    return guardians.find((g) => String(g.id) === String(guardianId));
  };

  // Función para obtener datos completos del reporte
  const getCompleteReportData = async () => {
    return await getReportData(
      {
        search: searchTerm,
        estado: filters.estado,
        dateFrom: filters.fechaDesde,
        dateTo: filters.fechaHasta,
        vencimiento: filters.vencimiento,
      },
      (data) => data.map(item => ({
        deportista: `${item.athlete?.user?.firstName || ''} ${item.athlete?.user?.lastName || ''}`.trim(),
        documento: item.athlete?.user?.identification || '',
        estadoMatricula: item.estado || '',
        fechaInicio: item.fechaInicio ? new Date(item.fechaInicio).toLocaleDateString('es-ES') : '',
        fechaVencimiento: item.fechaVencimiento ? new Date(item.fechaVencimiento).toLocaleDateString('es-ES') : '',
        fechaCreacion: item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-ES') : '',
      }))
    );
  };

  // Crear matrícula desde cero (sin inscripción previa)
  const handleCreateFromScratch = () => {
    if (!canAcceptEnrollments) {
      showErrorAlert("Sin permisos", "No tienes permisos para aceptar inscripciones.");
      return;
    }
    setSelectedInscription(null);
    setIsAthleteModalOpen(true);
  };

  // Seleccionar inscripción y abrir formulario
  const handleSelectInscription = (inscription) => {
    if (!canAcceptEnrollments) {
      showErrorAlert("Sin permisos", "No tienes permisos para aceptar inscripciones.");
      return;
    }
    setSelectedInscription(inscription);
    setIsAthleteModalOpen(true);
  };

  // Guardar matrícula (crear deportista + matrícula)
  const handleSaveEnrollment = async (athleteData) => {
    // El backend ya NO valida la categoría cuando viene de matrícula
    // Enviar los datos tal como vienen
    const result = await createEnrollment(athleteData, selectedInscription?.id);

    if (result) {
      setIsAthleteModalOpen(false);
      setSelectedInscription(null);

      // No mostramos el modal de credenciales, solo el sweet alert que ya se muestra en el hook
    }
  };

  // Ver historial
  const handleOpenHistory = (athlete) => {
    if (!athlete || athlete.target) return;
    const currentAthlete = athletes.find((a) => a.id === athlete.id) || athlete;
    setSelectedAthlete(currentAthlete);
    setIsHistoryModalOpen(true);
  };


  return (
    <div className="p-4 sm:p-6 font-montserrat w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 whitespace-nowrap">
          Gestión de Matrículas
        </h1>

        <div className="flex flex-col sm:flex-row sm:flex-wrap xl:flex-nowrap items-stretch sm:items-center gap-3 w-full xl:w-auto xl:max-w-[70%] xl:justify-end">
          <div className="w-full sm:w-72 xl:flex-shrink-0">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === "matriculas"
                  ? SEARCH_CONFIG.PLACEHOLDER_ENROLLMENTS
                  : SEARCH_CONFIG.PLACEHOLDER_INSCRIPTIONS
              }
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto xl:justify-end">
            {/* Botón de Filtros */}
            {activeTab === "matriculas" && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                  showFilters
                    ? "bg-primary-blue text-white border-primary-blue"
                    : "border-gray-300 text-gray-700 hover:border-primary-blue hover:text-primary-blue"
                }`}
              >
                <FaFilter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
              </button>
            )}

            {/* Botón de Reporte para Matrículas */}
            {activeTab === "matriculas" && (
              <PermissionGuard module="enrollments" action="Ver">
                <ReportButton
                  dataProvider={getCompleteReportData}
                  fileName="matriculas"
                  columns={[
                    { header: 'Deportista', accessor: 'deportista' },
                    { header: 'Documento', accessor: 'documento' },
                    { header: 'Estado', accessor: 'estadoMatricula' },
                    { header: 'Fecha Inicio', accessor: 'fechaInicio' },
                    { header: 'Fecha Vencimiento', accessor: 'fechaVencimiento' },
                    { header: 'Fecha Creación', accessor: 'fechaCreacion' },
                  ]}
                />
              </PermissionGuard>
            )}

            {activeTab === "matriculas" && (
              <PermissionGuard module="enrollments" action="Aceptar">
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setIsLegacyImportModalOpen(true)}
                    className="flex items-center justify-center w-11 h-11 bg-emerald-200 text-emerald-950 rounded-lg shadow hover:bg-emerald-300 transition-colors"
                    title="Cargar archivo para registrar deportistas de forma masiva"
                    aria-label="Migración masiva"
                  >
                    <FaUpload className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCreateFromScratch}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-purple text-white rounded-lg shadow hover:bg-primary-blue transition-colors whitespace-nowrap"
                    title="Crear matrícula desde cero"
                  >
                    <FaPlus /> Nueva Matrícula
                  </button>
                </div>
              </PermissionGuard>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setActiveTab("matriculas");
              setSearchTerm("");
              setFilters(prev => ({ ...prev, vencimiento: EXPIRATION_FILTERS.ALL }));
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "matriculas"
                ? "bg-primary-purple/10 text-primary-purple"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Matrículas</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("inscripciones");
              setSearchTerm("");
              setFilters(prev => ({ ...prev, vencimiento: EXPIRATION_FILTERS.ALL }));
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 relative whitespace-nowrap ${
              activeTab === "inscripciones"
                ? "bg-primary-blue/10 text-primary-blue"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span>Inscripciones</span>
            {inscriptions.length > 0 && activeTab !== "inscripciones" ? (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {inscriptions.length}
              </span>
            ) : (
              <span
                className={`px-1.5 py-0.5 rounded-md text-xs font-medium ${
                  activeTab === "inscripciones"
                    ? "bg-primary-blue text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {inscriptions.length}
              </span>
            )}
          </button>

        </div>
      </div>

      {/* Panel de Filtros - Estados actualizados */}
      {showFilters && activeTab === "matriculas" && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
            <button
              onClick={() => {
                setFilters({
                  estado: '',
                  fechaDesde: '',
                  fechaHasta: '',
                  vencimiento: EXPIRATION_FILTERS.ALL,
                });
                setShowFilters(false);
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Limpiar filtros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Filtro por Estado - Solo 3 estados */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de Matrícula
              </label>
              <select
                value={filters.estado}
                onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="Pending_Payment">Pendiente de Pago</option>
                <option value="Vigente">Vigente</option>
                <option value="Vencida">Vencida</option>
              </select>
            </div>

            {/* Filtro por Vencimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de Vencimiento
              </label>
              <select
                value={filters.vencimiento}
                onChange={(e) => setFilters({ ...filters, vencimiento: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-colors"
              >
                <option value={EXPIRATION_FILTERS.ALL}>Todas las matriculas</option>
                <option value={EXPIRATION_FILTERS.EXPIRING}>Proximas a vencer</option>
              </select>
            </div>

            {/* Filtro por Fecha Desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desde
              </label>
              <input
                type="date"
                value={filters.fechaDesde}
                onChange={(e) => setFilters({ ...filters, fechaDesde: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              />
            </div>

            {/* Filtro por Fecha Hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasta
              </label>
              <input
                type="date"
                value={filters.fechaHasta}
                onChange={(e) => setFilters({ ...filters, fechaHasta: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              />
            </div>
          </div>

        </div>
      )}
      {/* Contenido según tab activo */}
      {totalRows > 0 ? (
        <>
          <div className="w-full bg-white rounded-lg">
            {activeTab === "matriculas" ? (
              <Table
                serverPagination={true}
                totalRows={pagination.total}
                currentPage={pagination.page}
                onPageChange={changePage}
                rowsPerPage={PAGINATION_CONFIG.ROWS_PER_PAGE}
                thead={{
                  titles: ENROLLMENT_TABLE_COLUMNS,
                  state: false,
                  actions: true,
                }}
                tbody={{
                  data: paginatedData.map((row) => {
                    // Extraer datos de diferentes fuentes con fallbacks
                    const athlete = row.athlete || row._athleteForFilters || row;
                    const user = athlete.user || row.user || {};
                    const guardianId = athlete.acudiente || row.acudiente;
                    const guardian = guardianId ? getGuardianById(guardianId) : null;

                    // Obtener la matrícula asociada
                    const latestEnrollment =
                      row.enrollment ||
                      row.latestEnrollment ||
                      athlete.matriculas?.[0] ||
                      athlete.enrollments?.[0] ||
                      athlete.inscripciones?.[0] ||
                      null;

                    // Usar utilidades para extraer datos de forma consistente
                    const nombreCompleto = extractFullName(athlete, user, row);
                    const numeroDocumento = extractIdentification(athlete, user, row);
                    const fechaActivacion = extractActivationDate(latestEnrollment);
                    
                    // Obtener estado y procesar fecha de vencimiento
                    const rawEnrollmentStatus = latestEnrollment?.status || latestEnrollment?.estado;
                    const fechaVencimiento = extractExpirationDate(latestEnrollment, rawEnrollmentStatus);
                    const estadoMatricula = mapEnrollmentStatus(rawEnrollmentStatus);
                    const isVencida = isEnrollmentExpired(latestEnrollment);

                    // Guardar fecha de creación para el modal de detalles
                    const fechaCreacion = extractCreationDate(latestEnrollment, row);

                    return {
                      ...row,
                      nombreCompleto,
                      numeroDocumento,
                      fechaActivacion,
                      estadoMatricula,
                      fechaVencimiento,
                      fechaCreacion, // Para usar en el modal de detalles
                      latestEnrollment,
                      isVencida,
                    };
                  }),
                  dataPropertys: ENROLLMENT_DATA_PROPERTIES,
                  state: false,
                  customRenderers: {
                    nombreCompleto: (value, row) => {
                      return (
                        <div className="text-left pl-4">
                          <span className="text-gray-900">
                            {value}
                          </span>
                        </div>
                      );
                    },
                    estadoMatricula: (value, row) => {
                      const rawStatus = row.latestEnrollment?.status || row.latestEnrollment?.estado;
                      return (
                        <div className="text-left pl-4">
                          <EnrollmentStatusBadge 
                            status={rawStatus} 
                            label={value}
                          />
                        </div>
                      );
                    },
                    fechaVencimiento: (value, row) => {
                      const latestEnrollment = row.latestEnrollment;
                      const rawStatus = latestEnrollment?.status || latestEnrollment?.estado;
                      const expirationDate = latestEnrollment?.fechaVencimiento;

                      return (
                        <ExpirationIndicator
                          expirationDate={expirationDate}
                          enrollmentStatus={rawStatus}
                          showIcon={false}
                        />
                      );
                    },
                  },
                }}
                buttonConfig={{
                  delete: () => ({
                    show: false, // Nunca mostrar botón de eliminar - protección implementada
                  }),
                }}
                customActions={[
                  {
                    onClick: (athlete) => handleOpenHistory(athlete),
                    label: <FaHistory />,
                    className:
                      "p-2 rounded-full bg-primary-purple/10 text-primary-purple hover:bg-primary-purple hover:text-white transition-colors",
                    tooltip: "Historial de Matrículas",
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
                    if (inscription.birthDate) {
                      try {
                        // Si viene en formato YYYY-MM-DD, formatear directamente
                        if (
                          typeof inscription.birthDate === "string" &&
                          /^\d{4}-\d{2}-\d{2}/.test(inscription.birthDate)
                        ) {
                          const [year, month, day] = inscription.birthDate
                            .split("T")[0]
                            .split("-");
                          fechaNacimientoDisplay = `${day}/${month}/${year}`;
                        } else {
                          const date = new Date(inscription.birthDate);
                          if (!isNaN(date.getTime())) {
                            fechaNacimientoDisplay =
                              date.toLocaleDateString("es-ES");
                          }
                        }
                      } catch (e) {
                        fechaNacimientoDisplay = "Fecha inválida";
                      }
                    }

                    // Formatear fecha de inscripción de forma segura
                    let fechaInscripcionDisplay = "Fecha inválida";
                    const inscriptionDate =
                      inscription.fechaPreRegistro || inscription.createdAt;
                    if (inscriptionDate) {
                      const date = new Date(inscriptionDate);
                      if (!isNaN(date.getTime())) {
                        fechaInscripcionDisplay =
                          date.toLocaleDateString("es-ES");
                      }
                    }

                    // Construir nombre completo desde los campos separados
                    const firstName = inscription.firstName || "";
                    const middleName = inscription.middleName || "";
                    const lastName = inscription.lastName || "";
                    const secondLastName = inscription.secondLastName || "";
                    const nombreCompleto =
                      `${firstName} ${middleName} ${lastName} ${secondLastName}`
                        .replace(/\s+/g, " ")
                        .trim();

                    return {
                      ...inscription,
                      nombreCompleto: nombreCompleto || "Sin nombre",
                      documento: inscription.identification || "Sin documento",
                      telefono: inscription.phoneNumber || "Sin teléfono",
                      correo: inscription.email || "Sin correo",
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
                  cellClassNames: {
                    nombreCompleto:
                      "whitespace-normal break-words align-top max-w-[14rem]",
                    documento:
                      "whitespace-normal break-all align-top max-w-[8rem]",
                    fechaNacimientoDisplay:
                      "whitespace-normal align-top text-center",
                    telefono:
                      "whitespace-normal break-all align-top max-w-[8rem]",
                    correo:
                      "whitespace-normal break-all align-top max-w-[14rem]",
                    fechaInscripcionDisplay:
                      "whitespace-normal align-top text-center",
                  },
                }}
                customActions={[
                  {
                    onClick: (inscription) =>
                      handleSelectInscription(inscription),
                    label: <FaUserPlus className="w-4 h-4" />,
                    className:
                      "p-2 text-primary-blue hover:text-primary-purple rounded transition-colors",
                    title: "Matricular",
                    show: (inscription) => {
                      if (!canAcceptEnrollments) return false;
                      const estado = (inscription.estado || inscription.status || "").toUpperCase();
                      // Aceptar tanto inglés como español
                      return estado !== "PROCESADA" && estado !== "PROCESSED" && 
                             estado !== "RECHAZADA" && estado !== "REJECTED";
                    },
                  },
                  {
                    onClick: async (inscription) => {
                      const fullName =
                        `${inscription.firstName || ""} ${inscription.middleName || ""} ${inscription.lastName || ""} ${inscription.secondLastName || ""}`
                          .replace(/\s+/g, " ")
                          .trim();
                      const result = await showConfirmAlert(
                        "¿Rechazar inscripción?",
                        `¿Estás seguro de rechazar la inscripción de ${fullName}?`,
                        {
                          confirmButtonText: "Sí, rechazar",
                          cancelButtonText: "Cancelar",
                        },
                      );
                      if (result.isConfirmed) {
                        await rejectInscription(inscription.id);
                      }
                    },
                    label: "✕",
                    className:
                      "p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors font-bold",
                    title: "Rechazar",
                    show: () => canRejectEnrollments,
                  },
                ]}
                enableHorizontalScroll={false}
                desktopBreakpoint="lg"
                tableClassName="table-fixed"
              />
            )}
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 mt-10 py-8 bg-white rounded-2xl shadow border border-gray-200">
          {activeTab === "matriculas"
            ? "No hay matrículas registradas todavía."
            : "No hay inscripciones pendientes"}
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
        athletes={athletes}
        mode="create"
        referenceData={referenceData}
        isEnrollmentMode={true}
        newlyCreatedGuardianId={newlyCreatedGuardianId}
        loadGuardians={() => searchGuardians("")}
        onCreateGuardian={() => {
          setIsGuardianModalOpen(true);
        }}
        onViewGuardian={(guardian) => {
          if (guardian) {
            setGuardianToView(guardian);
            setIsGuardianViewOpen(true);
          }
        }}
        onDeleteGuardian={async (guardian) => {
          if (!guardian || !guardian.id) {
            return showErrorAlert("Error", "Acudiente no válido");
          }

          const GuardiansService = (
            await import("../AthletesSection/services/GuardiansService.js")
          ).default;
          const result = await GuardiansService.deleteGuardian(guardian.id);

          if (result.success) {
            await searchGuardians(""); // Recargar lista de acudientes
            showSuccessAlert(
              "Acudiente eliminado",
              "El acudiente ha sido eliminado correctamente",
            );
            return true;
          } else {
            showErrorAlert(
              "Error",
              result.error || "No se pudo eliminar el acudiente",
            );
            return false;
          }
        }}
      />

      <GuardianModal
        isOpen={isGuardianModalOpen}
        onClose={() => {
          setIsGuardianModalOpen(false);
        }}
        onSave={async (guardianData) => {
          const GuardiansService = (
            await import("../AthletesSection/services/GuardiansService.js")
          ).default;
          const result = await GuardiansService.createGuardian(guardianData);
          if (result.success) {
            setNewlyCreatedGuardianId(result.data.id);
            await searchGuardians(""); // Recargar lista de acudientes
            setIsGuardianModalOpen(false);
            showSuccessAlert(
              "Acudiente creado",
              "El acudiente ha sido creado exitosamente",
            );
            return true; // ✅ Retornar true para que el modal sepa que fue exitoso
          } else {
            showErrorAlert(
              "Error",
              result.error || "No se pudo crear el acudiente",
            );
            return false; // ✅ Retornar false en caso de error
          }
        }}
        mode="create"
        referenceData={{
          documentTypes: referenceData.guardianDocumentTypes || [],
        }}
      />

      <GuardianViewModal
        isOpen={isGuardianViewOpen}
        onClose={() => setIsGuardianViewOpen(false)}
        guardian={guardianToView}
        currentAthleteId={guardianToView?.currentAthleteId}
        athletes={athletes.filter((a) => {
          // Buscar por ID del acudiente O por nombre del acudiente
          const matchById = String(a.acudiente) === String(guardianToView?.id);
          const matchByName = String(a.acudiente) === String(guardianToView?.nombreCompleto);
          const matchByGuardianId = a.guardianId === guardianToView?.id;
          
          return matchById || matchByName || matchByGuardianId;
        })}
        referenceData={{
          documentTypes: referenceData.guardianDocumentTypes || [],
        }}
      />



      {isHistoryModalOpen && selectedAthlete && (
        <EnrollmentHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => {
            setIsHistoryModalOpen(false);
            setSelectedAthlete(null);
          }}
          athlete={selectedAthlete}
          guardians={guardians}
        />
      )}

      <LegacyImportModal
        isOpen={isLegacyImportModalOpen}
        onClose={() => setIsLegacyImportModalOpen(false)}
        referenceData={referenceData}
        onImported={async () => {
          await refresh();
        }}
      />
    </div>
  );
};

export default Enrollments;
