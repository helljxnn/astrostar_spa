import { useState, useEffect } from "react";
import { FaPlus, FaUserShield } from "react-icons/fa";
import AthleteModal from "./components/AthleteModal.jsx";
import AthleteViewModal from "./components/AthleteViewModal.jsx";
import GuardianModal from "../../Athletes/AthletesSection/components/GuardianModal.jsx";
import GuardianViewModal from "../AthletesSection/components/GuardianViewModal.jsx";

import Table from "../../../../../../../shared/components/Table/table.jsx";
import SearchInput from "../../../../../../../shared/components/SearchInput.jsx";
import ReportButton from "../../../../../../../shared/components/ReportButton.jsx";
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard.jsx";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions.js";
import { useReportDataWithService } from "../../../../../../../shared/hooks/useReportData";

import AthletesService from "./services/AthletesService.js";
import GuardiansService from "./services/GuardiansService.js";

import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteAlert,
} from "../../../../../../../shared/utils/alerts.js";

// Hook personalizado para deportistas
import { useAthletes } from "./hooks/useAthletes.js";
import { PAGINATION_CONFIG } from "../../../../../../../shared/constants/paginationConfig.js";

const Athletes = () => {
  // Hook de permisos
  const { hasPermission } = usePermissions();

  // Hook para obtener datos completos para reportes
  const { getReportData } = useReportDataWithService(
    AthletesService.getAllForReport.bind(AthletesService)
  );

  // Usar el hook personalizado
  const {
    athletes,
    guardians,
    loading,
    pagination,
    referenceData,
    loadGuardians,
    createAthlete,
    updateAthlete,
    deleteAthlete,
    createGuardian,
    updateGuardian,
    deleteGuardian,
    changePage,
    refresh,
  } = useAthletes();

  // Estados de modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [athleteToEdit, setAthleteToEdit] = useState(null);
  const [athleteToView, setAthleteToView] = useState(null);
  const [requiresGuardianChange, setRequiresGuardianChange] = useState(false); // Nuevo: indica que DEBE cambiar acudiente

  // Estados de acudientes
  const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);
  const [isGuardianViewOpen, setIsGuardianViewOpen] = useState(false);
  const [guardianToEdit, setGuardianToEdit] = useState(null);
  const [guardianToView, setGuardianToView] = useState(null);
  const [guardianModalMode, setGuardianModalMode] = useState("create");
  const [newlyCreatedGuardianId, setNewlyCreatedGuardianId] = useState(null);
  const [currentAthleteId, setCurrentAthleteId] = useState(null); // ID del deportista actual al ver acudiente

  // Estados comunes
  const [searchTerm, setSearchTerm] = useState("");

  // Función auxiliar para obtener el acudiente
  const getGuardianById = (guardianId) => {
    return guardians.find((g) => String(g.id) === String(guardianId));
  };

  // Cargar deportistas cuando cambia el término de búsqueda
  useEffect(() => {
    let timeoutId;
    
    const loadData = () => {
      refresh({
        page: 1, // Resetear a página 1 en búsquedas
        limit: PAGINATION_CONFIG.ROWS_PER_PAGE,
        search: searchTerm,
      });
    };
    
    // Debounce para búsqueda
    if (searchTerm) {
      timeoutId = setTimeout(loadData, 300);
    } else {
      // Cargar inmediatamente cuando se limpia la búsqueda
      loadData();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [searchTerm, refresh]); // Incluir refresh como dependencia

  // Usar datos del servidor directamente (ya vienen filtrados y paginados)
  const totalRows = pagination.total;
  const paginatedData = athletes;

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
    if (!hasPermission("athletesSection", "Editar")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para editar deportistas",
      );
      return;
    }
    if (!athlete || athlete.target) return;
    setAthleteToEdit(athlete);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleView = (athlete) => {
    if (!athlete || athlete.target) return;
    // Obtener los datos más recientes del atleta
    const currentAthlete = athletes.find((a) => a.id === athlete.id) || athlete;
    setAthleteToView(currentAthlete);
    setIsViewModalOpen(true);
  };

  // Validar si se puede eliminar una deportista
  const canDeleteAthlete = (athlete) => {
    if (!athlete) return { canDelete: false, reason: "Deportista no válida" };

    const today = new Date();

    // Verificar matrícula vigente
    if (athlete.enrollment?.estado === 'Vigente' || athlete.estadoInscripcion === 'Vigente') {
      return { 
        canDelete: false, 
        reason: "Tiene matrícula vigente" 
      };
    }
    
    // Verificar fecha de creación de la matrícula (no se puede eliminar hasta 1 año después)
    const enrollmentDate = athlete.enrollment?.enrollmentDate || 
                          athlete.enrollment?.fechaInscripcion || 
                          athlete.fechaInscripcion ||
                          athlete.createdAt;
    
    if (enrollmentDate) {
      const enrollDate = new Date(enrollmentDate);
      const oneYearAfterEnrollment = new Date(enrollDate);
      oneYearAfterEnrollment.setFullYear(oneYearAfterEnrollment.getFullYear() + 1);
      
      if (today < oneYearAfterEnrollment) {
        const monthsRemaining = Math.ceil(
          (oneYearAfterEnrollment - today) / (1000 * 60 * 60 * 24 * 30)
        );
        return { 
          canDelete: false, 
          reason: `Debe esperar ${monthsRemaining} mes(es) más desde la fecha de matrícula (${enrollDate.toLocaleDateString('es-ES')})` 
        };
      }
    }
    
    // Verificar si la matrícula venció hace más de 1 año
    const expirationDate =
      athlete.enrollment?.fechaVencimiento || athlete.fechaVencimiento;
    if (expirationDate) {
      const expDate = new Date(expirationDate);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      if (expDate > oneYearAgo) {
        const monthsRemaining = Math.ceil(
          (oneYearAgo - expDate) / (1000 * 60 * 60 * 24 * 30),
        );
        return {
          canDelete: false,
          reason: `Debe esperar ${Math.abs(monthsRemaining)} mes(es) más desde el vencimiento`,
        };
      }
    }

    // Verificar equipos temporales
    if (athlete.temporaryTeams && athlete.temporaryTeams.length > 0) {
      return {
        canDelete: false,
        reason: `Está asignada a ${athlete.temporaryTeams.length} equipo(s) temporal(es)`,
      };
    }

    // Verificar eventos activos
    if (athlete.activeEvents && athlete.activeEvents.length > 0) {
      return {
        canDelete: false,
        reason: `Está asignada a ${athlete.activeEvents.length} evento(s) activo(s)`,
      };
    }

    return { canDelete: true };
  };

  const handleDelete = async (athlete) => {
    if (!hasPermission("athletesSection", "Eliminar")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para eliminar deportistas",
      );
      return;
    }
    if (!athlete || !athlete.id)
      return showErrorAlert("Error", "Deportista no válido");

    // Validar si se puede eliminar
    const validation = canDeleteAthlete(athlete);
    if (!validation.canDelete) {
      showErrorAlert("No se puede eliminar", validation.reason);
      return;
    }

    const confirmResult = await showDeleteAlert(
      "¿Estás seguro?",
      `Se eliminará permanentemente a ${athlete.firstName || athlete.nombres} ${athlete.lastName || athlete.apellidos}.`,
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" },
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

  const handleEditGuardian = async (updatedGuardian) => {
    if (!updatedGuardian || !updatedGuardian.id) return;

    const { id, ...guardianData } = updatedGuardian;
    const success = await updateGuardian(id, guardianData);

    if (success) {
      // Actualizar la vista del acudiente
      if (guardianToView && guardianToView.id === id) {
        const updatedGuardianData = await GuardiansService.getGuardianById(id);
        if (updatedGuardianData.success) {
          setGuardianToView(updatedGuardianData.data);
        }
      }

      // Refrescar deportistas para que se vean los cambios del acudiente
      await refresh();
    }
  };

  const handleDeleteGuardian = async (guardian, needsNewGuardian = false) => {
    if (!guardian || !guardian.id) {
      return showErrorAlert("Error", "Acudiente no válido");
    }

    // ✅ VALIDAR SI TIENE DEPORTISTAS MENORES ASIGNADOS ANTES DE ELIMINAR
    const assignedAthletes = athletes.filter(
      a => a.acudiente?.toString() === guardian.id?.toString()
    );
    
    const hasMinorAthletes = assignedAthletes.some(athlete => {
      const birthDateStr = athlete.birthDate || athlete.fechaNacimiento;
      if (!birthDateStr) return false;
      
      const today = new Date();
      const birthDate = new Date(birthDateStr);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age < 18;
    });
    
    // Si tiene deportistas menores, NO permitir eliminar
    if (hasMinorAthletes) {
      showErrorAlert(
        "No se puede eliminar",
        "Este acudiente está asignado a deportistas menores de edad"
      );
      return false;
    }

    const success = await deleteGuardian(guardian.id);

    if (success) {
      setIsGuardianViewOpen(false);
      setGuardianToView(null);

      // Si necesita nuevo acudiente, abrir modal de deportista para editar
      if (needsNewGuardian && currentAthleteId) {
        const athlete = athletes.find((a) => a.id === currentAthleteId);
        if (athlete) {
          setTimeout(() => {
            setAthleteToEdit(athlete);
            setModalMode("edit");
            setIsModalOpen(true);
            showSuccessAlert(
              "Asignar nuevo acudiente",
              "Por favor, asigne un nuevo acudiente a esta deportista menor de edad.",
            );
          }, 500);
        }
      }

      setCurrentAthleteId(null);
    }
    
    return success;
  };

  // Nuevo: Gestionar acudiente desde la fila del deportista
  const handleManageGuardian = (athlete) => {
    if (!athlete || athlete.target) return;

    // Si el deportista tiene acudiente, mostrarlo
    if (athlete.acudiente) {
      // Priorizar el guardian que viene del backend
      const guardian = athlete.guardian || getGuardianById(athlete.acudiente);
      
      if (guardian) {
        setCurrentAthleteId(athlete.id); // Guardar el ID del deportista actual
        setGuardianToView(guardian);
        setIsGuardianViewOpen(true);
      } else {
        showErrorAlert("Error", "No se encontró el acudiente asignado");
      }
    } else {
      showErrorAlert(
        "Sin Acudiente",
        "Este deportista no tiene un acudiente asignado",
      );
    }
  };

  // Remover acudiente de un deportista específico
  const handleRemoveGuardian = async (
    guardian,
    athleteId,
    needsNewGuardian,
  ) => {
    if (!guardian || !athleteId) {
      return showErrorAlert("Error", "Datos inválidos");
    }

    try {
      // Si es menor de edad, abrir directamente el modal de edición para cambiar acudiente
      if (needsNewGuardian) {
        // Cerrar el modal del acudiente
        setIsGuardianViewOpen(false);
        setGuardianToView(null);
        
        // Buscar el deportista
        const athlete = athletes.find((a) => a.id === athleteId);
        
        if (athlete) {
          // Activar modo de cambio obligatorio
          setRequiresGuardianChange(true);
          
          // Abrir modal de edición del deportista
          setTimeout(() => {
            setAthleteToEdit(athlete);
            setModalMode("edit");
            setIsModalOpen(true);
            
            setTimeout(() => {
              showSuccessAlert(
                "Cambiar acudiente",
                "Seleccione el nuevo acudiente para esta deportista.",
              );
            }, 300);
          }, 400);
        }
        
        setCurrentAthleteId(null);
        return;
      }

      // Si NO es menor de edad, proceder con la remoción normal
      const response = await GuardiansService.removeGuardianFromAthlete(athleteId);

      if (response.success) {
        // Refrescar datos primero
        await refresh();

        // Cerrar el modal del acudiente
        setIsGuardianViewOpen(false);
        setGuardianToView(null);

        showSuccessAlert(
          "Acudiente removido",
          "El acudiente fue removido correctamente de esta deportista.",
        );

        setCurrentAthleteId(null);
      } else {
        // El backend rechazó la operación
        throw new Error(response.error || "Error removiendo acudiente");
      }
    } catch (err) {
      console.error("Error removiendo acudiente:", err);
      
      // Mostrar el error del backend al usuario
      let errorMessage = err.message || "No se pudo remover el acudiente";
      
      // Si es un error 500, dar más contexto
      if (errorMessage.includes("Error interno del servidor")) {
        errorMessage = "Ocurrió un error al validar la deportista. Por favor, verifica que tenga fecha de nacimiento registrada y contacta al administrador del sistema.";
      }
      
      showErrorAlert(
        "No se puede remover el acudiente", 
        errorMessage
      );
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
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar deportista..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <PermissionGuard module="athletesSection" action="Ver">
              <ReportButton
                data={athletes.map((athlete) => {
                  // Priorizar el guardian que viene del backend
                  const guardian = athlete.guardian || getGuardianById(athlete.acudiente);
                  const firstName = athlete.firstName || athlete.nombres || "";
                  const lastName = athlete.lastName || athlete.apellidos || "";
                  const email = athlete.email || athlete.correo || "";
                  const phone = athlete.phoneNumber || athlete.telefono || "";
                  const address = athlete.address || athlete.direccion || "";
                  const birthDate =
                    athlete.birthDate || athlete.fechaNacimiento || "";
                  const identification =
                    athlete.identification || athlete.numeroDocumento || "";

                  // Obtener tipo de documento del deportista
                  let tipoDocumento = "";
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

                  // Convertir parentesco a español
                  const parentescoMap = {
                    Mother: "Madre",
                    Father: "Padre",
                    Grandparent: "Abuelo/a",
                    Uncle_Aunt: "Tío/a",
                    Sibling: "Hermano/a",
                    Cousin: "Primo/a",
                    Legal_Guardian: "Tutor/a Legal",
                    Neighbor: "Vecino/a",
                    Family_Friend: "Amigo/a de la familia",
                    Other: "Otro",
                  };
                  const parentescoRaw =
                    athlete.relationship || athlete.parentesco || "";
                  const parentesco =
                    parentescoMap[parentescoRaw] || parentescoRaw;

                  return {
                    nombres: firstName,
                    apellidos: lastName,
                    nombreCompleto: `${firstName} ${lastName}`.trim(),
                    tipoDocumento,
                    numeroDocumento: identification,
                    correo: email,
                    telefono: phone,
                    direccion: address,
                    fechaNacimiento: birthDate,
                    categoria: athlete.categoria || "",
                    estado: athlete.status || athlete.estado || "",
                    estadoInscripcion:
                      athlete.currentInscriptionStatus ||
                      athlete.estadoInscripcion ||
                      "",
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
                    acudienteDireccion:
                      guardian?.address || guardian?.direccion || "",
                    acudienteParentesco: parentesco,
                    fechaCreacion: athlete.createdAt
                      ? new Date(athlete.createdAt).toLocaleDateString("es-ES")
                      : "",
                    ultimaActualizacion: athlete.updatedAt
                      ? new Date(athlete.updatedAt).toLocaleDateString("es-ES")
                      : "",
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
                  { header: "Dirección", accessor: "direccion" },
                  { header: "Fecha Nacimiento", accessor: "fechaNacimiento" },
                  { header: "Categoría", accessor: "categoria" },
                  { header: "Estado", accessor: "estado" },
                  {
                    header: "Estado Inscripción",
                    accessor: "estadoInscripcion",
                  },
                  { header: "Acudiente", accessor: "acudienteNombre" },
                  {
                    header: "Tipo Doc. Acudiente",
                    accessor: "acudienteTipoDocumento",
                  },
                  { header: "Doc. Acudiente", accessor: "acudienteDocumento" },
                  { header: "Tel. Acudiente", accessor: "acudienteTelefono" },
                  { header: "Correo Acudiente", accessor: "acudienteCorreo" },
                  { header: "Dir. Acudiente", accessor: "acudienteDireccion" },
                  { header: "Parentesco", accessor: "acudienteParentesco" },
                  { header: "Fecha Creación", accessor: "fechaCreacion" },
                  {
                    header: "Última Actualización",
                    accessor: "ultimaActualizacion",
                  },
                ]}
              />
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* Tabla */}
      {totalRows > 0 ? (
        <>
          <div className="w-full bg-white rounded-lg">
            <Table
              serverPagination={true}
              totalRows={pagination.total}
              currentPage={pagination.page}
              onPageChange={changePage}
              rowsPerPage={PAGINATION_CONFIG.ROWS_PER_PAGE}
              thead={{
                titles: [
                  "Nombre Completo",
                  "Identificación",
                  "Categoría",
                  "Acudiente",
                ],
                state: true,
                actions: true,
              }}
              tbody={{
                data: paginatedData.map((a) => {
                  // Priorizar el guardian que viene del backend
                  const guardian = a.guardian || getGuardianById(a.acudiente);

                  // Mapear campos del backend al frontend
                  const firstName = a.firstName || "";
                  const middleName = a.middleName || "";
                  const lastName = a.lastName || "";
                  const secondLastName = a.secondLastName || "";
                  
                  const nombreCompleto = [firstName, middleName, lastName, secondLastName]
                    .filter(Boolean)
                    .join(' ')
                    .trim() || "Sin nombre";

                  return {
                    ...a,
                    nombreCompleto,
                    identificacion: a.identification || a.numeroDocumento || "Sin identificación",
                    acudienteNombre: guardian ? `${guardian.firstName || ""} ${guardian.lastName || ""}`.trim() : "Sin acudiente",
                    categoria: a.categoria || "Sin categoría",
                  };
                }),
                dataPropertys: [
                  "nombreCompleto",
                  "identificacion",
                  "categoria",
                  "acudienteNombre",
                ],
                state: true,
                stateMap: {
                  Vigente: "bg-green-100 text-green-800",
                  Suspendida: "bg-orange-100 text-orange-800",
                  Vencida: "bg-yellow-100 text-yellow-800",
                },
              }}
              onEdit={
                hasPermission("athletesSection", "Editar") ? handleEdit : null
              }
              onDelete={
                hasPermission("athletesSection", "Eliminar")
                  ? handleDelete
                  : null
              }
              onView={
                hasPermission("athletesSection", "Ver") ? handleView : null
              }
              buttonConfig={{
                edit: (item) => ({
                  show: hasPermission("athletesSection", "Editar"),
                }),
                delete: (item) => {
                  const validation = canDeleteAthlete(item);
                  return {
                    show: hasPermission("athletesSection", "Eliminar"),
                    disabled: !validation.canDelete,
                    title: validation.canDelete
                      ? "Eliminar deportista"
                      : `No se puede eliminar: ${validation.reason}`,
                  };
                },
                view: (item) => ({
                  show: hasPermission("athletesSection", "Ver"),
                }),
              }}
              customActions={[
                {
                  onClick: (athlete) => handleManageGuardian(athlete),
                  label: <FaUserShield className="w-4 h-4" />,
                  className:
                    "p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors",
                  title: "Gestionar Acudiente",
                },
              ]}
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
        athletes={athletes}
        mode={modalMode}
        newlyCreatedGuardianId={newlyCreatedGuardianId}
        referenceData={referenceData}
        loadGuardians={loadGuardians}
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
        onDeleteGuardian={handleDeleteGuardian}
      />

      <AthleteViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        athlete={athleteToView}
        guardian={
          athleteToView 
            ? (athleteToView.guardian || getGuardianById(athleteToView.acudiente))
            : null
        }
        referenceData={referenceData}
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
        referenceData={{
          documentTypes: referenceData.guardianDocumentTypes || [],
        }}
      />

      <GuardianViewModal
        isOpen={isGuardianViewOpen}
        onClose={() => {
          setIsGuardianViewOpen(false);
          setCurrentAthleteId(null);
        }}
        guardian={guardianToView}
        athletes={athletes.filter(
          (a) => String(a.acudiente) === String(guardianToView?.id),
        )}
        currentAthleteId={currentAthleteId}
        onEdit={handleEditGuardian}
        onDelete={handleDeleteGuardian}
        onRemove={handleRemoveGuardian}
        referenceData={{
          documentTypes: referenceData.guardianDocumentTypes || [],
        }}
      />
    </div>
  );
};

export default Athletes;
