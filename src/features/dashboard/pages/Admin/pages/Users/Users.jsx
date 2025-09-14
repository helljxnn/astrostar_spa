// src/features/dashboard/pages/Admin/pages/Users/Users.jsx
import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import UserModal from "./components/UserModal.jsx";
import {
  showConfirmAlert,
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../shared/utils/Alerts";
import Table from "../../../../../../shared/components/Table/table";
import usersData from "./UserData.jsx";
import rolesData from "../../../../../../shared/models/RolesData.js";

const Users = () => {
  const [data, setData] = useState(usersData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [userToEdit, setUserToEdit] = useState(null);

  const formatPhoneNumber = (phone) => {
    if (!phone) return phone;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (cleanPhone.startsWith("+57") || cleanPhone.startsWith("57"))
      return phone;
    if (/^\d{7,10}$/.test(cleanPhone)) return `+57 ${cleanPhone}`;
    return phone;
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
    console.log("Editando usuario:", user); // Debug
    setModalMode("edit");
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUserToEdit(null);
    setModalMode("create");
  };

  const handleDelete = async (user) => {
    console.log("Eliminando usuario:", user); // Debug
    
    if (!user || !user.id) {
      console.error("Usuario no válido:", user);
      return showErrorAlert("Error", "Usuario no encontrado o no válido");
    }

    const confirmResult = await showConfirmAlert(
      "¿Estás seguro?",
      `Se eliminará a ${user.nombre} ${user.apellido}. Esta acción no se puede deshacer.`,
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

      setData((prevData) => prevData.filter((u) => u.id !== user.id));

      showSuccessAlert(
        "Usuario eliminado",
        `${user.nombre} ${user.apellido} fue eliminado correctamente.`
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
    console.log("Ver usuario:", user);
    // Aquí puedes implementar la lógica para ver detalles del usuario
  };

  return (
    <div className="p-6 font-questrial">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Usuarios</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
        >
          <FaPlus /> Crear Usuario
        </button>
      </div>

      <Table
        thead={{
          titles: ["Nombre", "Correo", "Identificación", "Rol"],
          state: true,
          actions: true,
        }}
        tbody={{
          data,
          dataPropertys: ["nombre", "correo", "identificacion", "rol"],
          state: true,
          onEdit: handleEdit,
          onDelete: handleDelete,
          onView: handleView,
          stateMap: {
            Activo: "bg-green-100 text-green-800",
            Inactivo: "bg-red-100 text-red-800",
          },
        }}
      />

      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        onUpdate={handleUpdate}
        roles={rolesData || []}
        userToEdit={userToEdit}
        mode={modalMode}
      />
    </div>
  );
};

export default Users;