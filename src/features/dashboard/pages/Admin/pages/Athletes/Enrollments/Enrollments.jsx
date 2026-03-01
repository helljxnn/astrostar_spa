import { useState, useMemo, useEffect } from "react";
import { FaPlus, FaClipboardList, FaHistory, FaUserPlus, FaFilter } from "react-icons/fa";
import AthleteModal from "../AthletesSection/components/AthleteModal.jsx";
import GuardianModal from "../AthletesSection/components/GuardianModal.jsx";
import GuardianViewModal from "../AthletesSection/components/GuardianViewModal.jsx";
import RenewEnrollmentModal from "./components/RenewEnrollmentModal.jsx";
import EnrollmentHistoryModal from "./components/EnrollmentHistoryModal.jsx";

import Table from "../../../../../../../shared/components/Table/table.jsx";
import SearchInput from "../../../../../../../shared/components/SearchInput.jsx";
import ReportButton from "../../../../../../../shared/components/ReportButton.jsx";
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard.jsx";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions.js";
import { useEnrollmentsContext } from "../../../../../../../shared/contexts/EnrollmentsContext.jsx";

import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteAlert,
  showConfirmAlert,
} from "../../../../../../../shared/utils/alerts.js";

import { useEnrollments } from "./hooks/useEnrollments.js";
import { PAGINATION_CONFIG } from "../../../../../../../shared/constants/paginationConfig.js";

