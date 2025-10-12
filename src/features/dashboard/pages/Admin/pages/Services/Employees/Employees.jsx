import { useState, useMemo } from "react";
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
} from "../../../../../../../shared/utils/alerts";

const Employees = () => {
  const [data, setData] = useState(employeesData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  
  const reportColumns = [
    { header: "Tipo Documento", accessor: "tipoDocumento" },
    { header: "Número de Documento", accessor: "identificacion" },
    { header: "Nombre", accessor: "nombre" },
    { header: "Apellido", accessor: "apellido" },
    { header: "Correo", accessor: "correo" },
    { header: "Teléfono", accessor: "telefono" },
    { header: "Edad", accessor: "edad" },
    { header: "Rol", accessor: "rol" },
    { header: "Tipo Empleado", accessor: "tipoEmpleado" },
    { header: "Estado", accessor: "estado" },
    { header: "Fecha Asignación", accessor: "fechaAsignacion" },
  ];

  const handleSave = (employee) => {
    if (editingEmployee) {
      setData((prev) =>
        prev.map((item) =>
          item.id === editingEmployee.id
            ? { ...employee, id: editingEmployee.id }
            : item
        )
      );
    } else {
      // Generar ID único basado en el máximo ID existente + 1
      const maxId = data.length > 0 ? Math.max(...data.map(emp => emp.id || 0)) : 0;
      setData((prev) => [
        ...prev,
        { ...employee, id: maxId + 1 },
      ]);
    }

    setEditingEmployee(null);
    setIsModalOpen(false);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleView = (employee) => {
    setEditingEmployee(employee);
    setModalMode("view");
    setIsModalOpen(true);
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Empleados</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar empleado..."
          />

          <div className="flex items-center gap-3">
            <ReportButton
              data={filteredData}
              fileName="Reporte_Empleados"
              columns={reportColumns}
            />
            <button
              onClick={() => {
                setEditingEmployee(null);
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

      <Table
        thead={{
          titles: ["Nombre", "Identificación", "Tipo de Empleado", "Rol"],
          state: true,
        }}
        tbody={{
          data: paginatedData,
          dataPropertys: ["nombre", "identificacion", "tipoEmpleado", "rol"],
          state: true,
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

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