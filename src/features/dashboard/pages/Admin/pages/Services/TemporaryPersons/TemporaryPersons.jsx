import { useState, useMemo } from "react";
import Table from "../../../../../../../shared/components/Table/table.jsx";
import TemporaryPersonModal from "./components/TemporaryPersonModal.jsx";
import TemporaryPersonViewModal from "./components/TemporaryPersonViewModal.jsx";
import { FaPlus } from "react-icons/fa";
import SearchInput from "../../../../../../../shared/components/SearchInput.jsx";
import Pagination from "../../../../../../../shared/components/Table/Pagination.jsx";
import ReportButton from "../../../../../../../shared/components/ReportButton.jsx";
import {
  showDeleteAlert,
  showErrorAlert,
  showSuccessAlert,
} from "../../../../../../../shared/utils/alerts.js";

// Importaciones para permisos
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard.jsx";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions.js";

// Hook personalizado para personas temporales
import { useTemporaryPersons } from "../../../../../../../shared/hooks/useTemporaryPersons.js";

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

  // Filtrar datos localmente si hay término de búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm) return temporaryPersons;

    return temporaryPersons.filter((person) => {
      const searchFields = [
        person.firstName,
        person.lastName,
        person.email,
        person.identification,
        person.phone,
        person.personType,
        person.team,
        person.category,
      ];

      return searchFields.some(
        (field) =>
          field &&
          String(field).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [temporaryPersons, searchTerm]);

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

  // Usar paginación del servidor cuando no hay búsqueda local
  const displayData = searchTerm ? filteredData : temporaryPersons;
  const totalRows = searchTerm ? filteredData.length : pagination.total;

  // Preparar datos para reporte
  const reportData = displayData.map((person) => ({
    tipoDocumento: person.documentType?.name || "",
    identificacion: person.identification || "",
    nombre: person.firstName || "",
    apellido: person.lastName || "",
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
    { header: "Nombre", accessor: "nombre" },
    { header: "Apellido", accessor: "apellido" },
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
        await updateTemporaryPerson(editingPerson.id, personData);
        showSuccessAlert(
          "Persona Temporal Actualizada",
          "La persona temporal ha sido actualizada exitosamente"
        );
      } else {
        // Crear - verificar permisos
        if (!hasPermission("temporaryWorkers", "Crear")) {
          showErrorAlert(
            "Sin permisos",
            "No tienes permisos para crear personas temporales"
          );
          return false;
        }
        await createTemporaryPerson(personData);
        showSuccessAlert(
          "Persona Temporal Creada",
          "La persona temporal ha sido creada exitosamente"
        );
      }

      setEditingPerson(null);
      setIsModalOpen(false);
      return true;
    } catch (error) {
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

    // Verificar si la persona está activa
    if (person.status === "Active") {
      showErrorAlert(
        "No se puede eliminar",
        'No se puede eliminar una persona temporal con estado "Activo". Primero cambie el estado a "Inactivo" y luego inténtelo de nuevo.'
      );
      return;
    }

    try {
      const personName = `${person.firstName || ""} ${
        person.lastName || ""
      }`.trim();
      const result = await showDeleteAlert(
        "¿Eliminar persona temporal?",
        `Se eliminará permanentemente la persona temporal: ${personName}`
      );

      if (result.isConfirmed) {
        await deleteTemporaryPerson(person.id, personName);
      }
    } catch (error) {
      // Error ya manejado por el hook
    }
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
                nombreCompleto: `${person.firstName || ""} ${
                  person.lastName || ""
                }`.trim(),
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