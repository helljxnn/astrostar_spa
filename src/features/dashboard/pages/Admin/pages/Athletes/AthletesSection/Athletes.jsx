import { useState, useMemo } from "react";
import { FaPlus, FaUserShield } from "react-icons/fa";
import AthleteModal from "./components/AthleteModal.jsx";
import AthleteViewModal from "./components/AthleteViewModal.jsx";
import GuardianModal from "../../Athletes/AthletesSection/components/GuardianModal.jsx";
import GuardianViewModal from "../AthletesSection/components/GuardianViewModal.jsx";

import Table from "../../../../../../../shared/components/Table/table.jsx";
import Pagination from "../../../../../../../shared/components/Table/Pagination.jsx";
import SearchInput from "../../../../../../../shared/components/SearchInput.jsx";
import ReportButton from "../../../../../../../shared/components/ReportButton.jsx";
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard.jsx";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions.js";

import AthletesService from "./services/AthletesService.js";
import GuardiansService from "./services/GuardiansService.js";

import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteAlert,
} from "../../../../../../../shared/utils/alerts.js";

// Hook personalizado para deportistas
import { useAthletes } from "./hooks/useAthletes.js";

const Athletes = () => {
  // Hook de permisos
  const { hasPermission } = usePermissions();
  
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
  const [guardianToEdit, setGuardianToEdit] = useState(null);
  const [guardianToView, setGuardianToView] = useState(null);
  const [guardianModalMode, setGuardianModalMode] = useState("create");
  const [newlyCreatedGuardianId, setNewlyCreatedGuardianId] = useState(null);



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
    if (!hasPermission('athletesSection', 'Editar')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para editar deportistas');
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
    const currentAthlete = athletes.find(a => a.id === athlete.id) || athlete;
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
    
    // Verificar si la matrícula venció hace más de 1 año
    const expirationDate = athlete.enrollment?.fechaVencimiento || athlete.fechaVencimiento;
    if (expirationDate) {
      const expDate = new Date(expirationDate);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      if (expDate > oneYearAgo) {
        const monthsRemaining = Math.ceil(
          (oneYearAgo - expDate) / (1000 * 60 * 60 * 24 * 30)
        );
        return { 
          canDelete: false, 
          reason: `Debe esperar ${Math.abs(monthsRemaining)} mes(es) más desde el vencimiento` 
        };
      }
    } else {
      // Si no tiene fecha de vencimiento, no se puede eliminar
      return {
        canDelete: false,
        reason: "No se puede verificar el vencimiento de la matrícula"
      };
    }
    
    // Verificar equipos temporales
    if (athlete.temporaryTeams && athlete.temporaryTeams.length > 0) {
      return { 
        canDelete: false, 
        reason: `Está asignada a ${athlete.temporaryTeams.length} equipo(s) temporal(es)` 
      };
    }
    
    // Verificar eventos activos
    if (athlete.activeEvents && athlete.activeEvents.length > 0) {
      return { 
        canDelete: false, 
        reason: `Está asignada a ${athlete.activeEvents.length} evento(s) activo(s)` 
      };
    }
    
    return { canDelete: true };
  };

  const handleDelete = async (athlete) => {
    if (!hasPermission('athletesSection', 'Eliminar')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para eliminar deportistas');
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

  const handleDeleteGuardian = async (guardian) => {
    if (!guardian || !guardian.id) {
      return showErrorAlert("Error", "Acudiente no válido");
    }

    const success = await deleteGuardian(guardian.id);
    
    if (success) {
      setIsGuardianViewOpen(false);
      setGuardianToView(null);
    }
  };





  // Nuevo: Gestionar acudiente desde la fila del deportista
  const handleManageGuardian = (athlete) => {
    if (!athlete || athlete.target) return;
    
    // Si el deportista tiene acudiente, mostrarlo
    if (athlete.acudiente) {
      const guardian = getGuardianById(athlete.acudiente);
      if (guardian) {
        setGuardianToView(guardian);
        setIsGuardianViewOpen(true);
      } else {
        showErrorAlert("Error", "No se encontró el acudiente asignado");
      }
    } else {
      showErrorAlert("Sin Acudiente", "Este deportista no tiene un acudiente asignado");
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
            <PermissionGuard module="athletesSection" action="Ver">
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
                { header: "Acudiente", accessor: "acudienteNombre" },
                  { header: "Tel. Acudiente", accessor: "acudienteTelefono" },
                ]}
              />
            </PermissionGuard>


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
                ],
                state: true,
                actions: true,
              }}
              tbody={{
                data: paginatedData.map((a) => {
                  const guardian = getGuardianById(a.acudiente);
                  
                  // Mapear campos del backend al frontend
                  const firstName = a.firstName || a.nombres || "";
                  const lastName = a.lastName || a.apellidos || "";

                  return {
                    ...a,
                    nombreCompleto: `${firstName} ${lastName}`.trim() || "Sin nombre",
                    telefono: a.phoneNumber || a.telefono || "Sin teléfono",
                    acudienteNombre: guardian?.nombreCompleto || "Sin acudiente",
                  };
                }),
                dataPropertys: [
                  "nombreCompleto",
                  "categoria",
                  "telefono",
                  "acudienteNombre",
                ],
                state: true,
                stateMap: {
                  Vigente: "bg-green-100 text-green-800",
                  Suspendida: "bg-orange-100 text-orange-800",
                  Vencida: "bg-yellow-100 text-yellow-800",
                },
              }}
              onEdit={hasPermission('athletesSection', 'Editar') ? handleEdit : null}
              onDelete={hasPermission('athletesSection', 'Eliminar') ? handleDelete : null}
              onView={hasPermission('athletesSection', 'Ver') ? handleView : null}
              buttonConfig={{
                edit: (item) => ({ show: hasPermission('athletesSection', 'Editar') }),
                delete: (item) => {
                  const validation = canDeleteAthlete(item);
                  return {
                    show: hasPermission('athletesSection', 'Eliminar'),
                    disabled: !validation.canDelete,
                    title: validation.canDelete 
                      ? "Eliminar deportista" 
                      : `No se puede eliminar: ${validation.reason}`
                  };
                },
                view: (item) => ({ show: hasPermission('athletesSection', 'Ver') }),
              }}
              customActions={[
                {
                  onClick: (athlete) => handleManageGuardian(athlete),
                  label: <FaUserShield className="w-4 h-4" />,
                  className:
                    "p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors",
                  title: "Gestionar Acudiente"
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
        athletes={athletes}
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
        onDeleteGuardian={handleDeleteGuardian}
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
        referenceData={{ documentTypes: referenceData.guardianDocumentTypes || [] }}
      />

      <GuardianViewModal
        isOpen={isGuardianViewOpen}
        onClose={() => setIsGuardianViewOpen(false)}
        guardian={guardianToView}
        athletes={athletes.filter((a) => String(a.acudiente) === String(guardianToView?.id))}
        onEdit={handleEditGuardian}
        onDelete={handleDeleteGuardian}
        referenceData={{ documentTypes: referenceData.guardianDocumentTypes || [] }}
      />

    </div>
  );
};

export default Athletes;