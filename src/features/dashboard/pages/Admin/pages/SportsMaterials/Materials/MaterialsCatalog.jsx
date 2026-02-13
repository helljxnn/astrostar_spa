import { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import MaterialModal from "./components/MaterialModal";
import MaterialViewModal from "./components/MaterialViewModal";
import Table from "../../../../../../../shared/components/Table/table";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import Pagination from "../../../../../../../shared/components/Table/Pagination";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";
import { showSuccessAlert, showErrorAlert } from '../../../../../../../shared/utils/alerts';
import materialsService from './services/MaterialsService';

const MaterialsCatalog = () => {
  const { hasPermission } = usePermissions();
  const [materials, setMaterials] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
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
      // Si el backend no existe (404), mostrar mensaje amigable
      if (error.message === 'Route not found') {
        console.warn('⚠️ Backend no implementado aún. Esperando endpoints de /api/materials');
      }
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
    if (!hasPermission('sportsEquipment', 'Crear')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para crear materiales');
      return;
    }
    setSelectedMaterial(null);
    setIsModalOpen(true);
  };

  const handleEdit = (material) => {
    if (!hasPermission('sportsEquipment', 'Editar')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para editar materiales');
      return;
    }
    setSelectedMaterial(material);
    setIsModalOpen(true);
  };

  const handleSave = async (materialData, materialId = null) => {
    const isEditing = !!materialId;
    
    if (!hasPermission('sportsEquipment', isEditing ? 'Editar' : 'Crear')) {
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
    if (!hasPermission('sportsEquipment', 'Ver')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para ver detalles de materiales');
      return;
    }
    setSelectedMaterial(material);
    setIsViewModalOpen(true);
  };

  // Preparar datos para tabla
  const tableData = materials.map(m => ({
    ...m,
    stockFormatted: `${m.stockActual || 0} unidades`,
  }));

  // Datos para reporte
  const reportData = materials.map(m => ({
    nombre: m.nombre,
    categoria: m.categoria,
    stock: m.stockActual || 0,
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
            <PermissionGuard module="sportsEquipment" action="Ver">
              <ReportButton
                data={reportData}
                fileName="Reporte_Materiales"
                columns={[
                  { header: "Nombre", accessor: "nombre" },
                  { header: "Categoría", accessor: "categoria" },
                  { header: "Stock", accessor: "stock" },
                  { header: "Estado", accessor: "estado" },
                  { header: "Descripción", accessor: "descripcion" },
                ]}
              />
            </PermissionGuard>

            <PermissionGuard module="sportsEquipment" action="Crear">
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
          titles: ["Nombre", "Categoría", "Stock"],
          state: true,
          actions: true,
        }}
        tbody={{
          data: tableData,
          dataPropertys: ["nombre", "categoria", "stockFormatted"],
          state: true,
          stateMap: {
            Activo: "bg-green-100 text-green-800",
            Inactivo: "bg-red-100 text-red-800",
          },
        }}
        onView={hasPermission('sportsEquipment', 'Ver') ? handleView : null}
        onEdit={hasPermission('sportsEquipment', 'Editar') ? handleEdit : null}
        buttonConfig={{
          view: () => ({
            show: hasPermission('sportsEquipment', 'Ver'),
            disabled: false,
            title: "Ver detalles",
          }),
          edit: () => ({
            show: hasPermission('sportsEquipment', 'Editar'),
            disabled: false,
            title: "Editar material",
          }),
          delete: () => ({
            show: false,
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
        canEdit={hasPermission('sportsEquipment', 'Editar')}
      />
    </div>
  );
};

export default MaterialsCatalog;
