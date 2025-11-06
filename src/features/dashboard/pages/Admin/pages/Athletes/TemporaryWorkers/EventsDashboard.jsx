import React, { useState, useEffect, useMemo } from "react";
import Table from "../../../../../../../shared/components/Table/table";
import TemporaryWorkerModal from "./components/TemporaryWorkerModal";
import temporaryWorkersService from "../../../../../../../shared/services/temporaryWorkersService";
import { FaPlus } from "react-icons/fa";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import Pagination from "../../../../../../../shared/components/Table/Pagination";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import {
  showDeleteAlert,
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../shared/utils/alerts";

// Importaciones para permisos
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";

const TemporaryWorkers = () => {
  const { hasPermission } = usePermissions();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [modalMode, setModalMode] = useState("create"); // "create", "edit", "view"
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [referenceData, setReferenceData] = useState({ documentTypes: [] });
  const rowsPerPage = 10;

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
    loadReferenceData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await temporaryWorkersService.getAll({
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm
      });
      
      if (response.success) {
        // Mapear datos del backend al formato del frontend
        const mappedData = response.data.map(item => ({
          id: item.id,
          tipoPersona: item.personType,
          nombre: `${item.firstName} ${item.lastName || ''}`.trim(),
          tipoDocumento: item.documentType?.name || 'N/A',
          identificacion: item.identification || 'N/A',
          telefono: item.phone || 'N/A',
          fechaNacimiento: item.birthDate ? new Date(item.birthDate).toISOString().split('T')[0] : '',
          edad: item.age || 0,
          categoria: 'No asignada', // Por ahora no manejamos categorías
          equipo: null, // Por ahora no manejamos equipos
          estado: item.status === 'Active' ? 'Activo' : 'Inactivo',
          // Datos adicionales para el modal
          email: item.email || '',
          address: item.address || '',
          organization: item.organization || '',
          documentTypeId: item.documentTypeId
        }));
        setData(mappedData);
      }
    } catch (error) {
      console.error('Error loading temporary workers:', error);
      showErrorAlert('Error', 'No se pudieron cargar las personas temporales.');
    } finally {
      setLoading(false);
    }
  };

  const loadReferenceData = async () => {
    try {
      const response = await temporaryWorkersService.getReferenceData();
      if (response.success) {
        setReferenceData(response.data);
      }
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  };

  // Recargar datos cuando cambie la página o búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadData();
    }, 300); // Debounce para búsqueda

    return () => clearTimeout(timeoutId);
  }, [currentPage, searchTerm]);

  // Filtrar datos localmente (para compatibilidad con el componente actual)
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((item) =>
      Object.entries(item).some(([key, value]) => {
        const stringValue = String(value).trim();

        // Si es el campo Estado, comparar exacto y sensible a mayúsculas
        if (key.toLowerCase() === "estado") {
          return (
            (stringValue === "Activo" && searchTerm === "Activo") ||
            (stringValue === "Inactivo" && searchTerm === "Inactivo")
          );
        }

        // Para los demás campos, búsqueda parcial insensible a mayúsculas
        return stringValue.toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm]);

  // Paginación local (por ahora, luego se puede mover al servidor)
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const reportColumns = [
    { key: "tipoPersona", label: "Tipo de Persona" },
    { key: "nombre", label: "Nombre" },
    { key: "identificacion", label: "Identificación" },
    { key: "categoria", label: "Categoría" },
    { key: "edad", label: "Edad" },
    { key: "estado", label: "Estado" },
  ];

  // Mapear datos del frontend al backend
  const mapFrontendToBackend = (frontendData) => {
    const nombres = frontendData.nombre ? frontendData.nombre.split(' ') : [];
    
    return {
      firstName: nombres[0] || frontendData.firstName || '',
      lastName: nombres.slice(1).join(' ') || frontendData.lastName || frontendData.apellido || '',
      identification: frontendData.identificacion,
      email: frontendData.email || '',
      phone: frontendData.telefono,
      birthDate: frontendData.fechaNacimiento,
      age: parseInt(frontendData.edad) || 0,
      address: frontendData.address || '',
      organization: frontendData.organization || '',
      status: frontendData.estado === 'Activo' ? 'Active' : 'Inactive',
      documentTypeId: parseInt(frontendData.documentTypeId) || parseInt(frontendData.tipoDocumento),
      personType: frontendData.tipoPersona
    };
  };

  // Guardar nuevo o editado
  const handleSave = async (workerData) => {
    try {
      const backendData = mapFrontendToBackend(workerData);
      
      if (editingWorker) {
        // Editar - verificar permisos
        if (!hasPermission('temporaryWorkers', 'Editar')) {
          showErrorAlert('Sin permisos', 'No tienes permisos para editar trabajadores temporales');
          return false;
        }
        
        const response = await temporaryWorkersService.update(editingWorker.id, backendData);
        if (response.success) {
          showSuccessAlert('Éxito', response.message);
          await loadData(); // Recargar datos
          return true;
        }
      } else {
        // Crear - verificar permisos
        if (!hasPermission('temporaryWorkers', 'Crear')) {
          showErrorAlert('Sin permisos', 'No tienes permisos para crear trabajadores temporales');
          return false;
        }
        
        const response = await temporaryWorkersService.create(backendData);
        if (response.success) {
          showSuccessAlert('Éxito', response.message);
          await loadData(); // Recargar datos
          return true;
        }
      }
    } catch (error) {
      console.error('Error saving temporary worker:', error);
      const errorMessage = error.response?.data?.message || 'Error al guardar la persona temporal';
      showErrorAlert('Error', errorMessage);
      return false;
    }
  };

  // Abrir modal en modo edición
  const handleEdit = (worker) => {
    if (!hasPermission('temporaryWorkers', 'Editar')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para editar trabajadores temporales');
      return;
    }
    setEditingWorker(worker);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  // Ver persona temporal
  const handleView = (worker) => {
    if (!hasPermission('temporaryWorkers', 'Ver')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para ver trabajadores temporales');
      return;
    }
    setEditingWorker(worker);
    setModalMode("view");
    setIsModalOpen(true);
  };

  // Eliminar persona temporal
  const handleDelete = async (worker) => {
    if (!hasPermission('temporaryWorkers', 'Eliminar')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para eliminar trabajadores temporales');
      return;
    }
    
    try {
      const result = await showDeleteAlert(
        "¿Eliminar persona temporal?",
        `Se eliminará permanentemente a: ${worker.nombre}`
      );

      if (result.isConfirmed) {
        const response = await temporaryWorkersService.delete(worker.id);
        if (response.success) {
          showSuccessAlert('Éxito', response.message);
          await loadData(); // Recargar datos
        }
      }
    } catch (error) {
      console.error("Error al eliminar persona temporal:", error);
      const errorMessage = error.response?.data?.message || 'Error al eliminar la persona temporal';
      showErrorAlert('Error', errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="p-6 font-questrial">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Cargando personas temporales...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 font-questrial">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Personas Temporales
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar persona temporal..."
          />
          <div className="flex items-center gap-3">
            <PermissionGuard module="temporaryWorkers" action="Ver">
              <ReportButton
                data={filteredData}
                columns={reportColumns}
                fileName="Personas_Temporales"
              />
            </PermissionGuard>
            
            <PermissionGuard module="temporaryWorkers" action="Crear">
              <button
                onClick={() => {
                  setEditingWorker(null);
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

      {/* Tabla */}
      <Table
        thead={{
          titles: [
            "Tipo de Persona",
            "Nombre",
            "Identificación",
            "Teléfono",
            "Edad",
            "Estado"
          ],
          state: true,
          actions: true,
        }}
        tbody={{
          data: paginatedData,
          dataPropertys: [
            "tipoPersona",
            "nombre",
            "identificacion",
            "telefono",
            "edad",
            "estado"
          ],
          state: true,
        }}
        onEdit={hasPermission('temporaryWorkers', 'Editar') ? handleEdit : null}
        onDelete={hasPermission('temporaryWorkers', 'Eliminar') ? handleDelete : null}
        onView={hasPermission('temporaryWorkers', 'Ver') ? handleView : null}
        buttonConfig={{
          edit: (item) => ({
            show: hasPermission('temporaryWorkers', 'Editar'),
            disabled: false,
            title: 'Editar trabajador temporal'
          }),
          delete: (item) => ({
            show: hasPermission('temporaryWorkers', 'Eliminar'),
            disabled: false,
            title: 'Eliminar trabajador temporal'
          }),
          view: (item) => ({
            show: hasPermission('temporaryWorkers', 'Ver'),
            disabled: false,
            title: 'Ver detalles'
          })
        }}
      />

      {/* Paginación */}
      {totalRows > rowsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalRows={totalRows}
          rowsPerPage={rowsPerPage}
          startIndex={startIndex}
        />
      )}

      {/* Modal */}
      <TemporaryWorkerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWorker(null);
          setModalMode("create");
        }}
        onSave={handleSave}
        worker={editingWorker}
        mode={modalMode}
        referenceData={referenceData}
      />
    </div>
  );
};

export default TemporaryWorkers;