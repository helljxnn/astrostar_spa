import { useState, useEffect } from "react";
import Table from "../../../../../../shared/components/Table/table";
import RoleModal from "./components/RoleModal";
import { FaPlus } from "react-icons/fa";
import SearchInput from "../../../../../../shared/components/SearchInput";
import Pagination from "../../../../../../shared/components/Table/Pagination";
import RoleDetailModal from "./components/RoleDetailModal";
import { useRoles } from "../../../../../../shared/hooks/useRoles";
import { useLoading } from "../../../../../../shared/contexts/loaderContext";
import PermissionGuard from "../../../../../../shared/components/PermissionGuard";
import { usePermissions } from "../../../../../../shared/hooks/usePermissions";
import { showErrorAlert } from "../../../../../../shared/utils/alerts";

const Roles = () => {
  const {
    roles,
    pagination,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  } = useRoles();

  const { ShowLoading, HideLoading } = useLoading();
  const { hasPermission } = usePermissions();

  // Estado para crear/editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedRole, setSelectedRole] = useState(null);

  // Estado para ver detalle
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Effect to handle search and pagination with API
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchRoles({
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm,
      });
    }, searchTerm ? 300 : 0); // Debounce only for search, immediate for pagination

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, currentPage]); // Remove fetchRoles to avoid circular dependency

  // Use API data directly (no local filtering since API handles search and pagination)
  const totalRows = pagination.total || 0;
  const totalPages = pagination.pages || 0;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = roles; // API already returns paginated data





  // Guardar rol (crear o editar)
  const handleSave = async (newRole) => {
    try {
      ShowLoading();

      const currentParams = {
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm,
      };

      if (modalMode === "create") {
        await createRole(newRole, currentParams);
      } else if (modalMode === "edit") {
        await updateRole(selectedRole.id, newRole, currentParams);
      }

      setIsModalOpen(false);
      setSelectedRole(null);
    } finally {
      HideLoading();
    }
  };

  // Editar rol
  const handleEdit = (role) => {
    // No permitir editar el rol de Administrador
    if (role.name === 'Administrador') {
      showErrorAlert(
        'Acción no permitida',
        'El rol de Administrador es un rol del sistema y no puede ser editado.'
      );
      return;
    }

    setSelectedRole(role);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  // Ver rol
  const handleView = (role) => {
    setSelectedRole(role);
    setIsDetailOpen(true);
  };

  // Eliminar rol con confirmación
  const handleDelete = async (role) => {
    // Verificar si es el rol de administrador
    if (role.name === 'Administrador') {
      showErrorAlert(
        'Acción no permitida',
        'El rol de Administrador es un rol del sistema y no puede ser eliminado.'
      );
      return;
    }

    // Verificar si el rol está activo
    if (role.status === 'Active') {
      showErrorAlert(
        'Acción no permitida',
        'No se pueden eliminar roles activos. Cambie el estado a Inactivo primero.'
      );
      return;
    }

    try {
      ShowLoading();
      
      const currentParams = {
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm,
      };
      
      await deleteRole(role, currentParams);
    } finally {
      HideLoading();
    }
  };

  return (
    <div className="p-6 font-questrial">
      {/* Header con buscador y botón Crear */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Roles</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar rol..."
          />

          <PermissionGuard module="roles" action="Crear">
            <button
              onClick={() => {
                setModalMode("create");
                setSelectedRole(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
            >
              <FaPlus /> Crear Rol
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Tabla */}
      <div className="w-full">
        <Table
          thead={{
            titles: ["Nombre", "Descripción", "Estado"],
            state: false,
          }}
          tbody={{
            data: paginatedData,
            dataPropertys: ["name", "description", "status"],
            state: false,
            customRenderers: {
              status: (value) => (
                <span
                  className={`font-semibold ${
                    value === 'Active'
                      ? "text-primary-purple"
                      : "text-primary-blue"
                  }`}
                >
                  {value === 'Active' ? 'Activo' : 'Inactivo'}
                </span>
              )
            }
          }}
          onEdit={hasPermission('roles', 'Editar') ? handleEdit : null}
          onDelete={hasPermission('roles', 'Eliminar') ? handleDelete : null}
          onView={hasPermission('roles', 'Ver') ? handleView : null}
          buttonConfig={{
            edit: (role) => ({
              show: hasPermission('roles', 'Editar'),
              disabled: role.name === 'Administrador',
              className: role.name === 'Administrador' 
                ? 'opacity-50 cursor-not-allowed' 
                : '',
              title: role.name === 'Administrador' 
                ? 'El rol de Administrador no puede ser editado' 
                : 'Editar rol'
            }),
            delete: (role) => ({
              show: hasPermission('roles', 'Eliminar'),
              disabled: role.name === 'Administrador' || role.status === 'Active',
              className: (role.name === 'Administrador' || role.status === 'Active')
                ? 'opacity-50 cursor-not-allowed' 
                : '',
              title: role.name === 'Administrador' 
                ? 'El rol de Administrador no puede ser eliminado'
                : role.status === 'Active'
                ? 'Los roles activos no pueden ser eliminados'
                : 'Eliminar rol'
            }),
            view: (role) => ({
              show: hasPermission('roles', 'Ver'),
              disabled: false,
              className: '',
              title: 'Ver detalles del rol'
            })
          }}
        />
      </div>



      {/* Paginación */}
      {totalRows > 0 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              // fetchRoles will be called automatically by useEffect when currentPage changes
            }}
            totalRows={totalRows}
            rowsPerPage={rowsPerPage}
            startIndex={startIndex}
          />
        </div>
      )}

      {/* Modal Crear/Editar */}
      {isModalOpen && (
        <RoleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          roleData={modalMode === "edit" ? selectedRole : null}
        />
      )}

      {/* Modal Ver detalle */}
      {isDetailOpen && selectedRole && (
        <RoleDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          roleData={selectedRole}
        />
      )}
    </div>
  );
};

export default Roles;
