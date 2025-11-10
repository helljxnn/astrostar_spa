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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const reportData = useMemo(() => {
    return equipmentList.map(item => ({
      Name: item.name || '',
      InitialQuantity: item.quantityInitial || 0,
      TotalQuantity: item.quantityTotal || 0,
      Status: item.status || 'N/A',
      CreationDate: new Date(item.createdAt).toLocaleDateString() || '',
    }));
  }, [equipmentList]);

  const fetchData = async (page, search) => {
    try {
      const params = { page, limit: rowsPerPage, search };
      const response = await sportsEquipmentService.getAll(params); // Usamos el servicio
      if (response.success) {
        setEquipmentList(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
      }
    } catch (error) { // Manejo de errores mejorado
      showErrorAlert("Could not fetch sports equipment.", error.message);
    }
  };

  useEffect(() => {
    fetchData(currentPage, searchTerm);
  }, [currentPage, searchTerm, rowsPerPage]);

  const handleCreate = async (dataForm) => {
    try {
      const response = await sportsEquipmentService.create(dataForm); // Usamos el servicio
      setIsCreateModalOpen(false);
      fetchData(1, "");
      showSuccessAlert("Equipment saved successfully", response.message); // Usamos el mensaje del backend
    } catch (error) {
      showErrorAlert("Could not save equipment", error.message);
    }
  };

  const handleUpdate = async (dataForm) => {
    if (!selectedEquipment?.id) return;
    try {
      const response = await sportsEquipmentService.update(selectedEquipment.id, dataForm); // Usamos el servicio
      setIsEditModalOpen(false);
      fetchData(currentPage, searchTerm);
      showSuccessAlert("Equipment updated successfully", response.message); // Usamos el mensaje del backend
    } catch (error) {
      showErrorAlert("Could not update equipment", error.message);
    }
  };

  const handleDelete = (item) => {
    showConfirmAlert(
      'Are you sure?',
      `Equipment "${item.name}" will be deleted. This action cannot be undone.`,
      async () => {
        try {
          await sportsEquipmentService.delete(item.id); // Usamos el servicio
          showSuccessAlert('Deleted', 'The equipment has been deleted.');
          fetchData(currentPage, searchTerm);
        } catch (error) {
          showErrorAlert('Error', error.message);
        }
      }
    );
  };

  const handleCreateDisposal = async (disposalData) => {
    // El ID ahora viene del formulario del modal
    if (!disposalData.equipmentId) return;
    try {
      await sportsEquipmentService.createDisposal(disposalData.equipmentId, disposalData); // Usamos el servicio
      setIsDisposalModalOpen(false);
      showSuccessAlert("Success", "Equipment disposal has been registered.");
      fetchData(currentPage, searchTerm);
    } catch (error) {
      showErrorAlert("Error", error.message || "Could not register disposal.");
    }
  };

  const handleOpenEditModal = (item) => {
    setSelectedEquipment(item);
    setIsEditModalOpen(true);
  };

  const handleOpenViewDetails = async (item) => {
    try {
      const response = await sportsEquipmentService.getById(item.id); // Usamos el servicio
      setSelectedEquipment(response.data);
      setIsViewDetailsOpen(true);
    } catch (error) {
      showErrorAlert("Could not fetch details", error.message);
    }
  };

  const detailConfig = [
    { label: 'Name', key: 'name' },
    { label: 'Initial Quantity', key: 'quantityInitial', default: 0 },
    { label: 'Total Quantity', key: 'quantityTotal', default: 0 },
    { label: 'Status', key: 'status' },
    { label: 'Creation Date', key: 'createdAt', format: (date) => new Date(date).toLocaleDateString() },
    { label: 'Last Update', key: 'updatedAt', format: (date) => new Date(date).toLocaleDateString() },
  ];

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Resetear a la primera página
  };

  return (
    <div id="contentSportsEquipment" className="w-full h-auto grid grid-rows-[auto_1fr] relative">
      <div id="header" className="w-full h-auto p-8">
        <h1 className="text-4xl font-bold text-gray-800">Sports Equipment</h1>
      </div>
      <div id="body" className="w-full h-auto grid grid-rows-[auto_1fr] gap-2 p-4">
        <div id="actionButtons" className="w-full h-auto p-2 flex flex-row justify-between items-center">
          <div className="flex items-center gap-4">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search equipment..."
            />
            <div className="flex items-center gap-2">
              <label htmlFor="rowsPerPage" className="text-sm font-medium text-gray-600">Rows:</label>
              <select
                id="rowsPerPage"
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple"
              >
                <option value={5}>5</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
              </select>
            </div>
          </div>
          <div id="buttons" className="h-auto flex flex-row items-center justify-end gap-4">
            <PermissionGuard module="sportsEquipment" action="Ver">
              <ReportButton
                data={reportData}
                fileName="Sports_Equipment"
                columns={[
                  { header: "Name", accessor: "Name" },
                  { header: "Total Quantity", accessor: "TotalQuantity" },
                  { header: "Status", accessor: "Status" },
                  { header: "Creation Date", accessor: "CreationDate" },
                ]}
              />
            </PermissionGuard>
            <PermissionGuard module="sportsEquipment" action="Crear">
              <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow hover:opacity-90 transition whitespace-nowrap">
                Create <SiGoogleforms size={20} />
              </button>
            </PermissionGuard>
            <button onClick={() => setIsDisposalModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition whitespace-nowrap">
              Dar de baja <FaMinusCircle size={20} />
            </button>
          </div>
        </div>
        <Table
          pagination={{ currentPage, setCurrentPage, totalPages }}
          thead={{
            titles: ["Name", "Total Quantity", "Created", "Status"]
          }}
          tbody={{
            data: equipmentList,
            dataPropertys: ["name", "quantityTotal", "createdAt", "status"],
            customRenderers: {
              createdAt: (date) => date ? new Date(date).toLocaleDateString("en-US") : "-",
            },
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
        title="Equipment Details"
      />
    </div>
  );
}

export default SportsEquipment;
