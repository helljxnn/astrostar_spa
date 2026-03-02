// src/features/dashboard/pages/Admin/pages/Providers/Providers.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import ProviderModal from "./components/ProviderModal.jsx";
import ProviderViewModal from "./components/ProviderViewModal.jsx";
import Table from "../../../../../../shared/components/Table/table.jsx";
import SearchInput from "../../../../../../shared/components/SearchInput.jsx";
import ReportButton from "../../../../../../shared/components/ReportButton.jsx";
import providersService from "./services/ProvidersService.js";
import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteAlert,
} from "../../../../../../shared/utils/alerts.js";
import PermissionGuard from "../../../../../../shared/components/PermissionGuard.jsx";
import { usePermissions } from "../../../../../../shared/hooks/usePermissions.js";
import { PAGINATION_CONFIG } from "../../../../../../shared/constants/paginationConfig.js";

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
  const [currentPage, setCurrentPage] = useState(
    PAGINATION_CONFIG.DEFAULT_PAGE,
  );
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [activePurchasesCheck, setActivePurchasesCheck] = useState({});
  const { hasPermission } = usePermissions();
  
  // Estado para datos filtrados localmente
  const [allData, setAllData] = useState([]);
  
  const fetchProviders = async () => {
    try {
      setLoading(true);
      // NO enviar búsqueda al backend, filtrar localmente
      const response = await providersService.getProviders({
        page: searchTerm ? 1 : currentPage, // Si hay búsqueda, traer página 1
        limit: searchTerm ? 9999 : PAGINATION_CONFIG.ROWS_PER_PAGE, // Si hay búsqueda, traer todos
      });
      if (response.success) {
        // Enriquecer datos con nombres de tipos de documento
        const enrichedData = await enrichProvidersWithDocumentTypes(
          response.data || [],
        );
        setAllData(enrichedData); // Guardar todos los datos para filtrado local
        setTotalPages(response.pagination?.pages || 1);
        setTotalRows(response.pagination?.total || enrichedData.length);
        checkActivePurchasesForProviders(enrichedData);
      } else {
        showErrorAlert("Error", "No se pudieron cargar los proveedores");
      }
    } catch (error) {
      showErrorAlert(
        "Error",
        "Error al cargar los proveedores desde el servidor",
      );
    } finally {
      setLoading(false);
    }
  };
  const enrichProvidersWithDocumentTypes = async (providers) => {
    try {
      const response = await providersService.getDocumentTypes();
      if (response.success && response.data) {
        const documentTypes = response.data;
        return providers.map((provider) => {
          if (provider.tipoEntidad === "natural" && provider.tipoDocumento) {
            const docType = documentTypes.find(
              (dt) =>
                dt.id.toString() === provider.tipoDocumento.toString() ||
                dt.value === provider.tipoDocumento.toString(),
            );
            return {
              ...provider,
              tipoDocumentoNombre: docType
                ? docType.name || docType.label
                : "No especificado",
              documentType: docType || null,
            };
          }
          return {
            ...provider,
            tipoDocumentoNombre: "NIT",
            documentType: { name: "NIT", label: "NIT" },
          };
        });
      }
    } catch (error) {
      console.error("Error enriching providers with document types:", error);
    }
    return providers.map((provider) => ({
      ...provider,
      tipoDocumentoNombre:
        provider.tipoEntidad === "juridica" ? "NIT" : "No especificado",
      documentType:
        provider.tipoEntidad === "juridica"
          ? { name: "NIT", label: "NIT" }
          : null,
    }));
  };
  const checkActivePurchasesForProviders = async (providers) => {
    const purchasesCheck = {};
    // Usar Promise.all para llamadas paralelas en lugar de secuenciales
    const promises = providers.map(async (provider) => {
      try {
        const response = await providersService.checkActivePurchases(
          provider.id,
        );
        return {
          id: provider.id,
          hasActivePurchases: response.hasActivePurchases,
        };
      } catch (error) {
        return { id: provider.id, hasActivePurchases: false };
      }
    });
    const results = await Promise.all(promises);
    results.forEach((result) => {
      purchasesCheck[result.id] = result.hasActivePurchases;
    });
    setActivePurchasesCheck(purchasesCheck);
  };

  // Filtrado local para TODOS los campos
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return allData;

    const searchLower = searchTerm.toLowerCase().trim();

    return allData.filter((provider) => {
      // Campos de texto básicos
      const textFields = [
        provider.razonSocial,
        provider.nit,
        provider.contactoPrincipal,
        provider.correo,
        provider.telefono,
        provider.direccion,
        provider.ciudad,
        provider.descripcion,
        provider.estado,
      ];

      const textMatch = textFields.some(
        (field) => field && String(field).toLowerCase().includes(searchLower)
      );

      // Buscar en tipo de entidad (Jurídica/Natural)
      const tipoEntidadDisplay = provider.tipoEntidad === 'juridica' ? 'jurídica' : 'natural';
      const tipoEntidadMatch = tipoEntidadDisplay.includes(searchLower) || 
                               (searchLower.includes('juridica') && provider.tipoEntidad === 'juridica') ||
                               (searchLower.includes('natural') && provider.tipoEntidad === 'natural');

      // Buscar en tipo de documento
      const tipoDocumentoMatch = provider.tipoDocumentoNombre && 
                                 provider.tipoDocumentoNombre.toLowerCase().includes(searchLower);

      return textMatch || tipoEntidadMatch || tipoDocumentoMatch;
    });
  }, [allData, searchTerm]);

  useEffect(() => {
    fetchProviders();
  }, [currentPage, searchTerm]); // Recargar cuando cambia la página o la búsqueda
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
    // Solo limpiar espacios, guiones y paréntesis, mantener el número completo
    return phone.replace(/[\s\-\(\)]/g, "");
  };
  const handleSave = async (newProvider) => {
    if (!hasPermission("providers", "Crear")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para crear proveedores",
      );
      return { success: false }; // ← Retornar objeto con success: false
    }
    try {
      const providerData = {
        ...newProvider,
        telefono: formatPhoneNumber(newProvider.telefono),
      };
      const response = await providersService.createProvider(providerData);
      if (response.success) {
        showSuccessAlert(
          "Proveedor creado",
          "El proveedor se creó correctamente.",
        );
        setIsModalOpen(false);
        fetchProviders();
        return response; // ← Retornar la respuesta exitosa
      } else {
        showErrorAlert(
          "Error",
          response.message || "No se pudo crear el proveedor",
        );
        return { success: false, message: response.message }; // ← Retornar error
      }
    } catch (error) {
      console.error("Error saving provider:", error);
      showErrorAlert("Error", "Error al crear el proveedor en el servidor");
      throw error; // ← Lanzar el error para que el modal lo capture
    }
  };
  const handleUpdate = async (updatedProvider) => {
    if (!hasPermission("providers", "Editar")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para editar proveedores",
      );
      return { success: false }; // ← Retornar objeto con success: false
    }
    try {
      const providerData = {
        ...updatedProvider,
        telefono: formatPhoneNumber(updatedProvider.telefono),
      };
      const response = await providersService.updateProvider(
        updatedProvider.id,
        providerData,
      );
      if (response.success) {
        showSuccessAlert(
          "Proveedor actualizado",
          "El proveedor se actualizó correctamente.",
        );
        setIsModalOpen(false);
        fetchProviders();
        return response;
      } else {
        showErrorAlert(
          "Error",
          response.message || "No se pudo actualizar el proveedor",
        );
        return { success: false, message: response.message }; // Retornar error
      }
    } catch (error) {
      console.error("Error updating provider:", error);
      showErrorAlert(
        "Error",
        "Error al actualizar el proveedor en el servidor",
      );
      throw error;
    }
  };
  const handleEdit = async (provider) => {
    if (!hasPermission("providers", "Editar")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para editar proveedores",
      );
      return;
    }
    if (!provider || provider.target) return;
    try {
      // Obtener los datos completos del proveedor desde el backend
      const response = await providersService.getProviderById(provider.id);
      if (response.success && response.data) {
        console.log(
          "Datos completos del proveedor para edición:",
          response.data,
        );
        setProviderToEdit(response.data);
        setModalMode("edit");
        setIsModalOpen(true);
      } else {
        showErrorAlert(
          "Error",
          "No se pudieron cargar los datos del proveedor",
        );
      }
    } catch (error) {
      console.error("Error loading provider for edit:", error);
      showErrorAlert("Error", "Error al cargar los datos del proveedor");
    }
  };
  const handleView = async (provider) => {
    if (!hasPermission("providers", "Ver")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para ver detalles de proveedores",
      );
      return;
    }
    if (!provider || provider.target) return;
    try {
      // Obtener los datos completos del proveedor desde el backend
      const response = await providersService.getProviderById(provider.id);
      if (response.success && response.data) {
        setProviderToView(response.data);
        setIsViewModalOpen(true);
      } else {
        showErrorAlert(
          "Error",
          "No se pudieron cargar los datos del proveedor",
        );
      }
    } catch (error) {
      console.error("Error loading provider for view:", error);
      showErrorAlert("Error", "Error al cargar los datos del proveedor");
    }
  };
  const handleDelete = async (provider) => {
    if (!hasPermission("providers", "Eliminar")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para eliminar proveedores",
      );
      return;
    }
    if (!provider || !provider.id) {
      return showErrorAlert("Error", "Proveedor no válido");
    }
    if (activePurchasesCheck[provider.id]) {
      return showErrorAlert(
        "No se puede eliminar",
        `No se puede eliminar el proveedor "${provider.razonSocial}" porque tiene compras activas asociadas.`,
      );
    }
    const confirmResult = await showDeleteAlert(
      "¿Estás seguro?",
      `Se eliminará al proveedor ${provider.razonSocial}. Esta acción no se puede deshacer.`,
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" },
    );
    if (!confirmResult.isConfirmed) return;
    try {
      const response = await providersService.deleteProvider(provider.id);
      if (response.success) {
        showSuccessAlert(
          "Proveedor eliminado",
          `${provider.razonSocial} fue eliminado correctamente.`,
        );
        fetchProviders();
      } else {
        showErrorAlert(
          "Error",
          response.message || "No se pudo eliminar el proveedor",
        );
      }
    } catch (error) {
      showErrorAlert("Error", "Error al eliminar el proveedor en el servidor");
    }
  };
  const buttonConfig = {
    view: () => ({
      show: hasPermission("providers", "Ver"),
      disabled: false,
      title: "Ver detalles",
    }),
    edit: (provider) => ({
      show: hasPermission("providers", "Editar"),
      disabled: false,
      title: "Editar proveedor",
    }),
    delete: (provider) => ({
      show: hasPermission("providers", "Eliminar"),
      disabled: activePurchasesCheck[provider.id],
      title: activePurchasesCheck[provider.id]
        ? "No se puede eliminar con compras activas"
        : "Eliminar proveedor",
    }),
  };

  // Usar datos filtrados localmente
  const displayData = filteredData;
  const displayTotalRows = searchTerm ? filteredData.length : totalRows;

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
                // Si limpia la búsqueda, resetear a página 1
                if (!e.target.value) {
                  setCurrentPage(1);
                }
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
                  {
                    header: "Contacto Principal",
                    accessor: "contactoPrincipal",
                  },
                  { header: "Correo Electrónico", accessor: "correo" },
                  { header: "Teléfono", accessor: "telefono" },
                  { header: "Dirección", accessor: "direccion" },
                  { header: "Ciudad", accessor: "ciudad" },
                  { header: "Descripción", accessor: "descripcion" },
                  { header: "Estado", accessor: "estado" },
                  {
                    header: "Fecha de Registro",
                    accessor: "fechaRegistro",
                    format: (value) =>
                      value
                        ? new Date(value).toLocaleDateString("es-ES")
                        : "N/A",
                  },
                  {
                    header: "Última Actualización",
                    accessor: "updatedAt",
                    format: (value) =>
                      value
                        ? new Date(value).toLocaleDateString("es-ES")
                        : "N/A",
                  },
                ]}
                customDataTransform={(provider) => ({
                  ...provider,
                  tipoEntidad:
                    provider.tipoEntidad === "juridica"
                      ? "Persona Jurídica"
                      : "Persona Natural",
                  estado: provider.estado === "Activo" ? "Activo" : "Inactivo",
                  tipoDocumento:
                    provider.documentType?.name ||
                    provider.tipoDocumentoNombre ||
                    (provider.tipoEntidad === "juridica"
                      ? "NIT"
                      : "No especificado"),
                  descripcion: provider.descripcion || "Sin descripción",
                  correo: provider.correo || "No especificado",
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
      ) : displayTotalRows > 0 ? (
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
                  data: displayData,
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
                onView={hasPermission("providers", "Ver") ? handleView : null}
                onEdit={
                  hasPermission("providers", "Editar") ? handleEdit : null
                }
                onDelete={
                  hasPermission("providers", "Eliminar") ? handleDelete : null
                }
                buttonConfig={buttonConfig}
              />
            </div>
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
