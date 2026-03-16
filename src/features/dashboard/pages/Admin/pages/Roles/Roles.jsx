import { useState, useEffect } from "react";
import Table from "../../../../../../shared/components/Table/table";
import RoleModal from "./components/RoleModal";
import { FaPlus } from "react-icons/fa";
import SearchInput from "../../../../../../shared/components/SearchInput";
import RoleDetailModal from "./components/RoleDetailModal";
import { useRoles } from "./hooks/useRoles";
import PermissionGuard from "../../../../../../shared/components/PermissionGuard";
import { usePermissions } from "../../../../../../shared/hooks/usePermissions";
import { showErrorAlert } from "../../../../../../shared/utils/alerts.js";
import { PAGINATION_CONFIG } from "../../../../../../shared/constants/paginationConfig";

const PROTECTED_SYSTEM_ROLES = new Set([
  "administrador",
  "deportista",
  "entrenador",
  "profesionaldelasalud",
  "profesionaldesalud",
]);

const normalizeRoleName = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const isProtectedRole = (roleName = "") =>
  PROTECTED_SYSTEM_ROLES.has(normalizeRoleName(roleName));

const Roles = () => {
  const { roles, pagination, fetchRoles, createRole, updateRole, deleteRole } =
    useRoles();

  const { hasPermission } = usePermissions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedRole, setSelectedRole] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(
    PAGINATION_CONFIG.DEFAULT_PAGE,
  );

  useEffect(() => {
    const delayedSearch = setTimeout(
      () => {
        fetchRoles({
          page: currentPage,
          limit: PAGINATION_CONFIG.ROWS_PER_PAGE,
          search: searchTerm,
        });
      },
      searchTerm ? 300 : 0,
    );

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, currentPage, fetchRoles]);

  const totalRows = pagination.total || 0;
  const paginatedData = roles;

  const handleSave = async (newRole) => {
    try {
      const currentParams = {
        page: currentPage,
        limit: PAGINATION_CONFIG.ROWS_PER_PAGE,
        search: searchTerm,
      };

      if (modalMode === "create") {
        await createRole(newRole, currentParams);
      } else if (modalMode === "edit") {
        await updateRole(selectedRole.id, newRole, currentParams);
      }

      setIsModalOpen(false);
      setSelectedRole(null);
    } catch (error) {
      console.error("Error saving role:", error);
    }
  };

  const handleEdit = (role) => {
    if (isProtectedRole(role.name)) {
      showErrorAlert(
        "Accion no permitida",
        `El rol ${role.name} es un rol base del sistema y no puede ser editado.`,
      );
      return;
    }

    setSelectedRole(role);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleView = (role) => {
    setSelectedRole(role);
    setIsDetailOpen(true);
  };

  const handleDelete = async (role) => {
    if (isProtectedRole(role.name)) {
      showErrorAlert(
        "Accion no permitida",
        `El rol ${role.name} es un rol base del sistema y no puede ser eliminado.`,
      );
      return;
    }

    try {
      const currentParams = {
        page: currentPage,
        limit: PAGINATION_CONFIG.ROWS_PER_PAGE,
        search: searchTerm,
      };

      await deleteRole(role, currentParams);
    } catch (error) {
      console.error("Error deleting role:", error);
    }
  };

  return (
    <div className="p-6 font-questrial">
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

      <div className="w-full">
        <Table
          serverPagination={true}
          currentPage={currentPage}
          totalRows={totalRows}
          rowsPerPage={PAGINATION_CONFIG.ROWS_PER_PAGE}
          onPageChange={(page) => setCurrentPage(page)}
          thead={{
            titles: ["Nombre", "Descripcion"],
            state: false,
          }}
          tbody={{
            data: paginatedData,
            dataPropertys: ["name", "description"],
            state: false,
          }}
          onEdit={hasPermission("roles", "Editar") ? handleEdit : null}
          onDelete={hasPermission("roles", "Eliminar") ? handleDelete : null}
          onView={hasPermission("roles", "Ver") ? handleView : null}
          buttonConfig={{
            edit: (role) => ({
              show: hasPermission("roles", "Editar"),
              disabled: isProtectedRole(role.name),
              className: isProtectedRole(role.name)
                ? "opacity-50 cursor-not-allowed"
                : "",
              title: isProtectedRole(role.name)
                ? "Rol base del sistema: no editable"
                : "Editar rol",
            }),
            delete: (role) => ({
              show: hasPermission("roles", "Eliminar"),
              disabled: isProtectedRole(role.name),
              className: isProtectedRole(role.name)
                ? "opacity-50 cursor-not-allowed"
                : "",
              title: isProtectedRole(role.name)
                ? "Rol base del sistema: no eliminable"
                : "Eliminar rol",
            }),
            view: () => ({
              show: hasPermission("roles", "Ver"),
              disabled: false,
              className: "",
              title: "Ver detalles del rol",
            }),
          }}
        />
      </div>

      {isModalOpen && (
        <RoleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          roleData={modalMode === "edit" ? selectedRole : null}
        />
      )}

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
