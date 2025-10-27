// src/features/dashboard/pages/Admin/pages/Providers/Providers.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import ProviderModal from "./components/ProviderModal.jsx";
import ProviderViewModal from "./components/ProviderViewModal.jsx";
import Table from "../../../../../../../shared/components/Table/table.jsx";
import Pagination from "../../../../../../../shared/components/Table/Pagination.jsx";
import SearchInput from "../../../../../../../shared/components/SearchInput.jsx";
import ReportButton from "../../../../../../../shared/components/ReportButton.jsx";
// ✅ CORRECCIÓN: Ruta al servicio frontend que hace peticiones HTTP
import providersService from "./services/ProvidersService.js";
import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteAlert,
} from "../../../../../../../shared/utils/alerts.js";

const Providers = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Estados
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [providerToEdit, setProviderToEdit] = useState(null);
  const [providerToView, setProviderToView] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const rowsPerPage = 5;

  // Cargar proveedores desde la API con logs de debug
  const fetchProviders = async () => {
    try {
      setLoading(true);
      console.log("🔄 Iniciando carga de proveedores...");
      
      const response = await providersService.getProviders({
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm,
      });

      console.log("📦 Respuesta del servidor:", response);

      if (response.success) {
        console.log("✅ Proveedores cargados:", response.data?.length || 0);
        setData(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
        setTotalRows(response.pagination?.total || 0);
      } else {
        console.warn("⚠️ Respuesta no exitosa:", response);
        showErrorAlert("Error", "No se pudieron cargar los proveedores");
      }
    } catch (error) {
      console.error("❌ Error fetching providers:", error);
      console.error("❌ Detalles del error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      showErrorAlert("Error", "Error al cargar los proveedores desde el servidor");
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos cuando cambien los filtros o la página
  useEffect(() => {
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  // Abrir modal de creación si se navega con el estado adecuado
  useEffect(() => {
    if (location.state?.openCreateModal) {
      setModalMode("create");
      setProviderToEdit(null);
      setIsModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Formatear teléfono sin +57
  const formatPhoneNumber = (phone) => {
    if (!phone) return phone;
    return phone.replace(/[\s\-\(\)\+57]/g, "");
  };

  // Formatear NIT (solo números)
  const formatNIT = (nit) => {
    if (!nit) return nit;
    return nit.replace(/[^\d]/g, ""); // Elimina todo excepto dígitos
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Crear proveedor
  const handleSave = async (newProvider) => {
    try {
      console.log("➕ Creando proveedor:", newProvider);
      
      const providerData = {
        ...newProvider,
        telefono: formatPhoneNumber(newProvider.telefono),
      };

      const response = await providersService.createProvider(providerData);

      if (response.success) {
        showSuccessAlert("Proveedor creado", "El proveedor se creó correctamente.");
        setIsModalOpen(false);
        fetchProviders(); // Recargar lista
      } else {
        showErrorAlert("Error", response.message || "No se pudo crear el proveedor");
      }
    } catch (error) {
      console.error("❌ Error creating provider:", error);
      showErrorAlert("Error", "Error al crear el proveedor en el servidor");
    }
  };

  // Editar proveedor
  const handleUpdate = async (updatedProvider) => {
    try {
      console.log("✏️ Actualizando proveedor:", updatedProvider);
      
      const providerData = {
        ...updatedProvider,
        telefono: formatPhoneNumber(updatedProvider.telefono),
      };

      const response = await providersService.updateProvider(
        updatedProvider.id,
        providerData
      );

      if (response.success) {
        showSuccessAlert(
          "Proveedor actualizado",
          "El proveedor se actualizó correctamente."
        );
        setIsModalOpen(false);
        fetchProviders(); // Recargar lista
      } else {
        showErrorAlert("Error", response.message || "No se pudo actualizar el proveedor");
      }
    } catch (error) {
      console.error("❌ Error updating provider:", error);
      showErrorAlert("Error", "Error al actualizar el proveedor en el servidor");
    }
  };

  // Abrir modal de edición
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

  // Eliminar proveedor
  const handleDelete = async (provider) => {
    if (!provider || !provider.id) {
      return showErrorAlert("Error", "Proveedor no válido");
    }

    // Confirmación de eliminación
    const confirmResult = await showDeleteAlert(
      "¿Estás seguro?",
      `Se eliminará al proveedor ${provider.razonSocial}. Esta acción no se puede deshacer.`,
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" }
    );

    if (!confirmResult.isConfirmed) return;

    try {
      console.log("🗑️ Eliminando proveedor:", provider.id);
      
      const response = await providersService.deleteProvider(provider.id);

      if (response.success) {
        showSuccessAlert(
          "Proveedor eliminado",
          `${provider.razonSocial} fue eliminado correctamente.`
        );
        fetchProviders(); // Recargar lista
      } else {
        showErrorAlert("Error", response.message || "No se pudo eliminar el proveedor");
      }
    } catch (error) {
      console.error("❌ Error deleting provider:", error);
      showErrorAlert("Error", "Error al eliminar el proveedor en el servidor");
    }
  };

  // Calcular índice de inicio para la paginación
  const startIndex = (currentPage - 1) * rowsPerPage;

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
              data={data}
              fileName="Proveedores"
              columns={[
                { header: "Razón Social", accessor: "razonSocial" },
                { header: "NIT", accessor: "nit" },
                { header: "Tipo de Entidad", accessor: "tipoEntidad" },
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
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
            >
              <FaPlus /> Crear Proveedor
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center text-gray-500 mt-10 py-8 bg-white rounded-2xl shadow border border-gray-200">
          Cargando proveedores...
        </div>
      ) : totalRows > 0 ? (
        <>
          <div className="w-full overflow-x-auto bg-white rounded-lg">
            <div className="min-w-full">
              <Table
                thead={{
                  titles: [
                    "Razón Social",
                    "NIT",
                    "Entidad",
                    "Correo",
                    "Contacto",
                  ],
                  state: true,
                  actions: true,
                }}
                tbody={{
                  data: data,
                  dataPropertys: [
                    "razonSocial",
                    "nit",
                    "tipoEntidad",
                    "correo",
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