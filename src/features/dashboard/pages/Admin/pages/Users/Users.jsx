import React, { useState } from "react";
import Table from "../../../../../../shared/components/Table/table";
import UserModal from "./components/UserModal";
import usersData from "./UserData";
import { FaPlus } from "react-icons/fa";

import rolesData from "../../../../../../shared/models/RolesData";

const Users = () => {
  const [data, setData] = useState(usersData);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // onSave ahora es una función asíncrona que simula una llamada a la API
  const handleSave = async (newUser) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setData((prevData) => [...prevData, newUser]);
        resolve();
      }, 500); // Simula una demora de 500ms de una llamada a la API
    });
  };

  return (
    <div className="p-6 font-questrial">
      {/* Header con botón Crear */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Usuarios</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
        >
          <FaPlus /> Crear
        </button>
      </div>

      {/* Tabla */}
      <Table
        thead={{
          titles: ["Nombre", "Identificación", "Rol", "Correo", "Teléfono", "Estado"],
          state: true,
        }}
        tbody={{
          data,
          dataPropertys: ["nombre", "identificacion", "rol", "correo", "telefono", "estado"],
          state: true,
        }}
      />

      {/* Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        roles={rolesData}
      />
    </div>
  );
};

export default Users;