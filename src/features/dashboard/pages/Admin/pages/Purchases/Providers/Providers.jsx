// src/features/dashboard/pages/Admin/pages/Providers/Providers.jsx
import React, { useState, useMemo } from "react";
import { FaPlus } from "react-icons/fa";
import ProviderModal from "./components/ProviderModal.jsx";
import ProviderViewModal from "./components/ProviderViewModal.jsx";
import Table from "../../../../../../../shared/components/Table/table.jsx";
import Pagination from "../../../../../../../shared/components/Table/Pagination.jsx";
import SearchInput from "../../../../../../../shared/components/SearchInput.jsx";
import ReportButton from "../../../../../../../shared/components/ReportButton.jsx";
import providersData from "./ProvidersData.jsx";
import { showSuccessAlert, showErrorAlert, showDeleteAlert } from "../../../../../../../shared/utils/alerts.js";

const Providers = () => {
  const [data, setData] = useState(providersData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [providerToEdit, setProviderToEdit] = useState(null);
  const [providerToView, setProviderToView] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 5;

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(
      (provider) =>
        provider.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.nit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.contactoPrincipal.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleSave = (newProvider) => {
    const newEntry = { ...newProvider, id: Date.now() };
    setData([...data, newEntry]);
    showSuccessAlert("Proveedor creado", "El proveedor se creó correctamente.");
    setIsModalOpen(false);
  };

  const handleUpdate = (updatedProvider) => {
    setData(data.map((p) => (p.id === updatedProvider.id ? updatedProvider : p)));
    showSuccessAlert("Proveedor actualizado", "El proveedor se actualizó correctamente.");
    setIsModalOpen(false);
  };

  const handleEdit = (provider) => {
    if (!provider || provider.target) return;
    setProviderToEdit(provider);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleView = (provider) => {
    if (!provider || provider.target) return;
    setProviderToView(provider);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (provider) => {
    if (!provider || !provider.id) return showErrorAlert("Error", "Proveedor no válido");

    const confirmResult = await showDeleteAlert(
      "¿Estás seguro?",
      `Se eliminará al proveedor ${provider.razonSocial}. Esta acción no se puede deshacer.`,
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" }
    );

    if (!confirmResult.isConfirmed) return;

    setData(data.filter((p) => p.id !== provider.id));
    showSuccessAlert("Proveedor eliminado", `${provider.razonSocial} fue eliminado correctamente.`);
  };

  return (
    <div className="p-6 font-questrial w-full">
      {/* Header con buscador y botones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Proveedores</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar proveedor..."
            />
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3">
            <ReportButton
              data={filteredData}
              fileName="Proveedores"
              columns={[
                { key: "razonSocial", label: "Razón Social" },
                { key: "nit", label: "NIT" },
                { key: "tipoEntidad", label: "Tipo de Entidad" },
                { key: "tipoProveedor", label: "Tipo Proveedor" },
                { key: "contactoPrincipal", label: "Contacto Principal" },
                { key: "correo", label: "Correo" },
                { key: "telefono", label: "Teléfono" },
                { key: "estado", label: "Estado" },
              ]}
            />

            <button
              onClick={() => {
                setModalMode("create");
                setProviderToEdit(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow hover:opacity-90 transition whitespace-nowrap"
            >
              <FaPlus /> Crear Proveedor
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      {totalRows > 0 ? (
        <>
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <Table
              thead={{
                titles: ["Razón Social", "NIT", "Entidad", "Tipo Proveedor", "Contacto"],
                state: true,
                actions: true,
              }}
              tbody={{
                data: paginatedData,
                dataPropertys: ["razonSocial", "nit", "tipoEntidad", "tipoProveedor", "contactoPrincipal"],
                state: true,
                stateMap: {
                  Activo: "bg-green-100 text-green-800",
                  Inactivo: "bg-red-100 text-red-800",
                },
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          </div>

          {totalPages > 1 && (
            <div className="w-full mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalRows={totalRows}
                rowsPerPage={rowsPerPage}
                startIndex={startIndex}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-500 mt-10 py-8 bg-white rounded-2xl shadow border border-gray-200">
          No hay proveedores registrados todavía.
        </div>
      )}

      {/* Modal Crear/Editar */}
      <ProviderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onUpdate={handleUpdate}
        providerToEdit={providerToEdit}
        mode={modalMode}
      />

      {/* Modal Ver */}
      <ProviderViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        provider={providerToView}
      />
    </div>
  );
};

export default Providers;
