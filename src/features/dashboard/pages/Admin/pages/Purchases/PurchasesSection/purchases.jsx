import { useState, useEffect } from 'react';
import { FaPlus, FaDownload } from 'react-icons/fa';
import PurchaseModal from "./components/PurchaseModal";
import PurchaseViewModal from "./components/PurchaseViewModal";
import Table from "../../../../../../../shared/components/Table/table";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import Pagination from "../../../../../../../shared/components/Table/Pagination";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import { showSuccessAlert, showErrorAlert } from '../../../../../../../shared/utils/alerts';
import purchasesService from './services/PurchasesService';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const rowsPerPage = 10;

  // Cargar compras al montar y cuando cambien los filtros
  useEffect(() => {
    fetchPurchases();
  }, [currentPage, searchTerm]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await purchasesService.getPurchases({
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm
      });
      
      if (response.success) {
        setPurchases(response.data || []);
        setTotalRows(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error al cargar compras:', error);
      showErrorAlert('Error', 'No se pudieron cargar las compras');
      setPurchases([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  // Paginación
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  // Handlers
  const handleCreate = () => {
    setEditingPurchase(null);
    setIsModalOpen(true);
  };

  const handleEdit = (purchase) => {
    setEditingPurchase(purchase);
    setIsModalOpen(true);
  };

  const handleSave = async (purchaseData, facturaFile, isEditMode) => {
    try {
      let response;
      
      if (isEditMode) {
        response = await purchasesService.updatePurchase(purchaseData.id, purchaseData, facturaFile);
        if (response.success) {
          showSuccessAlert("Compra Actualizada", "La compra se ha actualizado exitosamente");
        }
      } else {
        response = await purchasesService.createPurchase(purchaseData, facturaFile);
        if (response.success) {
          showSuccessAlert("Compra Registrada", "La compra se ha registrado exitosamente");
        }
      }
      
      if (response.success) {
        setIsModalOpen(false);
        setEditingPurchase(null);
        fetchPurchases();
        return true;
      }
    } catch (error) {
      console.error('Error al guardar compra:', error);
      showErrorAlert("Error", error.message || "No se pudo guardar la compra");
      return false;
    }
  };

  const handleView = (purchase) => {
    setSelectedPurchase(purchase);
    setIsViewModalOpen(true);
  };

  const handleDownloadInvoice = async (purchase) => {
    if (!purchase.facturaUrl) {
      showErrorAlert("Error", "No hay factura disponible");
      return;
    }
    try {
      await purchasesService.downloadInvoice(purchase.id);
    } catch (error) {
      console.error('Error al descargar factura:', error);
      showErrorAlert("Error", "No se pudo descargar la factura");
    }
  };

  // Preparar datos para tabla
  const tableData = purchases.map(p => ({
    ...p,
    fechaCompraFormatted: formatDate(p.fechaCompra),
    montoTotalFormatted: formatCurrency(p.montoTotal),
  }));

  // Datos para reporte
  const reportData = purchases.map(p => ({
    fecha: formatDate(p.fechaCompra),
    proveedor: p.proveedor,
    concepto: p.concepto,
    monto: formatCurrency(p.montoTotal),
    metodoPago: p.metodoPago,
    observaciones: p.observaciones || 'N/A',
  }));

  return (
    <div className="p-6 font-questrial">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Compras</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar compra..."
          />

          <div className="flex items-center gap-3">
            <ReportButton
              data={reportData}
              fileName="Reporte_Compras"
              columns={[
                { header: "Fecha", accessor: "fecha" },
                { header: "Proveedor", accessor: "proveedor" },
                { header: "Concepto", accessor: "concepto" },
                { header: "Monto", accessor: "monto" },
                { header: "Método de Pago", accessor: "metodoPago" },
                { header: "Observaciones", accessor: "observaciones" },
              ]}
            />

            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
            >
              <FaPlus /> Crear
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">Cargando compras...</p>
        </div>
      )}

      {/* Tabla */}
      {!loading && (
        <>
          <Table
            thead={{
              titles: ["Fecha", "Proveedor", "Concepto", "Monto", "Método de Pago"],
              state: false,
              actions: true,
            }}
            tbody={{
              data: tableData,
              dataPropertys: ["fechaCompraFormatted", "proveedor", "concepto", "montoTotalFormatted", "metodoPago"],
              state: false,
            }}
            onView={handleView}
            onEdit={handleEdit}
            customActions={[
              {
                onClick: handleDownloadInvoice,
                className: "p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors",
                label: <FaDownload />,
                title: "Descargar factura",
                show: () => true
              }
            ]}
            buttonConfig={{
              view: () => ({
                show: true,
                disabled: false,
                title: "Ver detalles",
              }),
              edit: () => ({
                show: true,
                disabled: false,
                title: "Editar compra",
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
        </>
      )}

      {/* Modales */}
      <PurchaseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPurchase(null);
        }}
        onSave={handleSave}
        purchase={editingPurchase}
      />

      <PurchaseViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        purchase={selectedPurchase}
      />
    </div>
  );
};

export default Purchases;