const Enrollments = () => {
  const { hasPermission } = usePermissions();
  const { registerListener } = useEnrollmentsContext();

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
    addInscriptionToState,
    updateInscriptionEmailInState,
  } = useEnrollments();

  // Estados de modales
  const [isAthleteModalOpen, setIsAthleteModalOpen] = useState(false);
  const [selectedInscription, setSelectedInscription] = useState(null);

  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [isRenewing, setIsRenewing] = useState(false);

  // Estados para modales de acudiente
  const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);
  const [isGuardianViewOpen, setIsGuardianViewOpen] = useState(false);
  const [guardianToView, setGuardianToView] = useState(null);
  const [newlyCreatedGuardianId, setNewlyCreatedGuardianId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("matriculas"); // "matriculas" o "inscripciones"
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
  });
  const rowsPerPage = 10;

  // Auto-refresh cada 5 segundos cuando estamos en la pestaña de inscripciones
  useEffect(() => {
    if (activeTab !== "inscripciones") return;

    const interval = setInterval(() => {
      refresh(true); // true = silent mode
    }, 5000); // 5 segundos - actualización casi en tiempo real

    return () => clearInterval(interval);
  }, [activeTab, refresh]);

  // Escuchar notificaciones de nuevas inscripciones y actualizaciones de email
  useEffect(() => {
    const unregister = registerListener({
      onNewInscription: (inscription) => {
        console.log("🎉 [Enrollments] Nueva inscripción recibida:", inscription);
        addInscriptionToState(inscription);
      },
      onEmailUpdate: (identification, newEmail) => {
        console.log("📧 [Enrollments] Actualización de email recibida:", { identification, newEmail });
        updateInscriptionEmailInState(identification, newEmail);
      },
    });

    return unregister;
  }, [registerListener, addInscriptionToState, updateInscriptionEmailInState]);

  // Filtrar matrículas
  const filteredAthletes = useMemo(() => {
    let result = athletes;

    // Filtro de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      result = result.filter((athlete) => {
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
          (field) => field && String(field).toLowerCase().includes(searchLower),
        );
      });
    }

    // Filtro por estado de matrícula
    if (filters.estado) {
      result = result.filter((athlete) => {
        const latestEnrollment = athlete.enrollments?.[0] || athlete.inscripciones?.[0];
        const estado = latestEnrollment?.status || latestEnrollment?.estado || '';
        return estado === filters.estado;
      });
    }

    // Filtro por fecha desde
    if (filters.fechaDesde) {
      result = result.filter((athlete) => {
        const latestEnrollment = athlete.enrollments?.[0] || athlete.inscripciones?.[0];
        const fechaMatricula = latestEnrollment?.enrollmentDate || latestEnrollment?.fechaInscripcion;
        if (!fechaMatricula) return false;
        const fecha = new Date(fechaMatricula);
        const fechaDesde = new Date(filters.fechaDesde);
        return fecha >= fechaDesde;
      });
    }

    // Filtro por fecha hasta
    if (filters.fechaHasta) {
      result = result.filter((athlete) => {
        const latestEnrollment = athlete.enrollments?.[0] || athlete.inscripciones?.[0];
        const fechaMatricula = latestEnrollment?.enrollmentDate || latestEnrollment?.fechaInscripcion;
        if (!fechaMatricula) return false;
        const fecha = new Date(fechaMatricula);
        const fechaHasta = new Date(filters.fechaHasta);
        fechaHasta.setHours(23, 59, 59, 999); // Incluir todo el día
        return fecha <= fechaHasta;
      });
    }

    return result;
  }, [athletes, searchTerm, filters]);

  // Filtrar inscripciones
  const filteredInscriptions = useMemo(() => {
    if (!searchTerm) return inscriptions;

    const searchLower = searchTerm.toLowerCase().trim();

    return inscriptions.filter((inscription) => {
      const textFields = [
        inscription.firstName,
        inscription.middleName,
        inscription.lastName,
        inscription.secondLastName,
        inscription.email,
        inscription.identification,
        inscription.phoneNumber,
      ];

      return textFields.some(
        (field) => field && String(field).toLowerCase().includes(searchLower),
      );
    });
  }, [inscriptions, searchTerm]);

  // Datos según el tab activo - usar filtrado local cuando hay búsqueda
  const currentData =
    activeTab === "matriculas" ? filteredAthletes : filteredInscriptions;

  // Usar paginación local cuando hay búsqueda, sino usar datos del servidor
  const displayData = searchTerm
    ? currentData
    : activeTab === "matriculas"
      ? athletes
      : inscriptions;
  const totalRows = searchTerm ? currentData.length : displayData.length;
  const startIndex = (pagination.page - 1) * PAGINATION_CONFIG.ROWS_PER_PAGE;

  // Solo paginar localmente cuando hay búsqueda
  const paginatedData = searchTerm
    ? currentData.slice(
        startIndex,
        startIndex + PAGINATION_CONFIG.ROWS_PER_PAGE,
      )
    : displayData;

  // Ya no necesitamos aplicar estilos con JavaScript, solo el badge es suficiente

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
    console.log("💾 [handleSaveEnrollment] Guardando matrícula...");
    console.log("💾 [handleSaveEnrollment] Datos del deportista:", athleteData);
    console.log("💾 [handleSaveEnrollment] Acudiente ID:", athleteData.acudiente);
    console.log("💾 [handleSaveEnrollment] Parentesco:", athleteData.parentesco);
    console.log(
      "💾 [handleSaveEnrollment] selectedInscription:",
      selectedInscription,
    );
    console.log(
      "💾 [handleSaveEnrollment] selectedInscription?.id:",
      selectedInscription?.id,
    );

    // El backend ya NO valida la categoría cuando viene de matrícula
    // Enviar los datos tal como vienen
    const result = await createEnrollment(athleteData, selectedInscription?.id);

    if (result) {
      console.log("✅ [handleSaveEnrollment] Matrícula guardada");
      console.log("📧 [handleSaveEnrollment] Email enviado:", result.emailSent);
      console.log(
        "🔑 [handleSaveEnrollment] Contraseña temporal:",
        result.temporaryPassword,
      );

      setIsAthleteModalOpen(false);
      setSelectedInscription(null);

      // No mostramos el modal de credenciales, solo el sweet alert que ya se muestra en el hook
    } else {
      console.log("❌ [handleSaveEnrollment] Error al guardar matrícula");
    }
  };

  // Renovar matrícula
  const handleOpenRenew = (athlete) => {
    if (!athlete || athlete.target) return;
    const currentAthlete = athletes.find((a) => a.id === athlete.id) || athlete;
    console.log("🔍 [handleOpenRenew] Datos del atleta:", currentAthlete);
    console.log(
      "🔍 [handleOpenRenew] fechaNacimiento:",
      currentAthlete?.fechaNacimiento,
    );
    console.log(
      "🔍 [handleOpenRenew] inscripciones:",
      currentAthlete?.inscripciones,
    );
    setSelectedAthlete(currentAthlete);
    setIsRenewModalOpen(true);
  };

  // Ver historial
  const handleOpenHistory = (athlete) => {
    if (!athlete || athlete.target) return;
    const currentAthlete = athletes.find((a) => a.id === athlete.id) || athlete;
    setSelectedAthlete(currentAthlete);
    setIsHistoryModalOpen(true);
  };

  // Renovar matrícula
  const handleRenewEnrollment = async (enrollmentData) => {
    if (!selectedAthlete) return;

    try {
      setIsRenewing(true);

      const currentYear = new Date().getFullYear();
      const comprobanteUrl = URL.createObjectURL(enrollmentData.comprobante);

      const newInscription = {
        id: crypto.randomUUID(),
        estado: "Vigente",
        concepto: `Renovación ${currentYear}`,
        fechaInscripcion: new Date().toISOString(),
        categoria: enrollmentData.categoria,
        fechaConcepto: new Date().toISOString(),
        tipo: "renovacion",
        estadoAnterior: selectedAthlete.inscripciones?.[0]?.estado || "Vencida",
        comprobantePago: {
          url: comprobanteUrl,
          nombreArchivo: enrollmentData.comprobante.name,
          fechaSubida: new Date().toISOString(),
          tipo: enrollmentData.comprobante.type,
          tamaño: enrollmentData.comprobante.size,
        },
      };

      const updatedAthlete = {
        ...selectedAthlete,
        categoria: enrollmentData.categoria,
        estadoInscripcion: "Vigente",
        inscripciones: [
          newInscription,
          ...(selectedAthlete.inscripciones || []),
        ],
      };

      // Aquí deberías llamar al servicio para actualizar en el backend
      // Por ahora solo actualizamos localmente
      await updateEnrollment(selectedAthlete.id, updatedAthlete);

      showSuccessAlert(
        "Matrícula renovada",
        `Se creó una nueva matrícula vigente para ${selectedAthlete.nombres} ${selectedAthlete.apellidos}.`,
      );

      setIsRenewModalOpen(false);
      setSelectedAthlete(null);
      await refresh();
    } catch (error) {
      console.error("Error renovando matrícula:", error);
      showErrorAlert(
        "Error al renovar",
        error.message || "Ocurrió un error al renovar la matrícula.",
      );
    } finally {
      setIsRenewing(false);
    }
  };

  // Eliminar deportista
  const handleDelete = async (athlete) => {
    if (!hasPermission("enrollments", "Eliminar")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para eliminar matrículas",
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
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" },
    );

    if (!confirmResult.isConfirmed) return;

    await deleteAthlete(athlete.id);
  };

  return (
    <div className="p-6 font-questrial w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Gestión de Matrículas
        </h1>

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
            {/* Botón de Filtros */}
            {activeTab === "matriculas" && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow transition-colors ${
                  showFilters || filters.estado || filters.fechaDesde || filters.fechaHasta
                    ? "bg-primary-purple text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
                title="Filtros"
              >
                <FaFilter />
                Filtros
                {(filters.estado || filters.fechaDesde || filters.fechaHasta) && (
                  <span className="bg-white text-primary-purple rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {[filters.estado, filters.fechaDesde, filters.fechaHasta].filter(Boolean).length}
                  </span>
                )}
              </button>
            )}

            <PermissionGuard module="enrollments" action="Ver">
              <ReportButton
                data={athletes.map((athlete) => {
                  const guardian = getGuardianById(athlete.acudiente);
                  const firstName = athlete.firstName || athlete.nombres || "";
                  const lastName = athlete.lastName || athlete.apellidos || "";
                  const email = athlete.email || athlete.correo || "";
                  const phone = athlete.phoneNumber || athlete.telefono || "";
                  const identification =
                    athlete.identification || athlete.numeroDocumento || "";

                  // Obtener tipo de documento del deportista
                  let tipoDocumento = "No especificado";
                  const docTypeId =
                    athlete.user?.documentTypeId || athlete.documentTypeId;
                  if (docTypeId && referenceData?.documentTypes) {
                    const docType = referenceData.documentTypes.find(
                      (dt) => dt.id === docTypeId,
                    );
                    if (docType) {
                      tipoDocumento = docType.name || docType.label;
                    }
                  }

                  // Obtener tipo de documento del acudiente
                  let tipoDocumentoAcudiente = "";
                  if (guardian) {
                    const guardianDocTypeId = guardian.documentTypeId;
                    if (
                      guardianDocTypeId &&
                      referenceData?.guardianDocumentTypes
                    ) {
                      const docType = referenceData.guardianDocumentTypes.find(
                        (dt) => dt.id === guardianDocTypeId,
                      );
                      if (docType) {
                        tipoDocumentoAcudiente = docType.name || docType.label;
                      }
                    }
                  }

                  // Obtener la matrícula más reciente
                  const latestEnrollment =
                    athlete.enrollments?.[0] || athlete.inscripciones?.[0];

                  // Formatear fechas
                  let fechaMatricula = "";
                  if (
                    latestEnrollment?.enrollmentDate ||
                    latestEnrollment?.fechaInscripcion
                  ) {
                    const fecha = new Date(
                      latestEnrollment.enrollmentDate ||
                        latestEnrollment.fechaInscripcion,
                    );
                    if (!isNaN(fecha.getTime())) {
                      fechaMatricula = fecha.toLocaleDateString("es-ES");
                    }
                  }

                  let fechaVencimiento = "";
                  if (
                    latestEnrollment?.expirationDate ||
                    latestEnrollment?.fechaVencimiento
                  ) {
                    const fecha = new Date(
                      latestEnrollment.expirationDate ||
                        latestEnrollment.fechaVencimiento,
                    );
                    if (!isNaN(fecha.getTime())) {
                      fechaVencimiento = fecha.toLocaleDateString("es-ES");
                    }
                  } else if (
                    latestEnrollment?.enrollmentDate ||
                    latestEnrollment?.fechaInscripcion
                  ) {
                    const fechaInsc = new Date(
                      latestEnrollment.enrollmentDate ||
                        latestEnrollment.fechaInscripcion,
                    );
                    if (!isNaN(fechaInsc.getTime())) {
                      const fechaVenc = new Date(fechaInsc);
                      fechaVenc.setFullYear(fechaVenc.getFullYear() + 1);
                      fechaVencimiento = fechaVenc.toLocaleDateString("es-ES");
                    }
                  }

                  const estadoMatricula =
                    latestEnrollment?.status ||
                    latestEnrollment?.estado ||
                    "Sin matrícula";

                  return {
                    nombres: firstName,
                    apellidos: lastName,
                    nombreCompleto: `${firstName} ${lastName}`.trim(),
                    tipoDocumento,
                    numeroDocumento: identification,
                    correo: email,
                    telefono: phone,
                    categoria: athlete.categoria || "",
                    estado: athlete.status || athlete.estado || "",
                    fechaMatricula,
                    fechaVencimiento,
                    estadoMatricula,
                    acudienteNombre: guardian
                      ? `${guardian.firstName || ""} ${guardian.lastName || ""}`.trim()
                      : "Sin acudiente",
                    acudienteTipoDocumento: tipoDocumentoAcudiente,
                    acudienteDocumento:
                      guardian?.identification ||
                      guardian?.identificacion ||
                      "",
                    acudienteTelefono:
                      guardian?.phone || guardian?.telefono || "",
                    acudienteCorreo: guardian?.email || guardian?.correo || "",
                  };
                })}
                fileName="Matriculas"
                columns={[
                  { header: "Nombres", accessor: "nombres" },
                  { header: "Apellidos", accessor: "apellidos" },
                  { header: "Tipo Documento", accessor: "tipoDocumento" },
                  { header: "Número Documento", accessor: "numeroDocumento" },
                  { header: "Correo", accessor: "correo" },
                  { header: "Teléfono", accessor: "telefono" },
                  { header: "Categoría", accessor: "categoria" },
                  { header: "Estado Deportista", accessor: "estado" },
                  { header: "Fecha Matrícula", accessor: "fechaMatricula" },
                  { header: "Fecha Vencimiento", accessor: "fechaVencimiento" },
                  { header: "Estado Matrícula", accessor: "estadoMatricula" },
                  { header: "Acudiente", accessor: "acudienteNombre" },
                  {
                    header: "Tipo Doc. Acudiente",
                    accessor: "acudienteTipoDocumento",
                  },
                  { header: "Doc. Acudiente", accessor: "acudienteDocumento" },
                  { header: "Tel. Acudiente", accessor: "acudienteTelefono" },
                  { header: "Correo Acudiente", accessor: "acudienteCorreo" },
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
            <span
              className={`px-1.5 py-0.5 rounded-md text-xs font-medium ${
                activeTab === "matriculas"
                  ? "bg-primary-purple text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
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

      {/* Panel de Filtros */}
      {showFilters && activeTab === "matriculas" && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            {/* Filtro por Estado */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de Matrícula
              </label>
              <select
                value={filters.estado}
                onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-primary-purple"
              >
                <option value="">Todos los estados</option>
                <option value="Vigente">Vigente</option>
                <option value="Vencida">Vencida</option>
                <option value="Suspendida">Suspendida</option>
              </select>
            </div>

            {/* Filtro por Fecha Desde */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Desde
              </label>
              <input
                type="date"
                value={filters.fechaDesde}
                onChange={(e) => setFilters({ ...filters, fechaDesde: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-primary-purple"
              />
            </div>

            {/* Filtro por Fecha Hasta */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={filters.fechaHasta}
                onChange={(e) => setFilters({ ...filters, fechaHasta: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-primary-purple"
              />
            </div>

            {/* Botón Limpiar Filtros */}
            <button
              onClick={() => setFilters({ estado: '', fechaDesde: '', fechaHasta: '' })}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Contenido según tab activo */}
      {totalRows > 0 ? (
        <>
          <div className="w-full bg-white rounded-lg">
            {activeTab === "matriculas" ? (
              <Table
                thead={{
                  titles: [
                    "Nombre Completo",
                    "Fecha Matrícula",
                    "Estado Matrícula",
                    "Fecha Vencimiento",
                  ],
                  state: false,
                  actions: true,
                }}
                tbody={{
                  data: paginatedData.map((a) => {
                    const guardian = getGuardianById(a.acudiente);

                    const firstName = a.firstName || a.nombres || "";
                    const lastName = a.lastName || a.apellidos || "";

                    // Obtener la matrícula más reciente
                    const latestEnrollment =
                      a.enrollments?.[0] || a.inscripciones?.[0];

                    // Formatear fecha de matrícula
                    let fechaMatricula = "N/A";
                    if (
                      latestEnrollment?.enrollmentDate ||
                      latestEnrollment?.fechaInscripcion
                    ) {
                      const fecha = new Date(
                        latestEnrollment.enrollmentDate ||
                          latestEnrollment.fechaInscripcion,
                      );
                      if (!isNaN(fecha.getTime())) {
                        fechaMatricula = fecha.toLocaleDateString("es-ES");
                      }
                    }

                    // Formatear fecha de vencimiento
                    let fechaVencimiento = "N/A";
                    if (
                      latestEnrollment?.expirationDate ||
                      latestEnrollment?.fechaVencimiento
                    ) {
                      const fecha = new Date(
                        latestEnrollment.expirationDate ||
                          latestEnrollment.fechaVencimiento,
                      );
                      if (!isNaN(fecha.getTime())) {
                        fechaVencimiento = fecha.toLocaleDateString("es-ES");
                      }
                    } else if (
                      latestEnrollment?.enrollmentDate ||
                      latestEnrollment?.fechaInscripcion
                    ) {
                      // Si no hay fecha de vencimiento, calcularla sumando 1 año a la fecha de inscripción
                      const fechaInscripcion = new Date(
                        latestEnrollment.enrollmentDate ||
                          latestEnrollment.fechaInscripcion,
                      );
                      if (!isNaN(fechaInscripcion.getTime())) {
                        const fechaVenc = new Date(fechaInscripcion);
                        fechaVenc.setFullYear(fechaVenc.getFullYear() + 1);
                        fechaVencimiento =
                          fechaVenc.toLocaleDateString("es-ES");
                      }
                    }

                    // Verificar si la matrícula está vencida
                    let isVencida = false;
                    if (
                      latestEnrollment?.expirationDate ||
                      latestEnrollment?.fechaVencimiento
                    ) {
                      const fechaVenc = new Date(
                        latestEnrollment.expirationDate ||
                          latestEnrollment.fechaVencimiento,
                      );
                      const hoy = new Date();
                      isVencida = fechaVenc < hoy;
                      console.log(
                        `📅 ${firstName} ${lastName}: Fecha venc=${fechaVenc.toLocaleDateString()}, Hoy=${hoy.toLocaleDateString()}, isVencida=${isVencida}`,
                      );
                    } else if (
                      latestEnrollment?.enrollmentDate ||
                      latestEnrollment?.fechaInscripcion
                    ) {
                      // Si no hay fecha de vencimiento, calcularla
                      const fechaInscripcion = new Date(
                        latestEnrollment.enrollmentDate ||
                          latestEnrollment.fechaInscripcion,
                      );
                      const fechaVenc = new Date(fechaInscripcion);
                      fechaVenc.setFullYear(fechaVenc.getFullYear() + 1);
                      const hoy = new Date();
                      isVencida = fechaVenc < hoy;
                      console.log(
                        `📅 ${firstName} ${lastName}: Fecha insc=${fechaInscripcion.toLocaleDateString()}, Fecha venc calculada=${fechaVenc.toLocaleDateString()}, Hoy=${hoy.toLocaleDateString()}, isVencida=${isVencida}`,
                      );
                    }

                    const estadoMatricula =
                      latestEnrollment?.status ||
                      latestEnrollment?.estado ||
                      "Sin matrícula";

                    return {
                      ...a,
                      nombreCompleto:
                        `${firstName} ${lastName}`.trim() || "Sin nombre",
                      fechaMatricula,
                      estadoMatricula,
                      fechaVencimiento,
                      latestEnrollment, // Guardar para usar en customRenderers
                      isVencida, // Flag para aplicar estilo de fila
                    };
                  }),
                  dataPropertys: [
                    "nombreCompleto",
                    "fechaMatricula",
                    "estadoMatricula",
                    "fechaVencimiento",
                  ],
                  state: false,
                  customRenderers: {
                    nombreCompleto: (value, row) => {
                      return (
                        <div className="text-left pl-4">
                          <span className="text-gray-700">{value}</span>
                        </div>
                      );
                    },
                    fechaMatricula: (value, row) => {
                      return (
                        <div className="text-left pl-4">
                          <span
                            className={
                              value === "N/A"
                                ? "text-gray-400"
                                : "text-gray-700"
                            }
                          >
                            {value}
                          </span>
                        </div>
                      );
                    },
                    estadoMatricula: (value, row) => {
                      if (row.isVencida) {
                        return (
                          <div className="text-left pl-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                              Vencida
                            </span>
                          </div>
                        );
                      }
                      return (
                        <div className="text-left pl-4">
                          <span className="text-gray-700">{value}</span>
                        </div>
                      );
                    },
                    fechaVencimiento: (value, row) => {
                      if (value === "N/A") {
                        return (
                          <div className="text-left pl-4">
                            <span className="text-gray-400">{value}</span>
                          </div>
                        );
                      }

                      // Calcular días hasta vencimiento
                      const latestEnrollment = row.latestEnrollment;
                      let fechaVenc;

                      if (
                        latestEnrollment?.expirationDate ||
                        latestEnrollment?.fechaVencimiento
                      ) {
                        fechaVenc = new Date(
                          latestEnrollment.expirationDate ||
                            latestEnrollment.fechaVencimiento,
                        );
                      } else if (
                        latestEnrollment?.enrollmentDate ||
                        latestEnrollment?.fechaInscripcion
                      ) {
                        fechaVenc = new Date(
                          latestEnrollment.enrollmentDate ||
                            latestEnrollment.fechaInscripcion,
                        );
                        fechaVenc.setFullYear(fechaVenc.getFullYear() + 1);
                      }

                      if (!fechaVenc || isNaN(fechaVenc.getTime())) {
                        return (
                          <div className="text-left pl-4">
                            <span className="text-gray-400">{value}</span>
                          </div>
                        );
                      }

                      const hoy = new Date();
                      const diasRestantes = Math.ceil(
                        (fechaVenc - hoy) / (1000 * 60 * 60 * 24),
                      );

                      let colorClass = "text-gray-700";
                      if (diasRestantes < 0) {
                        colorClass = "text-gray-700"; // Cambiar a gris en lugar de rojo
                      } else if (diasRestantes <= 30) {
                        colorClass = "text-yellow-600 font-semibold";
                      }

                      return (
                        <div className="text-left pl-4">
                          <span className={colorClass}>{value}</span>
                          {diasRestantes > 0 && diasRestantes <= 30 && (
                            <div className="text-xs text-yellow-600 mt-1">
                              ({diasRestantes} días)
                            </div>
                          )}
                          {diasRestantes < 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              (Vencida hace {Math.abs(diasRestantes)} días)
                            </div>
                          )}
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
                    onClick: (athlete) => handleOpenRenew(athlete),
                    label: <FaClipboardList className="w-4 h-4" />,
                    className:
                      "p-2 text-primary-purple hover:text-primary-blue hover:bg-purple-50 rounded transition-colors",
                    tooltip: "Renovar Matrícula",
                    show: (athlete) => athlete.isVencida, // Solo mostrar si está vencida
                  },
                  {
                    onClick: (athlete) => handleOpenHistory(athlete),
                    label: <FaHistory className="w-4 h-4" />,
                    className:
                      "p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors",
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
                  },
                ]}
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
          console.log("📝 Intentando crear acudiente con datos:", guardianData);
          const GuardiansService = (
            await import("../AthletesSection/services/GuardiansService.js")
          ).default;
          const result = await GuardiansService.createGuardian(guardianData);
          console.log("📡 Respuesta del servicio:", result);

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
        athletes={athletes.filter(
          (a) => String(a.acudiente) === String(guardianToView?.id),
        )}
        referenceData={{
          documentTypes: referenceData.guardianDocumentTypes || [],
        }}
      />

      <RenewEnrollmentModal
        isOpen={isRenewModalOpen}
        onClose={() => {
          setIsRenewModalOpen(false);
          setSelectedAthlete(null);
        }}
        athlete={selectedAthlete}
        onRenew={handleRenewEnrollment}
        sportsCategories={referenceData.sportsCategories || []}
        isProcessing={isRenewing}
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
    </div>
  );
};

export default Enrollments;
