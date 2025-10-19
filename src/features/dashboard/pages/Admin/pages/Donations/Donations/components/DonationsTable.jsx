import React from "react";
import Table from "../../../../../../../../shared/components/Table/table";

const DonationsTable = ({ donations, onEdit, onView, onCancel }) => {
  return (
    <div className="mt-8 bg-white shadow-lg rounded-2xl p-6">
      <h3 className="text-xl font-bold text-primary-blue mb-4">
        Lista de Donaciones
      </h3>

      <Table
        thead={{
          titles: [
            "Donante",
            "Tipo de Donación",
            "Fecha de Donación",
            "Fecha de Registro",
          ],
          state: true, // 👈 activa la columna Estado
        }}
        tbody={{
          data: donations,
          dataPropertys: [
            "donorName",
            "donationType",
            "donationDate",
            "registerDate",
          ],
          state: true, // 👈 indica que las donaciones tienen estado
        }}
        onEdit={onEdit}
        onView={onView}
        onCancel={onCancel} // 👈 reemplaza eliminar por anular
      />
    </div>
  );
};

export default DonationsTable;
