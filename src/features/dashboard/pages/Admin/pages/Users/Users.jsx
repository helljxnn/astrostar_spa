// src/features/dashboard/pages/Admin/pages/Users/Users.jsx
import React, { useState, useEffect } from "react";
import UserViewModal from "./components/UserViewModal.jsx";
import SearchInput from "../../../../../../shared/components/SearchInput";
import Pagination from "../../../../../../shared/components/Table/Pagination.jsx";
import { showErrorAlert } from "../../../../../../shared/utils/alerts.js";
import Table from "../../../../../../shared/components/Table/table";
import PermissionGuard from "../../../../../../shared/components/PermissionGuard";
import { usePermissions } from "../../../../../../shared/hooks/usePermissions";
import usersService from "./services/UsersService";

const Users = () => {
  const { hasPermission } = usePermissions();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [userToView, setUserToView] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  // Cargar usuarios desde la API
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersService.getUsers({
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm,
      });

      if (response.success) {
        const formattedUsers = response.data.map((user) => ({
          id: user.id,
          nombre: `${user.firstName} ${user.lastName}`,
          apellido: user.lastName,
          correo: user.email,
          identificacion: user.identification,
          tipoDocumento: user.documentType?.name || "N/A",
          rol: user.role?.name || "N/A",
          telefono: user.phoneNumber || "N/A",
          estado: user.status === "Active" ? "Activo" : "Inactivo",
          _fullData: user, // Incluye todos los campos para el modal
        }));

        setData(formattedUsers);
        setTotalRows(response.pagination?.total || formattedUsers.length);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      showErrorAlert(
        "Error al cargar usuarios",
        error.message || "No se pudieron cargar los usuarios",
      );
      setData([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm]);

  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [searchTerm]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handlePageChange = (page) => setCurrentPage(page);
  const handleView = (user) => {
    setUserToView(user);
    setIsViewModalOpen(true);
  };
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setUserToView(null);
  };

  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;

  return (
    <div className="p-6 font-questrial">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Usuarios</h1>
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <div className="sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar usuario..."
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Mensaje de carga */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
          <span className="ml-2 text-gray-600">Cargando usuarios...</span>
        </div>
      )}

      {/* Sin resultados con búsqueda */}
      {!loading && totalRows === 0 && searchTerm && (
        <div className="flex justify-center items-center py-8">
          <span className="text-gray-600">
            No se encontraron usuarios que coincidan con "{searchTerm}"
          </span>
          <button
            onClick={() => setSearchTerm("")}
            className="text-primary-purple hover:text-primary-blue ml-2 font-medium"
          >
            Limpiar búsqueda
          </button>
        </div>
      )}

      {/* Sin usuarios en la BD */}
      {!loading && totalRows === 0 && !searchTerm && (
        <div className="flex justify-center items-center py-8">
          <span className="text-gray-600">No hay datos disponibles</span>
        </div>
      )}

      {/* Tabla con datos */}
      {!loading && totalRows > 0 && (
        <>
          <Table
            thead={{
              titles: ["Nombre", "Correo", "Identificación", "Rol", "Teléfono"],
              state: true,
              actions: true,
            }}
            tbody={{
              data: data,
              dataPropertys: [
                "nombre",
                "correo",
                "identificacion",
                "rol",
                "telefono",
              ],
              state: true,
              stateMap: {
                Activo: "bg-green-100 text-green-800",
                Inactivo: "bg-red-100 text-red-800",
              },
            }}
            onView={hasPermission("users", "Ver") ? handleView : null}
            buttonConfig={{
              view: (user) => ({
                show: hasPermission("users", "Ver"),
                disabled: false,
                className: "",
                title: "Ver detalles del usuario",
              }),
            }}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalRows={totalRows}
            rowsPerPage={rowsPerPage}
            startIndex={startIndex}
          />
        </>
      )}

      {/* Modal de vista */}
      <UserViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        user={userToView}
      />
    </div>
  );
};

export default Users;