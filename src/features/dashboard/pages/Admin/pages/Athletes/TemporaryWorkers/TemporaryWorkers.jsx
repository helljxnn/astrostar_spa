import React, { useState } from "react";
import Table from "../../../../../../../shared/components/Table/table";
import TemporaryWorkerModal from "./components/TemporaryWorkerModal";
import temporaryWorkersData from "../../../../../../../shared/models/TemporaryWorkersData";
import { FaPlus } from "react-icons/fa";

const TemporaryWorkers = () => {
  const [data, setData] = useState(temporaryWorkersData);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = (newWorker) => {
    setData([...data, newWorker]);
  };

  return (
    <div className="p-6 font-questrial">
      {/* Header con botón Crear */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Personas Temporales
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
        >
          <FaPlus /> Crear
        </button>
      </div>

      {/* Tabla usando componente genérico */}
      <Table
        thead={{
          titles: [
            "Tipo de Persona",
            "Nombre",
            "Identificación",
            "Categoría",
            "Edad",
            "Estado",
          ],
          state: true,
        }}
        tbody={{
          data,
          dataPropertys: [
            "tipoPersona",
            "nombre",
            "identificacion",
            "categoria",
            "edad",
            "estado",
          ],
          state: true,
        }}
      />

      {/* Modal */}
      <TemporaryWorkerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default TemporaryWorkers;
