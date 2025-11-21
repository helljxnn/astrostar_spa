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
import providersService from "./services/ProvidersService.js";
import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteAlert,
} from "../../../../../../../shared/utils/alerts.js";
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard.jsx";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions.js";

const Providers = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
  const [activePurchasesCheck, setActivePurchasesCheck] = useState({});
  const rowsPerPage = 5;
  const { hasPermission } = usePermissions();

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await providersService.getProviders({
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm,
      });
      if (response.success) {
        setData(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
        setTotalRows(response.pagination?.total || 0);
        checkActivePurchasesForProviders(response.data || []);
      } else {
        showErrorAlert("Error", "No se pudieron cargar los proveedores");
      }
    } catch (error) {
      showErrorAlert("Error", "Error al cargar los proveedores desde el servidor");
    } finally {
      setLoading(false);
    }
  };

  const checkActivePurchasesForProviders = async (providers) => {
    const purchasesCheck = {};
    for (const provider of providers) {
      try {
        const response = await providersService.checkActivePurchases(provider.id);
        purchasesCheck[provider.id] = response.hasActivePurchases;
      } catch (error) {
        purchasesCheck[provider.id] = false;
      }
    }
    setActivePurchasesCheck(purchasesCheck);
  };

  useEffect(() => {
    fetchProviders();
  }, [currentPage, searchTerm]);

  useEffect(() => {
    if (location.state?.openCreateModal) {
      setModalMode("create");
      setProviderToEdit(null);
      setIsModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const formatPhoneNumber = (phone) => {
    if (!phone) return phone;
    return phone.replace(/[\s\-\(\)\+57]/g, "");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSave = async (newProvider) => {
    if (!hasPermission("providers", "Crear")) {
      showErrorAlert("Sin permisos", "No tienes permisos para crear proveedores");
      return { success: false }; // ← Retornar objeto con success: false
    }
    try {
      const providerData = {
        ...newProvider,
        telefono: formatPhoneNumber(newProvider.telefono),
      };
      const response = await providersService.createProvider(providerData);
      
      if (response.success) {
        showSuccessAlert("Proveedor creado", "El proveedor se creó correctamente.");
        setIsModalOpen(false);
        fetchProviders();
        return response; // ← IMPORTANTE: Retornar la respuesta exitosa
      } else {
        showErrorAlert("Error", response.message || "No se pudo crear el proveedor");
        return { success: false, message: response.message }; // ← Retornar error
      }
    } catch (error) {
      console.error('Error saving provider:', error);
      showErrorAlert("Error", "Error al crear el proveedor en el servidor");
      throw error; // ← IMPORTANTE: Lanzar el error para que el modal lo capture
    }
  };

  const handleUpdate = async (updatedProvider) => {
    if (!hasPermission("providers", "Editar")) {
      showErrorAlert("Sin permisos", "No tienes permisos para editar proveedores");
      return { success: false }; // ← Retornar objeto con success: false
    }
    try {
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
        fetchProviders();
        return response; 
      } else {
        showErrorAlert("Error", response.message || "No se pudo actualizar el proveedor");
        return { success: false, message: response.message }; // Retornar error
      }
    } catch (error) {
      console.error('Error updating provider:', error);
      showErrorAlert("Error", "Error al actualizar el proveedor en el servidor");
      throw error; 
    }
  };

  const handleEdit = (provider) => {
    if (!hasPermission("providers", "Editar")) {
      showErrorAlert("Sin permisos", "No tienes permisos para editar proveedores");
      return;
    }
    if (!provider || provider.target) return;
    setProviderToEdit(provider);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleView = (provider) => {
    if (!hasPermission("providers", "Ver")) {
      showErrorAlert("Sin permisos", "No tienes permisos para ver detalles de proveedores");
      return;
    }
    if (!provider || provider.target) return;
    setProviderToView(provider);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (provider) => {
    if (!hasPermission("providers", "Eliminar")) {
      showErrorAlert("Sin permisos", "No tienes permisos para eliminar proveedores");
      return;
    }
    if (!provider || !provider.id) {
      return showErrorAlert("Error", "Proveedor no válido");
    }
    if (provider.estado === "Activo") {
      return showErrorAlert(
        "No se puede eliminar",
        `No se puede eliminar el proveedor "${provider.razonSocial}" porque está en estado "Activo". Primero cambie el estado a "Inactivo".`
      );
    }
    if (activePurchasesCheck[provider.id]) {
      return showErrorAlert(
        "No se puede eliminar",
        `No se puede eliminar el proveedor "${provider.razonSocial}" porque tiene compras activas asociadas.`
      );
    }
    const confirmResult = await showDeleteAlert(
      "¿Estás seguro?",
      `Se eliminará al proveedor ${provider.razonSocial}. Esta acción no se puede deshacer.`,
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" }
    );
    if (!confirmResult.isConfirmed) return;
    try {
      const response = await providersService.deleteProvider(provider.id);
      if (response.success) {
        showSuccessAlert(
          "Proveedor eliminado",
          `${provider.razonSocial} fue eliminado correctamente.`
        );
        fetchProviders();
      } else {
        showErrorAlert("Error", response.message || "No se pudo eliminar el proveedor");
      }
    } catch (error) {
      showErrorAlert("Error", "Error al eliminar el proveedor en el servidor");
    }
  };

  const buttonConfig = {
    edit: (provider) => ({
      show: hasPermission("providers", "Editar"),
      disabled: false,
      title: "Editar proveedor",
    }),
    delete: (provider) => ({
      show: hasPermission("providers", "Eliminar"),
      disabled: provider.estado === "Activo" || activePurchasesCheck[provider.id],
      title:
        provider.estado === "Activo"
          ? "No se puede eliminar un proveedor activo"
          : activePurchasesCheck[provider.id]
          ? "No se puede eliminar con compras activas"
          : "Eliminar proveedor",
    }),
    view: () => ({
      show: hasPermission("providers", "Ver"),
      disabled: false,
      title: "Ver detalles",
    }),
  };

  const startIndex = (currentPage - 1) * rowsPerPage;

  return (
    <div className="p-6 font-questrial w-full max-w-full">
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
          <div className="flex flex-col sm:flex-row gap-3">
            <PermissionGuard module="providers" action="Ver">
            <ReportButton
    data={data}
    fileName="Proveedores"
    columns={[
      { header: "Razón Social", accessor: "razonSocial" },
      { header: "NIT/Documento", accessor: "nit" },
      { header: "Tipo de Entidad", accessor: "tipoEntidad" },
      { header: "Tipo de Documento", accessor: "tipoDocumento" },
      { header: "Contacto Principal", accessor: "contactoPrincipal" },
      { header: "Correo Electrónico", accessor: "correo" },
      { header: "Teléfono", accessor: "telefono" },
      { header: "Dirección", accessor: "direccion" },
      { header: "Ciudad", accessor: "ciudad" },
      { header: "Descripción", accessor: "descripcion" },
      { header: "Estado", accessor: "estado" },
      { 
        header: "Fecha de Registro", 
        accessor: "fechaRegistro",
        format: (value) => value ? new Date(value).toLocaleDateString('es-ES') : 'N/A'
      },
      { 
        header: "Última Actualización", 
        accessor: "updatedAt",
        format: (value) => value ? new Date(value).toLocaleDateString('es-ES') : 'N/A'
      }
    ]}
    customDataTransform={(provider) => ({
      ...provider,
      // Transformar tipoEntidad para que sea más legible
      tipoEntidad: provider.tipoEntidad === 'juridica' ? 'Persona Jurídica' : 'Persona Natural',
      // Transformar estado para que sea más legible
      estado: provider.estado === 'Activo' ? 'Activo' : 'Inactivo',
      // Usar el nombre del tipo de documento en lugar del ID
      tipoDocumento: provider.tipoDocumentoNombre || (provider.tipoEntidad === 'juridica' ? 'N/A' : 'No especificado'),
      // Asegurar que la descripción tenga un valor por defecto si está vacía
      descripcion: provider.descripcion || 'Sin descripción',
      // Asegurar que el correo tenga un valor por defecto si está vacío
      correo: provider.correo || 'No especificado'
    })}
  />
            </PermissionGuard>
            <PermissionGuard module="providers" action="Crear">
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
            </PermissionGuard>
          </div>
        </div>
      </div>

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
                onEdit={hasPermission("providers", "Editar") ? handleEdit : null}
                onDelete={hasPermission("providers", "Eliminar") ? handleDelete : null}
                onView={hasPermission("providers", "Ver") ? handleView : null}
                buttonConfig={buttonConfig}
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

      <ProviderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onUpdate={handleUpdate}
        providerToEdit={providerToEdit}
        mode={modalMode}
      />
      <ProviderViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        provider={providerToView}
      />
    </div>
  );
};

export default Providers;