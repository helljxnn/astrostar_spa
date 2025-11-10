import { useState, useMemo } from "react";
import Table from "../../../../../../../shared/components/Table/table.jsx";
import TemporaryPersonModal from "./components/TemporaryPersonModal.jsx";
import TemporaryPersonViewModal from "./components/TemporaryPersonViewModal.jsx";
import { FaPlus } from "react-icons/fa";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import Pagination from "../../../../../../../shared/components/Table/Pagination.jsx";
import ReportButton from "../../../../../../../shared/components/ReportButton.jsx";
import {
  showDeleteAlert,
  showErrorAlert,
  showSuccessAlert,
  showWarningAlert,
} from "../../../../../../../shared/utils/alerts.js";

// Importaciones para permisos
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard.jsx";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions.js";

// Hook personalizado para personas temporales
import { useTemporaryPersons } from "./hooks/useTemporaryPersons.js";



const TemporaryPersons = () => {
  const { hasPermission } = usePermissions();
  const {
    temporaryPersons,
    loading,
    pagination,
    referenceData,
    createTemporaryPerson,
    updateTemporaryPerson,
    deleteTemporaryPerson,
    changePage,
  } = useTemporaryPersons();



  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [viewingPerson, setViewingPerson] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [searchTerm, setSearchTerm] = useState("");


  // Función para traducir estados
  const translateStatus = (status) => {
    const statusMap = {
      Active: "Activo",
      Inactive: "Inactivo",
    };
    return statusMap[status] || status;
  };

  // Función para traducir tipos de persona
  const translatePersonType = (personType) => {
    const typeMap = {
      Deportista: "Deportista",
      Entrenador: "Entrenador",
      Participante: "Participante",
    };
    return typeMap[personType] || personType;
  };

  // Filtrar datos localmente si hay término de búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm) return temporaryPersons;

    const searchLower = searchTerm.toLowerCase().trim();

    return temporaryPersons.filter((person) => {
      // Campos de texto general (búsqueda por contiene)
      const textFields = [
        person.firstName,
        person.middleName,
        person.lastName,
        person.secondLastName,
        person.email,
        person.identification,
        person.phone,
        person.team,
        person.category,
      ];

      const textMatch = textFields.some(
        (field) =>
          field &&
          String(field).toLowerCase().includes(searchLower)
      );

      // Campos de estado y tipo (búsqueda exacta de palabra completa)
      const translatedStatus = translateStatus(person.status).toLowerCase();
      const translatedType = translatePersonType(person.personType).toLowerCase();
      
      // Buscar como palabra completa para evitar que "activo" encuentre "inactivo"
      const statusMatch = translatedStatus === searchLower || 
                         person.status?.toLowerCase() === searchLower;
      const typeMatch = translatedType === searchLower || 
                       person.personType?.toLowerCase() === searchLower;

      return textMatch || statusMatch || typeMatch;
    });
  }, [temporaryPersons, searchTerm]);

  // Usar paginación del servidor cuando no hay búsqueda local
  const displayData = searchTerm ? filteredData : temporaryPersons;
  const totalRows = searchTerm ? filteredData.length : pagination.total;

  // Preparar datos para reporte
  const reportData = displayData.map((person) => ({
    tipoDocumento: person.documentType?.name || "",
    identificacion: person.identification || "",
    primerNombre: person.firstName || "",
    segundoNombre: person.middleName || "",
    primerApellido: person.lastName || "",
    segundoApellido: person.secondLastName || "",
    correo: person.email || "",
    telefono: person.phone || "",
    fechaNacimiento: person.birthDate || "",
    edad: person.age || "",
    direccion: person.address || "",
    equipo: person.team || "(no asignado)",
    categoria: person.category || "(no asignado)",
    tipoPersona: translatePersonType(person.personType) || "",
    estado: translateStatus(person.status) || "",
    fechaCreacion: person.createdAt || "",
  }));

  const reportColumns = [
    { header: "Tipo Documento", accessor: "tipoDocumento" },
    { header: "Identificación", accessor: "identificacion" },
    { header: "Primer Nombre", accessor: "primerNombre" },
    { header: "Segundo Nombre", accessor: "segundoNombre" },
    { header: "Primer Apellido", accessor: "primerApellido" },
    { header: "Segundo Apellido", accessor: "segundoApellido" },
    { header: "Correo", accessor: "correo" },
    { header: "Teléfono", accessor: "telefono" },
    { header: "Fecha Nacimiento", accessor: "fechaNacimiento" },
    { header: "Edad", accessor: "edad" },
    { header: "Dirección", accessor: "direccion" },
    { header: "Equipo", accessor: "equipo" },
    { header: "Categoría", accessor: "categoria" },
    { header: "Tipo Persona", accessor: "tipoPersona" },
    { header: "Estado", accessor: "estado" },
    { header: "Fecha Creación", accessor: "fechaCreacion" },
  ];

  const handleSave = async (personData) => {
    try {

      if (editingPerson) {
        // Editar - verificar permisos
        if (!hasPermission("temporaryWorkers", "Editar")) {
          showErrorAlert(
            "Sin permisos",
            "No tienes permisos para editar personas temporales"
          );
          return false;
        }

        const result = await updateTemporaryPerson(editingPerson.id, personData);
        
        // Mostrar advertencias si las hay
        if (result.warnings && result.warnings.length > 0) {
          showWarningAlert(
            "Actualización completada con advertencias",
            result.warnings.join('. ')
          );
        } else {
          showSuccessAlert(
            "Persona Temporal Actualizada",
            "La persona temporal ha sido actualizada exitosamente"
          );
        }
      } else {
        // Crear - verificar permisos
        if (!hasPermission("temporaryWorkers", "Crear")) {
          showErrorAlert(
            "Sin permisos",
            "No tienes permisos para crear personas temporales"
          );
          return false;
        }

        const result = await createTemporaryPerson(personData);
        
        // Mostrar advertencias si las hay
        if (result.warnings && result.warnings.length > 0) {
          showWarningAlert(
            "Persona creada con advertencias",
            result.warnings.join('. ')
          );
        } else {
          showSuccessAlert(
            "Persona Temporal Creada",
            "La persona temporal ha sido creada exitosamente"
          );
        }
      }

      setEditingPerson(null);
      setIsModalOpen(false);
      return true;
    } catch (error) {
      // Manejar errores específicos del servidor
      if (error.response && error.response.data) {
        const serverErrors = error.response.data.errors;
        if (serverErrors && Array.isArray(serverErrors)) {
          const errorMessages = serverErrors.map(err => err.message).join('. ');
          showErrorAlert("Errores de validación del servidor", errorMessages);
        } else {
          showErrorAlert("Error del servidor", error.response.data.message || "Error desconocido");
        }
      } else {
        showErrorAlert("Error de conexión", "No se pudo conectar con el servidor");
      }
      return false;
    }
  };

  const handleEdit = (person) => {
    if (!hasPermission("temporaryWorkers", "Editar")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para editar personas temporales"
      );
      return;
    }

    setEditingPerson(person);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleView = (person) => {
    if (!hasPermission("temporaryWorkers", "Ver")) {
      showErrorAlert("Sin permisos", "No tienes permisos para ver personas temporales");
      return;
    }
    setViewingPerson(person);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (person) => {
    if (!hasPermission("temporaryWorkers", "Eliminar")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para eliminar personas temporales"
      );
      return;
    }

    // Validaciones previas a la eliminación
    const deleteValidationErrors = validatePersonForDeletion(person);
    if (deleteValidationErrors.length > 0) {
      showErrorAlert(
        "No se puede eliminar",
        deleteValidationErrors.join('. ')
      );
      return;
    }

    try {
      const personName = `${person.firstName || ""} ${person.middleName || ""} ${person.lastName || ""} ${person.secondLastName || ""}`.replace(/\s+/g, ' ').trim();
      
      const result = await showDeleteAlert(
        "¿Eliminar persona temporal?",
        `Se eliminará permanentemente la persona temporal: ${personName}. Esta acción no se puede deshacer.`
      );

      if (result.isConfirmed) {
        await deleteTemporaryPerson(person.id, personName);
        showSuccessAlert(
          "Persona eliminada",
          `La persona temporal "${personName}" ha sido eliminada exitosamente`
        );
      }
    } catch (error) {
      // Manejar errores específicos
      if (error.response && error.response.data) {
        showErrorAlert("Error al eliminar", error.response.data.message);
      } else {
        showErrorAlert("Error de conexión", "No se pudo eliminar la persona temporal");
      }
    }
  };

  // Función para validar si una persona puede ser eliminada
  const validatePersonForDeletion = (person) => {
    const errors = [];

    // Verificar si la persona está activa
    if (person.status === "Active") {
      errors.push('No se puede eliminar una persona temporal con estado "Activo". Primero cambie el estado a "Inactivo"');
    }

    // Verificar si tiene datos críticos que impidan la eliminación
    if (person.teamMembers && person.teamMembers.length > 0) {
      errors.push('Esta persona está asignada a equipos y no puede ser eliminada');
    }

    // Verificar si es un entrenador con deportistas asignados
    if (person.personType === 'Entrenador' && person.team) {
      errors.push('Los entrenadores con equipos asignados no pueden ser eliminados directamente');
    }

    return errors;
  };

  return (
    <div className="p-6 font-questrial">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Personas Temporales</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // Si hay búsqueda, no cambiar página del servidor
              if (!e.target.value) {
                changePage(1);
              }
            }}
            placeholder="Buscar persona temporal..."
          />

          <div className="flex items-center gap-3">
            <PermissionGuard module="temporaryWorkers" action="Ver">
              <ReportButton
                data={reportData}
                fileName="Reporte_Personas_Temporales"
                columns={reportColumns}
              />
            </PermissionGuard>

            <PermissionGuard module="temporaryWorkers" action="Crear">
              <button
                onClick={() => {
                  setEditingPerson(null);
                  setModalMode("create");
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
              >
                <FaPlus /> Crear
              </button>
            </PermissionGuard>
          </div>
        </div>
      </div>





      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
          <span className="ml-2 text-gray-600">Cargando personas temporales...</span>
        </div>
      ) : (
        <>
          <Table
            thead={{
              titles: ["Nombre Completo", "Identificación", "Tipo", "Estado"],
              state: false,
              actions: true,
            }}
            tbody={{
              data: displayData.map((person) => ({
                ...person,
                nombreCompleto: `${person.firstName || ""} ${person.middleName || ""} ${person.lastName || ""} ${person.secondLastName || ""}`.replace(/\s+/g, ' ').trim(),
                identificacion: person.identification || "No especificado",
                tipoPersona: translatePersonType(person.personType) || "",
                estado: translateStatus(person.status) || "",
              })),
              dataPropertys: [
                "nombreCompleto",
                "identificacion",
                "tipoPersona",
                "estado",
              ],
              state: true,
            }}
            onEdit={hasPermission("temporaryWorkers", "Editar") ? handleEdit : null}
            onDelete={
              hasPermission("temporaryWorkers", "Eliminar") ? handleDelete : null
            }
            onView={hasPermission("temporaryWorkers", "Ver") ? handleView : null}
            buttonConfig={{
              edit: () => ({
                show: hasPermission("temporaryWorkers", "Editar"),
                disabled: false,
                title: "Editar persona temporal",
              }),
              delete: (person) => ({
                show: hasPermission("temporaryWorkers", "Eliminar"),
                disabled: person.status === "Active",
                title:
                  person.status === "Active"
                    ? "No se puede eliminar una persona temporal activa"
                    : "Eliminar persona temporal",
              }),
              view: () => ({
                show: hasPermission("temporaryWorkers", "Ver"),
                disabled: false,
                title: "Ver detalles",
              }),
            }}
          />

          {totalRows > pagination.limit && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={changePage}
              totalRows={totalRows}
              rowsPerPage={pagination.limit}
              startIndex={(pagination.page - 1) * pagination.limit}
            />
          )}
        </>
      )}

      <TemporaryPersonModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPerson(null);
          setModalMode("create");
        }}
        onSave={handleSave}
        person={editingPerson}
        mode={modalMode}
        referenceData={referenceData}
      />

      <TemporaryPersonViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingPerson(null);
        }}
        person={viewingPerson}
        referenceData={referenceData}
      />
    </div>
  );
};

export default TemporaryPersons;