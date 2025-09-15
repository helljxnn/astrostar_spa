import React, { useState, useMemo } from "react";
import Table from "../../../../../../../shared/components/Table/table";
import EmployeeModal from "./components/EmployeeModal";
import employeesData from "../../../../../../../shared/models/EmployeeData";
import { FaPlus } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import Pagination from "../../../../../../../shared/components/Table/Pagination";

const Employees = () => {
  const [data, setData] = useState(employeesData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null); //  para saber si edita
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Filtrar por búsqueda
  const filteredData = useMemo(
    () =>
      data.filter((item) =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [data, searchTerm]
  );

  // Calcular datos de paginación
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // Guardar empleado (crear o editar)
  const handleSave = (employee) => {
    if (editingEmployee) {
      // Editar
      setData((prev) =>
        prev.map((item) =>
          item.id === editingEmployee.id ? { ...employee, id: editingEmployee.id } : item
        )
      );
    } else {
      // Crear
      setData((prev) => [
        ...prev,
        { ...employee, id: prev.length + 1 }, //  asignar ID simple
      ]);
    }

    setEditingEmployee(null);
    setIsModalOpen(false);
  };

  // Editar empleado
  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 font-questrial">
      {/* Header con buscador y botones */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Empleados</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          {/* Buscador */}
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reiniciar paginación en búsqueda
            }}
            placeholder="Buscar empleado..."
          />

          {/* Botones */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
              <IoMdDownload size={22} className="text-primary-purple" />
              Generar reporte
            </button>
            <button
              onClick={() => {
                setEditingEmployee(null); // limpiar si es crear
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
            >
              <FaPlus /> Crear
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <Table
        thead={{
          titles: ["Nombre", "Identificación", "Tipo de Empleado", "Rol", "Estado"],
          state: true,
        }}
        tbody={{
          data: paginatedData,
          dataPropertys: ["nombre", "identificacion", "tipoEmpleado", "rol", "estado"],
          state: true,
        }}
        onEdit={handleEdit} // habilitar editar
      />

      {/* Paginador */}
      {totalRows > rowsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalRows={totalRows}
          rowsPerPage={rowsPerPage}
          startIndex={startIndex}
        />
      )}

      {/* Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null);
        }}
        onSave={handleSave}
        employee={editingEmployee} 
      />
    </div>
  );
};

export default Employees;
