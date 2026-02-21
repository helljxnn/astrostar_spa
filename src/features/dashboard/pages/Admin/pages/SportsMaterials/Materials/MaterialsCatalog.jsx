import { useState, useEffect } from 'react';
import { FaPlus, FaMinusCircle } from 'react-icons/fa';
import MaterialModal from "./components/MaterialModal";
import MaterialViewModal from "./components/MaterialViewModal";
import MaterialDischargeModal from "./components/MaterialDischargeModal";
import Table from "../../../../../../../shared/components/Table/table";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import Pagination from "../../../../../../../shared/components/Table/Pagination";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";
import { showSuccessAlert, showErrorAlert, showDeleteAlert } from '../../../../../../../shared/utils/alerts';
import materialsService from './services/MaterialsService';

const MaterialsCatalog = () => {
  const { hasPermission } = usePermissions();
  const [materials, setMaterials] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchMaterials();
  }, [currentPage, searchTerm]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await materialsService.getMaterials({
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm
      });
      
      if (response.success) {
        setMaterials(response.data || []);
        setTotalRows(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error al cargar materiales:', error);
      // No mostrar alerta, solo establecer datos vacíos
      setMaterials([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;

  const handleCreate = () => {
    if (!hasPermission('materials', 'Crear')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para crear materiales');
      return;
    }
    setSelectedMaterial(null);
    setIsModalOpen(true);
  };

  const handleEdit = (material) => {
    if (!hasPermission('materials', 'Editar')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para editar materiales');
      return;
    }
    setSelectedMaterial(material);
    setIsModalOpen(true);
  };

  const handleSave = async (materialData, materialId = null) => {
    const isEditing = !!materialId;
    
    if (!hasPermission('materials', isEditing ? 'Editar' : 'Crear')) {
      showErrorAlert('Sin permisos', `No tienes permisos para ${isEditing ? 'editar' : 'crear'} materiales`);
      return false;
    }

    try {
      const response = isEditing 
        ? await materialsService.updateMaterial(materialId, materialData)
        : await materialsService.createMaterial(materialData);
      
      if (response.success) {
        showSuccessAlert(
          isEditing ? "Material Actualizado" : "Material Creado", 
          `El material "${materialData.nombre}" fue ${isEditing ? 'actualizado' : 'creado'} correctamente.`
        );
        setIsModalOpen(false);
        fetchMaterials();
        return true;
      } else {
        showErrorAlert(
          "Error",
          response.message || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el material`
        );
        return false;
      }
    } catch (error) {
      console.error('Error al guardar material:', error);
      showErrorAlert("Error", error.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el material en el servidor`);
      return false;
    }
  };

  const handleView = (material) => {
    if (!hasPermission('materials', 'Ver')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para ver detalles de materiales');
      return;
    }
    setSelectedMaterial(material);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (material) => {
    if (!hasPermission('materials', 'Eliminar')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para eliminar materiales');
      return;
    }

    const confirmResult = await showDeleteAlert(
      "¿Estás seguro?",
      `Se eliminará el material "${material.nombre}". Esta acción no se puede deshacer.\n\nNota: No se puede eliminar si tiene movimientos asociados o stock.`,
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" }
    );
    
    if (!confirmResult.isConfirmed) return;

    try {
      const response = await materialsService.deleteMaterial(material.id);
      
      if (response.success) {
        showSuccessAlert(
          "Material Eliminado", 
          `El material "${material.nombre}" fue eliminado correctamente.`
        );
        fetchMaterials();
      } else {
        showErrorAlert(
          "Error",
          response.message || "No se pudo eliminar el material"
        );
      }
    } catch (error) {
      console.error('Error al eliminar material:', error);
      showErrorAlert("Error", error.message || "Error al eliminar el material en el servidor");
    }
  };

  const handleDischarge = (material) => {
    if (!hasPermission('materials', 'Editar')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para registrar bajas de materiales');
      return;
    }
    setSelectedMaterial(material);
    setIsDischargeModalOpen(true);
  };

  const handleSaveDischarge = async (dischargeData) => {
    if (!hasPermission('materials', 'Editar')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para registrar bajas de materiales');
      return false;
    }

    try {
      const response = await materialsService.registerDischarge(selectedMaterial.id, dischargeData);
      
      if (response.success) {
        showSuccessAlert(
          "Baja Registrada", 
          `Se registró la baja de ${dischargeData.cantidad} unidades del material "${selectedMaterial.nombre}".`
        );
        setIsDischargeModalOpen(false);
        fetchMaterials();
        return true;
      } else {
        showErrorAlert(
          "Error",
          response.message || "No se pudo registrar la baja"
        );
        return false;
      }
    } catch (error) {
      console.error('Error al registrar baja:', error);
      showErrorAlert("Error", error.message || "Error al registrar la baja en el servidor");
      return false;
    }
  };

  // Preparar datos para tabla con truncado
  const tableData = materials.map(m => {
    console.log('Material:', m.nombre, 'Stock Disponible:', m.stockDisponible);
    return {
      ...m,
      nombreTruncated: m.nombre.length > 40 ? m.nombre.substring(0, 40) + '...' : m.nombre,
      categoriaTruncated: m.categoria.length > 35 ? m.categoria.substring(0, 35) + '...' : m.categoria,
      stockDisponible: m.stockDisponible || 0,
      stockReservado: m.stockReservado || 0,
      stockTotal: m.stockActual || 0,
    };
  });

  // Datos para reporte
  const reportData = materials.map(m => ({
    nombre: m.nombre,
    categoria: m.categoria,
    stockDisponible: m.stockDisponible || 0,
    stockReservado: m.stockReservado || 0,
    stockTotal: m.stockActual || 0,
    estado: m.estado,
    descripcion: m.descripcion || 'N/A',
  }));

  return (
    <div className="p-6 font-questrial">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Gestión de Materiales</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar material"
          />

          <div className="flex items-center gap-3">
            <PermissionGuard module="materials" action="Ver">
              <ReportButton
                data={reportData}
                fileName="Reporte_Materiales"
                columns={[
                  { header: "Nombre", accessor: "nombre" },
                  { header: "Categoría", accessor: "categoria" },
                  { header: "Stock Disponible", accessor: "stockDisponible" },
                  { header: "Stock Reservado", accessor: "stockReservado" },
                  { header: "Stock Total", accessor: "stockTotal" },
                  { header: "Estado", accessor: "estado" },
                  { header: "Descripción", accessor: "descripcion" },
                ]}
              />
            </PermissionGuard>

            <PermissionGuard module="materials" action="Crear">
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
              >
                <FaPlus /> Crear
              </button>
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <Table
        thead={{
          titles: ["Nombre", "Categoría", "Stock Disponible", "Stock Reservado", "Stock Total"],
          state: true,
          actions: true,
        }}
        tbody={{
          data: tableData,
          dataPropertys: ["nombreTruncated", "categoriaTruncated", "stockDisponible", "stockReservado", "stockTotal"],
          state: true,
          stateMap: {
            Activo: "bg-green-100 text-green-800",
            Inactivo: "bg-red-100 text-red-800",
          },
        }}
        onView={hasPermission('materials', 'Ver') ? handleView : null}
        onEdit={hasPermission('materials', 'Editar') ? handleEdit : null}
        onDelete={hasPermission('materials', 'Eliminar') ? handleDelete : null}
        customActions={
          hasPermission('materials', 'Editar')
            ? [
                {
                  onClick: handleDischarge,
                  className:
                    'p-2 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors',
                  label: <FaMinusCircle />,
                  title: 'Registrar Baja',
                  show: (item) => true, // Temporal: siempre mostrar para testing
                },
              ]
            : undefined
        }
        buttonConfig={{
          view: () => ({
            show: hasPermission('materials', 'Ver'),
            disabled: false,
            title: "Ver detalles",
          }),
          edit: () => ({
            show: hasPermission('materials', 'Editar'),
            disabled: false,
            title: "Editar material",
          }),
          delete: () => ({
            show: hasPermission('materials', 'Eliminar'),
            disabled: false,
            title: "Eliminar material",
          }),
        }}
      />

      {/* Paginación */}
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

      {/* Modales */}
      <MaterialModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMaterial(null);
        }}
        onSave={handleSave}
        material={selectedMaterial}
      />

      <MaterialViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedMaterial(null);
        }}
        material={selectedMaterial}
        onEdit={handleEdit}
        canEdit={hasPermission('materials', 'Editar')}
      />

      <MaterialDischargeModal
        isOpen={isDischargeModalOpen}
        onClose={() => {
          setIsDischargeModalOpen(false);
          setSelectedMaterial(null);
        }}
        onSave={handleSaveDischarge}
        material={selectedMaterial}
      />
    </div>
  );
};

export default MaterialsCatalog;

