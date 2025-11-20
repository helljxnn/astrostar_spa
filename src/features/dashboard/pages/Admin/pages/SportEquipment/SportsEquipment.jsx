import React, { useState, useMemo, useEffect } from "react";
import Table from "../../../../../../shared/components/Table/table";
import { SiGoogleforms } from "react-icons/si";
import { FaMinusCircle } from "react-icons/fa";
import FormCreate from "./components/formCreate";
import FormEdit from "./components/formEdit";
import Disposals from "./components/disposals";
import ViewDetails from "../../../../../../shared/components/ViewDetails";
import ReportButton from "../../../../../../shared/components/ReportButton";
import SearchInput from "../../../../../../shared/components/SearchInput";
import PermissionGuard from "../../../../../../shared/components/PermissionGuard";
import { usePermissions } from "../../../../../../shared/hooks/usePermissions";
import {
  showSuccessAlert, showConfirmAlert, showErrorAlert
} from "../../../../../../shared/utils/alerts";
import Pagination from "../../../../../../shared/components/Table/Pagination"; // Importar el componente Pagination
import sportsEquipmentService from "../../../../../../shared/services/sportsEquipmentService"; // Importamos el servicio

function SportsEquipment() {
  const { hasPermission } = usePermissions();

  const [equipmentList, setEquipmentList] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDisposalModalOpen, setIsDisposalModalOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [totalRows, setTotalRows] = useState(0); // Estado para el total de filas
  const [totalPages, setTotalPages] = useState(1);

  // Función reutilizable para formatear fechas de manera segura
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    // Si la fecha no es válida, retorna un guion
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("es-CO"); // Formato para Colombia (dd/mm/aaaa)
  };

  const reportData = useMemo(() => {
    return equipmentList.map(item => ({
      Nombre: item.name || '',
      "Cantidad Inicial": item.quantityInitial || 0,
      "Cantidad Total": item.quantityTotal || 0,
      Estado: item.status || 'N/A',
      "Fecha de Creación": formatDate(item.createdAt),
    }));
  }, [equipmentList]);

  const rowsPerPage = 10; // Definir el número de filas por página

  const fetchData = async (page, search) => {
    try {
      const params = { page, limit: rowsPerPage, search }; // Usar rowsPerPage
      const response = await sportsEquipmentService.getAll(params); // Usamos el servicio
      if (response.success) {
        // Pre-formatear las fechas antes de guardarlas en el estado
        const formattedEquipment = (response.data || []).map(item => ({ // Corregido: usar response.data directamente
          ...item,
          formattedCreatedAt: formatDate(item.createdAt),
        }));
        setEquipmentList(formattedEquipment);
        setTotalPages(response.pagination?.pages || 1);
        setTotalRows(response.pagination?.total || 0); // Establecer el total de filas
      }
    } catch (error) { // Manejo de errores mejorado
      showErrorAlert("Error al obtener material", error.message || "No se pudo obtener el material deportivo.");
    }
  };

  useEffect(() => {
    fetchData(currentPage, searchTerm);
  }, [currentPage, searchTerm]); // Se ejecuta cuando la página actual o el término de búsqueda cambian

  const handleCreate = async (dataForm) => {
    try {
      const response = await sportsEquipmentService.create(dataForm); // Usamos el servicio
      setIsCreateModalOpen(false);
      fetchData(1, "");
      showSuccessAlert("¡Guardado!", response.message || "Material guardado exitosamente");
    } catch (error) {
      showErrorAlert("Error al guardar", error.message || "No se pudo guardar el material");
    }
  };

  const handleUpdate = async (dataForm) => {
    if (!selectedEquipment?.id) return;
    try {
      const response = await sportsEquipmentService.update(selectedEquipment.id, dataForm); // Usamos el servicio
      setIsEditModalOpen(false);
      fetchData(currentPage, searchTerm);
      showSuccessAlert("¡Actualizado!", response.message || "Material actualizado exitosamente");
    } catch (error) {
      showErrorAlert("Error al actualizar", error.message || "No se pudo actualizar el material");
    }
  };

  const handleDelete = (item) => {
    showConfirmAlert(
      "¿Estás seguro?",
      `El equipo "${item.name}" será eliminado. Esta acción no se puede deshacer.`,
      "Sí, ¡eliminar!"
    ).then(async (result) => {
      // Si el usuario confirma la acción
      if (result.isConfirmed) {
        try {
          // Se ejecuta la petición para eliminar el equipo
          const response = await sportsEquipmentService.delete(item.id);
          showSuccessAlert("¡Eliminado!", response.message || "El equipo ha sido eliminado.");
          // Se actualiza la tabla para reflejar el cambio
          fetchData(currentPage, searchTerm);
        } catch (error) {
          showErrorAlert("Error", error.message || "No se pudo eliminar el equipo.");
        }
      }
    });
  };

  const handleCreateDisposal = async (disposalData) => {
    // El ID ahora viene del formulario del modal
    if (!disposalData.equipmentId) return;
    try {
      // Ahora enviamos directamente el objeto disposalData, ya que no hay archivos.
      await sportsEquipmentService.createDisposal(disposalData.equipmentId, {
        quantity: disposalData.quantity,
        reason: disposalData.reason,
        observation: disposalData.observation,
      });
      setIsDisposalModalOpen(false);
      showSuccessAlert("¡Éxito!", "La baja del material ha sido registrada.");
      fetchData(currentPage, searchTerm);
    } catch (error) {
      showErrorAlert("Error", error.message || "No se pudo registrar la baja.");
    }
  };

  const handleOpenEditModal = (item) => {
    setSelectedEquipment(item);
    setIsEditModalOpen(true);
  };

  const handleOpenViewDetails = async (item) => {
    try {
      const response = await sportsEquipmentService.getById(item.id); // Usamos el servicio
      // Formateamos las fechas de la respuesta antes de guardarla en el estado
      const formattedDetails = {
        ...response.data,
        formattedCreatedAt: formatDate(response.data.createdAt),
        formattedUpdatedAt: formatDate(response.data.updatedAt),
      };
      setSelectedEquipment(formattedDetails);
      setIsViewDetailsOpen(true);
    } catch (error) {
      showErrorAlert("Error al obtener detalles", error.message || "No se pudieron obtener los detalles.");
    }
  };

  const detailConfig = [
    { label: 'Nombre', key: 'name' },
    { label: 'Cantidad Inicial', key: 'quantityInitial', default: 0 },
    { label: 'Cantidad Total', key: 'quantityTotal', default: 0 },
    { label: 'Estado', key: 'status' },
    { label: 'Fecha de Creación', key: 'formattedCreatedAt' },
    { label: 'Última Actualización', key: 'formattedUpdatedAt' },
    { label: 'Historial de Bajas', key: 'disposals', type: 'history' },
  ];

  return (
    <div id="contentSportsEquipment" className="w-full h-auto p-4 md:p-8 space-y-4">
      <div id="header" className="w-full flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Material Deportivo</h1>
        <div id="action-buttons" className="flex items-center justify-end gap-4">
          <PermissionGuard module="sportsEquipment" action="Ver">
            <ReportButton
              data={reportData}
              fileName="Material_Deportivo"
              columns={[
                { header: "Nombre", accessor: "Nombre" },
                { header: "Cantidad Total", accessor: "Cantidad Total" },
                { header: "Estado", accessor: "Estado" },
                { header: "Fecha de Creación", accessor: "Fecha de Creación" },
              ]}
            />
          </PermissionGuard>
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar material..."
          />
          <PermissionGuard module="sportsEquipment" action="Crear">
            <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition whitespace-nowrap">
              Crear <SiGoogleforms size={20} />
            </button>
          </PermissionGuard>
          <button onClick={() => setIsDisposalModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition whitespace-nowrap">
            Dar de baja <FaMinusCircle size={20} />
          </button>
        </div>
      </div>
      <div id="body" className="w-full h-auto">
        <Table
          // El paginador se renderiza por separado, no como prop de la tabla
          thead={{
            titles: ["Nombre", "Cantidad Total", "Creado", "Estado"]
          }}
          tbody={{
            data: equipmentList,
            dataPropertys: ["name", "quantityTotal", "formattedCreatedAt", "status"],
          }}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
          onView={handleOpenViewDetails}
          buttonConfig={{
            edit: () => hasPermission('sportsEquipment', 'Editar'),
            delete: () => hasPermission('sportsEquipment', 'Eliminar'),
            view: () => hasPermission('sportsEquipment', 'Ver')
          }}
        />
        {/* Paginación */}
        {totalRows > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                // fetchData se llamará automáticamente por useEffect cuando currentPage cambie
              }}
              totalRows={totalRows}
              rowsPerPage={rowsPerPage}
              startIndex={(currentPage - 1) * rowsPerPage}
            />
          </div>
        )}
      </div>
      <FormCreate
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreate}
      />
      <FormEdit
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdate}
        equipmentData={selectedEquipment}
      />
      <Disposals
        isOpen={isDisposalModalOpen}
        onClose={() => setIsDisposalModalOpen(false)}
        onSave={handleCreateDisposal}
      />
      <ViewDetails
        isOpen={isViewDetailsOpen}
        onClose={() => setIsViewDetailsOpen(false)}
        data={selectedEquipment}
        detailConfig={detailConfig}
        title="Detalles del Material"
      />
    </div>
  );
}

export default SportsEquipment;
