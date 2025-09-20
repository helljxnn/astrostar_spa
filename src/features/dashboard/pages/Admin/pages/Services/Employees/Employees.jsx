import React, { useState, useMemo } from "react";
import Table from "../../../../../../../shared/components/Table/table";
import EmployeeModal from "./components/EmployeeModal";
import employeesData from "../../../../../../../shared/models/EmployeeData";
import { FaPlus } from "react-icons/fa";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import Pagination from "../../../../../../../shared/components/Table/Pagination";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import {
  showDeleteAlert,
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../shared/utils/Alerts";

const Employees = () => {
  const [data, setData] = useState(employeesData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [modalMode, setModalMode] = useState("create"); // "create", "edit", "view"
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Filtrar por búsqueda general en cualquier campo del objeto
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((item) =>
      Object.values(item).some(
        (value) => String(value).toLowerCase() === searchTerm.toLowerCase()
      )
    );
  }, [data, searchTerm]);

  // Calcular datos de paginación
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // Columnas para reporte
  const reportColumns = [
    { key: "tipoDocumento", label: "Tipo Documento" },
    { key: "identificacion", label: "Número de Documento" },
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "correo", label: "Correo" },
    { key: "telefono", label: "Teléfono" },
    { key: "edad", label: "Edad" },
    { key: "rol", label: "Rol" },
    { key: "tipoEmpleado", label: "Tipo Empleado" },
    { key: "estado", label: "Estado" },
    { key: "fechaAsignacion", label: "Fecha Asignación" },
  ];

  // Guardar empleado (crear o editar)
  const handleSave = (employee) => {
    if (editingEmployee) {
      // Editar
      setData((prev) =>
        prev.map((item) =>
          item.id === editingEmployee.id
            ? { ...employee, id: editingEmployee.id }
            : item
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
    setModalMode("edit");
    setIsModalOpen(true);
  };

  // Ver empleado
  const handleView = (employee) => {
    setEditingEmployee(employee);
    setModalMode("view");
    setIsModalOpen(true);
  };

  // Eliminar empleado
  const handleDelete = async (employee) => {
    try {
      const result = await showDeleteAlert(
        "¿Eliminar empleado?",
        `Se eliminará permanentemente el empleado: ${employee.nombre} ${employee.apellido}`
      );

      if (result.isConfirmed) {
        setData((prev) => prev.filter((item) => item.id !== employee.id));
        showSuccessAlert(
          "Empleado eliminado",
          `${employee.nombre} ${employee.apellido} ha sido eliminado correctamente.`
        );
      }
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      showErrorAlert(
        "Error al eliminar",
        "No se pudo eliminar el empleado. Intenta de nuevo."
      );
    }
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
              setCurrentPage(1);
            }}
            placeholder="Buscar rol..."
          />

          {/* Botones */}
          <div className="flex items-center gap-3">
            {/* Reportes */}
            <ReportButton
              data={filteredData}
              fileName="Reporte_Empleados"
              columns={reportColumns}
            />
            <button
              onClick={() => {
                setEditingEmployee(null); // limpiar si es crear
                setModalMode("create");
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
          titles: [
            "Nombre",
            "Identificación",
            "Tipo de Empleado",
            "Rol",
            "Estado",
          ],
          state: true,
        }}
        tbody={{
          data: paginatedData,
          dataPropertys: [
            "nombre",
            "identificacion",
            "tipoEmpleado",
            "rol",
            "estado",
          ],
          state: true,
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
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

      {/* Modal de Empleados */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null);
          setModalMode("create");
        }}
        onSave={handleSave}
        onDelete={handleDelete}
        employee={editingEmployee}
        mode={modalMode}
      />
    </div>
  );
};

export default Employees;
