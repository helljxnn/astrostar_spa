import React, { useState } from "react";
import Table from "../../../../../../shared/components/Table/table";
import RoleModal from "./components/RoleModal";
import rolesData from "../../../../../../shared/models/RolesData";
import { FaPlus } from "react-icons/fa";

const Roles = () => {
  const [data, setData] = useState(rolesData);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = (newRole) => {
    setData([...data, newRole]);
  };

  return (
    <div className="p-6 font-questrial">
      {/* Header con botón Crear */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Roles</h1>
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
          titles: ["Nombre", "Descripción"],
          state: true,
        }}
        tbody={{
          data,
          dataPropertys: ["nombre", "descripcion"],
          state: true,
        }}
      />

      {/* Modal */}
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default Roles;
