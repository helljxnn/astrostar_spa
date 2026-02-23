import { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import MovementModal from "./components/MovementModal";
import MovementViewModal from "./components/MovementViewModal";
import Table from "../../../../../../../shared/components/Table/table";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import Pagination from "../../../../../../../shared/components/Table/Pagination";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";
import { showSuccessAlert, showErrorAlert } from '../../../../../../../shared/utils/alerts';
import movementsService from './services/MovementsService';
import { formatDate, formatDateTime } from '../shared/utils/stockCalculations';
import { formatStock } from '../../../../../../../shared/utils/numberFormat';
import { getTipoBajaLabel } from '../shared/utils/tipoBajaLabels';

const MaterialsMovements = () => {
  const { hasPermission } = usePermissions();
  
  // Estado para pestañas
  const [activeTab, setActiveTab] = useState('ingresos'); // 'ingresos' | 'bajas'
  
  const [movements, setMovements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);

  const rowsPerPage = 10;

  useEffect(() => {
    fetchMovements();
  }, [currentPage, searchTerm, activeTab]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm,
        tipo: activeTab === 'ingresos' ? 'entrada' : 'salida',
      };
      
      const response = await movementsService.getMovements(params);
      
      if (response.success) {
        const data = response.data || [];
        
        setMovements(data);
        
        // Intentar obtener el total de diferentes formas
        const total = response.pagination?.total || 
                     response.total || 
                     response.count || 
                     data.length;
        
        setTotalRows(total);
      }
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
      setMovements([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;

  const handleRegister = () => {
    if (!hasPermission('materialsRegistry', 'Crear')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para registrar movimientos');
      return;
    }
    setIsEditing(false);
    setSelectedMovement(null);
    setIsModalOpen(true);
  };

  const handleEdit = (movement) => {
    if (!hasPermission('materialsRegistry', 'Editar')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para editar movimientos');
      return;
    }
    setIsEditing(true);
    setSelectedMovement(movement);
    setIsModalOpen(true);
  };

  const handleSave = async (movementData) => {
    if (isEditing) {
      if (!hasPermission('materialsRegistry', 'Editar')) {
        showErrorAlert('Sin permisos', 'No tienes permisos para editar movimientos');
        return false;
      }

      try {
        const response = await movementsService.updateMovement(selectedMovement.id, movementData);
        
        if (response.success) {
          showSuccessAlert(
            "Ingreso Actualizado", 
            "Los cambios fueron guardados correctamente"
          );
          setIsModalOpen(false);
          setIsEditing(false);
          setSelectedMovement(null);
          fetchMovements();
          return true;
        } else {
          showErrorAlert("Error", response.message || "No se pudo actualizar el ingreso");
          return false;
        }
      } catch (error) {
        console.error('Error al actualizar ingreso:', error);
        showErrorAlert("Error", error.message || "No se pudo actualizar el ingreso");
        return false;
      }
    } else {
      if (!hasPermission('materialsRegistry', 'Crear')) {
        showErrorAlert('Sin permisos', 'No tienes permisos para registrar movimientos');
        return false;
      }

      try {
        const response = await movementsService.createMovement(movementData);
        
        if (response.success) {
          showSuccessAlert(
            "Ingreso Registrado", 
            "El ingreso de material fue registrado correctamente"
          );
          setIsModalOpen(false);
          fetchMovements();
          return true;
        } else {
          showErrorAlert("Error", response.message || "No se pudo registrar el ingreso");
          return false;
        }
      } catch (error) {
        console.error('Error al registrar ingreso:', error);
        showErrorAlert("Error", error.message || "No se pudo registrar el ingreso");
        return false;
      }
    }
  };

  const handleView = (movement) => {
    if (!hasPermission('materialsRegistry', 'Ver')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para ver detalles de movimientos');
      return;
    }
    setSelectedMovement(movement);
    setIsViewModalOpen(true);
  };

  // Preparar datos para tabla de INGRESOS con truncado
  const ingresosTableData = movements.map(m => ({
    ...m,
    fechaFormatted: formatDate(m.fechaIngreso || m.fecha),
    materialNombreTruncated: m.materialNombre && m.materialNombre.length > 50 
      ? m.materialNombre.substring(0, 50) + '...' 
      : m.materialNombre || '',
    cantidadFormatted: formatStock(m.cantidad),
    proveedorDisplay: m.proveedor || 'Sin proveedor',
  }));

  // Preparar datos para tabla de BAJAS con truncado
  const bajasTableData = movements.map(m => {
    const descripcion = m.descripcion || m.observaciones || '';
    return {
      ...m,
      fechaFormatted: formatDate(m.fechaIngreso || m.fecha),
      materialNombreTruncated: m.materialNombre && m.materialNombre.length > 50 
        ? m.materialNombre.substring(0, 50) + '...' 
        : m.materialNombre || '',
      cantidadFormatted: formatStock(m.cantidad),
      tipoBajaDisplay: getTipoBajaLabel(m.tipo_baja || m.tipoBaja),
      descripcionTruncated: descripcion 
        ? (descripcion.length > 40 ? descripcion.substring(0, 40) + '...' : descripcion)
        : 'Sin descripción',
    };
  });

  // Datos para reporte
  const reportData = movements.map(m => ({
    fecha: formatDateTime(m.fechaIngreso || m.fecha),
    material: m.materialNombre,
    categoria: m.categoria,
    cantidad: m.cantidad,
    ...(activeTab === 'ingresos' 
      ? { proveedor: m.proveedor || 'Sin proveedor' }
      : { 
          tipoBaja: getTipoBajaLabel(m.tipo_baja || m.tipoBaja),
          descripcion: m.descripcion || m.observaciones || 'N/A'
        }
    ),
    stockAnterior: m.stockAnterior,
    stockNuevo: m.stockNuevo,
  }));

  return (
    <div className="p-6 font-questrial">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Movimientos de Materiales</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={`Buscar por fecha, material, categoría${activeTab === 'ingresos' ? ', proveedor' : ', tipo de baja, descripción'}...`}
          />

          <div className="flex items-center gap-3">
            <PermissionGuard module="materialsRegistry" action="Ver">
              <ReportButton
                data={reportData}
                fileName={`Reporte_${activeTab === 'ingresos' ? 'Ingresos' : 'Bajas'}_Materiales`}
                columns={
                  activeTab === 'ingresos'
                    ? [
                        { header: "Fecha", accessor: "fecha" },
                        { header: "Material", accessor: "material" },
                        { header: "Categoría", accessor: "categoria" },
                        { header: "Cantidad", accessor: "cantidad" },
                        { header: "Proveedor", accessor: "proveedor" },
                        { header: "Stock Anterior", accessor: "stockAnterior" },
                        { header: "Stock Nuevo", accessor: "stockNuevo" },
                      ]
                    : [
                        { header: "Fecha", accessor: "fecha" },
                        { header: "Material", accessor: "material" },
                        { header: "Categoría", accessor: "categoria" },
                        { header: "Cantidad", accessor: "cantidad" },
                        { header: "Tipo de Baja", accessor: "tipoBaja" },
                        { header: "Descripción", accessor: "descripcion" },
                        { header: "Stock Anterior", accessor: "stockAnterior" },
                        { header: "Stock Nuevo", accessor: "stockNuevo" },
                      ]
                }
              />
            </PermissionGuard>

            {activeTab === 'ingresos' && (
              <PermissionGuard module="materialsRegistry" action="Crear">
                <button
                  onClick={handleRegister}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
                >
                  <FaPlus /> Registrar Ingreso
                </button>
              </PermissionGuard>
            )}
          </div>
        </div>
      </div>

      {/* Pestañas */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab('ingresos');
            setCurrentPage(1);
            setSearchTerm('');
          }}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'ingresos'
              ? 'text-primary-blue border-b-2 border-primary-blue'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Ingresos
        </button>
        <button
          onClick={() => {
            setActiveTab('bajas');
            setCurrentPage(1);
            setSearchTerm('');
          }}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'bajas'
              ? 'text-primary-blue border-b-2 border-primary-blue'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Bajas
        </button>
      </div>

      {/* Tabla de INGRESOS */}
      {activeTab === 'ingresos' && (
        <Table
          thead={{
            titles: ["Fecha", "Material", "Categoría", "Cantidad", "Proveedor"],
            state: false,
            actions: true,
          }}
          tbody={{
            data: ingresosTableData,
            dataPropertys: ["fechaFormatted", "materialNombreTruncated", "categoria", "cantidadFormatted", "proveedorDisplay"],
            state: false,
          }}
          onView={hasPermission('materialsRegistry', 'Ver') ? handleView : null}
          onEdit={hasPermission('materialsRegistry', 'Editar') ? handleEdit : null}
          buttonConfig={{
            view: () => ({
              show: hasPermission('materialsRegistry', 'Ver'),
              disabled: false,
              title: "Ver detalles",
            }),
            edit: () => ({
              show: hasPermission('materialsRegistry', 'Editar'),
              disabled: false,
              title: "Editar ingreso",
            }),
            delete: () => ({
              show: false,
            }),
          }}
        />
      )}

      {/* Tabla de BAJAS */}
      {activeTab === 'bajas' && (
        <Table
          thead={{
            titles: ["Fecha", "Material", "Categoría", "Cantidad", "Tipo de Baja", "Descripción"],
            state: false,
            actions: true,
          }}
          tbody={{
            data: bajasTableData,
            dataPropertys: ["fechaFormatted", "materialNombreTruncated", "categoria", "cantidadFormatted", "tipoBajaDisplay", "descripcionTruncated"],
            state: false,
          }}
          onView={hasPermission('materialsRegistry', 'Ver') ? handleView : null}
          buttonConfig={{
            view: () => ({
              show: hasPermission('materialsRegistry', 'Ver'),
              disabled: false,
              title: "Ver detalles",
            }),
            edit: () => ({
              show: false,
            }),
            delete: () => ({
              show: false,
            }),
          }}
        />
      )}

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
      <MovementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditing(false);
          setSelectedMovement(null);
        }}
        onSave={handleSave}
        movement={isEditing ? selectedMovement : null}
        isEditing={isEditing}
      />

      <MovementViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedMovement(null);
        }}
        movement={selectedMovement}
      />
    </div>
  );
};

export default MaterialsMovements;
