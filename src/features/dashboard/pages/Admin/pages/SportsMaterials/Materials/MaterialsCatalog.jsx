import { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaMinusCircle, FaExchangeAlt } from 'react-icons/fa';
import MaterialModal from "./components/MaterialModal";
import MaterialViewModal from "./components/MaterialViewModal";
import MaterialDischargeModal from "./components/MaterialDischargeModal";
import TransferModal from "./components/TransferModal";
import Table from "../../../../../../../shared/components/Table/table";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import Pagination from "../../../../../../../shared/components/Table/Pagination";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";
import { showSuccessAlert, showErrorAlert, showDeleteAlert } from '../../../../../../../shared/utils/alerts';
import materialsService from './services/MaterialsService';
import { formatNumber } from '../../../../../../../shared/utils/numberFormat';

const MaterialsCatalog = () => {
  const { hasPermission } = usePermissions();
  const [materials, setMaterials] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchMaterials();
  }, [currentPage]); // Solo recargar cuando cambia la página, no el searchTerm

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      
      const response = await materialsService.getMaterials({
        page: currentPage,
        limit: rowsPerPage,
        search: '' // No enviar search al backend, filtraremos localmente
      });
      
      if (response.success) {
        setMaterials(response.data || []);
        setTotalRows(response.pagination?.total || response.data?.length || 0);
      }
    } catch (error) {
      console.error('Error al cargar materiales:', error);
      setMaterials([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar datos localmente si hay término de búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm) return materials;

    const searchLower = searchTerm.toLowerCase().trim();

    return materials.filter((material) => {
      // Campos de texto general (búsqueda por contiene)
      const textFields = [
        material.nombre,
        material.categoria,
        material.descripcion,
      ];

      const textMatch = textFields.some(
        (field) => field && String(field).toLowerCase().includes(searchLower)
      );

      // Campo de estado (búsqueda exacta de palabra completa)
      const estadoLower = material.estado?.toLowerCase();
      const statusMatch = estadoLower === searchLower;

      // Buscar en stocks (convertir números a string)
      const stockMatch = 
        material.stockFundacion?.toString().includes(searchLower) ||
        material.stockEventos?.toString().includes(searchLower) ||
        material.stockTotal?.toString().includes(searchLower);

      // Buscar en fechas (formato legible)
      let dateMatch = false;
      if (material.createdAt) {
        const fecha = new Date(material.createdAt);
        const fechaStr = fecha.toLocaleDateString('es-ES');
        dateMatch = fechaStr.includes(searchLower);
      }

      return textMatch || statusMatch || stockMatch || dateMatch;
    });
  }, [materials, searchTerm]);

  // Usar datos filtrados cuando hay búsqueda local
  const displayData = searchTerm ? filteredData : materials;
  const displayTotalRows = searchTerm ? filteredData.length : totalRows;

  const totalPages = Math.ceil(displayTotalRows / rowsPerPage);
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

    // Verificar si tiene stock
    const hasStock = (material.stockTotalNumeric || 0) > 0;
    
    // Verificar si tiene movimientos históricos
    const hasMovements = material.hasMovements || false;
    
    if (hasStock) {
      showErrorAlert(
        'No se puede eliminar',
        `Este material tiene stock registrado (${material.stockTotal} unidades). No se puede eliminar.`
      );
      return;
    }

    if (hasMovements) {
      showErrorAlert(
        'No se puede eliminar',
        'Este material tiene movimientos históricos registrados. Para mantener la integridad del historial, márcalo como "Inactivo" en lugar de eliminarlo.'
      );
      return;
    }

    const confirmResult = await showDeleteAlert(
      "¿Estás seguro?",
      `Se eliminará el material "${material.nombre}". Esta acción no se puede deshacer.`,
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
    // Buscar el material original sin formatear
    const originalMaterial = materials.find(m => m.id === material.id);
    setSelectedMaterial(originalMaterial || material);
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

  const handleTransfer = (material) => {
    if (!hasPermission('materials', 'Editar')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para transferir stock');
      return;
    }
    const originalMaterial = materials.find(m => m.id === material.id);
    setSelectedMaterial(originalMaterial || material);
    setIsTransferModalOpen(true);
  };

  const handleSaveTransfer = async (transferData) => {
    if (!hasPermission('materials', 'Editar')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para transferir stock');
      return false;
    }

    try {
      const response = await materialsService.transferStock(selectedMaterial.id, transferData);
      
      if (response.success) {
        showSuccessAlert(
          "Transferencia Exitosa",
          `Se transfirieron ${transferData.cantidad} unidades de "${selectedMaterial.nombre}" desde ${transferData.from === 'FUNDACION' ? 'Fundación' : 'Eventos'} hacia ${transferData.to === 'FUNDACION' ? 'Fundación' : 'Eventos'}.`
        );
        setIsTransferModalOpen(false);
        fetchMaterials();
        return true;
      } else {
        showErrorAlert(
          "Error",
          response.message || "No se pudo realizar la transferencia"
        );
        return false;
      }
    } catch (error) {
      console.error('Error al transferir:', error);
      showErrorAlert("Error", error.message || "Error al transferir stock");
      return false;
    }
  };

  // Preparar datos para tabla con truncado - SIMPLE: 3 columnas
  const tableData = displayData.map(m => {
    const stockFundacion = m.stockFundacion || 0;
    const stockEventos = m.stockEventos || 0;
    const stockTotal = m.stockTotal || (stockFundacion + stockEventos);
    
    return {
      ...m,
      nombreTruncated: m.nombre.length > 30 ? m.nombre.substring(0, 30) + '...' : m.nombre,
      categoriaTruncated: m.categoria.length > 30 ? m.categoria.substring(0, 30) + '...' : m.categoria,
      stockFundacion: formatNumber(stockFundacion),
      stockEventos: formatNumber(stockEventos),
      stockTotal: formatNumber(stockTotal),
      // Preservar valores numéricos originales para validaciones
      stockTotalNumeric: stockTotal,
      hasMovements: m.hasMovements,
      movementsCount: m.movementsCount,
    };
  });

  // Datos para reporte
  const reportData = displayData.map(m => {
    const stockFundacion = m.stockFundacion || 0;
    const stockEventos = m.stockEventos || 0;
    const stockTotal = m.stockTotal || (stockFundacion + stockEventos);
    
    return {
      nombre: m.nombre,
      categoria: m.categoria,
      stockFundacion: stockFundacion,
      stockEventos: stockEventos,
      stockTotal: stockTotal,
      estado: m.estado,
      descripcion: m.descripcion || 'N/A',
    };
  });

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
              // Si hay búsqueda, resetear a página 1 pero no recargar del servidor
              if (!e.target.value) {
                setCurrentPage(1);
              }
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
                  { header: "Stock Fundación", accessor: "stockFundacion" },
                  { header: "Stock Eventos", accessor: "stockEventos" },
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
          titles: ["Nombre", "Categoría", "Fundación", "Eventos", "Total"],
          state: true,
          actions: true,
        }}
        tbody={{
          data: tableData,
          dataPropertys: ["nombreTruncated", "categoriaTruncated", "stockFundacion", "stockEventos", "stockTotal"],
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
                  onClick: handleTransfer,
                  className:
                    'p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors',
                  label: <FaExchangeAlt />,
                  title: 'Transferir Stock',
                  show: (item) => true,
                },
                {
                  onClick: handleDischarge,
                  className:
                    'p-2 rounded-full bg-[#f5ebe8] border border-[#f0e0da] text-[#c3a096] hover:text-[#a88a7f] hover:border-[#e5d5cf] transition-colors',
                  label: <FaMinusCircle />,
                  title: 'Registrar Baja',
                  show: (item) => true,
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
          delete: (material) => {
            const hasStock = (material.stockTotalNumeric || 0) > 0;
            const hasMovements = material.hasMovements || false;
            
            return {
              show: hasPermission('materials', 'Eliminar'),
              disabled: hasStock || hasMovements,
              title: hasStock
                ? "Tiene stock registrado"
                : hasMovements
                ? "Tiene movimientos históricos"
                : "Eliminar material",
            };
          },
        }}
      />

      {/* Paginación */}
      {displayTotalRows > rowsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalRows={displayTotalRows}
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

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setSelectedMaterial(null);
        }}
        onSave={handleSaveTransfer}
        material={selectedMaterial}
      />
    </div>
  );
};

export default MaterialsCatalog;

