import { useState, useMemo } from "react";
import Table from "../../../../../../../shared/components/Table/table";
import EmployeeModal from "./components/EmployeeModal";
import EmployeeViewModal from "./components/EmployeeViewModal";
import { FaPlus } from "react-icons/fa";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import Pagination from "../../../../../../../shared/components/Table/Pagination";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import CredentialsModal from "../../../../../../../shared/components/CredentialsModal";
import {
  showDeleteAlert,
  showErrorAlert,
  showSuccessAlert,
} from "../../../../../../../shared/utils/alerts";

// Importaciones para permisos
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";

// Hook personalizado para empleados
import { useEmployees } from "../../../../../../../shared/hooks/useEmployees";

const Employees = () => {
  const { hasPermission } = usePermissions();
  const {
    employees,
    loading,
    pagination,
    referenceData,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    changePage
  } = useEmployees();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCredentials, setShowCredentials] = useState(false);
  const [createdEmployeeData, setCreatedEmployeeData] = useState(null);

  // Filtrar datos localmente si hay término de búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm) return employees;

    return employees.filter((employee) => {
      const searchFields = [
        employee.user?.firstName,
        employee.user?.lastName,
        employee.user?.email,
        employee.user?.identification,

        employee.user?.role?.name
      ];
      
      return searchFields.some(field => 
        field && String(field).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [employees, searchTerm]);

  // Función para traducir estados
  const translateStatus = (status) => {
    const statusMap = {
      'Active': 'Activo',
      'Disabled': 'Deshabilitado',
      'OnVacation': 'En Vacaciones',
      'Retired': 'Retirado',
      'Deceased': 'Fallecido'
    };
    return statusMap[status] || status;
  };

  // Usar paginación del servidor cuando no hay búsqueda local
  const displayData = searchTerm ? filteredData : employees;
  const totalRows = searchTerm ? filteredData.length : pagination.total;

  // Preparar datos para reporte
  const reportData = displayData.map(employee => ({
    tipoDocumento: employee.user?.documentType?.name || '',
    identificacion: employee.user?.identification || '',
    nombre: employee.user?.firstName || '',
    apellido: employee.user?.lastName || '',
    correo: employee.user?.email || '',
    telefono: employee.user?.phoneNumber || '',
    fechaNacimiento: employee.user?.birthDate || '',
    rol: employee.user?.role?.name || '',
    estado: translateStatus(employee.status) || '',
    fechaCreacion: employee.createdAt || ''
  }));

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

  const handleSave = async (employeeData) => {
    try {
      if (editingEmployee) {
        // Editar - verificar permisos
        if (!hasPermission('employees', 'Editar')) {
          showErrorAlert('Sin permisos', 'No tienes permisos para editar empleados');
          return false;
        }
        await updateEmployee(editingEmployee.id, employeeData);
        showSuccessAlert(
          'Empleado Actualizado',
          'El empleado ha sido actualizado exitosamente'
        );
      } else {
        // Crear - verificar permisos
        if (!hasPermission('employees', 'Crear')) {
          showErrorAlert('Sin permisos', 'No tienes permisos para crear empleados');
          return false;
        }
        
        const result = await createEmployee(employeeData);
        
        // Mostrar modal de credenciales
        setCreatedEmployeeData({
          employee: result.data,
          credentials: {
            email: result.data.user.email,
            temporaryPassword: result.temporaryPassword
          },
          emailSent: result.emailSent
        });
        setShowCredentials(true);
      }

      setEditingEmployee(null);
      setIsModalOpen(false);
      return true;
    } catch (error) {
      // El error ya se maneja en el hook
      console.error('Error guardando empleado:', error);
      return false;
    }
  };

  const handleEdit = (employee) => {
    if (!hasPermission('employees', 'Editar')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para editar empleados');
      return;
    }
    setEditingEmployee(employee);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleView = (employee) => {
    if (!hasPermission('employees', 'Ver')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para ver empleados');
      return;
    }
    setViewingEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (employee) => {
    if (!hasPermission('employees', 'Eliminar')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para eliminar empleados');
      return;
    }

    // Verificar si el empleado está activo
    if (employee.status === 'Active') {
      showErrorAlert(
        'No se puede eliminar', 
        'No se puede eliminar un empleado con estado "Activo". Primero cambie el estado a "Deshabilitado" y luego inténtelo de nuevo.'
      );
      return;
    }
    
    try {
      const employeeName = `${employee.user?.firstName || ''} ${employee.user?.lastName || ''}`.trim();
      const result = await showDeleteAlert(
        "¿Eliminar empleado?",
        `Se eliminará permanentemente el empleado: ${employeeName}`
      );

      if (result.isConfirmed) {
        await deleteEmployee(employee.id, employeeName);
      }
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
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
              // Si hay búsqueda, no cambiar página del servidor
              if (!e.target.value) {
                changePage(1);
              }
            }}
            placeholder="Buscar empleado..."
          />

          <div className="flex items-center gap-3">
            <PermissionGuard module="employees" action="Ver">
              <ReportButton
                data={reportData}
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

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
          <span className="ml-2 text-gray-600">Cargando empleados...</span>
        </div>
      ) : (
        <>
          <Table
            thead={{
              titles: ["Nombre Completo", "Identificación", "Rol", "Estado"],
              state: false,
              actions: true,
            }}
            tbody={{
              data: displayData.map(employee => ({
                ...employee,
                nombreCompleto: `${employee.user?.firstName || ''} ${employee.user?.lastName || ''}`.trim(),
                identificacion: employee.user?.identification || '',
                rol: employee.user?.role?.name || '',
                estado: translateStatus(employee.status) || ''
              })),
              dataPropertys: ["nombreCompleto", "identificacion", "rol", "estado"],
              state: true,
            }}
            onEdit={hasPermission('employees', 'Editar') ? handleEdit : null}
            onDelete={hasPermission('employees', 'Eliminar') ? handleDelete : null}
            onView={hasPermission('employees', 'Ver') ? handleView : null}
            buttonConfig={{
              edit: () => ({
                show: hasPermission('employees', 'Editar'),
                disabled: false,
                title: 'Editar empleado'
              }),
              delete: (employee) => ({
                show: hasPermission('employees', 'Eliminar'),
                disabled: employee.status === 'Active',
                title: employee.status === 'Active' 
                  ? 'No se puede eliminar un empleado activo' 
                  : 'Eliminar empleado'
              }),
              view: () => ({
                show: hasPermission('employees', 'Ver'),
                disabled: false,
                title: 'Ver detalles'
              })
            }}
          />

          {!searchTerm && totalRows > pagination.limit && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={changePage}
              totalRows={totalRows}
              rowsPerPage={pagination.limit}
              startIndex={(pagination.page - 1) * pagination.limit}
            />
          )}
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

      <CredentialsModal
        isOpen={showCredentials}
        onClose={() => {
          setShowCredentials(false);
          setCreatedEmployeeData(null);
        }}
        employeeData={createdEmployeeData?.employee?.user}
        credentials={createdEmployeeData?.credentials}
      />
    </div>
  );
};

export default Employees;