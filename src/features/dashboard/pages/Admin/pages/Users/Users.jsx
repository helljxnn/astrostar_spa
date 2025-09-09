// src/features/dashboard/pages/Admin/pages/Users/Users.jsx
import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import UserModal from "./components/UserModal.jsx";
import {
  showConfirmAlert,
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../shared/utils/alerts";
import Table from "../../../../../../shared/components/Table/table";
import usersData from "./UserData.jsx"; // 👈 corregido: nombre y extensión
import rolesData from "../../../../../../shared/models/RolesData.js";

const Users = () => {
  const [data, setData] = useState(usersData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [userToEdit, setUserToEdit] = useState(null);

  useEffect(() => {
    console.log("Estado de isModalOpen:", isModalOpen);
    console.log("Usuario a editar:", userToEdit);
  }, [isModalOpen, userToEdit]);

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
    setModalMode("edit");
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUserToEdit(null);
    setModalMode("create");
  };

const handleDelete = async (userId) => {
  const userToDelete = data.find((user) => user.id === userId);
  if (!userToDelete) {
    return showErrorAlert("Error", "Usuario no encontrado");
  }

  // 🔔 Usamos la alerta de error como confirmación visual
  const confirmResult = await showErrorAlert(
    "¿Estás seguro de eliminar este usuario?",
    `Esta acción no se puede deshacer. Se eliminará a ${userToDelete.nombre} ${userToDelete.apellido}.`
  );

  if (!confirmResult.isConfirmed) {
    return; // Usuario canceló
  }

  try {
    // Simulación de espera (API o lógica real aquí)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Actualizamos el estado eliminando al usuario
    setData((prevData) => prevData.filter((user) => user.id !== userId));

    // ✅ Mostrar éxito
    showSuccessAlert(
      "Usuario eliminado",
      `${userToDelete.nombre} ${userToDelete.apellido} fue eliminado correctamente.`
    );
  } catch (error) {
    // ❌ Mostrar error real
    showErrorAlert(
      "Error al eliminar",
      error.message || "No se pudo eliminar el usuario, intenta de nuevo."
    );
  }
};




  return (
    <div className="p-6 font-questrial">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Usuarios</h1>
        </div>
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

          // 👇 En lugar de actions[], usamos los callbacks que entiende tu Table fijo
          onEdit: (row) => handleEdit(row),
          onDelete: (row) => handleDelete(row.id),
          onView: (row) => console.log("Ver usuario:", row),

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
