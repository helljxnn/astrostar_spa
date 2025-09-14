import React from "react";
import Table from "../../../../../../shared/components/Table/table";

export const RolesTable = ({ roles, onEdit, onDelete, onView }) => {
  return (
    <div className="mt-8 bg-white shadow-lg rounded-2xl p-6">
      <h3 className="text-xl font-bold text-[#9BE9FF] mb-4">Lista de Roles</h3>
      <Table
        thead={{
          titles: ["Nombre", "Descripción"],
          state: true, // 👈 activa la columna Estado
        }}
        tbody={{
          data: roles,
          dataPropertys: ["nombre", "descripcion"],
          state: true, // 👈 indica que los roles tienen estado
        }}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
      />
    </div>
  );
};
