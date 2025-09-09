
// import React, { useState } from "react";
// import { EmployeesTable } from "../Employees/components/EmployeeTable";
// import EmployeeModal from "./components/EmployeeModal";
// import employeesData from "../../../../../../../shared/models/EmployeeData";
// import { FaPlus } from "react-icons/fa";
import React, { useState } from "react";
import Table from "../../../../../../../shared/components/Table/table";
import EmployeeModal from "./components/EmployeeModal";
import employeesData from "../../../../../../../shared/models/EmployeeData";
import { FaPlus } from "react-icons/fa";

const Employees = () => {
  const [data, setData] = useState(employeesData);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = (newEmployee) => {
    setData([...data, newEmployee]);
  };

  return (
    <div className="p-6 font-questrial">
      {/* Header con botón Crear */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Empleados</h1>
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
          titles: ["Nombre", "Identificación", "Tipo de Empleado", "Rol", "Estado"],
          state: true,
        }}
        tbody={{
          data,
          dataPropertys: ["nombre", "identificacion", "tipoEmpleado", "rol", "estado"],
          state: true,
        }}
      />

      {/* Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default Employees;
