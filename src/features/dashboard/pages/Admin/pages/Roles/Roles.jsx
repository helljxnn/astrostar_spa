import React, { useState, useMemo } from "react";
import Table from "../../../../../../shared/components/Table/table";
import RoleModal from "./components/RoleModal";
import rolesData from "../../../../../../shared/models/RolesData";
import { FaPlus } from "react-icons/fa";
import SearchInput from "../../../../../../shared/components/SearchInput";
import {
  showConfirmAlert,
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../shared/utils/alerts";
import RoleDetailModal from "./components/RoleDetailModal";

const Roles = () => {
  const [data, setData] = useState(rolesData);

  // Estado para crear/editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedRole, setSelectedRole] = useState(null);

  // Estado para ver detalle
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Filtrar por búsqueda general en cualquier campo del objeto
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

  // Paginación
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // Guardar rol (crear o editar)
  const handleSave = (newRole) => {
    if (modalMode === "create") {
      setData([...data, { ...newRole, id: Date.now() }]);
      showSuccessAlert("Rol creado", "El rol se creó exitosamente.");
    } else if (modalMode === "edit") {
      setData(data.map((role) => (role.id === newRole.id ? newRole : role)));
      showSuccessAlert("Rol actualizado", "El rol se actualizó correctamente.");
    }
    setIsModalOpen(false);
    setSelectedRole(null);
  };

  // Editar rol
  const handleEdit = (role) => {
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
    const result = await showConfirmAlert(
      "¿Eliminar rol?",
      `Se eliminará el rol: ${role.nombre}`
    );

    if (result.isConfirmed) {
      setData(data.filter((r) => r.id !== role.id));
      showSuccessAlert("Eliminado", "El rol se eliminó correctamente.");
    } else {
      showErrorAlert("Cancelado", "El rol no fue eliminado.");
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

          <button
            onClick={() => {
              setModalMode("create");
              setSelectedRole(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow hover:opacity-90 transition"
          >
            <FaPlus /> Crear Rol
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="w-full">
        <Table
          thead={{
            titles: ["Nombre", "Descripción"],
            state: true,
          }}
          tbody={{
            data: paginatedData,
            dataPropertys: ["nombre", "descripcion"],
            state: true,
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      </div>

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
