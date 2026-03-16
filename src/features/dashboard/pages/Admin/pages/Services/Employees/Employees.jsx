import { useState, useEffect } from "react";
import Table from "../../../../../../../shared/components/Table/table";
import EmployeeModal from "./components/EmployeeModal";
import EmployeeViewModal from "./components/EmployeeViewModal";
import { FaPlus } from "react-icons/fa";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import {
  showDeleteAlert,
  showErrorAlert,
  showSuccessAlert,
} from "../../../../../../../shared/utils/alerts.js";

// Importaciones para permisos
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";

// Hook personalizado para empleados
import { useEmployees } from "./hooks/useEmployees";
import { useReportDataWithService } from "../../../../../../../shared/hooks/useReportData";
import employeeService from "./services/employeeService";

const Employees = () => {
  const { hasPermission } = usePermissions();
  const {
    employees,
    loading,
    pagination,
    referenceData,
    loadEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    changePage,
  } = useEmployees();

  // Hook para obtener datos completos para reportes
  const { getReportData: getReportDataGeneric } = useReportDataWithService(
    employeeService.getAllForReport.bind(employeeService)
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [searchTerm, setSearchTerm] = useState("");

  // Función para traducir estados
  const translateStatus = (status) => {
    const statusMap = {
      Activo: "Activo",
      Licencia: "Licencia",
      Desvinculado: "Desvinculado",
      Fallecido: "Fallecido",
      // Mantener compatibilidad con estados antiguos
      Active: "Activo",
      Disabled: "Desvinculado",
      OnVacation: "Licencia",
      Retired: "Desvinculado",
      Deceased: "Fallecido",
    };
    return statusMap[status] || status;
  };

  // Cargar empleados cuando cambia la página o el término de búsqueda
  useEffect(() => {
    loadEmployees({
      page: pagination.page,
      limit: pagination.limit,
      search: searchTerm, // Enviar búsqueda al backend
    });
  }, [pagination.page, searchTerm]);

  // Usar datos del servidor directamente (ya vienen filtrados y paginados)
  const totalRows = pagination.total;
  const displayData = employees;

  // Función para obtener todos los empleados para reporte
  const getReportData = async () => {
    return await getReportDataGeneric(
      { search: searchTerm }, // Filtros actuales
      (employees) => employees.map((employee) => ({ // Mapper de datos
        tipoDocumento: employee.user?.documentType?.name || "",
        identificacion: employee.user?.identification || "",
        nombre: employee.user?.firstName || "",
        apellido: employee.user?.lastName || "",
        correo: employee.user?.email || "",
        telefono: employee.user?.phoneNumber || "",
        fechaNacimiento: employee.user?.birthDate || "",
        rol: employee.user?.role?.name || "",
        estado: translateStatus(employee.status) || "",
        fechaCreacion: employee.createdAt || "",
      }))
    );
  };

  const reportColumns = [
    { header: "Tipo Documento", accessor: "tipoDocumento" },
    { header: "Número de Documento", accessor: "identificacion" },
    { header: "Nombre", accessor: "nombre" },
    { header: "Apellido", accessor: "apellido" },
    { header: "Correo", accessor: "correo" },
    { header: "Teléfono", accessor: "telefono" },
    { header: "Fecha Nacimiento", accessor: "fechaNacimiento" },
    { header: "Rol", accessor: "rol" },
    { header: "Estado", accessor: "estado" },
    { header: "Fecha Creación", accessor: "fechaCreacion" },
  ];

  const handleSave = async (employeeData, signatureFile = null) => {
    try {
      if (editingEmployee) {
        // Editar - verificar permisos
        if (!hasPermission("employees", "Editar")) {
          showErrorAlert(
            "Sin permisos",
            "No tienes permisos para editar empleados",
          );
          return false;
        }
        await updateEmployee(editingEmployee.id, employeeData);
        showSuccessAlert(
          "Empleado Actualizado",
          "El empleado ha sido actualizado exitosamente",
        );
      } else {
        // Crear - verificar permisos
        if (!hasPermission("employees", "Crear")) {
          showErrorAlert(
            "Sin permisos",
            "No tienes permisos para crear empleados",
          );
          return false;
        }

        const result = await createEmployee(employeeData, signatureFile);

        if (result.success) {
          // Mostrar alerta de éxito
          showSuccessAlert(
            "Empleado Creado",
            "El empleado ha sido creado exitosamente",
          );
        }
      }

      setEditingEmployee(null);
      setIsModalOpen(false);
      return true;
    } catch (error) {
      // El error ya se maneja en el hook
      return false;
    }
  };

  const handleEdit = (employee) => {
    if (!hasPermission("employees", "Editar")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para editar empleados",
      );
      return;
    }

    // Verificar si es el usuario por defecto del sistema
    if (employee.user?.email === "astrostar.java@gmail.com") {
      showErrorAlert(
        "No se puede editar",
        "No se puede editar el usuario por defecto del sistema. Este usuario es esencial para el funcionamiento del sistema.",
      );
      return;
    }

    setEditingEmployee(employee);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleView = (employee) => {
    if (!hasPermission("employees", "Ver")) {
      showErrorAlert("Sin permisos", "No tienes permisos para ver empleados");
      return;
    }
    setViewingEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (employee) => {
    if (!hasPermission("employees", "Eliminar")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para eliminar empleados",
      );
      return;
    }

    // Verificar si es el usuario por defecto del sistema
    if (employee.user?.email === "astrostar.java@gmail.com") {
      showErrorAlert(
        "No se puede eliminar",
        "No se puede eliminar el usuario por defecto del sistema. Este usuario es esencial para el funcionamiento del sistema.",
      );
      return;
    }

    try {
      const employeeName = `${employee.user?.firstName || ""} ${
        employee.user?.lastName || ""
      }`.trim();
      const result = await showDeleteAlert(
        "¿Eliminar empleado?",
        `Se eliminará permanentemente el empleado: ${employeeName}`,
      );

      if (result.isConfirmed) {
        await deleteEmployee(employee.id, employeeName);
      }
    } catch (error) {
      // Error ya manejado por el hook
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
              changePage(1); // Resetear a la primera página al buscar
            }}
            placeholder="Buscar empleado..."
          />

          <div className="flex items-center gap-3">
            <PermissionGuard module="employees" action="Ver">
              <ReportButton
                dataProvider={getReportData}
                fileName="Reporte_Empleados"
                columns={reportColumns}
              />
            </PermissionGuard>

            <PermissionGuard module="employees" action="Crear">
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
            </PermissionGuard>
          </div>
        </div>
      </div>

      {displayData.length === 0 ? (
        <div className="p-4 text-center text-gray-400 italic">
          No hay empleados para mostrar.
        </div>
      ) : (
        <>
          <Table
            serverPagination={true}
            currentPage={pagination.page}
            totalRows={totalRows}
            rowsPerPage={pagination.limit}
            onPageChange={changePage}
            thead={{
              titles: ["Nombre", "Identificación", "Rol", "Estado"],
              state: false,
              actions: true,
            }}
            tbody={{
              data: displayData.map((employee) => ({
                ...employee,
                nombreCompleto: `${employee.user?.firstName || ""} ${
                  employee.user?.lastName || ""
                }`.trim(),
                identificacion: employee.user?.identification || "",
                rol: employee.user?.role?.name || "",
                estado: translateStatus(employee.status) || "",
              })),
              dataPropertys: [
                "nombreCompleto",
                "identificacion",
                "rol",
                "estado",
              ],
              state: true,
            }}
            onEdit={hasPermission("employees", "Editar") ? handleEdit : null}
            onDelete={
              hasPermission("employees", "Eliminar") ? handleDelete : null
            }
            onView={hasPermission("employees", "Ver") ? handleView : null}
            buttonConfig={{
              edit: (employee) => ({
                show: hasPermission("employees", "Editar"),
                disabled: employee.user?.email === "astrostar.java@gmail.com",
                title:
                  employee.user?.email === "astrostar.java@gmail.com"
                    ? "No se puede editar el usuario por defecto del sistema"
                    : "Editar empleado",
              }),
              delete: (employee) => ({
                show: hasPermission("employees", "Eliminar"),
                disabled: employee.user?.email === "astrostar.java@gmail.com",
                title:
                  employee.user?.email === "astrostar.java@gmail.com"
                    ? "No se puede eliminar el usuario por defecto del sistema"
                    : "Eliminar empleado",
              }),
              view: () => ({
                show: hasPermission("employees", "Ver"),
                disabled: false,
                title: "Ver detalles",
              }),
            }}
          />
        </>
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
        referenceData={referenceData}
      />

      <EmployeeViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingEmployee(null);
        }}
        employee={viewingEmployee}
        referenceData={referenceData}
      />
    </div>
  );
};

export default Employees;

