// src/features/dashboard/pages/Admin/pages/Users/Users.jsx
import React, { useState, useEffect, useMemo } from "react";
import { FaPlus } from "react-icons/fa";
import UserModal from "./components/UserModal.jsx";
import UserViewModal from "./components/UserViewModal.jsx";
import SearchInput from "../../../../../../shared/components/SearchInput";
import Pagination from "../../../../.././../shared/components/Table/Pagination.jsx";
import {
  showConfirmAlert,
  showSuccessAlert,
  showErrorAlert,
  showDeleteAlert,
} from "../../../../../../shared/utils/alerts.js";
import Table from "../../../../../../shared/components/Table/table";
import usersData from "./UserData.jsx";
import rolesData from "../../../../../../shared/models/RolesData.js";

const Users = () => {
  const [data, setData] = useState(usersData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToView, setUserToView] = useState(null);
  
  // Estados para búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10); // Puedes hacer esto configurable si quieres

  const formatPhoneNumber = (phone) => {
    if (!phone) return phone;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (cleanPhone.startsWith("+57") || cleanPhone.startsWith("57"))
      return phone;
    if (/^\d{7,10}$/.test(cleanPhone)) return `+57 ${cleanPhone}`;
    return phone;
  };

  // Filtrar datos basado en el término de búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    
    return data.filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.nombre?.toLowerCase().includes(searchLower) ||
        user.apellido?.toLowerCase().includes(searchLower) ||
        user.correo?.toLowerCase().includes(searchLower) ||
        user.identificacion?.toString().includes(searchLower) ||
        user.rol?.toLowerCase().includes(searchLower) ||
        user.estado?.toLowerCase().includes(searchLower) ||
        `${user.nombre} ${user.apellido}`.toLowerCase().includes(searchLower)
      );
    });
  }, [data, searchTerm]);

  // Calcular datos de paginación
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Resetear página cuando cambie el filtro de búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Manejar cambio de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Manejar cambio de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSave = async (newUser) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.1)
          return reject(new Error("Error de servidor simulado"));

        const userWithFormattedPhone = {
          ...newUser,
          id: Date.now(),
          telefono: formatPhoneNumber(newUser.telefono),
        };
        setData((prevData) => [...prevData, userWithFormattedPhone]);
        resolve();
      }, 500);
    });
  };

  const handleUpdate = async (updatedUser) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.05)
          return reject(new Error("Error de conexión simulado"));

        const userWithFormattedPhone = {
          ...updatedUser,
          telefono: formatPhoneNumber(updatedUser.telefono),
        };
        setData((prevData) =>
          prevData.map((user) =>
            user.id === userWithFormattedPhone.id
              ? userWithFormattedPhone
              : user
          )
        );
        resolve();
      }, 800);
    });
  };

  const handleCreate = () => {
    setModalMode("create");
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    console.log("Editando usuario - función llamada:", user); // Debug
    
    // Verificar si el user es un evento o un objeto
    let userData = user;
    if (user && user.target) {
      // Si es un evento, buscar los datos del usuario
      console.warn("handleEdit recibió un evento en lugar de datos del usuario");
      return;
    }
    
    if (!userData) {
      console.error("No se recibieron datos del usuario para editar");
      return;
    }
    
    console.log("Datos del usuario a editar:", userData);
    setModalMode("edit");
    setUserToEdit(userData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUserToEdit(null);
    setModalMode("create");
  };

  const handleDelete = async (user) => {
    console.log("Eliminando usuario - función llamada:", user); // Debug
    
    // Verificar si el user es un evento o un objeto
    let userData = user;
    if (user && user.target) {
      // Si es un evento, buscar los datos del usuario
      console.warn("handleDelete recibió un evento en lugar de datos del usuario");
      return;
    }
    
    if (!userData || !userData.id) {
      console.error("Usuario no válido para eliminar:", userData);
      return showErrorAlert("Error", "Usuario no encontrado o no válido");
    }

    const confirmResult = await showDeleteAlert(
      "¿Estás seguro?",
      `Se eliminará a ${userData.nombre} ${userData.apellido}. Esta acción no se puede deshacer.`,
      {
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      }
    );

    if (!confirmResult.isConfirmed) return;

    try {
      // Simular llamada API
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.05) {
            reject(new Error("Error de conexión simulado"));
          } else {
            resolve();
          }
        }, 500);
      });

      setData((prevData) => prevData.filter((u) => u.id !== userData.id));

      showSuccessAlert(
        "Usuario eliminado",
        `${userData.nombre} ${userData.apellido} fue eliminado correctamente.`
      );
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      showErrorAlert(
        "Error al eliminar",
        error.message || "No se pudo eliminar el usuario, intenta de nuevo."
      );
    }
  };

  const handleView = (user) => {
    console.log("Ver usuario - función llamada:", user); // Debug
    
    // Verificar si el user es un evento o un objeto
    let userData = user;
    if (user && user.target) {
      // Si es un evento, buscar los datos del usuario
      console.warn("handleView recibió un evento en lugar de datos del usuario");
      return;
    }
    
    if (!userData) {
      console.error("No se recibieron datos del usuario para ver");
      return;
    }
    
    console.log("Ver detalles del usuario:", userData);
    setUserToView(userData);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setUserToView(null);
  };

  return (
    <div className="p-6 font-questrial">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Usuarios
          {totalRows !== data.length && (
            <span className="text-sm text-gray-600 ml-2">
              ({totalRows} de {data.length})
            </span>
          )}
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          {/* Buscador */}
          <div className="sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar usuario"
              className="w-full"
            />
          </div>
          
          {/* Botón crear */}
          <button
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow hover:opacity-90 transition whitespace-nowrap"
          >
            <FaPlus /> Crear Usuario
          </button>
        </div>
      </div>

      {/* Mensaje cuando no hay resultados */}
      {totalRows === 0 && searchTerm && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200 mb-6">
          <p className="text-gray-600">
            No se encontraron usuarios que coincidan con "{searchTerm}"
          </p>
          <button
            onClick={() => setSearchTerm("")}
            className="text-primary-purple hover:text-primary-blue mt-2 font-medium"
          >
            Limpiar búsqueda
          </button>
        </div>
      )}

      {/* Tabla */}
      {totalRows > 0 && (
        <>
          <Table
            thead={{
              titles: ["Nombre", "Correo", "Identificación", "Rol"],
              state: true,
              actions: true,
            }}
            tbody={{
              data: paginatedData,
              dataPropertys: ["nombre", "correo", "identificacion", "rol"],
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

          {/* Paginador */}
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

      {/* Modal de creación/edición */}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        onUpdate={handleUpdate}
        roles={rolesData || []}
        userToEdit={userToEdit}
        mode={modalMode}
      />

      {/* Modal de visualización */}
      <UserViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        user={userToView}
      />
    </div>
  );
};

export default Users;