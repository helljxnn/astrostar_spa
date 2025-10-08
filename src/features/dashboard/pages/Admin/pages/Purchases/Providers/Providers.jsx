// src/features/dashboard/pages/Admin/pages/Providers/Providers.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import ProviderModal from "./components/ProviderModal.jsx";
import ProviderViewModal from "./components/ProviderViewModal.jsx";
import Table from "../../../../../../../shared/components/Table/table.jsx";
import Pagination from "../../../../../../../shared/components/Table/Pagination.jsx";
import SearchInput from "../../../../../../../shared/components/SearchInput.jsx";
import ReportButton from "../../../../../../../shared/components/ReportButton.jsx";
import providersData from "../../../../../../../shared/models/ProvidersData.jsx";
import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteAlert,
} from "../../../../../../../shared/utils/alerts.js";

// 🔑 Clave única para LocalStorage
const LOCAL_STORAGE_KEY = "providers";

const Providers = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 🟢 Estado inicial cargado desde LocalStorage o desde providersData
  const [data, setData] = useState(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : providersData;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [providerToEdit, setProviderToEdit] = useState(null);
  const [providerToView, setProviderToView] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // 🟢 Guardar en LocalStorage cada vez que cambien los datos
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // 🟢 Abrir modal de creación si se navega con el estado adecuado
  useEffect(() => {
    if (location.state?.openCreateModal) {
      setModalMode("create");
      setProviderToEdit(null);
      setIsModalOpen(true);
      // Limpiar el estado para que no se vuelva a abrir al recargar
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);


  // 📞 Formatear teléfono sin +57
  const formatPhoneNumber = (phone) => {
    if (!phone) return phone;
    return phone.replace(/[\s\-\(\)\+57]/g, ""); // limpiar espacios, guiones, paréntesis y +57
  };

  // 🔎 Filtrado
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(
      (provider) =>
        provider.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.nit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.contactoPrincipal
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handlePageChange = (page) => setCurrentPage(page);

  //  Crear proveedor
  const handleSave = (newProvider) => {
    const newEntry = {
      ...newProvider,
      id: Date.now(),
      telefono: formatPhoneNumber(newProvider.telefono),
    };
    setData([...data, newEntry]);
    showSuccessAlert("Proveedor creado", "El proveedor se creó correctamente.");
    setIsModalOpen(false);
  };

  //  Editar proveedor
  const handleUpdate = (updatedProvider) => {
    const updatedEntry = {
      ...updatedProvider,
      telefono: formatPhoneNumber(updatedProvider.telefono),
    };
    setData(data.map((p) => (p.id === updatedEntry.id ? updatedEntry : p)));
    showSuccessAlert(
      "Proveedor actualizado",
      "El proveedor se actualizó correctamente."
    );
    setIsModalOpen(false);
  };

  //  Abrir modal de edición
  const handleEdit = (provider) => {
    if (!provider || provider.target) return;
    setProviderToEdit(provider);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  // Ver proveedor
  const handleView = (provider) => {
    if (!provider || provider.target) return;
    setProviderToView(provider);
    setIsViewModalOpen(true);
  };

  //  Eliminar proveedor
  const handleDelete = async (provider) => {
    if (!provider || !provider.id)
      return showErrorAlert("Error", "Proveedor no válido");

    const confirmResult = await showDeleteAlert(
      "¿Estás seguro?",
      `Se eliminará al proveedor ${provider.razonSocial}. Esta acción no se puede deshacer.`,
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" }
    );

    if (!confirmResult.isConfirmed) return;

    setData(data.filter((p) => p.id !== provider.id));
    showSuccessAlert(
      "Proveedor eliminado",
      `${provider.razonSocial} fue eliminado correctamente.`
    );
  };

  return (
    <div className="p-6 font-questrial w-full max-w-full">
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
                { header: "Razón Social", accessor: "razonSocial" },
                { header: "NIT", accessor: "nit" },
                { header: "Tipo de Entidad", accessor: "tipoEntidad" },
                { header: "Tipo Proveedor", accessor: "tipoProveedor" },
                { header: "Contacto Principal", accessor: "contactoPrincipal" },
                { header: "Correo", accessor: "correo" },
                { header: "Teléfono", accessor: "telefono" },
                { header: "Estado", accessor: "estado" },
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
          <div className="w-full overflow-x-auto bg-white rounded-lg">
            <div className="min-w-full">
              <Table
                thead={{
                  titles: [
                    "Razón Social",
                    "NIT",
                    "Entidad",
                    "Tipo Proveedor",
                    "Contacto",
                  ],
                  state: true,
                  actions: true,
                }}
                tbody={{
                  data: paginatedData,
                  dataPropertys: [
                    "razonSocial",
                    "nit",
                    "tipoEntidad",
                    "tipoProveedor",
                    "contactoPrincipal",
                  ],
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
          </div>

          <div className="w-full border-none shadow-none">
            <Pagination
              currentPage={currentPage}
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
