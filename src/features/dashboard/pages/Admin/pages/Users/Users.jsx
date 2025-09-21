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
import usersData from "../../../../../../shared/models/UserData.js";
import rolesData from "../../../../../../shared/models/RolesData.js";

// 🔑 Constante clave de LocalStorage
const LOCAL_STORAGE_KEY = "users";

const Users = () => {
  // 🟢 Estado inicial cargado desde LocalStorage o desde usersData
  const [data, setData] = useState(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : usersData;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToView, setUserToView] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  //Guardar en LocalStorage cada vez que cambien los datos
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const formatPhoneNumber = (phone) => {
    if (!phone) return phone;
    return phone.replace(/[\s\-\(\)]/g, ""); // limpio pero sin +57
  };

  // 🔎 Filtrado por búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const searchLower = searchTerm.toLowerCase();
    return data.filter((user) =>
      [
        user.nombre,
        user.apellido,
        user.correo,
        user.identificacion,
        user.rol,
        user.estado,
        user.telefono,
        `${user.nombre} ${user.apellido}`,
      ]
        .filter(Boolean)
        .some((field) => field.toString().toLowerCase().includes(searchLower))
    );
  }, [data, searchTerm]);

  // Paginación
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  useEffect(() => setCurrentPage(1), [searchTerm]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handlePageChange = (page) => setCurrentPage(page);

  // Crear usuario
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

  // Editar usuario
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

  // Eliminar usuario
  const handleDelete = async (user) => {
    if (!user?.id) {
      return showErrorAlert("Error", "Usuario no válido");
    }

    const confirmResult = await showDeleteAlert(
      "¿Estás seguro?",
      `Se eliminará a ${user.nombre} ${user.apellido}. Esta acción no se puede deshacer.`,
      {
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      }
    );

    if (!confirmResult.isConfirmed) return;

    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.05) reject(new Error("Error simulado"));
          else resolve();
        }, 500);
      });

      setData((prevData) => prevData.filter((u) => u.id !== user.id));

      showSuccessAlert(
        "Usuario eliminado",
        `${user.nombre} ${user.apellido} fue eliminado correctamente.`
      );
    } catch (error) {
      showErrorAlert("Error al eliminar", error.message);
    }
  };

  // Ver usuario
  const handleView = (user) => {
    setUserToView(user);
    setIsViewModalOpen(true);
  };

  const handleCreate = () => {
    setModalMode("create");
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setModalMode("edit");
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUserToEdit(null);
    setModalMode("create");
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
          <div className="sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar usuario"
              className="w-full"
            />
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow hover:opacity-90 transition whitespace-nowrap"
          >
            <FaPlus /> Crear Usuario
          </button>
        </div>
      </div>

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

      {totalRows > 0 && (
        <>
          <Table
            thead={{
              titles: ["Nombre", "Correo", "Identificación", "Rol", "Teléfono"],
              state: true,
              actions: true,
            }}
            tbody={{
              data: paginatedData,
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
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
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

      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        onUpdate={handleUpdate}
        roles={rolesData || []}
        userToEdit={userToEdit}
        mode={modalMode}
      />

      <UserViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        user={userToView}
      />
    </div>
  );
};

export default Users;
