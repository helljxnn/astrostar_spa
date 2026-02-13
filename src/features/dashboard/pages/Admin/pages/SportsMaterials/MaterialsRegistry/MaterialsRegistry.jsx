import { useState, useEffect } from 'react';
import { FaPlus, FaFilter, FaTimes } from 'react-icons/fa';
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
import materialsService from '../Materials/services/MaterialsService';
import { formatDate, formatDateTime } from '../shared/utils/stockCalculations';

const MaterialsRegistry = () => {
  const { hasPermission } = usePermissions();
  const [movements, setMovements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [filters, setFilters] = useState({
    materialId: '',
    tipo: '',
    dateFrom: '',
    dateTo: ''
  });
  const rowsPerPage = 10;

  useEffect(() => {
    fetchMovements();
  }, [currentPage, searchTerm, filters]);

  useEffect(() => {
    fetchMaterialsForFilter();
  }, []);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const response = await movementsService.getMovements({
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm,
        materialId: filters.materialId,
        tipo: filters.tipo,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
      });
      
      if (response.success) {
        setMovements(response.data || []);
        setTotalRows(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
      // No mostrar alerta, solo establecer datos vacíos
      setMovements([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterialsForFilter = async () => {
    try {
      const response = await materialsService.getMaterials({ limit: 1000 });
      if (response.success && response.data) {
        setMaterials(response.data);
      }
    } catch (error) {
      console.error('Error al cargar materiales para filtro:', error);
      // No bloquear la UI, solo establecer array vacío
      setMaterials([]);
    }
  };

  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;

  const handleRegister = () => {
    if (!hasPermission('materialsRegistry', 'Crear')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para registrar movimientos');
      return;
    }
    setIsModalOpen(true);
  };

  const handleSave = async (movementData) => {
    if (!hasPermission('materialsRegistry', 'Crear')) {
      showErrorAlert('Sin permisos', 'No tienes permisos para registrar movimientos');
      return false;
    }

    try {
      const response = await movementsService.createMovement(movementData);
      
      if (response.success) {
        showSuccessAlert(
          "Movimiento Registrado", 
          `El movimiento de ${movementData.tipo_movimiento.toLowerCase()} fue registrado correctamente y el stock se actualizó.`
        );
        setIsModalOpen(false);
        fetchMovements();
        return true;
      } else {
        showErrorAlert(
          "Error",
          response.message || "No se pudo registrar el movimiento"
        );
        return false;
      }
    } catch (error) {
      console.error('Error al registrar movimiento:', error);
      showErrorAlert("Error", error.message || "Error al registrar el movimiento en el servidor");
      return false;
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

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      materialId: '',
      tipo: '',
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = filters.materialId || filters.tipo || filters.dateFrom || filters.dateTo;

  // Preparar datos para tabla
  const tableData = movements.map(m => ({
    ...m,
    fechaFormatted: formatDate(m.fecha),
    tipoMovimientoBadge: m.tipoMovimiento === 'Entrada' 
      ? <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Entrada</span>
      : <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Baja</span>,
    cantidadFormatted: `${m.cantidad} unidades`,
  }));

  // Datos para reporte
  const reportData = movements.map(m => ({
    fecha: formatDateTime(m.fecha),
    material: m.materialNombre,
    categoria: m.categoria,
    tipo: m.tipoMovimiento,
    cantidad: m.cantidad,
    origen: m.origen,
    stockAnterior: m.stockAnterior,
    stockNuevo: m.stockNuevo,
    observaciones: m.observaciones || 'N/A',
  }));

  const materialOptions = materials.map(m => ({ value: m.id, label: m.nombre }));
  const tipoOptions = [
    { value: 'Entrada', label: 'Entrada' },
    { value: 'Baja', label: 'Baja' },
  ];

  return (
    <div className="p-6 font-questrial">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Ingresos de Materiales</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar movimiento"
          />

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow transition-colors ${
                hasActiveFilters 
                  ? 'bg-primary-purple text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FaFilter /> Filtros
            </button>

            <PermissionGuard module="materialsRegistry" action="Ver">
              <ReportButton
                data={reportData}
                fileName="Reporte_Movimientos"
                columns={[
                  { header: "Fecha", accessor: "fecha" },
                  { header: "Material", accessor: "material" },
                  { header: "Categoría", accessor: "categoria" },
                  { header: "Tipo", accessor: "tipo" },
                  { header: "Cantidad", accessor: "cantidad" },
                  { header: "Origen", accessor: "origen" },
                  { header: "Stock Anterior", accessor: "stockAnterior" },
                  { header: "Stock Nuevo", accessor: "stockNuevo" },
                  { header: "Observaciones", accessor: "observaciones" },
                ]}
              />
            </PermissionGuard>

            <PermissionGuard module="materialsRegistry" action="Crear">
              <button
                onClick={handleRegister}
                className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
              >
                <FaPlus /> Registrar
              </button>
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* Panel de Filtros */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filtro por Material */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material
              </label>
              <select
                value={filters.materialId}
                onChange={(e) => handleFilterChange('materialId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              >
                <option value="">Todos los materiales</option>
                {materialOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={filters.tipo}
                onChange={(e) => handleFilterChange('tipo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              >
                <option value="">Todos los tipos</option>
                {tipoOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Fecha Desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desde
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              />
            </div>

            {/* Filtro por Fecha Hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasta
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              />
            </div>
          </div>

          {/* Botón Limpiar Filtros */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FaTimes /> Limpiar Filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tabla */}
      <Table
        thead={{
          titles: ["Fecha", "Material", "Categoría", "Tipo", "Cantidad", "Origen"],
          state: false,
          actions: true,
        }}
        tbody={{
          data: tableData,
          dataPropertys: ["fechaFormatted", "materialNombre", "categoria", "tipoMovimientoBadge", "cantidadFormatted", "origen"],
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
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
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

export default MaterialsRegistry;
